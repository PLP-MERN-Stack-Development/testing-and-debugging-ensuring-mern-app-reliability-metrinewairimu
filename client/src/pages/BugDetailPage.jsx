import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay/ErrorDisplay';
import bugService from '../services/bugService';

const BugDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchBugDetails();
  }, [id]);

  const fetchBugDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bugService.getBug(id);
      setBug(response.data);
      
      // Mock comments for now - in a real app, this would come from an API
      setComments([
        {
          id: 1,
          user: 'John Developer',
          text: 'I\'ve started looking into this issue. The problem seems to be in the login service.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          avatar: '👨‍💻'
        },
        {
          id: 2,
          user: 'Sarah Tester',
          text: 'Can you provide more details about the steps to reproduce?',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          avatar: '👩‍💼'
        }
      ]);
    } catch (err) {
      console.error('Error fetching bug details:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const response = await bugService.updateBugStatus(id, newStatus);
      setBug(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err);
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    setUpdating(true);
    try {
      const response = await bugService.updateBug(id, { priority: newPriority });
      setBug(prev => ({ ...prev, priority: newPriority }));
    } catch (err) {
      console.error('Error updating priority:', err);
      setError(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await bugService.deleteBug(id);
      navigate('/bugs', { state: { message: 'Bug deleted successfully' } });
    } catch (err) {
      console.error('Error deleting bug:', err);
      setError(err);
    }
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    
    const newComment = {
      id: comments.length + 1,
      user: 'Current User',
      text: comment,
      timestamp: new Date().toISOString(),
      avatar: '👤'
    };
    
    setComments(prev => [newComment, ...prev]);
    setComment('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading bug details..." fullScreen={false} />;
  }

  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={fetchBugDetails}
        title="Failed to Load Bug Details"
      />
    );
  }

  if (!bug) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bug Not Found</h2>
        <p className="text-gray-600 mb-6">The bug you're looking for doesn't exist or has been deleted.</p>
        <Link to="/bugs" className="btn-primary">
          Back to Bugs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Link to="/bugs" className="text-blue-600 hover:text-blue-800">
              ← Back to Bugs
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Bug #{id.slice(-6)}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">{bug.title}</h1>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
          <Link
            to={`/report?edit=${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-6xl mb-4 text-center">🗑️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Delete Bug?
            </h3>
            <p className="text-gray-600 mb-8 text-center">
              Are you sure you want to delete this bug? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 btn-secondary py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
              >
                Delete Bug
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Bug details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{bug.description}</p>
            </div>
          </div>

          {/* Steps to reproduce */}
          {bug.stepsToReproduce && bug.stepsToReproduce.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Steps to Reproduce</h2>
              <ol className="space-y-3">
                {bug.stepsToReproduce.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Comments */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Comments</h2>
            
            {/* Add comment */}
            <div className="mb-8">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="form-input min-h-[100px]"
                placeholder="Add a comment..."
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  className="btn-primary"
                >
                  Add Comment
                </button>
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start mb-3">
                    <div className="text-2xl mr-3">{comment.avatar}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-gray-800">{comment.user}</h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-2">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-6">
          {/* Status and priority */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Status & Priority</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-x-2 mb-3">
                  {['open', 'in-progress', 'resolved', 'closed'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={updating || bug.status === status}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        bug.status === status 
                          ? getStatusColor(status)
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="space-x-2">
                  {['critical', 'high', 'medium', 'low'].map(priority => (
                    <button
                      key={priority}
                      onClick={() => handlePriorityChange(priority)}
                      disabled={updating || bug.priority === priority}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        bug.priority === priority 
                          ? getPriorityColor(priority)
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bug info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Bug Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reported By
                </label>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">👤</span>
                  <span className="font-medium text-gray-800">{bug.reportedBy}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">👨‍💼</span>
                  <span className="font-medium text-gray-800">{bug.assignedTo}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created
                </label>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">📅</span>
                  <span className="text-gray-800">{formatDate(bug.createdAt)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Updated
                </label>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🔄</span>
                  <span className="text-gray-800">{formatDate(bug.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Environment */}
          {(bug.environment?.os || bug.environment?.browser) && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Environment</h2>
              
              <div className="space-y-3">
                {bug.environment.os && (
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">💻</span>
                    <div>
                      <div className="font-medium text-gray-700">OS</div>
                      <div className="text-gray-600">{bug.environment.os}</div>
                    </div>
                  </div>
                )}

                {bug.environment.browser && (
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🌐</span>
                    <div>
                      <div className="font-medium text-gray-700">Browser</div>
                      <div className="text-gray-600">{bug.environment.browser}</div>
                    </div>
                  </div>
                )}

                {bug.environment.version && (
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🔢</span>
                    <div>
                      <div className="font-medium text-gray-700">Version</div>
                      <div className="text-gray-600">{bug.environment.version}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity log */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="text-2xl mr-3">📝</div>
                <div>
                  <div className="font-medium text-gray-700">Bug created</div>
                  <div className="text-sm text-gray-500">{formatDate(bug.createdAt)}</div>
                </div>
              </div>

              {bug.updatedAt !== bug.createdAt && (
                <div className="flex items-start">
                  <div className="text-2xl mr-3">✏️</div>
                  <div>
                    <div className="font-medium text-gray-700">Last updated</div>
                    <div className="text-sm text-gray-500">{formatDate(bug.updatedAt)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugDetailPage;