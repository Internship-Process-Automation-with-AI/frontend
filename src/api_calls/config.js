/**
 * API Configuration for OAMK Work Certificate Processor
 *
 * Base configuration for making API calls to the FastAPI backend.
 */

// Base API URL - adjust based on your backend deployment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
console.log('API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
}

// API endpoints configuration
export const API_ENDPOINTS = {
  // Student endpoints
  STUDENT_LOOKUP: email => `/student/${email}`,
  UPLOAD_CERTIFICATE: studentId => `/student/${studentId}/upload-certificate`,

  // Certificate endpoints
  PROCESS_CERTIFICATE: certificateId => `/certificate/${certificateId}/process`,
  DOWNLOAD_CERTIFICATE: certificateId => `/certificate/${certificateId}`,
  CERTIFICATE_DETAILS: certificateId => `/certificate/${certificateId}/details`,
  CERTIFICATE_FEEDBACK: certificateId =>
    `/certificate/${certificateId}/feedback`,
  CERTIFICATE_REVIEW: certificateId => `/certificate/${certificateId}/review`,

  // Reviewer endpoints
  REVIEWERS_LIST: '/reviewers',
  REVIEWER_LOOKUP: email => `/reviewer/${email}`,
  REVIEWER_CERTIFICATES: reviewerId => `/reviewer/${reviewerId}/certificates`
}

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000 // 30 seconds

// Helper function to build full URL
export const buildUrl = endpoint => {
  return `${API_BASE_URL}${endpoint}`
}

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'Unauthorized access. Please check your credentials.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Invalid data provided.'
}
