import React from 'react'
import { AuthProvider } from './Context/authContext'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './Pages/Login'


const App = () => {
  return (
   <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* Add other routes here */}
        </Routes>
      </Router>

      
    </AuthProvider>
  )
}

export default App
