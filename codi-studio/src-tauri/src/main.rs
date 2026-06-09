#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

struct ApiState {
    client: reqwest::Client,
    base_url: Mutex<String>,
}

#[derive(Serialize, Deserialize)]
struct ChatRequest {
    model: String,
    messages: Vec<Message>,
    temperature: Option<f32>,
    max_tokens: Option<u32>,
    stream: Option<bool>,
}

#[derive(Serialize, Deserialize)]
struct Message {
    role: String,
    content: Vec<ContentPart>,
}

#[derive(Serialize, Deserialize)]
#[serde(untagged)]
enum ContentPart {
    Text { r#type: String, text: String },
    Image {
        r#type: String,
        image_url: ImageUrl,
    },
}

#[derive(Serialize, Deserialize)]
struct ImageUrl {
    url: String,
}

#[derive(Serialize, Deserialize)]
struct ChatResponse {
    id: String,
    object: String,
    created: i64,
    model: String,
    choices: Vec<Choice>,
}

#[derive(Serialize, Deserialize)]
struct Choice {
    index: u32,
    message: MessageResponse,
    finish_reason: String,
}

#[derive(Serialize, Deserialize)]
struct MessageResponse {
    role: String,
    content: String,
}

#[derive(Serialize, Deserialize)]
struct R2Config {
    enabled: bool,
    account_id: String,
    access_key_id: String,
    secret_access_key: String,
    bucket: String,
    model_path: String,
}

#[tauri::command]
async fn chat_completion(
    state: State<'_, ApiState>,
    messages: Vec<Message>,
    temperature: Option<f32>,
    max_tokens: Option<u32>,
) -> Result<String, String> {
    let url = {
        let base_url = state.base_url.lock().map_err(|e| e.to_string())?;
        format!("{}/v1/chat/completions", base_url.clone())
    };

    let request = ChatRequest {
        model: "codi-llava".to_string(),
        messages,
        temperature,
        max_tokens,
        stream: Some(false),
    };

    let response = state
        .client
        .post(&url)
        .json(&request)
        .send()
        .await
        .map_err(|e| format!("API request failed: {}", e))?;

    let chat_resp: ChatResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(chat_resp.choices[0].message.content.clone())
}

#[tauri::command]
async fn set_api_url(state: State<'_, ApiState>, url: String) -> Result<(), String> {
    let mut base_url = state.base_url.lock().map_err(|e| e.to_string())?;
    *base_url = url;
    Ok(())
}

#[tauri::command]
async fn set_r2_config(config: R2Config) -> Result<(), String> {
    let core_config_dir = std::path::Path::new("../codi-core/config");
    let config_path = core_config_dir.join("r2_config.yaml");

    std::fs::create_dir_all(core_config_dir).map_err(|e| e.to_string())?;

    let yaml = format!(
        "r2:\n  enabled: {}\n  account_id: \"{}\"\n  access_key_id: \"{}\"\n  secret_access_key: \"{}\"\n  bucket: \"{}\"\n  model_path: \"{}\"\n  endpoint: \"https://{}.r2.cloudflarestorage.com\"\n  mount_point: \"models/r2_mount\"\n",
        config.enabled,
        config.account_id,
        config.access_key_id,
        config.secret_access_key,
        config.bucket,
        config.model_path,
        config.account_id
    );

    std::fs::write(&config_path, yaml).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn write_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(&path, &content).map_err(|e| e.to_string())
}

#[tauri::command]
async fn list_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let entries = std::fs::read_dir(&path).map_err(|e| e.to_string())?;
    let mut files = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        files.push(FileEntry {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
            is_dir: metadata.is_dir(),
            size: metadata.len(),
        });
    }
    files.sort_by(|a, b| b.is_dir.cmp(&a.is_dir).then(a.name.cmp(&b.name)));
    Ok(files)
}

#[derive(Serialize)]
struct FileEntry {
    name: String,
    path: String,
    is_dir: bool,
    size: u64,
}

fn main() {
    let api_state = ApiState {
        client: reqwest::Client::new(),
        base_url: Mutex::new("http://localhost:11435".to_string()),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_notification::init())
        .manage(api_state)
        .invoke_handler(tauri::generate_handler![
            chat_completion,
            set_api_url,
            set_r2_config,
            read_file,
            write_file,
            list_directory,
        ])
        .run(tauri::generate_context!())
        .expect("error while running CODI Studio");
}
