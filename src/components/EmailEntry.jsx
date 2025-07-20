import { GraduationCapIcon, MailIcon, AlertCircleIcon, LoaderIcon } from './Icons.jsx'
import Header from './Header.jsx'

const EmailEntry = ({ 
  studentEmail, 
  setStudentEmail, 
  error, 
  isProcessing, 
  onEmailSubmit, 
  onLogout 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header onLogout={onLogout} />
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
        <div className="card max-w-sm mx-auto transform hover:scale-105 transition-transform duration-300">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-oamk-orange-500 to-oamk-orange-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <GraduationCapIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Enter your OAMK student email to continue</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student Email
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="firstname.lastname@students.oamk.fi"
                  className="input-field pl-10 h-12"
                  onKeyPress={(e) => e.key === 'Enter' && onEmailSubmit()}
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-3">
                <div className="flex">
                  <AlertCircleIcon className="w-4 h-4 text-red-400 mr-2 mt-0.5" />
                  <span className="text-red-800 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}
            
            <button
              onClick={onEmailSubmit}
              disabled={isProcessing}
              className="btn-primary w-full h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <LoaderIcon className="w-5 h-5 mr-2 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailEntry 