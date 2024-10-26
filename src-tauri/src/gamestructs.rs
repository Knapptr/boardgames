use roxmltree::Document;

#[derive(Debug, Clone, serde::Serialize)]
enum GameType {
    Game,
    Expansion,
}
impl GameType {
    fn from_str(s:&str)->Result<Self,String>{
        match s{
            "boardgame" => Ok(Self::Game),
            "boardgameexpansion" => Ok(Self::Expansion),
            _ => Err("Non applicable gametype".into())
        }
    }
    fn from_bgg_xml(attribute: Option<&str>) -> std::result::Result<Self, String> {
        if let Some(str) = attribute {
            match str {
                "boardgame" => Ok(Self::Game),
                "boardgameexpansion" => Ok(Self::Expansion),
                _ => Err("Non applicable gametype".to_string()),
            }
        } else {
            Err("Invalid Attribute".to_string())
        }
    }
}
#[derive(Debug, serde::Serialize)]
struct GameMechanic(String);
#[derive(Debug, serde::Serialize)]
struct GameCategory(String);

#[derive(Debug, serde::Serialize)]
pub struct GameItem {
    game_type: Option<GameType>,
    name: String,
    published: Option<i32>,
    bgg_id: Option<String>,
    min_players: i32,
    max_players: i32,
    player_poll: String,
    mechanics: Vec<GameMechanic>,
    categories: Vec<GameCategory>,
    artists: Vec<String>,
    designers: Vec<String>,
    description: String,
    image_url: Option<String>
}
impl GameItem {
    pub async fn get_from_bbg(id:&str)->Result<Self,String>{
        let xml_string = Self::get_xml_from_bgg(id).await.expect("Could not get xml from bgg");
        Self::from_bgg_xml(&xml_string)
    }
     async fn get_xml_from_bgg(id:&str)->reqwest::Result<String>{
    Ok(
        reqwest::get(format!("https://boardgamegeek.com/xmlapi2/thing?id={}", id))
            .await?
            .text()
            .await?,
    )

    }
    fn from_bgg_xml(
        xml: &str,
    ) -> Result<Self, String> {
        let parsed = Document::parse(xml).expect("Could not parse XML");
        let mut mechanics = vec![];
        let mut designers = vec![];
        let mut artists = vec![];
        let mut categories = vec![];
        let mut min_players = 0;
        let mut max_players = 0;
        let mut description = String::new();
        let mut name = String::new();
        let mut published = None;
        let mut image_url = None;
        let mut player_poll = "N/A".to_string();
        let id:Option<String> = parsed.root_element().attribute("id").map(|i|i.to_string());
        let game_type:Option<GameType> = parsed.root_element().attribute("type").map(|i| GameType::from_str(i).expect("Error getting gametype"));
        for item_child in parsed.root_element().children() {
            for data in item_child.children() {
                if data.tag_name().name() == "name" {
                    name = data.attribute("value").unwrap().into();
                }
                if data.tag_name().name() == "yearpublished" {
                    published = data.attribute("value").unwrap().parse::<i32>().ok()
                }
                if data.tag_name().name() == "minplayers" {
                    min_players = data.attribute("value").unwrap().parse::<i32>().unwrap();
                }
                if data.tag_name().name() == "maxplayers" {
                    max_players = data.attribute("value").unwrap().parse::<i32>().unwrap();
                }
                if data.tag_name().name() == "image" {
                    image_url = data.text().map(|i|i.to_string())
                }
                if data.tag_name().name() == "description" {
                    description = data.text().unwrap().to_string()
                }
                if data.tag_name().name() == "link" {
                    if let Some(link_type) = data.attribute("type") {
                        if link_type == "boardgamecategory" {
                            let category_name = data.attribute("value").unwrap();
                            categories.push(GameCategory(category_name.to_string()))
                        }
                        if link_type == "boardgamemechanic" {
                            let mechanic_name = data.attribute("value").unwrap();
                            mechanics.push(GameMechanic(mechanic_name.to_string()))
                        }
                        if link_type == "boardgamedesigner" {
                            let designer_name = data.attribute("value").unwrap();
                            designers.push(designer_name.to_string())
                        }
                        if link_type == "boardgameartist" {
                            let artist_name = data.attribute("value").unwrap();
                            artists.push(artist_name.to_string())
                        }
                    }
                }
                if data.tag_name().name() == "poll-summary" {
                    for poll_data in data.children() {
                        if let Some(n) = poll_data.attribute("name") {
                            if n == "bestwith" {
                                if let Some(bw) = poll_data.attribute("value") {
                                    player_poll = bw.to_string()
                                }
                            }
                        }
                    }
                }
            }
        }
        Ok(Self {
            name,
            published,
            bgg_id: id,
            min_players,
            max_players,
            description,
            designers,
            player_poll,
            mechanics,
            categories,
            artists,
            game_type,
            image_url,
        })
    }
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct GameQueryResult {
    game_type: GameType,
    name: String,
    published: Option<i32>,
    bgg_id: Option<String>,
}

impl GameQueryResult {
    pub async fn from_bbg(title_query: &str, exact: bool) -> Result<Vec<Self>, String> {
        let url_encoded_query = urlencoding::encode(title_query);
        let raw_xml_string = reqwest::get(format!(
            "https://boardgamegeek.com/xmlapi2/search?query={}&type=boardgame&exact={}",
            url_encoded_query, exact as u8
        ))
        .await
        .expect("Error Getting XML data from BGG")
        .text()
        .await
        .expect("Error at response.text()");

        let parsed = Document::parse(&raw_xml_string).expect("Error parsing xml");
        let mut games = vec![];
        for child in parsed.root_element().children() {
            if child.is_element() {
                if let Ok(game_type) = GameType::from_bgg_xml(child.attribute("type")) {
                    let mut name = None;
                    let mut published = None;
                    let id = if let Some(id) = child.attribute("id") {
                        Some(id.to_string())
                    } else {
                        None
                    };
                    for data in child.children() {
                        // println!("Inner Node: {data:?}");
                        if data.is_element() {
                            if data.tag_name().name() == "name" {
                                name = data.attribute("value");
                            }
                            if data.tag_name().name() == "yearpublished" {
                                published = data.attribute("value");
                            }
                        }
                    }

                    if let Some(n) = name {
                        let game =
                            GameQueryResult::from_bgg_xml(n.to_string(), game_type, published, id);
                        games.push(game);
                    } else {
                        return Err("Found an un-named game?".to_string());
                    }
                }
            }
        }
        Ok(games)
    }

    fn from_bgg_xml(
        name: String,
        game_type: GameType,
        published: Option<&str>,
        bgg_id: Option<String>,
    ) -> Self {
        Self {
            name,
            game_type,
            bgg_id,
            published: match published {
                Some(year_str) => Some(year_str.parse::<i32>().unwrap()),
                None => None,
            },
        }
    }
}