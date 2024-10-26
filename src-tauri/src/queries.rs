pub async fn get_game_data(id: &str) -> reqwest::Result<String> {
    Ok(
        reqwest::get(format!("https://boardgamegeek.com/xmlapi2/thing?id={}", id))
            .await?
            .text()
            .await?,
    )
}


