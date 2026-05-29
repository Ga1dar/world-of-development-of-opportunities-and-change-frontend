// src/api/endpoints.js
import { API_URL } from './client.ts';

export const endpoints = {
  login: `${API_URL}/users/login/`,
  logout: `${API_URL}/users/logout/`,
  tokenRefresh: `${API_URL}/token/refresh/`,
  register: `${API_URL}/users/register/`,
  me: `${API_URL}/users/list/me/`,
  specialists: `${API_URL}/profiles/specialist-profiles/`,
  specialistProfile: (id: string | number) =>
    `${API_URL}/profiles/specialist-profiles/${id}/`,
  documents: `${API_URL}/profiles/documents/`,
  userProfiles: `${API_URL}/profiles/user-profiles/`,
  userProfile: (id: string | number) => `${API_URL}/profiles/user-profiles/${id}/`,
  profiles: `${API_URL}/profiles/`,
  events: `${API_URL}/events/`,
  eventCategories:
    import.meta.env.VITE_EVENT_CATEGORIES_ENDPOINT ||
    `${API_URL}/events/categories/`,
  eventDetail: (id: string | number) => `${API_URL}/events/${id}/`,
  eventLike: (id: string | number) => `${API_URL}/events/${id}/like/`,
  eventComments: (id: string | number) => `${API_URL}/events/${id}/comments/`,
  eventCommentLike: (eventId: string | number, commentId: string | number) =>
    `${API_URL}/events/${eventId}/comments/${commentId}/like/`,
  eventRegistration: (id: string | number) =>
    `${API_URL}/events/${id}/register/`,
  passwordReset: `${API_URL}/users/password-reset/`,
  passwordResetConfirm: `${API_URL}/users/password-reset/confirm/`,
  googleAuth: `${API_URL}/users/google/`,
  newsletterSubscribe: `${API_URL}/newsletter/subscribe`,
  educationArticles: `${API_URL}/education-materials/articles/`,
  educationArticle: (slug: string) =>
    `${API_URL}/education-materials/articles/${slug}/`,
  educationArticleLike: (slug: string) =>
    `${API_URL}/education-materials/articles/${slug}/like/`,
  educationArticleFavorite: (slug: string) =>
    `${API_URL}/education-materials/articles/${slug}/favorite/`,
  educationArticleComments: (slug: string) =>
    `${API_URL}/education-materials/articles/${slug}/comments/`,
  educationArticleComment: (id: string | number) =>
    `${API_URL}/education-materials/article-comments/${id}/`,
  educationArticleCommentLike: (id: string | number) =>
    `${API_URL}/education-materials/article-comments/${id}/like/`,
  educationVideos: `${API_URL}/education-materials/videos/`,
  educationVideo: (slug: string) =>
    `${API_URL}/education-materials/videos/${slug}/`,
  educationVideoLike: (slug: string) =>
    `${API_URL}/education-materials/videos/${slug}/like/`,
  educationVideoFavorite: (slug: string) =>
    `${API_URL}/education-materials/videos/${slug}/favorite/`,
  educationVideoComments: (slug: string) =>
    `${API_URL}/education-materials/videos/${slug}/comments/`,
  educationVideoComment: (id: string | number) =>
    `${API_URL}/education-materials/video-comments/${id}/`,
  educationVideoCommentLike: (id: string | number) =>
    `${API_URL}/education-materials/video-comments/${id}/like/`,
  consultationSlots: (specialistId: string | number) =>
    `${API_URL}/scheduling/slots/?specialist=${specialistId}`,
  consultationAppointments: `${API_URL}/scheduling/appointments/`,
  consultationCompletedAppointments: `${API_URL}/scheduling/appointments/completed/`,
  consultationAppointment: (id: string | number) =>
    `${API_URL}/scheduling/appointments/${id}/`,
  consultationAppointmentCancel: (id: string | number) =>
    `${API_URL}/scheduling/appointments/${id}/cancel/`,
  consultationAppointmentReschedule: (id: string | number) =>
    `${API_URL}/scheduling/appointments/${id}/reschedule/`,
  consultationBooking:
    import.meta.env.VITE_CONSULTATION_BOOKING_ENDPOINT ||
    `${API_URL}/scheduling/appointments/`,

};
