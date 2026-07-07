use std::{
    io::{Read, BufReader},
    process::{Command, Stdio},
    sync::{Arc, Mutex},
    thread,
    time::{Duration, Instant},
};
use tauri::Emitter;
// Add this for Windows-specific process creation flags
#[cfg(not(debug_assertions))]
use std::os::windows::process::CommandExt;

mod gemini;

// Define the Windows-specific creation flag
#[cfg(not(debug_assertions))]
const CREATE_NO_WINDOW: u32 = 0x08000000;

// Global state to store the running FFmpeg process
struct FfmpegProcessState {
    child: Arc<Mutex<Option<std::process::Child>>>,
}


#[tauri::command]
fn check_ffmpeg() -> bool {
    let mut command = Command::new("ffmpeg");
    command.arg("-version");
    // Hide the console window on Windows
    #[cfg(not(debug_assertions))]
    command.creation_flags(CREATE_NO_WINDOW);
    command.output().is_ok()
}

#[tauri::command]
async fn cancel_ffmpeg_command(
    state: tauri::State<'_, FfmpegProcessState>,
    app: tauri::AppHandle,
) -> Result<(), String> {
    let mut child_lock = state.child.lock().map_err(|e| e.to_string())?;
    
    if let Some(ref mut child) = *child_lock {
        child.kill().map_err(|e| e.to_string())?;
        *child_lock = None;
        app.emit_to("main", "ffmpeg-cancelled", ()).unwrap();
        Ok(())
    } else {
        Err("No FFmpeg process running".to_string())
    }
}

#[tauri::command]
async fn execute_ffmpeg_command(
    mut command: String,
    app: tauri::AppHandle,
    state: tauri::State<'_, FfmpegProcessState>,
) -> Result<(), String> {
    let app_handle = app.clone();

    // Reemplazar [HASH] por un ID único basado en el tiempo
    if command.contains("[HASH]") {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis();
        let hash = format!("{:x}", timestamp); // Convertir a hexadecimal
        command = command.replace("[HASH]", &hash);
    }

    let state_clone = FfmpegProcessState {
        child: state.child.clone(),
    };

    thread::spawn(move || {
        let input_file_re = regex::Regex::new(r#"-i\s+"([^"]+)""#).unwrap();
        // Use the first input file found for duration/progress reference
        let Some(caps) = input_file_re.captures(&command) else {
            app_handle
                .emit_to(
                    "main",
                    "ffmpeg-error",
                    "Could not find any input file in command.",
                )
                .unwrap();
            return;
        };
        let input_file = &caps[1];

        // Get duration with ffprobe
        let mut ffprobe_command = Command::new("ffprobe");
        ffprobe_command.args([
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            input_file,
        ]);
        #[cfg(not(debug_assertions))]
        ffprobe_command.creation_flags(CREATE_NO_WINDOW);
        
        let duration: f64 = ffprobe_command.output()
            .ok()
            .and_then(|o| String::from_utf8(o.stdout).ok())
            .and_then(|s| s.trim().parse().ok())
            .unwrap_or(0.0);

        let mut cmd = Command::new("ffmpeg");
        cmd.args(shlex::split(&command).unwrap_or_default().iter().skip(1))
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());
        
        // Hide the console window on Windows
        #[cfg(not(debug_assertions))]
        cmd.creation_flags(CREATE_NO_WINDOW);

        let mut spawned_cmd = cmd.spawn().expect("Failed to spawn ffmpeg command");

        // Take stderr before storing the child process
        let stderr = spawned_cmd.stderr.take().expect("Failed to capture stderr");

        // Store the child process handle for cancellation
        {
            let mut child_lock = state_clone.child.lock().unwrap();
            *child_lock = Some(spawned_cmd);
        }

        let mut reader = BufReader::new(stderr);
        let mut buffer = String::new();
        let mut last_emit = Instant::now();

        let speed_re = regex::Regex::new(r"speed=\s*(\d+\.?\d*)x").unwrap();
        let elapsed_re = regex::Regex::new(r"elapsed=(\d+:\d{2}:\d{2}\.\d{2})").unwrap();

        loop {
            let mut byte = [0u8; 1];
            match reader.read(&mut byte) {
                Ok(0) => break, // EOF
                Ok(_) => {
                    let ch = byte[0] as char;
                    if ch == '\r' || ch == '\n' {
                        if !buffer.is_empty() {
                            let now = Instant::now();
                            if now.duration_since(last_emit) >= Duration::from_millis(500) {
                                if let Some(caps) = speed_re.captures(&buffer) {
                                    let speed = caps[1].parse::<f64>().unwrap_or(0.0);
                                    let elapsed = elapsed_re
                                        .captures(&buffer)
                                        .map(|c| c[1].to_string())
                                        .unwrap_or_default();
                                    app_handle
                                        .emit_to("main", "ffmpeg-speed", (speed, elapsed, duration))
                                        .unwrap();
                                    last_emit = now;
                                }
                            }
                            buffer.clear();
                        }
                    } else {
                        buffer.push(ch);
                    }
                }
                Err(_) => break,
            }
        }

        // Wait for the process to finish
        let status = {
            let mut child_lock = state_clone.child.lock().unwrap();
            if let Some(ref mut child) = *child_lock {
                child.wait().expect("Failed to wait for ffmpeg command")
            } else {
                // Process was cancelled
                return;
            }
        };

        // Clear the stored child process
        {
            let mut child_lock = state_clone.child.lock().unwrap();
            *child_lock = None;
        }

        if status.success() {
            app_handle.emit_to("main", "ffmpeg-success", ()).unwrap();
        } else {
            app_handle
                .emit_to("main", "ffmpeg-error", "FFmpeg command failed.")
                .unwrap();
        }
    });

    Ok(())
}

#[tauri::command]
async fn generate_command(
    prompt: String,
    api_key: String,
    input_paths: Vec<String>,
    output_folder: String,
    model: String,
) -> Result<String, String> {
    if input_paths.is_empty() {
        return Err("No input files provided.".to_string());
    }

    let video_path = &input_paths[0]; // Use first file for duration info
    let mut ffprobe_command = Command::new("ffprobe");
    ffprobe_command.args([
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        video_path,
    ]);

    // Hide the console window on Windows
    #[cfg(not(debug_assertions))]
    ffprobe_command.creation_flags(CREATE_NO_WINDOW);

    let duration: Option<f64> = match ffprobe_command.output() {
        Ok(output) => {
            if output.status.success() {
                String::from_utf8(output.stdout)
                    .unwrap_or_default()
                    .trim()
                    .parse::<f64>()
                    .ok()
            } else {
                None 
            }
        }
        Err(_) => None,
    };

    gemini::generate_ffmpeg_command(prompt, api_key, input_paths, output_folder, model, duration).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .manage(FfmpegProcessState {
            child: Arc::new(Mutex::new(None)),
        })
        .invoke_handler(tauri::generate_handler![
            check_ffmpeg,
            generate_command,
            execute_ffmpeg_command,
            cancel_ffmpeg_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
