export interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  mobile: string;
  email?: string;
  city?: string;
  address?: string;
  pincode?: string;
  role?: string;
}

export interface LoginPayload {
  mobile: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  mobile: string;
  password: string;
  city: string;
  address: string;
  pincode: string;
}

export interface LoginResponse {
  message: string;
  user_id: number;
}

export interface RegisterResponse {
  message: string;
  id: number;
}

export interface ApiCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface ServiceRequest {
  request_id: number;
  worker_type: string;
  problem: string;
  status: string;
}

export interface ForgotPasswordPayload {
  mobile?: string;
  email?: string;
}

export interface ResetPasswordPayload {
  mobile?: string;
  email?: string;
  password: string;
}

export interface AuthMessageResponse {
  message: string;
}
