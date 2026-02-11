const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// Dashboard summary for invoices
export async function getFinanceSummary(token) {
  try {
    const res = await fetch(`${API_BASE}/invoices/summary/`, {
      cache: "no-cache",
      headers: authHeaders(token),
    });

    if (!res.ok) {
      return {
        today_income: 0,
        invoice_count: 0,
        total_sales: 0,
      };
    }

    return await res.json();
  } catch (err) {
    return {
      today_income: 0,
      invoice_count: 0,
      total_sales: 0,
    };
  }
}

// Invoices CRUD
export async function getInvoices(token) {
  try {
    const res = await fetch(`${API_BASE}/invoices/`, { cache: "no-cache", headers: authHeaders(token) });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getInvoice(id, token) {
  const res = await fetch(`${API_BASE}/invoices/${id}/`, { cache: "no-cache", headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load invoice");
  return res.json();
}

export async function createInvoice(payload, token) {
  const res = await fetch(`${API_BASE}/invoices/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create invoice");
  return res.json();
}

export async function updateInvoice(id, payload, token) {
  const res = await fetch(`${API_BASE}/invoices/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update invoice");
  return res.json();
}

export async function deleteInvoice(id, token) {
  const res = await fetch(`${API_BASE}/invoices/${id}/`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to delete invoice");
  return true;
}

// Core: Users & Settings (requires auth token to be appended if protected)
export async function getUsers(token) {
  const res = await fetch(`${API_BASE}/users/`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}
export async function getCurrentUser(token) {
  const res = await fetch(`${API_BASE}/users/me/`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load current user");
  return res.json();
}

export async function refreshAccessToken(refreshToken) {
  const res = await fetch(`${API_BASE}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  if (!res.ok) throw new Error("Failed to refresh token");
  return res.json();
}
export async function createUser(payload, token) {
  const res = await fetch(`${API_BASE}/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}
export async function updateUser(id, payload, token) {
  const res = await fetch(`${API_BASE}/users/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}
export async function deleteUser(id, token) {
  const res = await fetch(`${API_BASE}/users/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return true;
}
export async function changePassword(payload, token) {
  const res = await fetch(`${API_BASE}/users/change-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = "Failed to change password";
    try {
      const data = await res.json();
      detail = data?.detail || data?.old_password?.[0] || detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export async function resetPassword(payload) {
  const res = await fetch(`${API_BASE}/users/reset-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = "Failed to reset password";
    try {
      const data = await res.json();
      detail = data?.detail || detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export async function getUserProfile(token) {
  const res = await fetch(`${API_BASE}/users/profile/`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

export async function updateUserProfile(formData, token) {
  const res = await fetch(`${API_BASE}/users/profile/`, {
    method: "PATCH",
    headers: { ...authHeaders(token) },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}
export async function getCompanySettings(token) {
  const res = await fetch(`${API_BASE}/settings/company/`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}
export async function updateCompanySettings(payload, token) {
  const res = await fetch(`${API_BASE}/settings/company/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return res.json();
}

// Products
export async function getProducts(token) {
  const res = await fetch(`${API_BASE}/products/`, { headers: authHeaders(token), cache: "no-cache" });
  if (!res.ok) return [];
  return res.json();
}

export async function createProduct(payload, token) {
  const res = await fetch(`${API_BASE}/products/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function updateProduct(id, payload, token) {
  const res = await fetch(`${API_BASE}/products/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function deleteProduct(id, token) {
  const res = await fetch(`${API_BASE}/products/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return true;
}

// Finance
export async function getFinanceReport(token, params) {
  const qs = buildQuery(params);
  const res = await fetch(`${API_BASE}/finance/report/${qs}`, { headers: authHeaders(token), cache: "no-cache" });
  if (!res.ok) {
    return { total_sales: 0, total_expenses: 0, profit: 0, total_invoices: 0, top_products: [] };
  }
  return res.json();
}

export async function getFinanceMonthly(token, params) {
  const qs = buildQuery(params);
  const res = await fetch(`${API_BASE}/finance/monthly/${qs}`, { headers: authHeaders(token), cache: "no-cache" });
  if (!res.ok) return [];
  return res.json();
}

export async function getExpenses(token, params) {
  const qs = buildQuery(params);
  const res = await fetch(`${API_BASE}/finance/expenses/${qs}`, { headers: authHeaders(token), cache: "no-cache" });
  if (!res.ok) return [];
  return res.json();
}

export async function createExpense(payload, token) {
  const res = await fetch(`${API_BASE}/finance/expenses/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create expense");
  return res.json();
}

export async function deleteExpense(id, token) {
  const res = await fetch(`${API_BASE}/finance/expenses/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete expense");
  return true;
}

// Projects (gallery + uploads)
export async function getProjects(token) {
  const res = await fetch(`${API_BASE}/projects/`, { headers: authHeaders(token), cache: "no-cache" });
  if (!res.ok) return [];
  return res.json();
}

export async function createProject(formData, token) {
  const res = await fetch(`${API_BASE}/projects/`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function deleteProject(id, token) {
  const res = await fetch(`${API_BASE}/projects/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete project");
  return true;
}

// Services
export async function getServices(token) {
  const res = await fetch(`${API_BASE}/services/`, { headers: authHeaders(token), cache: "no-cache" });
  if (!res.ok) return [];
  return res.json();
}

export async function createService(payload, token) {
  const res = await fetch(`${API_BASE}/services/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create service");
  return res.json();
}

export async function updateService(id, payload, token) {
  const res = await fetch(`${API_BASE}/services/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update service");
  return res.json();
}

export async function deleteService(id, token) {
  const res = await fetch(`${API_BASE}/services/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete service");
  return true;
}

// Employees (students)
export async function getEmployees(token) {
  const res = await fetch(`${API_BASE}/employees/`, { headers: authHeaders(token), cache: "no-cache" });
  if (!res.ok) return [];
  return res.json();
}
export async function createEmployee(payload, token) {
  const res = await fetch(`${API_BASE}/employees/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create employee");
  return res.json();
}
export async function updateEmployee(id, payload, token) {
  const res = await fetch(`${API_BASE}/employees/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update employee");
  return res.json();
}
export async function deleteEmployee(id, token) {
  const res = await fetch(`${API_BASE}/employees/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete employee");
  return true;
}
