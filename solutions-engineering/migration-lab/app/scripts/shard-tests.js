const fs = require('fs');
const path = require('path');

function parseShard(argv) {
  const flag = argv.find((arg) => arg.startsWith('--shard='));
  const value = flag ? flag.replace('--shard=', '') : process.env.TEST_SHARD;

  if (!value) {
    return { index: 1, total: 1 };
  }

  const [indexRaw, totalRaw] = value.split('/');
  const index = Number(indexRaw);
  const total = Number(totalRaw);

  if (!Number.isInteger(index) || !Number.isInteger(total) || index < 1 || total < 1 || index > total) {
    console.error('invalid shard: expected --shard=N/T');
    process.exit(1);
  }

  return { index, total };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { index, total } = parseShard(process.argv.slice(2));
  const manifestPath = path.join(__dirname, '..', 'fixtures', 'test-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const scale = Number(process.env.TEST_DURATION_SCALE || 0.15);

  const tests = manifest.filter((_, idx) => idx % total === index - 1);
  const expectedDuration = tests.reduce((sum, test) => sum + test.durationMs, 0);

  console.log(`running unit test shard ${index}/${total}`);
  console.log(`selected ${tests.length} tests with ${expectedDuration}ms historical duration`);

  for (const test of tests) {
    const started = Date.now();
    await sleep(Math.max(20, Math.round(test.durationMs * scale)));
    const elapsed = Date.now() - started;
    console.log(`PASS ${test.name} (${elapsed}ms, historical=${test.durationMs}ms)`);
  }

  console.log(`unit test shard ${index}/${total} completed`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
