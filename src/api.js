// API service for communicating with the backend
const API_BASE_URL = 'http://localhost:8000'

// Request interceptor for tracking API calls
class RequestInterceptor {
  constructor () {
    this.subscribers = []
    this.activeRequests = []
  }

  subscribe (callback) {
    this.subscribers.push(callback)
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  notifySubscribers () {
    this.subscribers.forEach(callback => callback([...this.activeRequests]))
  }

  addRequest (request) {
    this.activeRequests.push(request)
    this.notifySubscribers()
  }

  updateRequest (requestId, updates) {
    const index = this.activeRequests.findIndex(req => req.id === requestId)
    if (index !== -1) {
      this.activeRequests[index] = { ...this.activeRequests[index], ...updates }
      this.notifySubscribers()
    }
  }

  removeRequest (requestId) {
    this.activeRequests = this.activeRequests.filter(
      req => req.id !== requestId
    )
    this.notifySubscribers()
  }

  generateRequestId () {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

// Create singleton instance
const requestInterceptor = new RequestInterceptor()

class ApiService {
  constructor () {
    this.baseUrl = API_BASE_URL
  }

  // Health check
  async checkHealth () {
    const requestId = requestInterceptor.generateRequestId()
    const request = {
      id: requestId,
      type: 'health_check',
      progress: 0,
      startTime: Date.now()
    }

    requestInterceptor.addRequest(request)

    try {
      requestInterceptor.updateRequest(requestId, { progress: 25 })
      const response = await fetch(`${this.baseUrl}/api/health`)
      requestInterceptor.updateRequest(requestId, { progress: 75 })

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }

      const result = await response.json()
      requestInterceptor.updateRequest(requestId, { progress: 100 })
      requestInterceptor.removeRequest(requestId)
      return result
    } catch (error) {
      requestInterceptor.removeRequest(requestId)
      console.error('Health check error:', error)
      throw error
    }
  }

  // Get degree programs
  async getDegreePrograms () {
    const requestId = requestInterceptor.generateRequestId()
    const request = {
      id: requestId,
      type: 'fetch_degrees',
      progress: 0,
      startTime: Date.now()
    }

    requestInterceptor.addRequest(request)

    try {
      requestInterceptor.updateRequest(requestId, { progress: 25 })
      const response = await fetch(`${this.baseUrl}/api/degrees`)
      requestInterceptor.updateRequest(requestId, { progress: 75 })

      if (!response.ok) {
        throw new Error(`Failed to fetch degrees: ${response.status}`)
      }

      const data = await response.json()
      requestInterceptor.updateRequest(requestId, { progress: 100 })
      requestInterceptor.removeRequest(requestId)
      return data.degrees || []
    } catch (error) {
      requestInterceptor.removeRequest(requestId)
      console.error('Error fetching degree programs:', error)
      throw error
    }
  }

  // Process document
  async processDocument (file, studentDegree, studentEmail, trainingType) {
    const requestId = requestInterceptor.generateRequestId()
    const request = {
      id: requestId,
      type: 'process_document',
      progress: 0,
      startTime: Date.now(),
      fileName: file.name,
      fileSize: file.size
    }

    requestInterceptor.addRequest(request)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('student_degree', studentDegree)
      formData.append('student_email', studentEmail)
      formData.append('training_type', trainingType)

      requestInterceptor.updateRequest(requestId, { progress: 10 })

      const response = await fetch(`${this.baseUrl}/api/process`, {
        method: 'POST',
        body: formData
      })

      requestInterceptor.updateRequest(requestId, { progress: 50 })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.detail || `Processing failed: ${response.status}`
        )
      }

      const result = await response.json()
      requestInterceptor.updateRequest(requestId, { progress: 100 })
      requestInterceptor.removeRequest(requestId)
      return result
    } catch (error) {
      requestInterceptor.removeRequest(requestId)
      console.error('Error processing document:', error)
      throw error
    }
  }

  // Download report (placeholder for future implementation)
  async downloadReport (processingId) {
    const requestId = requestInterceptor.generateRequestId()
    const request = {
      id: requestId,
      type: 'download_report',
      progress: 0,
      startTime: Date.now()
    }

    requestInterceptor.addRequest(request)

    try {
      requestInterceptor.updateRequest(requestId, { progress: 25 })
      const response = await fetch(
        `${this.baseUrl}/api/download/${processingId}`
      )
      requestInterceptor.updateRequest(requestId, { progress: 75 })

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const result = await response.blob()
      requestInterceptor.updateRequest(requestId, { progress: 100 })
      requestInterceptor.removeRequest(requestId)
      return result
    } catch (error) {
      requestInterceptor.removeRequest(requestId)
      console.error('Error downloading report:', error)
      throw error
    }
  }

  // Download certificate file
  async downloadCertificate (certificateId) {
    const requestId = requestInterceptor.generateRequestId()
    const request = {
      id: requestId,
      type: 'download_certificate',
      progress: 0,
      startTime: Date.now()
    }

    requestInterceptor.addRequest(request)

    try {
      requestInterceptor.updateRequest(requestId, { progress: 25 })
      console.log(
        'Making download request to:',
        `${this.baseUrl}/certificate/${certificateId}`
      )
      const response = await fetch(
        `${this.baseUrl}/certificate/${certificateId}`
      )
      requestInterceptor.updateRequest(requestId, { progress: 75 })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Download response error:', response.status, errorText)
        throw new Error(`Download failed: ${response.status} - ${errorText}`)
      }

      const blob = await response.blob()
      requestInterceptor.updateRequest(requestId, { progress: 100 })
      requestInterceptor.removeRequest(requestId)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download =
        response.headers.get('content-disposition')?.split('filename=')[1] ||
        'certificate'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return blob
    } catch (error) {
      requestInterceptor.removeRequest(requestId)
      console.error('Error downloading certificate:', error)
      throw error
    }
  }

  // Preview certificate file
  async previewCertificate (certificateId) {
    const requestId = requestInterceptor.generateRequestId()
    const request = {
      id: requestId,
      type: 'preview_certificate',
      progress: 0,
      startTime: Date.now()
    }

    requestInterceptor.addRequest(request)

    try {
      requestInterceptor.updateRequest(requestId, { progress: 25 })
      console.log(
        'Making preview request to:',
        `${this.baseUrl}/certificate/${certificateId}/preview`
      )

      // For preview, we'll return the direct URL instead of fetching the blob
      // This allows the iframe to load the content directly
      const previewUrl = `${this.baseUrl}/certificate/${certificateId}/preview`

      requestInterceptor.updateRequest(requestId, { progress: 100 })
      requestInterceptor.removeRequest(requestId)

      return previewUrl
    } catch (error) {
      requestInterceptor.removeRequest(requestId)
      console.error('Error previewing certificate:', error)
      throw error
    }
  }

  // Get reviewers
  async getReviewers () {
    const requestId = requestInterceptor.generateRequestId()
    const request = {
      id: requestId,
      type: 'fetch_reviewers',
      progress: 0,
      startTime: Date.now()
    }

    requestInterceptor.addRequest(request)

    try {
      requestInterceptor.updateRequest(requestId, { progress: 25 })
      const response = await fetch(`${this.baseUrl}/reviewers`)
      requestInterceptor.updateRequest(requestId, { progress: 75 })

      if (!response.ok) {
        throw new Error(`Failed to fetch reviewers: ${response.status}`)
      }

      const data = await response.json()
      requestInterceptor.updateRequest(requestId, { progress: 100 })
      requestInterceptor.removeRequest(requestId)
      return data.reviewers || []
    } catch (error) {
      requestInterceptor.removeRequest(requestId)
      console.error('Error fetching reviewers:', error)
      throw error
    }
  }

  // Send for approval
  async sendForApproval (certificateId, reviewerId) {
    const requestId = requestInterceptor.generateRequestId()
    const request = {
      id: requestId,
      type: 'send_for_approval',
      progress: 0,
      startTime: Date.now()
    }

    requestInterceptor.addRequest(request)

    try {
      requestInterceptor.updateRequest(requestId, { progress: 25 })
      const response = await fetch(
        `${this.baseUrl}/certificate/${certificateId}/send-for-approval`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reviewer_id: reviewerId
          })
        }
      )

      requestInterceptor.updateRequest(requestId, { progress: 75 })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.detail || `Failed to send for approval: ${response.status}`
        )
      }

      const result = await response.json()
      requestInterceptor.updateRequest(requestId, { progress: 100 })
      requestInterceptor.removeRequest(requestId)
      return result
    } catch (error) {
      requestInterceptor.removeRequest(requestId)
      console.error('Error sending for approval:', error)
      throw error
    }
  }
  // here
  // Verify student by email
  async verifyStudent (email) {
    const response = await fetch(
      `${this.baseUrl}/student/${encodeURIComponent(email)}`
    )
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to verify student')
    }
    return await response.json()
  }

  // Get student applications
  async getStudentApplications (email) {
    const response = await fetch(
      `${this.baseUrl}/student/${encodeURIComponent(email)}/applications`
    )
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to fetch applications')
    }
    const data = await response.json()
    return data.applications || []
  }

  // Upload certificate
  async uploadCertificate (studentId, file, trainingType) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('training_type', trainingType)
    const response = await fetch(
      `${this.baseUrl}/student/${studentId}/upload-certificate`,
      {
        method: 'POST',
        body: formData
      }
    )
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to upload certificate')
    }
    return await response.json()
  }

  // Process certificate
  async processCertificate (certificateId) {
    const response = await fetch(
      `${this.baseUrl}/certificate/${certificateId}/process`,
      {
        method: 'POST'
      }
    )
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to process certificate')
    }
    return await response.json()
  }

  // Delete application
  async deleteApplication (applicationId) {
    const response = await fetch(
      `${this.baseUrl}/certificate/${applicationId}`,
      {
        method: 'DELETE'
      }
    )
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to delete application')
    }
    return true
  }
}

// Create and export a singleton instance
const apiService = new ApiService()
export default apiService
export { requestInterceptor }
