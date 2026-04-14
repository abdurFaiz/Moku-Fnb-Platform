export interface AuthResponse {
  status: string;
  message: string;
  data: AuthData;
}

export interface AuthData {
  access_token: string;
  refresh_token: string;
  user: User;
  total_point: number;
  total_order: number;
  total_user_voucher: number;
}

export interface User {
  id: number;
  uuid: string;
  name: string;
  phone?: string;
  email: string;
  avatar_url:string
  created_at: string;
  updated_at: string;
  short_name:string;
  customer_profile: CustomerProfile;
}

export interface CustomerProfile {
  id: number;
  uuid: string;
  job: string | null;
  date_birth: string | null;
  gender: number | null; // 1 = male, 2 = female
  user_id: number;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

// Helper functions for gender conversion
export const genderToString = (gender: number | null): string => {
  if (gender === null) return '';
  return gender === 1 ? 'male' : 'female';
};

export const stringToGender = (gender: string): number => {
  return gender === 'male' ? 1 : 2;
};

export interface ProfileRegistrationData {
  name: string;
  phone: string;
  date_birth: string;
  job: string;
}
