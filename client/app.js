// Simple entry point for Replit deployment
const { exec } = require('child_process');

console.log('🚀 Starting MarketPace Clean Server...');
console.log('🔧 Deployment entry point active');

// Start the server
const server = exec('npx tsx server/clean-server.ts', (error, stdout, stderr) => {
  if (error) {
    console.error('Error starting server:', error);
    return;
  }
  console.log(stdout);
  if (stderr) console.error(stderr);
});

server.stdout.on('data', (data) => {
  console.log(data.toString());
});

server.stderr.on('data', (data) => {
  console.error(data.toString());
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});