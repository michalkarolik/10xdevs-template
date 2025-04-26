import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface LoginFormProps {
  redirectUrl?: string;
}

export function LoginForm({ redirectUrl = "/" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!email.trim()) {
      setError("Email jest wymagany");
      return;
    }

    if (!password) {
      setError("Hasło jest wymagane");
      return;
    }

    // Clear any previous errors
    setError(null);
    setIsSubmitting(true);

    try {
      // Authenticate with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Ensure session is persisted
          persistSession: true,
        },
      });

      if (signInError) {
        // Generic error message for security (not revealing if email or password is incorrect)
        setError("Nieprawidłowy email lub hasło. Spróbuj ponownie.");
        return;
      }

      // Success handling - wait for session to be stored
      if (data.session) {
        console.log("Login successful, session established");

        // Store a flag in sessionStorage to indicate login is completed
        sessionStorage.setItem("auth_completed", "true");

        const expiresAt = data.session.expires_at;
        if (expiresAt) {
          // For debugging - store session info
          console.log(`Session expires at: ${new Date(expiresAt * 1000).toLocaleString()}`);
        } else {
          console.log("Session expiry time not provided");
        }

        // Hard page reload to ensure server recognizes the session
        window.location.href = redirectUrl;
      } else {
        setError("Nie udało się utworzyć sesji. Spróbuj ponownie.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Logowanie nie powiodło się. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Adres email</Label>
          <Input
            id="email"
            type="email"
            placeholder="twoj@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Hasło</Label>
            <a href="/reset-password" className="text-sm font-medium text-primary hover:underline">
              Zapomniałeś hasła?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logowanie...
          </>
        ) : (
          "Zaloguj się LoginForm.tsx"
        )}
      </Button>

      <div className="mt-6 text-center text-sm">
        <p>
          Nie masz konta?{" "}
          <a href="/register" className="font-medium text-primary hover:underline">
            Zarejestruj się
          </a>
        </p>
      </div>
    </form>
  );
}
