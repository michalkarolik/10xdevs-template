import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { supabase } from '@/lib/supabase';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

export function RegisterForm({ onSuccess, redirectUrl = '/' }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string): boolean => {
    // Password validation: at least 8 chars, 1 uppercase, 1 digit
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    
    return hasMinLength && hasUpperCase && hasDigit;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!email.trim()) {
      setError("Email jest wymagany");
      return;
    }
    
    if (!validatePassword(password)) {
      setError("Hasło musi mieć co najmniej 8 znaków, zawierać przynajmniej jedną wielką literę i jedną cyfrę");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne");
      return;
    }

    // Clear any previous errors
    setError(null);
    setIsSubmitting(true);

    try {
      // Register with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (signUpError) {
        setError(signUpError.message || "Rejestracja nie powiodła się. Spróbuj ponownie.");
        return;
      }

      // Show success message instead of redirecting
      setSuccess(true);
      
    } catch (err) {
      setError("Rejestracja nie powiodła się. Spróbuj ponownie.");
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

      {success ? (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <p>Rejestracja zakończona pomyślnie! Na twój adres email został wysłany link aktywacyjny.</p>
            <p className="mt-2">Sprawdź swoją skrzynkę pocztową i kliknij w link aby dokończyć proces rejestracji.</p>
          </AlertDescription>
        </Alert>
      ) : (
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
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum 8 znaków, jedna wielka litera i jedna cyfra
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting || success}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || success}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rejestracja...
              </>
            ) : (
              "Zarejestruj się"
            )}
          </Button>
        </div>
      )}

      <div className="mt-6 text-center text-sm">
        <p>
          Masz już konto?{" "}
          <a href="/login" className="font-medium text-primary hover:underline">
            Zaloguj się RegisterMenu.tsx
          </a>
        </p>
      </div>
    </form>
  );
}
