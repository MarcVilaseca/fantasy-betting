import pkg from 'pg';
const { Pool } = pkg;

const RENDER_URL = 'postgresql://fantasy_betting_ahs9_user:4GDMymKpRueGvUITQbGse6sV9aH2rCf5@dpg-d4u56nmuk2gs738b4t90-a.frankfurt-postgres.render.com/fantasy_betting_ahs9';
const LOCAL_URL = 'postgresql://postgres:Disbauxa2001@localhost:5432/fantasy_betting';

const renderPool = new Pool({
  connectionString: RENDER_URL,
  ssl: { rejectUnauthorized: false }
});

const localPool = new Pool({
  connectionString: LOCAL_URL,
  ssl: false
});

async function cloneDatabase() {
  console.log('🚀 Starting database clone from Render to Local...\n');

  try {
    // Tables to clone in order (respecting foreign keys)
    const tables = [
      'users',
      'matches',
      'bets',
      'parlay_bets',
      'parlay_bet_items',
      'transactions',
      'fantasy_scores'
    ];

    console.log('📊 Fetching data from Render (READ-ONLY)...\n');

    // First, clear local database
    console.log('🗑️  Clearing local database...');
    for (const table of [...tables].reverse()) {
      await localPool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
      console.log(`   ✓ Cleared ${table}`);
    }
    console.log('');

    // Clone each table
    for (const table of tables) {
      console.log(`📋 Cloning table: ${table}`);

      // Get data from Render
      const renderData = await renderPool.query(`SELECT * FROM ${table} ORDER BY id`);
      console.log(`   → Found ${renderData.rows.length} rows in Render`);

      if (renderData.rows.length > 0) {
        // Get column names
        const columns = Object.keys(renderData.rows[0]);
        const columnNames = columns.join(', ');

        // Insert each row into local database
        for (const row of renderData.rows) {
          const values = columns.map(col => row[col]);
          const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

          await localPool.query(
            `INSERT INTO ${table} (${columnNames}) VALUES (${placeholders})`,
            values
          );
        }

        console.log(`   ✓ Copied ${renderData.rows.length} rows to local`);

        // Reset sequence for tables with auto-increment IDs
        if (columns.includes('id')) {
          const maxId = await localPool.query(`SELECT MAX(id) as max_id FROM ${table}`);
          const nextId = (maxId.rows[0].max_id || 0) + 1;
          await localPool.query(`ALTER SEQUENCE ${table}_id_seq RESTART WITH ${nextId}`);
          console.log(`   ✓ Reset sequence to ${nextId}`);
        }
      }
      console.log('');
    }

    // Verify counts
    console.log('✅ Verification:\n');
    for (const table of tables) {
      const renderCount = await renderPool.query(`SELECT COUNT(*) FROM ${table}`);
      const localCount = await localPool.query(`SELECT COUNT(*) FROM ${table}`);
      const match = renderCount.rows[0].count === localCount.rows[0].count ? '✓' : '✗';
      console.log(`   ${match} ${table}: Render=${renderCount.rows[0].count}, Local=${localCount.rows[0].count}`);
    }

    console.log('\n🎉 Database cloned successfully!');
    console.log('📍 Render database was NOT modified (read-only operation)');
    console.log('📍 Local database now has the same data as Render');

  } catch (error) {
    console.error('❌ Error cloning database:', error);
    throw error;
  } finally {
    await renderPool.end();
    await localPool.end();
  }
}

cloneDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
