# Project Blueprint

## Overview

This document outlines the architecture, features, and development progress of this React application. The application is built with Vite and utilizes Firebase for its backend services, including user authentication.

## Project Structure

The project follows a standard Vite-based React application structure.

- `src/`: Contains the main source code.
  - `react/`: Houses all React components, custom hooks, and tests.
  - `css/`: Contains the application's stylesheets.
  - `firebase/`: Includes Firebase configuration and initialization.
  - `main.jsx`: The application's entry point.
- `package.json`: Defines project dependencies and scripts.
- `vite.config.js`: Configuration for the Vite development server and build process.
- `vitest.config.js`: Configuration for the Vitest testing framework.

## Implemented Features

### Core Setup
- **Project Initialization:** Set up as a Vite-powered React application.
- **Firebase Integration:** Configured Firebase for backend services.
- **Routing:** Implemented client-side routing using `react-router-dom`.

### User Authentication
- **Components:** Created `Login.jsx` and `SignUp.jsx` components for user authentication.
- **Custom Hooks:** Developed `useAuth` and `useAuthentication` hooks to encapsulate authentication logic and state management.
- **Routing:** The `App.jsx` component correctly routes unauthenticated users to the login page.

### Testing
- **Frameworks:** The project is configured with `vitest` for running tests and `@testing-library/react` for rendering and interacting with components in a test environment.
- **Test Coverage (Authentication):**
  - `src/react/__tests__/App.test.jsx`: Verifies that the `App` component renders the `Login` page for unauthenticated users.
  - `src/react/__tests__/Login.test.jsx`: Includes tests for rendering the login form, user input, form submission, error handling, and the loading state.
  - `src/react/__tests__/SignUp.test.jsx`: Includes tests for rendering the sign-up form, user input, form submission, error handling, the loading state, and the email verification message.

## Current Task

- Expanding test coverage to other core components of the application.
