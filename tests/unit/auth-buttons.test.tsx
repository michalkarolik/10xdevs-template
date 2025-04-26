import { render, screen, configure } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from 'fs';
import path from 'path';
import { UserMenu } from '@/components/auth/UserMenu';

// Configure Testing Library to use data-test-id attribute
configure({ testIdAttribute: 'data-test-id' });

// Load the content of the real index.astro file
const indexAstroPath = path.resolve(__dirname, '../../src/pages/index.astro');
const indexAstroContent = fs.readFileSync(indexAstroPath, 'utf-8');

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { email: 'test@example.com' } } }
      }),
      refreshSession: vi.fn().mockResolvedValue({})
    }
  }
}));

// Mock auth client
vi.mock('@/lib/client/authClient', () => ({
  authClient: {
    getCurrentUser: vi.fn(),
    onAuthStateChange: vi.fn().mockReturnValue(() => {}),
    logout: vi.fn().mockResolvedValue(true)
  }
}));

describe("Index Page Auth UI", () => {
  it("should render authenticated content when user is provided", () => {
    // Render component directly with authenticated user
    const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
    
    render(<UserMenu props={{ user: mockUser }} />);
    
    // Check that the user's info is displayed
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of email
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Wyloguj')).toBeInTheDocument();
    
    // Ensure login/signup elements are not present
    expect(screen.queryByText('Zaloguj się')).not.toBeInTheDocument();
    expect(screen.queryByText('Zarejestruj się')).not.toBeInTheDocument();
  });

  it("should render guest content when user is not provided", () => {
    // Render component with null user
    render(<UserMenu props={{ user: null }} />);
    
    // Check that login/signup links are displayed
    expect(screen.getByText('Zaloguj się')).toBeInTheDocument();
    expect(screen.getByText('Zarejestruj się')).toBeInTheDocument();
    
    // Check for proper data-test-id (now using the configured attribute)
    expect(screen.getByTestId('authenticated-section')).toBeInTheDocument();
    
    // Ensure user elements are not present
    expect(screen.queryByText('Wyloguj')).not.toBeInTheDocument();
  });
});

