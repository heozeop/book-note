/**
 * Run script for Authentication E2E tests
 *
 * This script is used to run all Authentication E2E tests with
 * appropriate Jest configuration.
 */

// Import Jest programmatically
import { run } from "jest";

// Run the auth E2E tests with custom config
run([
  "--config",
  "./test/jest-e2e.json",
  "--runInBand", // Run tests serially
  "--detectOpenHandles", // Help detect open handles
  "--forceExit", // Force exit after tests complete
  "test/e2e/auth", // Run all auth tests in this directory
]);

// Log message on start
console.log("Running All Authentication E2E Tests...");
