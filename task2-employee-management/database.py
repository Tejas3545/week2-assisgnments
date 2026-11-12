"""
Apex Core Technologies — Employee Relational Data Layer
Database: SQLite3 Relational Persistence
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "employees.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            department TEXT NOT NULL,
            role TEXT NOT NULL,
            salary REAL NOT NULL,
            join_date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Check if empty, seed default enterprise records
    cursor.execute("SELECT COUNT(*) AS count FROM employees")
    count = cursor.fetchone()["count"]
    if count == 0:
        seed_data = [
            ("Tejas J. Solanki", "tejas.solanki@apexcore.tech", "Engineering", "Principal Systems Architect", 145000.0, "2023-01-15"),
            ("Sarah Jenkins", "sarah.jenkins@apexcore.tech", "Engineering", "Senior Backend Engineer", 128000.0, "2023-03-20"),
            ("Marcus Vance", "marcus.vance@apexcore.tech", "DevOps & Cloud", "Cloud Infrastructure Lead", 132000.0, "2023-06-10"),
            ("Elena Rostova", "elena.rostova@apexcore.tech", "Security", "Cryptographic Security Analyst", 125000.0, "2023-09-01"),
            ("Liam Patel", "liam.patel@apexcore.tech", "Product", "Technical Product Manager", 118000.0, "2024-02-15")
        ]
        cursor.executemany("""
            INSERT INTO employees (full_name, email, department, role, salary, join_date)
            VALUES (?, ?, ?, ?, ?, ?)
        """, seed_data)
        conn.commit()

    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized and verified successfully.")
