export function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const icons = {
    success: "bi-check-circle-fill",
    danger: "bi-x-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
  };
  const icon = icons[type] || icons.info;
  const id = "toast-" + Date.now();
  const toastHTML = `
    <div id="${id}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${icon}"></i> ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>`;
  container.insertAdjacentHTML("beforeend", toastHTML);
  const toastEl = document.getElementById(id);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

export function configureNavbar(isAuth, user) {
  const authLink = document.getElementById("auth-link");
  const userLink = document.getElementById("user-link");
  const nameHolder = document.getElementById("name-holder");

  if (!isAuth) {
    authLink.classList.remove("d-none");
    authLink.classList.add("d-flex");
    userLink.classList.add("d-none");
    return;
  } else {
    authLink.classList.add("d-none");
    authLink.classList.remove("d-flex");
    userLink.classList.remove("d-none");
  }
  if (user && user.first_name) {
    nameHolder.textContent = user.first_name;
  }
  const adminItems = document.querySelectorAll("#drop-menu .role-admin");

  adminItems.forEach((item) => {
    if (user && user.role === "admin") {
      item.classList.remove("d-none");
    } else {
      item.classList.add("d-none");
    }
  });

  const userItems = document.querySelectorAll("#drop-menu .role-user");

  userItems.forEach((item) => {
    if (user && user.role !== "admin") {
      item.classList.remove("d-none");
    } else {
      item.classList.add("d-none");
    }
  });
}

export function initializePasswordToggles() {
  const passwordFields = document.querySelectorAll(".password-toggleable");

  passwordFields.forEach((input) => {
    // Avoid double-wrapping
    if (input.dataset.toggled === "true") return;
    input.dataset.toggled = "true";

    const wrapper = document.createElement("div");
    wrapper.className = "input-group";
    input.parentNode.insertBefore(wrapper, input);

    wrapper.appendChild(input);
    wrapper.insertAdjacentHTML(
      "beforeend",
      `
      <button class="btn btn-outline-secondary" type="button">
        <i class="bi bi-eye"></i>
      </button>
    `,
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
