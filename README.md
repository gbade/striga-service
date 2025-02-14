# Striga Transaction Backend Service

This is the backend service for the Striga application. It is built using Typescript, Node.js, Express, and MongoDB. The service provides APIs for account management and transaction processing, along with WebSocket support for real-time updates.

## Configuration

- **`.env`**: Environment variables configuration.
- **`tsconfig.json`**: TypeScript configuration.
- **`tsconfig.build.json`**: TypeScript build configuration.
- **`jest.config.js`**: Jest configuration for running tests.
- **`.eslintrc.js`**: ESLint configuration.
- **`.prettierrc`**: Prettier configuration.

## Scripts

- **`scripts/banq.js`**: Script for registering accounts and sending transactions.

## Source Code

### API

- **`src/api/app.ts`**: Express application setup.
- **`src/api/middleware/`**: Middleware for error handling and account fetching.
  - **`errorHandler.ts`**: Middleware for handling errors.
  - **`getAccount.ts`**: Middleware for fetching account details.
- **`src/api/routes/`**: API routes.
  - **`accountRoutes.ts`**: Routes for account-related operations.
  - **`transactionRoutes.ts`**: Routes for transaction-related operations.
- **`src/api/services/`**: Services for business logic.
  - **`accountService.ts`**: Service for account-related operations.
  - **`transactionService.ts`**: Service for transaction-related operations.

### Configuration

- **`src/config/`**: Configuration files.
  - **`default.ts`**: Default configuration.
  - **`environments/`**: Environment-specific configurations.
  - **`index.ts`**: Configuration loader.

### Database

- **`src/database/models/`**: Mongoose models.
  - **`account.ts`**: Account model.
  - **`transaction.ts`**: Transaction model.
- **`src/database/repositories/`**: Repositories for database operations.
  - **`accountRepository.ts`**: Repository for account operations.
  - **`transactionRepository.ts`**: Repository for transaction operations.

### Handlers

- **`src/handlers/internal/websocket/server.ts`**: WebSocket server for real-time updates.

### Utilities

- **`src/utils/`**: Utility functions and classes.
  - **`catchAsync.ts`**: Utility for catching async errors.
  - **`errors.ts`**: Custom error classes.
  - **`generateId.ts`**: Utility for generating IDs.
  - **`logger.ts`**: Logger setup using Pino.

### Server

- **`src/server.ts`**: Server setup and initialization.

### Bootstrap

- **`src/bootstrap.ts`**: Bootstrap file for setting up TypeScript paths.

## Tests

- **`tests/fixtures/`**: Test data fixtures.
  - **`data.ts`**: Mock data for tests.
- **`tests/integration/`**: Integration tests.
  - **`account.test.ts`**: Integration tests for account API.
  - **`transaction.test.ts`**: Integration tests for transaction API.
- **`tests/unit/`**: Unit tests.
  - **`middleware/`**: Unit tests for middleware.
    - **`errors.test.ts`**: Unit tests for error handling middleware.
  - **`repositories/`**: Unit tests for repositories.
    - **`transactions.test.ts`**: Unit tests for transaction repository.
  - **`services/`**: Unit tests for services.
    - **`accountService.test.ts`**: Unit tests for account service.
    - **`transactionService.test.ts`**: Unit tests for transaction service.

## Running the Project

### Prerequisites

- Node.js
- MongoDB

### Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Start MongoDB using Docker:

   ```sh
    npm run docker-mongo
   ```

3. Build the project:

   ```sh
    npm run build
   ```

4. Start the server:

   ```sh
    npm run start
   ```

## Development
To start the server in development mode with hot-reloading:
```sh
    npm run dev
```

## Testing
To run the tests:
```sh
    npm run test
```

## Linting
To lint the code:
```sh
    npm run lint
```

To fix linting errors:
```sh
    npm run lint:fix
```
