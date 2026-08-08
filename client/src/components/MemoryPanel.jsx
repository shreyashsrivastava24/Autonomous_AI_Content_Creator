import React from 'react';
import { Database, Tag, Link2, History, Cpu, ShieldCheck } from 'lucide-react';

export default function MemoryPanel({ memory, persona }) {
  const publishedTopics = memory?.publishedTopics || [];
  const concepts = memory?.concepts || [];
  const sources = memory?.sourceHistory || [];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.01em', color: '#0f172a' }}>
          Agent Memory & Semantic Telemetry
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
          Long-term topic tracking preventing repetition and preserving editorial continuity for {persona?.name || 'Agent'}.
        </p>
      </div>

      {/* Grid Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Active Memory Concepts */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '16px', color: '#2563eb', marginBottom: '16px' }}>
            <Tag size={18} />
            <span>Memory Tag Cloud ({concepts.length})</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {concepts.length > 0 ? (
              concepts.map((c, i) => (
                <span key={i} className="badge badge-cyan" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  #{c}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>No concepts in memory yet.</span>
            )}
          </div>
        </div>

        {/* Source Citation Domain Distribution */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '16px', color: '#7c3aed', marginBottom: '16px' }}>
            <Link2 size={18} />
            <span>Cited Source URLs ({sources.length})</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
            {sources.length > 0 ? (
              sources.map((src, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.06)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                  <a
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: '#2563eb',
                      fontSize: '13px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    title={src}
                  >
                    <span>• {src}</span>
                  </a>
                </div>
              ))
            ) : (
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>No sources recorded in memory.</span>
            )}
          </div>
        </div>
      </div>

      {/* Published Topics Continuity Timeline */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '16px', color: '#059669', marginBottom: '20px' }}>
          <History size={18} />
          <span>Topic Evolution & Continuity Chain</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {publishedTopics.length > 0 ? (
            publishedTopics.map((topic, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <span className="badge badge-emerald" style={{ fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  #{publishedTopics.length - idx}
                </span>

                <div style={{ flex: 1 }}>
                  <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '15px' }}>
                    {topic.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span>Published: {new Date(topic.publishedAt).toLocaleString()}</span>
                    <span>Post ID: {topic.postId}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>No publication history recorded.</span>
          )}
        </div>
      </div>
    </div>
  );
}
