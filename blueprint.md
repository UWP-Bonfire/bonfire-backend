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

### Unread Message Count

- **Functionality:** Displays a bubble with the number of unread messages next to a friend's name in both the friends list and the direct message list.
- **Implementation:**
    - **Real-time Updates:** Uses Firestore's `onSnapshot` to listen for changes in unread message counts for each friend.
    - **Components:**
        - `src/react/Friends.jsx`: Updated to fetch and display the unread count in the main friends list and the direct messages sidebar.
        - `src/react/Messages.jsx`: Updated to fetch and display the unread count in the direct messages sidebar.
    - **Styling:** Added a new `.unread-count` CSS class to `src/css/friends.css` and `src/css/messages.css` to style the notification bubble.

### Read Receipts

- **Data Structure:** Added a `read` field to each message in Firestore.
- **Message Logic:**
    - When a message is sent, the `read` field is set to `false`.
    - When a message is read by the recipient, the `read` field is updated to `true`.
- **UI:** A visual indicator for read and unread messages is displayed.

## Current Task: Implement Notification Limit

- **Functionality:** This feature will limit the number of notifications sent to a user for consecutive unread messages in a chat.
- **Data Structure:**
    - A `limitNotifications` flag will be added to each chat document in Firestore, defaulting to `false`.
    - A `consecutiveUnread` object will be added to each chat document, mapping each user's ID to their unread message count.
- **Logic:**
    - When a message is sent and `limitNotifications` is `true`, the recipient's `consecutiveUnread` counter will be incremented, and the sender's will be reset to `0`.
    - If the recipient's `consecutiveUnread` counter reaches 3, subsequent messages will be sent with an `isSilent: true` flag, and no notification will be triggered.
    - When a user opens a chat, their `consecutiveUnread` counter will be reset to `0`.
- **Notification Listener:** The `GlobalNotificationListener` will be updated to ignore messages with the `isSilent: true` flag.
