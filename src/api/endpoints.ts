// src/api/endpoints.js
import { API_URL } from './client.ts';

export const endpoints = {
  login: `${API_URL}/users/login/`,
  register: `${API_URL}/users/register/`,
  me: `${API_URL}/users/list/me/`,
  specialists: `${API_URL}/profiles/specialist-profiles/`,
  specialistProfile: (id: string | number) =>
    `${API_URL}/profiles/specialist-profiles/${id}/`,
  profiles: `${API_URL}/profiles/`,
  events: `${API_URL}/events/`,
  passwordReset: `${API_URL}/users/password-reset/`,
  passwordResetConfirm: `${API_URL}/users/password-reset/confirm/`,
  googleAuth: `${API_URL}/users/google/`,
  newsletterSubscribe: `${API_URL}/newsletter/subscribe`,
  consultationBooking:
    import.meta.env.VITE_CONSULTATION_BOOKING_ENDPOINT ||
    `${API_URL}/consultations/`,

};
