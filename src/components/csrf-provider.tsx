'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const CSRF_COOKIE_NAME = '__csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';

interface CSRFContextValue {
  token: string | null;
  isLoading: boolean;
  refreshToken: () => Promise<void>;
  csrfFetch: (url: string | URL, init?: RequestInit) => Promise<Response>;
}

const CSRFContext = createContext<CSRFContextValue | null>(null);

/**
 * Gets the CSRF token from cookie on the client side
 */
function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`${CSRF_COOKIE_NAME}=([^;]+)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function CSRFProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshToken = async () => {
    setIsLoading(true);
    try {
      // Call an API route that sets the CSRF cookie
      await fetch('/api/csrf', { method: 'GET', credentials: 'include' });
      // Read the token from the cookie
      setToken(getTokenFromCookie());
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Try to get existing token from cookie
    const existingToken = getTokenFromCookie();
    if (existingToken) {
      setToken(existingToken);
      setIsLoading(false);
    } else {
      // If no token, refresh it
      refreshToken();
    }
  }, []);

  const csrfFetch = async (url: string | URL, init?: RequestInit): Promise<Response> => {
    const headers = new Headers(init?.headers);
    if (token) {
      headers.set(CSRF_HEADER_NAME, token);
    }

    return fetch(url, {
      ...init,
      headers,
      credentials: 'include',
    });
  };

  return (
    <CSRFContext.Provider value={{ token, isLoading, refreshToken, csrfFetch }}>
      {children}
    </CSRFContext.Provider>
  );
}

export function useCSRF() {
  const context = useContext(CSRFContext);
  if (!context) {
    throw new Error('useCSRF must be used within a CSRFProvider');
  }
  return context;
}

/**
 * Hidden CSRF token input for forms
 */
export function CSRFInput() {
  const { token } = useCSRF();
  return <input type="hidden" name="_csrf" value={token || ''} />;
}
