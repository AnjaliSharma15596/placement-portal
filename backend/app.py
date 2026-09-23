from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import init_db, get_connection
import psycopg2
import psycopg2.extras
import json

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "placement_portal_secret_key"
jwt = JWTManager(app)

init_db()

# =========================
# DATABASE CONNECTION
# =========================
def get_db():
    conn = get_connection()
    return conn


# =========================
# AUTH ROUTES
# =========================

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not all([name, email, password, role]):
        return jsonify({"error": "All fields required"}), 400

    if role not in ["student", "hr"]:
        return jsonify({"error": "Invalid role. Admin accounts cannot self-register"}), 403

    hashed_password = generate_password_hash(password)
    is_approved = 0 if role == "hr" else 1

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO users (name, email, password, role, is_approved) VALUES (%s, %s, %s, %s, %s)",
            (name, email, hashed_password, role, is_approved)
        )
        conn.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return jsonify({"error": "Email already exists"}), 409
    finally:
        cur.close()
        conn.close()


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    identity = json.dumps({
        "id": user["id"],
        "name": user["name"],
        "role": user["role"]
    })

    token = create_access_token(identity=identity)
    return jsonify({
        "token": token,
        "role": user["role"],
        "name": user["name"]
    }), 200


# =========================
# JOB ROUTES
# =========================

@app.route("/jobs", methods=["GET"])
def get_jobs():
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM jobs")
    jobs = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([dict(job) for job in jobs])


@app.route("/add_job", methods=["POST"])
@jwt_required()
def add_job():
    current_user = json.loads(get_jwt_identity())
    if current_user["role"] != "hr":
        return jsonify({"error": "Only HR can post jobs"}), 403

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT is_approved FROM users WHERE id=%s", (current_user["id"],))
    user = cur.fetchone()
    if not user["is_approved"]:
        cur.close()
        conn.close()
        return jsonify({"error": "Your HR account is pending admin approval"}), 403

    data = request.json
    cur.execute(
        "INSERT INTO jobs (title, company, description, package, eligibility, deadline, posted_by) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (data["title"], data["company"], data["description"],
         data.get("package"), data.get("eligibility"), data.get("deadline"), current_user["id"])
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Job added successfully"}), 201


@app.route("/delete_job/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_job(id):
    current_user = json.loads(get_jwt_identity())

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM jobs WHERE id=%s", (id,))
    job = cur.fetchone()

    if not job:
        cur.close()
        conn.close()
        return jsonify({"error": "Job not found"}), 404

    if current_user["role"] == "admin":
        pass
    elif current_user["role"] == "hr" and job["posted_by"] == current_user["id"]:
        pass
    else:
        cur.close()
        conn.close()
        return jsonify({"error": "Unauthorized"}), 403

    cur.execute("DELETE FROM jobs WHERE id=%s", (id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Job deleted"})

# =========================
# APPLICATION ROUTES
# =========================

@app.route("/apply", methods=["POST"])
@jwt_required()
def apply_job():
    current_user = json.loads(get_jwt_identity())
    if current_user["role"] != "student":
        return jsonify({"error": "Only students can apply"}), 403

    data = request.json
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO applications (user_id, job_id, status) VALUES (%s, %s, %s)",
            (current_user["id"], data["job_id"], "Applied")
        )
        conn.commit()
        return jsonify({"message": "Applied successfully"}), 201
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return jsonify({"error": "You have already applied to this job"}), 409
    finally:
        cur.close()
        conn.close()


@app.route("/my_applications", methods=["GET"])
@jwt_required()
def my_applications():
    current_user = json.loads(get_jwt_identity())
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT applications.id, jobs.title, jobs.company, applications.status
        FROM applications
        JOIN jobs ON applications.job_id = jobs.id
        WHERE applications.user_id = %s
    """, (current_user["id"],))
    apps = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([dict(a) for a in apps])


@app.route("/update_status/<int:app_id>", methods=["POST"])
@jwt_required()
def update_status(app_id):
    current_user = json.loads(get_jwt_identity())

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT applications.id, jobs.posted_by
        FROM applications
        JOIN jobs ON applications.job_id = jobs.id
        WHERE applications.id = %s
    """, (app_id,))
    app_row = cur.fetchone()

    if not app_row:
        cur.close()
        conn.close()
        return jsonify({"error": "Application not found"}), 404

    if current_user["role"] == "admin":
        pass
    elif current_user["role"] == "hr" and app_row["posted_by"] == current_user["id"]:
        pass
    else:
        cur.close()
        conn.close()
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json
    cur.execute(
        "UPDATE applications SET status=%s WHERE id=%s",
        (data["status"], app_id)
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Status updated"})

# =========================
# ALL APPLICATIONS (HR + ADMIN)
# =========================

@app.route("/all_applications", methods=["GET"])
@jwt_required()
def all_applications():
    current_user = json.loads(get_jwt_identity())
    if current_user["role"] not in ["hr", "admin"]:
        return jsonify({"error": "Unauthorized"}), 403

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT applications.id, users.name as student_name, 
               jobs.title, jobs.company, applications.status
        FROM applications
        JOIN jobs ON applications.job_id = jobs.id
        JOIN users ON applications.user_id = users.id
    """)
    apps = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([dict(a) for a in apps])

# =========================
# ADMIN ROUTES
# =========================

@app.route("/admin/stats", methods=["GET"])
@jwt_required()
def admin_stats():
    current_user = json.loads(get_jwt_identity())
    if current_user["role"] != "admin":
        return jsonify({"error": "Unauthorized"}), 403

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM users WHERE role='student'")
    total_students = cur.fetchone()[0]
    cur.execute("SELECT COUNT(DISTINCT company) FROM jobs")
    total_companies = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM applications")
    total_applications = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM applications WHERE status='Selected'")
    total_selected = cur.fetchone()[0]
    cur.close()
    conn.close()

    return jsonify({
        "total_students": total_students,
        "total_companies": total_companies,
        "total_applications": total_applications,
        "selection_rate": round((total_selected / total_applications * 100), 2) if total_applications > 0 else 0
    })


@app.route("/admin/pending_hr", methods=["GET"])
@jwt_required()
def pending_hr():
    current_user = json.loads(get_jwt_identity())
    if current_user["role"] != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT id, name, email FROM users WHERE role='hr' AND is_approved=0")
    pending = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([dict(p) for p in pending])


@app.route("/admin/approve_hr/<int:user_id>", methods=["POST"])
@jwt_required()
def approve_hr(user_id):
    current_user = json.loads(get_jwt_identity())
    if current_user["role"] != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE users SET is_approved=1 WHERE id=%s", (user_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "HR account approved"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)