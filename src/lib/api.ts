import type {
  AdminUserListRow,
  CityResolveFromLocation,
  ContactSubmission,
  MyStoreResponse,
  Paginated,
  PaginatedResponse,
  Product,
  ProductImage,
  ProductStatus,
  Profile,
  Store,
  StorePlan,
  StoreType,
  WhatsAppMessageLog,
} from '@/types';

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



async function publicRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new ApiError(res.status, body.message || `Erro ${res.status}`);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

async function authBlob(endpoint: string): Promise<Blob> {
  const doFetch = () => fetch(`${API_URL}${endpoint}`, { credentials: 'include' });

  let res = await doFetch();

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
          res = await doFetch();
          if (res.ok) {
            return res.blob();
          }
        }
      } catch {
        /* refresh failed */
      }
      isRefreshing = false;
      window.location.href = '/login';
      throw new ApiError(401, 'Sessão expirada');
    }
    const body = await res.json().catch(() => ({ message: 'Erro' }));
    throw new ApiError(res.status, body.message || `Erro ${res.status}`);
  }

  return res.blob();
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; role?: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<{
      user: {
        id: string;
        email: string;
        role: string;
        mustCaptureEmail?: boolean;
        transportadorTermsAcceptedAt?: string | null;
      };
    }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  me: () =>
    request<{
      id: string;
      email: string;
      role: string;
      mustCaptureEmail?: boolean;
      transportadorTermsAcceptedAt?: string | null;
    }>('/auth/me'),

  updateCapturedEmail: (email: string) =>
    request<{
      user: {
        id: string;
        email: string;
        role: string;
        mustCaptureEmail?: boolean;
        transportadorTermsAcceptedAt?: string | null;
      };
    }>('/auth/me/email', {
      method: 'PATCH',
      body: JSON.stringify({ email }),
    }),

  acceptTransportadorTerms: () =>
    request<{
      user: {
        id: string;
        email: string;
        role: string;
        mustCaptureEmail?: boolean;
        transportadorTermsAcceptedAt?: string | null;
      };
    }>('/auth/me/accept-transportador-terms', { method: 'POST' }),

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
  getStates: (withTios?: boolean) =>
    request(withTios ? '/states?withTios=true' : '/states'),
  getStateByUf: (uf: string) => request(`/states/${uf}`),
  /** Sem `pagination`: lista completa (perfil, busca). Com `pagination`: admin. */
  getCities: (
    stateId?: string,
    withTios?: boolean,
    pagination?: { page: number; limit?: number },
  ) => {
    const params = new URLSearchParams();
    if (stateId) params.set('stateId', stateId);
    if (withTios) params.set('withTios', 'true');
    if (pagination) {
      params.set('page', String(pagination.page));
      params.set('limit', String(pagination.limit ?? 30));
    }
    const qs = params.toString();
    return request(`/cities${qs ? `?${qs}` : ''}`);
  },
  resolveCityFromLocation: (lat: number, lng: number, withTios = true) => {
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
    });
    if (!withTios) params.set('withTios', 'false');
    return request<CityResolveFromLocation>(
      `/cities/resolve-from-location?${params.toString()}`,
    );
  },
  getCityBySlug: (slug: string) => request(`/cities/${slug}`),
  getSchools: (
    cityId?: string,
    type?: string,
    withTios?: boolean,
    pagination?: { page: number; limit?: number },
  ) => {
    const params = new URLSearchParams();
    if (cityId) params.set('cityId', cityId);
    if (type) params.set('type', type);
    if (withTios) params.set('withTios', 'true');
    if (pagination) {
      params.set('page', String(pagination.page));
      params.set('limit', String(pagination.limit ?? 30));
    }
    const qs = params.toString();
    return request(`/schools${qs ? `?${qs}` : ''}`);
  },
  getSchoolById: (id: string) => request(`/schools/${id}`),
  getNeighborhoods: (
    cityId?: string,
    pagination?: { page: number; limit?: number },
  ) => {
    const params = new URLSearchParams();
    if (cityId) params.set('cityId', cityId);
    if (pagination) {
      params.set('page', String(pagination.page));
      params.set('limit', String(pagination.limit ?? 30));
    }
    const qs = params.toString();
    return request(`/neighborhoods${qs ? `?${qs}` : ''}`);
  },

  // Public - Tios
  searchTios: (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/tios${qs ? `?${qs}` : ''}`);
  },
  getTioById: (id: string) => request(`/tios/${id}`),

  requestReviewCode: (body: { profileId: string; email: string }) =>
    publicRequest<{ message: string }>('/reviews/request-code', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  submitReview: (body: {
    profileId: string;
    email: string;
    reviewerName: string;
    code: string;
    punctuality: number;
    communication: number;
    safety: number;
    comment: string;
  }) =>
    publicRequest<{ message: string }>('/reviews/submit', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getPublicReviews: (profileId: string, page = 1, limit = 30) =>
    publicRequest<{
      data: Array<{
        id: string;
        reviewerName: string;
        punctuality: number;
        communication: number;
        safety: number;
        comment: string;
        createdAt: string;
      }>;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/reviews/profile/${profileId}?page=${page}&limit=${limit}`),

  adminListPendingReviews: (page = 1) =>
    request<{
      data: Array<{
        id: string;
        reviewerName: string;
        reviewerEmail: string;
        punctuality: number;
        communication: number;
        safety: number;
        comment: string;
        createdAt: string;
        profile: { id: string; displayName: string; prefixo: string };
      }>;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/admin/reviews/pending?page=${page}`),

  adminApproveReview: (id: string) =>
    request(`/admin/reviews/${id}/approve`, { method: 'POST' }),

  adminRejectReview: (id: string) =>
    request(`/admin/reviews/${id}/reject`, { method: 'POST' }),

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

  adminListContactSubmissions: (params?: {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'REPLIED';
  }) => {
    const q = new URLSearchParams();
    if (params?.page != null) q.set('page', String(params.page));
    if (params?.limit != null) q.set('limit', String(params.limit));
    if (params?.status) q.set('status', params.status);
    const qs = q.toString();
    return request<PaginatedResponse<ContactSubmission>>(
      `/admin/contact-submissions${qs ? `?${qs}` : ''}`,
    );
  },
  adminGetContactSubmission: (id: string) =>
    request<ContactSubmission>(`/admin/contact-submissions/${id}`),
  adminReplyContactSubmission: (
    id: string,
    body: {
      message: string;
      subject?: string;
      channel?: 'email' | 'whatsapp' | 'both';
    },
  ) =>
    request<{ message: string }>(`/admin/contact-submissions/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  adminWhatsAppStatus: () =>
    request<{
      configured: boolean;
      monthlyLimit: number;
      sentThisMonth: number;
      remaining: number;
      monthLabel: string;
    }>('/admin/whatsapp/status'),

  adminWhatsAppBulk: (body: {
    profileIds: string[];
    message: string;
    templateName?: string;
    label?: string;
  }) =>
    request<{
      campaignId: string;
      total: number;
      sentCount: number;
      failedCount: number;
      results: {
        profileId: string;
        displayName: string;
        ok: boolean;
        error?: string;
      }[];
    }>('/admin/whatsapp/bulk', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  adminWhatsAppMessages: (params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.page != null) q.set('page', String(params.page));
    if (params?.limit != null) q.set('limit', String(params.limit));
    const qs = q.toString();
    return request<PaginatedResponse<WhatsAppMessageLog>>(
      `/admin/whatsapp/messages${qs ? `?${qs}` : ''}`,
    );
  },

  adminGetUsers: (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return request<Paginated<AdminUserListRow>>(
      `/admin/users${qs ? `?${qs}` : ''}`,
    );
  },
  adminGetUser: (id: string) => request(`/admin/users/${id}`),
  adminDeleteUser: (id: string) =>
    request(`/admin/users/${id}`, { method: 'DELETE' }),
  adminSendProfileReminder: (id: string) =>
    request<{ message: string }>(`/admin/users/${id}/send-profile-reminder`, { method: 'POST' }),

  adminGetProfiles: (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return request<Paginated<Profile>>(
      `/admin/profiles${qs ? `?${qs}` : ''}`,
    );
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
  adminGrantCourtesy: (id: string, months: number) =>
    request(`/admin/profiles/${id}/courtesy`, {
      method: 'POST',
      body: JSON.stringify({ months }),
    }),
  adminRevokeCourtesy: (id: string) =>
    request(`/admin/profiles/${id}/courtesy`, { method: 'DELETE' }),
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
  adminSendNeighborhoodsReminder: (profileId: string) =>
    request<{ message?: string }>(`/admin/profiles/${profileId}/send-neighborhoods-reminder`, { method: 'POST' }),

  adminCreateState: (data: { name: string; uf: string }) =>
    request('/admin/states', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateState: (id: string, data: Record<string, unknown>) =>
    request(`/admin/states/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  adminDeleteState: (id: string) =>
    request(`/admin/states/${id}`, { method: 'DELETE' }),

  adminSearchCacheStatus: () =>
    request<{
      configured: boolean;
      entryTtlSec: number | null;
      indefiniteTtl: boolean;
    }>('/admin/search-cache/status'),

  adminInvalidateSearchCache: (stateId: string) =>
    request<{
      stateId: string;
      name: string;
      uf: string;
      version: number | null;
      message: string;
    }>('/admin/search-cache/invalidate', {
      method: 'POST',
      body: JSON.stringify({ stateId }),
    }),

  adminInvalidateSearchCacheAllScope: () =>
    request<{ scope: string; version: number | null; message: string }>(
      '/admin/search-cache/invalidate-all-scope',
      { method: 'POST' },
    ),

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
  sendContact: (data: {
    name: string;
    email: string;
    phone: string;
    message: string;
  }) =>
    request<{ message: string }>('/contact', { method: 'POST', body: JSON.stringify(data) }),

  /** Transportador: não encontrou cidade/escola — envia para admin (Resend). */
  sendSchoolRegistrationRequest: (data: {
    name: string;
    email: string;
    uf: string;
    cityName?: string;
    schoolName?: string;
    details?: string;
  }) =>
    request<{ message: string }>('/contact/school-registration-request', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  servedParentsList: () => request<unknown[]>('/served-parents'),
  servedParentsCreate: (data: Record<string, unknown>) =>
    request('/served-parents', { method: 'POST', body: JSON.stringify(data) }),
  servedParentsUpdate: (id: string, data: Record<string, unknown>) =>
    request(`/served-parents/parents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  servedParentsDelete: (id: string) =>
    request(`/served-parents/parents/${id}`, { method: 'DELETE' }),
  servedParentsInvite: () =>
    request<{ url: string; expiresAt: string }>('/served-parents/invites', { method: 'POST' }),
  servedParentsReceiptPdf: (parentId: string, month: number, year: number) => {
    const q = new URLSearchParams({ month: String(month), year: String(year) });
    return authBlob(`/served-parents/parents/${parentId}/receipt-pdf?${q}`);
  },
  contractsList: () => request<unknown[]>('/served-parents/contracts'),
  contractsCreate: (data: Record<string, unknown>) =>
    request('/served-parents/contracts', { method: 'POST', body: JSON.stringify(data) }),
  contractsSignTio: (id: string) =>
    request(`/served-parents/contracts/${id}/sign-tio`, { method: 'POST' }),
  contractsParentLink: (id: string) =>
    request<{ url: string; expiresAt: string }>(
      `/served-parents/contracts/${id}/parent-link`,
      { method: 'POST' },
    ),
  contractsPdf: (id: string) => authBlob(`/served-parents/contracts/${id}/pdf`),
  contractsDelete: (id: string) =>
    request(`/served-parents/contracts/${id}`, { method: 'DELETE' }),

  publicParentInvitePreview: (token: string) =>
    publicRequest<{ valid: boolean; transportadorName: string }>(
      `/public/parent-invites/${encodeURIComponent(token)}`,
    ),
  publicParentInviteComplete: (token: string, data: Record<string, unknown>) =>
    publicRequest(`/public/parent-invites/${encodeURIComponent(token)}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  publicContractParentPreview: (token: string) =>
    publicRequest<{ previewText: string; transportadorName: string }>(
      `/public/contracts/parent/${encodeURIComponent(token)}`,
    ),
  publicContractParentAccept: (token: string) =>
    publicRequest<{ ok: boolean; finalPdfUrl: string | null }>(
      `/public/contracts/parent/${encodeURIComponent(token)}/accept`,
      { method: 'POST' },
    ),

  // -------------------------------------------------------------- Marketplace (público)
  marketplaceListStores: (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return publicRequest<Paginated<Store>>(
      `/marketplace/stores${qs ? `?${qs}` : ''}`,
    );
  },
  marketplaceFeatured: (limit = 6) =>
    publicRequest<Store[]>(`/marketplace/featured?limit=${limit}`),
  marketplaceProducts: (type: StoreType, limit = 12) =>
    publicRequest<
      Array<{
        id: string;
        title: string;
        priceCents: number | null;
        category: string | null;
        images: { url: string }[];
        store: {
          slug: string;
          displayName: string;
          type: StoreType;
          plan: StorePlan;
        };
      }>
    >(`/marketplace/products?type=${type}&limit=${limit}`),
  marketplaceGetStore: (slug: string) =>
    publicRequest<Store>(`/marketplace/stores/${encodeURIComponent(slug)}`),

  // -------------------------------------------------------------- Loja (lojista)
  getMyStore: () => request<MyStoreResponse>('/stores/me'),
  createStore: (data: {
    displayName: string;
    type: StoreType;
    phone?: string;
    whatsapp?: string;
    email?: string;
    bio?: string;
    cityId?: string;
    cityIds?: string[];
  }) => request<Store>('/stores', { method: 'POST', body: JSON.stringify(data) }),
  updateMyStore: (data: Record<string, unknown>) =>
    request<Store>('/stores/me', { method: 'PATCH', body: JSON.stringify(data) }),
  uploadStoreLogo: (formData: FormData) =>
    request<{ logoUrl: string }>('/stores/me/logo', {
      method: 'POST',
      body: formData,
    }),

  listMyProducts: (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return request<Paginated<Product>>(
      `/stores/me/products${qs ? `?${qs}` : ''}`,
    );
  },
  createProduct: (data: {
    title: string;
    description?: string;
    priceCents?: number;
    category?: string;
    status?: ProductStatus;
  }) =>
    request<Product>('/stores/me/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createProductsBulk: (
    products: Array<{
      title: string;
      description?: string;
      priceCents?: number;
      category?: string;
      status?: ProductStatus;
    }>,
  ) =>
    request<{ created: number }>('/stores/me/products/bulk', {
      method: 'POST',
      body: JSON.stringify({ products }),
    }),
  updateProduct: (id: string, data: Record<string, unknown>) =>
    request<Product>(`/stores/me/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: string) =>
    request(`/stores/me/products/${id}`, { method: 'DELETE' }),
  uploadProductImage: (productId: string, formData: FormData) =>
    request<ProductImage>(`/stores/me/products/${productId}/images`, {
      method: 'POST',
      body: formData,
    }),
  deleteProductImage: (imageId: string) =>
    request(`/stores/me/product-images/${imageId}`, { method: 'DELETE' }),

  // Store subscription (plano lojista R$ 29,90/mês)
  getMyStoreSubscription: () =>
    request<{
      isPremium: boolean;
      plan: StorePlan;
      subscription: { currentPeriodEnd: string; cancelAtPeriodEnd: boolean } | null;
      plans: Array<{
        interval: 'monthly' | 'yearly';
        priceId: string;
        priceCents: number | null;
        currency: string;
      }>;
    }>('/subscriptions/store/me'),
  getStorePlans: () =>
    request<
      Array<{
        interval: 'monthly' | 'yearly';
        priceId: string;
        priceCents: number | null;
        currency: string;
      }>
    >('/subscriptions/store/plans'),
  createStoreCheckout: (interval: 'monthly' | 'yearly' = 'monthly') =>
    request<{ url: string }>('/subscriptions/store/checkout', {
      method: 'POST',
      body: JSON.stringify({ interval }),
    }),
  createStorePortal: () =>
    request<{ url: string }>('/subscriptions/store/portal', { method: 'POST' }),
  cancelStoreSubscription: () =>
    request<{ message: string }>('/subscriptions/store/cancel', {
      method: 'POST',
    }),

  // -------------------------------------------------------------- Admin marketplace
  adminListStores: (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return request<Paginated<Store & { user?: { email: string } }>>(
      `/admin/stores${qs ? `?${qs}` : ''}`,
    );
  },
  adminBlockStore: (id: string, reason: string) =>
    request(`/admin/stores/${id}/block`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  adminUnblockStore: (id: string) =>
    request(`/admin/stores/${id}/unblock`, { method: 'POST' }),
  adminListProducts: (params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return request<
      Paginated<
        Product & {
          store: { id: string; displayName: string; slug: string; type: StoreType };
        }
      >
    >(`/admin/products${qs ? `?${qs}` : ''}`);
  },
  adminBlockProduct: (id: string, reason: string) =>
    request(`/admin/products/${id}/block`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  adminUnblockProduct: (id: string) =>
    request(`/admin/products/${id}/unblock`, { method: 'POST' }),
};

export { ApiError };
