const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function getZonages() {
  const response = await fetch(`${API_URL}/zonages`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getZonage(id) {
  const response = await fetch(`${API_URL}/zonages/${id}`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function createZonage(zonage) {
  const response = await fetch(`${API_URL}/zonages`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(zonage),
  });

  return handleResponse(response);
}

export async function updateZonage(id, zonage) {
  const response = await fetch(`${API_URL}/zonages/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(zonage),
  });

  return handleResponse(response);
}

export async function deleteZonage(id) {
  const response = await fetch(`${API_URL}/zonages/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    return handleResponse(response);
  }

  return null;
}
