import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Applications from '../src/components/Applications';

// Mock the child components
jest.mock('../src/components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../src/components/Icons', () => ({
  ClockIcon: ({ className }) => <div data-testid="clock-icon" className={className}>ClockIcon</div>,
  CheckCircleIcon: ({ className }) => <div data-testid="check-circle-icon" className={className}>CheckCircleIcon</div>,
  AlertCircleIcon: ({ className }) => <div data-testid="alert-circle-icon" className={className}>AlertCircleIcon</div>,
  UserIcon: ({ className }) => <div data-testid="user-icon" className={className}>UserIcon</div>,
}));

// Mock window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

describe('Applications', () => {
  const defaultProps = {
    applications: [],
    onBackToDashboard: jest.fn(),
    onDeleteApplication: jest.fn(),
    onViewApplicationDetails: jest.fn(),
    onContinueProcessing: jest.fn(),
    onSubmitAppeal: jest.fn()
  };

  const mockApplications = [
    {
      id: '1',
      certificate_id: 'cert-1',
      training_type: 'Professional Training',
      status: 'ACCEPTED',
      submitted_date: '2024-01-15',
      credits: 5,
      reviewer_name: 'Dr. Smith'
    },
    {
      id: '2',
      certificate_id: 'cert-2',
      training_type: 'General Training',
      status: 'PENDING',
      submitted_date: '2024-01-20'
    },
    {
      id: '3',
      certificate_id: 'cert-3',
      training_type: 'Professional Training',
      status: 'REJECTED',
      submitted_date: '2024-01-10',
      appeal_status: null
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  test('renders applications page with title', () => {
    render(<Applications {...defaultProps} />);
    
    expect(screen.getByText('My Applications')).toBeInTheDocument();
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
  });

  test('renders header component', () => {
    render(<Applications {...defaultProps} />);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  test('shows empty state when no applications', () => {
    render(<Applications {...defaultProps} />);
    
    expect(screen.getByText('No Applications Yet')).toBeInTheDocument();
    expect(screen.getByText("You haven't submitted any applications for training credits yet.")).toBeInTheDocument();
    expect(screen.getByText('Apply for Training Credits')).toBeInTheDocument();
  });

  test('calls onBackToDashboard when back button is clicked', () => {
    render(<Applications {...defaultProps} />);
    
    const backButton = screen.getByText('Back to Dashboard');
    fireEvent.click(backButton);
    
    expect(defaultProps.onBackToDashboard).toHaveBeenCalledWith('dashboard');
  });

  test('calls onBackToDashboard when apply button is clicked in empty state', () => {
    render(<Applications {...defaultProps} />);
    
    const applyButton = screen.getByText('Apply for Training Credits');
    fireEvent.click(applyButton);
    
    expect(defaultProps.onBackToDashboard).toHaveBeenCalledWith('upload');
  });

  test('renders applications list when applications exist', () => {
    const propsWithApplications = {
      ...defaultProps,
      applications: mockApplications
    };

    render(<Applications {...propsWithApplications} />);
    
    // Check that all training types are present
    expect(screen.getAllByText('Professional Training')).toHaveLength(2);
    expect(screen.getByText('General Training')).toBeInTheDocument();
    
    // Check that all statuses are present
    expect(screen.getByText('ACCEPTED')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('REJECTED')).toBeInTheDocument();
  });

  test('displays correct status icons for different statuses', () => {
    const propsWithApplications = {
      ...defaultProps,
      applications: mockApplications
    };

    render(<Applications {...propsWithApplications} />);
    
    // Should render status icons for each application
    expect(screen.getAllByTestId('check-circle-icon')).toHaveLength(1); // ACCEPTED
    expect(screen.getAllByTestId('clock-icon')).toHaveLength(1); // PENDING
    expect(screen.getAllByTestId('alert-circle-icon')).toHaveLength(1); // REJECTED
  });

  test('displays credits for accepted applications', () => {
    const propsWithApplications = {
      ...defaultProps,
      applications: [mockApplications[0]] // Only the accepted one
    };

    render(<Applications {...propsWithApplications} />);
    
    expect(screen.getByText('Credits Awarded')).toBeInTheDocument();
    expect(screen.getByText('5 ECTS')).toBeInTheDocument();
  });

  test('calls onViewApplicationDetails when application card is clicked', () => {
    const propsWithApplications = {
      ...defaultProps,
      applications: [mockApplications[0]]
    };

    render(<Applications {...propsWithApplications} />);
    
    const applicationCard = screen.getByText('Professional Training').closest('.card');
    fireEvent.click(applicationCard);
    
    expect(defaultProps.onViewApplicationDetails).toHaveBeenCalledWith(mockApplications[0]);
  });

  test('calls onDeleteApplication when delete button is clicked', async () => {
    const propsWithApplications = {
      ...defaultProps,
      applications: [mockApplications[0]]
    };

    render(<Applications {...propsWithApplications} />);
    
    const deleteButton = screen.getByTitle('Delete application');
    fireEvent.click(deleteButton);
    
    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this application? This action cannot be undone.');
    await waitFor(() => {
      expect(defaultProps.onDeleteApplication).toHaveBeenCalledWith('cert-1');
    });
  });

  test('does not delete when user cancels confirmation', () => {
    mockConfirm.mockReturnValue(false);
    
    const propsWithApplications = {
      ...defaultProps,
      applications: [mockApplications[0]]
    };

    render(<Applications {...propsWithApplications} />);
    
    const deleteButton = screen.getByTitle('Delete application');
    fireEvent.click(deleteButton);
    
    expect(mockConfirm).toHaveBeenCalled();
    expect(defaultProps.onDeleteApplication).not.toHaveBeenCalled();
  });

  test('shows continue processing button for accepted applications', () => {
    const propsWithApplications = {
      ...defaultProps,
      applications: [mockApplications[0]]
    };

    render(<Applications {...propsWithApplications} />);
    
    expect(screen.getByText('Continue Processing')).toBeInTheDocument();
  });

  test('calls onContinueProcessing when continue processing button is clicked', () => {
    const propsWithApplications = {
      ...defaultProps,
      applications: [mockApplications[0]]
    };

    render(<Applications {...propsWithApplications} />);
    
    const continueButton = screen.getByText('Continue Processing');
    fireEvent.click(continueButton);
    
    expect(defaultProps.onContinueProcessing).toHaveBeenCalledWith(mockApplications[0]);
  });

  test('shows submit appeal button for rejected applications', () => {
    const propsWithApplications = {
      ...defaultProps,
      applications: [mockApplications[2]] // REJECTED application
    };

    render(<Applications {...propsWithApplications} />);
    
    expect(screen.getByText('Submit Appeal')).toBeInTheDocument();
  });

  test('calls onSubmitAppeal when submit appeal button is clicked', () => {
    const propsWithApplications = {
      ...defaultProps,
      applications: [mockApplications[2]]
    };

    render(<Applications {...propsWithApplications} />);
    
    const appealButton = screen.getByText('Submit Appeal');
    fireEvent.click(appealButton);
    
    expect(defaultProps.onSubmitAppeal).toHaveBeenCalledWith(mockApplications[2]);
  });

  test('displays processing time for pending applications', () => {
    const propsWithApplications = {
      ...defaultProps,
      applications: [mockApplications[1]] // PENDING application
    };

    render(<Applications {...propsWithApplications} />);
    
    expect(screen.getByText('Processing time: Usually 2-3 business days')).toBeInTheDocument();
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  test('displays reviewer information for pending approval applications', () => {
    const pendingApprovalApp = {
      ...mockApplications[0],
      status: 'PENDING_FOR_APPROVAL',
      reviewer_name: 'Dr. Smith' // Ensure reviewer_name is set
    };
    
    const propsWithApplications = {
      ...defaultProps,
      applications: [pendingApprovalApp]
    };

    render(<Applications {...propsWithApplications} />);
    
    expect(screen.getByText('Sent for approval to reviewer')).toBeInTheDocument();
    expect(screen.getByText('Waiting for review...')).toBeInTheDocument();
    expect(screen.getByText('Reviewer:')).toBeInTheDocument();
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
  });

  test('handles error state', async () => {
    const propsWithApplications = {
      ...defaultProps,
      applications: [mockApplications[0]],
      onDeleteApplication: jest.fn().mockRejectedValue(new Error('Delete failed'))
    };

    render(<Applications {...propsWithApplications} />);
    
    const deleteButton = screen.getByTitle('Delete application');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to delete application. Please try again.')).toBeInTheDocument();
    });
  });

  test('formats dates correctly', () => {
    const propsWithApplications = {
      ...defaultProps,
      applications: [mockApplications[0]]
    };

    render(<Applications {...propsWithApplications} />);
    
    // Check that the date is formatted (the exact format depends on locale)
    expect(screen.getByText(/Submitted on/)).toBeInTheDocument();
  });
}); 