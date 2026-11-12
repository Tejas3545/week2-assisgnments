"""
Apex Core Technologies — Enterprise Identity & Access Management Data Layer
Database: SQLite3 Identity Persistence
"""

import sqlite3
import os
import bcrypt

DB_PATH = os.path.join(os.path.dirname(__file__), "auth.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'engineer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Seed an enterprise admin account for testing if empty
    cursor.execute("SELECT COUNT(*) AS count FROM users")
    count = cursor.fetchone()["count"]
    if count == 0:
        demo_password = b"TejasPass@2026"
        hashed = bcrypt.hashpw(demo_password, bcrypt.gensalt(12)).decode("utf-8")
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        """, ("tejas_solanki", "tejas.solanki@apexcore.tech", hashed, "lead_architect"))
        conn.commit()

    conn.close()

if __name__ == "__main__":
    init_db()
    print("Authentication database initialized and verified.")
