import { showToast } from "./ui.js";

const deptTableCont = document.getElementById("dept-table-cont");
const addDeptButton = document.getElementById("add-department");

export function renderDepartmentItems() {
  try {
    const departments = window.db.departments;
    deptTableCont.innerHTML = "";

    if (departments.length <= 0 || !departments) {
      const row = `
      <td colspan="5" class="text-center bg-secondary-subtle">
        No department.
      </td>
      `;
      deptTableCont.insertAdjacentHTML("beforeend", row);
      return;
    }
    departments.forEach((d) => {
      let row = `
      <tr>
        <td>${d.name}</td>
        <td>${d.description}</td>
        <td>
          <button type="button" class="btn btn-outline-primary" data-id=${d.id}>
            Edit
          </button>
          <button type="button" class="btn btn-outline-danger" data-id=${d.id}>
            Delete
          </button>
        </td>
      </tr>
      `;
      deptTableCont.insertAdjacentHTML("beforeend", row);
    });
  } catch (error) {
    console.error("Error Occurred: ", error);
  }
}

export function initDepartments() {
  addDeptButton.onclick = () => {
    showToast("Not Implemented Yet", "info");
  };
}
