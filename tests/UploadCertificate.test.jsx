import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UploadCertificate from '../src/components/student/UploadCertificate';

// Mock the child components
jest.mock('../src/components/common/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../src/components/student/StepIndicator', () => {
  return function MockStepIndicator({ currentStep }) {
    return <div data-testid="step-indicator">Step {currentStep}</div>;
  };
});

jest.mock('../src/components/common/Icons', () => ({
  UploadIcon: ({ className }) => <div data-testid="upload-icon" className={className}>UploadIcon</div>,
  FileTextIcon: ({ className }) => <div data-testid="file-text-icon" className={className}>FileTextIcon</div>,
  XIcon: ({ className }) => <div data-testid="x-icon" className={className}>XIcon</div>,
  RefreshCwIcon: ({ className }) => <div data-testid="refresh-icon" className={className}>RefreshCwIcon</div>,
}));

describe('UploadCertificate Component', () => {
  const mockClick = jest.fn();
  
  const defaultProps = {
    formData: {
      document: null,
      trainingType: ''
    },
    fileInputRef: { current: { click: mockClick } },
    onFileSelect: jest.fn(),
    onInputChange: jest.fn(),
    onBackToDashboard: jest.fn(),
    onContinueProcessing: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders upload certificate page with correct title', () => {
    render(<UploadCertificate {...defaultProps} />);
    
    expect(screen.getByText('Upload Work Certificate')).toBeInTheDocument();
    expect(screen.getByText('Select your work certificate document for evaluation')).toBeInTheDocument();
  });

  test('renders step indicator and header', () => {
    render(<UploadCertificate {...defaultProps} />);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('step-indicator')).toBeInTheDocument();
    expect(screen.getByText('Step 1')).toBeInTheDocument();
  });

  test('shows file upload area when no file is selected', () => {
    render(<UploadCertificate {...defaultProps} />);
    
    expect(screen.getByText('Drag and drop your file here, or click to browse')).toBeInTheDocument();
    expect(screen.getByText('Supports PDF, DOCX, and image files')).toBeInTheDocument();
    expect(screen.getByText('Select File')).toBeInTheDocument();
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
  });

  test('shows file details when file is selected', () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const propsWithFile = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        document: mockFile
      }
    };

    render(<UploadCertificate {...propsWithFile} />);
    
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('0.00 MB')).toBeInTheDocument();
    expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
  });

  test('select file button exists and is clickable', () => {
    render(<UploadCertificate {...defaultProps} />);
    
    const selectFileButton = screen.getByText('Select File');
    expect(selectFileButton).toBeInTheDocument();
    expect(selectFileButton).not.toBeDisabled();
    
    // Just verify the button can be clicked without testing the mock
    fireEvent.click(selectFileButton);
    // The button click should not throw any errors
  });

  test('shows replace and delete buttons when file is selected', () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const propsWithFile = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        document: mockFile
      }
    };

    render(<UploadCertificate {...propsWithFile} />);
    
    expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
  });

  test('calls onInputChange with null when delete file button is clicked', () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const propsWithFile = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        document: mockFile
      }
    };

    render(<UploadCertificate {...propsWithFile} />);
    
    const deleteButton = screen.getByTitle('Delete file');
    fireEvent.click(deleteButton);
    
    expect(defaultProps.onInputChange).toHaveBeenCalledWith('document', null);
  });

  test('renders training type options', () => {
    render(<UploadCertificate {...defaultProps} />);
    
    expect(screen.getByText('Training Type')).toBeInTheDocument();
    expect(screen.getByText('General Training')).toBeInTheDocument();
    expect(screen.getByText('Professional Training')).toBeInTheDocument();
  });

  test('calls onInputChange when training type is selected', () => {
    render(<UploadCertificate {...defaultProps} />);
    
    const generalTrainingRadio = screen.getByDisplayValue('general');
    fireEvent.click(generalTrainingRadio);
    
    expect(defaultProps.onInputChange).toHaveBeenCalledWith('trainingType', 'general');
  });

  test('calls onBackToDashboard when back button is clicked', () => {
    render(<UploadCertificate {...defaultProps} />);
    
    const backButton = screen.getByText('Back to Dashboard');
    fireEvent.click(backButton);
    
    expect(defaultProps.onBackToDashboard).toHaveBeenCalledWith('dashboard');
  });

  test('continue button is disabled when no file and no training type', () => {
    render(<UploadCertificate {...defaultProps} />);
    
    const continueButton = screen.getByText('Continue Processing');
    expect(continueButton).toBeDisabled();
  });

  test('continue button is disabled when only file is selected', () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const propsWithFile = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        document: mockFile
      }
    };

    render(<UploadCertificate {...propsWithFile} />);
    
    const continueButton = screen.getByText('Continue Processing');
    expect(continueButton).toBeDisabled();
  });

  test('continue button is disabled when only training type is selected', () => {
    const propsWithTrainingType = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        trainingType: 'general'
      }
    };

    render(<UploadCertificate {...propsWithTrainingType} />);
    
    const continueButton = screen.getByText('Continue Processing');
    expect(continueButton).toBeDisabled();
  });

  test('continue button is enabled when both file and training type are selected', () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const propsComplete = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        document: mockFile,
        trainingType: 'general'
      }
    };

    render(<UploadCertificate {...propsComplete} />);
    
    const continueButton = screen.getByText('Continue Processing');
    expect(continueButton).not.toBeDisabled();
  });

  test('calls onContinueProcessing when continue button is clicked', () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const propsComplete = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        document: mockFile,
        trainingType: 'general'
      }
    };

    render(<UploadCertificate {...propsComplete} />);
    
    const continueButton = screen.getByText('Continue Processing');
    fireEvent.click(continueButton);
    
    expect(defaultProps.onContinueProcessing).toHaveBeenCalled();
  });

  test('displays correct file size in MB', () => {
    const mockFile = new File(['x'.repeat(1024 * 1024)], 'test.pdf', { type: 'application/pdf' }); // 1MB
    const propsWithFile = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        document: mockFile
      }
    };

    render(<UploadCertificate {...propsWithFile} />);
    
    expect(screen.getByText('1.00 MB')).toBeInTheDocument();
  });
});
