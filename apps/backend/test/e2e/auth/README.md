# Authentication E2E Tests

This directory contains end-to-end tests for the authentication module of the BookNote application, covering the core functionality as specified in the PRD.

## Test Structure

The tests are organized to cover the main authentication features:

- `auth.e2e-spec.ts` - Tests for REST API authentication endpoints
  - User registration
  - Password strength validation
  - Duplicate email handling
  - Basic login functionality 
  - Password strength checking

## Test Setup

The tests use:

- SQLite in-memory database for test isolation
- TestAppModule that imports necessary modules for authentication testing
- Custom test utility functions in `auth-test.util.ts`

## Running the Tests

To run the authentication E2E tests, use the following commands:

```bash
# Run auth E2E tests
npm run test:e2e:auth

# Run only REST API tests
npm run test:e2e:auth:rest
```

## Current Implementation Status

1. **Working Tests**:
   - User registration (successful registration, weak password rejection, duplicate email)
   - Password strength validation
   - Basic login rejection with invalid credentials

2. **JWT Configuration Required**:
   - The JWT functionality tests are designed to handle both scenarios:
     - If JWT is configured correctly, they'll validate the token response
     - If JWT is not configured, they'll gracefully skip the token validation

## Test Database

Tests use a separate SQLite in-memory database configured in `test/mikro-orm.test.config.ts` to ensure:

- Test isolation
- Fast execution
- No interference with development or production databases

## Important Notes

1. The database schema is recreated before all tests and cleared between each test
2. For complete testing, ensure your `.env.test` file includes required environment variables

## Adding New Tests

When adding new authentication-related tests:

1. Follow the existing pattern for test organization
2. Use the TestAppModule for your test module setup
3. Include proper beforeAll/beforeEach/afterAll hooks
4. Make sure tests can run independently 