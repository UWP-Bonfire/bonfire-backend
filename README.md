# React Chat App

This is a simple real-time chat application built with React and Firebase. It allows users to authenticate, add friends, and chat with them in real-time.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to have the following software installed on your machine:

*   [Node.js](https://nodejs.org/) (v20 or later)
*   [npm](https://www.npmjs.com/)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    ```

2.  Navigate to the project directory:

    ```bash
    cd your-repo-name
    ```

3.  Install the dependencies:

    ```bash
    npm install
    ```

### Running the Application

To run the application in development mode, use the following command:

```bash
npm run dev
```

This will start the Vite development server and open the application in your default browser.

## Project Structure

The project is structured as follows:

```
.
├── public
│   └── images
├── src
│   ├── components
│   │   ├── Auth.jsx
│   │   ├── Chat.jsx
│   │   ├── Friends.jsx
│   │   ├── Layout.jsx
│   │   └── Sidebar.jsx
│   ├── css
│   │   ├── App.css
│   │   ├── Auth.css
│   │   ├── chat.css
│   │   ├── friends.css
│   │   ├── Layout.css
│   │   └── Sidebar.css
│   ├── hooks
│   │   ├── useAuth.js
│   │   └── useFriends.js
│   ├── App.jsx
│   ├── firebase.js
│   └── main.jsx
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

## Technologies Used

*   **[React](https://reactjs.org/)**: A JavaScript library for building user interfaces.
*   **[Vite](https://vitejs.dev/)**: A fast build tool and development server for modern web projects.
*   **[Firebase](https://firebase.google.com/)**: A platform for building web and mobile applications.
    *   **Authentication**: For user sign-up and sign-in.
    *   **Firestore**: A NoSQL database for storing user data and messages.
*   **[React Router](https://reactrouter.com/)**: For routing and navigation within the application.
*   **[ESLint](https://eslint.org/)**: For code linting and quality control.
