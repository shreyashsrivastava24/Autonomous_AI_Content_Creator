import React, { useState } from 'react';
import { X, Bot, Shield, Cpu, BarChart2, Radio, Check } from 'lucide-react';

const PRESETS = [
  { name: 'Ada', domain: 'AI Security', icon: Shield, desc: 'Focuses on vulnerability research, prompt injection, and red teaming.' },
  { name: 'Orion', domain: 'Machine Learning Engineering', icon: Cpu, desc: 'Focuses on GPU throughput, distributed training, and vLLM optimization.' },
  { name: 'Nexus', domain: 'AI Product Analyst', icon: BarChart2, desc: 'Focuses on enterprise adoption, agent UX, and API unit economics.' },
  { name: 'Kora', domain: 'Robotics & Embodied AI', icon: Radio, desc: 'Focuses on vision-language-action models, spatial intelligence, and ROS2.' }
];

export default function InitAgentModal({ isOpen, onClose, onInitAgent }) {
  const [selectedPreset, setSelectedPreset] = React.useState(PRESETS[0]);
  const [customName, setCustomName] = React.useState('');
  const [customDomain, setCustomDomain] = React.useState('');
  const [isCustom, setIsCustom] = React.useState(false);
  const [intervalMinutes, setIntervalMinutes] = React.useState(2);
  const [submitting, setSubmitting] = React.useState(false);

  // Reset form inputs whenever modal opens or closes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedPreset(PRESETS[0]);
      setCustomName('');
      setCustomDomain('');
      setIsCustom(false);
      setIntervalMinutes(2);
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setCustomName('');
    setCustomDomain('');
    setIsCustom(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const name = isCustom ? customName : selectedPreset.name;
    const domain = isCustom ? customDomain : selectedPreset.domain;

    await onInitAgent({ name, domain }, intervalMinutes);
    setSubmitting(false);
    setCustomName('');
    setCustomDomain('');
    setIsCustom(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '28px', borderRadius: '16px', background: 'var(--bg-card)', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3)', border: '1px solid var(--bg-card-border)' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={24} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Initialize Autonomous AI Agent</h2>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Preset Selector */}
          <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            SELECT PERSONA ARCHETYPE:
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {PRESETS.map((preset) => {
              const Icon = preset.icon;
              const active = !isCustom && selectedPreset.name === preset.name;
              return (
                <div
                  key={preset.name}
                  onClick={() => { setSelectedPreset(preset); setIsCustom(false); }}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid ' + (active ? 'var(--accent-cyan)' : 'var(--bg-card-border)'),
                    background: active ? 'var(--accent-cyan-glow)' : 'var(--bg-dark)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                      <Icon size={16} color={active ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                      <span>{preset.name}</span>
                    </div>
                    {active && <Check size={14} color="var(--accent-cyan)" />}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{preset.domain}</div>
                </div>
              );
            })}
          </div>

          {/* Custom Persona Toggle */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={isCustom}
                onChange={(e) => setIsCustom(e.target.checked)}
                style={{ accentColor: 'var(--accent-cyan)' }}
              />
              <span>Define Custom Persona & Identity</span>
            </label>

            {isCustom && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                <input
                  type="text"
                  placeholder="Persona Name (e.g. Maya)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  required={isCustom}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-dark)',
                    border: '1px solid var(--bg-card-border)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
                <input
                  type="text"
                  placeholder="Domain (e.g. AI Ethics)"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  required={isCustom}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-dark)',
                    border: '1px solid var(--bg-card-border)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>
            )}
          </div>

          {/* Autonomous Publishing Interval */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              AUTONOMOUS PUBLISHING CYCLE INTERVAL:
            </label>
            <select
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'var(--bg-dark)',
                border: '1px solid var(--bg-card-border)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              <option value={1} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>1 Minute (Fast evaluation demo mode)</option>
              <option value={2} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>2 Minutes (Default recommended)</option>
              <option value={5} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>5 Minutes</option>
              <option value={15} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>15 Minutes</option>
            </select>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Initializing Agent...' : 'Initialize & Start Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
