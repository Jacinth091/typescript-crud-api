import { showToast, configureNavbar } from "./ui.js";
import { renderAccountsList } from "./accounts.js";
import { renderDepartmentItems } from "./departments.js";
import { renderEmployeeItems } from "./employees.js";
import { renderRequestItems } from "./requests.js";

export function navigateTo(hash) {
  window.location.hash = hash;
}

export function handleRouting(currentUser, renderCallbacks = {}) {
  let currentHash = window.location.hash;

  if (currentHash === "" || currentHash === "#/") {
    currentHash = "#/home";
    configureNavbar(false, null);
  }
  const targId = "#" + currentHash.replace("#/", "");

  const isAuthenticated = document.body.classList.contains("authenticated");

  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  if (!isAuthenticated && authenticatedRoutes(targId)) {
    showToast("You are not authenticated, please login first.", "warning");
    window.location.hash = "#/home";
    return;
  }
  const isUserAdmin = currentUser?.role === "admin";

  if (isAuthenticated && !isUserAdmin && adminPages(targId)) {
    showToast("Invalid Request. Unauthorized User.", "danger");
    window.location.hash = isAuthenticated ? "#/profile" : "#/home";
    return;
  }

  if (isAuthenticated && isUserAdmin && userOnlyPages(targId)) {
    showToast("This page is only available for User accounts.", "warning");
    window.location.hash = "#/profile";
    return;
  }
  try {
    const matchingPage = document.querySelector(targId);
    console.log(matchingPage);
    console.log(targId);
    if (matchingPage) {
      matchingPage.classList.add("active");

      if (currentUser) {
        if (targId === "#account") {
          renderAccountsList();
        } else if (targId === "#department") {
          renderDepartmentItems();
        } else if (targId === "#employee") {
          console.log("Employeeeeeeesss");
          renderEmployeeItems();
        } else if (targId === "#request") {
          renderRequestItems(currentUser);
        }
      }
    } else {
      console.warn("Page not found!");
      window.location.hash = isAuthenticated ? "#/profile" : "#/home";
    }
  } catch (error) {
    console.error("Invalid hash", targId);
    window.location.hash = "#/home";
    configureNavbar(false, null);
  }
}

export function authenticatedRoutes(hash) {
  return (
    hash === "#profile" ||
    hash === "#account" ||
    hash === "#employee" ||
    hash === "#department" ||
    hash === "#request"
  );
}

export function adminPages(hash) {
  return hash === "#account" || hash === "#employee" || hash === "#department";
}

export function userOnlyPages(hash) {
  return hash === "#request";
}
