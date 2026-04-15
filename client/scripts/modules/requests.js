import { showToast } from "./ui.js";
import { saveToStorage } from "./db.js";

const requestTableCont = document.getElementById("request-table-cont");
const requestForm = document.getElementById("request-form");
const requestItemContainer = document.getElementById("request-item-container");
const requestModal = document.getElementById("requestModal");

export function renderRequestItems(currentUser) {
  try {
    const requests = window.db.requests.filter(
      (r) => r.employeeEmail === currentUser.email,
    );
    requestTableCont.innerHTML = "";

    if (!requests || requests.length <= 0) {
      const row = `
        <tr>
          <td colspan="5" class="text-center bg-secondary-subtle">
            No requests yet.
          </td>
        </tr>`;
      requestTableCont.insertAdjacentHTML("beforeend", row);
      return;
    }

    requests.forEach((req) => {
      const dateObj = new Date(req.date);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      let badgeClass = "bg-warning text-dark";
      if (req.status === "Approved") {
        badgeClass = "bg-success";
      } else if (req.status === "Rejected") {
        badgeClass = "bg-danger";
      }

      const itemsList = req.items
        .map((item) => `${item.name} (x${item.qty})`)
        .join(", ");

      const row = `
      <tr>
        <th scope="row">${req.id}</th>
        <td>${req.type}</td>
        <td>${itemsList}</td>
        <td>${formattedDate}</td>
        <td><span class="badge ${badgeClass}">${req.status}</span></td>
      </tr>`;
      requestTableCont.insertAdjacentHTML("beforeend", row);
    });
  } catch (error) {
    console.error("Error Occurred: ", error);
  }
}

export function addRequestItem() {
  const newItemRow = `
  <div class="d-flex align-items-center gap-1 w-100 request-item-row">
    <div class="flex-grow-1">
      <input type="text" class="form-control request-item-name" placeholder="Item name">
    </div>
    <div class="w-25">
      <input type="number" class="form-control request-item-qty" placeholder="Qty" min="1">
    </div>
    <div>
      <button type="button" class="btn btn-danger remove-request-item-btn">&times;</button>
    </div>
  </div>`;
  requestItemContainer.insertAdjacentHTML("beforeend", newItemRow);
}

export function clearRequestForm() {
  requestForm.reset();
  requestItemContainer.innerHTML = `
    <div class="d-flex align-items-center gap-1 w-100 request-item-row">
      <div class="flex-grow-1">
        <input type="text" class="form-control request-item-name" placeholder="Item name">
      </div>
      <div class="w-25">
        <input type="number" class="form-control request-item-qty" placeholder="Qty" min="1">
      </div>
      <div>
        <button type="button" class="btn btn-secondary add-request-item-btn">+</button>
      </div>
    </div>`;
}

export function initRequests(currentUser) {
  requestItemContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("add-request-item-btn")) {
      addRequestItem();
    } else if (e.target.classList.contains("remove-request-item-btn")) {
      const row = e.target.closest(".request-item-row");
      row.remove();
    }
  });

  requestForm.addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      const type = document.getElementById("request-type").value;
      if (!type) {
        throw new Error("Please select a request type.");
      }

      const itemRows = requestItemContainer.querySelectorAll(".request-item-row");
      const items = [];

      itemRows.forEach((row) => {
        const name = row.querySelector(".request-item-name").value.trim();
        const qty = parseInt(row.querySelector(".request-item-qty").value);

        if (name && qty > 0) {
          items.push({ name, qty });
        }
      });

      if (items.length === 0) {
        throw new Error(
          "Please add at least one item with a valid name and quantity.",
        );
      }

      const requests = window.db.requests;
      const reqIdCount =
        requests.length === 0 ? 1 : requests[requests.length - 1].id + 1;

      const newRequest = {
        id: reqIdCount,
        type: type,
        items: items,
        status: "Pending",
        date: new Date().toISOString(),
        employeeEmail: currentUser.email,
      };

      window.db.requests.push(newRequest);
      saveToStorage();
      clearRequestForm();
      renderRequestItems(currentUser);
      bootstrap.Modal.getOrCreateInstance(requestModal).hide();
      showToast("Request submitted successfully!", "success");
    } catch (error) {
      console.error("An Error Occurred: ", error);
      showToast(error.message, "danger");
    }
  });
}
