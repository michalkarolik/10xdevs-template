import { AUTH_TOKEN_COOKIE, getClientCookie, removeClientCookie } from "../cookies";

interface User {
  id: string;
  username: string;
  email: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  email: string;
  password: string;
  username: string;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Add a simple event system to notify components when auth state changes
const authEventListeners: ((user: User | null) => void)[] = [];

export const authClient = {
  currentUser: null as User | null,
  isInitialized: false,
  isInitializing: false, // Add flag to prevent concurrent initializations

  // Add event listener for auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    authEventListeners.push(callback);

    // If we already have a user, call the callback immediately
    if (this.isInitialized) {
      callback(this.currentUser);
    }

    return () => {
      const index = authEventListeners.indexOf(callback);
      if (index !== -1) authEventListeners.splice(index, 1);
    };
  },

  // Notify listeners of auth state changes
  _notifyAuthStateChange(user: User | null): void {
    // Add logging that includes email for easier debugging
    console.log("Auth client notifying state change:", user?.email || "null");

    // Don't update if nothing has changed
    if ((this.currentUser === null && user === null) || (this.currentUser && user && this.currentUser.id === user.id)) {
      return;
    }

    this.currentUser = user;
    authEventListeners.forEach((listener) => listener(user));
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        // Important: Include credentials to ensure cookies are sent/received
        credentials: "include",
      });

      console.log("Login response status:", response.status);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      console.log("Login successful, user data:", data.user?.email);

      // Store user data in memory immediately
      this.currentUser = data.user;
      this.isInitialized = true;

      // Add delay before notifying to ensure cookie is set
      setTimeout(() => {
        // Update the auth state and notify listeners
        this._notifyAuthStateChange(data.user);
      }, 100);

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during login",
      };
    }
  },

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include", // Include credentials for cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Update the auth state and notify listeners
      this._notifyAuthStateChange(data.user);

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during signup",
      };
    }
  },

  async logout(): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Logout failed");
      }

      // Clear client-side cookie immediately to ensure state consistency
      removeClientCookie(AUTH_TOKEN_COOKIE);

      // Update the auth state and notify listeners
      this._notifyAuthStateChange(null);

      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    // Don't run multiple initializations simultaneously
    if (this.isInitializing) {
      return this.currentUser;
    }

    try {
      this.isInitializing = true;

      // If we already have a user in memory and are initialized, return it
      if (this.isInitialized && this.currentUser) {
        console.log("Using cached user:", this.currentUser.email);
        return this.currentUser;
      }

      const token = getClientCookie(AUTH_TOKEN_COOKIE);
      if (!token) {
        console.log("No auth token found in cookies");
        this._notifyAuthStateChange(null);
        this.isInitialized = true;
        return null;
      }

      console.log("Fetching current user with token");
      const response = await fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include credentials for cookies
      });

      if (!response.ok) {
        console.log("API returned not OK:", response.status);
        this._notifyAuthStateChange(null);
        this.isInitialized = true;
        return null;
      }

      const data = await response.json();
      console.log("API returned user:", data.user?.email);

      // Store and notify about the user data
      this._notifyAuthStateChange(data.user);

      this.isInitialized = true;
      return data.user;
    } catch (error) {
      console.error("Get current user error:", error);
      this.isInitialized = true;
      return null;
    } finally {
      this.isInitializing = false;
    }
  },

  getToken(): string | undefined {
    return getClientCookie(AUTH_TOKEN_COOKIE);
  },

  addTokenToRequest(headers: Record<string, string> = {}): Record<string, string> {
    const token = this.getToken();
    if (token) {
      return {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return headers;
  },

  // Initialize auth state on page load
  async initAuth(): Promise<void> {
    if (this.isInitialized) return;

    console.log("Initializing auth client...");
    await this.getCurrentUser();
    console.log("Auth initialized, current user:", this.currentUser?.email || "null");
  },
};

// Initialize auth state when this module is imported
if (typeof window !== "undefined") {
  // Only run in browser context
  console.log("Browser detected, initializing auth...");
  setTimeout(() => {
    // Slight delay to ensure DOM is ready
    authClient.initAuth().catch((err) => console.error("Error initializing auth:", err));
  }, 0);
}

export const { getToken } = authClient;
