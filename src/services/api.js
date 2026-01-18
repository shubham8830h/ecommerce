import { API_BASE_URL, ENDPOINTS } from '../constants';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async fetchWithTimeout(url, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async getProducts() {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}${ENDPOINTS.PRODUCTS}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      throw error;
    }
  }

  async getCategories() {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}${ENDPOINTS.CATEGORIES}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}${ENDPOINTS.PRODUCTS}/${id}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      throw error;
    }
  }
}

export const apiService = new ApiService();