
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Friends from '../Friends';
import useFriends from '../hooks/useFriends';
import { useAuth } from '../hooks/useAuth';
import useNotifications from '../hooks/useNotifications';
import useFriendRequests from '../hooks/useFriendRequests';
import useChatSettings from '../hooks/useChatSettings';

// Mock the custom hooks
vi.mock('../hooks/useFriends');
vi.mock('../hooks/useAuth');
vi.mock('../hooks/useNotifications');
vi.mock('../hooks/useFriendRequests');
vi.mock('../hooks/useChatSettings');

describe('Friends component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    useFriends.mockReturnValue({
      friends: [],
      loading: false,
      error: null,
      unfriend: vi.fn(),
      muteUser: vi.fn(),
      unmuteUser: vi.fn(),
    });

    useAuth.mockReturnValue({
      user: { uid: 'test-user-id', displayName: 'Test User' },
      userProfile: { avatar: 'user-avatar.png' },
    });

    useNotifications.mockReturnValue({
      requestPermission: vi.fn(),
    });

    useFriendRequests.mockReturnValue({
      requests: [],
      acceptRequest: vi.fn(),
      declineRequest: vi.fn(),
    });

    useChatSettings.mockReturnValue({
      toggleLimit: vi.fn(),
    });
  });

  it('displays a loading message while friends are loading', () => {
    useFriends.mockReturnValue({ loading: true, friends: [], error: null });

    render(
      <MemoryRouter>
        <Friends />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading friends...')).toBeInTheDocument();
  });

  it('displays an error message if there is an error', () => {
    useFriends.mockReturnValue({ error: 'Failed to fetch friends', loading: false, friends: [] });

    render(
      <MemoryRouter>
        <Friends />
      </MemoryRouter>
    );

    expect(screen.getByText('Failed to fetch friends')).toBeInTheDocument();
  });

  it('displays a message when the user has no friends', () => {
    render(
      <MemoryRouter>
        <Friends />
      </MemoryRouter>
    );

    expect(screen.getByText(/You haven't added any friends yet./i)).toBeInTheDocument();
  });

  it('displays the list of friends', () => {
    const friends = [
      { id: 'friend1', name: 'Friend One', avatar: 'avatar1.png' },
      { id: 'friend2', name: 'Friend Two', avatar: 'avatar2.png' },
    ];
    useFriends.mockReturnValue({ friends, loading: false, error: null });

    render(
      <MemoryRouter>
        <Friends />
      </MemoryRouter>
    );

    // Use getAllByText because the name appears in the sidebar and main content
    expect(screen.getAllByText('Friend One')).toHaveLength(2);
    expect(screen.getAllByText('Friend Two')).toHaveLength(2);
  });
});
