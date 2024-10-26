use rusqlite::Connection;
use rusqlite_migration::{Migrations, M};

pub fn migrate(db_connection: &mut Connection) -> rusqlite_migration::Result<()> {
    let migrations = Migrations::new(vec![
        M::up("CREATE TABLE player (id INTEGER NOT NULL, name TEXT NON NULL)"),
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
    ]);
    migrations.to_latest(db_connection)?;
    Ok(())
}
