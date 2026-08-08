import React from 'react';
import { Bot, RefreshCw, Plus, Cpu, Activity, Download, ShieldCheck, Sun, Moon } from 'lucide-react';

export default function Navbar({
  agents,
  selectedAgentId,
  onSelectAgent,
  onOpenInitModal,
  onTriggerCycle,
  onExportFeed,
  loading,
  lastSyncTime,
  theme,
  onToggleTheme
}) {
  const currentAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      borderBottom: '1px solid #e2e8f0',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Persona Identifier */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
          position: 'relative'
        }}>
          <Bot size={24} color="#ffffff" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
              AUTONOMOUS AI CREATOR
            </h1>
            <span className="badge badge-cyan" style={{ fontSize: '11px', padding: '2px 8px' }}>
              v1.0 Pro
            </span>
          </div>
          
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span className="live-indicator"></span>
            <span>Autonomous Engine Active</span>
            {lastSyncTime && (
              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                • Updated {lastSyncTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Control Actions & Persona Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {agents.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-dark)',
            padding: '6px 14px',
            borderRadius: '10px',
            border: '1px solid var(--bg-card-border)'
          }}>
            <Cpu size={16} color="var(--accent-cyan)" />
            <select
              value={selectedAgentId || ''}
              onChange={(e) => onSelectAgent(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {agents.map(a => (
                <option key={a.id} value={a.id} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  {a.persona.name} ({a.persona.domain})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="btn-secondary"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#7c3aed" />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
        </button>

        <button
          onClick={onTriggerCycle}
          disabled={loading || !selectedAgentId}
          className="btn-secondary"
          title="Force immediate autonomous discovery & editorial judgment cycle"
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} color="#2563eb" />
          <span>Trigger Cycle</span>
        </button>

        {onExportFeed && (
          <button
            onClick={onExportFeed}
            className="btn-secondary"
            title="Export Feed JSON payload"
          >
            <Download size={15} color="#7c3aed" />
            <span>Export JSON</span>
          </button>
        )}

        <button onClick={onOpenInitModal} className="btn-primary">
          <Plus size={16} />
          <span>New Persona Agent</span>
        </button>
      </div>
    </header>
  );
}
