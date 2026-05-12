import pg from "pg";

const expectedTables = [
  "recruiting_agent_runs",
  "recruiting_agent_tasks",
  "recruiting_agent_memories",
  "recruiting_agent_approvals",
  "recruiting_tenant_settings",
  "recruiting_notification_templates",
  "recruiting_offer_signatures",
];

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DIRECT_URL or DATABASE_URL is required.");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  const result = await client.query<{ table_name: string }>(
    `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = ANY($1::text[])
    ORDER BY table_name
    `,
    [expectedTables],
  );
  const found = new Set(result.rows.map((row) => row.table_name));
  console.log(
    JSON.stringify(
      {
        found: [...found].sort(),
        missing: expectedTables.filter((table) => !found.has(table)),
      },
      null,
      2,
    ),
  );
} finally {
  await client.end().catch(() => null);
}
