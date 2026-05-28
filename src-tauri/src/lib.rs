use std::{
    io::{BufRead, BufReader},
    process::{Command, Stdio},
    thread,
};
use tauri::Emitter;
// Add this for Windows-specific process creation flags
#[cfg(not(debug_assertions))]
use std::os::windows::process::CommandExt;

mod gemini;

// Define the Windows-specific creation flag
#[cfg(not(debug_assertions))]
const CREATE_NO_WINDOW: u32 = 0x08000000;


#[tauri::command]
fn check_ffmpeg() -> bool {
    let mut command = Command::new("ffmpeg");
    command.arg("-version");
    // Hide the console window on Windows
    #[cfg(not(debug_assertions))]
    command.creation_flags(CREATE_NO_WINDOW);
    command.output().is_ok()
}

fn time_to_seconds(time_str: &str) -> f64 {
    let parts: Vec<&str> = time_str.split(':').collect();
    if parts.len() == 3 {
        let hours = parts[0].parse::<f64>().unwrap_or(0.0);
        let minutes = parts[1].parse::<f64>().unwrap_or(0.0);
        let seconds = parts[2].parse::<f64>().unwrap_or(0.0);
        hours * 3600.0 + minutes * 60.0 + seconds
    } else {
        0.0
    }
}

#[tauri::command]
async fn execute_ffmpeg_command(mut command: String, app: tauri::AppHandle) {
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

        let mut ffprobe_command = Command::new("ffprobe");
        ffprobe_command.args([
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            input_file,
        ]);
        // Hide the console window on Windows
        #[cfg(not(debug_assertions))]
        ffprobe_command.creation_flags(CREATE_NO_WINDOW);
        let ffprobe_output = ffprobe_command.output();

        let duration_str = match ffprobe_output {
            Ok(output) => String::from_utf8(output.stdout).unwrap_or_default(),
            Err(e) => {
                app_handle
                    .emit_to("main", "ffmpeg-error", &e.to_string())
                    .unwrap();
                return;
            }
        };

        let total_duration = duration_str.trim().parse::<f64>().unwrap_or(0.0);
        
        let mut cmd = Command::new("ffmpeg");
        cmd.args(shlex::split(&command).unwrap_or_default().iter().skip(1))
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());
        
        // Hide the console window on Windows
        #[cfg(not(debug_assertions))]
        cmd.creation_flags(CREATE_NO_WINDOW);

        let mut spawned_cmd = cmd.spawn().expect("Failed to spawn ffmpeg command");

        let stderr = spawned_cmd.stderr.take().expect("Failed to capture stderr");
        let reader = BufReader::new(stderr);

        let time_re = regex::Regex::new(r"time=(\d{2}:\d{2}:\d{2}\.\d{2})").unwrap();

        for line in reader.lines() {
            if let Ok(line_str) = line {
                if total_duration > 0.0 {
                    if let Some(caps) = time_re.captures(&line_str) {
                        let time_val = &caps[1];
                        let current_seconds = time_to_seconds(time_val);
                        let progress = (current_seconds / total_duration * 100.0).min(100.0);
                        app_handle
                            .emit_to("main", "ffmpeg-progress", progress)
                            .unwrap();
                    }
                }
            }
        }

        let status = spawned_cmd.wait().expect("Failed to wait for ffmpeg command");

        if status.success() {
            app_handle.emit_to("main", "ffmpeg-success", ()).unwrap();
        } else {
            app_handle
                .emit_to("main", "ffmpeg-error", "FFmpeg command failed.")
                .unwrap();
        }
    });
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
        .invoke_handler(tauri::generate_handler![
            check_ffmpeg,
            generate_command,
            execute_ffmpeg_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
