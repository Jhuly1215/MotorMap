const fs = require('fs');
const path = require('path');

const podspecPath = path.join(__dirname, '..', 'node_modules', 'expo-constants', 'ios', 'EXConstants.podspec');
const oldSnippet = "  env_vars = ENV['PROJECT_ROOT'] ? \"PROJECT_ROOT=#{ENV['PROJECT_ROOT']} \" : \"\"";
const newSnippet = "  env_vars = ENV['PROJECT_ROOT'] ? \"PROJECT_ROOT=\\\"#{ENV['PROJECT_ROOT']}\\\" \" : \"\"";

if (!fs.existsSync(podspecPath)) {
  process.exit(0);
}

const current = fs.readFileSync(podspecPath, 'utf8');

if (!current.includes(oldSnippet)) {
  process.exit(0);
}

fs.writeFileSync(podspecPath, current.replace(oldSnippet, newSnippet));