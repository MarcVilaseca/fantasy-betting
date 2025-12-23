import pkg from 'pg';
const { Pool } = pkg;

const RENDER_URL = 'postgresql://fantasy_betting_ahs9_user:4GDMymKpRueGvUITQbGse6sV9aH2rCf5@dpg-d4u56nmuk2gs738b4t90-a.frankfurt-postgres.render.com/fantasy_betting_ahs9';

const pool = new Pool({
  connectionString: RENDER_URL,
  ssl: { rejectUnauthorized: false }
});

async function addExemptTeams() {
  console.log('🏆 Adding exempt teams to Edition 2 on RENDER...\n');

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

    console.log('📊 Verification - Exempt teams in Edition 2 on RENDER:');
    result.rows.forEach(row => {
      console.log(`   ${row.copa_position}: ${row.team1}`);
    });

    console.log('\n🎉 Exempt teams added to RENDER successfully!');
    console.log('🌐 Check at: https://fantasy-betting.onrender.com/copa-del-rei');

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
