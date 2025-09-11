#!/usr/bin/env node

/**
 * Script to generate PNG diagrams from Mermaid .mmd files
 * Usage: npm run generate-diagrams
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const DIAGRAMS_DIR = path.join(__dirname, '..', 'diagrams');

// Diagram configurations
const diagrams = [
  {
    input: '01-complete-flow.mmd',
    output: '01-complete-flow.png',
    width: 1920,
    height: 1080,
    description: 'Complete WebSocket Message Processing Flow'
  },
  {
    input: '02-validation-schemas.mmd', 
    output: '02-validation-schemas.png',
    width: 1600,
    height: 800,
    description: 'Zod Validation Schema Architecture'
  },
  {
    input: '03-connection-lifecycle.mmd',
    output: '03-connection-lifecycle.png', 
    width: 1200,
    height: 800,
    description: 'WebSocket Connection Lifecycle'
  },
  {
    input: '04-broadcasting-patterns.mmd',
    output: '04-broadcasting-patterns.png',
    width: 1400,
    height: 1000,
    description: 'Message Broadcasting Patterns'
  },
  {
    input: '05-error-handling.mmd',
    output: '05-error-handling.png',
    width: 1400, 
    height: 900,
    description: 'Error Handling Flow'
  }
];

console.log('🎨 Generating WebSocket Flow Diagrams...\n');

// Check if diagrams directory exists
if (!fs.existsSync(DIAGRAMS_DIR)) {
  console.error(`❌ Diagrams directory not found: ${DIAGRAMS_DIR}`);
  process.exit(1);
}

let successCount = 0;
let failureCount = 0;

// Generate each diagram
for (const diagram of diagrams) {
  const inputPath = path.join(DIAGRAMS_DIR, diagram.input);
  const outputPath = path.join(DIAGRAMS_DIR, diagram.output);
  
  try {
    console.log(`🔄 Generating ${diagram.description}...`);
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }
    
    // Build mermaid command
    const command = `npx mmdc -i "${inputPath}" -o "${outputPath}" -w ${diagram.width} -H ${diagram.height} --backgroundColor white`;
    
    // Execute command
    execSync(command, { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe' // Suppress output for cleaner logging
    });
    
    // Verify output file was created
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`✅ ${diagram.output} (${Math.round(stats.size / 1024)}KB)`);
      successCount++;
    } else {
      throw new Error('Output file was not created');
    }
    
  } catch (error) {
    console.error(`❌ Failed to generate ${diagram.output}:`);
    console.error(`   ${error.message}`);
    failureCount++;
  }
}

// Summary
console.log('\n📊 Generation Summary:');
console.log(`✅ Successfully generated: ${successCount} diagrams`);
console.log(`❌ Failed to generate: ${failureCount} diagrams`);

if (failureCount > 0) {
  console.log('\n💡 Troubleshooting:');
  console.log('   • Ensure @mermaid-js/mermaid-cli is installed: npm install @mermaid-js/mermaid-cli --save-dev');
  console.log('   • Check that .mmd files exist in the diagrams/ directory');
  console.log('   • Verify .mmd files contain valid Mermaid syntax');
  process.exit(1);
}

console.log('\n🎉 All diagrams generated successfully!');
console.log(`📁 Diagrams saved to: ${DIAGRAMS_DIR}`);
