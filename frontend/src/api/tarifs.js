const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// Read all
export async function getTarifs() {
  const response = await fetch(`${API_URL}/tarifs`, {
    method: "GET",
    credentials: "include",
  });

  const data = await handleResponse(response);

  return data.tarifs;
}

// Read by ID
export async function getTarif(id) {
  const response = await fetch(`${API_URL}/tarifs/${id}`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

// Create
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

// Update
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

// Delete
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

// Copy
export async function copyTarifs(sourceYear, targetYear) {
  const response = await fetch(`${API_URL}/tarifs/copy`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sourceYear: Number(sourceYear),
      targetYear: Number(targetYear),
    }),
  });

  return handleResponse(response);
}
