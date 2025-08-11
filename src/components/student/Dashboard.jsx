import { AwardIcon, ListIcon } from '../common/Icons.jsx'
import Header from '../common/Header.jsx'

const Dashboard = ({ studentData, onLogout, onApplyForCredits, onViewApplications }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header studentData={studentData} onLogout={onLogout} />
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-12 px-6">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
           AI Powered Training Credit Evaluator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your training credit applications and track your academic progress.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Apply for Credits Card */}
          <div 
            className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-100"
            onClick={onApplyForCredits}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative p-8">
              {/* Icon Container */}
              <div className="mb-6">
                <div className="bg-gradient-to-r from-oamk-orange-500 to-oamk-orange-600 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <AwardIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-oamk-orange-600 transition-colors duration-300">
                  Apply for Training Credits
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Upload your work certificates and training documents for AI-powered evaluation and credit assessment.
                </p>
                
                {/* Action Button */}
                <div className="pt-4">
                  <div className="inline-flex items-center text-oamk-orange-600 font-semibold group-hover:text-oamk-orange-700 transition-colors duration-300">
                    <span>Get Started</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* View Applications Card */}
          <div 
            className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-100"
            onClick={onViewApplications}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative p-8">
              {/* Icon Container */}
              <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <ListIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                  My Applications
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Track your all submitted applications, view their current status, and manage your training credit history.
                </p>
                
                {/* Action Button */}
                <div className="pt-4">
                  <div className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300">
                    <span>View All</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard 