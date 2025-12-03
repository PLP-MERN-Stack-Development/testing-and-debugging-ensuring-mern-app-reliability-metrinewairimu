import React, { useState, useEffect } from 'react';
import BugCard from '../BugCard/BugCard';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import ErrorDisplay from '../ErrorDisplay/ErrorDisplay';
import bugService from '../../services/bugService';

const BugList = ({ 
  bugs: propBugs, 
  onBugUpdate, 
  onBugDelete,
  showFilters = true,
  limit = null
}) => {
  const [bugs, setBugs] = useState(propBugs || []);
  const [loading, setLoading] = useState(!propBugs);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    sort: '-createdAt'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: limit || 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    if (!propBugs) {
      fetchBugs();
    } else {
      setBugs(propBugs);
    }
  }, [propBugs, filters, pagination.page]);

  const fetchBugs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sort: filters.sort
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key] && key !== 'sort') {
          delete params[key];
        }
      });

      const response = await bugService.getAllBugs(params);
      setBugs(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching bugs:', err);
      setError(err);
      setBugs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      search: '',
      sort: '-createdAt'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleBugUpdate = async (bugId, updates) => {
    try {
      const updatedBug = await bugService.updateBug(bugId, updates);
      setBugs(prev => prev.map(bug => 
        bug._id === bugId ? updatedBug.data : bug
      ));
      
      if (onBugUpdate) {
        onBugUpdate(updatedBug.data);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error updating bug:', err);
      return { success: false, error: err };
    }
  };

  const handleBugDelete = async (bugId) => {
    if (!window.confirm('Are you sure you want to delete this bug?')) {
      return { success: false };
    }

    try {
      await bugService.deleteBug(bugId);
      setBugs(prev => prev.filter(bug => bug._id !== bugId));
      
      if (onBugDelete) {
        onBugDelete(bugId);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting bug:', err);
      return { success: false, error: err };
    }
  };

  const handleStatusUpdate = async (bugId, status) => {
    try {
      const updatedBug = await bugService.updateBugStatus(bugId, status);
      setBugs(prev => prev.map(bug => 
        bug._id === bugId ? updatedBug.data : bug
      ));
      
      return { success: true };
    } catch (err) {
      console.error('Error updating status:', err);
      return { success: false, error: err };
    }
  };

  const getPriorityCount = (priority) => {
    return bugs.filter(bug => bug.priority === priority).length;
  };

  const getStatusCount = (status) => {
    return bugs.filter(bug => bug.status === status).length;
  };

  if (loading) {
    return <LoadingSpinner text="Loading bugs..." />;
  }

  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={fetchBugs}
        title="Failed to Load Bugs"
      />
    );
  }

  return (
    <div className="space-y-6" data-testid="bug-list">
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="form-input"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="form-input"
              >
                <option value="">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="form-input"
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="-priority">Priority (High to Low)</option>
                <option value="priority">Priority (Low to High)</option>
                <option value="title">Title (A-Z)</option>
                <option value="-title">Title (Z-A)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="form-input pl-10"
                  placeholder="Search bugs..."
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  🔍
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{bugs.length}</div>
              <div className="text-sm text-blue-600">Total Bugs</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{getPriorityCount('critical')}</div>
              <div className="text-sm text-red-600">Critical</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">{getPriorityCount('high')}</div>
              <div className="text-sm text-orange-600">High Priority</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{getStatusCount('open')}</div>
              <div className="text-sm text-green-600">Open Bugs</div>
            </div>
          </div>
        </div>
      )}

      {/* Bugs list */}
      <div className="space-y-4">
        {bugs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bugs Found</h3>
            <p className="text-gray-500 mb-6">
              {filters.status || filters.priority || filters.search 
                ? 'Try changing your filters' 
                : 'Start by reporting your first bug!'}
            </p>
            <a 
              href="/report" 
              className="btn-primary inline-block"
            >
              Report First Bug
            </a>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Bugs ({bugs.length})
              </h2>
              <div className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </div>
            </div>

            <div className="space-y-4">
              {bugs.map(bug => (
                <BugCard
                  key={bug._id}
                  bug={bug}
                  onUpdate={handleBugUpdate}
                  onDelete={handleBugDelete}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2 pt-6">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                  ← Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`w-10 h-10 rounded-md ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BugList;