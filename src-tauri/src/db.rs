use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Migration {
    Migration {
        version: 1,
        description: "Create initial tables",
        sql: "CREATE TABLE IF NOT EXISTS test (id, INTEGER PRIMARY KEY, name TEXT)",
        kind: MigrationKind::Up,
    }
}
