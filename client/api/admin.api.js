import { backendConnection } from '../config.js';
import { getHeaders } from './header.js';

/**
 * Maps frontend snake_case user data to backend camelCase formData format
 */
function mapUserToBackend(data) {
    return {
        formData: {
            firstName: data.first_name,
            middleName: data.middle_name,
            lastName: data.last_name,
            email: data.email,
            username: data.username,
            role: data.role,
            verified: data.verified,
            title: data.title || "Staff", // Title is required by the server model
            password: data.password,
            confirmPassword: data.confirm_password || data.password // Use password as fallback for confirmPassword
        }
    };
}

async function getUserById(id) {
    try {
        const response = await fetch(`${backendConnection}/users/${id}`, {
            method: "GET",
            headers: getHeaders()
        });
        return await response.json();
    } catch (error) {
        console.error("Network Error: ", error);
        return { success: false, error: "Network Error" };
    }
}

async function getAccountsList() {
    try {
        const response = await fetch(`${backendConnection}/users/`, {
            method: "GET",
            headers: getHeaders()
        });
        return await response.json();
    } catch (error) {
        console.error("Network Error: ", error);
        return { success: false, error: "Network Error" };
    }
}

async function createAccount(accountData) {
    try {
        const response = await fetch(`${backendConnection}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getHeaders()
            },
            body: JSON.stringify(mapUserToBackend(accountData))
        });
        return await response.json();
    } catch (error) {
        console.error("Network Error: ", error);
        return { success: false, error: "Network Error" };
    }
}

async function editAccount(id, accountData) {
    try {
        const response = await fetch(`${backendConnection}/users/${id}`, {
            method: "PUT", // Server uses PUT for update in user.route.ts
            headers: {
                "Content-Type": "application/json",
                ...getHeaders()
            },
            body: JSON.stringify(mapUserToBackend(accountData))
        });
        return await response.json();
    } catch (error) {
        console.error("Network Error: ", error);
        return { success: false, error: "Network Error" };
    }
}

async function deleteAccount(id) {
    try {
        const response = await fetch(`${backendConnection}/users/${id}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        return await response.json();
    } catch (error) {
        console.error("Network Error: ", error);
        return { success: false, error: "Network Error" };
    }
}

async function resetAccountPassword(id, passwordData) {
    try {
        // The server's update method handles password changes
        const payload = {
            formData: {
                password: passwordData.password,
                confirmPassword: passwordData.confirm_password
            }
        };
        const response = await fetch(`${backendConnection}/users/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getHeaders()
            },
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (error) {
        console.error("Network Error: ", error);
        return { success: false, error: "Network Error" };
    }
}

export { getUserById, getAccountsList, createAccount, editAccount, deleteAccount, resetAccountPassword };
