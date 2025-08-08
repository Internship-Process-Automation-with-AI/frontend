import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmailEntry from '../components/common/EmailEntry.jsx'
import { GraduationCapIcon } from '../components/common/Icons.jsx'
import { verifyStudent } from '../api_calls/studentAPI.js'

const StudentLanding = () => {
  const [studentEmail, setStudentEmail] = useState('')
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const navigate = useNavigate()

  const handleEmailSubmit = async () => {
    if (!studentEmail.trim()) {
      setError('Please enter your email address.')
      return
    }

    try {
      setError(null)
      setIsProcessing(true)
      const studentData = await verifyStudent(studentEmail)
      
      // Store student data in localStorage for persistence
      localStorage.setItem('studentEmail', studentEmail)
      localStorage.setItem('studentData', JSON.stringify(studentData))
      
      // Navigate to student dashboard
      navigate('/student/dashboard', { 
        state: { studentEmail, studentData },
        replace: true 
      })
    } catch (err) {
      console.error('Email submission error:', err)
      setError(err.message || 'Failed to verify student. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="card text-center">
          <div className="bg-gradient-to-r from-oamk-orange-500 to-oamk-orange-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <GraduationCapIcon className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Portal</h1>
          <p className="text-gray-600 mb-8">Access your training credit applications</p>
          
          <EmailEntry
            studentEmail={studentEmail}
            setStudentEmail={setStudentEmail}
            error={error}
            isProcessing={isProcessing}
            onEmailSubmit={handleEmailSubmit}
          />
        </div>
      </div>
    </div>
  )
}

export default StudentLanding 