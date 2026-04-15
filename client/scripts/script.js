import {
  createAccount,
  deleteAccount,
  editAccount,
  getAccountsList,
  getUserById,
  resetAccountPassword,
} from "../api/admin.api.js";
import { getProfile, login, register, verifyEmail } from "../api/auth.api.js";
import {
  getDepartmentById,
  getDepartmentList,
  createDepartment,
  editDepartment,
  deleteDepartment,
} from "../api/department.api.js";
import {
  addNewEmployee,
  deleteEmployee,
  editEmployee,
  getEmployeeById,
  getEmployeeList,
} from "../api/employee.api.js";
import {
  createRequest,
  deleteRequest as deleteRequestApi,
  getRequestList,
} from "../api/request.api.js";

// =============================================================================
// GLOBALS
// =============================================================================

let currentUser = null;
let selectedId = null;
let employees = [];
let departments = [];
let accounts = [];

// =============================================================================
// SESSION HELPERS
// =============================================================================

const setSession = (token, user) => {
  sessionStorage.setItem("authToken", token);
  sessionStorage.setItem("session", JSON.stringify(user));
};
const clearSession = () => {
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("session");
};
const getSession = () => {
  try {
    const token = sessionStorage.getItem("authToken");
    const user = JSON.parse(sessionStorage.getItem("session") ?? "null");
    return token && user ? { token, user } : null;
  } catch {
    clearSession();
    return null;
  }
};


function normalizeUser(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    email: raw.email ?? "",
    role: raw.role ?? "",
    title: raw.title ?? "",
    username: raw.username ?? "",
    first_name: raw.firstName ?? raw.first_name ?? "",
    middle_name: raw.middleName ?? raw.middle_name ?? "",
    last_name: raw.lastName ?? raw.last_name ?? "",
  };
}

// =============================================================================
// UTILITIES
// =============================================================================

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const icons = {
    success: "bi-check-circle-fill",
    danger: "bi-x-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
  };
  const id = "toast-" + Date.now();
  container.insertAdjacentHTML(
    "beforeend",
    `
    <div id="${id}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${icons[type] || icons.info}"></i> ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>`,
  );
  const toastEl = document.getElementById(id);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

function charactersOnly(str) {
  return /^[a-zA-Z\s]+$/.test(str.trim());
}
function getDataFromTarget(e) {
  return Object.fromEntries(new FormData(e.target).entries());
}
function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function navigateTo(hash) {
  window.location.hash = hash;
}

function initializePasswordToggles() {
  document.querySelectorAll(".password-toggleable").forEach((input) => {
    const wrapper = document.createElement("div");
    wrapper.className = "input-group";
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    wrapper.insertAdjacentHTML(
      "beforeend",
      `<button class="btn btn-outline-secondary" type="button"><i class="bi bi-eye"></i></button>`,
    );
    const btn = wrapper.querySelector("button");
    const icon = btn.querySelector("i");
    btn.onclick = () => {
      const isPw = input.type === "password";
      input.type = isPw ? "text" : "password";
      icon.className = isPw ? "bi bi-eye-slash" : "bi bi-eye";
    };
  });
}

// =============================================================================
// ROUTING
// =============================================================================

function authenticatedRoutes(hash) {
  return [
    "#profile",
    "#account",
    "#employee",
    "#department",
    "#request",
  ].includes(hash);
}
function adminPages(hash) {
  return ["#account", "#employee", "#department"].includes(hash);
}
function userOnlyPages(hash) {
  return hash === "#request";
}

function handleRouting() {
  let currentHash = window.location.hash;
  if (currentHash === "" || currentHash === "#/") {
    currentHash = "#/home";
    configureNavbar(false, null);
  }
  const targId = "#" + currentHash.replace("#/", "");
  const isAuthenticated = document.body.classList.contains("authenticated");
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  if (!isAuthenticated && authenticatedRoutes(targId)) {
    showToast("You are not authenticated, please login first.", "warning");
    window.location.hash = "#/home";
    return;
  }
  const isUserAdmin = currentUser?.role?.toLowerCase() === "admin";
  if (isAuthenticated && !isUserAdmin && adminPages(targId)) {
    showToast("Invalid Request. Unauthorized User.", "danger");
    window.location.hash = "#/profile";
    return;
  }
  if (isAuthenticated && isUserAdmin && userOnlyPages(targId)) {
    showToast("This page is only available for User accounts.", "warning");
    window.location.hash = "#/profile";
    return;
  }
  try {
    const matchingPage = document.querySelector(targId);
    if (matchingPage) {
      matchingPage.classList.add("active");
      if (currentUser) {
        if (targId === "#account") renderAccountsList();
        else if (targId === "#department") renderDepartmentItems();
        else if (targId === "#employee") renderEmployeeItems();
        else if (targId === "#request") renderRequestItems();
      }
    } else {
      window.location.hash = isAuthenticated ? "#/profile" : "#/home";
    }
  } catch (error) {
    console.error("Routing error:", error);
    window.location.hash = "#/home";
    configureNavbar(false, null);
  }
}

window.addEventListener("load", async () => {
  const token = sessionStorage.getItem("authToken");
  let isLoggedIn = false;

  if (token) {
    const response = await getProfile();
    if (response?.success && response?.data) {
      const user = normalizeUser(response.data);
      currentUser = user;
      setSession(token, user); 
      setAuthState(true, user);
      configureNavbar(true, user);
      renderProfile();
      isLoggedIn = true;
    } else {
      clearSession();
      if (response?.expired) {
        showToast("Your session has expired. Please log in again.", "warning");
      }
    }
  }

  if (!window.location.hash || window.location.hash === "#/") {
    window.location.hash = isLoggedIn ? "#/profile" : "#/home";
  } else {
    handleRouting();
  }
});

window.addEventListener("hashchange", () => handleRouting());

// =============================================================================
// AUTH
// =============================================================================

function setAuthState(isAuth, user) {
  const body = document.body;
  if (!isAuth) {
    body.className = "not_authenticated";
    body.classList.remove("is-admin");
    return;
  }
  currentUser = user;
  body.className = "authenticated";
  if (user.role?.toLowerCase() === "admin") body.classList.add("is-admin");
}

function configureNavbar(isAuth, user) {
  const authLink = document.getElementById("auth-link");
  const userLink = document.getElementById("user-link");
  const nameHolder = document.getElementById("name-holder");
  if (!isAuth) {
    authLink.classList.remove("d-none");
    authLink.classList.add("d-flex");
    userLink.classList.add("d-none");
    return;
  }
  authLink.classList.add("d-none");
  authLink.classList.remove("d-flex");
  userLink.classList.remove("d-none");
  if (user?.first_name) nameHolder.textContent = user.first_name;
  
  const role = user?.role?.toLowerCase();
  document
    .querySelectorAll("#drop-menu .role-admin")
    .forEach((i) => i.classList.toggle("d-none", role !== "admin"));
  document
    .querySelectorAll("#drop-menu .role-user")
    .forEach((i) => i.classList.toggle("d-none", role === "admin"));
}

function logout() {
  clearSession();
  setAuthState(false, null);
  configureNavbar(false, null);
  navigateTo("#/home");
}

async function verifyEmailHandler() {
  try {
    const userEmail = localStorage.getItem("unverified_email");
    if (!userEmail || userEmail === "undefined") {
      showToast("No stored email to verify.", "warning");
      navigateTo("#/home");
      return;
    }
    const response = await verifyEmail(userEmail);
    if (!response?.success) {
      showToast(response?.error || "Email Verification Failed", "danger");
      return;
    }
    localStorage.removeItem("unverified_email");
    showToast(response.message, "success");
    navigateTo("#/login");
  } catch (error) {
    console.error("An error occurred:", error);
    showToast(error.message || "Something went wrong.", "danger");
  }
}

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const data = getDataFromTarget(e);
      if (data.password !== data.confirm_password) {
        showToast("Passwords do not match!", "danger");
        return;
      }
      const formData = {
        username: data.username,
        email: data.email,
        first_name: data.firstname,
        last_name: data.lastname,
        middle_name: data.middlename,
        password: data.password,
      };
      // Store email before the call as a fallback if server omits data.email
      const emailForVerification = data.email;
      const response = await register(formData);
      if (!response?.success) {
        showToast(response?.error || "Registration Failed", "danger");
        return;
      }
      localStorage.setItem(
        "unverified_email",
        response.data?.email ?? emailForVerification,
      );
      navigateTo("#/verify");
      showToast("Registered Successfully!", "success");
    } catch (error) {
      console.error("An error occurred:", error);
      showToast("Registration failed.", "danger");
    }
  });

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const data = getDataFromTarget(e);
    const response = await login(data.userStr, data.password);
    if (!response?.success) {
      showToast(response?.error || "Invalid Credentials", "danger");
      return;
    }
    const user = normalizeUser(response.data);
    setSession(response.token, user);
    setAuthState(true, user);
    configureNavbar(true, user);
    renderProfile();
    navigateTo("#/profile");
    showToast("Logged In Successfully!", "success");
  } catch (error) {
    console.error("An error occurred:", error);
    showToast("Network Error", "danger");
  }
});

document.getElementById("logout").addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});

// =============================================================================
// PROFILE
// =============================================================================

function renderProfile() {
  const fullName = [currentUser.first_name, currentUser.middle_name, currentUser.last_name]
    .filter(name => name && name.trim() !== "")
    .join(" ");
  document.getElementById("user-name").innerText = fullName;
  document.getElementById("user-email").innerText = currentUser.email;
  document.getElementById("user-role").innerText = currentUser.role;
  document.getElementById("user-username").innerText = currentUser.username;
  document.getElementById("edit-profile").onclick = () =>
    showToast("Not Implemented Yet, Tehee :>", "info");
}

// =============================================================================
// ACCOUNTS
// =============================================================================

const tableItemContainer = document.getElementById("table-items");
const accFormContainer = document.getElementById("acc-form-cont");
const accountForm = document.getElementById("acc-form");
const modalAccountForm = document.getElementById("acc-modal-form");
const accountModal = document.getElementById("reset-pw");
const confirmModal = document.getElementById("delete-confirm-modal");
const accConfirmDeleteBtn = document.getElementById("confirm-delete-btn");

async function renderAccountsList() {
  const response = await getAccountsList();
  accounts = response?.data ?? [];
  tableItemContainer.innerHTML = "";
  if (!accounts.length) {
    tableItemContainer.insertAdjacentHTML(
      "beforeend",
      `<tr><td colspan="6" class="text-center bg-secondary-subtle">No accounts.</td></tr>`,
    );
    return;
  }
  accounts.forEach((acc) => {
    const fullName = [acc.firstName, acc.middleName, acc.lastName]
      .filter(name => name && name.trim() !== "")
      .join(" ");
    tableItemContainer.insertAdjacentHTML(
      "beforeend",
      `
      <tr>
        <td>${fullName}</td>
        <td>${acc.email}</td>
        <td>${acc.username ?? "N/A"}</td>
        <td>${capitalizeFirst(acc.role)}</td>
        <td>${acc.verified ? "✅" : "❌"}</td>
        <td>
          <button type="button" class="btn btn-outline-primary edit-acc-btn" data-id="${acc.id}">Edit</button>
          <button type="button" class="btn btn-outline-warning reset-acc-btn" data-id="${acc.id}" data-bs-toggle="modal" data-bs-target="#reset-pw">Reset Password</button>
          <button type="button" class="btn btn-outline-danger delete-acc-btn" data-id="${acc.id}" data-bs-toggle="modal" data-bs-target="#delete-confirm-modal">Delete</button>
        </td>
      </tr>`,
    );
  });
}

function renderAccountDetails() {
  if (!selectedId) return;
  const user = accounts.find((u) => u.id === Number(selectedId));
  if (!user) {
    showToast("Account not found!", "danger");
    return;
  }
  const fullName = [user.firstName, user.middleName, user.lastName]
    .filter(name => name && name.trim() !== "")
    .join(" ");
  confirmModal.querySelector(".modal-body").innerHTML = `
    <div class="bg-light rounded-3 p-3 border border-secondary-subtle">
      <div class="row mb-2"><div class="col-5 fw-bold text-secondary text-end">Name:</div><div class="col-7 fw-medium">${fullName}</div></div>
      <div class="row mb-2"><div class="col-5 fw-bold text-secondary text-end">Email:</div><div class="col-7 text-break fw-medium">${user.email}</div></div>
      <div class="row mb-2 align-items-center"><div class="col-5 fw-bold text-secondary text-end">Role:</div><div class="col-7"><span class="badge ${user.role?.toLowerCase() === "admin" ? "bg-danger" : "bg-primary"}">${capitalizeFirst(user.role)}</span></div></div>
      <div class="row align-items-center"><div class="col-5 fw-bold text-secondary text-end">Status:</div><div class="col-7">${user.verified ? '<span class="text-success">Verified ✅</span>' : '<span class="text-warning">Pending ❌</span>'}</div></div>
    </div>`;
}

function openAccountForm() {
  selectedId = null;
  clearForm();
  accFormContainer.classList.remove("d-none");
}
function clearForm() {
  accFormContainer.querySelectorAll('input[id*="acc-"]').forEach((f) => {
    f.id.replace("acc-", "") === "check" ? (f.checked = false) : (f.value = "");
  });
  accountModal
    .querySelector(".modal-body")
    .querySelectorAll("input")
    .forEach((f) => (f.value = ""));
}
function closeAccountForm() {
  selectedId = null;
  clearForm();
  accFormContainer.classList.add("d-none");
}

function prefillAccountForm(savedId) {
  const user = accounts.find((u) => u.id === Number(savedId));
  if (!user) {
    showToast("Account not found!", "danger");
    return;
  }
  accFormContainer.classList.remove("d-none");
  clearForm();
  selectedId = savedId;
  const fieldMap = {
    fname: "firstName",
    mname: "middleName",
    lname: "lastName",
    email: "email",
    role: "role",
    username: "username",
  };
  accFormContainer.querySelectorAll('input[id*="acc-"]').forEach((f) => {
    const suffix = f.id.replace("acc-", "");
    if (fieldMap[suffix]) {
      f.value =
        suffix === "role"
          ? capitalizeFirst(user[fieldMap[suffix]])
          : (user[fieldMap[suffix]] ?? "");
    } else if (suffix === "check") {
      f.checked = user.verified;
    }
  });
}

async function saveOrEditUserAccount(formData) {
  try {
    if (
      !formData.first_name?.trim() ||
      !formData.last_name?.trim() ||
      !formData.email?.trim() ||
      !formData.role?.trim() ||
      !formData.username?.trim()
    )
      throw new Error("Important fields should not be empty.");
    if (
      formData.role.toLowerCase() !== "admin" &&
      formData.role.toLowerCase() !== "user"
    )
      throw new Error("Invalid role. Only 'Admin' or 'User' allowed.");
    const payload = {
      first_name: formData.first_name.trim(),
      middle_name: formData.middle_name ? formData.middle_name.trim() : "",
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      username: formData.username.trim(),
      role: formData.role.trim().charAt(0).toUpperCase() + formData.role.trim().slice(1).toLowerCase(),
      verified: formData.verified,
      ...(formData.password?.trim() && { password: formData.password.trim() }),
    };
    if (selectedId === null) {
      if (!formData.password || formData.password.trim().length < 6)
        throw new Error("Password must be at least 6 characters.");
      const response = await createAccount(payload);
      if (!response?.success) throw new Error(response?.error);
      showToast(response.message, "success");
    } else {
      const response = await editAccount(selectedId, payload);
      if (!response?.success) throw new Error(response?.error);
      showToast(response.message ?? "Account updated successfully!", "success");
    }
    selectedId = null;
    closeAccountForm();
    renderAccountsList();
  } catch (error) {
    console.error(error);
    showToast(error.message, "danger");
  }
}

async function handleResetPassword(formData) {
  try {
    if (!formData.password?.trim() || !formData.confirm_password?.trim())
      throw new Error("Fields should not be empty.");
    if (formData.password.trim().length < 6)
      throw new Error("Password must be at least 6 characters.");
    if (formData.password.trim() !== formData.confirm_password.trim())
      throw new Error("Passwords do not match.");
    if (!selectedId) throw new Error("No account selected.");
    const response = await resetAccountPassword(selectedId, {
      password: formData.password.trim(),
      confirm_password: formData.confirm_password.trim(),
    });
    if (!response?.success) throw new Error(response?.error);
    showToast(response.message, "success");
    selectedId = null;
    clearForm();
    bootstrap.Modal.getOrCreateInstance(accountModal).hide();
  } catch (error) {
    console.error("Reset Password Error:", error);
    showToast(error.message, "danger");
  }
}

async function handleDeleteAccount() {
  try {
    if (!selectedId) throw new Error("No account selected.");
    if (Number(selectedId) === Number(currentUser.id))
      throw new Error("You can't delete your own account.");
    const response = await deleteAccount(selectedId);
    if (!response?.success) throw new Error(response?.error);
    showToast(response.message, "success");
    selectedId = null;
    renderAccountsList();
    bootstrap.Modal.getOrCreateInstance(
      document.getElementById("delete-confirm-modal"),
    ).hide();
  } catch (error) {
    console.error("Delete Account Error:", error);
    showToast(error.message, "danger");
  }
}

accountForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = getDataFromTarget(e);
  data.verified = e.target.elements["acc-check"].checked;
  saveOrEditUserAccount(data);
});
accountForm.querySelector("#role-menu").addEventListener("click", (e) => {
  if (e.target.classList.contains("dropdown-item")) {
    e.preventDefault();
    accountForm.querySelector("#acc-role").value = e.target.textContent.trim();
  }
});
tableItemContainer.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains("edit-acc-btn")) {
    selectedId = id;
    prefillAccountForm(id);
  } else if (e.target.classList.contains("reset-acc-btn")) {
    selectedId = id;
  } else if (e.target.classList.contains("delete-acc-btn")) {
    selectedId = id;
    renderAccountDetails();
  }
});
accConfirmDeleteBtn.addEventListener("click", (e) => {
  e.preventDefault();
  handleDeleteAccount();
});
modalAccountForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleResetPassword(getDataFromTarget(e));
});

// =============================================================================
// DEPARTMENTS
// =============================================================================

const deptTableCont = document.getElementById("dept-table-cont");

async function renderDepartmentItems() {
  try {
    const response = await getDepartmentList();
    departments = response?.data ?? [];
    deptTableCont.innerHTML = "";
    if (!departments.length) {
      deptTableCont.insertAdjacentHTML(
        "beforeend",
        `<tr><td colspan="3" class="text-center bg-secondary-subtle">No departments.</td></tr>`,
      );
      return;
    }
    departments.forEach((d) => {
      deptTableCont.insertAdjacentHTML(
        "beforeend",
        `
        <tr>
          <td>${d.name}</td><td>${d.description}</td>
          <td>
            <button type="button" class="btn btn-outline-primary edit-dept-btn" data-id="${d.id}">Edit</button>
            <button type="button" class="btn btn-outline-danger delete-dept-btn" data-id="${d.id}" data-bs-toggle="modal" data-bs-target="#delete-confirm-modal-dept">Delete</button>
          </td>
        </tr>`,
      );
    });
  } catch (error) {
    console.error("Error Occurred:", error);
    showToast("Failed to load departments.", "danger");
  }
}

const deptFormCont = document.getElementById("dept-form-cont");
const deptForm = document.getElementById("dept-form");
const deleteConfirmModalDept = document.getElementById("delete-confirm-modal-dept");

function openDeptForm() {
  selectedId = null;
  clearDeptForm();
  deptFormCont.classList.remove("d-none");
}

function closeDeptForm() {
  selectedId = null;
  clearDeptForm();
  deptFormCont.classList.add("d-none");
}

function clearDeptForm() {
  deptForm.reset();
}

async function prefillDeptForm(id) {
  const dept = departments.find((d) => d.id === Number(id));
  if (!dept) return;
  selectedId = id;
  deptFormCont.classList.remove("d-none");
  deptForm.elements["name"].value = dept.name;
  deptForm.elements["description"].value = dept.description;
}

async function saveOrEditDepartment(formData) {
  try {
    if (!formData.name?.trim()) throw new Error("Department name is required.");
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim()
    };

    if (selectedId === null) {
      const response = await createDepartment(payload);
      if (!response?.success) throw new Error(response?.error);
      showToast(response.message, "success");
    } else {
      const response = await editDepartment(selectedId, payload);
      if (!response?.success) throw new Error(response?.error);
      showToast(response.message, "success");
    }
    closeDeptForm();
    renderDepartmentItems();
  } catch (error) {
    showToast(error.message, "danger");
  }
}

async function handleDeleteDepartment() {
  try {
    if (!selectedId) return;
    const response = await deleteDepartment(selectedId);
    if (!response?.success) throw new Error(response?.error);
    showToast(response.message, "success");
    selectedId = null;
    renderDepartmentItems();
    bootstrap.Modal.getOrCreateInstance(deleteConfirmModalDept).hide();
  } catch (error) {
    showToast(error.message, "danger");
  }
}

deptTableCont.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains("edit-dept-btn")) {
    prefillDeptForm(id);
  } else if (e.target.classList.contains("delete-dept-btn")) {
    selectedId = id;
    // renderDeptDetails(id); // Optional: show details in modal
  }
});

deptForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  saveOrEditDepartment(getDataFromTarget(e));
});

document.getElementById("confirm-delete-dept-btn")?.addEventListener("click", () => {
  handleDeleteDepartment();
});

document
  .getElementById("add-department")
  .addEventListener("click", () => openDeptForm());

document.getElementById("dept-cancel-btn")?.addEventListener("click", () => closeDeptForm());

// =============================================================================
// EMPLOYEES
// =============================================================================

const empTableCont = document.getElementById("emp-table-cont");
const empDetailCont = document.getElementById("emp-detail-cont");
const empForm = document.getElementById("emp-form");
const delEmpForm = document.getElementById("delete-confirm-modal-emp");

async function renderEmployeeItems() {
  try {
    // Fetch all data in parallel — eliminates N+1 requests (one dept + one user
    // lookup per employee row previously caused 2N extra round-trips).
    const [empResponse, deptResponse, accountResponse] = await Promise.all([
      getEmployeeList(),
      getDepartmentList(),
      getAccountsList(),
    ]);
    employees = empResponse?.data ?? [];
    const deptMap = Object.fromEntries(
      (deptResponse?.data ?? []).map((d) => [d.id, d.name]),
    );
    const userMap = Object.fromEntries(
      (accountResponse?.data ?? []).map((u) => [u.id, u.email]),
    );
    empTableCont.innerHTML = "";
    if (!employees.length) {
      empTableCont.insertAdjacentHTML(
        "beforeend",
        `<tr><td colspan="6" class="text-center bg-secondary-subtle">No employees.</td></tr>`,
      );
      return;
    }
    const rows = employees.map((em) => {
      const formattedDate = new Date(em.hireDate).toLocaleDateString(
        "en-US",
        { year: "numeric", month: "short", day: "numeric" },
      );
      const deptName = deptMap[em.departmentId] ?? "N/A";
      const email = userMap[em.userId] ?? "N/A";
      return `
        <tr>
          <th scope="row">${em.id}</th><td>${email}</td><td>${em.position}</td><td>${deptName}</td><td>${formattedDate}</td>
          <td>
            <button type="button" class="btn btn-outline-primary editEmpBtn" data-id="${em.id}">Edit</button>
            <button type="button" class="btn btn-outline-danger delEmpBtn" data-id="${em.id}" data-bs-toggle="modal" data-bs-target="#delete-confirm-modal-emp">Delete</button>
          </td>
        </tr>`;
    });
    empTableCont.innerHTML = rows.join("");
  } catch (error) {
    console.error("Error Occurred:", error);
  }
}

function openEmpDetailCont() {
  clearEmpForm();
  empDetailCont.classList.remove("d-none");
  populateDeptDropdown();
  const f = document.getElementById("emp_date");
  f.readOnly = false;
  f.classList.remove("bg-body-secondary");
}
function closeEmpDetailCont() {
  clearEmpForm();
  empDetailCont.classList.add("d-none");
}
function clearEmpForm() {
  selectedId = null;
  empDetailCont.querySelectorAll('input[id*="emp_"]').forEach((f) => {
    f.value = f.id === "emp_id" ? "Employee ID read-only" : "";
  });
}

async function prefillEmpForm() {
  try {
    if (selectedId === null) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }
    const emp = employees.find((em) => em.id === Number(selectedId));
    if (!emp) {
      showToast("Employee not found!", "danger");
      return;
    }
    openEmpDetailCont();
    selectedId = emp.id;
    const matchedAccount = normalizeUser(
      (await getUserById(Number(emp.userId)))?.data ?? null,
    );
    empDetailCont
      .querySelectorAll('input[id*="emp_"], select[id*="emp_"]')
      .forEach((f) => {
        if (f.id === "emp_email") {
          f.value = matchedAccount ? matchedAccount.email : "Account not found";
          return;
        }

        // Map form name to server camelCase if needed, otherwise use name
        const formName = f.name;
        const serverKeyMap = {
          "department_id": "departmentId",
          "hire_date": "hireDate"
        };
        const serverKey = serverKeyMap[formName] || formName;

        if (emp[serverKey] != null) {
          f.value =
            f.type === "date"
              ? emp[serverKey].toString().split("T")[0]
              : emp[serverKey];
        }
      });
    const hf = document.getElementById("emp_date");
    hf.readOnly = true;
    hf.classList.add("bg-body-secondary");
  } catch (error) {
    console.error(error);
    showToast(error.message, "danger");
  }
}

async function populateDeptDropdown() {
  try {
    const deptDropdown = document.getElementById("emp_dept");
    deptDropdown.innerHTML =
      '<option value="" disabled selected>Select a department...</option>';
    const response = await getDepartmentList();
    (response?.data ?? []).forEach((dept) => {
      const o = document.createElement("option");
      o.value = dept.id;
      o.textContent = dept.name;
      deptDropdown.appendChild(o);
    });
  } catch (error) {
    console.error("Error Occurred:", error);
  }
}

async function saveOrEditEmployee(formData) {
  try {
    if (!formData.email?.trim())
      throw new Error("User email should not be empty.");
    if (!formData.position?.trim())
      throw new Error("Position should not be empty.");
    if (!formData.department_id?.trim())
      throw new Error("Please select a department.");
    if (!formData.hire_date?.trim())
      throw new Error("Please enter a hire date.");
    if (!charactersOnly(formData.position.trim()))
      throw new Error("Position contains numerical characters.");
    const hireDate = new Date(formData.hire_date);
    if (isNaN(hireDate.getTime()))
      throw new Error("Please enter a valid hire date.");
    if (formData.hire_date > new Date().toLocaleDateString("en-CA"))
      throw new Error("Hire date cannot be in the future.");
    if (selectedId === null) {
      const response = await addNewEmployee(formData);
      if (!response?.success) throw new Error(response?.error);
      showToast(response.message, "success");
    } else {
      const response = await editEmployee(selectedId, formData);
      if (!response?.success)
        throw new Error(response?.error ?? "Edit failed.");
      showToast(
        response.message ?? "Employee updated successfully!",
        "success",
      );
    }
    selectedId = null;
    renderEmployeeItems();
    closeEmpDetailCont();
  } catch (error) {
    console.error(error);
    showToast(error.message, "danger");
  }
}

async function renderEmployeeDetails() {
  try {
    if (!selectedId) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }
    const modal_body = delEmpForm.querySelector(".modal-body");
    const emp = (await getEmployeeById(Number(selectedId)))?.data ?? null;
    if (!emp) {
      showToast("Employee Not Found!", "danger");
      return;
    }
    const user = (await getUserById(Number(emp.userId)))?.data ?? null;
    if (!user) {
      showToast("Account Not Found!", "danger");
      return;
    }
    const department =
      (await getDepartmentById(Number(emp.departmentId)))?.data ?? null;
    if (!department) {
      showToast("Department not found!", "danger");
      return;
    }
    const formattedDate = new Date(emp.hireDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    modal_body.innerHTML = `
      <div class="bg-light rounded-3 p-3 border border-secondary-subtle">
        <div class="row mb-2"><div class="col-5 fw-bold text-secondary text-end">Email:</div><div class="col-7 text-break fw-medium">${user.email}</div></div>
        <div class="row mb-2"><div class="col-5 fw-bold text-secondary text-end">Position:</div><div class="col-7 text-break fw-medium">${emp.position}</div></div>
        <div class="row mb-2"><div class="col-5 fw-bold text-secondary text-end">Department:</div><div class="col-7 text-break fw-medium">${department.name}</div></div>
        <div class="row mb-0"><div class="col-5 fw-bold text-secondary text-end">Hire Date:</div><div class="col-7 text-break fw-medium">${formattedDate}</div></div>
      </div>`;
  } catch (error) {
    console.error(error);
  }
}

async function deleteEmployeeHandler() {
  try {
    if (selectedId === null) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }
    const response = await deleteEmployee(Number(selectedId));
    if (!response?.success) throw new Error(response?.error);
    showToast(response.message ?? "Employee Deleted Successfully!", "success");
    selectedId = null;
    renderEmployeeItems();
    bootstrap.Modal.getOrCreateInstance(
      document.getElementById("delete-confirm-modal-emp"),
    ).hide();
  } catch (error) {
    console.error("An Error Occurred:", error);
    showToast("An Error Occurred: " + error.message, "danger");
  }
}

empForm.addEventListener("submit", (e) => {
  e.preventDefault();
  saveOrEditEmployee(getDataFromTarget(e));
});
empTableCont.addEventListener("click", (e) => {
  if (e.target.classList.contains("editEmpBtn")) {
    selectedId = e.target.dataset.id;
    prefillEmpForm();
  } else if (e.target.classList.contains("delEmpBtn")) {
    selectedId = e.target.dataset.id;
    renderEmployeeDetails();
  }
});
document
  .getElementById("confirm-delete-emp-btn")
  .addEventListener("click", (e) => {
    e.preventDefault();
    deleteEmployeeHandler();
  });

// =============================================================================
// REQUESTS
// =============================================================================

const requestTableCont = document.getElementById("request-table-cont");
const requestForm = document.getElementById("request-form");
const requestItemContainer = document.getElementById("request-item-container");
const requestModal = document.getElementById("requestModal");

async function renderRequestItems() {
  try {
    const response = await getRequestList();
    const requests = response?.data ?? [];
    requestTableCont.innerHTML = "";
    if (!requests.length) {
      requestTableCont.insertAdjacentHTML(
        "beforeend",
        `<tr><td colspan="6" class="text-center bg-secondary-subtle">No requests yet.</td></tr>`,
      );
      return;
    }
    requests.forEach((req) => {
      const formattedDate = new Date(req.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      let badgeClass = "bg-warning text-dark";
      if (req.status === "Approved") badgeClass = "bg-success";
      else if (req.status === "Rejected") badgeClass = "bg-danger";
      const itemsList = req.items
        .map((i) => `${i.name} (x${i.quantity})`)
        .join(", ");
      requestTableCont.insertAdjacentHTML(
        "beforeend",
        `
        <tr>
          <th scope="row">${req.id}</th><td>${req.type}</td><td>${itemsList}</td><td>${formattedDate}</td>
          <td><span class="badge ${badgeClass}">${req.status}</span></td>
          <td><button type="button" class="btn btn-outline-danger delete-req-btn" data-id="${req.id}" ${req.status !== "Pending" ? "disabled" : ""}>Delete</button></td>
        </tr>`,
      );
    });
  } catch (error) {
    console.error("Error Occurred:", error);
  }
}

async function handleCreateRequest(type, items) {
  try {
    const response = await createRequest({ type, items });
    if (!response?.success)
      throw new Error(response?.error ?? "Failed to submit request.");
    showToast(response.message, "success");
    clearRequestForm();
    renderRequestItems();
    bootstrap.Modal.getOrCreateInstance(requestModal).hide();
  } catch (error) {
    console.error("Create Request Error:", error);
    showToast(error.message, "danger");
  }
}

async function handleDeleteRequest(id) {
  try {
    const response = await deleteRequestApi(id);
    if (!response?.success)
      throw new Error(response?.error ?? "Failed to delete request.");
    showToast(response.message, "success");
    renderRequestItems();
  } catch (error) {
    console.error("Delete Request Error:", error);
    showToast(error.message, "danger");
  }
}

function addRequestItem() {
  requestItemContainer.insertAdjacentHTML(
    "beforeend",
    `
    <div class="d-flex align-items-center gap-1 w-100 request-item-row">
      <div class="flex-grow-1"><input type="text" class="form-control request-item-name" placeholder="Item name"></div>
      <div class="w-25"><input type="number" class="form-control request-item-qty" placeholder="Qty" min="1"></div>
      <div><button type="button" class="btn btn-danger remove-request-item-btn">&times;</button></div>
    </div>`,
  );
}

function clearRequestForm() {
  requestForm.reset();
  requestItemContainer.innerHTML = `
    <div class="d-flex align-items-center gap-1 w-100 request-item-row">
      <div class="flex-grow-1"><input type="text" class="form-control request-item-name" placeholder="Item name"></div>
      <div class="w-25"><input type="number" class="form-control request-item-qty" placeholder="Qty" min="1"></div>
      <div><button type="button" class="btn btn-secondary add-request-item-btn">+</button></div>
    </div>`;
}

requestItemContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-request-item-btn")) addRequestItem();
  else if (e.target.classList.contains("remove-request-item-btn"))
    e.target.closest(".request-item-row").remove();
});
requestTableCont.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-req-btn"))
    handleDeleteRequest(e.target.dataset.id);
});
requestForm.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const type = document.getElementById("request-type").value;
    if (!type) throw new Error("Please select a request type.");
    const items = [
      ...requestItemContainer.querySelectorAll(".request-item-row"),
    ]
      .map((row) => ({
        name: row.querySelector(".request-item-name").value.trim(),
        qty: parseInt(row.querySelector(".request-item-qty").value),
      }))
      .filter((i) => i.name && i.qty > 0);
    if (!items.length)
      throw new Error(
        "Please add at least one item with a valid name and quantity.",
      );
    handleCreateRequest(type, items);
  } catch (error) {
    showToast(error.message, "danger");
  }
});

// =============================================================================
// INITIALIZATION
// =============================================================================

initializePasswordToggles();
document
  .getElementById("get-started-btn")
  .addEventListener("click", () => navigateTo("#/login"));
document
  .getElementById("login-cancel-btn")
  .addEventListener("click", () => navigateTo("#/home"));
document
  .getElementById("register-cancel-btn")
  .addEventListener("click", () => navigateTo("#/home"));
document
  .getElementById("verify-email-btn")
  .addEventListener("click", () => verifyEmailHandler());
document
  .getElementById("go-to-login-btn")
  .addEventListener("click", () => navigateTo("#/login"));
document
  .getElementById("add-emp-btn")
  .addEventListener("click", () => openEmpDetailCont());
document
  .getElementById("emp-cancel-btn")
  .addEventListener("click", () => closeEmpDetailCont());
document
  .getElementById("add-account")
  .addEventListener("click", () => openAccountForm());
document
  .getElementById("acc-cancel-btn")
  .addEventListener("click", () => closeAccountForm());
