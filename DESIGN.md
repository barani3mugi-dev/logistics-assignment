# Logistics Assignment – Design Document

## Overview
This document describes the design and architecture of the Logistics Assignment project, a modular logistics management system built with NestJS. The system is designed for extensibility, maintainability, and ease of integration with multiple courier partners.

## Goals
- Modular, scalable architecture
- Easy integration of new courier partners
- Clear separation of concerns (domain, infrastructure, interfaces)
- Robust error handling and response formatting

## Architecture
The project follows a layered, modular architecture:

- **Common Layer**: Shared constants, enums, filters, and interceptors
- **Courier Module**: Contains adapters, factories, mocks, and integrations for courier partners
- **Features Layer**: Business logic for orders and tracking history
- **Main Application Module**: Bootstraps the application and composes modules

### Module Structure
- `src/common/`: Shared utilities, enums, filters, and interceptors
- `src/couriers/`: Courier partner logic, adapters, factories, mocks, UrbaneBolt integration
- `src/features/orders/`: Order management (controller, service, DTOs, entity)
- `src/features/tracking_history/`: Tracking history (DTOs, entity)

## Key Components

### 1. Courier Integration
- **Adapter Pattern**: Each courier partner implements a common interface, allowing the system to interact with different partners uniformly.
- **Factory Pattern**: The factory selects and instantiates the correct adapter based on the courier partner.
- **Mock Adapters**: Used for testing and demonstration without real API calls.

### 2. Order Management
- **Order Entity**: Represents an order in the system.
- **DTOs**: Define the shape of data for creating and handling orders.
- **Order Service**: Contains business logic for order creation and management.

### 3. Tracking History
- **Tracking Entity**: Stores shipment tracking events.
- **DTOs**: Define the structure for tracking responses.

### 4. Exception Handling & Interceptors
- **HTTP Exception Filter**: Catches and formats errors for API responses.
- **Response Interceptor**: Standardizes API responses.

## Database
- The system uses Supabase (PostgreSQL) for data storage.
- Users must provide their own Supabase credentials in the `.env` file.

## Extensibility
- New courier partners can be added by implementing the adapter interface and registering with the factory.
- New features can be added as modules under `src/features/`.

## Error Handling
- Centralized error handling via custom exception filters.
- Consistent API responses via interceptors.

## Security
- Authentication logic can be extended in `couriers/shared/auth.base.ts` and related files.

## Testing
- Mock adapters and DTOs facilitate unit and integration testing.
- E2E tests are located in the `test/` directory.

## Deployment
- Environment variables are managed via `.env`.
- The application can be started with `npm run start:dev`.

## Conclusion
This design enables a robust, maintainable, and extensible logistics management system, suitable for real-world courier integrations and scalable feature growth.
