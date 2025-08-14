import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import Header from '../../components/Common/Header';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [auditData, setAuditData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('last30');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [locations, setLocations] = useState([]);
  const [auditType, setAuditType] = useState('internal');
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    fetchAuditData();
  }, [auditType, timeRange]);

  useEffect(() => {
    applyFilters();
  }, [auditData, selectedLocation]);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/api/audits?type=${auditType}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.data || !response.data.data) {
        console.error('No data received from API');
        setAuditData([]);
        setLoading(false);
        return;
      }
      
      let data = response.data.data;
      
      // Filter by time range
      const now = new Date();
      if (timeRange === 'last30') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        data = data.filter(item => item.UploadDate && new Date(item.UploadDate) > thirtyDaysAgo);
      } else if (timeRange === 'last90') {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        data = data.filter(item => item.UploadDate && new Date(item.UploadDate) > ninetyDaysAgo);
      } else if (timeRange === 'lastYear') {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        data = data.filter(item => item.UploadDate && new Date(item.UploadDate) > oneYearAgo);
      }
      
      setAuditData(data || []);
      const uniqueLocations = [...new Set(data.map(item => item.Location || 'Unknown'))];
      setLocations(uniqueLocations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching audit data:', error);
      setAuditData([]);
      setFilteredData([]);
      setLoading(false);
      
      if (error.response) {
        if (error.response.status === 404) {
          alert('API endpoint not found. Please check the server connection.');
        } else if (error.response.status === 401) {
          alert('Session expired. Please log in again.');
        }
      }
    }
  };

  const applyFilters = () => {
    if (!auditData || auditData.length === 0) {
      setFilteredData([]);
      return;
    }
    
    let filtered = [...auditData];
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(item => item.Location === selectedLocation);
    }
    
    setFilteredData(filtered);
  };
  
  const getLocationData = () => {
    if (!filteredData || filteredData.length === 0) return [];
    const locationMap = {};

    filteredData.forEach(item => {
      const location = item.Location || 'Unknown';
      locationMap[location] = (locationMap[location] || 0) + 1;
    });
    
    return Object.entries(locationMap).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  };

  const getNCTypeData = () => {
    if (!filteredData || filteredData.length === 0) return [];
    const ncTypeMap = {};

    filteredData.forEach(item => {
      const ncType = item.NCMinI || 'Unknown';
      ncTypeMap[ncType] = (ncTypeMap[ncType] || 0) + 1;
    });
    
    return Object.entries(ncTypeMap).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  };

  const getStatusData = () => {
    if (!filteredData || filteredData.length === 0) return [];
    const statusMap = {};

    filteredData.forEach(item => {
      const status = item.Status || 'Open';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    
    return Object.entries(statusMap).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  };

  const getSummaryStats = () => {
    if (!filteredData || filteredData.length === 0) {
      return {
        totalNCs: 0,
        openNCs: 0,
        closedNCs: 0,
        locations: 0,
        closureRate: 0
      };
    }

    const totalNCs = filteredData.length;
    const openNCs = filteredData.filter(item => item.Status === 'Open').length;
    const closedNCs = filteredData.filter(item => item.Status === 'Closed').length;
    const locations = new Set(filteredData.map(item => item.Location)).size;

    return {
      totalNCs,
      openNCs,
      closedNCs,
      locations,
      closureRate: totalNCs > 0 ? Math.round((closedNCs / totalNCs) * 100) : 0
    };
  };

  const getHeaderTitle = (type) => {
    const auditTitles = {
      internal: 'ISMS INTERNAL AUDIT REPORTS',
      external: 'ISMS EXTERNAL AUDIT REPORTS'
    };
    return auditTitles[type] || 'ISMS AUDIT REPORTS';
  };

  const stats = getSummaryStats();
  const locationData = getLocationData();
  const ncTypeData = getNCTypeData();
  const statusData = getStatusData();

  return (
    <>
      <Header />
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardHeader}>
          <h2>{getHeaderTitle(auditType)}</h2>
          <div className={styles.dashboardControls}>
            <select 
              value={auditType} 
              onChange={(e) => setAuditType(e.target.value)}
              className={styles.dashboardSelect}
            >
              <option value="internal">Internal Audit</option>
              <option value="external">External Audit</option>
            </select>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className={styles.dashboardSelect}
            >
              <option value="all">All Time</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="lastYear">Last Year</option>
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className={styles.dashboardSelect}
            >
              <option value="all">All Locations</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className={styles.dashboardLoading}>Loading audit data...</div>
        ) : (
          <>
            <div className={styles.dashboardSummary}>
              <div className={styles.summaryCard}>
                <h3>Total NCs</h3>
                <p className={styles.summaryValue}>{stats.totalNCs}</p>
              </div>
              <div className={styles.summaryCard}>
                <h3>Open NCs</h3>
                <p className={styles.summaryValue}>{stats.openNCs}</p>
              </div>
              <div className={styles.summaryCard}>
                <h3>Closed NCs</h3>
                <p className={styles.summaryValue}>{stats.closedNCs}</p>
              </div>
              <div className={styles.summaryCard}>
                <h3>Closure Rate</h3>
                <p className={styles.summaryValue}>{stats.closureRate}%</p>
              </div>
              <div className={styles.summaryCard}>
                <h3>Locations</h3>
                <p className={styles.summaryValue}>{stats.locations}</p>
              </div>
            </div>

            {auditData.length > 0 ? (
              <div className={styles.chartsContainer}>
                <div className={styles.chartRow}>
                  <div className={styles.chartWrapper}>
                    <h3>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                      </svg>
                      NC by Type
                    </h3>
                    <div className={styles.chartContainer}>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={ncTypeData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" name="Count" fill="#3c4e7c" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className={styles.chartWrapper}>
                    <h3>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      NC by Status
                    </h3>
                    <div className={styles.chartContainer}>
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.dashboardNoData}>
                <p>No audit data found for the selected criteria.</p>
                <button onClick={fetchAuditData} className={styles.refreshButton}>
                  Refresh Data
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;