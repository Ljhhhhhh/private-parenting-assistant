#!/usr/bin/env node

// This is a JavaScript wrapper for claude-bridge to fix the shell script execution issue
import { spawn } from 'child_process';
import path from 'path';

// Get the paths
const nvmPath = '/Users/pipilu/.nvm/versions/node/v20.14.0';
const claudeBridgePath = `${nvmPath}/bin/claude-bridge`;

// Pass all arguments to claude-bridge
const args = process.argv.slice(2);

console.log('Launching claude-bridge with proper environment...');

// Launch the bridge with the proper environment
const claudeBridge = spawn(claudeBridgePath, args, {
  stdio: 'inherit',
  env: process.env
});

// Handle exit
claudeBridge.on('exit', (code) => {
  process.exit(code);
});

// Handle errors
claudeBridge.on('error', (err) => {
  console.error('Failed to start claude-bridge:', err);
  process.exit(1);
});

