
# Logistics Assignment

This project is a logistics management system built with NestJS, following a strategic and modular architecture. It provides APIs for managing couriers, orders, and shipment tracking history.

## Features

- Courier partner integration (adapters, factories, mocks)
- Order management (create, bulk, entity, DTOs)
- Shipment tracking history
- Modular and scalable architecture
- Exception filters and response interceptors

## Project Structure

- `src/common`: Shared constants, enums, filters, and interceptors
- `src/couriers`: Courier modules, adapters, factories, mocks, and UrbaneBolt integration
- `src/features/orders`: Order module, controller, service, DTOs, and entity
- `src/features/tracking_history`: Tracking history DTOs and entity

## Getting Started

1. Clone the repository:
	```bash
	git clone <repo-url>
	cd logistics-assignment
	```

2. Install dependencies:
	```bash
	npm install
	```

3. Set up environment variables:
	- Copy `.env.template` to `.env`.
	- **Important:** Use your own Supabase credentials for the database connection. Fill in the required values in the `.env` file.

4. Run the application:
	```bash
	npm run start:dev
	```

5. Run tests:
	```bash
	npm run test
	```

## Technologies Used

- [NestJS](https://nestjs.com/)
- TypeScript
- Node.js
- Supabase (for database)

## Assignment Notes

- The project demonstrates a strategic, modular architecture for scalability and maintainability.
- Includes mock adapters for testing and demonstration.
- Follows best practices for DTOs, entities, and service layers.

