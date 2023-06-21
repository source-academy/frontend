import '@testing-library/jest-dom/extend-expect';

// Mock ResizeObserver in tests
global.ResizeObserver = require('resize-observer-polyfill');
