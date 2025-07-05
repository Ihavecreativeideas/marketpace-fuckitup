import { API_BASE_URL } from './constants';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`${response.status}: ${errorData.message || 'Network error'}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data,
    });
  }

  // File upload
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    });
  }

  // Multiple files upload
  async uploadFiles(endpoint, files, additionalData = {}) {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    });
  }
}

export const api = new ApiClient();

// Helper function to check if error is unauthorized
export const isUnauthorizedError = (error) => {
  return error.message.includes('401') || error.message.includes('Unauthorized');
};

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    user: '/api/auth/user',
    login: '/api/login',
    logout: '/api/logout',
  },
  
  // Users
  users: {
    profile: '/api/profile',
    business: '/api/profile/business',
  },
  
  // Driver
  driver: {
    application: '/api/driver/application',
    profile: '/api/driver/profile',
    routes: '/api/driver/routes',
  },
  
  // Listings
  listings: {
    base: '/api/listings',
    create: '/api/listings',
    byId: (id) => `/api/listings/${id}`,
  },
  
  // Orders
  orders: {
    base: '/api/orders',
    buyer: '/api/orders/buyer',
    seller: '/api/orders/seller',
    driver: '/api/orders/driver',
    byId: (id) => `/api/orders/${id}`,
  },
  
  // Cart
  cart: {
    base: '/api/cart',
    byId: (id) => `/api/cart/${id}`,
  },
  
  // Community
  community: {
    posts: '/api/community/posts',
    byId: (id) => `/api/community/posts/${id}`,
  },
  
  // Offers
  offers: {
    base: '/api/offers',
    buyer: '/api/offers/buyer',
    seller: '/api/offers/seller',
    byId: (id) => `/api/offers/${id}`,
  },
  
  // Payments
  payments: {
    createPaymentIntent: '/api/create-payment-intent',
    createSubscription: '/api/create-subscription',
  },
  
  // Admin
  admin: {
    dashboard: '/api/admin/dashboard',
    users: '/api/admin/users',
    analytics: '/api/admin/analytics',
  },
};
