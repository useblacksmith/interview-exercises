const os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

function durationMs() {
  return Number(process.env.PROFILE_DURATION_MS || 45000);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function iterationCount() {
  return Number(process.env.PROFILE_CPU_ITERATIONS || 45000000);
}

function taskCount() {
  return Number(process.env.PROFILE_CPU_TASKS || 32);
}

function burnIterations(iterations) {
  let value = 0;

  for (let i = 0; i < iterations; i += 1) {
    value += Math.sqrt((value + i) % 1000);
  }

  return value;
}

if (!isMainThread) {
  const value = burnIterations(workerData.iterations);
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

function runCpuTask(iterations) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: { iterations } });
    worker.once('message', resolve);
    worker.once('error', reject);
    worker.once('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`worker exited with code ${code}`));
      }
    });
  });
}

async function runCpuProfile() {
  const workers = Number(process.env.PROFILE_CPU_WORKERS || Math.max(2, os.cpus().length));
  const tasks = taskCount();
  const iterations = iterationCount();
  let nextTask = 0;

  console.log(`starting fraud model profile with workers=${workers} tasks=${tasks} iterations_per_task=${iterations}`);
  console.log(`detected_cpu_count=${os.cpus().length}`);

  async function runWorkerQueue() {
    while (nextTask < tasks) {
      nextTask += 1;
      await runCpuTask(iterations);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(workers, tasks) }, () => runWorkerQueue()),
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
