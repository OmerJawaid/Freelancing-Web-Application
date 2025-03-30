import { useState } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import './App.css'
import Home from'./Pages/Home/Home.jsx'
import Login from './Pages/Login/Login.jsx';
import Signup from './Pages/Signup/Signup.jsx';

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
    }
  ]);

  return (
        <RouterProvider router={router} />
  );
}

export default App
