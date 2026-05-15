const os = require('os');
const { Pool } = require('pg');

function parseWorkers() {
  const configured = process.env.DB_STRESS_WORKERS || 'auto';
  if (configured === 'auto') {
    return Math.max(4, os.cpus().length * 3);
  }

  const workers = Number(configured);
  if (!Number.isInteger(workers) || workers < 1) {
    console.error('invalid DB_STRESS_WORKERS value');
    process.exit(1);
  }

  return workers;
}

function connectionString() {
  return process.env.DATABASE_URL || 'postgresql://acme:acme@localhost:5432/acme_test';
}

async function runWorker(workerId, poolSize) {
  const pool = new Pool({
    connectionString: connectionString(),
    max: poolSize,
    connectionTimeoutMillis: 1500,
    idleTimeoutMillis: 1000,
  });

  try {
    await Promise.all(
      Array.from({ length: poolSize }, async () => {
        await pool.query('select pg_sleep(0.4)');
      }),
    );
    await pool.query('insert into test_events (worker_id) values ($1)', [workerId]);
    return { workerId, ok: true };
  } finally {
    await pool.end();
  }
}

async function prepareDatabase() {
  const pool = new Pool({
    connectionString: connectionString(),
    max: 1,
    connectionTimeoutMillis: 1500,
    idleTimeoutMillis: 1000,
  });

  try {
    await pool.query('create table if not exists test_events (id serial primary key, worker_id int, created_at timestamptz default now())');
  } finally {
    await pool.end();
  }
}

async function main() {
  const workers = parseWorkers();
  const poolSize = Number(process.env.DB_POOL_SIZE || 4);

  console.log(`starting integration suite with workers=${workers} pool_size=${poolSize}`);
  console.log(`detected_cpu_count=${os.cpus().length}`);

  await prepareDatabase();

  const results = await Promise.allSettled(
    Array.from({ length: workers }, (_, index) => runWorker(index + 1, poolSize)),
  );

  const failures = results.filter((result) => result.status === 'rejected');

  if (failures.length > 0) {
    console.error(`integration suite failed during database setup: ${failures.length} tenants could not initialize`);
    console.error('database setup did not become ready before the test timeout');
    process.exit(1);
  }

  console.log(`integration suite completed with ${workers} workers`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
