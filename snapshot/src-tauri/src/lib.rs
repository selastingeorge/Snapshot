use tauri_plugin_sql::{Migration, MigrationKind};
use std::process::Command;
use std::fs;
use std::path::Path;

#[tauri::command]
fn launch_chrome(pairs: Vec<(String, String)>) -> Result<String, String> {
    if pairs.is_empty() {
        return Err("No name-URL pairs provided".into());
    }

    for (name, url) in pairs {
        let result = Command::new("google-chrome")
            .arg("--ozone-platform=wayland")
            .arg(format!("--window-name={}", name))
            .arg("--new-window")
            .arg(url.clone())
            .spawn();
        
        if let Err(e) = result {
            return Err(format!("Failed to launch Chrome window with name '{}': {}", name, e));
        }
    }

    Ok("Chrome launched successfully with provided name-URL pairs.".into())
}



#[tauri::command]
fn delete_screenshots(directory: String) -> Result<String, String> {
    let path = Path::new(&directory);
    if !path.exists() {
        return Err(format!("The directory '{}' does not exist.", directory));
    }
    if !path.is_dir() {
        return Err(format!("The path '{}' is not a directory.", directory));
    }

    match fs::read_dir(path) {
        Ok(entries) => {
            for entry in entries {
                if let Ok(entry) = entry {
                    let entry_path = entry.path();
                    if entry_path.is_dir() {
                        if let Err(e) = fs::remove_dir_all(&entry_path) {
                            return Err(format!("Failed to remove directory '{}': {}", entry_path.display(), e));
                        }
                    } else {
                        if let Err(e) = fs::remove_file(&entry_path) {
                            return Err(format!("Failed to remove file '{}': {}", entry_path.display(), e));
                        }
                    }
                }
            }
            Ok(format!("Successfully cleared the directory '{}'.", directory))
        }
        Err(e) => Err(format!("Failed to read directory '{}': {}", directory, e)),
    }
}

pub fn init_database() -> Vec<Migration> {
    vec![Migration {
        version: 2,
        description: "create_initial_tables",
        sql: "
            CREATE TABLE IF NOT EXISTS bookmarks (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,bookmarks TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY AUTOINCREMENT,key TEXT NOT NULL,value TEXT NOT NULL);
            INSERT INTO settings (key, value) VALUES ('SCREENSHOT_DIR', '/home/'),('DURATION', '30000'),('INTERVAL', '500');
        ",
        kind: MigrationKind::Up,
    }]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:database.db", init_database())
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            launch_chrome,
            delete_screenshots
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
