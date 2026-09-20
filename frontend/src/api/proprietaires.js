const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function getProprietaires() {
  const response = await fetch(`${API_URL}/proprietaires`, {
    method: "GET",
    credentials: "include",
  });

  const data = await handleResponse(response);

  return data.proprietaires;
}

export async function getProprietaire(id) {
  const response = await fetch(`${API_URL}/proprietaires/${id}`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function createProprietaire(data) {
  const response = await fetch(`${API_URL}/proprietaires`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function updateProprietaire(id, data) {
  const response = await fetch(`${API_URL}/proprietaires/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function deleteProprietaire(id) {
  const response = await fetch(`${API_URL}/proprietaires/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse(response);
}
