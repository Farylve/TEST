'use client';

import { useState, useEffect } from 'react';

interface ApiResponse {
  message?: string;
  status?: string;
  timestamp?: string;
  name?: string;
  version?: string;
  environment?: string;
  port?: number;
  data?: {
    users: Array<{
      id: number;
      name: string;
      email: string;
    }>;
  };
}

export default function Home() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState('/api/health');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchData = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}${path}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setApiData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setApiData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(endpoint);
  }, []);

  const endpoints = [
    { path: '/api/health', label: 'Health Check' },
    { path: '/api/info', label: 'Server Info' },
    { path: '/api/test', label: 'Test Data' },
    { path: '/', label: 'Root' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Portfolio Application
          </h1>
          <p className="text-lg text-gray-600">
            Frontend (Next.js) + Backend (Node.js/Express) Test
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            API Test Panel
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {endpoints.map((ep) => (
              <button
                key={ep.path}
                onClick={() => {
                  setEndpoint(ep.path);
                  fetchData(ep.path);
                }}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  endpoint === ep.path
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {ep.label}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Current endpoint: <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {API_BASE_URL}{endpoint}
              </span>
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="text-red-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {apiData && !loading && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-start">
                <div className="text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <div className="mt-2">
                    <pre className="text-sm text-gray-800 bg-gray-50 p-3 rounded border overflow-x-auto">
                      {JSON.stringify(apiData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Connection Status
          </h2>
          <div className="space-y-2">
            <p><span className="font-medium">Frontend:</span> Next.js (Port 3000)</p>
            <p><span className="font-medium">Backend:</span> Node.js/Express (Port 5000)</p>
            <p><span className="font-medium">API Base URL:</span> {API_BASE_URL}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
