async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed')
    error.response = { data }
    throw error
  }

  return data
}

export async function registerUser(payload) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: payload,
  })
}

export async function loginUser(payload) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: payload,
  })
}

export async function fetchCurrentUser(token) {
  return apiRequest('/api/auth/me', { token })
}

export async function submitDisposal(payload, token) {
  return apiRequest('/api/dispose', {
    method: 'POST',
    body: payload,
    token,
  })
}

export async function fetchDisposals(token) {
  const data = await apiRequest('/api/disposals', { token })
  return data.events ?? []
}

export async function fetchAdminOverview(token) {
  const data = await apiRequest('/api/admin/overview', { token })
  return data.overview
}