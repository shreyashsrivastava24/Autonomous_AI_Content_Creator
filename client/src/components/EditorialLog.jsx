import React, { useState } from 'react';
import { XCircle, Sliders, ExternalLink, Filter, AlertTriangle, Layers } from 'lucide-react';

export default function EditorialLog({ rejections }) {
  const [filterReason, setFilterReason] = useState('all');

  if (!rejections || rejections.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
        <Sliders size={36} color="#d97706" style={{ marginBottom: '16px', opacity: 0.8 }} />
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>No Rejected Candidates Yet</h3>
        <p style={{ fontSize: '14px', marginTop: '6px', maxWidth: '480px', margin: '6px auto 0' }}>
          When the autonomous engine scans live feeds (HackerNews, arXiv, Hugging Face, TechCrunch), candidates that fail quality standards or domain fit are logged here.
        </p>
      </div>
    );
  }

  const filteredRejections = rejections.filter(r => {
    if (filterReason === 'repetition') return r.reason.toLowerCase().includes('novelty') || r.reason.toLowerCase().includes('overlaps');
    if (filterReason === 'domain') return r.reason.toLowerCase().includes('domain') || r.reason.toLowerCase().includes('alignment');
    if (filterReason === 'passed_over') return r.reason.toLowerCase().includes('passed over') || r.reason.toLowerCase().includes('priority');
    return true;
  });

  return (
    <div>
      {/* Header & Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.01em', color: '#0f172a' }}>
            Editorial Judgment & Rejection Audit Trail
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Full decision transparency showing intentional topic rejections and metric scoring breakdown.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color="#64748b" />
          <button
            onClick={() => setFilterReason('all')}
            className={`badge ${filterReason === 'all' ? 'badge-cyan' : ''}`}
            style={{ cursor: 'pointer', background: filterReason === 'all' ? undefined : '#f1f5f9', border: filterReason === 'all' ? undefined : '1px solid #cbd5e1', color: filterReason === 'all' ? undefined : '#475569' }}
          >
            All ({rejections.length})
          </button>
          <button
            onClick={() => setFilterReason('domain')}
            className={`badge ${filterReason === 'domain' ? 'badge-amber' : ''}`}
            style={{ cursor: 'pointer', background: filterReason === 'domain' ? undefined : '#f1f5f9', border: filterReason === 'domain' ? undefined : '1px solid #cbd5e1', color: filterReason === 'domain' ? undefined : '#475569' }}
          >
            Off-Domain
          </button>
          <button
            onClick={() => setFilterReason('repetition')}
            className={`badge ${filterReason === 'repetition' ? 'badge-purple' : ''}`}
            style={{ cursor: 'pointer', background: filterReason === 'repetition' ? undefined : '#f1f5f9', border: filterReason === 'repetition' ? undefined : '1px solid #cbd5e1', color: filterReason === 'repetition' ? undefined : '#475569' }}
          >
            Memory Duplicate
          </button>
          <button
            onClick={() => setFilterReason('passed_over')}
            className={`badge ${filterReason === 'passed_over' ? 'badge-emerald' : ''}`}
            style={{ cursor: 'pointer', background: filterReason === 'passed_over' ? undefined : '#f1f5f9', border: filterReason === 'passed_over' ? undefined : '1px solid #cbd5e1', color: filterReason === 'passed_over' ? undefined : '#475569' }}
          >
            Passed Over
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredRejections.map((rej) => (
          <div key={rej.id} className="glass-panel" style={{ padding: '20px 24px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <XCircle size={20} color="#e11d48" style={{ flexShrink: 0 }} />
                <a
                  href={rej.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#0f172a', fontWeight: 700, fontSize: '15px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>{rej.title}</span>
                  <ExternalLink size={13} color="#64748b" />
                </a>
              </div>

              <span className="badge badge-amber" style={{ fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                Score: {rej.compositeScore}/100
              </span>
            </div>

            {/* Rejection Rationale Box */}
            <div style={{
              fontSize: '13px',
              color: '#991b1b',
              lineHeight: '1.6',
              margin: '10px 0 14px',
              background: '#fef2f2',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid #fecdd3'
            }}>
              {rej.reason}
            </div>

            {/* Score Breakdown Progress Bars */}
            {rej.breakdown && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '12px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                    <span>Domain Relevance</span>
                    <strong style={{ color: '#2563eb' }}>{rej.breakdown.domain}/100</strong>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${rej.breakdown.domain}%`, background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                    <span>Novelty vs Memory</span>
                    <strong style={{ color: '#7c3aed' }}>{rej.breakdown.novelty}/100</strong>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${rej.breakdown.novelty}%`, background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                    <span>Technical Substance</span>
                    <strong style={{ color: '#059669' }}>{rej.breakdown.substance}/100</strong>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${rej.breakdown.substance}%`, background: 'linear-gradient(90deg, #059669, #10b981)' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
