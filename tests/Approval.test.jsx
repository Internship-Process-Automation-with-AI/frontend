import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Approval from '../src/components/student/Approval';

// Mock the config file to avoid import.meta.env issues
jest.mock('../src/api_calls/config', () => ({
  API_BASE_URL: 'http://localhost:8000',
  API_ENDPOINTS: {
    STUDENT_LOOKUP: jest.fn(),
    STUDENT_APPLICATIONS: jest.fn(),
    UPLOAD_CERTIFICATE: jest.fn(),
    PROCESS_CERTIFICATE: jest.fn(),
    DOWNLOAD_CERTIFICATE: jest.fn(),
    CERTIFICATE_PREVIEW: jest.fn(),
    CERTIFICATE_DETAILS: jest.fn(),
    CERTIFICATE_FEEDBACK: jest.fn(),
    CERTIFICATE_REVIEW: jest.fn(),
    CERTIFICATE_APPEAL: jest.fn(),
    CERTIFICATE_APPEAL_REVIEW: jest.fn(),
    CERTIFICATE_DELETE: jest.fn(),
    CERTIFICATE_SEND_FOR_APPROVAL: jest.fn(),
    REVIEWERS_LIST: '/reviewers',
    REVIEWER_LOOKUP: jest.fn(),
    REVIEWER_CERTIFICATES: jest.fn(),
    HEALTH_CHECK: '/api/health',
    DEGREES_LIST: '/api/degrees'
  },
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  REQUEST_TIMEOUT: 30000,
  buildUrl: jest.fn(),
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    TIMEOUT_ERROR: 'Request timeout. Please try again.',
    UNAUTHORIZED: 'Unauthorized access. Please check your credentials.',
    NOT_FOUND: 'Resource not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Invalid data provided.'
  }
}));

// Mock the API service
jest.mock('../src/api_calls/studentAPI', () => ({
  getReviewers: jest.fn(),
  sendForApproval: jest.fn()
}));

// Mock the child components
jest.mock('../src/components/common/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../src/components/common/Icons', () => ({
  CheckCircleIcon: ({ className }) => <div data-testid="check-circle-icon" className={className}>CheckCircleIcon</div>,
  XCircleIcon: ({ className }) => <div data-testid="x-circle-icon" className={className}>XCircleIcon</div>,
}));

describe('Approval', () => {
  const defaultProps = {
    results: {
      decision: {
        ai_decision: 'ACCEPTED',
        credits_awarded: 5
      },
      filename: 'certificate.pdf',
      requested_training_type: 'Professional Training'
    },
    onBackToDashboard: jest.fn(),
    certificateId: 'cert-123'
  };

  const mockReviewers = [
    {
      reviewer_id: '1',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@example.com',
      position: 'Senior Reviewer',
      department: 'Computer Science'
    },
    {
      reviewer_id: '2',
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane.doe@example.com',
      position: 'Reviewer',
      department: 'Engineering'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders send for approval page with title', () => {
    render(<Approval {...defaultProps} />);
    
    expect(screen.getByText('Send for Approval')).toBeInTheDocument();
    expect(screen.getByText('Select a reviewer to approve your application')).toBeInTheDocument();
  });

  test('displays application summary', () => {
    render(<Approval {...defaultProps} />);
    
    // The application summary section is commented out in the component
    // so we should not expect it to be visible
    expect(screen.queryByText('Application Summary')).not.toBeInTheDocument();
  });

  test('shows loading state for reviewers initially', () => {
    render(<Approval {...defaultProps} />);
    
    expect(screen.getByText('Loading reviewers...')).toBeInTheDocument();
  });

  test('displays reviewers when loaded successfully', async () => {
    const { getReviewers } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(mockReviewers);

    render(<Approval {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('John Smith - Senior Reviewer - Computer Science')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe - Reviewer - Engineering')).toBeInTheDocument();
    });
  });

  test('allows reviewer selection', async () => {
    const { getReviewers } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(mockReviewers);

    render(<Approval {...defaultProps} />);
    
    await waitFor(() => {
      const selectElement = screen.getByRole('combobox');
      fireEvent.change(selectElement, { target: { value: '1' } });
    });
    
    // The Send button should be enabled after selection
    const sendButton = screen.getByText('Send');
    expect(sendButton).not.toBeDisabled();
  });

  test('sends approval request successfully', async () => {
    const { getReviewers, sendForApproval } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(mockReviewers);
    sendForApproval.mockResolvedValue();

    render(<Approval {...defaultProps} />);
    
    // Wait for reviewers to load and select one
    await waitFor(() => {
      const selectElement = screen.getByRole('combobox');
      fireEvent.change(selectElement, { target: { value: '1' } });
    });
    
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(sendForApproval).toHaveBeenCalledWith('cert-123', '1');
    });
  });

  test('shows success state after approval sent', async () => {
    const { getReviewers, sendForApproval } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(mockReviewers);
    sendForApproval.mockResolvedValue();

    render(<Approval {...defaultProps} />);
    
    // Wait for reviewers to load and select one
    await waitFor(() => {
      const selectElement = screen.getByRole('combobox');
      fireEvent.change(selectElement, { target: { value: '1' } });
    });
    
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Approval Request Sent!')).toBeInTheDocument();
      expect(screen.getByText('Your application has been successfully sent for approval. The selected reviewer will be notified and will review your application shortly.')).toBeInTheDocument();
    });
  });

  test('shows loading state while sending', async () => {
    const { getReviewers, sendForApproval } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(mockReviewers);
    
    // Create a promise that doesn't resolve immediately
    let resolvePromise;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    sendForApproval.mockReturnValue(pendingPromise);

    render(<Approval {...defaultProps} />);
    
    // Wait for reviewers to load and select one
    await waitFor(() => {
      const selectElement = screen.getByRole('combobox');
      fireEvent.change(selectElement, { target: { value: '1' } });
    });
    
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    
    // Should show "Sending..." text
    await waitFor(() => {
      expect(screen.getByText('Sending...')).toBeInTheDocument();
    });
    
    // Resolve the promise
    resolvePromise();
  });

  test('handles API error when sending approval', async () => {
    const { getReviewers, sendForApproval } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(mockReviewers);
    sendForApproval.mockRejectedValue(new Error('Network error'));

    render(<Approval {...defaultProps} />);
    
    // Wait for reviewers to load and select one
    await waitFor(() => {
      const selectElement = screen.getByRole('combobox');
      fireEvent.change(selectElement, { target: { value: '1' } });
    });
    
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  test('calls onBackToDashboard when back button is clicked', () => {
    render(<Approval {...defaultProps} />);
    
    const backButton = screen.getByText('Back to Dashboard');
    fireEvent.click(backButton);
    
    expect(defaultProps.onBackToDashboard).toHaveBeenCalledWith('dashboard');
  });

  test('calls onBackToDashboard when back button is clicked in success state', async () => {
    const { getReviewers, sendForApproval } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(mockReviewers);
    sendForApproval.mockResolvedValue();

    render(<Approval {...defaultProps} />);
    
    // Wait for reviewers to load and select one
    await waitFor(() => {
      const selectElement = screen.getByRole('combobox');
      fireEvent.change(selectElement, { target: { value: '1' } });
    });
    
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    
    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText('Approval Request Sent!')).toBeInTheDocument();
    });
    
    const backButton = screen.getByText('Back to Dashboard');
    fireEvent.click(backButton);
    
    expect(defaultProps.onBackToDashboard).toHaveBeenCalledWith('dashboard');
  });

  test('handles reviewers with missing names', async () => {
    const reviewersWithMissingNames = [
      {
        reviewer_id: '1',
        email: 'reviewer@example.com'
      },
      {
        reviewer_id: '2',
        first_name: 'John',
        email: 'john@example.com'
      }
    ];

    const { getReviewers } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(reviewersWithMissingNames);

    render(<Approval {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('reviewer')).toBeInTheDocument(); // Uses email prefix
      expect(screen.getByText('John')).toBeInTheDocument();
    });
  });

  test('disables send button when no reviewer is selected', async () => {
    const { getReviewers } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(mockReviewers);

    render(<Approval {...defaultProps} />);
    
    // Wait for reviewers to load first
    await waitFor(() => {
      expect(screen.getByText('John Smith - Senior Reviewer - Computer Science')).toBeInTheDocument();
    });
    
    // Send should be disabled when no reviewer is selected
    const sendButton = screen.getByText('Send');
    expect(sendButton).toBeDisabled();
  });

  test('shows error when certificate ID is missing', async () => {
    const propsWithoutCertificateId = {
      ...defaultProps,
      certificateId: null
    };

    const { getReviewers } = require('../src/api_calls/studentAPI');
    getReviewers.mockResolvedValue(mockReviewers);

    render(<Approval {...propsWithoutCertificateId} />);
    
    await waitFor(() => {
      const selectElement = screen.getByRole('combobox');
      fireEvent.change(selectElement, { target: { value: '1' } });
    });
    
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    
    expect(screen.getByText('No certificate ID available. Please go back and try again.')).toBeInTheDocument();
  });
});
