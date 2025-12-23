import pkg from 'pg';
const { Pool } = pkg;

const RENDER_URL = 'postgresql://fantasy_betting_ahs9_user:4GDMymKpRueGvUITQbGse6sV9aH2rCf5@dpg-d4u56nmuk2gs738b4t90-a.frankfurt-postgres.render.com/fantasy_betting_ahs9';

const pool = new Pool({
  connectionString: RENDER_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupExemptsTable() {
  console.log('🏆 Setting up copa_exempts table on RENDER...\n');

  try {
    // Create table for exempt teams (visual/informative only)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS copa_exempts (
        id SERIAL PRIMARY KEY,
        copa_edition VARCHAR(50) NOT NULL,
        position VARCHAR(50) NOT NULL,
        team_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(copa_edition, position)
      )
    `);
    console.log('✅ Table copa_exempts created on RENDER\n');

    // Insert default exempts for edition2
    console.log('Adding default exempts for Edition 2 on RENDER...');

    await pool.query(`
      INSERT INTO copa_exempts (copa_edition, position, team_name)
      VALUES
        ('edition2', 'exempt-left', 'Ruizinho F.C.'),
        ('edition2', 'exempt-right', 'Laminyamal T''FC')
      ON CONFLICT (copa_edition, position)
      DO UPDATE SET team_name = EXCLUDED.team_name
    `);

    console.log('✅ Default exempts added on RENDER\n');

    // Verify
    const result = await pool.query(`
      SELECT * FROM copa_exempts ORDER BY copa_edition, position
    `);

    console.log('📊 Current exempts on RENDER:');
    result.rows.forEach(row => {
      console.log(`   ${row.copa_edition} - ${row.position}: ${row.team_name}`);
    });

    console.log('\n🎉 Setup complete on RENDER!');
    console.log('🌐 Check at: https://fantasy-betting.onrender.com/copa-del-rei');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupExemptsTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
