import psycopg2

def get_connection():
    return psycopg2.connect(
        host="host.docker.internal",
        database="placement_portal",
        user="postgres",
        password="Anjali@1104",  # replace with your actual password
        port="5432"
    )

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('student', 'hr', 'admin')),
            is_approved INTEGER DEFAULT 1
        )
    """)

    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            description TEXT,
            package TEXT,
            eligibility TEXT,
            deadline TEXT,
            posted_by INTEGER,
            FOREIGN KEY (posted_by) REFERENCES users(id)
        )
    """)

    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            job_id INTEGER NOT NULL,
            status TEXT DEFAULT 'Applied',
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (job_id) REFERENCES jobs(id),
            UNIQUE(user_id, job_id)
        )
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("Database initialized!")

if __name__ == "__main__":
    init_db()