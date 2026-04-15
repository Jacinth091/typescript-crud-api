import { login, register, verifyEmail } from "../../api/auth.api.js";
import { showToast, configureNavbar } from "./ui.js";
import { saveToStorage } from "./db.js";
import { navigateTo } from "./router.js";

export let currentUser = null;

export function setAuthState(isAuth, user) {
  const body = document.body;
  if (!isAuth) {
    body.className = "not_authenticated";
    body.classList.remove("is-admin");
    currentUser = null;
    return;
  }

  currentUser = user;

  body.className = "authenticated";
  if (user.role === "admin") {
    body.classList.add("is-admin");
  }
}

export async function loginHandler(e, renderProfile) {
  e.preventDefault();
  try {
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const response = await login(data.userStr, data.password);
    if (!response || !response.success) {
      showToast(response.error || "Invalid Credentials", "danger");
    } else {
      setAuthState(response.success, response.user);
      configureNavbar(response.success, response.user);
      if (renderProfile) renderProfile();
      navigateTo("#/profile");
      showToast("Logged In Successfully!", "success");
    }
  } catch (error) {
    console.error("An error occurred: ", error);
    showToast(error.message || error, "danger");
  }
}

export async function registerHandler(e) {
  e.preventDefault();
  try {
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    console.log(data);

    if (data.password !== data.confirm_password) {
      showToast("Passwords do not match!", "danger");
      return;
    }

    const formattedData = {
      username: data.username,
      email: data.email,
      first_name: data.firstname,
      last_name: data.lastname,
      middle_name: data.middlename,
      password: data.password,
    }
    const response = await register(formattedData);

    if (!response) {
      showToast(response.error || "Registration Failed", "danger");
    } else {
      console.log("Hellow");
      console.log("Response User: ", response);
      console.log("Response Email: ", response.data.email);
      localStorage.setItem("unverified_email", response.data.email);
      navigateTo("#/verify");
      showToast("Registered Successfully!", "success");
    }


    // const uniqueEmail = window.db.accounts.find(
    //   (em) => em.email === data.email,
    // );
    // if (uniqueEmail) {
    //   showToast("Email is already taken!", "warning");
    //   return;
    // }
    // const newUser = {
    //   id: Date.now(),
    //   first_name: data.firstname,
    //   last_name: data.lastname,
    //   email: data.email,
    //   password: data.password,
    //   verified: false,
    //   role: "User",
    // };
    // window.db.accounts.push(newUser);

    // saveToStorage();

  } catch (error) {
    console.error("An error occurred: ", error);
  }
}

export function logout() {
  console.log("Logging out...");
  localStorage.removeItem("auth_token");
  setAuthState(false, null);
  configureNavbar(false, null);
  navigateTo("#/home");
}

export async function verifyEmailHandler() {
  try {
    const userEmail = localStorage.getItem("unverified_email");
    if (!userEmail) {
      showToast("No stored email to verify");
      navigateTo("#/home");
    }
    const response = await verifyEmail(userEmail);
    if (!response) {
      showToast(response.error || "Email Verification Failed", "danger");
      throw new Error(response.error);
    } else {
      console.log("Response: ", response);
      localStorage.removeItem("unverified_email");
      showToast("Email Verified Successfully!", "success");
      navigateTo("#/login");
    }
  } catch (error) {
    console.error("An error ocurred: ", error);
    showToast(error.message || error, "danger");
  }
}
