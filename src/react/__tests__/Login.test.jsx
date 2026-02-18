
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';
import { useAuthentication } from '../hooks/useAuth';

// Mock the useAuthentication hook
vi.mock('../hooks/useAuth');

describe('Login component', () => {
  it('renders the login form', () => {
    useAuthentication.mockReturnValue({
      signIn: async () => {},
      error: '',
      loading: false,
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('allows users to fill out the form', () => {
    useAuthentication.mockReturnValue({
      signIn: async () => {},
      error: '',
      loading: false,
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls the signIn function on form submission', async () => {
    const signIn = vi.fn();
    useAuthentication.mockReturnValue({
      signIn,
      error: '',
      loading: false,
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const form = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    expect(signIn).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('displays an error message', () => {
    useAuthentication.mockReturnValue({
      signIn: async () => {},
      error: 'Invalid email or password',
      loading: false,
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  it('disables the login button while loading', () => {
    useAuthentication.mockReturnValue({
      signIn: async () => {},
      error: '',
      loading: true,
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /logging in.../i })).toBeDisabled();
  });

  it('displays "Logging in..." while loading', () => {
    useAuthentication.mockReturnValue({
      signIn: async () => {},
      error: '',
      loading: true,
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /logging in.../i })).toBeInTheDocument();
  });

  it('renders a link to the sign-up page', () => {
    useAuthentication.mockReturnValue({
      signIn: async () => {},
      error: '',
      loading: false,
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText(/don’t have an account\?/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/signup');
  });
});
