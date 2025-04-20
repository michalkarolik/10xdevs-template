import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface UserMenuProps {
  user: SupabaseUser | null;
}

export function UserMenu({ props }: { props: UserMenuProps }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [clientUser, setClientUser] = useState<SupabaseUser | null>(props.user);
  
  // Check client-side auth status on component mount
  useEffect(() => {
    async function checkClientAuth() {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setClientUser(data.session.user);
      }
    }
    
    checkClientAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setClientUser(session?.user || null);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Use client-side auth state if available, otherwise fall back to server props
  const user = clientUser || props.user;

  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      console.log("Signing out...");
      await supabase.auth.signOut();
      console.log("Signed out successfully");
      setClientUser(null);
      // Reload the page to reset application state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  // Debugging: Log user state to console
  console.log("UserMenu - User authenticated:", !!user, user?.email);

  // For non-authenticated users: show login/register buttons
  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" asChild>
          <a href="/login">Zaloguj się User Menu</a>
        </Button>
        <Button size="sm" asChild>
          <a href="/register">Zarejestruj się</a>
        </Button>
      </div>
    );
  }

  // For authenticated users: show user info and logout button
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 mr-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
          {user.email ? user.email.charAt(0).toUpperCase() : "U"}
        </div>
        <span className="text-sm hidden md:inline">{user.email}</span>
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
