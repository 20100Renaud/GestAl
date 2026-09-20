const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function getDeplacements() {
  const response = await fetch(`${API_URL}/deplacements`, {
    method: "GET",
    credentials: "include",
  });

  const data = await handleResponse(response);

  return data.deplacements;
}

export async function getDeplacement(id) {
  const response = await fetch(`${API_URL}/deplacements/${id}`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function createDeplacement(deplacement) {
  const response = await fetch(`${API_URL}/deplacements`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(deplacement),
  });

  return handleResponse(response);
}

export async function updateDeplacement(id, deplacement) {
  const response = await fetch(`${API_URL}/deplacements/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(deplacement),
  });

  return handleResponse(response);
}

export async function deleteDeplacement(id) {
  const response = await fetch(`${API_URL}/deplacements/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    return handleResponse(response);
  }

  return null;
}
