const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function getAnimaux() {
  const response = await fetch(`${API_URL}/animaux`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getAnimal(id) {
  const response = await fetch(`${API_URL}/animaux/${id}`, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function createAnimal(animal) {
  const response = await fetch(`${API_URL}/animaux`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(animal),
  });

  return handleResponse(response);
}

export async function updateAnimal(id, animal) {
  const response = await fetch(`${API_URL}/animaux/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(animal),
  });

  return handleResponse(response);
}

export async function deleteAnimal(id) {
  const response = await fetch(`${API_URL}/animaux/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    return handleResponse(response);
  }

  return null;
}
