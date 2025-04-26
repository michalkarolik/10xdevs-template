import { configure, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
// Removed unused import: import path from "path";
import { UserMenu } from "@/components/auth/UserMenu";

configure({ testIdAttribute: "data-test-id" });

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { email: "test@example.com" } } },
      }),
      refreshSession: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock("@/lib/client/authClient", () => ({
  authClient: {
    getCurrentUser: vi.fn(),
    onAuthStateChange: vi.fn().mockReturnValue(() => {
      expect(true).toBe(true);
    }),
    logout: vi.fn().mockResolvedValue(true),
  },
}));

describe("Index Page Auth UI", () => {
  it("should render authenticated content when user is provided", () => {
    const mockUser = { id: "1", username: "testuser", email: "test@example.com" };

    render(<UserMenu props={{ user: mockUser }} />);

    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("Wyloguj")).toBeInTheDocument();

    expect(screen.queryByText("Log in")).not.toBeInTheDocument();
    expect(screen.queryByText("Register")).not.toBeInTheDocument();
  });

  it("should render guest content when user is not provided", () => {
    render(<UserMenu props={{ user: null }} />);

    expect(screen.getByText("Log in")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByTestId("authenticated-section")).toBeInTheDocument();
    expect(screen.queryByText("Wyloguj")).not.toBeInTheDocument();
  });
});
