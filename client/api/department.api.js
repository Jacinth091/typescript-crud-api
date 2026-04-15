import { backendConnection } from "../config.js";
import { getHeaders } from './header.js'

async function getDepartmentList() {
    try {
        const response = await fetch(`${backendConnection}/department/`, {
            method: "GET",
            headers: getHeaders()
        });
        return await response.json();
    } catch (error) {
        console.error("Network Error: ", error);
        return { success: false, error: "Network Error" };
    }
}

async function getDepartmentById(id) {
    try {
        const response = await fetch(`${backendConnection}/department/${id}`, {
            method: "GET",
            headers: getHeaders()
        });
        return await response.json();
    } catch (error) {
        console.error("Network Error: ", error);
        return { success: false, error: "Network Error" };
    }
}

async function createDepartment(departmentData) {
    try {
        const response = await fetch(`${backendConnection}/department`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getHeaders()
            },
            body: JSON.stringify(departmentData)
        });
        return await response.json();
    } catch (error) {
        console.error("Network Error: ", error);
        return { success: false, error: "Network Error" };
    }
}

async function editDepartment(id, departmentData) {
    try {
        const response = await fetch(`${backendConnection}/department/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...getHeaders()
            },
            body: JSON.stringify(departmentData)
        });
        return await response.json();
    } catch (error) {
        console.error("Network Error: ", error);
        return { success: false, error: "Network Error" };
    }
}

async function deleteDepartment(id) {
    try {
        const response = await fetch(`${backendConnection}/department/${id}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        return await response.json();
    } catch (error) {
        console.error("Network Error: ", error);
        return { success: false, error: "Network Error" };
    }
}

export { 
    getDepartmentList, 
    getDepartmentById, 
    createDepartment, 
    editDepartment, 
    deleteDepartment 
};
