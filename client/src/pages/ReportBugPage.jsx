import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import BugForm from '../components/BugForm/BugForm';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay/ErrorDisplay';
import bugService from '../services/bugService';
import authService from '../services/authService';

const ReportBugPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [bugToEdit, setBugToEdit] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for edit mode
    const params = new URLSearchParams(location.search);
    const bugId = params.get('edit');
    
    if (bugId) {
      setEditMode(true);
      fetchBugForEdit(bugId);
    }
    
    // Get current user for reporter name
    const currentUser = authService.getUser();
    setUser(currentUser);
  }, [location]);

  const fetchBugForEdit = async (bugId) => {
    setLoading(true);
    try {
      const response = await bugService.getBug(bugId);
      setBugToEdit(response.data);
    } catch (err) {
      console.error('Error fetching bug for edit:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (bugData) => {
    setLoading(true);
    setError(null);
    
    try {
      if (editMode && bugToEdit) {
        // Update existing bug
        await bugService.updateBug(bugToEdit._id, bugData);
        navigate(`/bugs/${bugToEdit._id}`, { 
          state: { message: 'Bug updated successfully!' } 
        });
      } else {
        // Create new bug
        const response = await bugService.createBug({
          ...bugData,
          reportedBy: user?.name || bugData.reportedBy
        });
        navigate(`/bugs/${response.data._id}`, { 
          state: { message: 'Bug reported successfully!' } 
        });
      }
    } catch (err) {
      console.error('Error submitting bug:', err);
      setError(err);
      setLoading(false);
    }
  };

  if (loading && editMode && !bugToEdit) {
    return <LoadingSpinner text="Loading bug for editing..." fullScreen={false} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Link to="/bugs" className="text-blue-600 hover:text-blue-800">
            ← Back to Bugs
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">
            {editMode ? 'Edit Bug' : 'Report Bug'}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {editMode ? 'Edit Bug Report' : 'Report a New Bug'}
        </h1>
        <p className="text-gray-600">
          {editMode 
            ? 'Update the bug details below' 
            : 'Fill out the form below to report a bug that needs fixing'}
        </p>
      </div>

      {error && (
        <ErrorDisplay 
          error={error} 
          onRetry={() => setError(null)}
          title={editMode ? "Failed to Load Bug" : "Failed to Submit Bug"}
          className="mb-6"
        />
      )}

      <BugForm
        initialValues={bugToEdit || {
          reportedBy: user?.name || '',
          stepsToReproduce: ['']
        }}
        onSubmit={handleSubmit}
        loading={loading}
        submitText={editMode ? 'Update Bug' : 'Submit Bug Report'}
        title={editMode ? 'Edit Bug Report' : 'Report a New Bug'}
      />

      {/* Help section */}
      {!editMode && (
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">How to Write a Good Bug Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="text-2xl mr-3">🎯</div>
                <div>
                  <h3 className="font-semibold text-blue-700 mb-1">Be Specific</h3>
                  <p className="text-blue-600 text-sm">
                    Clearly describe what happened vs what you expected to happen
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-2xl mr-3">📋</div>
                <div>
                  <h3 className="font-semibold text-blue-700 mb-1">Include Steps</h3>
                  <p className="text-blue-600 text-sm">
                    List exact steps to reproduce the issue from start to finish
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="text-2xl mr-3">💻</div>
                <div>
                  <h3 className="font-semibold text-blue-700 mb-1">Add Environment</h3>
                  <p className="text-blue-600 text-sm">
                    Include OS, browser, and version details when applicable
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-2xl mr-3">📷</div>
                <div>
                  <h3 className="font-semibold text-blue-700 mb-1">Attach Screenshots</h3>
                  <p className="text-blue-600 text-sm">
                    Visual evidence helps developers understand the issue faster
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-blue-300">
            <h3 className="font-semibold text-blue-700 mb-3">Need Help?</h3>
            <div className="flex flex-wrap gap-3">
              <a 
                href="/docs/bug-reporting" 
                className="px-4 py-2 bg-white text-blue-600 rounded-lg border border-blue-300 hover:bg-blue-50"
              >
                📚 Documentation
              </a>
              <a 
                href="/templates" 
                className="px-4 py-2 bg-white text-blue-600 rounded-lg border border-blue-300 hover:bg-blue-50"
              >
                📝 Templates
              </a>
              <a 
                href="/contact" 
                className="px-4 py-2 bg-white text-blue-600 rounded-lg border border-blue-300 hover:bg-blue-50"
              >
                💬 Contact Support
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportBugPage;