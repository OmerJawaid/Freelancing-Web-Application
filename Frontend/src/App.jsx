// Frontend/src/App.jsx
import { useState, useContext } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Home from './Pages/Home/Home.jsx';
import Login from './Pages/Login/Login.jsx';
import Signup from './Pages/Signup/Signup.jsx';
import ClientDashboard from './Pages/Dashboard/ClientDashboard.jsx';
import FreelancerDashboard from './Pages/Dashboard/FreelancerDashboard.jsx';
import ProtectedRoute from './components/protectedRoute.jsx';
import { AuthContext } from './context/Authcontext.jsx';
import Gig from './Pages/Gig Display/GigDsplay.jsx';
import Messages from './Pages/Messages/Messages.jsx';
import CreateGig from './Pages/CreateGig/CreateGig.jsx';

// Wrapper component for transitions
const TransitionWrapper = ({ children }) => {
  const location = useLocation();
  
  return (
    <TransitionGroup>
      <CSSTransition
        key={location.key}
        timeout={400}
        classNames="page-transition"
        unmountOnExit
      >
        <div className="page-wrapper">
          {children}
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
};

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
      path:'/client/:id',
      element:(<Gig/>)
    },
    {
      path: '/freelancer',
      element: (
        <ProtectedRoute userType="freelancer">
          <FreelancerDashboard />
        </ProtectedRoute>
      )
    },
    {
      path:'/messages',
      element:(<Messages/>)
    },
    // Create Gig Page (Protected for Freelancers)
    {
      path: '/create-gig',
      element: (
        <ProtectedRoute userType="freelancer">
          <CreateGig />
        </ProtectedRoute>
      )
    }
  ]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={CSSTransition}
      />
    </>
  );
}

export default App;