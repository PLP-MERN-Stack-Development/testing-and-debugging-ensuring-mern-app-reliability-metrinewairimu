import { useState, useEffect, useCallback } from 'react';
import bugService from '../services/bugService';

export const useBugs = (initialFilters = {}) => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [stats, setStats] = useState(null);

  const fetchBugs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
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
  }, [filters, pagination.page, pagination.limit]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await bugService.getBugStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching bug stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchBugs();
  }, [fetchBugs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const goToPage = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const createBug = async (bugData) => {
    try {
      const response = await bugService.createBug(bugData);
      await fetchBugs(); // Refresh the list
      await fetchStats(); // Refresh stats
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error creating bug:', err);
      return { success: false, error: err };
    }
  };

  const updateBug = async (bugId, updates) => {
    try {
      const response = await bugService.updateBug(bugId, updates);
      setBugs(prev => prev.map(bug => 
        bug._id === bugId ? response.data : bug
      ));
      await fetchStats(); // Refresh stats
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error updating bug:', err);
      return { success: false, error: err };
    }
  };

  const updateBugStatus = async (bugId, status) => {
    try {
      const response = await bugService.updateBugStatus(bugId, status);
      setBugs(prev => prev.map(bug => 
        bug._id === bugId ? response.data : bug
      ));
      await fetchStats(); // Refresh stats
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error updating bug status:', err);
      return { success: false, error: err };
    }
  };

  const deleteBug = async (bugId) => {
    try {
      await bugService.deleteBug(bugId);
      setBugs(prev => prev.filter(bug => bug._id !== bugId));
      await fetchStats(); // Refresh stats
      return { success: true };
    } catch (err) {
      console.error('Error deleting bug:', err);
      return { success: false, error: err };
    }
  };

  const searchBugs = async (query) => {
    try {
      const response = await bugService.searchBugs(query);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error searching bugs:', err);
      return { success: false, error: err };
    }
  };

  return {
    bugs,
    loading,
    error,
    filters,
    pagination,
    stats,
    updateFilter,
    clearFilters,
    goToPage,
    createBug,
    updateBug,
    updateBugStatus,
    deleteBug,
    searchBugs,
    refreshBugs: fetchBugs,
    refreshStats: fetchStats
  };
};