// File: app/myanimelist-test/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import crypto from 'crypto-js';

export default function MyAnimeListTest() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [codeVerifier, setCodeVerifier] = useState('');
  const [authorizationCode, setAuthorizationCode] = useState('');
  
  const searchParams = useSearchParams();
  
  // Generate a code verifier (PKCE)
  useEffect(() => {
    // Check if we already have a code verifier in local storage
    const storedVerifier = localStorage.getItem('mal_code_verifier');
    if (storedVerifier) {
      setCodeVerifier(storedVerifier);
    } else {
      // Generate a random string for code_verifier
      const randomBytes = new Uint8Array(32);
      window.crypto.getRandomValues(randomBytes);
      const verifier = Array.from(randomBytes)
        .map(b => String.fromCharCode(b))
        .join('');
      const base64Verifier = btoa(verifier)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      setCodeVerifier(base64Verifier);
      localStorage.setItem('mal_code_verifier', base64Verifier);
    }
  }, []);
  
  // Check for the authorization code in URL when component mounts
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setAuthorizationCode(code);
      setStatus('code_received');
    }
  }, [searchParams]);
  
  // Generate code challenge from verifier
  const generateCodeChallenge = async (verifier: string) => {
    const hash = crypto.SHA256(verifier).toString(crypto.enc.Base64);
    return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };
  
  // Start authorization
  const startAuth = async () => {
    try {
      setStatus('authorizing');
      
      if (!codeVerifier) {
        throw new Error('Code verifier not generated yet');
      }
      
      const challenge = await generateCodeChallenge(codeVerifier);
      const clientId = process.env.NEXT_PUBLIC_MYANIMELIST_ID;
      const redirectUri = encodeURIComponent(window.location.origin + '/myanimelist-test');
      
      // Build the authorization URL
      const authUrl = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&code_challenge=${challenge}&code_challenge_method=S256`;
      
      // Redirect to MyAnimeList's auth page
      window.location.href = authUrl;
      
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    }
  };
  
  // Exchange code for tokens
  const exchangeCodeForTokens = async () => {
    try {
      setStatus('exchanging');
      
      const response = await fetch('/api/auth/myanimelist-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: authorizationCode,
          codeVerifier: codeVerifier,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to exchange code for tokens');
      }
      
      setResult(data);
      setStatus('success');
      
      // Clear the code from URL to prevent resubmission
      window.history.replaceState({}, document.title, window.location.pathname);
      
    } catch (err) {
      setStatus('error');
      setError((err as Error).message);
    }
  };
  
  // Clear stored data and reset
  const resetProcess = () => {
    localStorage.removeItem('mal_code_verifier');
    setCodeVerifier('');
    setAuthorizationCode('');
    setStatus('idle');
    setError(null);
    setResult(null);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">MyAnimeList OAuth Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Current Status: {status}</h2>
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded mb-4">
            Error: {error}
          </div>
        )}
        
        {/* Code Verifier Section */}
        <div className="mb-4">
          <h3 className="font-medium">Code Verifier:</h3>
          <div className="bg-white p-2 border rounded">
            {codeVerifier ? (
              <code className="break-all text-sm">{codeVerifier}</code>
            ) : (
              <span className="text-gray-500">Not generated yet...</span>
            )}
          </div>
        </div>
        
        {/* Authorization Code Section */}
        {authorizationCode && (
          <div className="mb-4">
            <h3 className="font-medium">Authorization Code:</h3>
            <div className="bg-white p-2 border rounded">
              <code className="break-all text-sm">{authorizationCode}</code>
            </div>
          </div>
        )}
        
        {/* Result Section */}
        {result && (
          <div className="mb-4">
            <h3 className="font-medium">Result:</h3>
            <pre className="bg-white p-2 border rounded overflow-auto max-h-64 text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        {status === 'idle' && (
          <button 
            onClick={startAuth}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={!codeVerifier}
          >
            Start Authorization
          </button>
        )}
        
        {status === 'code_received' && (
          <button 
            onClick={exchangeCodeForTokens}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={!authorizationCode || !codeVerifier}
          >
            Exchange Code for Tokens
          </button>
        )}
        
        <button 
          onClick={resetProcess}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset Process
        </button>
      </div>
      
      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium">Current URL:</h3>
            <div className="bg-white p-2 border rounded text-sm overflow-auto">
              {typeof window !== 'undefined' ? window.location.href : ''}
            </div>
          </div>
          <div>
            <h3 className="font-medium">PKCE Flow:</h3>
            <ol className="list-decimal ml-5 text-sm">
              <li className={status === 'idle' ? 'font-bold' : ''}>Generate code_verifier</li>
              <li className={status === 'authorizing' ? 'font-bold' : ''}>Create code_challenge from verifier</li>
              <li className={status === 'code_received' ? 'font-bold' : ''}>Receive authorization code</li>
              <li className={status === 'exchanging' || status === 'success' ? 'font-bold' : ''}>Exchange code for tokens</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}