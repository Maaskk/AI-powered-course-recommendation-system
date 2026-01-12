/**
 * Simple SQLite database client using better-sqlite3
 */

import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), "data")
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const DB_PATH = process.env.DATABASE_PATH || path.join(dataDir, "app.db")

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma("journal_mode = WAL")
    initializeDatabase(db)
    console.log("[Database] Initialized successfully at", DB_PATH)
  }
  return db
}

function initializeDatabase(database: Database.Database) {
  // Disable foreign key enforcement to avoid constraint issues
  database.pragma("foreign_keys = OFF")
  
  // Create tables without foreign key constraints (users table is in auth.ts)
  database.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      item_id TEXT PRIMARY KEY,
      course_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT,
      category TEXT,
      level TEXT,
      difficulty TEXT,
      provider TEXT,
      source TEXT,
      rating REAL,
      num_reviews INTEGER,
      skills TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      course_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT,
      category TEXT,
      difficulty TEXT,
      predicted_rating REAL,
      avg_rating REAL,
      num_ratings INTEGER,
      confidence REAL,
      source TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      rating REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, item_id)
    );

    CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
    CREATE INDEX IF NOT EXISTS idx_ratings_user ON user_ratings(user_id);
    CREATE INDEX IF NOT EXISTS idx_courses_item_id ON courses(item_id);
  `)
}

export interface Student {
  id?: number
  user_id: string
  name: string
  email?: string
  major?: string
  year?: number
  created_at?: string
}

export interface RecommendationRecord {
  id?: number
  user_id: string
  item_id: string
  title: string
  description?: string
  url?: string
  predicted_rating?: number
  avg_rating?: number
  num_ratings?: number
  confidence?: number
  created_at?: string
}

export interface UserRating {
  id?: number
  user_id: string
  item_id: string
  rating: number
  created_at?: string
}

// Student operations
export function createStudent(student: Student): Student {
  const db = getDatabase()
  const stmt = db.prepare("INSERT INTO students (user_id, name, email, major, year) VALUES (?, ?, ?, ?, ?)")
  const result = stmt.run(
    student.user_id,
    student.name,
    student.email || null,
    student.major || null,
    student.year || null,
  )
  return { ...student, id: Number(result.lastInsertRowid) }
}

export function getStudent(userId: string): Student | null {
  const db = getDatabase()
  const stmt = db.prepare("SELECT * FROM students WHERE user_id = ?")
  return stmt.get(userId) as Student | null
}

export function getAllStudents(): Student[] {
  const db = getDatabase()
  const stmt = db.prepare("SELECT * FROM students ORDER BY created_at DESC")
  return stmt.all() as Student[]
}

// Recommendation operations
export function saveRecommendations(userId: string, recommendations: any[]): void {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO recommendations (user_id, item_id, title, description, url, predicted_rating, avg_rating, num_ratings, confidence)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertMany = db.transaction((recs) => {
    for (const rec of recs) {
      stmt.run(
        userId,
        rec.item_id,
        rec.title,
        rec.description || null,
        rec.url || null,
        rec.predicted_rating || null,
        rec.avg_rating || null,
        rec.num_ratings || null,
        rec.confidence || null,
      )
    }
  })

  insertMany(recommendations)
}

export function getRecommendations(userId: string, limit = 10): RecommendationRecord[] {
  const db = getDatabase()
  const stmt = db.prepare("SELECT * FROM recommendations WHERE user_id = ? ORDER BY created_at DESC LIMIT ?")
  return stmt.all(userId, limit) as RecommendationRecord[]
}

// Rating operations
export function saveRating(rating: UserRating): void {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO user_ratings (user_id, item_id, rating)
    VALUES (?, ?, ?)
  `)
  stmt.run(rating.user_id, rating.item_id, rating.rating)
}

export function getUserRatings(userId: string): UserRating[] {
  const db = getDatabase()
  const stmt = db.prepare("SELECT * FROM user_ratings WHERE user_id = ?")
  return stmt.all(userId) as UserRating[]
}

// Analytics
export function getStats() {
  const db = getDatabase()

  const totalStudents = db.prepare("SELECT COUNT(*) as count FROM students").get() as { count: number }
  const totalRecommendations = db.prepare("SELECT COUNT(*) as count FROM recommendations").get() as { count: number }
  const totalRatings = db.prepare("SELECT COUNT(*) as count FROM user_ratings").get() as { count: number }

  return {
    total_students: totalStudents.count,
    total_recommendations: totalRecommendations.count,
    total_ratings: totalRatings.count,
  }
}
