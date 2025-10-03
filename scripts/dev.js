const { spawn } = require('child_process');
const path = require('path');

// Set development environment
process.env.IS_DEV = 'true';
process.env.NODE_ENV = 'development';

console.log('🚀 Starting Nova in development mode...');

// Start Vite dev server
console.log('📦 Starting Vite dev server...');
const vite = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Wait for Vite to start, then compile and start Electron
setTimeout(() => {
  console.log('🔨 Compiling Electron...');
  const tsc = spawn('npx', ['tsc', '-p', 'electron'], {
    stdio: 'inherit',
    shell: true
  });

  tsc.on('close', (code) => {
    if (code === 0) {
      console.log('⚡ Starting Electron...');
      const electron = spawn('npx', ['electron', '.'], {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, IS_DEV: 'true' }
      });

      electron.on('close', () => {
        console.log('👋 Electron closed');
        vite.kill();
        process.exit(0);
      });
    } else {
      console.error('❌ TypeScript compilation failed');
      vite.kill();
      process.exit(1);
    }
  });
}, 3000);

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  vite.kill();
  process.exit(0);
});