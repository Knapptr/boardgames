use std::sync::Mutex;

use tauri::State;

use crate::{
    gamestructs::{GameItem, GameQueryResult, OwnedGame},
    playerstructs::Player,
    DbPoolWrapper,
};

#[tauri::command]
pub async fn bgg_games_query(query: &str) -> Result<Vec<GameQueryResult>, ()> {
    Ok(GameQueryResult::from_bbg(query, false)
        .await
        .expect("Could not get games"))
}

#[tauri::command]
pub async fn bgg_game_from_id(id: &str) -> Result<GameItem, String> {
    GameItem::get_from_bbg(id).await
}
#[tauri::command]
pub async fn save_game_from_bgg(
    state: State<'_, Mutex<DbPoolWrapper>>,
    game: GameItem,
) -> Result<OwnedGame, ()> {
    println!("Trying to save game:\n{game:?}\n---");
    let mut db_connection = state.lock().expect("Error with state mutex");
    let saved_game = game
        .save_to_db(&mut db_connection)
        .expect("Error saving game");
    Ok(saved_game)
}

#[tauri::command]
pub async fn create_player(
    state: State<'_, Mutex<DbPoolWrapper>>,
    name: &str,
) -> Result<Player, ()> {
    let mut connection = state.lock().expect("Error with state mutex");
    let player = Player::create(name, &mut connection);
    player
}

#[tauri::command]
pub async fn delete_player(state: State<'_, Mutex<DbPoolWrapper>>, id: i32) -> Result<(), ()> {
    let mut connection = state.lock().expect("Error with state mutex");
    Player::delete_by_id(&mut connection, id)
}

#[tauri::command]
pub async fn get_players(state: State<'_, Mutex<DbPoolWrapper>>) -> Result<Vec<Player>, ()> {
    let mut connection = state.lock().expect("Error with state mutex");
    Player::get_all_from_db(&mut connection)
}

#[tauri::command]
pub async fn get_games(state: State<'_, Mutex<DbPoolWrapper>>) -> Result<Vec<OwnedGame>, ()> {
    let mut connection = state.lock().expect("Error with state mutex");
    OwnedGame::get_games_from_db(&mut connection)
}
