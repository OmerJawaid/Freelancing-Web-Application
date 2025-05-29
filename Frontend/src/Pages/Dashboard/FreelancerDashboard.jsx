import React, { useEffect, useState, useContext, useRef } from 'react';
import './Dashboard.css';
import Navbar from '../../Components/Navbar Client/Navbar';
import axios from 'axios';
import Footer from '../../Components/Footer/Footer';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/Authcontext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FreelancerDashboard = () => {
  const[gigs, changegig]=useState([]);
  const [animatingGigId, setAnimatingGigId] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [filterType, setFilterType] = useState('all');
  const [isFiltering, setIsFiltering] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalEarnings: 0,
    activeOrders: 0,
    completionRate: 100,
    avgRating: 0,
    monthLabels: [],
    monthlyEarnings: [],
    ordersByMonth: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');
  
  // Reference for the overview section for smooth scrolling
  const overviewRef = useRef(null);

  // Fetch gigs and dashboard stats when component mounts or user changes
  useEffect(()=>{
    // Function to fetch gigs
    async function fetchGigs(){
      try {
        // Ensure user exists and has an ID before fetching
        if (!user || !user.id) {
          console.log("User not authenticated or missing ID");
          return;
        }
        
        console.log("Fetching gigs for freelancer ID:", user.id);
        
        const result = await axios.get('http://localhost:8081/gigs/retrieveGigForFreelancer', {
          params: { freelancer_Id: user.id }
        });
        if(!result.data){
          console.log("Error in getting gigs data")
        }
        console.log(result.data);
        changegig(result.data);
      } catch (error) {
        console.error("Error fetching gigs:", error);
      }
    }
    
    // Function to fetch dashboard statistics
    async function fetchDashboardStats() {
      try {
        if (!user || !user.id) {
          console.log("User not authenticated or missing ID");
          setIsLoading(false);
          return;
        }
        
        console.log("Fetching dashboard stats for freelancer ID:", user.id);
        
        const response = await axios.get('http://localhost:8081/dashboard/freelancer-stats', {
          params: { freelancerId: user.id },
          withCredentials: true
        });
        
        console.log("Dashboard stats received:", response.data);
        
        // Mock monthly data for the chart - in a real app, this would come from the backend
        const currentMonth = new Date().getMonth();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Generate last 6 months
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12; // Handle year wraparound
          last6Months.push(monthNames[monthIndex]);
        }
        
        // Use real data from backend if available, otherwise use empty arrays
        const monthLabels = response.data.monthLabels || last6Months;
        const monthlyEarnings = response.data.monthlyEarnings || [];
        const ordersByMonth = response.data.ordersByMonth || [];
        
        setDashboardStats({
          totalEarnings: response.data.totalEarnings || 0,
          activeOrders: response.data.activeOrders || 0,
          completionRate: response.data.completionRate || 100,
          avgRating: response.data.avgRating || 0,
          monthLabels: monthLabels,
          monthlyEarnings: monthlyEarnings,
          ordersByMonth: ordersByMonth,
          allData: response.data // Store all data for filtering by time period later
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setIsLoading(false);
      }
    }
    
    // Call both functions
    fetchGigs();
    fetchDashboardStats();
  }, [user]); // Add user as dependency to re-fetch when user changes

  // Filter gigs based on the selected filter type
  const filteredGigs = () => {
    // If we're in "all" mode, show all gigs including the one being animated
    if (filterType === 'all') {
      return gigs;
    } 
    
    // For active/paused filters, include the gig being animated even if it wouldn't match the filter
    return gigs.filter(gig => {
      if (animatingGigId === gig.Id) {
        return true; // Always include the animating gig
      }
      
      return filterType === 'active' ? gig.State === 1 : gig.State === 0;
    });
  };

  // Handle filter button click with transition
  const handleFilterChange = (newFilter) => {
    if (newFilter === filterType) return;
    
    setIsFiltering(true);
    setFilterType(newFilter);
    
    // Remove filtering flag after animation completes
    setTimeout(() => {
      setIsFiltering(false);
    }, 400); // Match the duration of filterTransition animation
  };

  const [myGigs, setMyGigs] = useState([
    {
      id: 1,
      title: "Professional Web Development",
      description: "Full-stack web development using modern technologies",
      price: 500,
      status: "active",
      orders: 5,
      views: 120,
      image: "https://dummyimage.com/300x200/e9ecef/495057&text=Gig+Preview"
    },
    {
      id: 2,
      title: "Mobile App Development",
      description: "Native iOS and Android app development",
      price: 800,
      status: "paused",
      orders: 3,
      views: 85,
      image: "https://dummyimage.com/300x200/e9ecef/495057&text=Gig+Preview"
    }
  ]);

  // Dashboard stats are now coming from the API via state

  // Function to toggle gig state with transition
  const toggleGigState = async (gigId, currentState) => {
    const newState = currentState === 1 ? 0 : 1;
    
    // Set this gig as animating
    setAnimatingGigId(gigId);
    
    try {
      const response = await axios.put(`http://localhost:8081/gigs/toggleState/${gigId}`, {
        state: newState
      });
      
      if (response.data.message === "Gig state updated successfully") {
        // First update the UI to show the state change
        changegig(gigs.map(gig => 
          gig.Id === gigId ? { ...gig, State: newState } : gig
        ));
        
        // Allow animation to complete before clearing the animating state
        setTimeout(() => {
          setAnimatingGigId(null);
        }, 600); // Match the duration of stateTransition animation
      } else {
        console.error("Failed to update gig state:", response.data.message);
        setAnimatingGigId(null);
      }
    } catch (error) {
      console.error(`Error toggling state for gig ${gigId}:`, error);
      setAnimatingGigId(null);
    }
  };

  // Prepare chart data for visualization
  const chartData = {
    labels: dashboardStats.monthLabels || [],
    datasets: [
      {
        label: 'Earnings ($)',
        data: dashboardStats.monthlyEarnings || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Orders',
        data: dashboardStats.ordersByMonth || [],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Earnings ($)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false
        },
        title: {
          display: true,
          text: 'Orders'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Earnings & Orders - Last 6 Months'
      }
    }
  };
  
  // Toggle overview section expansion
  const toggleOverview = () => {
    setIsOverviewExpanded(!isOverviewExpanded);
  };
  
  // Handle time range selection
  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
    setIsLoading(true); // Show loading state while data updates
    
    // Filter data based on selected time range
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    let months = [];
    let rangeNumber = 6; // Default to 6 months
    
    switch(range) {
      case '1month':
        rangeNumber = 1;
        break;
      case '2months':
        rangeNumber = 2;
        break;
      case '6months':
        rangeNumber = 6;
        break;
      case '1year':
        rangeNumber = 12;
        break;
      default:
        rangeNumber = 6;
    }
    
    // Generate months array based on selected range
    for (let i = rangeNumber - 1; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12; // Handle year wraparound
      months.push(monthNames[monthIndex]);
    }
    
    // For demo/testing purposes, ensure we always have some data to display
    const ensureNonEmptyData = (dataArray, months) => {
      if (!dataArray || dataArray.length === 0 || dataArray.every(val => val === 0)) {
        // Generate sample data if real data is not available
        return months.map((_, index) => Math.floor(Math.random() * 15) + 1);
      }
      return dataArray;
    };
    
    // If we have the full dataset from the backend, filter it
    if (dashboardStats.allData) {
      // Just use the appropriate number of months from the data
      const filteredLabels = months; // Always use the calculated months for consistency
      let filteredEarnings = [];
      let filteredOrders = [];
      
      if (dashboardStats.allData.monthlyEarnings && dashboardStats.allData.ordersByMonth) {
        // Map real data to our calculated months if possible
        const monthsMap = {};
        dashboardStats.allData.monthLabels?.forEach((month, i) => {
          if (dashboardStats.allData.monthlyEarnings[i] !== undefined) {
            monthsMap[month] = {
              earnings: dashboardStats.allData.monthlyEarnings[i],
              orders: dashboardStats.allData.ordersByMonth[i]
            };
          }
        });
        
        filteredEarnings = months.map(month => (monthsMap[month]?.earnings || 0));
        filteredOrders = months.map(month => (monthsMap[month]?.orders || 0));
      } else {
        // Generate demo data if no real data
        filteredEarnings = months.map((_, index) => Math.floor(5 + Math.random() * 10));
        filteredOrders = months.map((_, index) => Math.floor(1 + Math.random() * 3));
      }
      
      // Ensure we have some data to show
      filteredEarnings = ensureNonEmptyData(filteredEarnings, months);
      filteredOrders = ensureNonEmptyData(filteredOrders, months);
      
      setTimeout(() => {
        setDashboardStats(prev => ({
          ...prev,
          monthLabels: filteredLabels,
          monthlyEarnings: filteredEarnings,
          ordersByMonth: filteredOrders
        }));
        setIsLoading(false);
      }, 500); // Small delay to show loading state
    } else {
      // Generate demo data if no real data at all
      const demoEarnings = months.map((_, index) => Math.floor(5 + Math.random() * 10));
      const demoOrders = months.map((_, index) => Math.floor(1 + Math.random() * 3));
      
      setTimeout(() => {
        setDashboardStats(prev => ({
          ...prev,
          monthLabels: months,
          monthlyEarnings: demoEarnings,
          ordersByMonth: demoOrders
        }));
        setIsLoading(false);
      }, 500);
    }
  };

  return (
    <div className="dashboard">
      <Navbar />
      
      <div className="overview-container">
        <div className="overview-header">
          <h2>Dashboard Overview</h2>
          <button className="collapse-button" onClick={toggleOverview}>
            {isOverviewExpanded ? '▲ Collapse' : '▼ Expand'}
          </button>
        </div>
        
        {isOverviewExpanded && (
          <div className="dashboard-overview" ref={overviewRef} style={{ maxHeight: isOverviewExpanded ? '1000px' : '0' }}>
            <div className="stats-row">
              <div className="stat-card">
                <h3>Total Earnings</h3>
                <p className="stat-value">${dashboardStats.totalEarnings}</p>
              </div>
              <div className="stat-card">
                <h3>Active Orders</h3>
                <p className="stat-value">{dashboardStats.activeOrders}</p>
              </div>
              <div className="stat-card">
                <h3>Completion Rate</h3>
                <p className="stat-value">{dashboardStats.completionRate}%</p>
              </div>
              <div className="stat-card">
                <h3>Average Rating</h3>
                <p className="stat-value">⭐ {dashboardStats.avgRating}</p>
              </div>
            </div>
            
            <div className="time-range-selector">
              <button 
                className={`time-range-button ${selectedTimeRange === '1month' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('1month')}
              >
                1 Month
              </button>
              <button 
                className={`time-range-button ${selectedTimeRange === '2months' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('2months')}
              >
                2 Months
              </button>
              <button 
                className={`time-range-button ${selectedTimeRange === '6months' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('6months')}
              >
                6 Months
              </button>
              <button 
                className={`time-range-button ${selectedTimeRange === '1year' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('1year')}
              >
                1 Year
              </button>
            </div>

            <div className="charts-container">
              <div className="chart-container">
                <h3 className="chart-title">Earnings Over Time</h3>
                {isLoading ? (
                  <div className="chart-loading">Loading chart data...</div>
                ) : (
                  <Line
                    data={{
                      labels: dashboardStats.monthLabels,
                      datasets: [
                        {
                          label: 'Earnings ($)',
                          data: dashboardStats.monthlyEarnings,
                          backgroundColor: 'rgba(0, 200, 83, 0.2)',
                          borderColor: 'rgba(0, 200, 83, 1)',
                          borderWidth: 2,
                          tension: 0.4,
                          fill: true,
                          pointBackgroundColor: 'rgba(0, 200, 83, 1)',
                          pointBorderColor: '#fff',
                          pointHoverBackgroundColor: '#fff',
                          pointHoverBorderColor: 'rgba(0, 200, 83, 1)'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Earnings ($)'
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `Earnings: $${context.raw}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                )}
              </div>
              
              <div className="chart-container">
                <h3 className="chart-title">Orders Over Time</h3>
                {isLoading ? (
                  <div className="chart-loading">Loading chart data...</div>
                ) : (
                  <Line
                    data={{
                      labels: dashboardStats.monthLabels,
                      datasets: [
                        {
                          label: 'Orders',
                          data: dashboardStats.ordersByMonth,
                          backgroundColor: 'rgba(33, 150, 243, 0.2)',
                          borderColor: 'rgba(33, 150, 243, 1)',
                          borderWidth: 2,
                          tension: 0.4,
                          fill: true,
                          pointBackgroundColor: 'rgba(33, 150, 243, 1)',
                          pointBorderColor: '#fff',
                          pointHoverBackgroundColor: '#fff',
                          pointHoverBorderColor: 'rgba(33, 150, 243, 1)'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Orders'
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `Orders: ${context.raw}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-content">
        {/* Main Content */}
        <main className="main-content">
          <div className="section-header">
            <h2>My Gigs</h2>
            <div className="gigs-actions">
              <div className="filter-buttons">
                <button 
                  className={`filter-button ${filterType === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-button ${filterType === 'active' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('active')}
                >
                  Active
                </button>
                <button 
                  className={`filter-button ${filterType === 'paused' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('paused')}
                >
                  Paused
                </button>
              </div>
              <button 
                className="create-new-gig-btn"
                onClick={() => navigate('/create-gig')}
              >
                Create New Gig
              </button>
            </div>
          </div>
          
          {filteredGigs().length === 0 ? (
            <div className="no-gigs-message">
              {filterType === 'all' ? (
                <>
                  <h3>You don't have any gigs yet</h3>
                  <p>Create your first gig to start offering your services to clients</p>
                  <button 
                    className="create-gig-button"
                    onClick={() => navigate('/create-gig')}
                  >
                    Create New Gig
                  </button>
                </>
              ) : (
                <>
                  <h3>No {filterType} gigs found</h3>
                  <p>You don't have any {filterType} gigs at the moment.</p>
                  <button 
                    className="filter-button"
                    onClick={() => handleFilterChange('all')}
                  >
                    View All Gigs
                  </button>
                </>
              )}
            </div>
          ) : (
            <div 
              className="gigs-grid" 
              key={`gigs-grid-${filterType}`}
              data-filtering={isFiltering}
            >
              {filteredGigs().map((gig) => (
                <div 
                  key={`${gig.Id}-${filterType}`} 
                  className={`gig-card freelancer-gig ${
                    animatingGigId === gig.Id ? 'state-transition' : ''
                  }`}
                >
                  <div className="gig-image">
                    <img src={gig.Image} alt={gig.Title} />
                    <div className={`status-badge ${gig.State === 1 ? 'active' : 'paused'}`}>
                      {gig.State === 1 ? 'Active' : 'Paused'}
                    </div>
                  </div>
                  <div className="gig-details">
                    <h3 className="gig-title" style={{color:'black',fontSize:'1.2rem',fontWeight:'bold'}} title={gig.Title}>{gig.Title}</h3>
                    <p className="gig-description" style={{padding:'0%'}} title={gig.Description}>
                      {gig.Description ? 
                        (gig.Description.length > 100 
                          ? gig.Description.substring(0, 100).trim() + '...' 
                          : gig.Description)
                        : "No description available"}
                    </p>
                    <div className="gig-stats">
                      <div className="stat">
                        <span className="stat-label">Orders</span>
                        <span className="stat-value">{gig.orders}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Views</span>
                        <span className="stat-value">{gig.Views}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Price</span>
                        <span className="stat-value">${gig.BasicPrice ? gig.BasicPrice : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="gig-actions">
                      <button 
                        className="edit-button"
                        onClick={() => navigate(`/edit-gig/${gig.Id}`)}
                      >
                        Edit
                      </button>
                      <button 
                        className={gig.State === 1 ? 'pause-button' : 'activate-button'}
                        onClick={() => toggleGigState(gig.Id, gig.State)}
                      >
                        {gig.State === 1 ? 'Pause' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer/>
    </div>
  );
};

export default FreelancerDashboard; 