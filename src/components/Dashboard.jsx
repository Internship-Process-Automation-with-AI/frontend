import { AwardIcon, ListIcon } from './Icons.jsx'
import Header from './Header.jsx'

const Dashboard = ({ studentData, onLogout, onApplyForCredits, onViewApplications }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header studentData={studentData} onLogout={onLogout} />
      <div className="max-w-5xl mx-auto py-6 px-4">
        {/* Welcome Section */}
        <div className="card mb-6 text-center bg-gradient-to-r from-oamk-orange-50 to-orange-50 border-oamk-orange-200">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              Welcome back, {studentData?.first_name}! 👋
            </h1>
            <p className="text-gray-600">{studentData?.degree}</p>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white to-gray-50" onClick={onApplyForCredits}>
            <div className="text-center p-6">
              <div className="bg-gradient-to-r from-oamk-orange-500 to-oamk-orange-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <AwardIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Apply for Training Credits</h3>
              <p className="text-gray-600">Upload your work certificate for AI-powered evaluation</p>
            </div>
          </div>
          
          <div className="card cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white to-gray-50" onClick={onViewApplications}>
            <div className="text-center p-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ListIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">My Applications</h3>
              <p className="text-gray-600">Track your submitted applications and view their status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 