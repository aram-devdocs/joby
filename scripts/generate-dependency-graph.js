#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Find all package.json files in the monorepo
function findPackageJsonFiles() {
  return glob.sync('**/package.json', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    cwd: path.resolve(__dirname, '..'),
  });
}

// Parse package.json and extract relevant info
function parsePackageInfo(filePath) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const pkg = JSON.parse(content);

  if (!pkg.name) return null;

  return {
    name: pkg.name,
    path: path.dirname(filePath),
    dependencies: {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    },
    type: filePath.startsWith('apps/') ? 'app' : 'package',
  };
}

// Analyze and organize packages into layers
function organizeLayers(packages) {
  const layers = {
    apps: [],
    ui: [],
    services: [],
    core: [],
    config: [],
  };

  packages.forEach((pkg) => {
    if (pkg.type === 'app') {
      layers.apps.push(pkg);
    } else if (
      pkg.name.includes('config') ||
      pkg.name.includes('prettier') ||
      pkg.name.includes('eslint') ||
      pkg.name.includes('typescript')
    ) {
      layers.config.push(pkg);
    } else if (pkg.name.includes('@packages/ui')) {
      layers.ui.push(pkg);
    } else if (
      pkg.name.includes('@packages/browser') ||
      pkg.name.includes('@packages/llm')
    ) {
      layers.services.push(pkg);
    } else if (pkg.name.includes('@packages/shared')) {
      layers.core.push(pkg);
    } else {
      // Root package or others - skip joby root
      if (pkg.name !== 'joby') {
        layers.services.push(pkg);
      }
    }
  });

  return layers;
}

// Generate clean Mermaid diagram with better layout
function generateMermaidDiagram(packages) {
  const allPackageNames = packages.map((p) => p.name);
  const layers = organizeLayers(packages);

  // Use flowchart with top-down layout
  let mermaid = 'flowchart TB\n';

  // Style definitions first
  mermaid +=
    '  classDef appStyle fill:#ff6b6b,stroke:#c0392b,stroke-width:3px,color:#fff,font-weight:bold\n';
  mermaid +=
    '  classDef uiStyle fill:#3498db,stroke:#2980b9,stroke-width:2px,color:#fff\n';
  mermaid +=
    '  classDef serviceStyle fill:#2ecc71,stroke:#27ae60,stroke-width:2px,color:#fff\n';
  mermaid +=
    '  classDef coreStyle fill:#e74c3c,stroke:#c0392b,stroke-width:2px,color:#fff\n';
  mermaid +=
    '  classDef configStyle fill:#9b59b6,stroke:#8e44ad,stroke-width:2px,color:#fff\n\n';

  // Define all nodes first with their layer positioning
  const nodeDefinitions = [];
  const styleApplications = [];

  // Layer 1: Applications
  layers.apps.forEach((pkg) => {
    const id = pkg.name.replace(/[@/]/g, '_').replace(/\//g, '_');
    nodeDefinitions.push(`  ${id}["${pkg.name}"]`);
    styleApplications.push(`  ${id}:::appStyle`);
  });

  // Layer 2: UI Components
  layers.ui.forEach((pkg) => {
    const id = pkg.name.replace(/[@/]/g, '_').replace(/\//g, '_');
    nodeDefinitions.push(`  ${id}("${pkg.name}")`);
    styleApplications.push(`  ${id}:::uiStyle`);
  });

  // Layer 3: Services
  layers.services.forEach((pkg) => {
    const id = pkg.name.replace(/[@/]/g, '_').replace(/\//g, '_');
    nodeDefinitions.push(`  ${id}("${pkg.name}")`);
    styleApplications.push(`  ${id}:::serviceStyle`);
  });

  // Layer 4: Core
  layers.core.forEach((pkg) => {
    const id = pkg.name.replace(/[@/]/g, '_').replace(/\//g, '_');
    nodeDefinitions.push(`  ${id}("${pkg.name}")`);
    styleApplications.push(`  ${id}:::coreStyle`);
  });

  // Layer 5: Configuration
  layers.config.forEach((pkg) => {
    const id = pkg.name.replace(/[@/]/g, '_').replace(/\//g, '_');
    nodeDefinitions.push(`  ${id}[/"${pkg.name}"/]`);
    styleApplications.push(`  ${id}:::configStyle`);
  });

  // Add node definitions
  mermaid += nodeDefinitions.join('\n') + '\n\n';

  // Create invisible chain to enforce layer ordering
  const layerChain = [];
  if (layers.apps.length > 0) layerChain.push(layers.apps[0].name);
  if (layers.ui.length > 0) layerChain.push(layers.ui[0].name);
  if (layers.services.length > 0) layerChain.push(layers.services[0].name);
  if (layers.core.length > 0) layerChain.push(layers.core[0].name);
  if (layers.config.length > 0) layerChain.push(layers.config[0].name);

  // Add invisible chain edges
  mermaid += '  %% Invisible edges to enforce layer ordering\n';
  for (let i = 0; i < layerChain.length - 1; i++) {
    const fromId = layerChain[i].replace(/[@/]/g, '_').replace(/\//g, '_');
    const toId = layerChain[i + 1].replace(/[@/]/g, '_').replace(/\//g, '_');
    mermaid += `  ${fromId} -.-> ${toId}\n`;
  }
  mermaid += '\n';

  // Add actual dependencies
  mermaid += '  %% Actual dependencies\n';
  packages.forEach((pkg) => {
    const fromId = pkg.name.replace(/[@/]/g, '_').replace(/\//g, '_');
    Object.keys(pkg.dependencies || {}).forEach((dep) => {
      if (allPackageNames.includes(dep)) {
        const toId = dep.replace(/[@/]/g, '_').replace(/\//g, '_');
        mermaid += `  ${fromId} --> ${toId}\n`;
      }
    });
  });

  mermaid += '\n';

  // Apply styles
  mermaid += styleApplications.join('\n') + '\n';

  // Make invisible edges transparent
  mermaid += '\n  linkStyle 0,1,2,3,4 stroke:transparent,fill:transparent\n';

  return mermaid;
}

// Generate PNG using mermaid-cli
async function generatePNG(mermaidCode) {
  // Check if mermaid-cli is installed globally
  try {
    execSync('mmdc --version', { stdio: 'ignore' });
  } catch {
    console.log('📦 Installing @mermaid-js/mermaid-cli...');
    execSync('npm install -g @mermaid-js/mermaid-cli', { stdio: 'inherit' });
  }

  // Create config for better rendering
  const configFile = path.join(__dirname, 'mermaid-config.json');
  const config = {
    theme: 'default',
    themeVariables: {
      primaryColor: '#fff',
      primaryTextColor: '#333',
      primaryBorderColor: '#333',
      lineColor: '#333',
    },
    flowchart: {
      rankSpacing: 80,
      nodeSpacing: 30,
      curve: 'basis',
      useMaxWidth: false,
      htmlLabels: true,
    },
  };

  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

  // Write mermaid code to temp file
  const tempFile = path.join(__dirname, 'temp-diagram.mmd');
  fs.writeFileSync(tempFile, mermaidCode);

  // Generate PNG
  const outputPath = path.resolve(__dirname, '..', 'dependency-graph.png');

  try {
    console.log('🎨 Generating PNG...');
    execSync(
      `mmdc -i "${tempFile}" -o "${outputPath}" -c "${configFile}" -w 1600 -H 1200`,
      { stdio: 'inherit' },
    );

    // Clean up temp files
    fs.unlinkSync(tempFile);
    fs.unlinkSync(configFile);

    return outputPath;
  } catch (error) {
    // Clean up temp files on error
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    if (fs.existsSync(configFile)) fs.unlinkSync(configFile);
    throw error;
  }
}

// Main function
async function main() {
  console.log('🔍 Scanning for package.json files...');
  const packageJsonFiles = findPackageJsonFiles();

  console.log(`📦 Found ${packageJsonFiles.length} packages`);

  // Parse all packages
  const packages = packageJsonFiles.map(parsePackageInfo).filter(Boolean);

  // Log what we found for debugging
  const layers = organizeLayers(packages);
  console.log('\n📊 Package organization:');
  console.log(`  Applications: ${layers.apps.map((p) => p.name).join(', ')}`);
  console.log(`  UI Components: ${layers.ui.map((p) => p.name).join(', ')}`);
  console.log(`  Services: ${layers.services.map((p) => p.name).join(', ')}`);
  console.log(`  Core: ${layers.core.map((p) => p.name).join(', ')}`);
  console.log(
    `  Configuration: ${layers.config.map((p) => p.name).join(', ')}`,
  );

  console.log('\n📊 Generating Mermaid diagram...');
  const diagram = generateMermaidDiagram(packages);

  try {
    const pngPath = await generatePNG(diagram);
    console.log(`\n✅ Dependency graph generated: ${pngPath}`);

    // Show statistics
    console.log('\n📈 Dependency Statistics:');
    const allPackageNames = packages.map((p) => p.name);
    packages.forEach((pkg) => {
      const deps = Object.keys(pkg.dependencies || {}).filter((dep) =>
        allPackageNames.includes(dep),
      );
      if (deps.length > 0) {
        console.log(`  ${pkg.name}: ${deps.length} internal dependencies`);
      }
    });
  } catch (error) {
    console.error('❌ Error generating PNG:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
