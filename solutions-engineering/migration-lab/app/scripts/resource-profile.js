const os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

function durationMs() {
  return Number(process.env.PROFILE_DURATION_MS || 45000);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function burnCpu(ms) {
  const end = Date.now() + ms;
  let value = 0;

  while (Date.now() < end) {
    value += Math.sqrt((value % 1000) + Math.random());
  }

  return value;
}

if (!isMainThread) {
  const value = burnCpu(workerData.durationMs);
  parentPort.postMessage(value);
  return;
}

async function runIdleProfile() {
  const duration = durationMs();
  console.log(`starting background report profile for ${duration}ms`);
  console.log(`detected_cpu_count=${os.cpus().length}`);
  await sleep(duration);
  console.log('background report profile completed');
}

async function runCpuProfile() {
  const duration = durationMs();
  const workers = Number(process.env.PROFILE_CPU_WORKERS || Math.max(4, os.cpus().length * 2));

  console.log(`starting fraud model profile with workers=${workers} duration_ms=${duration}`);
  console.log(`detected_cpu_count=${os.cpus().length}`);

  await Promise.all(
    Array.from({ length: workers }, () => new Promise((resolve, reject) => {
      const worker = new Worker(__filename, { workerData: { durationMs: duration } });
      worker.once('message', resolve);
      worker.once('error', reject);
      worker.once('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`worker exited with code ${code}`));
        }
      });
    })),
  );

  console.log('fraud model profile completed');
}

async function main() {
  const mode = process.argv[2];

  if (mode === 'idle') {
    await runIdleProfile();
    return;
  }

  if (mode === 'cpu') {
    await runCpuProfile();
    return;
  }

  console.error('usage: node scripts/resource-profile.js <idle|cpu>');
  process.exit(1);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
