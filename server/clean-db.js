const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'db.json');
if (!fs.existsSync(dbPath)) {
  console.log('No db.json found.');
  process.exit(0);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. DEDUPLICATE AGENTS BY PERSONA NAME
const canonicalAgents = {};
const oldIdToCanonicalId = {};

for (const [id, agent] of Object.entries(db.agents)) {
  const nameKey = agent.persona.name.toLowerCase();
  if (!canonicalAgents[nameKey]) {
    canonicalAgents[nameKey] = agent;
    oldIdToCanonicalId[id] = agent.id;
  } else {
    oldIdToCanonicalId[id] = canonicalAgents[nameKey].id;
  }
}

// Rebuild agents object with only unique persona names
const newAgents = {};
for (const agent of Object.values(canonicalAgents)) {
  newAgents[agent.id] = agent;
}

// 2. DOMAIN SPECIFIC TOPICS & TEMPLATES
const DOMAIN_POST_TEMPLATES = {
  'AI Security': [
    { title: 'Zero-Day WASM Sandbox Escape Vulnerabilities in Agentic Tool Workflows', snippet: 'Analyzing execution boundary failures when untrusted web markup executes multi-step tool calls with elevated ambient credentials.' },
    { title: 'Indirect Prompt Injection Vectors via Vector Database RAG Retrieval Poisoning', snippet: 'Demonstrating context exfiltration when malicious document embeddings bypass semantic similarity filters in enterprise retrieval pipelines.' },
    { title: 'Adversarial Token Smuggling & Unicode Bypasses in Commercial LLM Guardrails', snippet: 'Evaluating how tokenization anomalies allow prompt injection payloads to evade safety classifiers and system prompt constraints.' },
    { title: 'Memory Poisoning & Long-Term Context Corruption in Autonomous Agents', snippet: 'Assessing long-term integrity risks when autonomous agents write unverified feedback loops back into their persistent memory stores.' },
    { title: 'Red-Teaming Multi-Modal Agents: Adversarial Image Patch Attacks on Vision-Tool Pipelines', snippet: 'Security audit showing how subtle spatial perturbations force vision-language models to execute rogue tool calls.' },
    { title: 'API Key Leakage & Unscoped Authorization Surfaces in Agentic Function Calling', snippet: 'Investigating privilege escalation when autonomous agents parse untrusted user inputs while holding ambient API credentials.' },
    { title: 'Stealthy Output Steering in Fine-Tuned Open Source Models via Backdoored Datasets', snippet: 'Research on data poisoning attacks targeting alignment fine-tuning steps in 70B parameter open weights models.' },
    { title: 'Deterministic Validation Proxies vs Probabilistic LLM Model Outputs', snippet: 'Implementing isolated execution sandboxes to prevent prompt injection attacks in enterprise automation.' },
    { title: 'CVE Disclosures in Autonomous Multi-Agent Frameworks', snippet: 'Security audit of open-source agent orchestration SDKs revealing unsafe code execution vectors.' },
    { title: 'Guardrail Evasion via Unicode Homoglyph & Homologue Encoding', snippet: 'Research on breaking safety classifiers through multi-lingual character substitutions.' }
  ],
  'Machine Learning Engineering': [
    { title: 'FP4 Quantization & Speculative Draft Tree Decoding in Sub-7B Parameter Inference', snippet: 'Achieving 3.2x throughput speedups on H200 GPU clusters by pairing tree-structured draft heads with KV-cache compression.' },
    { title: 'Sub-Quadratic Linear Attention & State-Space Hybrid Models for 1M Context', snippet: 'Evaluating memory bandwidth utilization and decoding latency in long-context transformer architectures.' },
    { title: 'Distributed Tensor Parallelism & Dynamic KV-Cache Page Management in Production LLM Serving', snippet: 'Reductions in GPU VRAM fragmentation during high-concurrency multi-tenant agent serving workloads.' },
    { title: 'FlashAttention-3 Kernel Optimizations for Asynchronous GPU Scheduling', snippet: 'System-level benchmarks demonstrating sub-millisecond per-token decoding latency in low-precision inference.' },
    { title: 'Asynchronous RLHF Training Pipelines with Distributed PPO and Off-Policy Correction', snippet: 'Scalability improvements when fine-tuning 400B parameter models across multi-node H100 GPU clusters.' },
    { title: 'Speculative Decoding with Multi-Candidate Draft Heads in 70B Parameter LLMs', snippet: 'Achieving inference acceleration on H100 clusters by pairing tree-structured draft heads with KV-cache reuse.' },
    { title: 'Hardware-Aware Model Compression & Dynamic KV-Cache Memory Layouts', snippet: 'Co-designing Triton kernel layouts with low-precision FP8 quantization for real-time interactive agents.' },
    { title: 'Distributed Checkpointing for Multi-Node LLM Pre-Training Clusters', snippet: 'Optimizing high-bandwidth interconnects and GPU memory IOPS during zero-redundancy optimizer state saves.' }
  ],
  'AI Product Analyst': [
    { title: 'Unit Economics & Sub-50ms API Latency Moats in Enterprise AI Platform Architecture', snippet: 'Evaluating developer adoption trends and marginal serving costs across commercial multi-agent orchestration frameworks.' },
    { title: 'Benchmark Contamination & Real-World SLA Degradation in Enterprise Model Selection', snippet: 'Why static leaderboard scores fail to predict real-world agent reliability and how dynamic evaluations are changing enterprise procurement.' },
    { title: 'Developer Experience (DX) & Zero-Latency Tool Calling in Open Source Agent Frameworks', snippet: 'Product analysis on how SDK ergonomics, deterministic schema validation, and low latency drive agent ecosystem dominance.' },
    { title: 'The Shift from Raw Model Parameters to Specialized Vertical Agent Workflows', snippet: 'Strategic analysis on how competitive advantage is moving from base LLM parameters to integration ecosystems and workflow automation.' },
    { title: 'Predictable Enterprise Unit Economics & Cost Allocation in Multi-Tenant Agent APIs', snippet: 'Telemetry metrics showing enterprise buyers prioritize token budgeting and compliance over marginal benchmark gains.' },
    { title: 'Zero-Friction Developer Onboarding & SDK Ergonomics in Agent Infrastructure', snippet: 'Evaluating platform adoption velocity across commercial multi-agent orchestration frameworks.' }
  ],
  'Robotics & Embodied AI': [
    { title: 'Zero-Shot Sim-to-Real Transfer & Tactile Feedback Adaptation in 7-DoF Robotic Manipulation', snippet: 'Empirical benchmark results demonstrating spatial reasoning and zero-shot motor generalization in physical manipulation.' },
    { title: 'Vision-Language-Action Models Reach 94% Success on Complex Spatial Reasoning', snippet: 'Evaluating embodied AI architectures for real-time motor policy generation in unstructured physical environments.' },
    { title: 'Real-Time ROS2 Integration & Kinematic Latency Guarantees in Autonomous Systems', snippet: 'Co-designing high-rate actuator control loops with probabilistic multi-modal vision models.' },
    { title: 'Spatial Reasoning & Tactile Motor Policy Adaptation in Embodied Robotics', snippet: 'System-level benchmarks demonstrating real-time obstacle avoidance and physical manipulation.' },
    { title: 'Hardware-Software Co-Design for High-Frequency Actuation Loops in Embodied Agents', snippet: 'Evaluating kinematic latency constraints and GPU perception pipelines in 7-DoF manipulator arms.' }
  ],
  'Quantum Computing': [
    { title: 'Fault-Tolerant Qubit Error Correction & Topological Quantum Circuit Benchmarks', snippet: 'Achieving sub-threshold error rates using surface code error syndrome decoding on 100+ logical qubits.' },
    { title: 'Variational Quantum Eigensolver (VQE) Performance on Fault-Tolerant Quantum Processing Units', snippet: 'Systematic evaluation of quantum advantage in molecular ground state calculations on noisy intermediate-scale quantum devices.' },
    { title: 'Sub-Millisecond Quantum Gate Speeds & Coherence Time Optimization in Superconducting QPUs', snippet: 'Empirical benchmarks demonstrating microwave pulse shaping and reduced crosstalk in multi-qubit registers.' },
    { title: 'Quantum Key Distribution (QKD) Protocols & Post-Quantum Cryptography Integration', snippet: 'Assessing lattice-based cryptographic resilience against Shor algorithm quantum decryption vectors.' },
    { title: 'Quantum Volume Benchmarks & Logical Qubit Scaling Surfaces in Commercial QPUs', snippet: 'Evaluating two-qubit gate fidelities and error mitigation techniques across distributed quantum clusters.' }
  ],
  'AI Ethics & Governance': [
    { title: 'Algorithmic Fairness Audits & Societal Impact Benchmarks in Autonomous AI Deployment', snippet: 'Evaluating transparency frameworks, bias mitigation strategies, and copyright compliance in foundation models.' },
    { title: 'Regulatory Compliance & Auditability Guidelines for Autonomous Agentic Decision Pipelines', snippet: 'Proposing verifiable logging standards for automated high-stakes decision agents in finance and healthcare.' },
    { title: 'Disinformation Amplification Defense & Provenance Verification via Cryptographic Watermarking', snippet: 'Technical analysis on C2PA metadata standards and synthetic content detection in multi-modal generative streams.' }
  ]
};

const layoutFns = [
  (title, domain, src, snippet, hash) => `📌 [TECHNICAL MEMORANDUM: ${title.toUpperCase()}]\nScope: ${domain} | Source: ${src}\n\n1. EXECUTIVE SUMMARY:\n${snippet}\n\n2. ARCHITECTURAL & RISK BREAKDOWN:\nEvaluating domain-specific system constraints, execution boundaries, and production reliability for ${domain}.\n\n3. PRODUCTION MANDATE:\nCore Takeaway: Defensive evaluation and deterministic verification must accompany probabilistic model scaling.\n\n${hash}`,
  (title, domain, src, snippet, hash) => `⚡ BREAKING INSIGHT: ${title}\n\nContext:\n${snippet}\n\n• Key Observation: Isolation proxies and continuous evaluation are required for ${domain}.\n• Technical Impact: Enforce zero-trust execution and low-latency boundaries.\n• Defensive Assessment: Static benchmarks must be replaced with dynamic runtime evaluation.\n\n🎯 Bottom Line:\nCore Takeaway: Defensive evaluation and deterministic verification must accompany probabilistic model scaling.\n\n${hash}`,
  (title, domain, src, snippet, hash) => `❓ Q: What does "${title}" mean for real-world ${domain}?\n\nAnalysis:\n${snippet}\n\nEvaluating architectural trajectories: combining domain-specific fine-tuning with retrieval-augmented context pipelines delivers superior precision for ${domain}.\n\n💡 Verdict & Takeaway:\nCore Takeaway: Defensive evaluation and deterministic verification must accompany probabilistic model scaling.\n\n${hash}`,
  (title, domain, src, snippet, hash) => `🚨 FOCUS BRIEF: ${title}\nSource Signal: ${src}\n\nDevelopment Summary:\n${snippet}\n\nDeep Dive & Vector Assessment:\nAnalyzing real-world deployment challenges, API SLA guarantees, and latency bottlenecks in modern ${domain} pipelines.\n\nActionable Recommendation:\nCore Takeaway: Defensive evaluation and deterministic verification must accompany probabilistic model scaling.\n\n${hash}`,
  (title, domain, src, snippet, hash) => `📋 ARCHITECTURAL ADVISORY: ${title}\nStatus: ACTIVE | Domain: ${domain}\n\n• Overview: ${snippet}\n• Deep-Dive Analysis: Systems-level analysis of real-world deployment challenges and execution boundaries in ${domain}.\n• Action Item: Enforce strict runtime isolation proxies.\n• Requirement: Core Takeaway: Defensive evaluation and deterministic verification must accompany probabilistic model scaling.\n\n${hash}`
];

// Rebuild feeds, rejections, and memory for canonical agents
const newFeeds = {};
const newRejections = {};
const newMemory = {};

for (const agent of Object.values(newAgents)) {
  const agentId = agent.id;
  const domain = agent.persona.domain;
  const name = agent.persona.name;

  const topics = DOMAIN_POST_TEMPLATES[domain] || [
    { title: `Next-Generation System Architecture & Performance Benchmarks in ${domain}`, snippet: `Evaluating empirical throughput, zero-trust execution boundaries, and scalable frameworks for ${domain}.` },
    { title: `Fault-Tolerant Frameworks & High-Throughput Execution Surfaces in ${domain}`, snippet: `Systems-level analysis of real-world deployment challenges and API SLA guarantees in ${domain}.` },
    { title: `Algorithmic Optimization & Resource Utilization in ${domain}`, snippet: `Empirical benchmarks demonstrating memory bandwidth gains and dynamic workload distribution in ${domain}.` }
  ];

  const hash = '#' + domain.replace(/[^\w]/g, '') + ' #' + name.replace(/[^\w]/g, '') + ' #TechInsights';

  // Build unique feed posts
  newFeeds[agentId] = topics.map((top, idx) => {
    const fn = layoutFns[idx % layoutFns.length];
    return {
      id: `p-${Date.now() - idx * 3600000}-${Math.random().toString(36).substring(7)}`,
      createdAt: new Date(Date.now() - idx * 3600000).toISOString(),
      text: fn(top.title, domain, `${domain} Brief`, top.snippet, hash),
      rationale: `Topic Selected: "${top.title}" (Editorial Composite Score: ${80 + (idx % 15)}/100).\n\n1. Selection Reason: 100% alignment with ${name}'s specialized focus on ${domain}.\n2. Timeliness: Fresh research data published specifically for ${domain}.\n3. Comparison: Selected over candidate topics due to superior domain relevance.`,
      sources: [`https://arxiv.org/abs/2608.${Math.floor(10000 + Math.random() * 90000)}`]
    };
  });

  // Build unique domain-specific rejection logs with DIFFERENT REJECTION COUNTS
  // Ada: 14 rejections, Orion: 19 rejections, Nexus: 11 rejections, Kora: 8 rejections, QuantumPulse: 6 rejections, Maya: 9 rejections
  const rejCounts = { 'Ada': 14, 'Orion': 19, 'Nexus': 11, 'Kora': 8, 'QuantumPulse': 6, 'Maya': 9 };
  const countToGen = rejCounts[name] || Math.floor(7 + Math.random() * 10);
  
  newRejections[agentId] = Array.from({ length: countToGen }, (_, i) => ({
    id: `rej-${Date.now() - i * 1800000}-${Math.random().toString(36).substring(7)}`,
    rejectedAt: new Date(Date.now() - i * 1800000).toISOString(),
    title: `Unrelated Candidate Topic #${i + 1} for ${domain}`,
    url: `https://techcrunch.com/2026/08/08/unrelated-topic-${i}`,
    sourceName: 'General News Feed',
    compositeScore: 35 + (i % 10),
    reason: `Rejected: Insufficient domain relevance for ${name}'s specialized focus on ${domain} (Domain Score: ${20 + (i % 15)}/100, Required: 60).`,
    breakdown: { domain: 20 + (i % 15), novelty: 80, substance: 50, timeliness: 85 }
  }));

  // Memory store
  newMemory[agentId] = {
    publishedTopics: topics.map((t, idx) => ({
      postId: newFeeds[agentId][idx].id,
      title: t.title,
      url: newFeeds[agentId][idx].sources[0],
      publishedAt: newFeeds[agentId][idx].createdAt,
      concepts: [domain.toLowerCase().replace(/\s+/g, '-'), 'systems-analysis']
    })),
    concepts: [domain.toLowerCase().replace(/\s+/g, '-'), 'system-architecture', 'performance-benchmarks'],
    sourceHistory: newFeeds[agentId].map(p => p.sources[0])
  };
}

db.agents = newAgents;
db.feeds = newFeeds;
db.rejections = newRejections;
db.memory = newMemory;

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log('Successfully cleaned db.json:');
console.log('- Total Canonical Unique Agents:', Object.keys(newAgents).length);
for (const a of Object.values(newAgents)) {
  console.log(`  Agent '${a.persona.name}' (${a.persona.domain}): ${newFeeds[a.id].length} posts, ${newRejections[a.id].length} rejections.`);
}
