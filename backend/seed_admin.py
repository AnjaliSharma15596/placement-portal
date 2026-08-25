"""
Run this ONCE, manually, to create the admin account.
This bypasses the public /register route entirely — the admin
account is inserted directly, so no signup form can ever create one.
"""

import sqlite3
from werkzeug.security import generate_password_hash

# --- Change these before running ---
ADMIN_NAME = "Anjali Sharma"
ADMIN_EMAIL = "admin@placementportal.com"
ADMIN_PASSWORD = "ChangeThisToAStrongPassword123!"
# ------------------------------------

conn = sqlite3.connect("database.db")

hashed_password = generate_password_hash(ADMIN_PASSWORD)

try:
    conn.execute(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        (ADMIN_NAME, ADMIN_EMAIL, hashed_password, "admin")
    )
    conn.commit()
    print(f"Admin account created successfully: {ADMIN_EMAIL}")
except sqlite3.IntegrityError:
    print("An account with this email already exists.")
finally:
    conn.close()
