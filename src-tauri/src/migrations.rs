use rusqlite::Connection;
use rusqlite_migration::{Migrations, M};

pub fn migrate(db_connection: &mut Connection) -> rusqlite_migration::Result<()> {
    let migrations = Migrations::new(vec![
        M::up(
            "CREATE TABLE player (
                id INTEGER NOT NULL PRIMARY KEY,
                name TEXT NON NULL
        )",
        ),
        M::up(
            "CREATE TABLE game (
            id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
           min_players INTEGER,
            max_players INTEGER,
            player_poll TEXT,
            bgg_id TEXT NOT NULL,
            published INTEGER
    )",
        ),
        M::up(
            "CREATE TABLE mechanic(
            id INTEGER NOT NULL PRIMARY KEY,
            name TEXT NOT NULL

        )",
        ),
        M::up(
            "CREATE TABLE category(
            id INTEGER NOT NULL PRIMARY KEY,
            name TEXT NOT NULL
        )",
        ),
        M::up(
            "CREATE TABLE game_mechanics (
                id INTEGER NOT NULL PRIMARY KEY,
                game_id INTEGER NOT NULL,
                mechanic_id INTEGER NOT NULL,
                FOREIGN KEY (game_id) REFERENCES game(id),
                FOREIGN KEY (mechanic_id) REFERENCES mechanic(id)
            )",
        ),
        M::up(
            "CREATE TABLE game_categories (
                id INTEGER NOT NULL PRIMARY KEY,
                game_id INTEGER NOT NULL,
                category_id INTEGER NOT NULL,
                FOREIGN KEY (game_id) REFERENCES game(id),
                FOREIGN KEY (category_id) REFERENCES category(id)
            )",
        ),
    ]);
    migrations.to_latest(db_connection)?;
    Ok(())
}
