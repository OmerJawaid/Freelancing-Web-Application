// Frontend/src/App.jsx
import { useState, useContext } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import './App.css';
import Home from './Pages/Home/Home.jsx';
import Login from './Pages/Login/Login.jsx';
import Signup from './Pages/Signup/Signup.jsx';
import ClientDashboard from './Pages/Dashboard/ClientDashboard.jsx';
import FreelancerDashboard from './Pages/Dashboard/FreelancerDashboard.jsx';
import ProtectedRoute from './components/protectedRoute.jsx';
import { AuthContext } from './context/Authcontext.jsx';

function App() {
  const { loading } = useContext(AuthContext);

  const router = createBrowserRouter([
    // Home Page
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: '/signup',
      element: <Signup />
    },
    {
      path: '/client',
      element: (
        <ProtectedRoute userType="client">
          <ClientDashboard />
        </ProtectedRoute>
      )
    },
    {
      path: '/freelancer',
      element: (
        <ProtectedRoute userType="freelancer">
          <FreelancerDashboard />
        </ProtectedRoute>
      )
    }
  ]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return <RouterProvider router={router} />;
}

export default App;