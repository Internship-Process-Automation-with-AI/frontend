// API service for communicating with the backend
const API_BASE_URL = 'http://localhost:8000';

// Request interceptor for tracking API calls
class RequestInterceptor {
  constructor() {
    this.subscribers = [];
    this.activeRequests = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => callback([...this.activeRequests]));
  }

  addRequest(request) {
    this.activeRequests.push(request);
    this.notifySubscribers();
  }

  updateRequest(requestId, updates) {
    const index = this.activeRequests.findIndex(req => req.id === requestId);
    if (index !== -1) {
      this.activeRequests[index] = { ...this.activeRequests[index], ...updates };
      this.notifySubscribers();
    }
  }

  removeRequest(requestId) {
    this.activeRequests = this.activeRequests.filter(req => req.id !== requestId);
    this.notifySubscribers();
  }

  generateRequestId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Create singleton instance
const requestInterceptor = new RequestInterceptor();

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Health check
  async checkHealth() {
    const requestId = requestInterceptor.generateRequestId();
    const request = {
      id: requestId,
      type: 'health_check',
      progress: 0,
      startTime: Date.now()
    };
    
    requestInterceptor.addRequest(request);
    
    try {
      requestInterceptor.updateRequest(requestId, { progress: 25 });
      const response = await fetch(`${this.baseUrl}/api/health`);
      requestInterceptor.updateRequest(requestId, { progress: 75 });
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const result = await response.json();
      requestInterceptor.updateRequest(requestId, { progress: 100 });
      requestInterceptor.removeRequest(requestId);
      return result;
    } catch (error) {
      requestInterceptor.removeRequest(requestId);
      console.error('Health check error:', error);
      throw error;
    }
  }

  // Get degree programs
  async getDegreePrograms() {
    const requestId = requestInterceptor.generateRequestId();
    const request = {
      id: requestId,
      type: 'fetch_degrees',
      progress: 0,
      startTime: Date.now()
    };
    
    requestInterceptor.addRequest(request);
    
    try {
      requestInterceptor.updateRequest(requestId, { progress: 25 });
      const response = await fetch(`${this.baseUrl}/api/degrees`);
      requestInterceptor.updateRequest(requestId, { progress: 75 });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch degrees: ${response.status}`);
      }
      
      const data = await response.json();
      requestInterceptor.updateRequest(requestId, { progress: 100 });
      requestInterceptor.removeRequest(requestId);
      return data.degrees || [];
    } catch (error) {
      requestInterceptor.removeRequest(requestId);
      console.error('Error fetching degree programs:', error);
      throw error;
    }
  }

  // Process document
  async processDocument(file, studentDegree, studentEmail, trainingType) {
    const requestId = requestInterceptor.generateRequestId();
    const request = {
      id: requestId,
      type: 'process_document',
      progress: 0,
      startTime: Date.now(),
      fileName: file.name,
      fileSize: file.size
    };
    
    requestInterceptor.addRequest(request);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('student_degree', studentDegree);
      formData.append('student_email', studentEmail);
      formData.append('training_type', trainingType);

      requestInterceptor.updateRequest(requestId, { progress: 10 });
      
      const response = await fetch(`${this.baseUrl}/api/process`, {
        method: 'POST',
        body: formData,
      });

      requestInterceptor.updateRequest(requestId, { progress: 50 });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Processing failed: ${response.status}`);
      }

      const result = await response.json();
      requestInterceptor.updateRequest(requestId, { progress: 100 });
      requestInterceptor.removeRequest(requestId);
      return result;
    } catch (error) {
      requestInterceptor.removeRequest(requestId);
      console.error('Error processing document:', error);
      throw error;
    }
  }

  // Download report (placeholder for future implementation)
  async downloadReport(processingId) {
    const requestId = requestInterceptor.generateRequestId();
    const request = {
      id: requestId,
      type: 'download_report',
      progress: 0,
      startTime: Date.now()
    };
    
    requestInterceptor.addRequest(request);
    
    try {
      requestInterceptor.updateRequest(requestId, { progress: 25 });
      const response = await fetch(`${this.baseUrl}/api/download/${processingId}`);
      requestInterceptor.updateRequest(requestId, { progress: 75 });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const result = await response.blob();
      requestInterceptor.updateRequest(requestId, { progress: 100 });
      requestInterceptor.removeRequest(requestId);
      return result;
    } catch (error) {
      requestInterceptor.removeRequest(requestId);
      console.error('Error downloading report:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
export { requestInterceptor }; 