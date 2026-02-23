
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { useAuth, useAuthentication } from '../hooks/useAuth';

// Mock the useAuth hooks
vi.mock('../hooks/useAuth');

describe('App component', () => {
  it('renders Login component for unauthenticated users', () => {
    // Mock the useAuth hook to return no user
    useAuth.mockReturnValue({ user: null, loading: false });
    useAuthentication.mockReturnValue({
      signIn: async () => {},
      error: '',
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={['/app']}>
        <App />
      </MemoryRouter>
    );

    // Check that the Login component is rendered by looking for the heading
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
  });
});
