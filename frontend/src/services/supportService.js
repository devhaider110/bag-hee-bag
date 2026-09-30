import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },
});


// =====================================================
// TOKEN
// =====================================================

const getToken = () => {
  return (
    localStorage.getItem("bhb_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("bhb_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    ""
  );
};


// =====================================================
// AXIOS REQUEST INTERCEPTOR
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);


// =====================================================
// CUSTOMER SUPPORT
// =====================================================


// -----------------------------------------------------
// CREATE SUPPORT TICKET
// -----------------------------------------------------

export const createSupportTicket =
  async (data) => {
    const response =
      await api.post(
        "/support/tickets",
        data
      );

    return response.data;
  };


// -----------------------------------------------------
// GET MY SUPPORT TICKETS
// -----------------------------------------------------

export const getMySupportTickets =
  async (params = {}) => {
    const response =
      await api.get(
        "/support/tickets",
        {
          params,
        }
      );

    return response.data;
  };


// -----------------------------------------------------
// GET MY SINGLE SUPPORT TICKET
// -----------------------------------------------------

export const getMySupportTicket =
  async (id) => {
    if (!id) {
      throw new Error(
        "Support ticket ID is required."
      );
    }

    const response =
      await api.get(
        `/support/tickets/${id}`
      );

    return response.data;
  };


// -----------------------------------------------------
// CUSTOMER REPLY
// -----------------------------------------------------

export const addCustomerSupportMessage =
  async (
    id,
    message
  ) => {
    if (!id) {
      throw new Error(
        "Support ticket ID is required."
      );
    }

    if (
      !message ||
      !String(message).trim()
    ) {
      throw new Error(
        "Support message cannot be empty."
      );
    }

    const response =
      await api.post(
        `/support/tickets/${id}/messages`,
        {
          message:
            String(message).trim(),
        }
      );

    return response.data;
  };


// -----------------------------------------------------
// CUSTOMER REPLY ALIAS
// Used by SupportTicketDetails.jsx
// -----------------------------------------------------

export const replyToSupportTicket =
  async (
    id,
    message
  ) => {
    return addCustomerSupportMessage(
      id,
      message
    );
  };


// =====================================================
// ADMIN SUPPORT
// =====================================================


// -----------------------------------------------------
// ADMIN SUPPORT SUMMARY
// -----------------------------------------------------

export const getAdminSupportSummary =
  async () => {
    const response =
      await api.get(
        "/support/admin/summary"
      );

    return response.data;
  };


// -----------------------------------------------------
// ADMIN SUPPORT TICKETS
// -----------------------------------------------------

export const getAdminSupportTickets =
  async (params = {}) => {
    const response =
      await api.get(
        "/support/admin/tickets",
        {
          params,
        }
      );

    return response.data;
  };


// -----------------------------------------------------
// ADMIN SINGLE SUPPORT TICKET
// -----------------------------------------------------

export const getAdminSupportTicket =
  async (id) => {
    if (!id) {
      throw new Error(
        "Support ticket ID is required."
      );
    }

    const response =
      await api.get(
        `/support/admin/tickets/${id}`
      );

    return response.data;
  };


// -----------------------------------------------------
// ADMIN REPLY
// -----------------------------------------------------

export const addAdminSupportMessage =
  async (
    id,
    message
  ) => {
    if (!id) {
      throw new Error(
        "Support ticket ID is required."
      );
    }

    if (
      !message ||
      !String(message).trim()
    ) {
      throw new Error(
        "Admin reply cannot be empty."
      );
    }

    const response =
      await api.post(
        `/support/admin/tickets/${id}/messages`,
        {
          message:
            String(message).trim(),
        }
      );

    return response.data;
  };


// -----------------------------------------------------
// ADMIN REPLY ALIAS
// Used by AdminSupportDetails.jsx
// -----------------------------------------------------

export const replyToAdminSupportTicket =
  async (
    id,
    message
  ) => {
    return addAdminSupportMessage(
      id,
      message
    );
  };


// =====================================================
// ADMIN TICKET UPDATE
// =====================================================


// -----------------------------------------------------
// GENERIC ADMIN UPDATE
// Supports:
// status
// priority
// internalNotes
// -----------------------------------------------------

export const updateAdminSupportTicket =
  async (
    id,
    data
  ) => {
    if (!id) {
      throw new Error(
        "Support ticket ID is required."
      );
    }

    const response =
      await api.patch(
        `/support/admin/tickets/${id}`,
        data
      );

    return response.data;
  };


// -----------------------------------------------------
// UPDATE STATUS
// Used by AdminSupportDetails.jsx
// -----------------------------------------------------

export const updateSupportTicketStatus =
  async (
    id,
    status
  ) => {
    if (!id) {
      throw new Error(
        "Support ticket ID is required."
      );
    }

    if (!status) {
      throw new Error(
        "Support ticket status is required."
      );
    }

    const response =
      await api.patch(
        `/support/admin/tickets/${id}`,
        {
          status,
        }
      );

    return response.data;
  };


// -----------------------------------------------------
// UPDATE PRIORITY
// Used by AdminSupportDetails.jsx
// -----------------------------------------------------

export const updateSupportTicketPriority =
  async (
    id,
    priority
  ) => {
    if (!id) {
      throw new Error(
        "Support ticket ID is required."
      );
    }

    if (!priority) {
      throw new Error(
        "Support ticket priority is required."
      );
    }

    const response =
      await api.patch(
        `/support/admin/tickets/${id}`,
        {
          priority,
        }
      );

    return response.data;
  };


// -----------------------------------------------------
// ADD INTERNAL NOTE
// Used by AdminSupportDetails.jsx
// -----------------------------------------------------

export const addSupportInternalNote =
  async (
    id,
    note
  ) => {
    if (!id) {
      throw new Error(
        "Support ticket ID is required."
      );
    }

    if (
      !note ||
      !String(note).trim()
    ) {
      throw new Error(
        "Internal note cannot be empty."
      );
    }

    const response =
      await api.patch(
        `/support/admin/tickets/${id}`,
        {
          internalNotes:
            String(note).trim(),
        }
      );

    return response.data;
  };


// =====================================================
// DEFAULT EXPORT
// =====================================================

export default {
  // Customer
  createSupportTicket,
  getMySupportTickets,
  getMySupportTicket,
  addCustomerSupportMessage,
  replyToSupportTicket,

  // Admin
  getAdminSupportSummary,
  getAdminSupportTickets,
  getAdminSupportTicket,
  addAdminSupportMessage,
  replyToAdminSupportTicket,

  // Admin updates
  updateAdminSupportTicket,
  updateSupportTicketStatus,
  updateSupportTicketPriority,
  addSupportInternalNote,
};