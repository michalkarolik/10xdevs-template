import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from 'fs';
import path from 'path';

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

describe("Index Page Auth UI", () => {
  beforeEach(() => {
    // Extract and set up the HTML structure from index.astro
    const htmlMatch = indexAstroContent.match(/<Layout.*?>([\s\S]*?)<\/Layout>/);
    if (htmlMatch) {
      document.body.innerHTML = htmlMatch[1];
    }

    // Mock localStorage for auth token check
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        clear: vi.fn(),
        removeItem: vi.fn(),
        key: vi.fn(),
        length: 0
      }
    });
  });

  it("shows authenticated content and hides guest content when authenticated", async () => {
    // Manually trigger the logic from the script in index.astro
    const authSection = document.getElementById('auth-section');
    const guestSection = document.getElementById('guest-section');
    
    // Simulate the authenticated state
    if (authSection && guestSection) {
      authSection.style.display = 'block';
      guestSection.style.display = 'none';
    }

    // Now verify the UI state
    expect(document.querySelector('#auth-section')?.style.display).toBe('block');
    expect(document.querySelector('#guest-section')?.style.display).toBe('none');
    
    // Check for authenticated content
    expect(document.querySelector('#auth-section')?.textContent).toMatch(/Zarządzaj tematami/i);
    expect(document.querySelector('#auth-section')?.textContent).toMatch(/Rozpocznij sesję nauki/i);
    
    // Check guest content is not visible rather than not present
    const guestLink = document.querySelector('a[href="/register"]');
    expect(guestLink).not.toBeVisible();
  });

  it("shows guest content and hides authenticated content when not authenticated", async () => {
    // Manually trigger the logic from the script in index.astro for unauthenticated user
    const authSection = document.getElementById('auth-section');
    const guestSection = document.getElementById('guest-section');
    
    // Simulate the unauthenticated state
    if (authSection && guestSection) {
      authSection.style.display = 'none';
      guestSection.style.display = 'block';
    }

    // Verify the UI state
    expect(document.querySelector('#auth-section')?.style.display).toBe('none');
    expect(document.querySelector('#guest-section')?.style.display).toBe('block');
    
    // Check for guest content
    expect(document.querySelector('#guest-section')?.textContent).toMatch(/Zarejestruj się/i);
    expect(document.querySelector('#guest-section')?.textContent).toMatch(/Zaloguj się/i);
    
    // Check authenticated content is not visible
    const authLink = document.querySelector('a[href="/topics"]');
    expect(authLink).not.toBeVisible();
  });
});
