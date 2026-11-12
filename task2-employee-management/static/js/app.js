/**
 * Apex Core Technologies — Employee Management Client Controller
 * Architecture: Clean ES6 Fetch API with State Management
 */

let state = {
  employees: [],
  search: "",
  department: "",
  sort: "id",
  order: "asc",
  editingId: null,
  deletingId: null
};

document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  loadEmployees();
  loadMetrics();
});

function initEventListeners() {
  // Search input with debounce
  const searchInput = document.getElementById("searchInput");
  let debounceTimer;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.search = e.target.value.trim();
      loadEmployees();
    }, 250);
  });

  // Department filter
  const deptFilter = document.getElementById("deptFilter");
  deptFilter.addEventListener("change", (e) => {
    state.department = e.target.value;
    loadEmployees();
  });

  // Table headers for sorting
  document.querySelectorAll(".emp-table th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      const field = th.getAttribute("data-sort");
      if (state.sort === field) {
        state.order = state.order === "asc" ? "desc" : "asc";
      } else {
        state.sort = field;
        state.order = "asc";
      }
      updateSortHeaders();
      loadEmployees();
    });
  });

  // Add Employee button
  document.getElementById("openAddModalBtn").addEventListener("click", () => {
    resetEmployeeForm();
    state.editingId = null;
    document.getElementById("modalTitle").textContent = "Add Employee Record";
    openModal("employeeModal");
  });

  // Close modals
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllModals();
    });
  });

  // Employee Form submit (Add or Edit)
  document.getElementById("employeeForm").addEventListener("submit", handleFormSubmit);

  // Delete Confirm button
  document.getElementById("confirmDeleteBtn").addEventListener("click", handleConfirmDelete);
}

function updateSortHeaders() {
  document.querySelectorAll(".emp-table th[data-sort]").forEach((th) => {
    th.classList.remove("sorted-asc", "sorted-desc");
    if (th.getAttribute("data-sort") === state.sort) {
      th.classList.add(state.order === "asc" ? "sorted-asc" : "sorted-desc");
    }
  });
}

async function loadEmployees() {
  const tbody = document.getElementById("employeeTableBody");
  tbody.innerHTML = `<tr><td colspan="7" class="table-state">Loading employee records from database...</td></tr>`;

  try {
    const queryParams = new URLSearchParams({
      search: state.search,
      department: state.department,
      sort: state.sort,
      order: state.order
    });

    const res = await fetch(`/api/employees?${queryParams.toString()}`);
    const json = await res.json();

    if (!json.success) {
      tbody.innerHTML = `<tr><td colspan="7" class="table-state" style="color: var(--color-error);">Failed to load employee records.</td></tr>`;
      return;
    }

    state.employees = json.data;
    renderEmployeeTable();
  } catch (err) {
    console.error("API error:", err);
    tbody.innerHTML = `<tr><td colspan="7" class="table-state" style="color: var(--color-error);">API Connection Error. Verify backend server is running.</td></tr>`;
  }
}

async function loadMetrics() {
  try {
    const res = await fetch("/api/stats");
    const json = await res.json();
    if (json.success) {
      document.getElementById("metricTotal").textContent = json.total_employees;
      document.getElementById("metricAvgSalary").textContent = `$${json.average_salary.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
      document.getElementById("metricDepts").textContent = Object.keys(json.department_distribution).length;
    }
  } catch (err) {
    console.error("Stats API error:", err);
  }
}

function renderEmployeeTable() {
  const tbody = document.getElementById("employeeTableBody");
  if (state.employees.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="table-state">No employee records found matching current query.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.employees.map((emp) => {
    const formattedSalary = parseFloat(emp.salary).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    });

    return `
      <tr>
        <td style="font-family: var(--font-family-mono); font-size: 0.85rem; color: var(--color-muted);">#${emp.id}</td>
        <td>
          <div style="font-weight: 600; color: var(--color-primary);">${escapeHtml(emp.full_name)}</div>
          <div style="font-size: 0.8rem; color: var(--color-muted);">${escapeHtml(emp.email)}</div>
        </td>
        <td><span class="dept-tag">${escapeHtml(emp.department)}</span></td>
        <td>${escapeHtml(emp.role)}</td>
        <td class="salary-text">${formattedSalary}</td>
        <td style="font-size: 0.85rem; color: var(--color-secondary);">${escapeHtml(emp.join_date)}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-secondary btn-sm" onclick="openEditModal(${emp.id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="openDeleteModal(${emp.id}, '${escapeHtml(emp.full_name)}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function openEditModal(id) {
  const emp = state.employees.find((e) => e.id === id);
  if (!emp) return;

  state.editingId = id;
  resetEmployeeForm();

  document.getElementById("modalTitle").textContent = `Edit Employee (#${id})`;
  document.getElementById("empFullName").value = emp.full_name;
  document.getElementById("empEmail").value = emp.email;
  document.getElementById("empDepartment").value = emp.department;
  document.getElementById("empRole").value = emp.role;
  document.getElementById("empSalary").value = emp.salary;
  document.getElementById("empJoinDate").value = emp.join_date;

  openModal("employeeModal");
}

function openDeleteModal(id, name) {
  state.deletingId = id;
  document.getElementById("deleteEmployeeName").textContent = name;
  openModal("deleteModal");
}

async function handleConfirmDelete() {
  if (!state.deletingId) return;

  const btn = document.getElementById("confirmDeleteBtn");
  btn.disabled = true;
  btn.textContent = "Removing...";

  try {
    const res = await fetch(`/api/employees/${state.deletingId}`, {
      method: "DELETE"
    });
    const json = await res.json();

    if (json.success) {
      showToast(json.message, "success");
      closeAllModals();
      loadEmployees();
      loadMetrics();
    } else {
      showToast(json.error || "Failed to remove employee record.", "error");
    }
  } catch (err) {
    showToast("Network error executing deletion.", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Confirm Deletion";
    state.deletingId = null;
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  clearFieldErrors();

  const payload = {
    full_name: document.getElementById("empFullName").value.trim(),
    email: document.getElementById("empEmail").value.trim(),
    department: document.getElementById("empDepartment").value.trim(),
    role: document.getElementById("empRole").value.trim(),
    salary: parseFloat(document.getElementById("empSalary").value),
    join_date: document.getElementById("empJoinDate").value.trim()
  };

  const isEdit = state.editingId !== null;
  const endpoint = isEdit ? `/api/employees/${state.editingId}` : "/api/employees";
  const method = isEdit ? "PUT" : "POST";

  const saveBtn = document.getElementById("saveEmployeeBtn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving Record...";

  try {
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    if (!json.success) {
      if (json.errors) {
        for (const [field, msg] of Object.entries(json.errors)) {
          showFieldError(field, msg);
        }
      } else {
        showToast(json.error || "Submission failed.", "error");
      }
      return;
    }

    showToast(json.message, "success");
    closeAllModals();
    loadEmployees();
    loadMetrics();
  } catch (err) {
    showToast("Network error communicating with REST server.", "error");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Employee Record";
  }
}

function showFieldError(field, msg) {
  const errMap = {
    full_name: "empFullNameError",
    email: "empEmailError",
    department: "empDepartmentError",
    role: "empRoleError",
    salary: "empSalaryError",
    join_date: "empJoinDateError"
  };

  const inputMap = {
    full_name: "empFullName",
    email: "empEmail",
    department: "empDepartment",
    role: "empRole",
    salary: "empSalary",
    join_date: "empJoinDate"
  };

  const errEl = document.getElementById(errMap[field]);
  const inputEl = document.getElementById(inputMap[field]);

  if (errEl) {
    errEl.textContent = msg;
    errEl.classList.add("is-visible");
  }
  if (inputEl) {
    inputEl.classList.add("is-invalid");
  }
}

function clearFieldErrors() {
  document.querySelectorAll(".field-err-msg").forEach((el) => {
    el.textContent = "";
    el.classList.remove("is-visible");
  });
  document.querySelectorAll(".form-control").forEach((el) => {
    el.classList.remove("is-invalid");
  });
}

function resetEmployeeForm() {
  document.getElementById("employeeForm").reset();
  clearFieldErrors();
}

function openModal(id) {
  document.getElementById(id).classList.add("is-active");
}

function closeAllModals() {
  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.classList.remove("is-active");
  });
}

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
