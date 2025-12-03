import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BugList from '../components/BugList/BugList';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay/ErrorDisplay';
import bugService from '../services/bugService';

const BugListPage = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchBugs();
    fetchStats();
  }, []);

  const fetchBugs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bugService.getAllBugs({ limit: 50 });
      setBugs(response.data);
    } catch (err) {
      console.error('Error fetching bugs:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await bugService.getBugStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleBugUpdate = (updatedBug) => {
    setBugs(prev => prev.map(bug => 
      bug._id === updatedBug._id ? updatedBug : bug
    ));
  };

  const handleBugDelete = (bugId) => {
    setBugs(prev => prev.filter(bug => bug._id !== bugId));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await bugService.getAllBugs({ limit: 1000 });
      const bugsData = response.data;
      
      // Create CSV content
      const headers = ['Title', 'Description', 'Status', 'Priority', 'Reported By', 'Assigned To', 'Created At', 'Updated At'];
      const rows = bugsData.map(bug => [
        `"${bug.title.replace(/"/g, '""')}"`,
        `"${bug.description.replace(/"/g, '""')}"`,
        bug.status,
        bug.priority,
        `"${bug.reportedBy.replace(/"/g, '""')}"`,
        `"${bug.assignedTo.replace(/"/g, '""')}"`,
        new Date(bug.createdAt).toISOString(),
        new Date(bug.updatedAt).toISOString()
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bugs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting bugs:', err);
      setError(err);
    } finally {
      setExporting(false);
    }
  };

  if (loading && !bugs.length) {
    return <LoadingSpinner text="Loading bugs..." fullScreen={false} />;
  }

  if (error && !bugs.length) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={fetchBugs}
        title="Failed to Load Bugs"
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">All Bugs</h1>
          <p className="text-gray-600 mt-2">
            Track and manage all reported bugs in your system
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Grid View
            </button>
          </div>
          
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            {exporting ? (
              <>
                <LoadingSpinner size="small" text="" color="white" />
                <span className="ml-2">Exporting...</span>
              </>
            ) : (
              <>
                <span className="mr-2">📥</span>
                Export CSV
              </>
            )}
          </button>
          
          <Link
            to="/report"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <span className="mr-2">+</span>
            Report Bug
          </Link>
        </div>
      </div>

      {/* Stats overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-800">{stats.totalBugs}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.statusDistribution?.find(s => s._id === 'open')?.count || 0}
            </div>
            <div className="text-sm text-gray-600">Open</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">
              {stats.statusDistribution?.find(s => s._id === 'in-progress')?.count || 0}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.statusDistribution?.find(s => s._id === 'resolved')?.count || 0}
            </div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">
              {stats.priorityDistribution?.find(p => p._id === 'critical')?.count || 0}
            </div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600">
              {stats.priorityDistribution?.find(p => p._id === 'high')?.count || 0}
            </div>
            <div className="text-sm text-gray-600">High</div>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && bugs.length > 0 && (
        <ErrorDisplay 
          error={error} 
          onRetry={fetchBugs}
          dismissible={true}
        />
      )}

      {/* Bugs list/grid */}
      {viewMode === 'list' ? (
        <BugList
          bugs={bugs}
          onBugUpdate={handleBugUpdate}
          onBugDelete={handleBugDelete}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bugs.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bugs Found</h3>
              <p className="text-gray-500 mb-6">
                Start by reporting your first bug!
              </p>
              <Link 
                to="/report" 
                className="btn-primary inline-block"
              >
                Report First Bug
              </Link>
            </div>
          ) : (
            bugs.map(bug => (
              <div 
                key={bug._id} 
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4"
                style={{
                  borderLeftColor: 
                    bug.priority === 'critical' ? '#dc2626' :
                    bug.priority === 'high' ? '#ea580c' :
                    bug.priority === 'medium' ? '#ca8a04' : '#16a34a'
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800 text-lg line-clamp-2">{bug.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    bug.status === 'open' ? 'status-open' :
                    bug.status === 'in-progress' ? 'status-in-progress' :
                    bug.status === 'resolved' ? 'status-resolved' : 'status-closed'
                  }`}>
                    {bug.status}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{bug.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 mr-2">Priority:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      bug.priority === 'critical' ? 'priority-critical' :
                      bug.priority === 'high' ? 'priority-high' :
                      bug.priority === 'medium' ? 'priority-medium' : 'priority-low'
                    }`}>
                      {bug.priority}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 mr-2">Reported by:</span>
                    <span className="font-medium">{bug.reportedBy}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 mr-2">Assigned to:</span>
                    <span className="font-medium">{bug.assignedTo}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    {new Date(bug.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/bugs/${bug._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Empty state for grid view */}
      {bugs.length > 0 && viewMode === 'grid' && (
        <div className="text-center mt-8">
          <p className="text-gray-500">
            Showing {bugs.length} bug{bugs.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default BugListPage;