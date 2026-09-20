const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function getPaiements() {
  const response = await fetch(`${API_URL}/paiements`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getPaiement(id) {
  const response = await fetch(`${API_URL}/paiements/${id}`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function createPaiement(paiement) {
  const response = await fetch(`${API_URL}/paiements`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paiement),
  });

  return handleResponse(response);
}

export async function updatePaiement(id, paiement) {
  const response = await fetch(`${API_URL}/paiements/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paiement),
  });

  return handleResponse(response);
}

export async function deletePaiement(id) {
  const response = await fetch(`${API_URL}/paiements/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    return handleResponse(response);
  }

  return null;
}
