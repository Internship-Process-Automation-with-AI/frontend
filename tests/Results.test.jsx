import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Results from '../src/components/Results';

// Mock the ProcessingModal component
jest.mock('../src/components/ProcessingModal', () => {
  return function MockProcessingModal() {
    return <div data-testid="processing-modal">ProcessingModal</div>;
  };
});

describe('Results', () => {
  const defaultProps = {
    results: null,
    onBackToDashboard: jest.fn(),
    onSendForApproval: jest.fn(),
    onRequestReview: jest.fn(),
    onSubmitNewApplication: jest.fn()
  };

  const mockAcceptedResults = {
    decision: 'ACCEPTED',
    credits: 5,
    filename: 'certificate.pdf',
    student_degree: 'Computer Science',
    training_hours: 120,
    requested_training_type: 'Professional Training',
    degree_relevance: 'high',
    supporting_evidence: 'Strong evidence of professional development',
    challenging_evidence: 'None',
    justification: 'The training aligns well with the degree requirements'
  };

  const mockRejectedResults = {
    decision: 'REJECTED',
    credits: 0,
    filename: 'certificate.pdf',
    student_degree: 'Computer Science',
    training_hours: 40,
    requested_training_type: 'General Training',
    degree_relevance: 'low',
    supporting_evidence: 'Limited evidence',
    challenging_evidence: 'Training does not align with degree requirements',
    justification: 'The training does not meet the minimum requirements'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders no results state when results is null', () => {
    render(<Results {...defaultProps} />);
    
    expect(screen.getByText('No results available')).toBeInTheDocument();
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
  });

  test('calls onBackToDashboard when back button is clicked in no results state', () => {
    render(<Results {...defaultProps} />);
    
    const backButton = screen.getByText('Back to Dashboard');
    fireEvent.click(backButton);
    
    expect(defaultProps.onBackToDashboard).toHaveBeenCalledWith('dashboard');
  });

  test('renders results page with title when results exist', () => {
    const propsWithResults = {
      ...defaultProps,
      results: mockAcceptedResults
    };

    render(<Results {...propsWithResults} />);
    
    expect(screen.getByText('Processing Complete!')).toBeInTheDocument();
    expect(screen.getByText('Your work certificate has been successfully analyzed')).toBeInTheDocument();
  });

  test('displays decision for accepted results', () => {
    const propsWithResults = {
      ...defaultProps,
      results: mockAcceptedResults
    };

    render(<Results {...propsWithResults} />);
    
    expect(screen.getByText('DECISION')).toBeInTheDocument();
    expect(screen.getByText('ACCEPTED')).toBeInTheDocument();
    expect(screen.getByText('5 ECTS')).toBeInTheDocument();
  });

  test('displays decision for rejected results', () => {
    const propsWithResults = {
      ...defaultProps,
      results: mockRejectedResults
    };

    render(<Results {...propsWithResults} />);
    
    expect(screen.getByText('DECISION')).toBeInTheDocument();
    expect(screen.getByText('REJECTED')).toBeInTheDocument();
    expect(screen.getByText('0 ECTS')).toBeInTheDocument();
  });

  test('displays document information', () => {
    const propsWithResults = {
      ...defaultProps,
      results: mockAcceptedResults
    };

    render(<Results {...propsWithResults} />);
    
    expect(screen.getByText('Document')).toBeInTheDocument();
    expect(screen.getByText('certificate.pdf')).toBeInTheDocument();
    expect(screen.getByText('Degree')).toBeInTheDocument();
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
  });

  test('displays evaluation results', () => {
    const propsWithResults = {
      ...defaultProps,
      results: mockAcceptedResults
    };

    render(<Results {...propsWithResults} />);
    
    expect(screen.getByText('Evaluation Results')).toBeInTheDocument();
    expect(screen.getByText('Working Hours')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('Requested Training Type')).toBeInTheDocument();
    expect(screen.getByText('Professional Training')).toBeInTheDocument();
    expect(screen.getByText('Credits Calculated')).toBeInTheDocument();
    expect(screen.getByText('5 ECTS')).toBeInTheDocument();
    expect(screen.getByText('Degree Relevance')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  test('displays supporting evidence', () => {
    const propsWithResults = {
      ...defaultProps,
      results: mockAcceptedResults
    };

    render(<Results {...propsWithResults} />);
    
    expect(screen.getByText('Supporting Evidence')).toBeInTheDocument();
    expect(screen.getByText('Strong evidence of professional development')).toBeInTheDocument();
  });

  test('displays challenging evidence', () => {
    const propsWithResults = {
      ...defaultProps,
      results: mockRejectedResults
    };

    render(<Results {...propsWithResults} />);
    
    expect(screen.getByText('Challenging Evidence')).toBeInTheDocument();
    expect(screen.getByText('Training does not align with degree requirements')).toBeInTheDocument();
  });

  test('displays justification', () => {
    const propsWithResults = {
      ...defaultProps,
      results: mockAcceptedResults
    };

    render(<Results {...propsWithResults} />);
    
    expect(screen.getByText('Justification')).toBeInTheDocument();
    expect(screen.getByText('The training aligns well with the degree requirements')).toBeInTheDocument();
  });

  test('shows send for approval button for accepted results', () => {
    const propsWithResults = {
      ...defaultProps,
      results: mockAcceptedResults
    };

    render(<Results {...propsWithResults} />);
    
    expect(screen.getByText('Send for Approval')).toBeInTheDocument();
  });

  test('calls onSendForApproval when send for approval button is clicked', () => {
    const propsWithResults = {
      ...defaultProps,
      results: mockAcceptedResults
    };

    render(<Results {...propsWithResults} />);
    
    const sendForApprovalButton = screen.getByText('Send for Approval');
    fireEvent.click(sendForApprovalButton);
    
    expect(defaultProps.onSendForApproval).toHaveBeenCalled();
  });

  test('shows request review and submit new application buttons for rejected results', () => {
    const propsWithResults = {
      ...defaultProps,
      results: mockRejectedResults
    };

    render(<Results {...propsWithResults} />);
    
    expect(screen.getByText('Request Review')).toBeInTheDocument();
    expect(screen.getByText('Submit New Application')).toBeInTheDocument();
  });

  test('calls onRequestReview when request review button is clicked', () => {
    const propsWithResults = {
      ...defaultProps,
      results: mockRejectedResults
    };

    render(<Results {...propsWithResults} />);
    
    const requestReviewButton = screen.getByText('Request Review');
    fireEvent.click(requestReviewButton);
    
    expect(defaultProps.onRequestReview).toHaveBeenCalled();
  });

  test('calls onSubmitNewApplication when submit new application button is clicked', () => {
    const propsWithResults = {
      ...defaultProps,
      results: mockRejectedResults
    };

    render(<Results {...propsWithResults} />);
    
    const submitNewApplicationButton = screen.getByText('Submit New Application');
    fireEvent.click(submitNewApplicationButton);
    
    expect(defaultProps.onSubmitNewApplication).toHaveBeenCalled();
  });

  test('calls onBackToDashboard when back to dashboard button is clicked', () => {
    const propsWithResults = {
      ...defaultProps,
      results: mockAcceptedResults
    };

    render(<Results {...propsWithResults} />);
    
    const backButton = screen.getByText('Back to Dashboard');
    fireEvent.click(backButton);
    
    expect(defaultProps.onBackToDashboard).toHaveBeenCalledWith('dashboard');
  });

  test('handles missing data gracefully', () => {
    const incompleteResults = {
      decision: 'ACCEPTED',
      credits: null,
      filename: null,
      student_degree: null,
      training_hours: null,
      requested_training_type: null,
      degree_relevance: null,
      supporting_evidence: null,
      challenging_evidence: null,
      justification: null
    };

    const propsWithResults = {
      ...defaultProps,
      results: incompleteResults
    };

    render(<Results {...propsWithResults} />);
    
    expect(screen.getByText('ACCEPTED')).toBeInTheDocument();
    expect(screen.getByText('0 ECTS')).toBeInTheDocument();
    expect(screen.getByText('Document')).toBeInTheDocument();
    expect(screen.getByText('Not specified')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.getByText('No supporting evidence available.')).toBeInTheDocument();
    expect(screen.getByText('No challenging evidence available.')).toBeInTheDocument();
    expect(screen.getByText('No justification available.')).toBeInTheDocument();
  });

  test('formats training hours with locale', () => {
    const resultsWithLargeHours = {
      ...mockAcceptedResults,
      training_hours: 1500
    };

    const propsWithResults = {
      ...defaultProps,
      results: resultsWithLargeHours
    };

    render(<Results {...propsWithResults} />);
    
    expect(screen.getByText('1,500')).toBeInTheDocument();
  });
}); 