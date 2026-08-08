import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, ShieldCheck, Sparkles, Clock, Copy, Check, Share2, Target, Calendar, Award, Compass } from 'lucide-react';

export default function PostCard({ post, persona }) {
  const [showRationale, setShowRationale] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const dateObj = new Date(post.createdAt);
  const timeAgo = formatTimeAgo(dateObj);

  // Copy full post text to clipboard
  const handleCopyText = () => {
    navigator.clipboard.writeText(post.text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Copy post ID / API payload reference
  const handleCopyId = () => {
    navigator.clipboard.writeText(post.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Format post rationale lines into structured sections if formatted with bullet numbers
  const rationaleSections = parseRationale(post.rationale);

  return (
    <div className="glass-panel post-card-animated" style={{ padding: '28px', marginBottom: '24px', borderRadius: '16px' }}>
      {/* Header Info Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        {/* Persona Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '18px',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}>
            {persona?.name ? persona.name.charAt(0) : 'A'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '17px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                {persona?.name || 'Autonomous Agent'}
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '11px', padding: '3px 10px' }}>
                {persona?.domain || 'AI Persona'}
              </span>
            </div>
            
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} color="var(--text-muted)" />
              <span title={dateObj.toISOString()} style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{timeAgo}</span>
              <span>•</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                {dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} IST
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleCopyText}
            className="btn-copy-post"
            title="Copy full post text to clipboard"
            style={{
              background: copiedText ? 'rgba(5, 150, 105, 0.12)' : 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.08))',
              border: '1px solid ' + (copiedText ? '#10b981' : 'rgba(37, 99, 235, 0.3)'),
              color: copiedText ? '#059669' : 'var(--accent-cyan)',
              borderRadius: '20px',
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: copiedText ? '0 0 12px rgba(16, 185, 129, 0.25)' : '0 2px 8px rgba(37, 99, 235, 0.08)'
            }}
          >
            {copiedText ? <Check size={14} color="#059669" /> : <Copy size={14} />}
            <span>{copiedText ? 'Text Copied!' : 'Copy Post'}</span>
          </button>

          <button
            onClick={handleCopyId}
            className="btn-copy-id"
            title="Copy Post ID reference"
            style={{
              fontFamily: 'var(--font-mono)',
              background: copiedId ? 'rgba(5, 150, 105, 0.12)' : 'var(--bg-card)',
              border: '1px solid ' + (copiedId ? '#10b981' : 'var(--bg-card-border)'),
              color: copiedId ? '#059669' : 'var(--text-secondary)',
              borderRadius: '20px',
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
            }}
          >
            {copiedId ? <Check size={13} color="#059669" /> : <Share2 size={13} />}
            <span>{post.id}</span>
          </button>
        </div>
      </div>

      {/* Primary Post Content Box */}
      <div style={{
        fontSize: '15px',
        lineHeight: '1.75',
        color: 'var(--text-primary)',
        whiteSpace: 'pre-line',
        marginBottom: '20px',
        background: 'var(--bg-dark)',
        padding: '22px 24px',
        borderRadius: '14px',
        border: '1px solid var(--bg-card-border)',
        borderLeft: '4px solid var(--accent-cyan)',
        letterSpacing: '-0.01em',
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.03)'
      }}>
        {post.text}
      </div>

      {/* Sources & Editorial Rationale Collapsible Trigger */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        paddingTop: '16px',
        borderTop: '1px solid var(--bg-card-border)'
      }}>
        {/* Verified Source Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            VERIFIED SOURCES:
          </span>
          {(post.sources || []).map((src, idx) => (
            <a
              key={idx}
              href={src}
              target="_blank"
              rel="noreferrer"
              className="badge badge-cyan"
              style={{ textDecoration: 'none', gap: '6px', padding: '6px 14px', fontSize: '12px', transition: 'transform 0.15s ease' }}
            >
              <span>{extractDomainName(src)}</span>
              <ExternalLink size={12} />
            </a>
          ))}
        </div>

        {/* Toggle Rationale Panel */}
        <button
          onClick={() => setShowRationale(!showRationale)}
          style={{
            background: showRationale ? 'var(--accent-purple-glow)' : 'var(--bg-dark)',
            border: '1px solid ' + (showRationale ? 'var(--accent-purple)' : 'var(--bg-card-border)'),
            color: showRationale ? 'var(--accent-purple)' : 'var(--text-secondary)',
            borderRadius: '10px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Sparkles size={15} color={showRationale ? 'var(--accent-purple)' : 'var(--accent-cyan)'} />
          <span>{showRationale ? 'Hide Editorial Rationale' : 'View Editorial Rationale & Judgment'}</span>
          {showRationale ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Expandable Editorial Rationale Cards */}
      {showRationale && (
        <div style={{
          marginTop: '20px',
          padding: '22px',
          borderRadius: '14px',
          background: 'var(--accent-purple-glow)',
          border: '1px solid var(--accent-purple)',
          fontSize: '14px',
          color: 'var(--text-primary)',
          lineHeight: '1.65'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)', fontWeight: 800, marginBottom: '14px', fontSize: '15px' }}>
            <ShieldCheck size={18} />
            <span>EDITORIAL SELECTION RATIONALE & DECISION METRICS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--bg-card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                <Target size={14} />
                <span>1. Topic Selection & Domain Fit</span>
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
                {rationaleSections.selection || post.rationale}
              </div>
            </div>

            {rationaleSections.timeliness && (
              <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--bg-card-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-amber)', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                  <Calendar size={14} />
                  <span>2. Timeliness & Industry Relevance</span>
                </div>
                <div style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
                  {rationaleSections.timeliness}
                </div>
              </div>
            )}

            {rationaleSections.comparison && (
              <div style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--bg-card-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                  <Award size={14} />
                  <span>3. Comparative Advantage Over Candidates</span>
                </div>
                <div style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
                  {rationaleSections.comparison}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function parseRationale(rawRationale = '') {
  const parts = { selection: '', timeliness: '', comparison: '' };
  
  if (rawRationale.includes('1. Selection Reason:')) {
    const lines = rawRationale.split('\n');
    lines.forEach(line => {
      if (line.startsWith('Topic Selected:')) parts.selection = line;
      if (line.includes('1. Selection Reason:')) parts.selection += (parts.selection ? '\n' : '') + line;
      if (line.includes('2. Timeliness:')) parts.timeliness = line;
      if (line.includes('3. Comparison:')) parts.comparison = line;
    });
  } else {
    parts.selection = rawRationale;
  }
  
  return parts;
}

function extractDomainName(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    return 'Source URL';
  }
}

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}
