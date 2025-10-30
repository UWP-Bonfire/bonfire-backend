# Project Blueprint

## Overview

This document outlines the features and implementation details of the current application.

## Features Implemented

### Authentication

- **Refactored Authentication Logic:**
  - The authentication logic has been extracted from the `Auth.jsx` component and moved into a reusable custom hook, `useAuthentication`, located in `src/react/hooks/useAuth.js`.
  - A new `Login.jsx` component has been created to handle the user interface for both sign-up and sign-in, utilizing the `useAuthentication` hook.
  - The `useAuth` hook in `src/react/hooks/useAuth.js` is used to manage the user's authentication state throughout the application.
  - The main `App.jsx` file now uses the `Login.jsx` component for the `/auth` route.

### Profile Customization

- **Profile Picture Selection:**
  - Users can select a profile picture from a predefined set of 10 icons.
  - The selected icon is saved to the user's profile in Firestore.
  - The UI provides visual feedback to indicate the currently selected icon.

- **Username Editing:**
  - Users can change their username.
  - The application ensures that the new username is unique across all users.
  - The UI provides an intuitive in-place editing experience.

## Current Task: Implement Read Receipts

- **Data Structure:** Add a `read` field to each message in Firestore.
- **Message Logic:**
    - When a message is sent, the `read` field will be set to `false`.
    - When a message is read by the recipient, the `read` field will be updated to `true`.
- **UI:** Display a visual indicator for read and unread messages.
