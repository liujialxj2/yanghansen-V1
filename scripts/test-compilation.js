#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🧪 Testing compilation...');

const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'pipe',
  shell: true
});

let hasError = false;

buildProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  if (output.includes('Compiled successfully')) {
    console.log('\n✅ Compilation successful!');
  }
});

buildProcess.stderr.on('data', (data) => {
  const error = data.toString();
  console.error(error);
  hasError = true;
});

buildProcess.on('close', (code) => {
  if (code === 0 && !hasError) {
    console.log('\n🎉 Build completed successfully!');
    console.log('You can now run: npm run dev');
  } else {
    console.log('\n❌ Build failed. Please check the errors above.');
  }
});
