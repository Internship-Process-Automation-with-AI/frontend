import { useState, useRef, useEffect } from 'react'
import { GraduationCapIcon, ChevronDownIcon, UserIcon, MailIcon, AcademicCapIcon, LogoutIcon } from './Icons.jsx'

const Header = ({ studentData, reviewerData, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const userData = studentData || reviewerData
  const isStudent = !!studentData
  const isReviewer = !!reviewerData

  const getUserDetails = () => {
    if (isStudent) {
      // Get email from localStorage if not in studentData
      const storedEmail = localStorage.getItem('studentEmail')
      return {
        name: `${studentData.first_name} ${studentData.last_name}`,
        email: studentData.email || storedEmail || 'Email not available',
        role: 'Student',
        additionalInfo: studentData.degree || 'Degree not specified',
        additionalLabel: 'Degree'
      }
    } else if (isReviewer) {
      // Get email from localStorage if not in reviewerData
      const storedEmail = localStorage.getItem('reviewerEmail')
      return {
        name: `${reviewerData.first_name} ${reviewerData.last_name}`,
        email: reviewerData.email || storedEmail || 'Email not available',
        role: 'Reviewer',
        additionalInfo: reviewerData.position || reviewerData.department || 'Reviewer',
        additionalLabel: 'Position'
      }
    }
    return null
  }

  const details = getUserDetails()

  return (
    <header className="bg-gradient-to-r from-oamk-orange-600 to-oamk-orange-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center">
            <div className="bg-white rounded-full p-1.5 mr-3 shadow-md">
              <GraduationCapIcon className="w-6 h-6 text-oamk-orange-500" />
            </div>
            <span className="text-white text-xl font-bold">OAMK</span>
          </div>
          
          {userData && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                <UserIcon className="w-4 h-4" />
                <span>{details.name}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="bg-oamk-orange-100 rounded-full p-2">
                        <UserIcon className="w-6 h-6 text-oamk-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{details.name}</h3>
                        <p className="text-sm text-gray-500">{details.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="px-4 py-3 space-y-3">
                    <div className="flex items-center space-x-3">
                      <MailIcon className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm text-gray-800">{details.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">{details.additionalLabel}</p>
                        <p className="text-sm text-gray-800">{details.additionalInfo}</p>
                      </div>
                    </div>
                  </div>

                  {/* Logout Section */}
                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false)
                        onLogout()
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <LogoutIcon className="w-4 h-4 text-red-500" />
                      <span className="text-red-600 font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header 