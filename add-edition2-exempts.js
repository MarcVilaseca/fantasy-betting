import pkg from 'pg';
const { Pool } = pkg;

const LOCAL_URL = 'postgresql://postgres:Disbauxa2001@localhost:5432/fantasy_betting';

const pool = new Pool({
  connectionString: LOCAL_URL,
  ssl: false
});

async function addExemptTeams() {
  console.log('🏆 Adding exempt teams to Edition 2...\n');

  try {
    // Left exempt: Ruizinho F.C.
    console.log('Adding left exempt: Ruizinho F.C.');
    await pool.query(`
      INSERT INTO matches (
        team1,
        team2,
        round,
        betting_closes_at,
        copa_edition,
        copa_round,
        copa_position,
        status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      )
      ON CONFLICT DO NOTHING
    `, [
      'Ruizinho F.C.',
      'EXEMPT',
      'Copa del Rei - Edition 2',
      new Date('2099-12-31'),  // Far future date
      'edition2',
      'round16',
      'exempt-left',
      'open'
    ]);
    console.log('✅ Left exempt added: Ruizinho F.C.\n');

    // Right exempt: Laminyamal T'FC
    console.log('Adding right exempt: Laminyamal T\'FC');
    await pool.query(`
      INSERT INTO matches (
        team1,
        team2,
        round,
        betting_closes_at,
        copa_edition,
        copa_round,
        copa_position,
        status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      )
      ON CONFLICT DO NOTHING
    `, [
      'Laminyamal T\'FC',
      'EXEMPT',
      'Copa del Rei - Edition 2',
      new Date('2099-12-31'),  // Far future date
      'edition2',
      'round16',
      'exempt-right',
      'open'
    ]);
    console.log('✅ Right exempt added: Laminyamal T\'FC\n');

    // Verify
    const result = await pool.query(`
      SELECT team1, copa_position
      FROM matches
      WHERE copa_edition = 'edition2'
        AND copa_round = 'round16'
        AND copa_position LIKE 'exempt%'
      ORDER BY copa_position
    `);

    console.log('📊 Verification - Exempt teams in Edition 2:');
    result.rows.forEach(row => {
      console.log(`   ${row.copa_position}: ${row.team1}`);
    });

    console.log('\n🎉 Exempt teams added successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addExemptTeams()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
