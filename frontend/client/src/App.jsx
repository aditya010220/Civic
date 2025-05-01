import React from 'react'
import { AuthProvider } from './Context/authContext'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard'
import CampaignDetail from './component/Campaign/CampaignDetails'


const App = () => {
  return (
   <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path="/campaigns/:campaignId" element={<CampaignDetail />} />
          {/* Add other routes here */}
        </Routes>
      </Router>

      
    </AuthProvider>
  )
}

export default App
