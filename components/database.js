import * as SQLite from 'expo-sqlite';



const dbFileName = 'trainings.db';

const db = SQLite.openDatabaseSync(dbFileName); 

// Initiera databasen
export const initDatabase = async () => {
  try {
    const statement = await db.prepareAsync(
      `CREATE TABLE IF NOT EXISTS trainingsessions (
        id INTEGER PRIMARY KEY NOT NULL,
        distance REAL NOT NULL,
        time TEXT NOT NULL,
        date TEXT NOT NULL
      );`
    );
    try {
      await statement.executeSync();
      
      console.log('Table created or already exists');
    } finally {
      await statement.finalizeAsync();
    }
  } catch (error) {
    console.error('Error creating table:', error);
  }
};

// Lägg till en ny träningssession
export const createRunRecord = async (distance, time) => {
  const date = new Date().toISOString();
  try {
    const statement = await db.prepareAsync(
      'INSERT INTO trainingsessions (distance, time, date) VALUES ($distance, $time, $date);'
    );
    try {
      const result = await statement.executeAsync({
        $distance: distance,
        $time: time,
        $date: date,
      });
      console.log('Run record inserted:', result.lastInsertRowId);
      return result.lastInsertRowId;
    } finally {
      await statement.finalizeAsync();
    }
  } catch (error) {
    console.error('Error inserting run record:', error);
    throw error;
  }
};

// Hämta alla träningssessioner
export const getAllRuns = async () => {
  try {
    const statement = await db.prepareAsync('SELECT * FROM trainingsessions;');
    try {
      const result = await statement.executeAsync();

      const allRows = await result.getAllAsync();
      return allRows;
    } finally {
      await statement.finalizeAsync();
    }
  } catch (error) {
    console.error('Error fetching runs:', error);
    throw error;
  }
};
