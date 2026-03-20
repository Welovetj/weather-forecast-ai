import * as SQLite from 'expo-sqlite';

const DB_NAME = 'weather.db';
const TABLE_NAME = 'searches';

let dbPromise;
let hasInitialized = false;

const getDb = async () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }

  return dbPromise;
};

export const initializeDatabase = async () => {
  const db = await getDb();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      date_from TEXT,
      date_to TEXT,
      temperature_min REAL,
      temperature_max REAL,
      weather_condition TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  hasInitialized = true;
};

const ensureInitialized = async () => {
  if (!hasInitialized) {
    await initializeDatabase();
  }
};

export const createSearch = async ({
  location,
  latitude,
  longitude,
  date_from = null,
  date_to = null,
  temperature_min = null,
  temperature_max = null,
  weather_condition = null,
  created_at = null,
}) => {
  await ensureInitialized();
  const db = await getDb();

  const normalizedCreatedAt = created_at ?? new Date().toISOString();

  const result = await db.runAsync(
    `
      INSERT INTO ${TABLE_NAME} (
        location,
        latitude,
        longitude,
        date_from,
        date_to,
        temperature_min,
        temperature_max,
        weather_condition,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    location,
    latitude,
    longitude,
    date_from,
    date_to,
    temperature_min,
    temperature_max,
    weather_condition,
    normalizedCreatedAt,
  );

  return result.lastInsertRowId;
};

export const getSearches = async () => {
  await ensureInitialized();
  const db = await getDb();

  return db.getAllAsync(`
    SELECT
      id,
      location,
      latitude,
      longitude,
      date_from,
      date_to,
      temperature_min,
      temperature_max,
      weather_condition,
      created_at
    FROM ${TABLE_NAME}
    ORDER BY datetime(created_at) DESC, id DESC;
  `);
};

export const getSearchById = async (id) => {
  await ensureInitialized();
  const db = await getDb();

  return db.getFirstAsync(
    `
      SELECT
        id,
        location,
        latitude,
        longitude,
        date_from,
        date_to,
        temperature_min,
        temperature_max,
        weather_condition,
        created_at
      FROM ${TABLE_NAME}
      WHERE id = ?;
    `,
    id,
  );
};

export const updateSearch = async (
  id,
  {
    location,
    latitude,
    longitude,
    date_from = null,
    date_to = null,
    temperature_min = null,
    temperature_max = null,
    weather_condition = null,
  },
) => {
  await ensureInitialized();
  const db = await getDb();

  const result = await db.runAsync(
    `
      UPDATE ${TABLE_NAME}
      SET
        location = ?,
        latitude = ?,
        longitude = ?,
        date_from = ?,
        date_to = ?,
        temperature_min = ?,
        temperature_max = ?,
        weather_condition = ?
      WHERE id = ?;
    `,
    location,
    latitude,
    longitude,
    date_from,
    date_to,
    temperature_min,
    temperature_max,
    weather_condition,
    id,
  );

  return result.changes > 0;
};

export const deleteSearch = async (id) => {
  await ensureInitialized();
  const db = await getDb();

  const result = await db.runAsync(`DELETE FROM ${TABLE_NAME} WHERE id = ?;`, id);
  return result.changes > 0;
};
