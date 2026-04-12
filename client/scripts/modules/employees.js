import { showToast } from "./ui.js";
import { saveToStorage } from "./db.js";
import { getDataFromTarget, charactersOnly } from "./utils.js";
import { getEmployeeById, getEmployeeList } from "../../api/employee.api.js";
import { getDepartmentById, getDepartmentList } from "../../api/department.api.js";
import { getUserById } from "../../api/admin.api.js";

const empTableCont = document.getElementById("emp-table-cont");
const addEmpBtn = document.getElementById("add-emp-btn");
const empDetailCont = document.getElementById("emp-detail-cont");
const empForm = document.getElementById("emp-form");
const delEmpForm = document.getElementById("delete-confirm-modal-emp");

let employeeList = [];
let departmentList = [];
let selectedId = null;

const fetchEmployeeListHandler = async () => {
  try {
    const result = await getEmployeeList();
    if (!result || !result.success) {
      showToast(result.error || "An error occurred while fetching employee list.", 'warning');
    }
    else {
      employeeList = result.data;
    }
  } catch (error) {
    console.error("Network Error");
    return null;
  }
}

const fetchDepartmentList = async () => {
  try {
    const result = await getDepartmentList();
    if (!result || !result.success) {
      showToast(result.error || "An error occurred while fetching department list.", 'warning');
    }
    else {
      departmentList = result.data;
    }
  } catch (error) {
    console.error("Network Error");
    return null;
  }
}

export async function renderEmployeeItems() {
  try {
    await fetchEmployeeListHandler();
    empTableCont.innerHTML = "";
    if (employeeList.length <= 0 || !employeeList) {
      let row = `
      <td colspan="6" class="text-center bg-secondary-subtle">
        No employees.
      </td>
      `;
      empTableCont.insertAdjacentHTML("beforeend", row);
      return;
    }

    employeeList.forEach(async (em) => {
      const dateObj = new Date(em.hire_date);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      let deptName = "";
      const department = await getDepartmentById(Number(em.department_id));
      if (!department) {
        deptName = "N/A";
      } else {
        deptName = department.name;
      }
      let email = "";
      y
      const user = await getUserById(Number(em.user_id));
      if (!user) {
        email = "N/A";
      } else {
        email = user.email;
      }
      let row = `
      <tr>
        <th scope="row">${em.id}</th>
        <td>${email}</td>
        <td>${em.position}</td>
        <td>${deptName}</td>
        <td>${formattedDate}</td>
        <td>
          <button type="button"  class="btn btn-outline-primary editEmpBtn" data-id=${em.id}>
            Edit
          </button>
          <button type="button"  class="btn btn-outline-danger delEmpBtn" data-id=${em.id}
            data-bs-toggle="modal"
            data-bs-target="#delete-confirm-modal-emp">
            Delete
          </button>
        </td>
      </tr>`;
      empTableCont.insertAdjacentHTML("beforeend", row);
    });
  } catch (error) {
    console.error("Error Occurred: ", error);
  }
}

export function openEmpDetailCont() {
  clearEmpForm();
  empDetailCont.classList.remove("d-none");
  populateDeptDropdown();

  const hireDateField = document.getElementById("emp_date");
  hireDateField.readOnly = false;
  hireDateField.classList.remove("bg-body-secondary");
}

export function closeEmpDetailCont() {
  clearEmpForm();
  empDetailCont.classList.add("d-none");
}

export function clearEmpForm() {
  const fields = empDetailCont.querySelectorAll('input[id*="emp_"]');
  fields.forEach((f) => {
    if (f.id === "emp_id") {
      f.value = "Employee ID read-only";
      return;
    }
    const suffix = f.id.replace("acc-", "");
    if (suffix === "check") {
      f.checked = false;
    } else {
      f.value = "";
    }
  });
}

export async function prefillEmpForm() {
  try {
    if (selectedId === null) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }
    const emp = await getEmployeeById(Number(selectedId));
    if (!emp) {
      showToast("User not found!", "danger");
      return;
    }
    openEmpDetailCont();
    const fields = empDetailCont.querySelectorAll(
      'input[id*="emp_"], select[id*="emp_"]',
    );

    fields.forEach(async (f) => {
      const dataKey = f.name;
      if (f.id === "emp_email") {
        const matchedAccount = await getUserById(Number(emp.user_id));
        if (matchedAccount) {
          f.value = matchedAccount.email;
        } else {
          f.value = "Account not found";
        }
        return;
      }
      if (emp[dataKey] !== undefined && emp[dataKey] !== null) {
        if (f.type === "date") {
          f.value = emp[dataKey].toString().split("T")[0];
        } else {
          f.value = emp[dataKey];
        }
      }
    });

    const hireDateField = document.getElementById("emp_date");
    hireDateField.readOnly = true;
    hireDateField.classList.add("bg-body-secondary");
  } catch (error) {
    console.error(error);
    showToast(error.message, "danger");
  }
}

export function saveOrEditEmployee(formData) {
  try {
    if (!formData.email?.trim()) {
      throw new Error("User email should not be empty.");
    }
    if (!formData.position?.trim()) {
      throw new Error("Position should not be empty.");
    }
    if (!formData.department_id || !formData.department_id.trim()) {
      throw new Error("Please select a department.");
    }
    if (!formData.hire_date?.trim()) {
      throw new Error("Please enter a hire date.");
    }

    if (!charactersOnly(formData.position.trim())) {
      throw new Error("Position contains numerical characters.");
    }
    const hireDate = new Date(formData.hire_date);
    if (isNaN(hireDate.getTime())) {
      throw new Error("Please enter a valid hire date.");
    }

    const todayDateStr = new Date().toLocaleDateString("en-CA");
    if (formData.hire_date > todayDateStr) {
      throw new Error("Hire date cannot be in the future.");
    }

    const user = window.db.accounts.find((u) => u.email === formData.email);
    if (!user) {
      throw new Error("User not found!");
    }
    const department = window.db.departments.find(
      (d) => d.id === Number(formData.department_id),
    );
    if (!department) {
      throw new Error("Department not found!");
    }
    const employees = window.db.employee;
    const empIdCount =
      employees.length === 0 ? 1 : employees[employees.length - 1].id + 1;

    if (selectedId === null) {
      const duplicateEmp = employees.find((em) => em.user_id === user.id);
      if (duplicateEmp) {
        throw new Error(`An employee record already exist.`);
      }
      const newEmp = {
        id: empIdCount,
        user_id: user.id,
        position: formData.position,
        department_id: department.id,
        hire_date: hireDate,
      };

      window.db.employee.push(newEmp);
    } else {
      const employee = window.db.employee.find(
        (em) => em.id === Number(selectedId),
      );

      if (!employee) {
        throw new Error("Employee is not found!");
      }
      employee.user_id = user.id;
      employee.position = formData.position;
      employee.department_id = department.id;
      employee.hire_date = hireDate;
    }
    selectedId = null;
    saveToStorage();
    renderEmployeeItems();
    closeEmpDetailCont();
  } catch (error) {
    console.error(error);
    showToast(error.message, "danger");
  }
}

export function populateDeptDropdown() {
  try {
    const deptDropdown = document.getElementById("emp_dept");
    deptDropdown.innerHTML =
      '<option value="" disabled selected>Select a department...</option>';

    window.db.departments.forEach((dept) => {
      const option = document.createElement("option");
      option.value = dept.id;
      option.textContent = dept.name;
      deptDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error Occurred: ", error);
  }
}

export function renderEmployeeDetails() {
  try {
    if (!selectedId) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }
    const modal_body = delEmpForm.querySelector(".modal-body");
    modal_body.innerHTML = "";

    const emp = window.db.employee.find((u) => u.id === Number(selectedId));

    if (!emp) {
      showToast("Account Not Found!", "danger");
    }
    const user = window.db.accounts.find((u) => u.id === Number(emp.user_id));

    if (!user) {
      showToast("Account Not Found!", "danger");
    }
    const department = window.db.departments.find(
      (d) => d.id === Number(emp.department_id),
    );
    if (!department) {
      showToast("Department not found!", "danger");
    }

    const dateObj = new Date(emp.hire_date);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            <div class="col-4 col-sm-3 fw-bold fs-5 text-secondary">Email:</div>
            <div class="col-8 col-sm-9 fs-5 text-break">${user.email}</div>
          </div>
          <div class="row mb-2 align-items-center">
            <div class="col-4 col-sm-3 fw-bold fs-5 text-secondary">Position:</div>
            <div class="col-8 col-sm-9 fs-5 text-break">${emp.position}</div>
          </div>
          <div class="row mb-2 align-items-center">
            <div class="col-4 col-sm-3 fw-bold fs-5 text-secondary">Department:</div>
            <div class="col-8 col-sm-9 fs-5 text-break">${department.name}</div>
          </div>
          <div class="row mb-2 align-items-center">
            <div class="col-4 col-sm-3 fw-bold fs-5 text-secondary">Hire Date:</div>
            <div class="col-8 col-sm-9 fs-5 text-break">${formattedDate}</div>
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

export function deleteEmployee() {
  try {
    if (selectedId === null) {
      showToast("There is no selected id, try again.", "warning");
      return;
    }

    const empIndex = window.db.employee.findIndex(
      (em) => em.id === Number(selectedId),
    );
    if (empIndex !== -1) {
      window.db.employee.splice(empIndex, 1);
      selectedId = null;
      saveToStorage();
      renderEmployeeItems();
      const modalInstance = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("delete-confirm-modal-emp"),
      );
      modalInstance.hide();
      showToast("Employee Deleted Successfully!", "success");
    } else {
      showToast("Employee Deletion Unsuccessful.", "danger");
      selectedId = null;
      return;
    }
  } catch (error) {
    console.error("An Error Occurred: ", error);
    showToast(error.message, "danger");
  }
}

export function initEmployees() {
  const empConfirmDeleteBtn = document.getElementById("confirm-delete-emp-btn");
  empConfirmDeleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    deleteEmployee();
  });

  empForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = getDataFromTarget(e);
    saveOrEditEmployee(data);
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
}
