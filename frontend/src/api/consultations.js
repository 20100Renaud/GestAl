const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function getConsultations() {
  const response = await fetch(`${API_URL}/consultations`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getConsultation(id) {
  const response = await fetch(`${API_URL}/consultations/${id}`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function createConsultation(data) {
  const response = await fetch(`${API_URL}/consultations`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function updateConsultation(id, data) {
  const response = await fetch(`${API_URL}/consultations/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function deleteConsultation(id) {
  const response = await fetch(`${API_URL}/consultations/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  return handleResponse(response);
}
