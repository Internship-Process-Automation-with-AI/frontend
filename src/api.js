// API service for communicating with the backend
const API_BASE_URL = 'http://localhost:8000';

// Cache configuration
const CACHE_CONFIG = {
  DEGREES_CACHE_KEY: 'oamk_degree_programs',
  DEGREES_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  HEALTH_CACHE_KEY: 'oamk_api_health',
  HEALTH_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
};

// Request interceptor for loading states
class RequestInterceptor {
  constructor() {
    this.activeRequests = new Map();
    this.listeners = new Set();
  }

  // Add a request to tracking
  addRequest(requestId, requestInfo) {
    this.activeRequests.set(requestId, {
      ...requestInfo,
      startTime: Date.now(),
      progress: 0
    });
    this.notifyListeners();
  }

  // Update request progress
  updateProgress(requestId, progress) {
    const request = this.activeRequests.get(requestId);
    if (request) {
      request.progress = progress;
      this.notifyListeners();
    }
  }

  // Remove a request from tracking
  removeRequest(requestId) {
    this.activeRequests.delete(requestId);
    this.notifyListeners();
  }

  // Get all active requests
  getActiveRequests() {
    return Array.from(this.activeRequests.values());
  }

  // Check if any requests are active
  hasActiveRequests() {
    return this.activeRequests.size > 0;
  }

  // Subscribe to loading state changes
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.getActiveRequests());
      } catch (error) {
        console.error('Error in request interceptor listener:', error);
      }
    });
  }
}

// Cache utility functions
class CacheManager {
  constructor() {
    this.storage = typeof window !== 'undefined' ? window.localStorage : null;
  }

  // Set cache item with expiration
  set(key, data, duration) {
    if (!this.storage) return;
    
    const cacheItem = {
      data,
      timestamp: Date.now(),
      duration
    };
    
    try {
      this.storage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  // Get cache item if not expired
  get(key) {
    if (!this.storage) return null;
    
    try {
      const cached = this.storage.getItem(key);
      if (!cached) return null;
      
      const cacheItem = JSON.parse(cached);
      const isExpired = Date.now() - cacheItem.timestamp > cacheItem.duration;
      
      if (isExpired) {
        this.remove(key);
        return null;
      }
      
      return cacheItem.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      this.remove(key);
      return null;
    }
  }

  // Remove cache item
  remove(key) {
    if (!this.storage) return;
    
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove cached data:', error);
    }
  }

  // Clear all cache
  clear() {
    if (!this.storage) return;
    
    try {
      Object.keys(this.storage).forEach(key => {
        if (key.startsWith('oamk_')) {
          this.storage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
}

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.cache = new CacheManager();
    this.requestInterceptor = new RequestInterceptor();
    this.requestCounter = 0;
  }

  // Generate unique request ID
  generateRequestId() {
    return `req_${++this.requestCounter}_${Date.now()}`;
  }

  // Enhanced fetch with progress tracking
  async fetchWithProgress(url, options = {}, requestId = null) {
    const finalRequestId = requestId || this.generateRequestId();
    
    // Add request to interceptor
    this.requestInterceptor.addRequest(finalRequestId, {
      url,
      method: options.method || 'GET',
      type: this.getRequestType(url)
    });

    try {
      // Simulate progress for non-file uploads
      if (!options.body || !(options.body instanceof FormData)) {
        this.simulateProgress(finalRequestId);
      }

      const response = await fetch(url, options);
      
      // Update progress to 100% when complete
      this.requestInterceptor.updateProgress(finalRequestId, 100);
      
      return response;
    } finally {
      // Remove request from tracking after a short delay
      setTimeout(() => {
        this.requestInterceptor.removeRequest(finalRequestId);
      }, 500);
    }
  }

  // Simulate progress for non-file uploads
  simulateProgress(requestId) {
    const progressSteps = [10, 30, 60, 90];
    progressSteps.forEach((progress, index) => {
      setTimeout(() => {
        this.requestInterceptor.updateProgress(requestId, progress);
      }, (index + 1) * 200);
    });
  }

  // Get request type for better progress tracking
  getRequestType(url) {
    if (url.includes('/health')) return 'health_check';
    if (url.includes('/degrees')) return 'fetch_degrees';
    if (url.includes('/process')) return 'process_document';
    if (url.includes('/download')) return 'download_report';
    return 'api_call';
  }

  // Health check with caching
  async checkHealth() {
    // Check cache first
    const cached = this.cache.get(CACHE_CONFIG.HEALTH_CACHE_KEY);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.fetchWithProgress(`${this.baseUrl}/api/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      this.cache.set(CACHE_CONFIG.HEALTH_CACHE_KEY, data, CACHE_CONFIG.HEALTH_CACHE_DURATION);
      
      return data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  // Get degree programs with caching
  async getDegreePrograms(forceRefresh = false) {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = this.cache.get(CACHE_CONFIG.DEGREES_CACHE_KEY);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.fetchWithProgress(`${this.baseUrl}/api/degrees`);
      if (!response.ok) {
        throw new Error(`Failed to fetch degrees: ${response.status}`);
      }
      
      const data = await response.json();
      const degrees = data.degrees || [];
      
      // Cache the result
      this.cache.set(CACHE_CONFIG.DEGREES_CACHE_KEY, degrees, CACHE_CONFIG.DEGREES_CACHE_DURATION);
      
      return degrees;
    } catch (error) {
      console.error('Error fetching degree programs:', error);
      throw error;
    }
  }

  // Process document with enhanced progress tracking
  async processDocument(file, studentDegree, studentEmail, trainingType) {
    const requestId = this.generateRequestId();
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('student_degree', studentDegree);
      formData.append('student_email', studentEmail);
      formData.append('training_type', trainingType);

      // Add request to interceptor
      this.requestInterceptor.addRequest(requestId, {
        url: `${this.baseUrl}/api/process`,
        method: 'POST',
        type: 'process_document',
        fileName: file.name,
        fileSize: file.size
      });

      // Simulate document processing progress
      this.simulateDocumentProcessingProgress(requestId);

      const response = await fetch(`${this.baseUrl}/api/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Processing failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Update progress to 100% when complete
      this.requestInterceptor.updateProgress(requestId, 100);
      
      return result;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    } finally {
      // Remove request from tracking after a short delay
      setTimeout(() => {
        this.requestInterceptor.removeRequest(requestId);
      }, 1000);
    }
  }

  // Simulate document processing progress with realistic stages
  simulateDocumentProcessingProgress(requestId) {
    const stages = [
      { progress: 10, message: 'Uploading document...' },
      { progress: 25, message: 'Extracting text with OCR...' },
      { progress: 45, message: 'Analyzing content...' },
      { progress: 70, message: 'Evaluating degree relevance...' },
      { progress: 85, message: 'Calculating credits...' },
      { progress: 95, message: 'Generating results...' }
    ];

    stages.forEach((stage, index) => {
      setTimeout(() => {
        this.requestInterceptor.updateProgress(requestId, stage.progress);
        // You could also update a message field if needed
      }, (index + 1) * 800); // 800ms between stages
    });
  }

  // Download report with progress tracking
  async downloadReport(processingId) {
    const requestId = this.generateRequestId();
    
    try {
      this.requestInterceptor.addRequest(requestId, {
        url: `${this.baseUrl}/api/download/${processingId}`,
        method: 'GET',
        type: 'download_report'
      });

      const response = await fetch(`${this.baseUrl}/api/download/${processingId}`);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Update progress to 100% when complete
      this.requestInterceptor.updateProgress(requestId, 100);
      
      return blob;
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    } finally {
      setTimeout(() => {
        this.requestInterceptor.removeRequest(requestId);
      }, 500);
    }
  }

  // Cache management methods
  clearCache() {
    this.cache.clear();
  }

  refreshDegreePrograms() {
    this.cache.remove(CACHE_CONFIG.DEGREES_CACHE_KEY);
    return this.getDegreePrograms(true);
  }

  refreshHealthCheck() {
    this.cache.remove(CACHE_CONFIG.HEALTH_CACHE_KEY);
    return this.checkHealth();
  }

  // Get request interceptor for components to subscribe to
  getRequestInterceptor() {
    return this.requestInterceptor;
  }

  // Get cache status
  getCacheStatus() {
    return {
      degrees: this.cache.get(CACHE_CONFIG.DEGREES_CACHE_KEY) ? 'cached' : 'not_cached',
      health: this.cache.get(CACHE_CONFIG.HEALTH_CACHE_KEY) ? 'cached' : 'not_cached'
    };
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export the request interceptor for direct access
export const requestInterceptor = apiService.getRequestInterceptor(); 