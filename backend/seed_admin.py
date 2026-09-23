"""
Run this ONCE, manually, to create the admin account.
This bypasses the public /register route entirely — the admin
account is inserted directly, so no signup form can ever create one.
"""

import psycopg2
from werkzeug.security import generate_password_hash
from models import get_connection

# --- Change these before running ---
ADMIN_NAME = "Anjali Sharma"
ADMIN_EMAIL = "admin@placementportal.com"
ADMIN_PASSWORD = "Password123!"
# ------------------------------------

conn = get_connection()
cur = conn.cursor()

hashed_password = generate_password_hash(ADMIN_PASSWORD)

try:
    cur.execute(
        "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)",
        (ADMIN_NAME, ADMIN_EMAIL, hashed_password, "admin")
    )
    conn.commit()
    print(f"Admin account created successfully: {ADMIN_EMAIL}")
except psycopg2.errors.UniqueViolation:
    conn.rollback()
    print("An account with this email already exists.")
finally:
    cur.close()
    conn.close()