import api from './api';

const bugService = {
  // Get all bugs with optional filtering
  getAllBugs: (params = {}) => {
    console.log('Fetching bugs with params:', params);
    return api.get('/bugs', { params });
  },

  // Get single bug by ID
  getBug: (id) => {
    console.log('Fetching bug:', id);
    return api.get(`/bugs/${id}`);
  },

  // Create new bug
  createBug: (bugData) => {
    console.log('Creating bug:', bugData);
    return api.post('/bugs', bugData);
  },

  // Update bug
  updateBug: (id, bugData) => {
    console.log('Updating bug:', id, bugData);
    return api.put(`/bugs/${id}`, bugData);
  },

  // Update bug status
  updateBugStatus: (id, status) => {
    console.log('Updating bug status:', id, status);
    return api.patch(`/bugs/${id}/status`, { status });
  },

  // Delete bug
  deleteBug: (id) => {
    console.log('Deleting bug:', id);
    return api.delete(`/bugs/${id}`);
  },

  // Get bug statistics
  getBugStats: () => {
    console.log('Fetching bug statistics');
    return api.get('/bugs/stats/summary');
  },

  // Search bugs
  searchBugs: (query) => {
    console.log('Searching bugs:', query);
    return api.get('/bugs', { params: { search: query } });
  }
};

export default bugService;