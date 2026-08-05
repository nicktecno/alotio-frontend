/** Resposta paginada da API (cidades, escolas, bairros) */
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Tamanho de página nas listagens do admin */
export const ADMIN_LIST_PAGE_SIZE = 30;

export type UserRole = 'TIO' | 'ADMIN' | 'LOJISTA';
export type ProfileStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED';
export type SchoolType = 'ESTADUAL' | 'MUNICIPAL' | 'PARTICULAR' | 'FEDERAL';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
export type PlanInterval = 'MONTHLY' | 'YEARLY';

// -------------------------------------------------------------- Marketplace (lojista)
export type StoreType = 'VAN' | 'PECAS';
export type StorePlan = 'FREE' | 'PREMIUM';
export type ProductStatus = 'ACTIVE' | 'PAUSED' | 'BLOCKED';

export interface ProductImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  storeId: string;
  title: string;
  description: string | null;
  priceCents: number | null;
  category: string | null;
  status: ProductStatus;
  blockedReason: string | null;
  createdAt: string;
  images: ProductImage[];
}

export interface Store {
  id: string;
  userId?: string;
  displayName: string;
  slug: string;
  type: StoreType;
  plan: StorePlan;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  bio: string | null;
  logoUrl: string | null;
  cityId?: string | null;
  isBlocked?: boolean;
  createdAt: string;
  city?: { id: string; name: string; slug?: string; state?: { uf: string } } | null;
  serviceCities?: {
    city: { id: string; name: string; slug?: string; stateId?: string; state?: { uf: string } };
  }[];
  isPremium?: boolean;
  products?: Product[];
  _count?: { products: number };
}

export interface MyStoreResponse {
  store: Store | null;
  isPremium?: boolean;
  activeProductsCount?: number;
  activeProductsLimit?: number | null;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

/** Linha da listagem GET /admin/users (inclui perfil quando existir). */
export interface AdminUserListRow extends User {
  profile?: {
    id: string;
    displayName: string;
    status: ProfileStatus;
    prefixo: string;
  } | null;
}

export interface State {
  id: string;
  name: string;
  uf: string;
  isActive: boolean;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  stateId: string;
  state?: State;
  isActive: boolean;
}

/** GET /cities/resolve-from-location — preenche estado/cidade a partir de lat/lng (geocodificação reversa). */
export interface CityResolveFromLocation {
  stateId: string;
  stateUf: string;
  stateName: string;
  cityId: string | null;
  cityName: string | null;
  placeLabel: string | null;
}

export interface School {
  id: string;
  name: string;
  type: SchoolType;
  cityId: string;
  address?: string;
  isActive: boolean;
}

export interface Neighborhood {
  id: string;
  name: string;
  cityId: string;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  legalName?: string | null;
  cnpj?: string | null;
  transportadorCpf?: string | null;
  prefixo: string;
  phone: string | null;
  bio: string | null;
  hasTV: boolean;
  hasAC: boolean;
  hasMonitor: boolean;
  /** Vagas por turno (opcional); usado na busca pública. */
  vacanciesMorning?: number | null;
  vacanciesAfternoon?: number | null;
  vacanciesNight?: number | null;
  avatarUrl: string | null;
  isIntermunicipal: boolean;
  cityId: string;
  secondaryCityId: string | null;
  defaultSchoolId: string;
  secondarySchoolId: string | null;
  status: ProfileStatus;
  rejectedReason: string | null;
  lastConfirmedAt: string | null;
  confirmationRequestedAt: string | null;
  confirmationReminderSentAt: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
  city: City;
  secondaryCity: City | null;
  defaultSchool: School;
  secondarySchool: School | null;
  schools: { school: School }[];
  neighborhoods: { neighborhood: Neighborhood }[];
  vehiclePhotos: VehiclePhoto[];
  documents: ProfileDocument[];
  subscriptions: Subscription[];
}

export interface VehiclePhoto {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ProfileDocument {
  id: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  interval: PlanInterval;
  priceCents: number;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  profileId: string;
  planId: string;
  status: SubscriptionStatus;
  createdAt: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  isCourtesy: boolean;
  plan?: SubscriptionPlan;
}

export interface TioPublicView {
  id: string;
  displayName: string;
  legalName?: string | null;
  cnpj?: string | null;
  transportadorCpf?: string | null;
  prefixo: string;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isPremium: boolean;
  isIntermunicipal: boolean;
  hasTV: boolean;
  hasAC: boolean;
  hasMonitor: boolean;
  schools: { id: string; name: string }[];
  neighborhoods: { id: string; name: string; cityId: string; cityName: string }[];
  vehiclePhotos: { id: string; url: string }[];
  city: {
    id: string;
    name: string;
    state: { id: string; name: string; uf: string };
  };
  secondaryCity: {
    id: string;
    name: string;
    state: { id: string; name: string; uf: string };
  } | null;
  /** Soma de vagas nos turnos informados; null se não divulgar vagas. */
  vacancyTotal?: number | null;
  vacanciesMorning?: number | null;
  vacanciesAfternoon?: number | null;
  vacanciesNight?: number | null;
  reviewsApprovedCount?: number;
  reviewAvgOverall?: number | null;
  reviewAvgPunctuality?: number | null;
  reviewAvgCommunication?: number | null;
  reviewAvgSafety?: number | null;
}

export interface TioPublicReview {
  id: string;
  reviewerName: string;
  punctuality: number;
  communication: number;
  safety: number;
  comment: string;
  createdAt: string;
}


export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ContactSubmissionSource = 'FALE_CONOSCO' | 'CADASTRO_ESCOLA';
export type ContactSubmissionStatus = 'PENDING' | 'REPLIED';

/** Mensagens do site (Fale Conosco / cadastro escola) — GET /admin/contact-submissions */
export interface ContactSubmission {
  id: string;
  source: ContactSubmissionSource;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  extraJson: Record<string, unknown> | null;
  status: ContactSubmissionStatus;
  repliedAt: string | null;
  replyText: string | null;
  replySubject: string | null;
  repliedById: string | null;
  createdAt: string;
  updatedAt: string;
  repliedBy?: { id: string; email: string } | null;
}

export type WhatsAppMessageDirection = 'INBOUND' | 'OUTBOUND';
export type WhatsAppMessageKind = 'TEXT' | 'TEMPLATE';
export type WhatsAppMessageStatus = 'SENT' | 'FAILED';

export interface WhatsAppMessageLog {
  id: string;
  direction: WhatsAppMessageDirection;
  kind: WhatsAppMessageKind;
  waId: string;
  recipientLabel: string | null;
  bodyText: string | null;
  templateName: string | null;
  status: WhatsAppMessageStatus;
  waMessageId: string | null;
  errorMessage: string | null;
  profileId: string | null;
  contactSubmissionId: string | null;
  bulkCampaignId: string | null;
  sentById: string | null;
  createdAt: string;
  profile?: { id: string; displayName: string } | null;
  sentBy?: { id: string; email: string } | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface DashboardStats {
  totalUsers: number;
  totalProfiles: number;
  pendingProfiles: number;
  activeSubscriptions: number;
}
