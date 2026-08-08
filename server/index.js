require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const store = require('./data/store');
const schedulerService = require('./services/schedulerService');
const memoryService = require('./services/memoryService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data store
store.initStore();

/**
 * 1. MANDATORY ENDPOINT: Initialize Agent
 * POST /api/agent/init
 */
app.post('/api/agent/init', async (req, res) => {
  try {
    const { persona, intervalMinutes } = req.body || {};

    if (!persona || !persona.name) {
      return res.status(400).json({ error: 'Invalid persona payload. "name" is required.' });
    }

    // Prevent duplicate agents with same name or domain
    const existingAgents = store.getAllAgents();
    const existing = existingAgents.find(a =>
      a.persona.name.toLowerCase() === persona.name.toLowerCase() ||
      (persona.domain && a.persona.domain.toLowerCase() === persona.domain.toLowerCase())
    );

    if (existing) {
      return res.status(200).json({ agentId: existing.id });
    }

    const agentId = `agent-${uuidv4().substring(0, 8)}`;
    const intervalMs = (intervalMinutes || 2) * 60 * 1000; // Default 2 minutes interval

    const agent = {
      id: agentId,
      persona: {
        name: persona.name,
        domain: persona.domain || 'AI & Technology'
      },
      createdAt: new Date().toISOString(),
      intervalMs
    };

    // Save agent
    store.saveAgent(agent);

    // Immediately trigger initial autonomous cycle so feed has a post right away
    await schedulerService.runAutonomousCycle(agentId);

    // Start background autonomous scheduler
    schedulerService.startAgentScheduler(agentId, intervalMs);

    return res.status(200).json({
      agentId
    });
  } catch (err) {
    console.error('Error initializing agent:', err);
    return res.status(500).json({ error: 'Internal server error during agent initialization' });
  }
});

/**
 * 2. MANDATORY ENDPOINT: Retrieve Feed
 * GET /api/agent/feed?agentId=abc-123
 */
app.get('/api/agent/feed', (req, res) => {
  try {
    const agentId = req.query.agentId;
    if (!agentId) {
      return res.status(400).json({ error: 'Query parameter agentId is required', posts: [] });
    }

    const posts = store.getFeed(agentId);
    
    // Ensure reverse chronological order (newest first)
    const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      posts: sortedPosts
    });
  } catch (err) {
    console.error('Error retrieving feed:', err);
    return res.status(500).json({ posts: [] });
  }
});

// Auxiliary API Endpoints for Dashboard

// Get list of all agents
app.get('/api/agents', (req, res) => {
  const agents = store.getAllAgents();
  res.json({ agents });
});

// Get rejected editorial candidates log
app.get('/api/agent/rejections', (req, res) => {
  const agentId = req.query.agentId;
  if (!agentId) return res.status(400).json({ error: 'agentId required' });
  const rejections = store.getRejections(agentId);
  res.json({ rejections });
});

// Get agent memory details
app.get('/api/agent/memory', (req, res) => {
  const agentId = req.query.agentId;
  if (!agentId) return res.status(400).json({ error: 'agentId required' });
  const memory = memoryService.getMemory(agentId);
  res.json({ memory });
});

// Trigger immediate cycle on demand
app.post('/api/agent/trigger', async (req, res) => {
  const { agentId } = req.body || {};
  if (!agentId) return res.status(400).json({ error: 'agentId required' });
  const result = await schedulerService.runAutonomousCycle(agentId);
  res.json({ success: true, result });
});

// Serve frontend static files if built
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  const indexPath = path.join(clientBuildPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Autonomous AI Creator API server running. Frontend client build not found.');
  }
});

// Start express server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` Autonomous AI Creator API Server running on port ${PORT}`);
  console.log(` - POST /api/agent/init`);
  console.log(` - GET  /api/agent/feed?agentId=<id>`);
  const buildExists = require('fs').existsSync(path.join(clientBuildPath, 'index.html'));
  console.log(` - Client Build: ${buildExists ? 'FOUND (' + clientBuildPath + ')' : 'NOT FOUND'}`);
  console.log(`=================================================`);

  // Restore background schedulers for existing agents on server boot
  schedulerService.restoreAllSchedulers();
});
