from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import init_db
import sqlite3
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
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
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
    role = data.get("role")  # student / hr / admin

    if not all([name, email, password, role]):
        return jsonify({"error": "All fields required"}), 400

    hashed_password = generate_password_hash(password)

    try:
        conn = get_db()
        conn.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            (name, email, hashed_password, role)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "User registered successfully"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists"}), 409


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_db()
    user = conn.execute(
        "SELECT * FROM users WHERE email = ?", (email,)
    ).fetchone()
    conn.close()

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    # JWT token mein role aur name bhi store karenge
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
    jobs = conn.execute("SELECT * FROM jobs").fetchall()
    conn.close()
    return jsonify([dict(job) for job in jobs])


@app.route("/add_job", methods=["POST"])
@jwt_required()
def add_job():
    current_user = json.loads(get_jwt_identity())
    if current_user["role"] != "hr":
        return jsonify({"error": "Only HR can post jobs"}), 403

    data = request.json
    conn = get_db()
    conn.execute(
        "INSERT INTO jobs (title, company, description, package, eligibility, deadline, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (data["title"], data["company"], data["description"],
         data.get("package"), data.get("eligibility"), data.get("deadline"), current_user["id"])
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Job added successfully"}), 201


@app.route("/delete_job/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_job(id):
    current_user = json.loads(get_jwt_identity())
    if current_user["role"] not in ["hr", "admin"]:
        return jsonify({"error": "Unauthorized"}), 403

    conn = get_db()
    conn.execute("DELETE FROM jobs WHERE id=?", (id,))
    conn.commit()
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
    conn.execute(
        "INSERT INTO applications (user_id, job_id, status) VALUES (?, ?, ?)",
        (current_user["id"], data["job_id"], "Applied")
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Applied successfully"}), 201


@app.route("/my_applications", methods=["GET"])
@jwt_required()
def my_applications():
    current_user = json.loads(get_jwt_identity())
    conn = get_db()
    apps = conn.execute("""
        SELECT applications.id, jobs.title, jobs.company, applications.status
        FROM applications
        JOIN jobs ON applications.job_id = jobs.id
        WHERE applications.user_id = ?
    """, (current_user["id"],)).fetchall()
    conn.close()
    return jsonify([dict(a) for a in apps])


@app.route("/update_status/<int:app_id>", methods=["POST"])
@jwt_required()
def update_status(app_id):
    current_user = json.loads(get_jwt_identity())
    if current_user["role"] not in ["hr", "admin"]:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json
    conn = get_db()
    conn.execute(
        "UPDATE applications SET status=? WHERE id=?",
        (data["status"], app_id)
    )
    conn.commit()
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
    apps = conn.execute("""
        SELECT applications.id, users.name as student_name, 
               jobs.title, jobs.company, applications.status
        FROM applications
        JOIN jobs ON applications.job_id = jobs.id
        JOIN users ON applications.user_id = users.id
    """).fetchall()
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
    total_students = conn.execute(
        "SELECT COUNT(*) FROM users WHERE role='student'"
    ).fetchone()[0]
    total_companies = conn.execute(
        "SELECT COUNT(DISTINCT company) FROM jobs"
    ).fetchone()[0]
    total_applications = conn.execute(
        "SELECT COUNT(*) FROM applications"
    ).fetchone()[0]
    total_selected = conn.execute(
        "SELECT COUNT(*) FROM applications WHERE status='Selected'"
    ).fetchone()[0]
    conn.close()

    return jsonify({
        "total_students": total_students,
        "total_companies": total_companies,
        "total_applications": total_applications,
        "selection_rate": round((total_selected / total_applications * 100), 2) if total_applications > 0 else 0
    })


if __name__ == "__main__":
       app.run(host="0.0.0.0", port=10000)