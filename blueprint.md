# Bonfire App Blueprint

## Overview

Bonfire is a modern social messaging application designed for real-time communication. It features a clean, intuitive interface and a robust set of features that make it easy to connect with friends and build communities.

## Project Structure

- `src/`
  - `react/`: Contains all React components.
    - `App.jsx`: The main application component, responsible for routing.
    - `Auth.jsx`: Handles user authentication (sign-up and sign-in).
    - `Home.jsx`: The landing page of the application.
    - `Chat.jsx`: The chat interface.
    - `Friends.jsx`: Displays the user's list of friends and incoming friend requests.
    - `AddFriend.jsx`: Allows users to send friend requests.
    - `FriendRequests.jsx`: Displays and manages incoming friend requests.
    - `Layout.jsx`: The main layout for the authenticated part of the app.
    - `Nav.jsx`: The vertical navigation bar.
    - `hooks/`: Contains custom React hooks.
      - `useAuth.js`: A hook for managing user authentication state.
      - `useFriends.js`: A hook for fetching and managing the user's friends list.
      - `useFriendRequests.js`: A hook for managing friend requests.
      - `useChat.js`: A hook for managing chat messages and user profiles.
  - `css/`: Contains all CSS stylesheets.
    - `Home.css`: Styles for the landing page.
    - `Auth.css`: Styles for the authentication forms.
    - `Nav.css`: Styles for the navigation bar.
    - `friends.css`: Styles for the friends list and friend requests.
    - `add-friend.css`: Styles for the add friend page.
    - `FriendRequests.css`: Styles for the friend requests component.
  - `firebase.js`: Initializes and configures the Firebase SDK.
- `public/`: Contains static assets, including `index.html` and images.

## Features

- **User Authentication**: Users can sign up and sign in with their email and password.
- **Real-time Messaging**: Instant messaging with friends.
- **Friend Request System**: Users can send, receive, accept, and decline friend requests.
- **Friend Management**: Users can view their friends list.
- **Modern Design**: A clean, visually appealing interface that is consistent across the application.
- **Intelligent Scrolling**: The chat automatically scrolls to the latest message only when the user is already near the bottom of the conversation.
- **Dynamic Chat Header**: The chat header now displays the name of the friend in private chats.

## Routing

The application uses `react-router-dom` for routing. The main routes are:

- `/`: The landing page (`Home.jsx`).
- `/auth`: The authentication page (`Auth.jsx`).
- `/app`: The main application, which is a protected route.
  - `/app/friends`: The friends list and friend requests page.
  - `/app/chat`: The chat interface.
  - `/app/add-friend`: The page for adding new friends.

## Styling

The application uses a combination of CSS stylesheets to create a modern and consistent design. Key design elements include:

- A dark theme with a red accent color.
- A clean and spacious layout.
- Custom styling for forms, buttons, and navigation elements.

## Friend Request System

The friend request system is implemented using a `friendRequests` collection in Firestore. When a user sends a friend request, a new document is created in this collection. The recipient can then view their pending requests and either accept or decline them.

- **Sending Requests**: The `AddFriend.jsx` component now creates a new document in the `friendRequests` collection with a status of `pending`.
- **Viewing Requests**: The `FriendRequests.jsx` component fetches and displays all pending friend requests for the current user.
- **Accepting/Declining Requests**: The `useFriendRequests.js` hook provides the logic for accepting and declining friend requests. When a request is accepted, the two users are added to each other's `friends` list in the `users` collection, and the friend request document is deleted. When a request is declined, the friend request document is deleted.
