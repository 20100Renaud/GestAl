const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function getPrestations() {
  const response = await fetch(`${API_URL}/prestations`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getPrestation(id) {
  const response = await fetch(`${API_URL}/prestations/${id}`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function createPrestation(data) {
  const response = await fetch(`${API_URL}/prestations`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function updatePrestation(id, data) {
  const response = await fetch(`${API_URL}/prestations/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function deletePrestation(id) {
  const response = await fetch(`${API_URL}/prestations/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse(response);
}
