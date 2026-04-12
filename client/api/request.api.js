import { backendConnection } from "../config.js";
import { getHeaders } from "./header.js";

export async function getRequestList() {
  try {
    const response = await fetch(`${backendConnection}/request`, {
      method: "GET",
      headers: getHeaders(),
    });
    const data = await response.json();
    console.log("Response from backend: ", data);
    return data;
  } catch (error) {
    console.error("Network Error: ", error);
    return null;
  }
}

export async function createRequest(requestData) {
  try {
    const response = await fetch(`${backendConnection}/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(requestData),
    });
    const data = await response.json();
    console.log("Response from backend: ", data);
    return data;
  } catch (error) {
    console.error("Network Error: ", error);
    return null;
  }
}

export async function deleteRequest(id) {
  try {
    const response = await fetch(`${backendConnection}/request/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
    });
    const data = await response.json();
    console.log("Response from backend: ", data);
    return data;
  } catch (error) {
    console.error("Network Error: ", error);
    return null;
  }
}
