import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/client/authClient";

interface User {
  id: string;
  username: string;
  email: string;
}

interface UserMenuProps {
  user: User | null;
}

export function UserMenu({ props }: { props: UserMenuProps }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(props.user);
  
  // Debug initial state
  console.log("[UserMenu] Initial user from props:", props.user?.email || "null");
  
  // Check client-side auth status on component mount
  useEffect(() => {
    let mounted = true;
    
    async function initializeAuthState() {
      // Always use props.user first if available (server-side data)
      if (props.user) {
        console.log("[UserMenu] Using server-provided user:", props.user.email);
        setUser(props.user);
      }
      
      // Only check client-side if we don't have a user from props
      else {
        try {
          const currentUser = await authClient.getCurrentUser();
          console.log("[UserMenu] Client auth check result:", currentUser?.email || "null");
          
          if (currentUser && mounted) {
            setUser(currentUser);
          }
        } catch (err) {
          console.error("[UserMenu] Error getting current user:", err);
        }
      }
    }
    
    initializeAuthState();
    
    // Set up auth state listener with protections against unwanted null updates
    const unsubscribe = authClient.onAuthStateChange((updatedUser) => {
      console.log("[UserMenu] Auth state changed:", updatedUser?.email || "null");
      
      if (mounted) {
        // Don't update to null if we have a user from props and no explicit logout was performed
        if (updatedUser || !props.user) {
          setUser(updatedUser);
        }
      }
    });
    
    return () => {
      mounted = false;
      unsubscribe(); // Cleanup subscription on unmount
    };
  }, [props.user]);

  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      console.log("Signing out...");
      const success = await authClient.logout();
      if (success) {
        console.log("Signed out successfully");
        // Reload the page to reset application state
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  // Debugging: Log user state to console
  console.log("UserMenu - User authenticated:", !!user, user?.email || "null");

  // For non-authenticated users: show login/register buttons
  if (!user) {
    return (
      <div className="flex items-center space-x-2" data-test-id="authenticated-section">
        <Button variant="outline" size="sm" asChild>
          <a href="/login" data-test-id="login-link">Zaloguj się</a>
        </Button>
        <Button size="sm" asChild>
          <a href="/signup">Zarejestruj się </a>
        </Button>
      </div>
    );
  }

  // For authenticated users: show user info and logout button
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 mr-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
          {user.email ? user.email.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm hidden md:inline">
          {user.username || user.email}
        </span>
      </div>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <LogOut className="h-4 w-4 mr-1" />
        {isLoggingOut ? "..." : "Wyloguj"}
      </Button>
    </div>
  );
}

