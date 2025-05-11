/**
 * Run script for Authentication E2E tests
 * 
 * This script is used to run the Authentication E2E tests with
 * appropriate Jest configuration.
 */

// Import Jest programmatically
import { run } from 'jest';

// Run the auth E2E tests with custom config
run([
  '--config',
  './test/jest-e2e.json',
  '--runInBand', // Run tests serially
  '--detectOpenHandles', // Help detect open handles
  '--forceExit', // Force exit after tests complete
  'test/e2e/auth/auth.e2e-spec.ts', // Only run the basic auth tests
]);

// Log message on start
console.log('Running Authentication E2E Tests...'); 