use crate::gamestructs::{GameItem, GameQueryResult};

#[tauri::command]
pub async fn bgg_games_query(query: &str) -> Result<Vec<GameQueryResult>, ()> {
    Ok(GameQueryResult::from_bbg(query, false)
        .await
        .expect("Could not get games"))
}

#[tauri::command]
pub async fn bgg_game_from_id(id: &str) -> Result<GameItem,String> {
    GameItem::get_from_bbg(id).await
}
