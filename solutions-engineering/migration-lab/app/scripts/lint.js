const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', 'src', 'server.js'),
  path.join(__dirname, 'build.js'),
  path.join(__dirname, 'shard-tests.js'),
  path.join(__dirname, 'integration-db-stress.js'),
  path.join(__dirname, 'docker-arch-check.js'),
  path.join(__dirname, 'docker-build-workload.js'),
  path.join(__dirname, 'resource-profile.js'),
];

const failures = [];

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');

  if (source.includes('\t')) {
    failures.push(`${path.relative(process.cwd(), file)} contains tabs`);
  }

  if (!source.endsWith('\n')) {
    failures.push(`${path.relative(process.cwd(), file)} must end with newline`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log(`lint completed for ${files.length} files`);
