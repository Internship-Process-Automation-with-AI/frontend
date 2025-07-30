import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../src/components/Dashboard';

// Mock the child components
jest.mock('../src/components/Header', () => {
  return function MockHeader({ studentData, onLogout }) {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../src/components/Icons', () => ({
  AwardIcon: ({ className }) => <div data-testid="award-icon" className={className}>AwardIcon</div>,
  ListIcon: ({ className }) => <div data-testid="list-icon" className={className}>ListIcon</div>,
}));

describe('Dashboard', () => {
  const defaultProps = {
    studentData: {
      first_name: 'John',
      last_name: 'Doe',
      degree: 'Bachelor of Engineering',
      email: 'john.doe@example.com'
    },
    onLogout: jest.fn(),
    onApplyForCredits: jest.fn(),
    onViewApplications: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard with welcome message', () => {
    render(<Dashboard {...defaultProps} />);
    
    expect(screen.getByText('Welcome back, John! 👋')).toBeInTheDocument();
    expect(screen.getByText('Bachelor of Engineering')).toBeInTheDocument();
  });

  test('renders header component', () => {
    render(<Dashboard {...defaultProps} />);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  test('renders apply for credits card', () => {
    render(<Dashboard {...defaultProps} />);
    
    expect(screen.getByText('Apply for Training Credits')).toBeInTheDocument();
    expect(screen.getByText('Upload your work certificate for AI-powered evaluation')).toBeInTheDocument();
    expect(screen.getByTestId('award-icon')).toBeInTheDocument();
  });

  test('renders view applications card', () => {
    render(<Dashboard {...defaultProps} />);
    
    expect(screen.getByText('My Applications')).toBeInTheDocument();
    expect(screen.getByText('Track your submitted applications and view their status')).toBeInTheDocument();
    expect(screen.getByTestId('list-icon')).toBeInTheDocument();
  });

  test('calls onApplyForCredits when apply for credits card is clicked', () => {
    render(<Dashboard {...defaultProps} />);
    
    const applyCard = screen.getByText('Apply for Training Credits').closest('div');
    fireEvent.click(applyCard);
    
    expect(defaultProps.onApplyForCredits).toHaveBeenCalled();
  });

  test('calls onViewApplications when view applications card is clicked', () => {
    render(<Dashboard {...defaultProps} />);
    
    const applicationsCard = screen.getByText('My Applications').closest('div');
    fireEvent.click(applicationsCard);
    
    expect(defaultProps.onViewApplications).toHaveBeenCalled();
  });

  test('handles missing student data gracefully', () => {
    const propsWithoutStudent = {
      ...defaultProps,
      studentData: null
    };

    render(<Dashboard {...propsWithoutStudent} />);
    
    expect(screen.getByText('Welcome back, ! 👋')).toBeInTheDocument();
    expect(screen.getByText('Apply for Training Credits')).toBeInTheDocument();
    expect(screen.getByText('My Applications')).toBeInTheDocument();
  });

  test('handles student data with missing first name', () => {
    const propsWithPartialData = {
      ...defaultProps,
      studentData: {
        ...defaultProps.studentData,
        first_name: null
      }
    };

    render(<Dashboard {...propsWithPartialData} />);
    
    expect(screen.getByText('Welcome back, ! 👋')).toBeInTheDocument();
  });

  test('displays correct degree information', () => {
    const propsWithDifferentDegree = {
      ...defaultProps,
      studentData: {
        ...defaultProps.studentData,
        degree: 'Master of Science'
      }
    };

    render(<Dashboard {...propsWithDifferentDegree} />);
    
    expect(screen.getByText('Master of Science')).toBeInTheDocument();
  });

  test('renders both action cards with proper styling classes', () => {
    render(<Dashboard {...defaultProps} />);
    
    // Find the parent divs that contain the card classes
    const applyCard = screen.getByText('Apply for Training Credits').closest('.card');
    const applicationsCard = screen.getByText('My Applications').closest('.card');
    
    expect(applyCard).toHaveClass('card', 'cursor-pointer');
    expect(applicationsCard).toHaveClass('card', 'cursor-pointer');
  });

  test('renders icons with correct styling', () => {
    render(<Dashboard {...defaultProps} />);
    
    const awardIcon = screen.getByTestId('award-icon');
    const listIcon = screen.getByTestId('list-icon');
    
    expect(awardIcon).toBeInTheDocument();
    expect(listIcon).toBeInTheDocument();
  });

  test('maintains proper layout structure', () => {
    render(<Dashboard {...defaultProps} />);
    
    // Check that the main container exists
    const mainContainer = screen.getByText('Welcome back, John! 👋').closest('div');
    expect(mainContainer).toBeInTheDocument();
    
    // Check that both action cards are present
    expect(screen.getByText('Apply for Training Credits')).toBeInTheDocument();
    expect(screen.getByText('My Applications')).toBeInTheDocument();
  });
}); 