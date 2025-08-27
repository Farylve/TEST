'use client';

import { useState, useEffect } from 'react';

interface ServerStatus {
  status: 'online' | 'offline' | 'loading';
  health: any;
  info: any;
  lastCheck: Date;
}

export default function ServerStatusPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    status: 'loading',
    health: null,
    info: null,
    lastCheck: new Date()
  });

  const checkServerStatus = async () => {
    try {
      const [healthResponse, infoResponse] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/info')
      ]);

      if (healthResponse.ok && infoResponse.ok) {
        const health = await healthResponse.json();
        const info = await infoResponse.json();
        
        setServerStatus({
          status: 'online',
          health,
          info,
          lastCheck: new Date()
        });
      } else {
        setServerStatus(prev => ({
          ...prev,
          status: 'offline',
          lastCheck: new Date()
        }));
      }
    } catch (error) {
      setServerStatus(prev => ({
        ...prev,
        status: 'offline',
        lastCheck: new Date()
      }));
    }
  };

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (serverStatus.status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'loading': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (serverStatus.status) {
      case 'online': return '✓';
      case 'offline': return '✗';
      case 'loading': return '⟳';
      default: return '?';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Minimized state */}
      {!isExpanded && (
        <div
          onClick={() => setIsExpanded(true)}
          className={`
            w-12 h-12 rounded-full cursor-pointer shadow-lg
            flex items-center justify-center text-white font-bold
            transition-all duration-300 hover:scale-110 hover:shadow-xl
            ${getStatusColor()}
          `}
        >
          {getStatusIcon()}
        </div>
      )}

      {/* Expanded state */}
      {isExpanded && (
        <div className="bg-white rounded-lg shadow-2xl p-4 w-80 border border-gray-200 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
              <h3 className="font-semibold text-gray-800">Server Status</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700 text-xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${serverStatus.status === 'online' ? 'bg-green-100 text-green-800' : 
                  serverStatus.status === 'offline' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'}
              `}>
                {serverStatus.status.toUpperCase()}
              </span>
            </div>

            {serverStatus.info && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Environment:</span>
                  <span className="text-sm font-medium">{serverStatus.info.environment}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Port:</span>
                  <span className="text-sm font-medium">{serverStatus.info.port}</span>
                </div>
              </>
            )}

            {serverStatus.health && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Health Check:</span>
                <span className="text-sm font-medium">
                  {new Date(serverStatus.health.timestamp).toLocaleTimeString()}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Update:</span>
              <span className="text-sm font-medium">
                {serverStatus.lastCheck.toLocaleTimeString()}
              </span>
            </div>

            <button
              onClick={checkServerStatus}
              className="w-full mt-3 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              Refresh Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
