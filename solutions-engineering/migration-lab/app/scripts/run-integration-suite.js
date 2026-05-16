const os = require('os');
const { Pool } = require('pg');

function parseConcurrency() {
  const configured = process.env.INTEGRATION_WORKERS || 'auto';
  if (configured === 'auto') {
    return Math.max(4, os.cpus().length * 3);
  }

  const workers = Number(configured);
  if (!Number.isInteger(workers) || workers < 1) {
    console.error('invalid INTEGRATION_WORKERS value');
    process.exit(1);
  }

  return workers;
}

function connectionString() {
  return process.env.DATABASE_URL || 'postgresql://acme:acme@localhost:55432/acme_test';
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
  const concurrency = parseConcurrency();
  const poolSize = Number(process.env.APP_DB_POOL_SIZE || 4);

  console.log('starting integration suite');

  await prepareDatabase();

  const results = await Promise.allSettled(
    Array.from({ length: concurrency }, (_, index) => runWorker(index + 1, poolSize)),
  );

  const failures = results.filter((result) => result.status === 'rejected');

  if (failures.length > 0) {
    console.error('tenant bootstrap failed before the readiness deadline');
    console.error('inspect runtime service logs from the runner for more detail');
    process.exit(1);
  }

  console.log(`integration suite completed`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
