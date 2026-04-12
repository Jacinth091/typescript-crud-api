import { showToast } from "./ui.js";

export function renderProfile(currentUser) {
  const accountName = document.getElementById("user-name");
  const accountEmail = document.getElementById("user-email");
  const accountUsername = document.getElementById('user-username');
  const accountRole = document.getElementById("user-role");
  const editButton = document.getElementById("edit-profile");

  if (!currentUser) return;

  const name = currentUser.first_name + " " + currentUser.last_name;

  if (accountName) accountName.innerText = name;
  if (accountEmail) accountEmail.innerText = currentUser.email;
  if (accountUsername) accountUsername.innerText = currentUser.username;
  if (accountRole) accountRole.innerText = currentUser.role;

  if (editButton) {
    editButton.onclick = () => {
      showToast("Not Implemented Yet, Tehee :>", "info");
    };
  }
}
