import pkg from 'pg';
const { Pool } = pkg;

const LOCAL_URL = 'postgresql://postgres:Disbauxa2001@localhost:5432/fantasy_betting';

const pool = new Pool({
  connectionString: LOCAL_URL,
  ssl: false
});

async function setupExemptsTable() {
  console.log('🏆 Setting up copa_exempts table...\n');

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
    console.log('✅ Table copa_exempts created\n');

    // Insert default exempts for edition2
    console.log('Adding default exempts for Edition 2...');

    await pool.query(`
      INSERT INTO copa_exempts (copa_edition, position, team_name)
      VALUES
        ('edition2', 'exempt-left', 'Ruizinho F.C.'),
        ('edition2', 'exempt-right', 'Laminyamal T''FC')
      ON CONFLICT (copa_edition, position)
      DO UPDATE SET team_name = EXCLUDED.team_name
    `);

    console.log('✅ Default exempts added\n');

    // Verify
    const result = await pool.query(`
      SELECT * FROM copa_exempts ORDER BY copa_edition, position
    `);

    console.log('📊 Current exempts:');
    result.rows.forEach(row => {
      console.log(`   ${row.copa_edition} - ${row.position}: ${row.team_name}`);
    });

    console.log('\n🎉 Setup complete!');

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
