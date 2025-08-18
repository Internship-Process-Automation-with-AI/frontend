import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import RequestReview from '../src/components/student/RequestReview';

// Mock the config file to avoid import.meta.env issues
jest.mock('../src/api_calls/config', () => ({
  API_BASE_URL: 'http://localhost:8000',
  API_ENDPOINTS: {},
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  REQUEST_TIMEOUT: 30000,
  buildUrl: jest.fn(),
  ERROR_MESSAGES: {}
}));

// Mock the API service used by the component
jest.mock('../src/api_calls/studentAPI', () => ({
  getReviewers: jest.fn(),
  submitAppeal: jest.fn()
}));

describe('RequestReview', () => {
  const defaultProps = {
    results: {
      decision: 'REJECTED',
      credits: 0,
      filename: 'certificate.pdf',
      requested_training_type: 'Professional Training'
    },
    onBackToDashboard: jest.fn(),
    certificateId: 'cert-123',
    onRefreshApplications: jest.fn()
  };

  const mockReviewers = [
    {
      reviewer_id: '1',
      first_name: 'Alice',
      last_name: 'Brown',
      email: 'alice@example.com'
    },
    {
      reviewer_id: '2',
      first_name: 'Bob',
      last_name: 'Smith',
      email: 'bob@example.com'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders request review page with title', () => {
    render(<RequestReview {...defaultProps} />);
    
    expect(screen.getByText('Request Review')).toBeInTheDocument();
    expect(screen.getByText('Submit a comment for your rejected application and request human review')).toBeInTheDocument();
  });

  test('displays application summary', () => {
    render(<RequestReview {...defaultProps} />);
    
    expect(screen.getByText('Application Summary')).toBeInTheDocument();
    expect(screen.getByText('Document')).toBeInTheDocument();
    expect(screen.getByText('certificate.pdf')).toBeInTheDocument();
    expect(screen.getByText('Decision')).toBeInTheDocument();
    expect(screen.getByText('REJECTED')).toBeInTheDocument();
    expect(screen.getByText('Training Type')).toBeInTheDocument();
    expect(screen.getByText('Professional Training')).toBeInTheDocument();
    expect(screen.getByText('Credits')).toBeInTheDocument();
    expect(screen.getByText('0 ECTS')).toBeInTheDocument();
  });

  test('displays request form', () => {
    render(<RequestReview {...defaultProps} />);
    
    expect(screen.getByText('Request Details')).toBeInTheDocument();
    expect(screen.getByText('Comment / Reason for Review *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/)).toBeInTheDocument();
    expect(screen.getByText('Be specific and provide relevant details to support your request.')).toBeInTheDocument();
  });

  test('displays review process info', () => {
    render(<RequestReview {...defaultProps} />);
    
    expect(screen.getByText('Review Process')).toBeInTheDocument();
    expect(screen.getByText(/Your comment will be reviewed by the assigned reviewer/)).toBeInTheDocument();
  });

  test('allows entering comment', () => {
    render(<RequestReview {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: 'This is my appeal reason' } });
    
    expect(textarea.value).toBe('This is my appeal reason');
  });

  test('enables submit button when comment is entered and reviewer preselected', async () => {
    const { getReviewers } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(mockReviewers);

    render(<RequestReview {...defaultProps} />);

    // Wait for reviewers to load (first is preselected)
    await waitFor(() => {
      expect(getReviewers).toHaveBeenCalled();
    });

    const submitButton = screen.getByText('Submit Request');
    expect(submitButton).toBeDisabled();

    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: 'This is my appeal reason' } });

    expect(submitButton).not.toBeDisabled();
  });

  test('shows disabled submit button when comment is empty', () => {
    render(<RequestReview {...defaultProps} />);
    
    const submitButton = screen.getByText('Submit Request');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('disabled');
  });

  test('submits request successfully', async () => {
    const { getReviewers, submitAppeal } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(mockReviewers);
    submitAppeal.mockResolvedValue();
    
    render(<RequestReview {...defaultProps} />);

    await waitFor(() => {
      expect(getReviewers).toHaveBeenCalled();
    });

    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: 'This is my appeal reason' } });

    const submitButton = screen.getByText('Submit Request');
    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(submitAppeal).toHaveBeenCalledWith('cert-123', 'This is my appeal reason', '1');
    });
  });

  test('shows success state after submission', async () => {
    const { getReviewers, submitAppeal } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(mockReviewers);
    submitAppeal.mockResolvedValue();
    
    render(<RequestReview {...defaultProps} />);

    await waitFor(() => {
      expect(getReviewers).toHaveBeenCalled();
    });

    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: 'This is my appeal reason' } });

    const submitButton = screen.getByText('Submit Request');
    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Request Submitted!')).toBeInTheDocument();
      expect(screen.getByText('Your request has been successfully submitted. A reviewer will review your application and you will be notified of the outcome.')).toBeInTheDocument();
    });
  });

  test('shows loading state while submitting', async () => {
    const { getReviewers, submitAppeal } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(mockReviewers);

    let resolvePromise;
    const pending = new Promise(resolve => { resolvePromise = resolve; });
    submitAppeal.mockReturnValue(pending);

    render(<RequestReview {...defaultProps} />);

    await waitFor(() => {
      expect(getReviewers).toHaveBeenCalled();
    });

    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: 'This is my appeal reason' } });

    const submitButton = screen.getByText('Submit Request');
    act(() => {
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('Submitting...')).toBeInTheDocument();

    // Resolve
    resolvePromise();
  });

  test('handles API error when submitting', async () => {
    const { getReviewers, submitAppeal } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(mockReviewers);
    submitAppeal.mockRejectedValue(new Error('Network error'));

    render(<RequestReview {...defaultProps} />);

    await waitFor(() => {
      expect(getReviewers).toHaveBeenCalled();
    });

    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: 'This is my appeal reason' } });

    const submitButton = screen.getByText('Submit Request');
    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  test('calls onBackToDashboard when cancel button is clicked', () => {
    render(<RequestReview {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(defaultProps.onBackToDashboard).toHaveBeenCalledWith('dashboard');
  });

  test('calls onBackToDashboard and refreshes after success', async () => {
    const { getReviewers, submitAppeal } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(mockReviewers);
    submitAppeal.mockResolvedValue();

    render(<RequestReview {...defaultProps} />);

    await waitFor(() => {
      expect(getReviewers).toHaveBeenCalled();
    });

    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: 'This is my appeal reason' } });

    const submitButton = screen.getByText('Submit Request');
    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      const backButton = screen.getByText('Back to Dashboard');
      fireEvent.click(backButton);

      expect(defaultProps.onRefreshApplications).toHaveBeenCalled();
      expect(defaultProps.onBackToDashboard).toHaveBeenCalledWith('dashboard');
    });
  });

  test('handles missing data in results gracefully', () => {
    const incompleteResults = {
      decision: 'REJECTED',
      credits: null,
      filename: null,
      requested_training_type: null
    };

    const propsWithIncompleteResults = {
      ...defaultProps,
      results: incompleteResults
    };

    render(<RequestReview {...propsWithIncompleteResults} />);

    expect(screen.getAllByText('Document')).toHaveLength(2); // Label and fallback value
    expect(screen.getByText('0 ECTS')).toBeInTheDocument();
    expect(screen.getByText('Training Type')).toBeInTheDocument();
  });

  test('disables submit button when comment is only whitespace', async () => {
    const { getReviewers } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(mockReviewers);

    render(<RequestReview {...defaultProps} />);

    await waitFor(() => {
      expect(getReviewers).toHaveBeenCalled();
    });

    const submitButton = screen.getByText('Submit Request');
    expect(submitButton).toBeDisabled();

    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: '   ' } });

    expect(submitButton).toBeDisabled();
  });
});
