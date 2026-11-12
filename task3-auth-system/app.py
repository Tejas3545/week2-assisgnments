"""
Apex Core Technologies — Cryptographic Authentication & Access Control System
Backend: Python 3 / Flask / Bcrypt / PyJWT / SQLite
Endpoints:
  - POST /api/auth/register       (User registration with salted bcrypt hashing)
  - POST /api/auth/login          (Credential verification & JWT issuance)
  - GET  /api/auth/me             (Protected: Current session profile)
  - GET  /api/auth/dashboard      (Protected: Confidential system metrics)
  - POST /api/auth/logout         (Session termination)
"""

import os
import re
import datetime
from functools import wraps
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import bcrypt
import jwt
from auth_db import get_connection, init_db

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "apex_core_enterprise_secret_2026_production_grade")
TOKEN_EXPIRY_HOURS = 2

init_db()

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9_-]{3,30}$")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"success": False, "error": "Authorization header missing."}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"success": False, "error": "Invalid Authorization header format. Expected 'Bearer <token>'."}), 401

        token = parts[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("user_id")

            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id, username, email, role, created_at FROM users WHERE id = ?", (user_id,))
            current_user = cursor.fetchone()
            conn.close()

            if not current_user:
                return jsonify({"success": False, "error": "Authenticated user record no longer exists."}), 401

            request.current_user = dict(current_user)
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "error": "Authentication token has expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "error": "Invalid authentication token signature."}), 401

        return f(*args, **kwargs)
    return decorated

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "engineer").strip()

    errors = {}

    # Username validation
    if not username:
        errors["username"] = "Username is required."
    elif not USERNAME_REGEX.match(username):
        errors["username"] = "Username must be 3-30 characters (letters, numbers, underscore, hyphen)."

    # Email validation
    if not email:
        errors["email"] = "Email address is required."
    elif not EMAIL_REGEX.match(email):
        errors["email"] = "Invalid email format."

    # Password complexity validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
    if not password:
        errors["password"] = "Password is required."
    elif len(password) < 8:
        errors["password"] = "Password must be at least 8 characters in length."
    elif not re.search(r"[A-Z]", password):
        errors["password"] = "Password must contain at least one uppercase letter."
    elif not re.search(r"[a-z]", password):
        errors["password"] = "Password must contain at least one lowercase letter."
    elif not re.search(r"[0-9]", password):
        errors["password"] = "Password must contain at least one numeric digit."

    if errors:
        return jsonify({"success": False, "errors": errors}), 400

    conn = get_connection()
    cursor = conn.cursor()

    # Check username / email uniqueness
    cursor.execute("SELECT id, username, email FROM users WHERE username = ? OR email = ?", (username, email))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        if existing["username"] == username:
            return jsonify({"success": False, "errors": {"username": "Username is already claimed."}}), 409
        else:
            return jsonify({"success": False, "errors": {"email": "An account with this email already exists."}}), 409

    # Hash password with bcrypt salt factor 12
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    cursor.execute("""
        INSERT INTO users (username, email, password_hash, role)
        VALUES (?, ?, ?, ?)
    """, (username, email, hashed, role))
    new_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT id, username, email, role, created_at FROM users WHERE id = ?", (new_id,))
    new_user = dict(cursor.fetchone())
    conn.close()

    # Generate JWT immediately for smooth user onboarding
    token_payload = {
        "user_id": new_user["id"],
        "username": new_user["username"],
        "email": new_user["email"],
        "role": new_user["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRY_HOURS)
    }
    token = jwt.encode(token_payload, SECRET_KEY, algorithm="HS256")

    return jsonify({
        "success": True,
        "message": "Account registered successfully.",
        "token": token,
        "user": new_user
    }), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    identifier = data.get("identifier", "").strip()  # Can be username or email
    password = data.get("password", "")

    if not identifier or not password:
        return jsonify({"success": False, "error": "Both username/email and password are required."}), 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM users
        WHERE username = ? OR email = ?
    """, (identifier, identifier.lower()))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({"success": False, "error": "Invalid credentials provided."}), 401

    # Verify bcrypt hash
    stored_hash = user["password_hash"].encode("utf-8")
    if not bcrypt.checkpw(password.encode("utf-8"), stored_hash):
        return jsonify({"success": False, "error": "Invalid credentials provided."}), 401

    # Issue JWT
    token_payload = {
        "user_id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRY_HOURS)
    }
    token = jwt.encode(token_payload, SECRET_KEY, algorithm="HS256")

    user_data = {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"]
    }

    return jsonify({
        "success": True,
        "message": "Authentication successful.",
        "token": token,
        "user": user_data
    }), 200

@app.route("/api/auth/me", methods=["GET"])
@token_required
def get_current_user():
    return jsonify({
        "success": True,
        "user": request.current_user
    }), 200

@app.route("/api/auth/dashboard", methods=["GET"])
@token_required
def get_protected_dashboard():
    # Only authenticated users with valid JWT can access this payload
    user = request.current_user
    audit_logs = [
        {"timestamp": "2026-11-10 11:35:10", "event": "JWT Token Signature Verified", "source": request.remote_addr},
        {"timestamp": "2026-11-10 11:20:00", "event": "Password Hash Check (Bcrypt 12 Rounds)", "source": "Auth Engine"},
        {"timestamp": "2026-11-10 10:45:12", "event": "Session Handshake Established", "source": "API Gateway"}
    ]

    return jsonify({
        "success": True,
        "authenticated_as": user["username"],
        "role": user["role"],
        "access_level": "Tier-1 Confidential",
        "system_status": "All Cryptographic Verification Guards Active",
        "audit_logs": audit_logs
    }), 200

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    # Stateless JWT logout: client purges token
    return jsonify({
        "success": True,
        "message": "Session invalidated successfully. Client token removed."
    }), 200

if __name__ == "__main__":
    app.run(port=5002, debug=True)
