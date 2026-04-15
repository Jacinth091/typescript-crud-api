import { backendConnection } from "../config.js";

async function login(userStr, password) {
  try {
    const response = await fetch(`${backendConnection}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userStr, password }),
    });
    const data = await response.json();
    // Token storage is handled by setSession() in script.js — do not store here.
    return data;
  } catch (error) {
    console.error("Network Error: ", error);
    return null;
  }
}

async function register(formData) {
  try {
    const response = await fetch(`${backendConnection}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    // Always return the parsed body so callers can read response.error on failure.
    return await response.json();
  } catch (error) {
    console.error("Network Error: ", error);
    return null;
  }
}

async function verifyEmail(email) {
  try {
    const response = await fetch(`${backendConnection}/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Network Error: ", error);
    return null;
  }
}

async function getProfile() {
  try {
    const token = sessionStorage.getItem("authToken");
    if (!token) return null;

    // Route is registered as GET /auth/profile
    const response = await fetch(`${backendConnection}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Token expired or invalid — signal to caller to clear session
      return { success: false, expired: true };
    }

    return await response.json();
  } catch (error) {
    console.error("Network Error: ", error);
    return null;
  }
}

export { login, register, verifyEmail, getProfile };
