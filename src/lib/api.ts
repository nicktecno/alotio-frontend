const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const BACKEND_URL = API_URL.replace(/\/api$/, '');

export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let isRefreshing = false;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    ...((customHeaders as Record<string, string>) || {}),
  };

  if (!(rest.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers,
    credentials: 'include',
    ...rest,
  });

  if (!res.ok) {
    if (res.status === 401 && !isRefreshing && !endpoint.startsWith('/auth/') && typeof window !== 'undefined') {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (refreshRes.ok) {
          isRefreshing = false;
          const retry = await fetch(`${API_URL}${endpoint}`, {
            headers,
            credentials: 'include',
            ...rest,
          });
          if (retry.ok) {
            if (retry.status === 204) return {} as T;
            return retry.json();
          }
        }
      } catch {
        // Refresh failed
      }
      isRefreshing = false;
      const isAuthEndpoint = endpoint.startsWith('/auth/');
      if (!isAuthEndpoint) {
        window.location.href = '/login';
      }
      throw new ApiError(401, 'Sessão expirada');
    }
    const body = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new ApiError(res.status, body.message || `Erro ${res.status}`);
  }

  if (res.status === 204) return {} as T;

  return res.json();
}

export const api = {
  // Auth
  register: (data: { email: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<{ user: { id: string; email: string; role: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(data) },
    ),

  logout: () => request('/auth/logout', { method: 'POST' }),

  me: () => request<{ id: string; email: string; role: string }>('/auth/me'),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  // Profiles
  createProfile: (formData: FormData) =>
    request('/profiles', { method: 'POST', body: formData }),

  getMyProfile: () => request('/profiles/me'),

  updateMyProfile: (data: Record<string, unknown>) =>
    request('/profiles/me', { method: 'PATCH', body: JSON.stringify(data) }),

  deleteMyProfile: () =>
    request('/profiles/me', { method: 'DELETE' }),

  updateDocument: (formData: FormData) =>
    request('/profiles/me/document', { method: 'PATCH', body: formData }),

  confirmActive: () =>
    request('/profiles/me/confirm-active', { method: 'POST' }),

  getMySchools: () => request('/profiles/me/schools'),

  updateMySchools: (schoolIds: string[]) =>
    request('/profiles/me/schools', { method: 'PUT', body: JSON.stringify({ schoolIds }) }),

  getMyNeighborhoods: () => request('/profiles/me/neighborhoods'),

  updateMyNeighborhoods: (neighborhoodIds: string[]) =>
    request('/profiles/me/neighborhoods', {
      method: 'PUT',
      body: JSON.stringify({ neighborhoodIds }),
    }),

  // Uploads
  uploadAvatar: (formData: FormData) =>
    request('/profiles/me/avatar', { method: 'POST', body: formData }),

  deleteAvatar: () =>
    request('/profiles/me/avatar', { method: 'DELETE' }),

  getVehiclePhotos: () => request('/profiles/me/photos'),

  uploadVehiclePhoto: (formData: FormData) =>
    request('/profiles/me/photos', { method: 'POST', body: formData }),

  deleteVehiclePhoto: (photoId: string) =>
    request(`/profiles/me/photos/${photoId}`, { method: 'DELETE' }),

  reorderPhotos: (photoIds: string[]) =>
    request('/profiles/me/photos/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ photoIds }),
    }),

  // Public - States, Cities, Schools, Neighborhoods
  getStates: () => request('/states'),
  getStateByUf: (uf: string) => request(`/states/${uf}`),
  getCities: (stateId?: string, withTios?: boolean) => {
    const params = new URLSearchParams();
    if (stateId) params.set('stateId', stateId);
    if (withTios) params.set('withTios', 'true');
    const qs = params.toString();
    return request(`/cities${qs ? `?${qs}` : ''}`);
  },
  getCityBySlug: (slug: string) => request(`/cities/${slug}`),
  getSchools: (cityId?: string, type?: string, withTios?: boolean) => {
    const params = new URLSearchParams();
    if (cityId) params.set('cityId', cityId);
    if (type) params.set('type', type);
    if (withTios) params.set('withTios', 'true');
    const qs = params.toString();
    return request(`/schools${qs ? `?${qs}` : ''}`);
  },
  getSchoolById: (id: string) => request(`/schools/${id}`),
  getNeighborhoods: (cityId?: string) =>
    request(`/neighborhoods${cityId ? `?cityId=${cityId}` : ''}`),

  // Public - Tios
  searchTios: (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/tios${qs ? `?${qs}` : ''}`);
  },
  getTioById: (id: string) => request(`/tios/${id}`),

  // Subscriptions
  getPlans: () => request('/subscriptions/plans'),
  getMySubscription: () => request('/subscriptions/me'),
  createCheckout: (planId: string) =>
    request<{ url: string }>('/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    }),
  createPortalSession: () =>
    request<{ url: string }>('/subscriptions/portal', { method: 'POST' }),
  cancelSubscription: () =>
    request<{ refunded: boolean; message: string }>('/subscriptions/cancel', {
      method: 'POST',
    }),

  // Admin
  adminGetStats: () => request('/admin/dashboard/stats'),
  adminGetUsers: (role?: string) =>
    request(`/admin/users${role ? `?role=${role}` : ''}`),
  adminGetUser: (id: string) => request(`/admin/users/${id}`),
  adminDeleteUser: (id: string) =>
    request(`/admin/users/${id}`, { method: 'DELETE' }),

  adminGetProfiles: (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return request(`/admin/profiles${qs ? `?${qs}` : ''}`);
  },
  adminGetPendingProfiles: () => request('/admin/profiles/pending'),
  adminGetProfile: (id: string) => request(`/admin/profiles/${id}`),
  adminUpdateProfile: (id: string, data: Record<string, unknown>) =>
    request(`/admin/profiles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  adminApproveProfile: (id: string) =>
    request(`/admin/profiles/${id}/approve`, { method: 'PATCH' }),
  adminRejectProfile: (id: string, reason: string) =>
    request(`/admin/profiles/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
  adminPauseProfile: (id: string, reason: string) =>
    request(`/admin/profiles/${id}/pause`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
  adminReactivateProfile: (id: string) =>
    request(`/admin/profiles/${id}/reactivate`, { method: 'PATCH' }),
  adminDeleteAvatar: (id: string) =>
    request(`/admin/profiles/${id}/avatar`, { method: 'DELETE' }),
  adminDeleteVehiclePhoto: (profileId: string, photoId: string) =>
    request(`/admin/profiles/${profileId}/photos/${photoId}`, { method: 'DELETE' }),
  adminDeleteProfile: (id: string) =>
    request(`/admin/profiles/${id}`, { method: 'DELETE' }),

  adminCreateState: (data: { name: string; uf: string }) =>
    request('/admin/states', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateState: (id: string, data: Record<string, unknown>) =>
    request(`/admin/states/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  adminDeleteState: (id: string) =>
    request(`/admin/states/${id}`, { method: 'DELETE' }),

  adminCreateCity: (data: Record<string, unknown>) =>
    request('/admin/cities', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateCity: (id: string, data: Record<string, unknown>) =>
    request(`/admin/cities/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  adminDeleteCity: (id: string) =>
    request(`/admin/cities/${id}`, { method: 'DELETE' }),

  adminCreateSchool: (data: Record<string, unknown>) =>
    request('/admin/schools', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateSchool: (id: string, data: Record<string, unknown>) =>
    request(`/admin/schools/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  adminDeleteSchool: (id: string) =>
    request(`/admin/schools/${id}`, { method: 'DELETE' }),

  adminCreateNeighborhood: (data: Record<string, unknown>) =>
    request('/admin/neighborhoods', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateNeighborhood: (id: string, data: Record<string, unknown>) =>
    request(`/admin/neighborhoods/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  adminDeleteNeighborhood: (id: string) =>
    request(`/admin/neighborhoods/${id}`, { method: 'DELETE' }),

  // Contact
  sendContact: (data: { name: string; email: string; message: string }) =>
    request<{ message: string }>('/contact', { method: 'POST', body: JSON.stringify(data) }),
};

export { ApiError };
