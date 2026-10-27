import { useState } from 'react';
import { Cpu, Globe, Database, Settings, RefreshCw, HelpCircle, Check, AlertCircle } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, isDemoModeActive, setDemoModeActive } from '../api';

interface NavbarProps {
  isDemo: boolean;
  onModeToggle: (demoState: boolean) => void;
  isSyncing: boolean;
  onRefresh: () => void;
  apiError: string | null;
}

export function Navbar({ isDemo, onModeToggle, isSyncing, onRefresh, apiError }: NavbarProps) {
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  const handleToggleMode = (demoState: boolean) => {
    onModeToggle(demoState);
  };

  const handleSaveUrl = () => {
    if (apiUrl.trim()) {
      setApiBaseUrl(apiUrl.trim());
      setIsEditingUrl(false);
      onModeToggle(isDemo); // trigger refresh with new URL
    }
  };

  return (
    <header className="bg-white border-b border-burgundy/10 shadow-sm sticky top-0 z-30" id="main-app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7A1E2C] text-white flex items-center justify-center shadow-md">
              <Cpu className="w-5 h-5 text-[#F3EDE6]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                Waves Electrica 
              </h1>
              <span className="text-[10px] font-mono tracking-widest text-[#7A1E2C] block uppercase font-bold">
                Inventory Manager
              </span>
            </div>
          </div>

          {/* Configuration Settings */}
          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                id="toggle-demo-mode-btn"
                onClick={() => handleToggleMode(true)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  isDemo
                    ? 'bg-white text-[#7A1E2C] shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Demo Mode
              </button>
              <button
                id="toggle-live-mode-btn"
                onClick={() => handleToggleMode(false)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  !isDemo
                    ? 'bg-[#7A1E2C] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Live API Mode
              </button>
            </div>

            {/* Sync Status Button */}
            <button
              id="sync-refresh-btn"
              onClick={onRefresh}
              disabled={isSyncing}
              className={`p-2 text-slate-500 hover:text-[#7A1E2C] hover:bg-[#F3EDE6] rounded-lg transition-colors relative ${
                isSyncing ? 'animate-spin' : ''
              }`}
              title="Synchronize inventory with server"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Mobile Indicator / Settings Trigger */}
            <button
              id="toggle-help-config-btn"
              onClick={() => setShowConfigHelp(!showConfigHelp)}
              className={`p-2 rounded-lg transition-colors ${
                showConfigHelp || apiError ? 'bg-[#F3EDE6] text-[#7A1E2C]' : 'text-slate-500 hover:text-[#7A1E2C] hover:bg-[#F3EDE6]'
              }`}
              title="Connection status and configuration parameters"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded config options panel (Toggled or showing error state) */}
      {(showConfigHelp || apiError) && (
        <div className="bg-[#F3EDE6] border-b border-burgundy/10 px-4 sm:px-6 lg:px-8 py-4 text-xs text-slate-700">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left col: Current Mode Detail */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#7A1E2C] uppercase tracking-wider text-[10px]">
                Connection Status
              </h4>
              <p className="leading-relaxed">
                {isDemo ? (
                  <span>
                    You are in <strong className="text-slate-900">Demo Sandbox Mode</strong>. Any changes you make are saved temporarily in your web browser. This is perfect for trying out the app's features.
                  </span>
                ) : (
                  <span>
                    You are in <strong className="text-slate-900">Live Connection Mode</strong>. The application is connected to a live server and real data.
                  </span>
                )}
              </p>
              {/* Mobile Only Switcher fallback */}
              <div className="flex sm:hidden items-center gap-2 mt-3">
                <span className="font-semibold">Switch Mode:</span>
                <button
                  onClick={() => handleToggleMode(!isDemo)}
                  className="px-3 py-1 bg-white border border-burgundy/20 text-[#7A1E2C] rounded text-[11px] font-bold"
                >
                  {isDemo ? 'Switch to Live API' : 'Switch to Demo'}
                </button>
              </div>
            </div>

            {/* Mid col: Base URL Config */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#7A1E2C] uppercase tracking-wider text-[10px]">
                Server Address
              </h4>
              {isEditingUrl ? (
                <div className="flex gap-2">
                  <input
                    id="api-url-edit-input"
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="http://localhost:8000"
                    className="flex-grow bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-[#7A1E2C] focus:outline-none"
                  />
                  <button
                    onClick={handleSaveUrl}
                    className="bg-[#7A1E2C] hover:bg-[#601520] text-white rounded px-3 py-1.5 font-bold transition-colors"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-white/70 border border-burgundy/5 p-2 rounded-lg">
                  <div className="font-mono text-slate-800 break-all select-all">
                    {apiUrl}
                  </div>
                  <button
                    onClick={() => setIsEditingUrl(true)}
                    className="text-[#7A1E2C] hover:underline font-bold shrink-0 ml-2"
                  >
                    Change
                  </button>
                </div>
              )}
              <p className="text-[10px] text-slate-500">
                This is the system location where your live inventory is stored.
              </p>
            </div>

            {/* Right col: CORS & Backend Instructions */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#7A1E2C] uppercase tracking-wider text-[10px]">
                System Check
              </h4>
              {apiError ? (
                <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Connection Failed:</span> We could not connect to the inventory server.
                    <div className="mt-1 text-[10px] text-slate-500">
                      Please check if the server is turned on and allowed to send data to your web browser.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex gap-2 items-start">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Connection Working:</span> Your browser is successfully talking to the server and loading products.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
