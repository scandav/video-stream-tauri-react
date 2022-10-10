#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::Mutex;
use tauri_plugin_sql::{Migration, MigrationKind, TauriSql};

#[derive(Debug)]
pub struct Camera {
    pub streaming: bool,
    pub recording: bool,
}

impl Camera {
    pub fn start(&mut self) {
        self.streaming = true;
        self.recording = true;
    }

    pub fn stop(&mut self) {
        self.streaming = false;
        self.recording = false;
    }

    pub fn get_status(&mut self) -> String {
        format!("{:?}", self)
    }
}
pub struct CameraState(pub Mutex<Camera>);


#[tauri::command]
fn start_camera(state: tauri::State<CameraState>) -> String {
    let mut camera = state.0.lock().unwrap();
    camera.start();
    format!("{:?}", camera)
}

#[tauri::command]
fn stop_camera(state: tauri::State<CameraState>) -> String {
    let mut camera = state.0.lock().unwrap();
    camera.stop();
    format!("{:?}", camera)
}

#[tauri::command]
fn status_camera(state: tauri::State<CameraState>) -> String {
    let mut camera = state.0.lock().unwrap();
    camera.get_status()
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .plugin(TauriSql::default().add_migrations(
            "sqlite:video.db",
            vec![Migration {
              version: 1,
              description: "create videos",
              sql: include_str!("../migrations/1.sql"),
              kind: MigrationKind::Up,
            }],
          ))
        .manage(CameraState(Mutex::new(Camera { streaming: false, recording: false })))
        .invoke_handler(tauri::generate_handler![greet, start_camera, stop_camera, status_camera])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
