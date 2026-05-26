const http = require('http');

const API_URL = 'http://localhost:3000/api/posts/cursor-feed';
const ITERATIONS = 10;

async function testFeedSpeed() {
  console.log(`Starting feed speed test (${ITERATIONS} iterations)...`);
  
  const results = [];
  
  for (let i = 0; i < ITERATIONS; i++) {
    const start = Date.now();
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(API_URL, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => resolve(data));
        });
        req.on('error', (err) => reject(err));
      });
      const end = Date.now();
      results.push(end - start);
      console.log(`Iteration ${i + 1}: ${end - start}ms`);
    } catch (err) {
      console.error(`Iteration ${i + 1} failed: ${err.message}`);
    }
  }
  
  const avg = results.reduce((a, b) => a + b, 0) / results.length;
  const p95 = results.sort((a, b) => a - b)[Math.floor(results.length * 0.95)];
  
  console.log('\nResults:');
  console.log(`Average: ${avg.toFixed(2)}ms`);
  console.log(`P95: ${p95}ms`);
}

testFeedSpeed();
