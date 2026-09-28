const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function getConsultationZonages(consultationId) {
  const response = await fetch(
    `${API_URL}/consultation-zonages/${consultationId}/zonages`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  return handleResponse(response);
}

export async function createConsultationZonage(consultationId, data) {
  const response = await fetch(
    `${API_URL}/consultation-zonages/${consultationId}/zonages`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  return handleResponse(response);
}

export async function updateConsultationZonage(consultationId, zonageId, data) {
  const response = await fetch(
    `${API_URL}/consultation-zonages/${consultationId}/zonages/${zonageId}`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  return handleResponse(response);
}

export async function deleteConsultationZonage(consultationId, zonageId) {
  const response = await fetch(
    `${API_URL}/consultation-zonages/${consultationId}/zonages/${zonageId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    return handleResponse(response);
  }

  return null;
}
