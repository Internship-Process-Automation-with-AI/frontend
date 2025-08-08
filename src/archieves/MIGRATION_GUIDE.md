# API Migration Guide

This guide shows how to migrate from the old monolithic `api.js` to the new organized API structure.

## Overview

The API calls have been reorganized into separate modules for better code organization:

- `studentAPI.js` - All student-related API functions
- `reviewerApi.js` - All reviewer-related API functions  
- `config.js` - Shared configuration and endpoints
- `index.js` - Central export point

## Migration Steps

### 1. Replace Old Imports

**Before:**
```javascript
import apiService from '../../api.js'
import { requestInterceptor } from '../../api.js'
```

**After:**
```javascript
// Option 1: Import specific functions (recommended)
import { 
  verifyStudent, 
  getStudentApplications, 
  uploadCertificate,
  submitAppeal,
  getReviewers 
} from '../../api_calls/studentAPI.js'

// Option 2: Import from central index
import { 
  verifyStudent, 
  getStudentApplications, 
  uploadCertificate 
} from '../../api_calls/index.js'

// Import request interceptor if needed
import { requestInterceptor } from '../../api_calls/studentAPI.js'
```

### 2. Update Function Calls

**Before:**
```javascript
// Old way - through apiService object
const student = await apiService.verifyStudent(email)
const applications = await apiService.getStudentApplications(email)
const result = await apiService.uploadCertificate(studentId, file, type)
const reviewers = await apiService.getReviewers()
await apiService.submitAppeal(certId, reason, reviewerId)
```

**After:**
```javascript
// New way - direct function calls
const student = await verifyStudent(email)
const applications = await getStudentApplications(email)
const result = await uploadCertificate(studentId, file, type)
const reviewers = await getReviewers()
await submitAppeal(certId, reason, reviewerId)
```

## Student API Functions

### Available Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `verifyStudent(email)` | Verify student by email | `email: string` |
| `getStudentApplications(email)` | Get all student applications | `email: string` |
| `uploadCertificate(studentId, file, trainingType)` | Upload certificate | `studentId: string, file: File, trainingType: string` |
| `processCertificate(certificateId)` | Process certificate with AI | `certificateId: string` |
| `downloadCertificate(certificateId)` | Download certificate file | `certificateId: string` |
| `previewCertificate(certificateId)` | Get preview URL | `certificateId: string` |
| `addFeedback(certificateId, feedback, reviewerId?)` | Add student feedback | `certificateId: string, feedback: string, reviewerId?: string` |
| `deleteApplication(certificateId)` | Delete application | `certificateId: string` |
| `sendForApproval(certificateId, reviewerId)` | Send for reviewer approval | `certificateId: string, reviewerId: string` |
| `submitAppeal(certificateId, reason, reviewerId?)` | Submit appeal | `certificateId: string, reason: string, reviewerId?: string` |
| `getReviewers()` | Get list of reviewers | None |

### Helper Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `triggerFileDownload(blob, filename)` | Trigger browser download | `blob: Blob, filename: string` |
| `downloadAndSaveCertificate(certificateId, filename?)` | Download and save file | `certificateId: string, filename?: string` |

## Example Migrations

### 1. RequestReview Component

**Before:**
```javascript
import React, { useState, useEffect } from 'react'
import apiService from '../../api.js'

const RequestReview = ({ certificateId }) => {
  const [reviewers, setReviewers] = useState([])
  
  useEffect(() => {
    const loadReviewers = async () => {
      const list = await apiService.getReviewers()
      setReviewers(list)
    }
    loadReviewers()
  }, [])

  const handleSubmit = async (reason, reviewerId) => {
    await apiService.submitAppeal(certificateId, reason, reviewerId)
  }
  
  // ... rest of component
}
```

**After:**
```javascript
import React, { useState, useEffect } from 'react'
import { getReviewers, submitAppeal } from '../../api_calls/studentAPI.js'

const RequestReview = ({ certificateId }) => {
  const [reviewers, setReviewers] = useState([])
  
  useEffect(() => {
    const loadReviewers = async () => {
      const list = await getReviewers()
      setReviewers(list)
    }
    loadReviewers()
  }, [])

  const handleSubmit = async (reason, reviewerId) => {
    await submitAppeal(certificateId, reason, reviewerId)
  }
  
  // ... rest of component
}
```

### 2. StudentDashboard Component

**Before:**
```javascript
import apiService from '../api.js'

const StudentDashboard = () => {
  const fetchApplications = async () => {
    const apps = await apiService.getStudentApplications(email)
    setApplications(apps)
  }

  const handleUpload = async (file, type) => {
    const result = await apiService.uploadCertificate(studentId, file, type)
    return result
  }

  const handleDelete = async (certId) => {
    await apiService.deleteApplication(certId)
  }
}
```

**After:**
```javascript
import { 
  getStudentApplications, 
  uploadCertificate, 
  deleteApplication 
} from '../api_calls/studentAPI.js'

const StudentDashboard = () => {
  const fetchApplications = async () => {
    const apps = await getStudentApplications(email)
    setApplications(apps)
  }

  const handleUpload = async (file, type) => {
    const result = await uploadCertificate(studentId, file, type)
    return result
  }

  const handleDelete = async (certId) => {
    await deleteApplication(certId)
  }
}
```

### 3. With Request Interceptor

**Before:**
```javascript
import apiService, { requestInterceptor } from '../api.js'

const MyComponent = () => {
  useEffect(() => {
    const unsubscribe = requestInterceptor.subscribe((requests) => {
      console.log('Active requests:', requests)
    })
    return unsubscribe
  }, [])

  const handleAction = async () => {
    await apiService.uploadCertificate(studentId, file, type)
  }
}
```

**After:**
```javascript
import { uploadCertificate, requestInterceptor } from '../api_calls/studentAPI.js'

const MyComponent = () => {
  useEffect(() => {
    const unsubscribe = requestInterceptor.subscribe((requests) => {
      console.log('Active requests:', requests)
    })
    return unsubscribe
  }, [])

  const handleAction = async () => {
    await uploadCertificate(studentId, file, type)
  }
}
```

## Benefits of New Structure

### 1. Better Organization
- Student functions in `studentAPI.js`
- Reviewer functions in `reviewerApi.js`
- Clear separation of concerns

### 2. Improved Tree-Shaking
```javascript
// Only imports the functions you actually use
import { uploadCertificate, submitAppeal } from '../api_calls/studentAPI.js'
```

### 3. Better Documentation
- Each function has detailed JSDoc comments
- Clear parameter types and return values
- Comprehensive error handling documentation

### 4. Consistent Error Handling
- All functions use the same error handling pattern
- Consistent timeout and network error handling
- Standardized error messages

### 5. Easier Testing
```javascript
// Easy to mock individual functions
import { uploadCertificate } from '../api_calls/studentAPI.js'

jest.mock('../api_calls/studentAPI.js', () => ({
  uploadCertificate: jest.fn()
}))
```

## Configuration

All API endpoints are centrally configured in `config.js`:

```javascript
export const API_ENDPOINTS = {
  // Student endpoints
  STUDENT_LOOKUP: email => `/student/${email}`,
  UPLOAD_CERTIFICATE: studentId => `/student/${studentId}/upload-certificate`,
  
  // Certificate endpoints
  PROCESS_CERTIFICATE: certificateId => `/certificate/${certificateId}/process`,
  CERTIFICATE_APPEAL: certificateId => `/certificate/${certificateId}/appeal`,
  
  // ... more endpoints
}
```

## Migration Checklist

- [ ] Replace `import apiService` with specific function imports
- [ ] Update function calls from `apiService.method()` to `method()`
- [ ] Update request interceptor imports if used
- [ ] Test all API functionality
- [ ] Update any mocks or tests
- [ ] Remove old `api.js` imports

## Need Help?

If you encounter issues during migration:

1. Check that all required functions are imported
2. Verify endpoint configurations in `config.js`
3. Ensure function signatures match the documentation
4. Check browser console for any import errors

The new structure maintains backward compatibility in function signatures, so only the import statements need to change. 