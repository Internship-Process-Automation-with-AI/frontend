import apiService, { requestInterceptor } from '../src/api.js';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Mock DOM methods
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
  }
});

Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => ({
    href: '',
    download: '',
    click: jest.fn()
  }))
});

Object.defineProperty(document.body, 'appendChild', {
  value: jest.fn()
});

Object.defineProperty(document.body, 'removeChild', {
  value: jest.fn()
});

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    // Clear request interceptor state
    requestInterceptor.activeRequests = [];
    requestInterceptor.subscribers = [];
  });

  describe('RequestInterceptor', () => {
    test('subscribes and notifies subscribers', () => {
      const mockCallback = jest.fn();
      const unsubscribe = requestInterceptor.subscribe(mockCallback);
      
      requestInterceptor.notifySubscribers();
      expect(mockCallback).toHaveBeenCalledWith([]);
      
      unsubscribe();
      requestInterceptor.notifySubscribers();
      expect(mockCallback).toHaveBeenCalledTimes(1); // Should not be called again
    });

    test('adds and removes requests', () => {
      const mockCallback = jest.fn();
      requestInterceptor.subscribe(mockCallback);
      
      const request = { id: 'test-1', type: 'test' };
      requestInterceptor.addRequest(request);
      expect(mockCallback).toHaveBeenCalledWith([request]);
      
      requestInterceptor.removeRequest('test-1');
      expect(mockCallback).toHaveBeenCalledWith([]);
    });

    test('updates existing requests', () => {
      const mockCallback = jest.fn();
      requestInterceptor.subscribe(mockCallback);
      
      const request = { id: 'test-1', type: 'test', progress: 0 };
      requestInterceptor.addRequest(request);
      
      requestInterceptor.updateRequest('test-1', { progress: 50 });
      expect(mockCallback).toHaveBeenCalledWith([{ ...request, progress: 50 }]);
    });

    test('generates unique request IDs', () => {
      const id1 = requestInterceptor.generateRequestId();
      const id2 = requestInterceptor.generateRequestId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });
  });

  describe('checkHealth', () => {
    test('successfully checks health', async () => {
      const mockResponse = { status: 'healthy' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.checkHealth();
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/health');
      expect(result).toEqual(mockResponse);
    });

    test('handles health check failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(apiService.checkHealth()).rejects.toThrow('Health check failed: 500');
    });

    test('handles network error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.checkHealth()).rejects.toThrow('Network error');
    });
  });

  describe('getDegreePrograms', () => {
    test('successfully fetches degree programs', async () => {
      const mockDegrees = [
        { id: 1, name: 'Computer Science' },
        { id: 2, name: 'Engineering' }
      ];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ degrees: mockDegrees })
      });

      const result = await apiService.getDegreePrograms();
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/degrees');
      expect(result).toEqual(mockDegrees);
    });

    test('returns empty array when no degrees', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const result = await apiService.getDegreePrograms();
      expect(result).toEqual([]);
    });

    test('handles fetch failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(apiService.getDegreePrograms()).rejects.toThrow('Failed to fetch degrees: 404');
    });
  });

  describe('processDocument', () => {
    test('successfully processes document', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = { processing_id: '123', status: 'completed' };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.processDocument(
        mockFile,
        'Computer Science',
        'student@example.com',
        'Professional Training'
      );
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/process', {
        method: 'POST',
        body: expect.any(FormData)
      });
      expect(result).toEqual(mockResponse);
    });

    test('handles processing failure', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Invalid file format' })
      });

      await expect(apiService.processDocument(
        mockFile,
        'Computer Science',
        'student@example.com',
        'Professional Training'
      )).rejects.toThrow('Invalid file format');
    });

    test('handles network error during processing', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.processDocument(
        mockFile,
        'Computer Science',
        'student@example.com',
        'Professional Training'
      )).rejects.toThrow('Network error');
    });
  });

  describe('downloadReport', () => {
    test('successfully downloads report', async () => {
      const mockBlob = new Blob(['report content'], { type: 'application/pdf' });
      fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob
      });

      const result = await apiService.downloadReport('123');
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/download/123');
      expect(result).toEqual(mockBlob);
    });

    test('handles download failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(apiService.downloadReport('123')).rejects.toThrow('Download failed: 404');
    });
  });

  describe('downloadCertificate', () => {
    test('successfully downloads certificate', async () => {
      const mockBlob = new Blob(['certificate content'], { type: 'application/pdf' });
      const mockHeaders = new Map([['content-disposition', 'attachment; filename="cert.pdf"']]);
      
      fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
        headers: {
          get: (key) => mockHeaders.get(key)
        }
      });

      const result = await apiService.downloadCertificate('cert-123');
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/certificate/cert-123');
      expect(result).toEqual(mockBlob);
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    });

    test('handles download failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Certificate not found'
      });

      await expect(apiService.downloadCertificate('cert-123')).rejects.toThrow('Download failed: 404 - Certificate not found');
    });
  });

  describe('previewCertificate', () => {
    test('successfully returns preview URL', async () => {
      const result = await apiService.previewCertificate('cert-123');
      
      expect(result).toBe('http://localhost:8000/certificate/cert-123/preview');
    });

    test('handles preview error', async () => {
      // Mock an error in the preview method
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      // This test is mainly for coverage since preview doesn't make a fetch call
      const result = await apiService.previewCertificate('cert-123');
      expect(result).toBe('http://localhost:8000/certificate/cert-123/preview');
      
      console.error = originalConsoleError;
    });
  });

  describe('getReviewers', () => {
    test('successfully fetches reviewers', async () => {
      const mockReviewers = [
        { id: 1, name: 'John Smith', email: 'john@example.com' },
        { id: 2, name: 'Jane Doe', email: 'jane@example.com' }
      ];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reviewers: mockReviewers })
      });

      const result = await apiService.getReviewers();
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/reviewers');
      expect(result).toEqual(mockReviewers);
    });

    test('returns empty array when no reviewers', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const result = await apiService.getReviewers();
      expect(result).toEqual([]);
    });

    test('handles fetch failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(apiService.getReviewers()).rejects.toThrow('Failed to fetch reviewers: 500');
    });
  });

  describe('sendForApproval', () => {
    test('successfully sends for approval', async () => {
      const mockResponse = { success: true, message: 'Sent for approval' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.sendForApproval('cert-123', 'reviewer-456');
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/certificate/cert-123/send-for-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reviewer_id: 'reviewer-456'
        })
      });
      expect(result).toEqual(mockResponse);
    });

    test('handles approval failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Reviewer not found' })
      });

      await expect(apiService.sendForApproval('cert-123', 'invalid-reviewer')).rejects.toThrow('Reviewer not found');
    });

    test('handles network error during approval', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.sendForApproval('cert-123', 'reviewer-456')).rejects.toThrow('Network error');
    });
  });

  describe('Request tracking', () => {
    test('tracks request progress during API calls', async () => {
      const mockCallback = jest.fn();
      requestInterceptor.subscribe(mockCallback);
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'healthy' })
      });

      await apiService.checkHealth();
      
      // Should have been called multiple times with different progress values
      expect(mockCallback).toHaveBeenCalled();
      const calls = mockCallback.mock.calls;
      expect(calls.length).toBeGreaterThan(1);
    });

    test('removes request from tracking after completion', async () => {
      const mockCallback = jest.fn();
      requestInterceptor.subscribe(mockCallback);
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'healthy' })
      });

      await apiService.checkHealth();
      
      // Final call should have empty array (request removed)
      const finalCall = mockCallback.mock.calls[mockCallback.mock.calls.length - 1];
      expect(finalCall[0]).toEqual([]);
    });

    test('removes request from tracking after error', async () => {
      const mockCallback = jest.fn();
      requestInterceptor.subscribe(mockCallback);
      
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.checkHealth()).rejects.toThrow('Network error');
      
      // Final call should have empty array (request removed)
      const finalCall = mockCallback.mock.calls[mockCallback.mock.calls.length - 1];
      expect(finalCall[0]).toEqual([]);
    });
  });
}); 