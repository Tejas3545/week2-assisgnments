"""
Apex Core Technologies / WeIntern Full Stack Internship — Week 2 Unified Server
Candidate: Tejas J. Solanki

This server mounts all three Week 2 tasks under a unified web server on port 5000:
  - Task 1: /                (Responsive Multi-Page Corporate Website)
  - Task 2: /employees       (CRUD Employee Management System)
  - Task 3: /auth            (Enterprise Authentication & JWT System)

Individual standalone servers remain independently executable:
  - Week 2/task2-employee-management/app.py (Port 5001)
  - Week 2/task3-auth-system/app.py         (Port 5002)
"""

import os
import sys
from flask import Flask, send_from_directory, render_template

# Path definitions
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TASK1_DIR = os.path.join(BASE_DIR, "task1-company-website")
TASK2_DIR = os.path.join(BASE_DIR, "task2-employee-management")
TASK3_DIR = os.path.join(BASE_DIR, "task3-auth-system")

unified_app = Flask(__name__, static_folder=None)

# -------------------------------------------------------------
# Task 1: Static Corporate Website Routing
# -------------------------------------------------------------
@unified_app.route("/")
@unified_app.route("/index.html")
def task1_home():
    return send_from_directory(TASK1_DIR, "index.html")

@unified_app.route("/about.html")
def task1_about():
    return send_from_directory(TASK1_DIR, "about.html")

@unified_app.route("/services.html")
def task1_services():
    return send_from_directory(TASK1_DIR, "services.html")

@unified_app.route("/contact.html")
def task1_contact():
    return send_from_directory(TASK1_DIR, "contact.html")

@unified_app.route("/css/<path:filename>")
def task1_css(filename):
    return send_from_directory(os.path.join(TASK1_DIR, "css"), filename)

@unified_app.route("/js/<path:filename>")
def task1_js(filename):
    return send_from_directory(os.path.join(TASK1_DIR, "js"), filename)

@unified_app.route("/assets/<path:filename>")
def task1_assets(filename):
    return send_from_directory(os.path.join(TASK1_DIR, "assets"), filename)

# -------------------------------------------------------------
# Task 2 & Task 3 Direct Launch Reminders
# -------------------------------------------------------------
@unified_app.route("/portal")
def portal_menu():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>WeIntern Week 2 Portal Navigation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif; background: #F8FAFC; color: #0F172A; padding: 40px 20px; line-height: 1.6; }
        .box { max-width: 680px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 8px; border: 1px solid #E2E8F0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        h1 { font-size: 1.5rem; margin-bottom: 8px; }
        p { color: #475569; margin-bottom: 24px; font-size: 0.95rem; }
        .list-item { padding: 16px; border: 1px solid #E2E8F0; border-radius: 6px; margin-bottom: 12px; }
        .list-item h3 { margin: 0 0 4px 0; font-size: 1.05rem; }
        .list-item p { margin: 0 0 8px 0; font-size: 0.85rem; color: #64748B; }
        a.btn { display: inline-block; padding: 6px 14px; background: #0F172A; color: #fff; text-decoration: none; border-radius: 4px; font-size: 0.85rem; font-weight: 500; }
        a.btn:hover { background: #1E293B; }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>WeIntern Full Stack Internship — Week 2 Portal</h1>
        <p>Candidate: <strong>Tejas J. Solanki</strong> &bull; Domain: Python Full Stack Development</p>
        <div class="list-item">
          <h3>Task 1: Responsive Company Website</h3>
          <p>Multi-page corporate website with Flexbox/Grid layouts, validated contact form, and mobile navigation.</p>
          <a class="btn" href="/">Launch Task 1 Website</a>
        </div>
        <div class="list-item">
          <h3>Task 2: CRUD Employee Management System</h3>
          <p>REST API with SQLite relational persistence, search/sort table, add/edit modals, delete dialogs.</p>
          <p style="font-family: monospace; font-size: 0.8rem; color: #0F172A;">Run standalone: <code>python "task2-employee-management/app.py"</code> (Port 5001)</p>
        </div>
        <div class="list-item">
          <h3>Task 3: Authentication System</h3>
          <p>Cryptographic salted bcrypt password hashing, JWT token lifecycle, and route-protected dashboard.</p>
          <p style="font-family: monospace; font-size: 0.8rem; color: #0F172A;">Run standalone: <code>python "task3-auth-system/app.py"</code> (Port 5002)</p>
        </div>
      </div>
    </body>
    </html>
    """

if __name__ == "__main__":
    print("=" * 60)
    print("WeIntern Week 2 Full Stack Unified Server")
    print("Candidate: Tejas J. Solanki")
    print("Task 1 Corporate Website: http://127.0.0.1:5000/")
    print("Task 2 Employee Management: Run standalone on port 5001")
    print("Task 3 Authentication System: Run standalone on port 5002")
    print("Portal Menu: http://127.0.0.1:5000/portal")
    print("=" * 60)
    unified_app.run(port=5000, debug=True)
