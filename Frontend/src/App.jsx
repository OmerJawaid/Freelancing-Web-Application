import { useState } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import './App.css'
import Home from'./Pages/Home/Home.jsx'
import Login from './Pages/Login/Login.jsx';
import Signup from './Pages/Signup/Signup.jsx';
import ClientDashboard from './Pages/Dashboard/ClientDashboard.jsx';
import FreelancerDashboard from './Pages/Dashboard/FreelancerDashboard.jsx';

function App() {
  const router = createBrowserRouter([
    //Home Page
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path:'/signup',
      element:<Signup/>
    },
    {
      path:'/client',
      element:<ClientDashboard/>
    },
    {
      path:'/freelancer',
      element:<FreelancerDashboard/>
    }
  ]);

  return (
        <RouterProvider router={router} />
  );
}

export default App
