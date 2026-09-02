const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "zeo_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Cannot reach the API. Is the backend running on port 8000?", 0);
  }

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail) && detail[0]?.msg
          ? detail[0].msg
          : `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }
  return payload;
}

function qs(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, value);
  });
  const str = search.toString();
  return str ? `?${str}` : "";
}

/** Unauthenticated marketplace tier — never sends a token. */
export const publicApi = {
  stats: () => request("/api/public/stats", { auth: false }),
  trades: () => request("/api/public/trades", { auth: false }),
  jobs: (filters) => request(`/api/public/jobs${qs(filters)}`, { auth: false }),
  job: (id) => request(`/api/public/jobs/${id}`, { auth: false }),
  workers: (filters) => request(`/api/public/workers${qs(filters)}`, { auth: false }),
  worker: (id) => request(`/api/public/workers/${id}`, { auth: false }),
  companies: () => request("/api/public/companies", { auth: false }),
};

export const api = {
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: { email, password }, auth: false }),
  me: () => request("/api/auth/me"),

  trades: () => request("/api/trades"),
  meta: () => request("/api/meta"),

  jobs: (filters) => request(`/api/jobs${qs(filters)}`),
  job: (id) => request(`/api/jobs/${id}`),
  createJob: (body) => request("/api/jobs", { method: "POST", body }),
  updateJob: (id, body) => request(`/api/jobs/${id}`, { method: "PATCH", body }),
  jobApplications: (id) => request(`/api/jobs/${id}/applications`),

  workers: (filters) => request(`/api/workers${qs(filters)}`),
  worker: (id) => request(`/api/workers/${id}`),

  apply: (jobId, note) => request("/api/applications", { method: "POST", body: { job_id: jobId, note } }),
  myApplications: () => request("/api/applications/me"),
  updateApplication: (id, status) =>
    request(`/api/applications/${id}`, { method: "PATCH", body: { status } }),

  buyerDashboard: () => request("/api/dashboard/buyer"),
  sellerDashboard: () => request("/api/dashboard/seller"),
  adminDashboard: () => request("/api/dashboard/admin"),

  verifications: (status = "pending") => request(`/api/admin/verifications${qs({ status })}`),
  setVerification: (workerId, action) =>
    request(`/api/admin/workers/${workerId}/verification`, { method: "PATCH", body: { action } }),
  adminJobs: () => request("/api/admin/jobs"),
};
