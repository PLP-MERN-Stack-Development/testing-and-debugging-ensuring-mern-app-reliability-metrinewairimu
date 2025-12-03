import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay/ErrorDisplay';
import BugList from '../components/BugList/BugList';
import bugService from '../services/bugService';
import authService from '../services/authService';

const HomePage = () => {
  const [stats, setStats] = useState(null);
  const [recentBugs, setRecentBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const savedUser = authService.getUser();
    setUser(savedUser);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch bug statistics
      const statsResponse = await bugService.getBugStats();
      setStats(statsResponse.data);
      
      // Fetch recent bugs
      const bugsResponse = await bugService.getAllBugs({
        limit: 5,
        sort: '-createdAt'
      });
      setRecentBugs(bugsResponse.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." fullScreen={false} />;
  }

  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={fetchDashboardData}
        title="Failed to Load Dashboard"
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome{user?.name ? `, ${user.name}` : ''}!
            </h1>
            <p className="text-blue-100 text-lg">
              Track, manage, and resolve bugs efficiently with our bug tracking system.
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <Link
              to="/report"
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold text-lg transition-all hover:scale-105 inline-block"
            >
              🐛 Report New Bug
            </Link>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-800">{stats.totalBugs}</div>
                <div className="text-gray-600">Total Bugs</div>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.resolvedBugs}</div>
                <div className="text-gray-600">Resolved</div>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600">{stats.openBugs}</div>
                <div className="text-gray-600">Open Bugs</div>
              </div>
              <div className="text-4xl">⚠️</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600">
                  {stats.priorityDistribution?.find(p => p._id === 'critical')?.count || 0}
                </div>
                <div className="text-gray-600">Critical Bugs</div>
              </div>
              <div className="text-4xl">🔥</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/bugs"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center space-x-4">
            <div className="text-4xl group-hover:scale-110 transition-transform">🔍</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Browse All Bugs</h3>
              <p className="text-gray-600">View and manage all reported bugs</p>
            </div>
          </div>
        </Link>

        <Link
          to="/report"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center space-x-4">
            <div className="text-4xl group-hover:scale-110 transition-transform">📝</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Report Bug</h3>
              <p className="text-gray-600">Submit a new bug report</p>
            </div>
          </div>
        </Link>

        {stats?.priorityDistribution?.find(p => p._id === 'critical')?.count > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl shadow p-6">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🚨</div>
              <div>
                <h3 className="text-xl font-bold text-red-800">Critical Issues</h3>
                <p className="text-red-600">
                  {stats.priorityDistribution.find(p => p._id === 'critical').count} critical bugs need attention
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent bugs */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Recent Bugs</h2>
            <Link
              to="/bugs"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {recentBugs.length > 0 ? (
            <BugList bugs={recentBugs} showFilters={false} />
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bugs Yet!</h3>
              <p className="text-gray-500 mb-6">Start by reporting your first bug</p>
              <Link
                to="/report"
                className="btn-primary"
              >
                Report First Bug
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Status distribution */}
      {stats?.statusDistribution && stats.statusDistribution.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Status Distribution</h2>
          <div className="space-y-4">
            {stats.statusDistribution.map((item) => (
              <div key={item._id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {item._id.charAt(0).toUpperCase() + item._id.slice(1)}
                  </span>
                  <span className="text-gray-500">{item.count} bugs</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item._id === 'open' ? 'bg-blue-600' :
                      item._id === 'in-progress' ? 'bg-purple-600' :
                      item._id === 'resolved' ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                    style={{ width: `${(item.count / stats.totalBugs) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;