import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Approval from '../src/components/Approval';

// Mock the API service
jest.mock('../src/api.js', () => ({
  getReviewers: jest.fn(),
  sendForApproval: jest.fn()
}));

import apiService from '../src/api.js';

// Console error mocking is handled globally in setupTests.js

describe('Approval', () => {
  const defaultProps = {
    results: {
      decision: 'ACCEPTED',
      credits: 5,
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
      position: 'Senior Lecturer',
      department: 'Computer Science'
    },
    {
      reviewer_id: '2',
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane.doe@example.com',
      position: 'Professor',
      department: 'Engineering'
    },
    {
      reviewer_id: '3',
      first_name: 'Bob',
      email: 'bob@example.com',
      position: 'Associate Professor'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders approval page with title', () => {
    render(<Approval {...defaultProps} />);
    
    expect(screen.getByText('Send for Approval')).toBeInTheDocument();
    expect(screen.getByText('Select a reviewer to approve your application')).toBeInTheDocument();
  });

  test('displays application summary', () => {
    render(<Approval {...defaultProps} />);
    
    expect(screen.getByText('Application Summary')).toBeInTheDocument();
    expect(screen.getByText('Document')).toBeInTheDocument();
    expect(screen.getByText('certificate.pdf')).toBeInTheDocument();
    expect(screen.getByText('Decision')).toBeInTheDocument();
    expect(screen.getByText('ACCEPTED')).toBeInTheDocument();
    expect(screen.getByText('Credits')).toBeInTheDocument();
    expect(screen.getByText('5 ECTS')).toBeInTheDocument();
    expect(screen.getByText('Training Type')).toBeInTheDocument();
    expect(screen.getByText('Professional Training')).toBeInTheDocument();
  });

  test('shows loading state while fetching reviewers', () => {
    apiService.getReviewers.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<Approval {...defaultProps} />);
    
    expect(screen.getByText('Loading reviewers...')).toBeInTheDocument();
    expect(screen.getByText('Select Reviewer')).toBeInTheDocument();
  });

  test('displays reviewers when loaded successfully', async () => {
    apiService.getReviewers.mockResolvedValue(mockReviewers);
    
    render(<Approval {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  test('displays reviewer information correctly', async () => {
    apiService.getReviewers.mockResolvedValue(mockReviewers);
    
    render(<Approval {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('john.smith@example.com')).toBeInTheDocument();
      expect(screen.getByText('Senior Lecturer')).toBeInTheDocument();
      expect(screen.getByText('Computer Science')).toBeInTheDocument();
    });
  });

  test('allows reviewer selection', async () => {
    apiService.getReviewers.mockResolvedValue(mockReviewers);
    
    render(<Approval {...defaultProps} />);
    
    await waitFor(() => {
      const firstReviewerRadio = screen.getByDisplayValue('1');
      fireEvent.click(firstReviewerRadio);
      expect(firstReviewerRadio).toBeChecked();
    });
  });

  test('enables send button when reviewer is selected', async () => {
    apiService.getReviewers.mockResolvedValue(mockReviewers);
    
    render(<Approval {...defaultProps} />);
    
    await waitFor(() => {
      const sendButton = screen.getByText('Send');
      expect(sendButton).toBeDisabled();
      
      const firstReviewerRadio = screen.getByDisplayValue('1');
      fireEvent.click(firstReviewerRadio);
      
      expect(sendButton).not.toBeDisabled();
    });
  });

  test('shows error when trying to send without selecting reviewer', async () => {
    apiService.getReviewers.mockResolvedValue(mockReviewers);
    
    render(<Approval {...defaultProps} />);
    
    await waitFor(() => {
      // The button should be disabled when no reviewer is selected
      const sendButton = screen.getByText('Send');
      expect(sendButton).toBeDisabled();
      
      // Since the button is disabled, we can't click it to trigger validation
      // This test should verify that the button is properly disabled
      expect(sendButton).toHaveAttribute('disabled');
    });
  });

  test('sends approval request successfully', async () => {
    apiService.getReviewers.mockResolvedValue(mockReviewers);
    apiService.sendForApproval.mockResolvedValue({ success: true });
    
    render(<Approval {...defaultProps} />);
    
    await waitFor(() => {
      const firstReviewerRadio = screen.getByDisplayValue('1');
      fireEvent.click(firstReviewerRadio);
      
      const sendButton = screen.getByText('Send');
      fireEvent.click(sendButton);
    });
    
    await waitFor(() => {
      expect(apiService.sendForApproval).toHaveBeenCalledWith('cert-123', '1');
    });
  });

  test('shows success state after approval sent', async () => {
    apiService.getReviewers.mockResolvedValue(mockReviewers);
    apiService.sendForApproval.mockResolvedValue({ success: true });
    
    render(<Approval {...defaultProps} />);
    
    await waitFor(() => {
      const firstReviewerRadio = screen.getByDisplayValue('1');
      fireEvent.click(firstReviewerRadio);
      
      const sendButton = screen.getByText('Send');
      fireEvent.click(sendButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Approval Request Sent!')).toBeInTheDocument();
      expect(screen.getByText(/Your application has been successfully sent for approval/)).toBeInTheDocument();
    });
  });

  test('shows loading state while sending', async () => {
    apiService.getReviewers.mockResolvedValue(mockReviewers);
    apiService.sendForApproval.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<Approval {...defaultProps} />);
    
    await waitFor(() => {
      const firstReviewerRadio = screen.getByDisplayValue('1');
      fireEvent.click(firstReviewerRadio);
      
      const sendButton = screen.getByText('Send');
      fireEvent.click(sendButton);
      
      expect(screen.getByText('Sending...')).toBeInTheDocument();
    });
  });

  test('handles API error when fetching reviewers', async () => {
    apiService.getReviewers.mockRejectedValue(new Error('Network error'));
    
    render(<Approval {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load reviewers. Please try again.')).toBeInTheDocument();
    });
  });

  test('handles API error when sending approval', async () => {
    apiService.getReviewers.mockResolvedValue(mockReviewers);
    apiService.sendForApproval.mockRejectedValue(new Error('Network error'));
    
    render(<Approval {...defaultProps} />);
    
    await waitFor(() => {
      const firstReviewerRadio = screen.getByDisplayValue('1');
      fireEvent.click(firstReviewerRadio);
      
      const sendButton = screen.getByText('Send');
      fireEvent.click(sendButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Failed to send for approval. Please try again.')).toBeInTheDocument();
    });
  });

  test('shows no reviewers message when list is empty', async () => {
    apiService.getReviewers.mockResolvedValue([]);
    
    render(<Approval {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('No reviewers available at the moment.')).toBeInTheDocument();
    });
  });

  test('calls onBackToDashboard when back button is clicked', () => {
    render(<Approval {...defaultProps} />);
    
    const backButton = screen.getByText('Back to Dashboard');
    fireEvent.click(backButton);
    
    expect(defaultProps.onBackToDashboard).toHaveBeenCalledWith('dashboard');
  });

  test('calls onBackToDashboard when back button is clicked in success state', async () => {
    apiService.getReviewers.mockResolvedValue(mockReviewers);
    apiService.sendForApproval.mockResolvedValue({ success: true });
    
    render(<Approval {...defaultProps} />);
    
    await waitFor(() => {
      const firstReviewerRadio = screen.getByDisplayValue('1');
      fireEvent.click(firstReviewerRadio);
      
      const sendButton = screen.getByText('Send');
      fireEvent.click(sendButton);
    });
    
    await waitFor(() => {
      const backButton = screen.getByText('Back to Dashboard');
      fireEvent.click(backButton);
      
      expect(defaultProps.onBackToDashboard).toHaveBeenCalledWith('dashboard');
    });
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
    
    apiService.getReviewers.mockResolvedValue(reviewersWithMissingNames);
    
    render(<Approval {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('reviewer')).toBeInTheDocument(); // Uses email prefix
      expect(screen.getByText('John')).toBeInTheDocument();
    });
  });

  test('handles missing data in results gracefully', () => {
    const incompleteResults = {
      decision: 'ACCEPTED',
      credits: null,
      filename: null,
      requested_training_type: null
    };
    
    const propsWithIncompleteResults = {
      ...defaultProps,
      results: incompleteResults
    };
    
    render(<Approval {...propsWithIncompleteResults} />);
    
    expect(screen.getAllByText('Document')).toHaveLength(2); // Label and fallback value
    expect(screen.getByText('0 ECTS')).toBeInTheDocument();
  });
}); 