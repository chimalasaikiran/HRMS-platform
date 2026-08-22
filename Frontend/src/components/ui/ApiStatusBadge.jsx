import React, { useState, useEffect } from 'react';
import { Server, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { checkServerStatus, getConfiguredEndpoints, getActiveBaseUrl } from '../../services/api';

export const ApiStatusBadge = () => {
  const [status, setStatus] = useState({ online: true, activeUrl: getActiveBaseUrl() });
  const [checking, setChecking] = useState(false);
  const endpoints = getConfiguredEndpoints();

  const verifyStatus = async () => {
    setChecking(true);
    try {
      const res = await checkServerStatus();
      setStatus(res);
    } catch (err) {
      setStatus({ online: false, activeUrl: getActiveBaseUrl() });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    verifyStatus();
  }, []);

  const activeHost = status.activeUrl.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '');

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-xs font-medium text-slate-700 shadow-xs backdrop-blur-xs">
      <span className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          {status.online ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          )}
        </span>
        <Server className="w-3.5 h-3.5 text-slate-500" />
        <span className="font-mono text-[11px] text-slate-600">
          {activeHost}
        </span>
      </span>

      <button
        type="button"
        onClick={verifyStatus}
        title="Check backend server connection"
        disabled={checking}
        className="p-1 text-slate-400 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-200/50"
      >
        <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin text-[#c89e60]' : ''}`} />
      </button>
    </div>
  );
};
