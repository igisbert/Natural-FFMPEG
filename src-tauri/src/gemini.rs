use reqwest::{header, Client};
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<Content>,
}

#[derive(Serialize)]
struct Content {
    parts: Vec<Part>,
}

#[derive(Serialize)]
struct Part {
    text: String,
}

#[derive(Deserialize)]
struct GeminiResponse {
    candidates: Vec<Candidate>,
}

#[derive(Deserialize)]
struct Candidate {
    content: ContentResponse,
}

#[derive(Deserialize)]
struct ContentResponse {
    parts: Vec<PartResponse>,
}

#[derive(Deserialize)]
struct PartResponse {
    text: String,
}

fn clean_gemini_response(response: &str) -> String {
    let mut cleaned_response = response.trim();
    if cleaned_response.starts_with("```") && cleaned_response.ends_with("```") {
        cleaned_response = &cleaned_response[3..cleaned_response.len() - 3];
    }
    cleaned_response.trim().to_string()
}

pub async fn generate_ffmpeg_command(
    prompt: String,
    api_key: String,
    input_paths: Vec<String>,
    output_folder: String,
    model: String,
    duration: Option<f64>,
) -> Result<String, String> {
    let mut headers = header::HeaderMap::new();
    headers.insert(
        header::USER_AGENT,
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
            .parse()
            .unwrap(),
    );

    let client = Client::builder()
        .default_headers(headers)
        .build()
        .map_err(|e| e.to_string())?;

    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
        model, api_key
    );

    let input_files_list = input_paths
        .iter()
        .enumerate()
        .map(|(i, path)| format!("{}. `{}`", i + 1, path))
        .collect::<Vec<String>>()
        .join("\n");

    let duration_rule = if let Some(d) = duration {
        format!("\n9.  **Video Duration**: The total duration of the first input video is {:.2} seconds. Use this if relevant (e.g., for trimming calculations).", d)
    } else {
        "".to_string()
    };

    let system_prompt = format!(
        r#"You are an ffmpeg expert. Your task is to generate a single, valid ffmpeg command based on the user's request.

# RULES:
1.  **Output Format**: The output MUST be ONLY the raw ffmpeg command. No explanations, no markdown (` ``` `), no extra text.
2.  **Input Files**: You have the following absolute paths for input files. The user might refer to them by their number (e.g., "file 1", "video 2"):
{}
3.  **Output Location**: The output file MUST be saved in the directory located at: `{}`
4.  **Paths**: Use the exact, literal paths provided. Do not use variables like `%USERPROFILE%` or `$HOME`. Quote any paths that contain spaces.
5.  **File Naming**: Decide a sensible and descriptive output file name. **IMPORTANT**: You MUST include the string `[HASH]` before the file extension (e.g., `slow_motion_[HASH].mp4`, `watermarked_[HASH].png`). This placeholder will be replaced by a real unique ID later.
6.  **Flags**: Use only safe, standard ffmpeg options. **ALWAYS include the `-y` flag** right after `ffmpeg` to overwrite output files without asking.
7.  **Command**: The result must be a single-line command, ready to run in Windows cmd.exe.
8.  **Trimming**: Use `-ss` for the start time and `-t` for the new duration. If the duration is provided (see Rule #9), use it for calculations.{}

# EXAMPLES of mapping a user task to a final command:
-   **User Task**: "convert my video to a gif"
    **Command**: ffmpeg -y -i "C:\path\to\video.mp4" -vf "fps=10,scale=480:-1:flags=lanczos" "{}\output_[HASH].gif"
-   **User Task**: "merge file 1 and file 2"
    **Command**: ffmpeg -y -i "C:\path1.mp4" -i "C:\path2.mp4" -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[outv][outa]" -map "[outv]" -map "[outa]" "{}\merged_[HASH].mp4"
-   **User Task**: "put image 2 as a watermark on video 1"
    **Command**: ffmpeg -y -i "C:\video.mp4" -i "C:\logo.png" -filter_complex "overlay=10:10" "{}\watermarked_[HASH].mp4"

# YOUR TASK
Generate the ffmpeg command for the following request:
-   **User Task**: "{}"
"#,
        input_files_list, output_folder, duration_rule, output_folder, output_folder, output_folder, prompt
    );

    let request_body = GeminiRequest {
        contents: vec![Content {
            parts: vec![Part {
                text: system_prompt,
            }],
        }],
    };

    let response = client
        .post(&url)
        .json(&request_body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if response.status().is_success() {
        let gemini_response = response
            .json::<GeminiResponse>()
            .await
            .map_err(|e| e.to_string())?;
        if let Some(candidate) = gemini_response.candidates.get(0) {
            if let Some(part) = candidate.content.parts.get(0) {
                let command = clean_gemini_response(&part.text);
                return Ok(command);
            }
        }
        Err("No content found in Gemini response".to_string())
    } else {
        let error_body = response.text().await.map_err(|e| e.to_string())?;
        Err(format!("Gemini API error: {}", error_body))
    }
}
