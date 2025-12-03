import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import ErrorDisplay from '../ErrorDisplay/ErrorDisplay';

const BugForm = ({ 
  initialValues = {}, 
  onSubmit, 
  loading = false,
  submitText = 'Submit',
  title = 'Report a Bug'
}) => {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Title is required')
      .max(100, 'Title must be 100 characters or less')
      .trim(),
    description: Yup.string()
      .required('Description is required')
      .max(1000, 'Description must be 1000 characters or less')
      .trim(),
    priority: Yup.string()
      .oneOf(['low', 'medium', 'high', 'critical'], 'Invalid priority level')
      .default('medium'),
    status: Yup.string()
      .oneOf(['open', 'in-progress', 'resolved', 'closed'], 'Invalid status')
      .default('open'),
    reportedBy: Yup.string()
      .required('Your name is required')
      .max(50, 'Name must be 50 characters or less')
      .trim(),
    assignedTo: Yup.string()
      .max(50, 'Name must be 50 characters or less')
      .default('Unassigned'),
    stepsToReproduce: Yup.array()
      .of(Yup.string().max(200, 'Step must be 200 characters or less'))
      .default([]),
    environment: Yup.object({
      os: Yup.string().default(''),
      browser: Yup.string().default(''),
      version: Yup.string().default('')
    }).default({})
  });

  const defaultValues = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    reportedBy: '',
    assignedTo: 'Unassigned',
    stepsToReproduce: [''],
    environment: {
      os: '',
      browser: '',
      version: ''
    },
    ...initialValues
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Filter out empty steps
      const filteredSteps = values.stepsToReproduce.filter(step => step.trim() !== '');
      const bugData = {
        ...values,
        stepsToReproduce: filteredSteps
      };

      await onSubmit(bugData);
      setShowSuccess(true);
      resetForm();
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setStep(1);
      }, 3000);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const addStep = (setFieldValue, values) => {
    setFieldValue('stepsToReproduce', [...values.stepsToReproduce, '']);
  };

  const removeStep = (setFieldValue, values, index) => {
    const newSteps = [...values.stepsToReproduce];
    newSteps.splice(index, 1);
    setFieldValue('stepsToReproduce', newSteps);
  };

  if (loading) {
    return <LoadingSpinner text="Loading form..." />;
  }

  if (showSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Success!</h3>
        <p className="text-green-600 mb-6">Bug report has been submitted successfully.</p>
        <button
          onClick={() => {
            setShowSuccess(false);
            setStep(1);
          }}
          className="btn-primary"
        >
          Report Another Bug
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6" data-testid="bug-form">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">Fill out the form below to report a new bug</p>
        
        {/* Progress steps */}
        <div className="flex items-center justify-between mt-6 mb-8">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
              `}>
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`w-16 h-1 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
          <div className="text-sm text-gray-500">
            Step {step} of 3
          </div>
        </div>
      </div>

      <Formik
        initialValues={defaultValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting, setFieldValue }) => (
          <Form className="space-y-6">
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label htmlFor="title" className="form-label">
                    Bug Title *
                  </label>
                  <Field
                    type="text"
                    id="title"
                    name="title"
                    className="form-input"
                    placeholder="Brief description of the bug"
                  />
                  <ErrorMessage name="title" component="div" className="form-error" />
                </div>

                <div>
                  <label htmlFor="description" className="form-label">
                    Description *
                  </label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    className="form-input min-h-[120px]"
                    placeholder="Detailed description of the bug, what you expected vs what happened"
                  />
                  <div className="flex justify-between mt-1">
                    <ErrorMessage name="description" component="div" className="form-error" />
                    <div className="text-sm text-gray-500">
                      {values.description.length}/1000 characters
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="priority" className="form-label">
                      Priority
                    </label>
                    <Field as="select" id="priority" name="priority" className="form-input">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </Field>
                    <div className="mt-2 text-sm text-gray-500">
                      {values.priority === 'critical' && '🟥 Critical: System unusable'}
                      {values.priority === 'high' && '🟧 High: Major functionality broken'}
                      {values.priority === 'medium' && '🟨 Medium: Minor issue'}
                      {values.priority === 'low' && '🟩 Low: Cosmetic issue'}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="status" className="form-label">
                      Status
                    </label>
                    <Field as="select" id="status" name="status" className="form-input">
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </Field>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-primary"
                  >
                    Next: Steps to Reproduce →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="form-label mb-3">Steps to Reproduce</label>
                  {values.stepsToReproduce.map((step, index) => (
                    <div key={index} className="flex items-start mb-3">
                      <div className="mr-3 mt-3 text-gray-500">{index + 1}.</div>
                      <div className="flex-1">
                        <Field
                          type="text"
                          name={`stepsToReproduce[${index}]`}
                          className="form-input"
                          placeholder={`Step ${index + 1}: Describe what you did`}
                        />
                        <ErrorMessage 
                          name={`stepsToReproduce[${index}]`} 
                          component="div" 
                          className="form-error" 
                        />
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeStep(setFieldValue, values, index)}
                          className="ml-3 mt-3 text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addStep(setFieldValue, values)}
                    className="mt-2 text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <span className="mr-2">+</span>
                    Add Another Step
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="environment.os" className="form-label">
                      Operating System
                    </label>
                    <Field
                      type="text"
                      id="environment.os"
                      name="environment.os"
                      className="form-input"
                      placeholder="e.g., Windows 11, macOS"
                    />
                  </div>

                  <div>
                    <label htmlFor="environment.browser" className="form-label">
                      Browser
                    </label>
                    <Field
                      type="text"
                      id="environment.browser"
                      name="environment.browser"
                      className="form-input"
                      placeholder="e.g., Chrome, Firefox"
                    />
                  </div>

                  <div>
                    <label htmlFor="environment.version" className="form-label">
                      Version
                    </label>
                    <Field
                      type="text"
                      id="environment.version"
                      name="environment.version"
                      className="form-input"
                      placeholder="e.g., 98.0.4758.102"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-primary"
                  >
                    Next: Contact Info →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="reportedBy" className="form-label">
                      Your Name *
                    </label>
                    <Field
                      type="text"
                      id="reportedBy"
                      name="reportedBy"
                      className="form-input"
                      placeholder="Enter your name"
                    />
                    <ErrorMessage name="reportedBy" component="div" className="form-error" />
                  </div>

                  <div>
                    <label htmlFor="assignedTo" className="form-label">
                      Assign To (Optional)
                    </label>
                    <Field
                      type="text"
                      id="assignedTo"
                      name="assignedTo"
                      className="form-input"
                      placeholder="Team member to assign"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Bug Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="w-32 text-gray-600">Title:</span>
                      <span className="font-medium">{values.title || 'Not provided'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-600">Priority:</span>
                      <span className={`px-2 py-1 rounded text-xs ${values.priority === 'critical' ? 'priority-critical' : 
                        values.priority === 'high' ? 'priority-high' :
                        values.priority === 'medium' ? 'priority-medium' : 'priority-low'}`}>
                        {values.priority}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs ${values.status === 'open' ? 'status-open' : 
                        values.status === 'in-progress' ? 'status-in-progress' :
                        values.status === 'resolved' ? 'status-resolved' : 'status-closed'}`}>
                        {values.status}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-gray-600">Steps:</span>
                      <span>{values.stepsToReproduce.filter(s => s.trim()).length} steps provided</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-secondary"
                  >
                    ← Back
                  </button>
                  <div className="space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        // Reset to step 1
                        setStep(1);
                      }}
                      className="btn-secondary"
                    >
                      Start Over
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary px-8"
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner size="small" text="" />
                          <span className="ml-2">Submitting...</span>
                        </>
                      ) : (
                        submitText
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default BugForm;