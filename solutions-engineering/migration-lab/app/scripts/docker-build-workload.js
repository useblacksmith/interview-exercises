const crypto = require('crypto');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

function taskCount() {
  return Number(process.env.DOCKER_BUILD_TASKS || 64);
}

function iterationCount() {
  return Number(process.env.DOCKER_BUILD_ITERATIONS || 18000000);
}

function workerCount() {
  return Number(process.env.DOCKER_BUILD_WORKERS || 4);
}

function runNativeBuildTask(iterations) {
  const output = crypto.pbkdf2Sync(
    'acme-payments-container-build',
    'native-addon-build-cache',
    iterations,
    64,
    'sha512',
  );

  return output.readUInt32BE(0);
}

if (!isMainThread) {
  parentPort.postMessage(runNativeBuildTask(workerData.iterations));
  return;
}

function runTask(iterations) {
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

async function main() {
  const tasks = taskCount();
  const iterations = iterationCount();
  const workers = Math.min(workerCount(), tasks);
  let nextTask = 0;

  console.log(`running native build workload with tasks=${tasks} iterations_per_task=${iterations} workers=${workers}`);

  async function runQueue() {
    while (nextTask < tasks) {
      nextTask += 1;
      await runTask(iterations);
    }
  }

  await Promise.all(Array.from({ length: workers }, () => runQueue()));
  console.log('native build workload completed');
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
