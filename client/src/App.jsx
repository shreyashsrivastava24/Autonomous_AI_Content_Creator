import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PostCard from './components/PostCard';
import EditorialLog from './components/EditorialLog';
import MemoryPanel from './components/MemoryPanel';
import InitAgentModal from './components/InitAgentModal';
import { Rss, Sliders, Database, Copy, Check, Sparkles, Search, Layers, FileCode, Radio, Cpu, Shield, BarChart2 } from 'lucide-react';

export default function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [posts, setPosts] = useState([]);
  const [rejections, setRejections] = useState([]);
  const [memory, setMemory] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitModalOpen, setIsInitModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch agent list
  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        if (data.agents && data.agents.length > 0) {
          setAgents(data.agents);
          if (!selectedAgentId) {
            setSelectedAgentId(data.agents[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };

  // Fetch feed, rejections, memory for active agent
  const fetchAgentData = async (agentId) => {
    if (!agentId) return;
    try {
      // 1. Fetch Feed (GET /api/agent/feed?agentId=...)
      const feedRes = await fetch(`/api/agent/feed?agentId=${agentId}`);
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        setPosts(feedData.posts || []);
      }

      // 2. Fetch Rejections
      const rejRes = await fetch(`/api/agent/rejections?agentId=${agentId}`);
      if (rejRes.ok) {
        const rejData = await rejRes.json();
        setRejections(rejData.rejections || []);
      }

      // 3. Fetch Memory
      const memRes = await fetch(`/api/agent/memory?agentId=${agentId}`);
      if (memRes.ok) {
        const memData = await memRes.json();
        setMemory(memData.memory || null);
      }

      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Error fetching agent feed/data:', err);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgentId) {
      fetchAgentData(selectedAgentId);

      // Auto poll every 8 seconds to show live posts appearing over time
      const timer = setInterval(() => {
        fetchAgentData(selectedAgentId);
      }, 8000);

      return () => clearInterval(timer);
    }
  }, [selectedAgentId]);

  // Handle agent initialization (POST /api/agent/init)
  const handleInitAgent = async (personaPayload, intervalMinutes) => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: personaPayload,
          intervalMinutes
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.agentId) {
          await fetchAgents();
          setSelectedAgentId(data.agentId);
          await fetchAgentData(data.agentId);
        }
      }
    } catch (err) {
      console.error('Failed to init agent:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual trigger cycle
  const handleTriggerCycle = async () => {
    if (!selectedAgentId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/agent/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgentId })
      });
      if (res.ok) {
        await res.json();
        await fetchAgentData(selectedAgentId);
        setActiveTab('feed');
      }
    } catch (err) {
      console.error('Error triggering cycle:', err);
    } finally {
      setLoading(false);
    }
  };

  // Export Feed JSON
  const handleExportFeed = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ posts }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `feed-${selectedAgentId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const currentAgent = agents.find(a => a.id === selectedAgentId);

  const copyAgentId = () => {
    if (selectedAgentId) {
      navigator.clipboard.writeText(selectedAgentId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Filter posts by search query
  const filteredPosts = posts.filter(p =>
    p.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.rationale.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        agents={agents}
        selectedAgentId={selectedAgentId}
        onSelectAgent={setSelectedAgentId}
        onOpenInitModal={() => setIsInitModalOpen(true)}
        onTriggerCycle={handleTriggerCycle}
        onExportFeed={handleExportFeed}
        loading={loading}
        lastSyncTime={lastSyncTime}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {/* Executive Banner & Metric Cards */}
        {currentAgent ? (
          <div style={{ marginBottom: '32px' }}>
            <div className="glass-panel" style={{ padding: '28px', marginBottom: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                      {currentAgent.persona.name}
                    </h2>
                    <span className="badge badge-cyan" style={{ fontSize: '13px', padding: '4px 12px' }}>
                      {currentAgent.persona.domain}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    Autonomous AI Creator Persona • Operating continuously post-initialization
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Endpoint Copy Box */}
                  <div style={{
                    background: 'var(--bg-dark)',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--bg-card-border)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: 'var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span>GET /api/agent/feed?agentId={selectedAgentId}</span>
                    <button onClick={copyAgentId} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Copy Endpoint">
                      {copiedId ? <Check size={16} color="#059669" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Telemetry Metric Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="metric-card">
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Published Posts
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563eb' }}>
                  {posts.length}
                </div>
              </div>

              <div className="metric-card">
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Topics Rejected
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#d97706' }}>
                  {rejections.length}
                </div>
              </div>

              <div className="metric-card">
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Memory Concepts
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#7c3aed' }}>
                  {memory?.concepts?.length || 0}
                </div>
              </div>

              <div className="metric-card">
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Autonomous Interval
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669' }}>
                  {Math.round((currentAgent.intervalMs || 120000) / 60000)}m
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '56px', textAlign: 'center', marginBottom: '32px', borderRadius: '16px' }}>
            <Sparkles size={48} color="#2563eb" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>No Persona Agent Initialized</h2>
            <p style={{ fontSize: '15px', color: '#64748b', marginTop: '8px', marginBottom: '24px', maxWidth: '540px', margin: '8px auto 24px' }}>
              Initialize an autonomous AI technology persona agent to begin live topic discovery, editorial judgment, memory continuity tracking, and continuous publishing over time.
            </p>
            <button onClick={() => setIsInitModalOpen(true)} className="btn-primary">
              Initialize Autonomous Agent
            </button>
          </div>
        )}

        {/* View Tabs & Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('feed')}
              style={{
                background: activeTab === 'feed' ? '#eff6ff' : 'transparent',
                border: '1px solid ' + (activeTab === 'feed' ? '#bfdbfe' : 'transparent'),
                color: activeTab === 'feed' ? '#1d4ed8' : '#64748b',
                borderRadius: '10px',
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Rss size={17} />
              <span>Autonomous Feed ({filteredPosts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('rejections')}
              style={{
                background: activeTab === 'rejections' ? '#fffbeb' : 'transparent',
                border: '1px solid ' + (activeTab === 'rejections' ? '#fde68a' : 'transparent'),
                color: activeTab === 'rejections' ? '#b45309' : '#64748b',
                borderRadius: '10px',
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sliders size={17} />
              <span>Editorial Board ({rejections.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('memory')}
              style={{
                background: activeTab === 'memory' ? '#f5f3ff' : 'transparent',
                border: '1px solid ' + (activeTab === 'memory' ? '#ddd6fe' : 'transparent'),
                color: activeTab === 'memory' ? '#6d28d9' : '#64748b',
                borderRadius: '10px',
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Database size={17} />
              <span>Memory & Telemetry</span>
            </button>
          </div>

          {activeTab === 'feed' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Search Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--bg-card-border)', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' }}>
                <Search size={15} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search posts or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    width: '180px'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'feed' && (
          <div>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} persona={currentAgent?.persona} />
              ))
            ) : (
              <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: '#64748b', borderRadius: '16px' }}>
                <Rss size={36} style={{ marginBottom: '16px', opacity: 0.6 }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>No Posts Found</h3>
                <p style={{ fontSize: '14px', marginTop: '6px' }}>
                  {searchQuery ? 'No posts match your search query.' : 'The agent is harvesting live sources. Posts will appear automatically over time.'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rejections' && (
          <EditorialLog rejections={rejections} />
        )}

        {activeTab === 'memory' && (
          <MemoryPanel memory={memory} persona={currentAgent?.persona} />
        )}

        {/* System Architecture & Autonomous Workflow Section */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.01em', color: '#0f172a' }}>
              System Architecture & Autonomous Pipeline
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              End-to-end data flow executing independently after initialization.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: '#2563eb', marginBottom: '8px' }}>
                <Rss size={16} />
                <span>1. Topic Discovery</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                Harvesters pull live candidate topics from HackerNews, Hugging Face, arXiv CS/AI, and RSS streams.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: '#d97706', marginBottom: '8px' }}>
                <Sliders size={16} />
                <span>2. Editorial Judgment</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                Scoring rules evaluate domain relevance, technical substance, and timeliness. Off-domain topics are intentionally rejected.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: '#7c3aed', marginBottom: '8px' }}>
                <Database size={16} />
                <span>3. Memory Deduplication</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                Similarity checks against past post titles and URLs ensure zero repetition and topic evolution.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: '#059669', marginBottom: '8px' }}>
                <Sparkles size={16} />
                <span>4. Persona Synthesis</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                Drafts authentic post text, detailed selection rationales, and verified source citations in persona voice.
              </p>
            </div>
          </div>
        </div>
      </main>

      <InitAgentModal
        isOpen={isInitModalOpen}
        onClose={() => setIsInitModalOpen(false)}
        onInitAgent={handleInitAgent}
      />
    </div>
  );
}
