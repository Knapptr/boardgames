pub async fn get_game_data(id: &str) -> reqwest::Result<String> {
    Ok(
        reqwest::get(format!("https://boardgamegeek.com/xmlapi2/thing?id={}", id))
            .await?
            .text()
            .await?,
    )
}

pub async fn get_list_of_games_by_title(title_query: &str, exact: bool) -> reqwest::Result<String> {
    let url_encoded_query = urlencoding::encode(title_query);
    Ok(reqwest::get(format!(
        "https://boardgamegeek.com/xmlapi2/search?query={}&type=boardgame&exact={}",
        url_encoded_query, exact as u8
    ))
    .await?
    .text()
    .await?)
}
