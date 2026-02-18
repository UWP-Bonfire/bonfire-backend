
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignUp from '../SignUp';
import { useAuthentication } from '../hooks/useAuth';

// Mock the useAuthentication hook
vi.mock('../hooks/useAuth');

describe('SignUp component', () => {
  it('renders the sign-up form', () => {
    useAuthentication.mockReturnValue({
      signUp: async () => {},
      error: '',
      loading: false,
      verificationSent: false,
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('allows users to fill out the form', () => {
    useAuthentication.mockReturnValue({
      signUp: async () => {},
      error: '',
      loading: false,
      verificationSent: false,
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls the signUp function on form submission', async () => {
    const signUp = vi.fn();
    useAuthentication.mockReturnValue({
      signUp,
      error: '',
      loading: false,
      verificationSent: false,
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const form = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    expect(signUp).toHaveBeenCalledWith('test@example.com', 'password123', 'testuser');
  });

  it('displays an error message', () => {
    useAuthentication.mockReturnValue({
      signUp: async () => {},
      error: 'An error occurred',
      loading: false,
      verificationSent: false,
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('disables the sign-up button while loading', () => {
    useAuthentication.mockReturnValue({
      signUp: async () => {},
      error: '',
      loading: true,
      verificationSent: false,
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /signing up.../i })).toBeDisabled();
  });

  it('displays "Signing up..." while loading', () => {
    useAuthentication.mockReturnValue({
      signUp: async () => {},
      error: '',
      loading: true,
      verificationSent: false,
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /signing up.../i })).toBeInTheDocument();
  });

  it('hides the form and shows a verification message when verification has been sent', () => {
    useAuthentication.mockReturnValue({
      signUp: async () => {},
      error: '',
      loading: false,
      verificationSent: true,
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    expect(screen.getByText(/please verify your email/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login page/i })).toHaveAttribute('href', '/auth');
  });

  it('renders a link to the login page', () => {
    useAuthentication.mockReturnValue({
      signUp: async () => {},
      error: '',
      loading: false,
      verificationSent: false,
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/auth');
  });
});
