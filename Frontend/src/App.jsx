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
import EditGig from './Pages/EditGig/EditGig.jsx';
import Settings from './Pages/Settings/Settings.jsx';
import ClientOrders from './Pages/Orders/ClientOrders.jsx';
import FreelancerOrders from './Pages/Orders/FreelancerOrders.jsx';
import Notification from './Pages/Notification/Notification.jsx';
import FreelancerGigs from './Pages/Gigs/FreelancerGigs.jsx';
import ClientGigs from './Pages/Gigs/ClientGigs.jsx';

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

// Generic wrapper for protected routes that don't require specific user type
const AuthRequiredRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
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
      path: '/client-dashboard',
      element: (
        <ProtectedRoute userType="client">
          <ClientDashboard />
        </ProtectedRoute>
      )
    },
    {
      path: '/client-gigs',
      element: (
        <ProtectedRoute userType="client">
          <ClientGigs />
        </ProtectedRoute>
      )
    },
    {
      path: '/freelancer-gigs',
      element:(
        <ProtectedRoute userType="freelancer">
          <FreelancerGigs/>
        </ProtectedRoute>
      )
    },
    {
      path:'/client/:id',
      element:(
        <AuthRequiredRoute>
          <Gig/>
        </AuthRequiredRoute>
      )
    },
    {
      path: '/freelancer-dashboard',
      element: (
        <ProtectedRoute userType="freelancer">
          <FreelancerDashboard />
        </ProtectedRoute>
      )
    },
    {
      path:'/messages',
      element:(
        <AuthRequiredRoute>
          <Messages/>
        </AuthRequiredRoute>
      )
    },
    // Create Gig Page (Protected for Freelancers)
    {
      path: '/create-gig',
      element: (
        <ProtectedRoute userType="freelancer">
          <CreateGig />
        </ProtectedRoute>
      )
    },
    // Edit Gig Page (Protected for Freelancers)
    {
      path: '/edit-gig/:gigId',
      element: (
        <ProtectedRoute userType="freelancer">
          <EditGig />
        </ProtectedRoute>
      )
    },
    {
      path: '/settings',
      element: (
        <AuthRequiredRoute>
          <Settings />
        </AuthRequiredRoute>
      )
    },
    // Client Orders Page
    {
      path: '/client-orders',
      element: (
        <ProtectedRoute userType="client">
          <ClientOrders />
        </ProtectedRoute>
      )
    },
      {
      path: '/notifications',
      element: (
        
          <Notification/>
      )
    },
    // Freelancer Orders Page
    {
      path: '/freelancer-orders',
      element: (
        <ProtectedRoute userType="freelancer">
          <FreelancerOrders />
        </ProtectedRoute>
      )
    },
    // Maintain backward compatibility
    {
      path: '/client',
      element: <Navigate to="/client-dashboard" replace />
    },
    {
      path: '/freelancer',
      element: <Navigate to="/freelancer-dashboard" replace />
    }
  ]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}

export default App;