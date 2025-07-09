import fetch from 'node-fetch';

interface FacebookAPIResponse {
  data?: any;
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

export class FacebookGraphAPI {
  private baseURL = 'https://graph.facebook.com/v18.0';

  async makeRequest(endpoint: string, accessToken: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<FacebookAPIResponse> {
    const url = `${this.baseURL}${endpoint}`;
    const options: any = {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    if (body && method === 'POST') {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        return { error: data.error || { message: 'Unknown error', type: 'api_error', code: response.status } };
      }

      return { data };
    } catch (error) {
      return { error: { message: error.message, type: 'network_error', code: 500 } };
    }
  }

  // Get user's pages
  async getUserPages(accessToken: string) {
    return this.makeRequest('/me/accounts', accessToken);
  }

  // Get page info
  async getPageInfo(pageId: string, accessToken: string) {
    return this.makeRequest(`/${pageId}`, accessToken);
  }

  // Post to page
  async postToPage(pageId: string, accessToken: string, message: string, link?: string) {
    const body: any = { message };
    if (link) {
      body.link = link;
    }
    return this.makeRequest(`/${pageId}/feed`, accessToken, 'POST', body);
  }

  // Send message to page
  async sendMessage(pageId: string, accessToken: string, recipientId: string, message: string) {
    const body = {
      recipient: { id: recipientId },
      message: { text: message }
    };
    return this.makeRequest(`/${pageId}/messages`, accessToken, 'POST', body);
  }

  // Get page conversations
  async getPageConversations(pageId: string, accessToken: string) {
    return this.makeRequest(`/${pageId}/conversations`, accessToken);
  }

  // Get conversation messages
  async getConversationMessages(conversationId: string, accessToken: string) {
    return this.makeRequest(`/${conversationId}/messages`, accessToken);
  }

  // Create product catalog
  async createProductCatalog(businessId: string, accessToken: string, catalogName: string) {
    const body = {
      name: catalogName,
      vertical: 'commerce'
    };
    return this.makeRequest(`/${businessId}/product_catalogs`, accessToken, 'POST', body);
  }

  // Add product to catalog
  async addProductToCatalog(catalogId: string, accessToken: string, product: any) {
    return this.makeRequest(`/${catalogId}/products`, accessToken, 'POST', product);
  }

  // Get catalog products
  async getCatalogProducts(catalogId: string, accessToken: string) {
    return this.makeRequest(`/${catalogId}/products`, accessToken);
  }
}

export const facebookAPI = new FacebookGraphAPI();