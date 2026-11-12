"""
Apex Core Technologies — Employee Management REST API
Backend: Python 3 / Flask / SQLite
Endpoints:
  - GET    /api/employees       (Search & Sort)
  - GET    /api/employees/<id>  (Fetch Single)
  - POST   /api/employees       (Create Record)
  - PUT    /api/employees/<id>  (Update Record)
  - DELETE /api/employees/<id>  (Delete Record)
  - GET    /api/stats           (Executive Metrics)
"""

import re
from datetime import datetime
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from database import get_connection, init_db

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# Initialize schema on startup
init_db()

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
VALID_SORT_FIELDS = {"id", "full_name", "email", "department", "role", "salary", "join_date"}

def validate_employee_payload(data, current_id=None):
    errors = {}
    
    # Full Name
    full_name = data.get("full_name", "").strip()
    if not full_name:
        errors["full_name"] = "Full name is required."
    elif len(full_name) < 2 or len(full_name) > 80:
        errors["full_name"] = "Name must be between 2 and 80 characters."

    # Email
    email = data.get("email", "").strip().lower()
    if not email:
        errors["email"] = "Email address is required."
    elif not EMAIL_REGEX.match(email):
        errors["email"] = "Invalid email format."
    else:
        # Check uniqueness in DB
        conn = get_connection()
        cursor = conn.cursor()
        if current_id:
            cursor.execute("SELECT id FROM employees WHERE email = ? AND id != ?", (email, current_id))
        else:
            cursor.execute("SELECT id FROM employees WHERE email = ?", (email,))
        existing = cursor.fetchone()
        conn.close()
        if existing:
            errors["email"] = "An employee with this email address already exists."

    # Department
    department = data.get("department", "").strip()
    if not department:
        errors["department"] = "Department is required."

    # Role
    role = data.get("role", "").strip()
    if not role:
        errors["role"] = "Role title is required."

    # Salary
    salary_raw = data.get("salary")
    try:
        salary = float(salary_raw)
        if salary <= 0:
            errors["salary"] = "Salary must be a positive number."
    except (ValueError, TypeError):
        errors["salary"] = "Salary must be a valid numeric amount."

    # Join Date
    join_date = data.get("join_date", "").strip()
    if not join_date:
        errors["join_date"] = "Join date is required."
    else:
        try:
            datetime.strptime(join_date, "%Y-%m-%d")
        except ValueError:
            errors["join_date"] = "Join date must be in YYYY-MM-DD format."

    return errors

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/employees", methods=["GET"])
def get_employees():
    search = request.args.get("search", "").strip()
    department = request.args.get("department", "").strip()
    sort = request.args.get("sort", "id").lower()
    order = request.args.get("order", "asc").lower()

    if sort not in VALID_SORT_FIELDS:
        sort = "id"
    if order not in {"asc", "desc"}:
        order = "asc"

    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM employees WHERE 1=1"
    params = []

    if search:
        query += " AND (full_name LIKE ? OR email LIKE ? OR role LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])

    if department:
        query += " AND department = ?"
        params.append(department)

    query += f" ORDER BY {sort} {order.upper()}"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    employees = [dict(row) for row in rows]
    conn.close()

    return jsonify({"success": True, "count": len(employees), "data": employees}), 200

@app.route("/api/employees/<int:employee_id>", methods=["GET"])
def get_single_employee(employee_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM employees WHERE id = ?", (employee_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"success": False, "error": "Employee record not found."}), 404

    return jsonify({"success": True, "data": dict(row)}), 200

@app.route("/api/employees", methods=["POST"])
def create_employee():
    data = request.get_json() or {}
    errors = validate_employee_payload(data)
    if errors:
        return jsonify({"success": False, "errors": errors}), 400

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO employees (full_name, email, department, role, salary, join_date)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        data["full_name"].strip(),
        data["email"].strip().lower(),
        data["department"].strip(),
        data["role"].strip(),
        float(data["salary"]),
        data["join_date"].strip()
    ))
    new_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM employees WHERE id = ?", (new_id,))
    created = dict(cursor.fetchone())
    conn.close()

    return jsonify({"success": True, "message": "Employee created successfully.", "data": created}), 201

@app.route("/api/employees/<int:employee_id>", methods=["PUT"])
def update_employee(employee_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM employees WHERE id = ?", (employee_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({"success": False, "error": "Employee record not found."}), 404

    data = request.get_json() or {}
    errors = validate_employee_payload(data, current_id=employee_id)
    if errors:
        conn.close()
        return jsonify({"success": False, "errors": errors}), 400

    cursor.execute("""
        UPDATE employees
        SET full_name = ?, email = ?, department = ?, role = ?, salary = ?, join_date = ?
        WHERE id = ?
    """, (
        data["full_name"].strip(),
        data["email"].strip().lower(),
        data["department"].strip(),
        data["role"].strip(),
        float(data["salary"]),
        data["join_date"].strip(),
        employee_id
    ))
    conn.commit()

    cursor.execute("SELECT * FROM employees WHERE id = ?", (employee_id,))
    updated = dict(cursor.fetchone())
    conn.close()

    return jsonify({"success": True, "message": "Employee updated successfully.", "data": updated}), 200

@app.route("/api/employees/<int:employee_id>", methods=["DELETE"])
def delete_employee(employee_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, full_name FROM employees WHERE id = ?", (employee_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({"success": False, "error": "Employee record not found."}), 404

    cursor.execute("DELETE FROM employees WHERE id = ?", (employee_id,))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": f"Employee {existing['full_name']} (ID {employee_id}) successfully removed."}), 200

@app.route("/api/stats", methods=["GET"])
def get_stats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) AS total, AVG(salary) AS avg_salary FROM employees")
    aggregate = cursor.fetchone()

    cursor.execute("SELECT department, COUNT(*) AS count FROM employees GROUP BY department")
    dept_rows = cursor.fetchall()
    conn.close()

    return jsonify({
        "success": True,
        "total_employees": aggregate["total"],
        "average_salary": round(aggregate["avg_salary"] or 0, 2),
        "department_distribution": {row["department"]: row["count"] for row in dept_rows}
    }), 200

if __name__ == "__main__":
    app.run(port=5001, debug=True)
