import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay/ErrorDisplay';

const RegisterPage = () => {
  const { register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be 50 characters or less'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
    agreeToTerms: Yup.boolean()
      .oneOf([true], 'You must accept the terms and conditions')
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setRegisterError(null);
    clearError();
    
    try {
      const result = await register(values.name, values.email, values.password);
      
      if (result.success) {
        resetForm();
        navigate('/');
      } else {
        setRegisterError(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError(error.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">Join our bug tracking community</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {(authError || registerError) && (
            <ErrorDisplay 
              error={{ message: authError || registerError, type: 'auth' }}
              dismissible={true}
              className="mb-6"
            />
          )}

          <Formik
            initialValues={{ 
              name: '', 
              email: '', 
              password: '', 
              confirmPassword: '',
              agreeToTerms: false 
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched, values }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <Field
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    placeholder="John Doe"
                  />
                  <ErrorMessage name="name" component="div" className="form-error" />
                </div>

                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    placeholder="you@example.com"
                  />
                  <ErrorMessage name="email" component="div" className="form-error" />
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="relative">
                    <Field
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      className="form-input pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="form-error" />
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Password must contain:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li className={values.password.length >= 6 ? 'text-green-600' : 'text-gray-400'}>
                        At least 6 characters
                      </li>
                      <li className={/[a-z]/.test(values.password) ? 'text-green-600' : 'text-gray-400'}>
                        One lowercase letter
                      </li>
                      <li className={/[A-Z]/.test(values.password) ? 'text-green-600' : 'text-gray-400'}>
                        One uppercase letter
                      </li>
                      <li className={/\d/.test(values.password) ? 'text-green-600' : 'text-gray-400'}>
                        One number
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <Field
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-input"
                    placeholder="••••••••"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="form-error" />
                  {values.password && values.confirmPassword && values.password === values.confirmPassword && (
                    <div className="mt-1 text-green-600 text-sm">✓ Passwords match</div>
                  )}
                </div>

                <div className="flex items-start">
                  <Field
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-800">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-800">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                <ErrorMessage name="agreeToTerms" component="div" className="form-error" />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3 text-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="small" text="" color="white" />
                      <span className="ml-2">Creating account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-2xl mr-3">💡</div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Why join us?</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Track and manage bugs efficiently</li>
                <li>• Collaborate with your team</li>
                <li>• Get detailed analytics and reports</li>
                <li>• Priority support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;