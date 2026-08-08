const axios = require('axios');

async function testAutonomous() {
  const BASE_URL = 'http://localhost:3000';
  console.log('Testing Autonomous Publishing & Rationale...');

  try {
    const initRes = await axios.post(`${BASE_URL}/api/agent/init`, {
      persona: { name: 'Ada', domain: 'AI Security' },
      intervalMinutes: 0.1 // 6 seconds interval for test
    });
    const agentId = initRes.data.agentId;
    console.log('Agent initialized:', agentId);

    // Initial feed check
    let feedRes = await axios.get(`${BASE_URL}/api/agent/feed?agentId=${agentId}`);
    console.log(`Initial Feed Count: ${feedRes.data.posts.length}`);

    console.log('Waiting 10 seconds for autonomous background loop to publish...');
    await new Promise(r => setTimeout(r, 10000));

    feedRes = await axios.get(`${BASE_URL}/api/agent/feed?agentId=${agentId}`);
    console.log(`Updated Feed Count: ${feedRes.data.posts.length}`);

    if (feedRes.data.posts.length > 1) {
      console.log('SUCCESS: New posts appeared autonomously without additional prompts or API calls!');
      console.log('Newest Post ID:', feedRes.data.posts[0].id);
      console.log('Previous Post ID:', feedRes.data.posts[1].id);
      console.log('Rationale:', feedRes.data.posts[0].rationale.substring(0, 150) + '...');
    }

    process.exit(0);
  } catch (err) {
    console.error('Autonomous Test Error:', err.message);
    process.exit(1);
  }
}

testAutonomous();
