'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ServerStatusPanel from '@/components/ServerStatusPanel';
import TaskManager from '@/components/TaskManager';

interface ApiResponse {
  message?: string;
  status?: string;
  timestamp?: string;
  uptime?: string;
  version?: string;
  environment?: string;
  data?: any;
  error?: string;
}

export default function Home() {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEndpoint, setCurrentEndpoint] = useState('/api/health');

  const testEndpoint = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    setCurrentEndpoint(endpoint);
    
    try {
      const res = await fetch(`http://farylve.online${endpoint}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testEndpoint('/api/health');
  }, []);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <ServerStatusPanel />
        
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Portfolio Application
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Современное full-stack приложение с микросервисной архитектурой, 
              демонстрирующее интеграцию Next.js, Node.js, PostgreSQL и Docker
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Task Manager */}
            <div className="card">
              <TaskManager />
            </div>

            {/* API Test Panel */}
            <div className="card">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
                <span>🔧</span>
                <span>API Test Panel</span>
              </h2>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => testEndpoint('/api/health')}
                  className={`btn-primary text-sm ${
                    currentEndpoint === '/api/health' ? 'ring-2 ring-blue-300' : ''
                  }`}
                >
                  Health Check
                </button>
                <button
                  onClick={() => testEndpoint('/api/info')}
                  className={`btn-secondary text-sm ${
                    currentEndpoint === '/api/info' ? 'ring-2 ring-gray-300' : ''
                  }`}
                >
                  Server Info
                </button>
                <button
                  onClick={() => testEndpoint('/api/test')}
                  className={`btn-secondary text-sm ${
                    currentEndpoint === '/api/test' ? 'ring-2 ring-gray-300' : ''
                  }`}
                >
                  Test Data
                </button>
                <button
                  onClick={() => testEndpoint('/api')}
                  className={`btn-secondary text-sm ${
                    currentEndpoint === '/api' ? 'ring-2 ring-gray-300' : ''
                  }`}
                >
                  Root API
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Endpoint:</span> 
                  <span className="font-mono bg-white px-2 py-1 rounded ml-2 text-blue-600">
                    {currentEndpoint}
                  </span>
                </p>
              </div>

              <div className="border rounded-lg p-4 bg-white min-h-[200px]">
                {loading && (
                  <div className="flex items-center justify-center space-x-2 h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Загрузка...</span>
                  </div>
                )}
                
                {error && (
                  <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                    <span className="text-red-500 text-xl">❌</span>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
                      <div className="mt-1 text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                )}
                
                {response && !loading && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500 text-xl">✅</span>
                      <h3 className="text-sm font-medium text-green-800">Успешно</h3>
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
              <span>🖥️</span>
              <span>Статус системы</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚛️</span>
                  <div>
                    <h3 className="font-semibold text-blue-900">Frontend</h3>
                    <p className="text-blue-700 text-sm">Next.js 14 (Port 3000)</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-xs text-blue-600">Активен</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🟢</span>
                  <div>
                    <h3 className="font-semibold text-green-900">Backend</h3>
                    <p className="text-green-700 text-sm">Node.js/Express (Port 5000)</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-xs text-green-600">Работает</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🐘</span>
                  <div>
                    <h3 className="font-semibold text-purple-900">Database</h3>
                    <p className="text-purple-700 text-sm">PostgreSQL (Port 5432)</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-xs text-purple-600">Подключена</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Домен приложения</h3>
                  <p className="text-gray-600 text-sm">farylve.online</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm text-green-600 font-medium">Онлайн</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">SSL сертификат активен</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
