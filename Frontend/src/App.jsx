import { useState } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import './App.css'
import Home from'./Pages/Home/Home.jsx'
import Login from './Pages/Login.jsx'



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
    }
  ]);

  return (
        <RouterProvider router={router} />
  );
}

export default App
