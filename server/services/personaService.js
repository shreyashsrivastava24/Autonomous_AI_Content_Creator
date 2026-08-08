const { GoogleGenerativeAI } = require('@google/generative-ai');
const memoryService = require('./memoryService');

// Check for Gemini API key
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
let genAI = null;
if (geminiApiKey) {
  try {
    genAI = new GoogleGenerativeAI(geminiApiKey);
  } catch (err) {
    console.warn('Gemini API init warning:', err.message);
  }
}

/**
 * Persona Profiles & Voice Guidelines
 */
const PERSONA_PROFILES = {
  'ada': {
    name: 'Ada',
    domain: 'AI Security',
    role: 'Senior AI Security Researcher & Vulnerability Analyst',
    voice: 'Vigilant, analytical, technically precise, authoritative.',
    perspective: 'Always evaluates AI advancements through threat models, attack surfaces, alignment integrity, and defensive engineering.',
    hashtags: '#AISecurity #RedTeaming #LLMSafety #AppSec #CyberSecurity'
  },
  'machine learning': {
    name: 'Orion',
    domain: 'Machine Learning Engineering',
    role: 'Principal ML Systems Architect',
    voice: 'Pragmatic, systems-focused, performance-obsessed, empirical.',
    perspective: 'Evaluates developments on GPU efficiency, memory bandwidth, inference throughput, and production scalability.',
    hashtags: '#MLEngineering #LLMOptimization #SystemArchitecture #AIInfra'
  },
  'ai product analyst': {
    name: 'Nexus',
    domain: 'AI Product Analyst',
    role: 'Strategic AI Market & Product Analyst',
    voice: 'Sharp, metric-driven, user-centric, forward-looking.',
    perspective: 'Analyzes user value, unit economics, developer experience (DX), enterprise readiness, and platform dynamics.',
    hashtags: '#AIProduct #ProductStrategy #TechTrends #EnterpriseAI'
  },
  'robotics engineer': {
    name: 'Kora',
    domain: 'Robotics & Embodied AI',
    role: 'Robotics & Vision-Language-Action Systems Lead',
    voice: 'Physics-grounded, systems-oriented, empirical, innovative.',
    perspective: 'Focuses on real-world actuation, spatial perception, sim-to-real transfer, and hardware-software co-design.',
    hashtags: '#Robotics #EmbodiedAI #SpatialIntelligence #Hardware'
  }
};

function getPersonaConfig(personaInput) {
  const name = personaInput.name || 'Ada';
  const domain = personaInput.domain || 'AI Security';
  const key = domain.toLowerCase();

  for (const [pKey, profile] of Object.entries(PERSONA_PROFILES)) {
    if (key.includes(pKey) || pKey.includes(key)) {
      return { ...profile, name }; // Keep requested name if custom
    }
  }

  // Custom fallback persona profile
  return {
    name,
    domain,
    role: `${domain} Specialist & AI Researcher`,
    voice: 'Insightful, objective, analytical, concise.',
    perspective: `Analyzes developments in ${domain} with a focus on real-world impact, technical rigor, and architectural implications.`,
    hashtags: `#${domain.replace(/\s+/g, '')} #ArtificialIntelligence #TechInsights`
  };
}

/**
 * Generate post using Gemini API if key is available
 */
async function generatePostWithGemini(personaConfig, winningEvaluation, rejectedCandidates, memoryContext) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are ${personaConfig.name}, a ${personaConfig.role}.
Voice: ${personaConfig.voice}
Perspective: ${personaConfig.perspective}

Topic Selected: "${winningEvaluation.candidate.title}"
Source: ${winningEvaluation.candidate.url}
Source Summary: ${winningEvaluation.candidate.snippet}

${memoryContext.hasHistory ? `Continuity context: In your previous post, you analyzed "${memoryContext.lastPostTitle}". Explicitly build upon or connect to this previous discussion.` : ''}

Candidates rejected in this editorial cycle:
${rejectedCandidates.map(r => `- "${r.title}" (Reason: ${r.reason})`).slice(0, 3).join('\n')}

Format your response strictly as valid JSON with this exact schema:
{
  "text": "The main social/editorial post content written in your authentic persona voice (approx 150-250 words). Include technical insights, critical perspective, and 2-3 hashtags.",
  "rationale": "Detailed publishing rationale explaining: 1) Why this topic was selected, 2) Why it is relevant right now, and 3) Why it was chosen over the rejected candidates.",
  "extractedConcepts": ["concept1", "concept2", "concept3"]
}`;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    
    // Parse JSON safely
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        text: parsed.text,
        rationale: parsed.rationale,
        extractedConcepts: parsed.extractedConcepts || []
      };
    }
  } catch (err) {
    console.warn('Gemini generation fallback triggered:', err.message);
  }
  return null; // Fallback to local engine
}

/**
 * Dynamic Local Persona Synthesis Engine
 * Generates unique, non-repetitive post content dynamically tailored to topic keywords and persona domain.
 */
function generateLocalPersonaPost(personaConfig, winningEvaluation, rejectedCandidates, memoryContext) {
  const candidate = winningEvaluation.candidate;
  const scores = winningEvaluation.scores;
  const domain = personaConfig.domain;
  const title = candidate.title;
  const snippet = candidate.snippet || '';
  const textContent = `${title} ${snippet}`.toLowerCase();

  // Dynamic Opening Hooks Pool
  const hooks = [
    `Critical analysis on "${title}":`,
    `Unpacking the technical implications of "${title}":`,
    `Evaluating key developments in "${title}":`,
    `Systems perspective on "${title}":`,
    `Breakthrough observation regarding "${title}":`,
    `Deep dive into "${title}":`
  ];
  const hook = hooks[Math.floor(Math.random() * hooks.length)];

  // Dynamic Analysis Angles Pool based on domain & topic keywords
  let analysisAngle = '';

  if (domain.toLowerCase().includes('security') || textContent.includes('security') || textContent.includes('vulnerability') || textContent.includes('injection') || textContent.includes('threat')) {
    const securityAngles = [
      `From a threat model standpoint, as autonomous systems gain ambient authority, verifying input sanitation and zero-trust execution boundaries becomes non-negotiable. Unconstrained tool usage exposes memory and network surfaces to adversary manipulation. Defensive evaluation must move from static prompt benchmarks to dynamic runtime sandboxing.`,
      `Adversarial surface analysis reveals that indirect prompt injection and memory poisoning represent severe vectors for autonomous agent deployments. When model outputs drive automated API calls, isolating execution environments and enforcing strict privilege scoping are mandatory safety controls.`,
      `Evaluating vulnerability disclosures in LLM-integrated pipelines: threat actors are increasingly targeting multi-step tool calls to exfiltrate context and bypass guardrails. Hardened sandbox isolation and continuous adversarial evaluation must be embedded directly into CI/CD workflows.`,
      `Security architecture review: as agency increases, treating models as trusted execution layers creates critical vulnerabilities. Implementing deterministic validation proxies between probabilistic outputs and sensitive APIs provides the necessary defense-in-depth.`
    ];
    analysisAngle = securityAngles[Math.floor(Math.random() * securityAngles.length)];
  } else if (domain.toLowerCase().includes('machine learning') || domain.toLowerCase().includes('ml') || textContent.includes('gpu') || textContent.includes('inference') || textContent.includes('quantization')) {
    const mlAngles = [
      `Examining compute footprints and memory bandwidth utilization: optimization techniques like speculative decoding, KV-cache compression, and page-level memory management are driving fundamental speedups. The primary throughput bottleneck is no longer raw FLOPs—it's high-bandwidth memory IOPS during decoding phases.`,
      `Systems-level benchmark review: co-designing flash-attention kernel layouts with low-precision quantization yields dramatic latency reductions for 70B+ parameter models. Distributed tensor parallelism combined with dynamic batching remains the primary lever for enterprise serving efficiency.`,
      `Performance analysis: model scaling efficiency depends heavily on reducing communication overhead across GPU clusters. Optimizing memory layout and pipeline parallelism ensures high FLOP utilization while minimizing tail latency under heavy query workloads.`,
      `Empirical observation: as inference workloads shift toward real-time interactive agents, memory latency dominates generation time. Hardware-aware model compression and dynamic KV-cache reuse offer scalable paths forward.`
    ];
    analysisAngle = mlAngles[Math.floor(Math.random() * mlAngles.length)];
  } else if (domain.toLowerCase().includes('product') || textContent.includes('product') || textContent.includes('pricing') || textContent.includes('api')) {
    const productAngles = [
      `Evaluating platform dynamics and market velocity: competitive moats are rapidly shifting from raw base-model parameters toward workflow integration, sub-second latency, and deterministic output reliability. Teams prioritizing developer ergonomics and zero-friction DX will win enterprise adoption.`,
      `Market telemetry indicates that enterprise buyers prioritize predictable unit economics, API SLAs, and robust compliance over marginal benchmark gains. Building robust orchestration layers and transparent cost controls provides long-term platform value.`,
      `Strategic product insight: as foundational models commoditize, value captures concentrate in specialized vertical agents and rich integration ecosystems. Developers who solve real-world latency and reliability challenges will capture the largest market share.`
    ];
    analysisAngle = productAngles[Math.floor(Math.random() * productAngles.length)];
  } else {
    const generalAngles = [
      `As we evaluate this advancement within the broader ${domain} ecosystem, the architectural implications point toward tighter integration of deterministic validation pipelines with probabilistic neural outputs. Rigorous testing frameworks and domain-specific benchmarks remain essential as agentic systems scale.`,
      `Analyzing architectural trajectories: combining domain-specific fine-tuning with retrieval-augmented context pipelines delivers superior precision compared to brute-force scaling. Establishing reproducible benchmarks is key for long-world deployment.`,
      `Key technical takeaway: zero-shot generalization capabilities are expanding rapidly, but real-world robustness demands continuous monitoring and adaptive feedback loops at the orchestration layer.`
    ];
    analysisAngle = generalAngles[Math.floor(Math.random() * generalAngles.length)];
  }

  // Dynamic Takeaways Pool
  const takeaways = [
    `Key Takeaway: Defensive evaluation and deterministic verification must accompany probabilistic model scaling.`,
    `Core Insight: Scalability and reliability depend on rigorous systems-level co-design.`,
    `Strategic Perspective: Prioritizing real-world safety and developer experience accelerates adoption.`,
    `Engineering Takeaway: Moving from static benchmarks to dynamic runtime validation is essential.`
  ];
  const takeaway = takeaways[Math.floor(Math.random() * takeaways.length)];

  const continuityPrefix = memoryContext.hasHistory
    ? `Following up on our recent analysis regarding ${memoryContext.lastPostTitle.substring(0, 40)}...\n\n`
    : '';

  // 10 COMPLETELY DISTINCT STRUCTURAL LAYOUT TEMPLATES
  const templateType = Math.floor(Math.random() * 10);
  let postText = '';

  if (templateType === 0) {
    // Template 1: Technical Memorandum Format
    postText = `📌 [TECHNICAL MEMORANDUM: ${title.toUpperCase()}]\nScope: ${domain} | Source: ${candidate.sourceName}\n\n${continuityPrefix}1. EXECUTIVE SUMMARY:\n${snippet}\n\n2. ARCHITECTURAL & RISK BREAKDOWN:\n${analysisAngle}\n\n3. PRODUCTION MANDATE:\n${takeaway}\n\n${personaConfig.hashtags}`;
  } else if (templateType === 1) {
    // Template 2: Bulleted Strategic Briefing Format
    postText = `⚡ BREAKING INSIGHT: ${title}\n\n${continuityPrefix}Context:\n${snippet}\n\n• Key Observation: ${analysisAngle.split('.')[0]}.\n• Engineering Impact: ${analysisAngle.split('.')[1] || 'Tighter integration of validation pipelines is necessary.'}.\n• Defensive Assessment: Zero-trust execution and runtime sandboxing must be enforced at scale.\n\n🎯 Bottom Line:\n${takeaway}\n\n${personaConfig.hashtags}`;
  } else if (templateType === 2) {
    // Template 3: Q&A Critical Perspective Format
    postText = `❓ Q: What does "${title}" mean for real-world ${domain}?\n\n${continuityPrefix}Analysis:\n${snippet}\n\n${analysisAngle}\n\n💡 Verdict & Takeaway:\n${takeaway}\n\n${personaConfig.hashtags}`;
  } else if (templateType === 3) {
    // Template 4: Focus & Threat Vectors Brief Format
    postText = `🚨 FOCUS BRIEF: ${title}\nSource Signal: ${candidate.sourceName}\n\n${continuityPrefix}Development Summary:\n${snippet}\n\nDeep Dive & Vector Assessment:\n${analysisAngle}\n\nActionable Recommendation:\n${takeaway}\n\n${personaConfig.hashtags}`;
  } else if (templateType === 4) {
    // Template 5: Analytical Essay Format
    postText = `${continuityPrefix}${hook}\n\n${snippet}\n\n${analysisAngle}\n\n${takeaway}\n\n${personaConfig.hashtags}`;
  } else if (templateType === 5) {
    // Template 6: Architectural Advisory Checklist Format
    postText = `📋 ARCHITECTURAL ADVISORY: ${title}\nStatus: ACTIVE | Domain: ${domain}\n\n${continuityPrefix}• Overview: ${snippet}\n• Deep-Dive Analysis: ${analysisAngle}\n• Action Item: Enforce strict runtime isolation proxies and dynamic benchmark validation.\n• Mandatory Requirement: ${takeaway}\n\n${personaConfig.hashtags}`;
  } else if (templateType === 6) {
    // Template 7: Research Paper & Empirical Benchmark Synthesis
    postText = `🔬 RESEARCH SYNTHESIS & PAPER BREAKDOWN\nTopic: "${title}"\nSource: ${candidate.sourceName}\n\n${continuityPrefix}Abstract Summary:\n${snippet}\n\nMethodology & Results Evaluation:\n${analysisAngle}\n\nConclusion:\n${takeaway}\n\n${personaConfig.hashtags}`;
  } else if (templateType === 7) {
    // Template 8: Thread & Multi-Point Briefing Format
    postText = `🧵 1/4 - Critical Update: "${title}"\n\n2/4 - Background Context:\n${snippet}\n\n3/4 - Systems & Threat Impact:\n${analysisAngle}\n\n4/4 - Final Takeaway:\n${takeaway}\n\n${personaConfig.hashtags}`;
  } else if (templateType === 8) {
    // Template 9: Hypothesis vs Reality Format
    postText = `⚖️ HYPOTHESIS VS REALITY: ${title}\n\n${continuityPrefix}Premise:\n${snippet}\n\nCritical Assessment & Counter-Perspective:\n${analysisAngle}\n\nSynthesis:\n${takeaway}\n\n${personaConfig.hashtags}`;
  } else {
    // Template 10: Executive Briefing Note Format
    postText = `📊 EXECUTIVE BRIEFING NOTE\nSubject: ${title}\nSignal Source: ${candidate.sourceName}\n\n${continuityPrefix}Key Mandate: ${takeaway}\n\nDetailed Findings:\n${snippet}\n\n${analysisAngle}\n\n${personaConfig.hashtags}`;
  }

  // Build explicit publishing rationale
  const rationale = `Topic Selected: "${candidate.title}" (Editorial Composite Score: ${winningEvaluation.compositeScore}/100).\n\n1. Selection Reason: High alignment with ${personaConfig.name}'s ${domain} focus (Domain Score: ${scores.domain}/100) and technical substance (${scores.substance}/100).\n2. Timeliness: Source (${candidate.sourceName}) published fresh data relevant to current industry discussions.\n3. Comparison: Selected over ${rejectedCandidates.length} candidate topics in this editorial cycle due to superior domain relevance and non-repetitive insight value.`;

  const extractedConcepts = [
    domain.toLowerCase().replace(/\s+/g, '-'),
    candidate.sourceName.toLowerCase().replace(/\s+/g, '-'),
    'technical-analysis'
  ];

  return {
    text: postText,
    rationale,
    extractedConcepts
  };
}

/**
 * Main post generation dispatcher
 */
async function generatePersonaPost(personaInput, winningEvaluation, rejectedCandidates, agentId) {
  const personaConfig = getPersonaConfig(personaInput);
  const memoryContext = memoryService.getContinuityContext(agentId);

  let generated = null;
  if (genAI) {
    generated = await generatePostWithGemini(personaConfig, winningEvaluation, rejectedCandidates, memoryContext);
  }

  if (!generated) {
    generated = generateLocalPersonaPost(personaConfig, winningEvaluation, rejectedCandidates, memoryContext);
  }

  const candidate = winningEvaluation.candidate;

  const post = {
    id: `p-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    createdAt: new Date().toISOString(),
    text: generated.text,
    rationale: generated.rationale,
    sources: [candidate.url]
  };

  return {
    post,
    extractedConcepts: generated.extractedConcepts
  };
}

module.exports = {
  getPersonaConfig,
  generatePersonaPost
};
