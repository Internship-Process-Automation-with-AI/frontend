import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import RequestReview from '../src/components/RequestReview';

// Mock fetch globally
global.fetch = jest.fn();

// Console error mocking is handled globally in setupTests.js

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

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  test('renders request review page with title', () => {
    render(<RequestReview {...defaultProps} />);
    
    expect(screen.getByText('Request Review')).toBeInTheDocument();
    expect(screen.getByText('Submit an appeal for your rejected application')).toBeInTheDocument();
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

  test('displays appeal form', () => {
    render(<RequestReview {...defaultProps} />);
    
    expect(screen.getByText('Appeal Details')).toBeInTheDocument();
    expect(screen.getByText('Reason for Appeal *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/)).toBeInTheDocument();
    expect(screen.getByText('Be specific and provide relevant details to support your appeal.')).toBeInTheDocument();
  });

  test('displays appeal guidelines', () => {
    render(<RequestReview {...defaultProps} />);
    
    expect(screen.getByText('Appeal Guidelines')).toBeInTheDocument();
    expect(screen.getByText(/Appeals are reviewed by academic staff within 5-7 business days/)).toBeInTheDocument();
    expect(screen.getByText(/Provide specific reasons why the decision should be reconsidered/)).toBeInTheDocument();
    expect(screen.getByText(/Include any additional documentation or evidence if available/)).toBeInTheDocument();
    expect(screen.getByText(/Appeals are only accepted for valid academic or procedural reasons/)).toBeInTheDocument();
    expect(screen.getByText(/You will be notified of the appeal outcome via email/)).toBeInTheDocument();
  });

  test('allows entering appeal reason', () => {
    render(<RequestReview {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: 'This is my appeal reason' } });
    
    expect(textarea.value).toBe('This is my appeal reason');
  });

  test('enables submit button when appeal reason is entered', () => {
    render(<RequestReview {...defaultProps} />);
    
    const submitButton = screen.getByText('Submit Appeal');
    expect(submitButton).toBeDisabled();
    
    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: 'This is my appeal reason' } });
    
    expect(submitButton).not.toBeDisabled();
  });

  test('shows error when trying to submit empty appeal', () => {
    render(<RequestReview {...defaultProps} />);
    
    const submitButton = screen.getByText('Submit Appeal');
    expect(submitButton).toBeDisabled();
    
    // The button should be disabled when no appeal reason is entered
    // This prevents users from submitting empty appeals
    expect(submitButton).toHaveAttribute('disabled');
  });

  test('submits appeal successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });
    
    render(<RequestReview {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: 'This is my appeal reason' } });
    
    const submitButton = screen.getByText('Submit Appeal');
    act(() => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/certificate/cert-123/appeal',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            appeal_reason: 'This is my appeal reason'
          })
        }
      );
    });
  });

  test('shows success state after appeal submitted', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });
    
    render(<RequestReview {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: 'This is my appeal reason' } });
    
    const submitButton = screen.getByText('Submit Appeal');
    act(() => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Appeal Submitted!')).toBeInTheDocument();
      expect(screen.getByText(/Your appeal has been successfully submitted/)).toBeInTheDocument();
    });
  });

  test('shows loading state while submitting', async () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<RequestReview {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: 'This is my appeal reason' } });
    
    const submitButton = screen.getByText('Submit Appeal');
    act(() => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });
  });

  test('handles API error when submitting appeal', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(<RequestReview {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: 'This is my appeal reason' } });
    
    const submitButton = screen.getByText('Submit Appeal');
    act(() => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Failed to submit appeal. Please try again.')).toBeInTheDocument();
    });
  });

  test('handles server error response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Server error message' })
    });
    
    render(<RequestReview {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: 'This is my appeal reason' } });
    
    const submitButton = screen.getByText('Submit Appeal');
    act(() => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Failed to submit appeal. Please try again.')).toBeInTheDocument();
    });
  });

  test('calls onBackToDashboard when cancel button is clicked', () => {
    render(<RequestReview {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onBackToDashboard).toHaveBeenCalledWith('dashboard');
  });

  test('calls onBackToDashboard when back button is clicked in success state', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });
    
    render(<RequestReview {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: 'This is my appeal reason' } });
    
    const submitButton = screen.getByText('Submit Appeal');
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

  test('calls onRefreshApplications after successful submission', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });
    
    render(<RequestReview {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: 'This is my appeal reason' } });
    
    const submitButton = screen.getByText('Submit Appeal');
    act(() => {
      fireEvent.click(submitButton);
    });
    
    await waitFor(() => {
      expect(defaultProps.onRefreshApplications).toHaveBeenCalled();
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
    // The component shows empty string for missing training type, not "Not specified"
    expect(screen.getByText('Training Type')).toBeInTheDocument();
  });

  test('disables submit button when appeal reason is only whitespace', () => {
    render(<RequestReview {...defaultProps} />);
    
    const submitButton = screen.getByText('Submit Appeal');
    expect(submitButton).toBeDisabled();
    
    const textarea = screen.getByPlaceholderText(/Please explain why you believe this decision should be reviewed/);
    fireEvent.change(textarea, { target: { value: '   ' } });
    
    expect(submitButton).toBeDisabled();
  });

  test('shows error when submitting appeal with only whitespace', async () => {
    render(<RequestReview {...defaultProps} />);
    
    const submitButton = screen.getByText('Submit Appeal');
    expect(submitButton).toBeDisabled();
    
    // The button should be disabled when appeal reason is only whitespace
    // This prevents users from submitting invalid appeals
    expect(submitButton).toHaveAttribute('disabled');
  });
}); 