import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'
import Student from './components/Student.jsx'
import Reviewer from './components/Reviewer.jsx'
import apiService from './api.js'
import { useState, useEffect } from 'react'

// Navigation component
const Navigation = () => {
  const location = useLocation()
  const [apiHealth, setApiHealth] = useState(null)

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const health = await apiService.checkHealth()
        setApiHealth(health)
      } catch (error) {
        console.warn('API health check failed:', error)
        setApiHealth({ status: 'unhealthy', error: error.message })
      }
    }

    checkApiHealth()
  }, [])

  const GraduationCapIcon = ({ className = "w-6 h-6", ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  )

  const UserIcon = ({ className = "w-6 h-6", ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )

  const ClipboardCheckIcon = ({ className = "w-6 h-6", ...props }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )

  const isStudentRoute = location.pathname === '/student'
  const isReviewerRoute = location.pathname === '/reviewer'

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-oamk-orange-500 rounded-lg flex items-center justify-center mr-3">
              <GraduationCapIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">OAMK Work Certificate Processor</h1>
              <p className="text-sm text-gray-600">Academic Credit Evaluation System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-8">
            <Link
              to="/student"
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isStudentRoute
                  ? 'bg-oamk-orange-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <UserIcon className="w-5 h-5 mr-2" />
              Student Portal
            </Link>
            <Link
              to="/reviewer"
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isReviewerRoute
                  ? 'bg-oamk-orange-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ClipboardCheckIcon className="w-5 h-5 mr-2" />
              Reviewer Portal
            </Link>
          </nav>

          {/* API Status Indicator */}
          {apiHealth && (
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                apiHealth.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                apiHealth.status === 'healthy' ? 'text-green-700' : 'text-red-700'
              }`}>
                API {apiHealth.status === 'healthy' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// Main App component
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Student />} />
            <Route path="/student" element={<Student />} />
            <Route path="/reviewer" element={<Reviewer />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
