import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface UserMenuProps {
  user: SupabaseUser | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      // Reload the page to reset application state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" asChild>
          <a href="/login">Zaloguj się</a>
        </Button>
        <Button size="sm" asChild>
          <a href="/register">Zarejestruj się</a>
        </Button>
      </div>
    );
  }

  // User menu for authenticated users - replaced Avatar with simple user circle
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 mr-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
          {user.email ? user.email.charAt(0).toUpperCase() : "U"}
        </div>
        <span className="text-sm hidden md:inline">{user.email}</span>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          asChild
        >
          <a href="/topics">Tematy</a>
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          asChild
        >
          <a href="/learning-session">Nauka</a>
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isLoggingOut ? "..." : "Wyloguj"}
        </Button>
      </div>
    </div>
  );
}
