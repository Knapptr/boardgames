mod commands;
mod db;
mod gamestructs;
mod migrations;
mod playerstructs;
use std::sync::Mutex;

use db::migrations;
use directories;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use migrations::migrate;
use rusqlite::Connection;

pub struct DbPoolWrapper {
    pub db: Connection,
}
use tauri::{menu::MenuBuilder, Manager};
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // create db file
            // Use tha app local data dir- which on linux is ~/.local/share/com.boardgames.app/
            let data_path = app.path().app_local_data_dir().unwrap();
            let mut db = Connection::open(data_path.join("boardgames.db"))?;
            // perform migrations
            migrate(&mut db)?;
            // pass db connecton to app state
            app.manage(Mutex::new(DbPoolWrapper { db }));
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::bgg_games_query,
            commands::bgg_game_from_id,
            commands::create_player,
            commands::get_players,
            commands::delete_player
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
