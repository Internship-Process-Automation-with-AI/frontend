import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Reviewer from './pages/Reviewer.jsx'
import ReviewerLanding from './pages/ReviewerLanding.jsx'
import ReviewerApplications from './pages/ReviewerApplications.jsx'
import StudentLanding from './pages/StudentLanding.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Reviewer Portal Routes */}
        <Route path="/reviewer" element={<ReviewerLanding />} />
        <Route path="/reviewer/portal" element={<Reviewer />} />
        <Route path="/reviewer/portal/applications" element={<ReviewerApplications />} />
        <Route path="/reviewer/portal/applications/:certificateId" element={<ReviewerApplications />} />
        
        {/* Student Portal Routes */}
        <Route path="/student" element={<StudentLanding />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/upload" element={<StudentDashboard />} />
        <Route path="/student/applications" element={<StudentDashboard />} />
        <Route path="/student/applications/:certificateId" element={<StudentDashboard />} />
        
        {/* Default route - redirect to student portal */}
        <Route path="/" element={<StudentLanding />} />
        <Route path="*" element={<StudentLanding />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App