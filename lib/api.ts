const API_URL = 'http://172.27.224.108:5000';

export const api = {
  // Auth
  register: async (data: any) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  login: async (data: any) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Password Reset
  forgotPassword: async (email: string) => {
    const res = await fetch(`${API_URL}/api/password/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  resetPassword: async (token: string, password: string) => {
    const res = await fetch(`${API_URL}/api/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });
    return res.json();
  },

  // Chat
  sendMessage: async (message: string, token: string) => {
    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });
    return res.json();
  },

  getChatHistory: async (token: string) => {
    const res = await fetch(`${API_URL}/api/chat/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Tickets
  submitTicket: async (data: any, token: string) => {
    const res = await fetch(`${API_URL}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  trackTicket: async (ticketId: string, token: string) => {
    const res = await fetch(`${API_URL}/api/tickets/${ticketId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getMyTickets: async (token: string) => {
    const res = await fetch(`${API_URL}/api/tickets/my`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // FAQs
  getFaqs: async (token: string) => {
    const res = await fetch(`${API_URL}/api/faqs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Announcements
  getAnnouncements: async (token: string) => {
    const res = await fetch(`${API_URL}/api/announcements`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Admin
  getAllTickets: async (token: string) => {
    const res = await fetch(`${API_URL}/api/tickets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  updateTicketStatus: async (ticketId: string, status: string, token: string) => {
    const res = await fetch(`${API_URL}/api/tickets/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  createAnnouncement: async (data: any, token: string) => {
    const res = await fetch(`${API_URL}/api/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  addFaq: async (data: any, token: string) => {
    const res = await fetch(`${API_URL}/api/faqs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteFaq: async (id: number, token: string) => {
    const res = await fetch(`${API_URL}/api/faqs/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  deleteAnnouncement: async (id: number, token: string) => {
    const res = await fetch(`${API_URL}/api/announcements/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  updateFaq: async (id: number, data: any, token: string) => {
    const res = await fetch(`${API_URL}/api/faqs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
