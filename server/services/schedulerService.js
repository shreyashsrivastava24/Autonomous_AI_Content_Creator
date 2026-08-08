const store = require('../data/store');
const discoveryService = require('./discoveryService');
const editorialService = require('./editorialService');
const personaService = require('./personaService');
const memoryService = require('./memoryService');

// Map of active background intervals by agentId
const activeIntervals = new Map();

/**
 * Execute one autonomous publishing cycle for an agent
 */
async function runAutonomousCycle(agentId) {
  const agent = store.getAgent(agentId);
  if (!agent) {
    console.warn(`[Scheduler] Agent ${agentId} not found. Stopping timer.`);
    stopAgentScheduler(agentId);
    return null;
  }

  console.log(`[Scheduler] Running autonomous cycle for agent '${agent.persona.name}' (${agentId})...`);

  try {
    // 1. Topic Discovery
    const discoveredCandidates = await discoveryService.discoverTopics();
    console.log(`[Scheduler] Discovered ${discoveredCandidates.length} potential topics.`);

    // 2. Memory Context
    const memory = memoryService.getMemory(agentId);

    // 3. Editorial Judgment & Scoring
    const { winningTopic, rejectedCandidates } = editorialService.evaluateEditorialCandidates(
      discoveredCandidates,
      agent.persona,
      memory
    );

    // Log all rejected candidates for evaluation auditability
    rejectedCandidates.forEach(rej => {
      store.addRejection(agentId, rej);
    });

    if (!winningTopic) {
      console.log(`[Scheduler] No topic passed editorial quality threshold in this cycle. ${rejectedCandidates.length} candidate(s) rejected.`);
      return { published: false, rejectedCount: rejectedCandidates.length };
    }

    console.log(`[Scheduler] Topic selected: '${winningTopic.candidate.title}' (Score: ${winningTopic.compositeScore}/100)`);

    // 4. Generate Persona Post & Rationale
    const { post, extractedConcepts } = await personaService.generatePersonaPost(
      agent.persona,
      winningTopic,
      rejectedCandidates,
      agentId
    );

    // 5. Save Post to Feed
    store.addPostToFeed(agentId, post);

    // 6. Record to Agent Memory
    memoryService.recordPublication(agentId, post, winningTopic.candidate, extractedConcepts);

    console.log(`[Scheduler] Successfully published post '${post.id}' for agent ${agentId}.`);
    return { published: true, post, rejectedCount: rejectedCandidates.length };
  } catch (err) {
    console.error(`[Scheduler] Error in autonomous cycle for agent ${agentId}:`, err);
    return { published: false, error: err.message };
  }
}

/**
 * Start autonomous scheduler for an agent
 */
function startAgentScheduler(agentId, intervalMs = 120000) {
  // Clear existing interval if present
  if (activeIntervals.has(agentId)) {
    clearInterval(activeIntervals.get(agentId));
  }

  // Set periodic background interval
  const intervalHandle = setInterval(() => {
    runAutonomousCycle(agentId);
  }, intervalMs);

  activeIntervals.set(agentId, intervalHandle);
  console.log(`[Scheduler] Autonomous publishing active for agent ${agentId} (Interval: ${intervalMs / 1000}s)`);
}

/**
 * Stop agent scheduler
 */
function stopAgentScheduler(agentId) {
  if (activeIntervals.has(agentId)) {
    clearInterval(activeIntervals.get(agentId));
    activeIntervals.delete(agentId);
    console.log(`[Scheduler] Autonomous publishing stopped for agent ${agentId}`);
  }
}

/**
 * Restore schedulers on server restart
 */
function restoreAllSchedulers() {
  const agents = store.getAllAgents();
  agents.forEach(agent => {
    startAgentScheduler(agent.id, agent.intervalMs || 120000);
  });
}

module.exports = {
  runAutonomousCycle,
  startAgentScheduler,
  stopAgentScheduler,
  restoreAllSchedulers
};
