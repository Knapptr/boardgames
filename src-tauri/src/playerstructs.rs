use rusqlite::Connection;

use crate::DbPoolWrapper;

#[derive(serde::Serialize)]
pub struct Player {
    name: String,
    id: i32,
}

impl Player {
    pub fn get_all_from_db(dbConnection: &mut DbPoolWrapper) -> Result<Vec<Player>, ()> {
        let mut statement = dbConnection
            .db
            .prepare("SELECT id, name from player")
            .expect("Error preparing query");
        let players: Vec<Player> = statement
            .query_map([], |row| {
                Ok(Player {
                    id: row.get(0)?,
                    name: row.get(1)?,
                })
            })
            .expect("Error in query map")
            .map(|p| p.unwrap())
            .collect();
        Ok(players)
    }
    pub fn create(name: &str, dbConnection: &mut DbPoolWrapper) -> Result<Player, ()> {
        // try to create a player and return it if successful
        // trim input
        let name = name.trim().to_string();
        // try to insert to db
        let id_result = dbConnection.db.query_row::<i32, _, _>(
            "INSERT INTO player (name) VALUES ($1) RETURNING id",
            [&name],
            |row| row.get(0),
        );
        if let Ok(id) = id_result {
            println!("Got Id. Player = {}-{}", name, id);
            return Ok(Player { name, id });
        } else {
            println!("{:?}", id_result);
            return Err(());
        }
    }
}
