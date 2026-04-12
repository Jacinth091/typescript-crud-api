export const STORAGE_KEY = "ipt_demo_v1";

export function saveToStorage() {
  const data = JSON.stringify(window.db);
  localStorage.setItem(STORAGE_KEY, data);
}

export function loadFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  console.log("data", data);
  if (data) {
    window.db = JSON.parse(data);
  } else {
    window.db = {
      accounts: [
        {
          id: Date.now(),
          first_name: "Admin User",
          last_name: "Admin",
          email: "admin@example.com",
          password: "Password123!",
          verified: true,
          role: "admin",
        },
      ],
      departments: [
        {
          id: Date.now(),
          name: "Engineer",
          description: "Software Team",
        },
        {
          id: Date.now(),
          name: "HR",
          description: "Human Resources",
        },
      ],
      employee: [],
      requests: [],
    };
  }
  if (!window.db.requests) {
    window.db.requests = [];
  }
  saveToStorage();
}
