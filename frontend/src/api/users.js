const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function getUsers() {
  const response = await fetch(`${API_URL}/users`, {
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getUser(id) {
  const response = await fetch(`${API_URL}/users/${encodeURIComponent(id)}`, {
    credentials: "include",
  });

  return handleResponse(response);
}

export async function createUser(userData) {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
}

export async function updateUser(id, userData) {
  const response = await fetch(`${API_URL}/users/${encodeURIComponent(id)}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
}

export async function deleteUser(id) {
  const response = await fetch(`${API_URL}/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getMyProfile() {
  const response = await fetch(`${API_URL}/auth/profile`, {
    credentials: "include",
  });

  return handleResponse(response);
}

export async function updateMyProfile(profileData) {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  return handleResponse(response);
}