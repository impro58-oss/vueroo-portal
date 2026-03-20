// MedTech Dashboard Data Fetcher
// Uses Vueroo API to fetch data from GitHub

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://vueroo.com/api/data'
  : 'http://localhost:3000/api/data';

export const MedTechData = {
  cache: {} as Record<string, any>,
  cacheExpiry: 300000, // 5 minutes
  lastFetch: {} as Record<string, number>,

  async fetch(file: string) {
    // Check cache
    const now = Date.now();
    if (this.cache[file] && (now - this.lastFetch[file]) < this.cacheExpiry) {
      return this.cache[file];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${file}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.status === 401) {
        // Redirect to login
        window.location.href = '/login';
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Update cache
      this.cache[file] = data;
      this.lastFetch[file] = now;

      return data;
    } catch (error) {
      console.error(`Failed to fetch ${file}:`, error);
      throw error;
    }
  },

  // Convenience methods
  async getEpidemiologicalData() {
    return this.fetch('epidemiological-data');
  },

  async getCompetitionData() {
    return this.fetch('competition-data');
  },

  async getPortfolioData() {
    return this.fetch('portfolio-data');
  },

  clearCache() {
    this.cache = {};
    this.lastFetch = {};
  }
};

export default MedTechData;