// src/api/endpoints.js
import { API_URL } from './client.ts';

export const endpoints = {
  login: `${API_URL}/users/login/`,
  register: `${API_URL}/users/register/`,
  me: `${API_URL}/users/list/me/`,
  specialists: `${API_URL}/profiles/specialists/`,
  profiles: `${API_URL}/profiles/`,
  events: `${API_URL}/events`

};