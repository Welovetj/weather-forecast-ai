import * as SQLite from 'expo-sqlite';
import { isSupabaseConfigured, syncSearchesToSupabase } from '../services/supabaseService';

const DB_NAME = 'weather.db';
const TABLE_NAME = 'searches';

let dbPromise;

const autoSyncSearchesToCloud = async () => {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const rows = await getAllSearches();
    const normalizedRows = Array.isArray(rows) ? rows : [];
    if (normalizedRows.length === 0) {
      return;
    }

    await syncSearchesToSupabase(normalizedRows);
  } catch (error) {
    // Local SQLite operations should still succeed even if cloud sync fails.
    console.warn('Auto sync to Supabase failed:', error?.message || error);
  }
};

const getDB = async () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }

  return dbPromise;
};

export const initDB = async () => {
  const db = await getDB();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT,
      latitude REAL,
      longitude REAL,
      date_from TEXT,
      date_to TEXT,
      temp_min REAL,
      temp_max REAL,
      "condition" TEXT,
      unit TEXT,
      created_at TEXT
    );
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_searches_created_at
    ON ${TABLE_NAME}(created_at DESC);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_searches_location
    ON ${TABLE_NAME}(location);
  `);
};

export const insertSearch = async (data) => {
  await initDB();
  const db = await getDB();

  const {
    location = null,
    latitude = null,
    longitude = null,
    date_from = null,
    date_to = null,
    temp_min = null,
    temp_max = null,
    condition = null,
    unit = null,
    created_at = new Date().toISOString(),
  } = data || {};

  const result = await db.runAsync(
    `
      INSERT INTO ${TABLE_NAME} (
        location,
        latitude,
        longitude,
        date_from,
        date_to,
        temp_min,
        temp_max,
        "condition",
        unit,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    location,
    latitude,
    longitude,
    date_from,
    date_to,
    temp_min,
    temp_max,
    condition,
    unit,
    created_at,
  );

  await autoSyncSearchesToCloud();

  return result.lastInsertRowId;
};

export const getAllSearches = async (options = {}) => {
  await initDB();
  const db = await getDB();

  const { limit } = options || {};
  const hasLimit = Number.isInteger(limit) && limit > 0;

  const baseQuery = `
    SELECT
      id,
      location,
      latitude,
      longitude,
      date_from,
      date_to,
      temp_min,
      temp_max,
      "condition" AS condition,
      unit,
      created_at
    FROM ${TABLE_NAME}
    ORDER BY created_at DESC
  `;

  if (hasLimit) {
    return db.getAllAsync(`${baseQuery}\nLIMIT ?;`, limit);
  }

  return db.getAllAsync(`${baseQuery};`);
};

export const getRecentLocations = async (limit = 8) => {
  await initDB();
  const db = await getDB();

  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 8;

  const rows = await db.getAllAsync(
    `
      SELECT
        location,
        MAX(created_at) AS latest_created_at
      FROM ${TABLE_NAME}
      WHERE location IS NOT NULL
        AND TRIM(location) <> ''
      GROUP BY LOWER(TRIM(location))
      ORDER BY latest_created_at DESC
      LIMIT ?;
    `,
    safeLimit,
  );

  return (Array.isArray(rows) ? rows : [])
    .map((row) => (typeof row?.location === 'string' ? row.location.trim() : ''))
    .filter(Boolean);
};

export const updateSearch = async (id, data) => {
  await initDB();
  const db = await getDB();

  const {
    temp_min = null,
    temp_max = null,
    condition = null,
  } = data || {};

  const result = await db.runAsync(
    `
      UPDATE ${TABLE_NAME}
      SET
        temp_min = ?,
        temp_max = ?,
        "condition" = ?
      WHERE id = ?;
    `,
    temp_min,
    temp_max,
    condition,
    id,
  );

  if (result.changes > 0) {
    await autoSyncSearchesToCloud();
  }

  return result.changes > 0;
};

export const deleteSearch = async (id) => {
  await initDB();
  const db = await getDB();

  const result = await db.runAsync(`DELETE FROM ${TABLE_NAME} WHERE id = ?;`, id);

  if (result.changes > 0) {
    await autoSyncSearchesToCloud();
  }

  return result.changes > 0;
};
