import { backendConnection } from "../config.js";
import { getHeaders } from "./header.js";



async function getEmployeeList() {
    try {
        const response = await fetch(`${backendConnection}/employee/`, {
            method: "GET",
            headers: getHeaders()
        });

        const data = await response.json();
        console.log("Response from backend: ", data);
        if (response.ok) {
            return data;
        } else {
            return data;
        }
    } catch (error) {
        console.error("Network Error: ", error);
        return null;
    }
}

async function getEmployeeById(id) {
    try {
        const response = await fetch(`${backendConnection}/employee/${id}`, {
            method: "GET",
            headers: getHeaders()
        });

        const data = await response.json();
        console.log("Response from backend: ", data);
        if (response.ok) {
            return data;
        } else {
            return data;
        }
    } catch (error) {
        console.error("Network Error: ", error);
        return null;
    }
}

async function addNewEmployee(formData) {
    try {
        const response = await fetch(`${backendConnection}/employee/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getHeaders()
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log("Response from backend: ", data);
        if (response.ok) {
            return data;
        } else {
            return data;
        }
    } catch (error) {
        console.error("Network Error: ", error);
        return null;
    }
}

async function editEmployee(id, updates) {
    try {
        const response = await fetch(`${backendConnection}/employee/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...getHeaders()
            },
            body: JSON.stringify(updates)
        });

        const data = await response.json();
        console.log("Response from backend: ", data);
        if (response.ok) {
            return data;
        } else {
            return data;
        }
    } catch (error) {
        console.error("Network Error: ", error);
        return null;
    }
}

async function deleteEmployee(id) {
    try {
        const response = await fetch(`${backendConnection}/employee/${id}`, {
            method: "DELETE",
            headers: getHeaders()
        });

        const data = await response.json();
        console.log("Response from backend: ", data);
        if (response.ok) {
            return data;
        } else {
            return data;
        }
    } catch (error) {
        console.error("Network Error: ", error);
        return null;
    }
}

export { getEmployeeList, getEmployeeById, addNewEmployee, editEmployee, deleteEmployee };
