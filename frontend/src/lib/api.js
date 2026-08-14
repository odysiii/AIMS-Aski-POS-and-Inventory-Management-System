/**
 * Single place that knows where the API lives and how to talk to it.
 *
 * Before this existed, `http://localhost:5000` was hardcoded at four call sites
 * inside cashierPOS.jsx, which made a per-branch deployment impossible.
 */

export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';

export const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || 'dev';

/** Error carrying the HTTP status so callers can branch on 404 vs 500. */
export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
  } catch {
    // fetch() only rejects on network failure, so this is always "server unreachable".
    throw new ApiError(
      `Cannot reach the server at ${API_BASE}. Is the backend running?`,
      0,
      null
    );
  }

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      (body && (body.message || body.error)) ||
      `Request failed (${response.status} ${response.statusText})`;
    throw new ApiError(message, response.status, body);
  }

  return body;
}

export const apiGet = (path) => request(path, { method: 'GET' });

export const apiPost = (path, payload) =>
  request(path, { method: 'POST', body: JSON.stringify(payload) });

export const apiPut = (path, payload) =>
  request(path, { method: 'PUT', body: JSON.stringify(payload) });

export const apiDelete = (path) => request(path, { method: 'DELETE' });
