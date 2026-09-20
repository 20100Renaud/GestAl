const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function getTarifs() {
  const response = await fetch(`${API_URL}/tarifs`, {
    method: "GET",
    credentials: "include",
  });

  const data = await handleResponse(response);

  return data.tarifs;
}

export async function getTarif(id) {
  const response = await fetch(`${API_URL}/tarifs/${id}`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function createTarif(tarif) {
  const response = await fetch(`${API_URL}/tarifs`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tarif),
  });

  return handleResponse(response);
}

export async function updateTarif(id, tarif) {
  const response = await fetch(`${API_URL}/tarifs/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tarif),
  });

  return handleResponse(response);
}

export async function deleteTarif(id) {
  const response = await fetch(`${API_URL}/tarifs/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    return handleResponse(response);
  }

  return null;
}
