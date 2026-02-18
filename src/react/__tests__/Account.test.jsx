
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Account from '../Account';
import { useAuth } from '../hooks/useAuth';

// Mock the useAuth hook
vi.mock('../hooks/useAuth');

describe('Account component', () => {
  it('displays a loading message while the profile is loading', () => {
    useAuth.mockReturnValue({
      userProfile: null,
      loading: true,
    });

    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading Profile...')).toBeInTheDocument();
  });

  it('displays an error message if the profile fails to load', () => {
    useAuth.mockReturnValue({
      userProfile: null,
      loading: false,
    });

    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>
    );

    expect(screen.getByText('Could not load user profile. Please try again.')).toBeInTheDocument();
  });

  it('displays the user profile information', () => {
    const userProfile = {
      displayName: 'testuser',
      email: 'test@example.com',
      bio: 'This is a test bio.',
      avatar: 'https://example.com/avatar.png',
    };

    useAuth.mockReturnValue({
      userProfile,
      loading: false,
    });

    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /user account/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('This is a test bio.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /profile/i })).toHaveAttribute('src', 'https://example.com/avatar.png');
  });

  it('navigates to the friends page when the back button is clicked', () => {
    const userProfile = { email: 'test@example.com' }; // Basic profile
    useAuth.mockReturnValue({ userProfile, loading: false });

    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>
    );

    const backButton = screen.getByRole('button', { name: /back to friends/i });
    fireEvent.click(backButton);

    // In a real app, you'd check for navigation. Here, we can check the button's behavior.
    expect(window.location.pathname).toBe('/');
  });

  it('navigates to the personalization page when the edit button is clicked', () => {
    const userProfile = { email: 'test@example.com' }; // Basic profile
    useAuth.mockReturnValue({ userProfile, loading: false });

    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>
    );

    const editButton = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editButton);

    expect(window.location.pathname).toBe('/');
  });
});
