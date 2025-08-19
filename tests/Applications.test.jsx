import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Applications from '../src/components/student/Applications';

// Mock the child components
jest.mock('../src/components/common/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../src/components/common/Icons', () => ({
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

  test('renders applications when they exist', () => {
    const propsWithApplications = {
      ...defaultProps,
      applications: mockApplications
    };

    render(<Applications {...propsWithApplications} />);
    
    // Use getAllByText for duplicate training types
    expect(screen.getAllByText('Professional Training TRAINING')).toHaveLength(2);
    expect(screen.getByText('General Training TRAINING')).toBeInTheDocument();
  });

  test('displays correct status badges', () => {
    const propsWithApplications = {
      ...defaultProps,
      applications: mockApplications
    };

    render(<Applications {...propsWithApplications} />);
    
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  test('displays credits for approved applications', () => {
    // Create an application that meets the credits display condition
    const approvedAppWithCredits = {
      ...mockApplications[0],
      status: 'ACCEPTED',
      reviewer_decision: 'PASS', // This is required for credits to show
      credits: 5
    };
    
    const propsWithApplications = {
      ...defaultProps,
      applications: [approvedAppWithCredits]
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
    
    const applicationCard = screen.getByText('Professional Training TRAINING').closest('div');
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
    
    // Wait for the confirm modal to appear
    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    });
    
    const confirmDeleteButton = screen.getByText('Delete');
    fireEvent.click(confirmDeleteButton);
    
    expect(defaultProps.onDeleteApplication).toHaveBeenCalledWith('cert-1');
  });

  test('shows appeal button for rejected applications', () => {
    const propsWithApplications = {
      ...defaultProps,
      applications: [mockApplications[2]] // REJECTED application
    };

    render(<Applications {...propsWithApplications} />);
    
    expect(screen.getByText('Add Comment & Request Review')).toBeInTheDocument();
  });

  test('calls onSubmitAppeal when appeal button is clicked', () => {
    const propsWithApplications = {
      ...defaultProps,
      applications: [mockApplications[2]]
    };

    render(<Applications {...propsWithApplications} />);
    
    const appealButton = screen.getByText('Add Comment & Request Review');
    fireEvent.click(appealButton);
    
    expect(defaultProps.onSubmitAppeal).toHaveBeenCalledWith(mockApplications[2]);
  });

  test('displays reviewer information for pending approval applications', () => {
    const pendingApprovalApp = {
      ...mockApplications[0],
      status: 'PENDING_FOR_APPROVAL',
      reviewer_name: 'Dr. Smith'
    };
    
    const propsWithApplications = {
      ...defaultProps,
      applications: [pendingApprovalApp]
    };

    render(<Applications {...propsWithApplications} />);
    
    expect(screen.getByText('Assigned Reviewer:')).toBeInTheDocument();
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
    
    // Wait for the confirm modal to appear
    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    });
    
    const confirmDeleteButton = screen.getByText('Delete');
    fireEvent.click(confirmDeleteButton);
    
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
