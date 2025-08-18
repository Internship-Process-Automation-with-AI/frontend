import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder (required for react-router-dom in Node.js)
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock navigator for user-event
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'node.js',
    clipboard: {
      readText: jest.fn(),
      writeText: jest.fn(),
    },
  },
  writable: true,
});

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    readText: jest.fn(),
    writeText: jest.fn(),
  },
  writable: true,
});

// Mock console.error and console.warn to suppress expected errors in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    // Suppress specific error messages that are expected in tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: An update to') ||
       args[0].includes('act(...)') ||
       args[0].includes('Error fetching reviewers') ||
       args[0].includes('Approval submission error') ||
       args[0].includes('Appeal submission error') ||
       args[0].includes('Delete error'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    // Suppress specific warning messages that are expected in tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Failed to fetch applications') ||
       args[0].includes('Failed to refresh applications'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
