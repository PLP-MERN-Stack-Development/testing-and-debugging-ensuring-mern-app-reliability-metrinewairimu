import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const BugCard = ({ bug, onUpdate, onDelete, onStatusUpdate, expanded: initialExpanded = false }) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: bug.title,
    description: bug.description,
    priority: bug.priority,
    assignedTo: bug.assignedTo
  });
  const [statusUpdating, setStatusUpdating] = useState(false);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      await onUpdate(bug._id, editForm);
      setEditing(false);
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    try {
      await onStatusUpdate(bug._id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setStatusUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return '🔥';
      case 'high': return '⚠️';
      case 'medium': return '🔶';
      case 'low': return '📌';
      default: return '📝';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return '🟢';
      case 'in-progress': return '🟡';
      case 'resolved': return '✅';
      case 'closed': return '🔒';
      default: return '📋';
    }
  };

  if (editing) {
    return (
      <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6" data-testid="bug-card-editing">
        <div className="space-y-4">
          <input
            type="text"
            name="title"
            value={editForm.title}
            onChange={handleEditChange}
            className="form-input text-xl font-bold"
            placeholder="Bug title"
          />
          
          <textarea
            name="description"
            value={editForm.description}
            onChange={handleEditChange}
            className="form-input min-h-[100px]"
            placeholder="Bug description"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Priority</label>
              <select
                name="priority"
                value={editForm.priority}
                onChange={handleEditChange}
                className="form-input"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Assign To</label>
              <input
                type="text"
                name="assignedTo"
                value={editForm.assignedTo}
                onChange={handleEditChange}
                className="form-input"
                placeholder="Unassigned"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setEditing(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="btn-primary"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 ${
        bug.priority === 'critical' ? 'border-l-red-500' :
        bug.priority === 'high' ? 'border-l-orange-500' :
        bug.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
      }`}
      data-testid={`bug-card-${bug._id}`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">{getPriorityIcon(bug.priority)}</span>
              <h3 className="text-xl font-bold text-gray-800">{bug.title}</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                bug.status === 'open' ? 'status-open' :
                bug.status === 'in-progress' ? 'status-in-progress' :
                bug.status === 'resolved' ? 'status-resolved' : 'status-closed'
              }`}>
                {getStatusIcon(bug.status)} {bug.status.charAt(0).toUpperCase() + bug.status.slice(1)}
              </span>
              
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                bug.priority === 'critical' ? 'priority-critical' :
                bug.priority === 'high' ? 'priority-high' :
                bug.priority === 'medium' ? 'priority-medium' : 'priority-low'
              }`}>
                {bug.priority.charAt(0).toUpperCase() + bug.priority.slice(1)} Priority
              </span>
              
              <span className="text-gray-500 text-sm">
                Reported by: {bug.reportedBy}
              </span>
              
              {bug.assignedTo && bug.assignedTo !== 'Unassigned' && (
                <span className="text-blue-600 text-sm bg-blue-50 px-3 py-1 rounded-full">
                  👤 Assigned to: {bug.assignedTo}
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right text-sm text-gray-500">
            <div>Reported: {formatDate(bug.createdAt)}</div>
            {bug.updatedAt !== bug.createdAt && (
              <div className="mt-1">Updated: {formatDate(bug.updatedAt)}</div>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 line-clamp-2">{bug.description}</p>
          {expanded && bug.stepsToReproduce && bug.stepsToReproduce.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Steps to Reproduce:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                {bug.stepsToReproduce.map((step, index) => (
                  <li key={index} className="ml-2">{step}</li>
                ))}
              </ol>
            </div>
          )}
          
          {bug.environment && (bug.environment.os || bug.environment.browser) && (
            <div className="mt-4 text-sm text-gray-500">
              <span className="font-medium">Environment: </span>
              {[bug.environment.os, bug.environment.browser, bug.environment.version]
                .filter(Boolean)
                .join(' • ')}
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {expanded ? 'Show Less' : 'Show More'}
            </button>
            
            <Link
              to={`/bugs/${bug._id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details
            </Link>
          </div>
          
          <div className="flex space-x-3">
            {/* Quick Status Update */}
            {!statusUpdating ? (
              <select
                value={bug.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="open">Set as Open</option>
                <option value="in-progress">Set as In Progress</option>
                <option value="resolved">Set as Resolved</option>
                <option value="closed">Set as Closed</option>
              </select>
            ) : (
              <div className="text-sm text-gray-500">Updating...</div>
            )}
            
            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit
            </button>
            
            <button
              onClick={() => onDelete(bug._id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugCard;