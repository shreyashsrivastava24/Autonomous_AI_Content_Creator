const axios = require('axios');

async function testApi() {
  const BASE_URL = 'http://localhost:3000';
  console.log('Testing Autonomous AI Creator API...');

  try {
    // 1. Test POST /api/agent/init
    console.log('\n1. Testing POST /api/agent/init...');
    const initRes = await axios.post(`${BASE_URL}/api/agent/init`, {
      persona: {
        name: 'Ada',
        domain: 'AI Security'
      }
    });

    console.log('Init Response Status:', initRes.status);
    console.log('Init Response Data:', initRes.data);

    const agentId = initRes.data.agentId;
    if (!agentId) throw new Error('No agentId returned!');

    // 2. Test GET /api/agent/feed?agentId=...
    console.log(`\n2. Testing GET /api/agent/feed?agentId=${agentId}...`);
    const feedRes = await axios.get(`${BASE_URL}/api/agent/feed?agentId=${agentId}`);

    console.log('Feed Response Status:', feedRes.status);
    console.log('Feed Posts Count:', feedRes.data.posts ? feedRes.data.posts.length : 0);

    if (feedRes.data.posts && feedRes.data.posts.length > 0) {
      const firstPost = feedRes.data.posts[0];
      console.log('\nSample Post Structure:');
      console.log(' - ID:', firstPost.id);
      console.log(' - CreatedAt:', firstPost.createdAt);
      console.log(' - Text:', firstPost.text.substring(0, 100) + '...');
      console.log(' - Rationale:', firstPost.rationale.substring(0, 100) + '...');
      console.log(' - Sources:', firstPost.sources);
    }

    console.log('\nAPI Test Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('API Test Failed:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

// Run test after small delay
setTimeout(testApi, 1000);
