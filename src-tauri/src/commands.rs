use std::sync::Mutex;

use tauri::State;

use crate::{
    gamestructs::{GameItem, GameQueryResult},
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
pub async fn create_player(
    state: State<'_, Mutex<DbPoolWrapper>>,
    name: &str,
) -> Result<Player, ()> {
    let mut connection = state.lock().expect("Error with state mutex");
    let player = Player::create(name, &mut connection);
    player
}

#[tauri::command]
pub async fn get_players(state: State<'_, Mutex<DbPoolWrapper>>) -> Result<Vec<Player>, ()> {
    let mut connection = state.lock().expect("Error with state mutex");
    Player::get_all_from_db(&mut connection)
}
