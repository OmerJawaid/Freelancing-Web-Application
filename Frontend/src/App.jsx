import { useState } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import './App.css'
import Home from'./Pages/Home/Home.jsx'



function App() {
  const router = createBrowserRouter([
    //Home Page
    {
      path: "/",
      element: <Home />,
    },
  ]);

  return (
        <RouterProvider router={router} />
  );
}

export default App
