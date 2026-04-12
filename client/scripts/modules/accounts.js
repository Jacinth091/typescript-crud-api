import { showToast } from "./ui.js";
import { saveToStorage } from "./db.js";
import { getDataFromTarget } from "./utils.js";

const tableItemContainer = document.getElementById("table-items");
const saveAccountBtn = document.getElementById("save-acc-btn");
const accFormContainer = document.getElementById("acc-form-cont");
const accountForm = document.getElementById("acc-form");
const modalAccountForm = document.getElementById("acc-modal-form");
const accountModal = document.getElementById("reset-pw");
const confirmModal = document.getElementById("delete-confirm-modal");
const accConfirmDeleteBtn = document.getElementById("confirm-delete-btn");

let editId = null; //Current Editing Id
let selectedId = null;

export function setSelectedId(id) {
  selectedId = id;
}

export function renderAccountsList() {
  const accounts = window.db.accounts;
  tableItemContainer.innerHTML = "";

  if (accounts.length <= 0 || !accounts) {
    const row = `
      <td colspan="5" class="text-center bg-secondary-subtle">
        No accounts.
      </td>
      `;
    tableItemContainer.insertAdjacentHTML("beforeend", row);
    return;
  }
  accounts.forEach((acc) => {
    let row = `
    <tr>
      <td>${acc.first_name}</td>
      <td>${acc.email}</td>
      <td>${acc.role}</td>
      <td>${acc.verified ? "✅" : "❌"}</td>
      <td>
        <button
          type="button"
          class="btn btn-outline-primary edit-acc-btn"
          data-id=${acc.id}
        >
          Edit
        </button>
        <button
          type="button"
          class="btn btn-outline-warning reset-acc-btn"
          data-id=${acc.id}
          data-bs-toggle="modal"
          data-bs-target="#reset-pw"
        >
          Reset Password
        </button>
        <button
          type="button"
          class="btn btn-outline-danger delete-acc-btn"
          data-id=${acc.id}
          data-bs-toggle="modal"
          data-bs-target="#delete-confirm-modal"
        >
          Delete
        </button>
      </td>
    </tr>`;
    tableItemContainer.insertAdjacentHTML("beforeend", row);
  });
}

export function renderAccountDetails() {
  try {
    if (!selectedId) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }

    const modal_body = confirmModal.querySelector(".modal-body");
    modal_body.innerHTML = "";

    const user = window.db.accounts.find((u) => u.id === Number(selectedId));

    if (!user) {
      showToast("Account Not Found!", "danger");
    }
    const name = user.first_name + " " + user.last_name;
    const item = `
    <div class="container-fluid">
      <div
        class="d-flex flex-column align-items-start justify-content-center gap-2"
      >
        <p class="lead-4 fs-4" id="confirm-modal-header">
          Are you sure you want to delete this account?
        </p>
        <div class="container-fluid p-0">
          <div class="row mb-2 align-items-center">
            <div class="col-4 col-sm-3 fw-bold fs-5 text-secondary">Name:</div>
            <div class="col-8 col-sm-9 fs-5">${name}</div>
          </div>

          <div class="row mb-2 align-items-center">
            <div class="col-4 col-sm-3 fw-bold fs-5 text-secondary">Email:</div>
            <div class="col-8 col-sm-9 fs-5 text-break">${user.email}</div>
          </div>

          <div class="row mb-2 align-items-center">
            <div class="col-4 col-sm-3 fw-bold fs-5 text-secondary">Role:</div>
            <div class="col-8 col-sm-9">
              <span class="badge ${user.role === "admin" ? "bg-danger" : "bg-primary"}">${user.role}</span>
            </div>
          </div>

          <div class="row mb-2 align-items-center">
            <div class="col-4 col-sm-3 fw-bold fs-5 text-secondary">Status:</div>
            <div class="col-8 col-sm-9">
              ${user.verified ? '<span class="text-success">Verified ✅</span>' : '<span class="text-warning">Pending ❌</span>'}
            </div>
          </div>
        </div>

        </div>
      </div>
    </div>`;
    modal_body.insertAdjacentHTML("beforeend", item);
  } catch (error) {
    console.error(error);
  }
}

export function openAccountForm() {
  accFormContainer.classList.remove("d-none");
}

export function clearForm() {
  const fields = accFormContainer.querySelectorAll('input[id*="acc-"]');
  fields.forEach((f) => {
    const suffix = f.id.replace("acc-", "");
    if (suffix === "check") {
      f.checked = false;
    } else {
      f.value = "";
    }
  });

  const modal_fields = accountModal
    .querySelector(".modal-body")
    .querySelectorAll("input");
  modal_fields.forEach((mf) => {
    mf.value = "";
  });
}

export function closeAccountForm() {
  clearForm();
  accFormContainer.classList.add("d-none");
  selectedId = null;
}

export function prefillAccountForm() {
  try {
    if (selectedId === null) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }
    const user = window.db.accounts.find((u) => u.id === Number(selectedId));
    if (!user) {
      showToast("User not found!", "danger");
      return;
    }

    openAccountForm();
    const fields = accFormContainer.querySelectorAll('input[id*="acc-"]');

    const fieldMap = {
      fname: "first_name",
      lname: "last_name",
      email: "email",
      pw: "password",
      role: "role",
    };

    fields.forEach((f) => {
      const suffix = f.id.replace("acc-", "");
      const dataKey = fieldMap[suffix];
      if (dataKey) {
        f.value = user[dataKey];
      } else if (suffix === "check") {
        f.checked = user.verified;
      }
    });
  } catch (error) {
    console.error(error);
    showToast(error.message, "danger");
  }
}

export function resetAccountPassword(formData) {
  try {
    if (selectedId === null) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }
    if (!formData.password.trim() || !formData.confirm_password.trim()) {
      throw new Error("Important Fields should not be empty!");
    }

    if (
      formData.password.trim().length < 6 ||
      formData.confirm_password.trim().length < 6
    ) {
      throw new Error("Passwords must contain minimum of 6 characters.");
    }

    if (formData.password.trim() !== formData.confirm_password.trim()) {
      throw new Error("Passwords doesn't match!");
    }

    const userIndex = window.db.accounts.findIndex(
      (u) => u.id === Number(selectedId),
    );
    if (userIndex !== -1) {
      window.db.accounts[userIndex] = {
        ...window.db.accounts[userIndex],
        password: formData.password,
      };
      showToast("Password resetted successfully!", "success");
      selectedId = null;
      saveToStorage();
      clearForm();
      renderAccountsList();
      bootstrap.Modal.getOrCreateInstance(accountModal).hide();
    } else {
      showToast("Unsuccessful password reset.", "danger");
      clearForm();
      selectedId = null;
      bootstrap.Modal.getOrCreateInstance(accountModal).hide();
      return;
    }
  } catch (error) {
    console.error("An Error Occurred: ", error);
    showToast(error.message, "danger");
  }
}

export function saveOrEditUserAccount(formData) {
  try {
    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.email.trim() ||
      !formData.role.trim()
    ) {
      throw new Error("Important fields should not be empty.");
    }

    if (formData.password.trim().length < 6) {
      throw new Error("Passwords must contain minimum of 6 characters.");
    }

    if (
      formData.role.trim().toString() !== "admin" &&
      formData.role.trim().toString() !== "user"
    ) {
      throw new Error("Invalid Role, Only Admin and User");
    }

    if (selectedId === null) {
      const isEmailExist = window.db.accounts.find(
        (u) => u.email === formData.email,
      );
      if (isEmailExist) {
        throw new Error("Email already taken, please try another.");
      }
      const newUser = {
        id: Date.now(),
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        verified: formData.verified,
      };

      window.db.accounts.push(newUser);
      showToast("Account Added Successfully!", "success");
    } else {
      const userIndex = window.db.accounts.findIndex(
        (u) => u.id === Number(selectedId),
      );
      if (userIndex !== -1) {
        window.db.accounts[userIndex] = {
          ...window.db.accounts[userIndex],
          ...formData,
        };
        showToast("Update Successful!", "success");
      } else {
        throw new Error("Unsuccessful Update, try again");
      }
      selectedId = null;
    }
    saveToStorage();
    closeAccountForm();
    renderAccountsList();
  } catch (error) {
    console.error(error);
    showToast(error.message, "danger");
  }
}

export function deleteUserAccount(currentUser) {
  try {
    if (selectedId === null) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }

    if (Number(selectedId) === Number(currentUser.id)) {
      throw new Error("You can't delete your own account.");
    }

    const userIndex = window.db.accounts.findIndex(
      (u) => u.id === Number(selectedId),
    );
    if (userIndex !== -1) {
      window.db.accounts.splice(userIndex, 1);
      selectedId = null;
      saveToStorage();
      renderAccountsList();
      const modalInstance = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("delete-confirm-modal"),
      );
      modalInstance.hide();
      showToast("Account Deleted Successfully!", "success");
    } else {
      showToast("Account Deletion Unsuccessful.", "danger");
      selectedId = null;
      return;
    }
  } catch (error) {
    console.log("An Error Occurred: ", error);
    showToast(error.message, "danger");
  }
}

// Initializing the module listeners
export function initAccounts(currentUser) {
  accountForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = getDataFromTarget(e);
    data.verified = e.target.elements["acc-check"].checked;
    saveOrEditUserAccount(data);
  });
  accountForm.querySelector("#role-menu").addEventListener("click", (e) => {
    if (e.target.classList.contains("dropdown-item")) {
      e.preventDefault();
      const selectedValue = e.target.textContent;
      accountForm.querySelector("#acc-role").value = selectedValue;
    }
  });
  tableItemContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-acc-btn")) {
      selectedId = e.target.dataset.id;
      prefillAccountForm();
    } else if (e.target.classList.contains("reset-acc-btn")) {
      selectedId = e.target.dataset.id;
    } else if (e.target.classList.contains("delete-acc-btn")) {
      selectedId = e.target.dataset.id;
      renderAccountDetails();
    }
  });
  accConfirmDeleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    deleteUserAccount(currentUser);
  });
  modalAccountForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = getDataFromTarget(e);
    resetAccountPassword(data);
  });
}
