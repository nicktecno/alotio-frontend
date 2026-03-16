export type UserRole = 'TIO' | 'ADMIN';
export type ProfileStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED';
export type SchoolType = 'ESTADUAL' | 'MUNICIPAL' | 'PARTICULAR' | 'FEDERAL';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
export type PlanInterval = 'MONTHLY' | 'YEARLY';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
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
  prefixo: string;
  phone: string | null;
  bio: string | null;
  hasTV: boolean;
  hasAC: boolean;
  hasMonitor: boolean;
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
  plan?: SubscriptionPlan;
}

export interface TioPublicView {
  id: string;
  displayName: string;
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
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
