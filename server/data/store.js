const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

// Initialize store file if it does not exist
function initStore() {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      agents: {},
      feeds: {},
      rejections: {},
      memory: {}
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

function readStore() {
  initStore();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading store DB:', err);
    return { agents: {}, feeds: {}, rejections: {}, memory: {} };
  }
}

function writeStore(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing store DB:', err);
  }
}

function getAgent(agentId) {
  const store = readStore();
  return store.agents[agentId] || null;
}

function saveAgent(agent) {
  const store = readStore();
  store.agents[agent.id] = agent;
  if (!store.feeds[agent.id]) store.feeds[agent.id] = [];
  if (!store.rejections[agent.id]) store.rejections[agent.id] = [];
  if (!store.memory[agent.id]) store.memory[agent.id] = { publishedTopics: [], concepts: [], sourceHistory: [] };
  writeStore(store);
}

function getFeed(agentId) {
  const store = readStore();
  return store.feeds[agentId] || [];
}

function addPostToFeed(agentId, post) {
  const store = readStore();
  if (!store.feeds[agentId]) {
    store.feeds[agentId] = [];
  }
  // Store newest first or sort reverse-chronological
  store.feeds[agentId].unshift(post);
  writeStore(store);
}

function getRejections(agentId) {
  const store = readStore();
  return store.rejections[agentId] || [];
}

function addRejection(agentId, rejection) {
  const store = readStore();
  if (!store.rejections[agentId]) {
    store.rejections[agentId] = [];
  }
  store.rejections[agentId].unshift(rejection);
  // Keep last 50 rejections
  if (store.rejections[agentId].length > 50) {
    store.rejections[agentId] = store.rejections[agentId].slice(0, 50);
  }
  writeStore(store);
}

function getAgentMemory(agentId) {
  const store = readStore();
  return store.memory[agentId] || { publishedTopics: [], concepts: [], sourceHistory: [] };
}

function updateAgentMemory(agentId, memoryData) {
  const store = readStore();
  store.memory[agentId] = memoryData;
  writeStore(store);
}

function getAllAgents() {
  const store = readStore();
  return Object.values(store.agents || {});
}

module.exports = {
  initStore,
  getAgent,
  saveAgent,
  getFeed,
  addPostToFeed,
  getRejections,
  addRejection,
  getAgentMemory,
  updateAgentMemory,
  getAllAgents
};
