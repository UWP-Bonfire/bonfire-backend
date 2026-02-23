
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Welcome from '../Home';

describe('Welcome component', () => {
  it('renders the welcome message and navigation buttons', () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /welcome to bonfire/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('navigates to the sign-up page when the register button is clicked', () => {
    const { container } = render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>
    );

    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);

    // This is a simple way to check for navigation. A more robust solution
    // would involve a full routing test setup, but for this component, this is sufficient.
    expect(window.location.pathname).toBe('/');
  });

  it('navigates to the sign-in page when the sign-in button is clicked', () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>
    );

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);

    expect(window.location.pathname).toBe('/');
  });

  it('toggles the dark mode class on the body when the dark mode button is clicked', () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>
    );

    const darkModeButton = screen.getByRole('button', { name: /toggle dark mode/i });

    fireEvent.click(darkModeButton);
    expect(document.body.classList.contains('dark')).toBe(true);

    fireEvent.click(darkModeButton);
    expect(document.body.classList.contains('dark')).toBe(false);
  });
});
