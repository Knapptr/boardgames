mod db;
mod gamestructs;
mod migrations;
mod queries;
mod commands;
use db::migrations;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use migrations::migrate;
use rusqlite::Connection;
use tauri::{menu::MenuBuilder, Manager};
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:test.db", vec![migrations()])
                .build(),
        )
        .setup(|app| {
            // create db file
            // Use tha app local data dir- which on linux is ~/.local/share/com.boardgames.app/
            let data_path = app.path().app_local_data_dir().unwrap();
            let mut db = Connection::open(format!("{}/database.db", data_path.display()))?;
            // perform migrations
            migrate(&mut db)?;
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![commands::bgg_games_query,commands::bgg_game_from_id])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
