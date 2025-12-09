import pkg from 'pg';
const { Pool } = pkg;

// ConfiguraciÃ³ de la base de dades
// En local usa aquestes credencials, en producciÃ³ (Render) usarÃ  DATABASE_URL automÃ ticament
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Disbauxa2001@localhost:5432/fantasy_betting',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Helper per executar queries
async function query(text, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Helpers per compatibilitat amb el codi existent
async function run(sql, params = []) {
  const result = await query(sql, params);
  return {
    lastInsertRowid: result.rows[0]?.id,
    changes: result.rowCount
  };
}

async function get(sql, params = []) {
  const result = await query(sql, params);
  return result.rows[0];
}

async function all(sql, params = []) {
  const result = await query(sql, params);
  return result.rows;
}

// Crear taules
export async function initDatabase() {
  try {
    // Taula d'usuaris
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        coins NUMERIC(10,2) DEFAULT 1000,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Taula de duels/partits
    await query(`
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        team1 VARCHAR(255) NOT NULL,
        team2 VARCHAR(255) NOT NULL,
        round VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        score_team1 INTEGER,
        score_team2 INTEGER,
        betting_closes_at TIMESTAMP NOT NULL,
        result_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team1, team2, round)
      )
    `);

    // Taula d'apostes
    await query(`
      CREATE TABLE IF NOT EXISTS bets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        bet_type VARCHAR(50) NOT NULL,
        selection TEXT NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        odds NUMERIC(10,2) NOT NULL,
        potential_return NUMERIC(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        result VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Taula per apostes combinades
    await query(`
      CREATE TABLE IF NOT EXISTS parlay_bets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(10,2) NOT NULL,
        total_odds NUMERIC(10,2) NOT NULL,
        potential_return NUMERIC(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        result VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // RelaciÃ³ apostes combinades - apostes individuals
    await query(`
      CREATE TABLE IF NOT EXISTS parlay_bet_items (
        id SERIAL PRIMARY KEY,
        parlay_bet_id INTEGER NOT NULL REFERENCES parlay_bets(id) ON DELETE CASCADE,
        bet_id INTEGER NOT NULL REFERENCES bets(id) ON DELETE CASCADE
      )
    `);

    // Taula d'historial de transaccions
    await query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(10,2) NOT NULL,
        type VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Taula de classificaciÃ³ fantasy
    await query(`
      CREATE TABLE IF NOT EXISTS fantasy_scores (
        id SERIAL PRIMARY KEY,
        team VARCHAR(255) NOT NULL,
        matchday INTEGER NOT NULL,
        points NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team, matchday)
      )
    `);

    console.log('âœ… Base de dades PostgreSQL inicialitzada correctament');
  } catch (error) {
    console.error('âŒ Error en inicialitzar base de dades:', error);
    throw error;
  }
}

// Funcions auxiliars per gestionar usuaris
export const userQueries = {
  create: async (username, password, isAdmin) => {
    const result = await query(
      'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3) RETURNING id',
      [username, password, isAdmin]
    );
    return { lastInsertRowid: result.rows[0].id };
  },

  findByUsername: async (username) =>
    get('SELECT * FROM users WHERE username = $1', [username]),

  findById: async (id) =>
    get('SELECT * FROM users WHERE id = $1', [id]),

  updateCoins: async (coins, id) => {
    const result = await query('UPDATE users SET coins = $1 WHERE id = $2', [coins, id]);
    return { changes: result.rowCount };
  },

  getAll: async () =>
    all('SELECT id, username, coins, is_admin, created_at FROM users ORDER BY coins DESC')
};

// Funcions per gestionar partits
export const matchQueries = {
  create: async (team1, team2, round, bettingClosesAt) => {
    const result = await query(
      'INSERT INTO matches (team1, team2, round, betting_closes_at) VALUES ($1, $2, $3, $4) RETURNING id',
      [team1, team2, round, bettingClosesAt]
    );
    return { lastInsertRowid: result.rows[0].id };
  },

  findById: async (id) =>
    get('SELECT * FROM matches WHERE id = $1', [id]),

  getOpen: async () =>
    all(`SELECT * FROM matches
         WHERE status = 'open' AND betting_closes_at > NOW()
         ORDER BY betting_closes_at ASC`),

  getAll: async () =>
    all('SELECT * FROM matches ORDER BY created_at DESC'),

  updateStatus: async (status, id) => {
    const result = await query('UPDATE matches SET status = $1 WHERE id = $2', [status, id]);
    return { changes: result.rowCount };
  },

  setResult: async (scoreTeam1, scoreTeam2, id) => {
    const result = await query(
      `UPDATE matches
       SET score_team1 = $1, score_team2 = $2, status = 'finished', result_date = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [scoreTeam1, scoreTeam2, id]
    );
    return { changes: result.rowCount };
  },

  delete: async (id) => {
    const result = await query('DELETE FROM matches WHERE id = $1', [id]);
    return { changes: result.rowCount };
  }
};

// Funcions per gestionar apostes
export const betQueries = {
  create: async (userId, matchId, betType, selection, amount, odds, potentialReturn) => {
    const result = await query(
      `INSERT INTO bets (user_id, match_id, bet_type, selection, amount, odds, potential_return)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [userId, matchId, betType, selection, amount, odds, potentialReturn]
    );
    return { lastInsertRowid: result.rows[0].id };
  },

  findById: async (id) =>
    get('SELECT * FROM bets WHERE id = $1', [id]),

  getByUser: async (userId) =>
    all(`SELECT b.*, m.team1, m.team2, m.round, m.status as match_status, m.score_team1, m.score_team2
         FROM bets b
         JOIN matches m ON b.match_id = m.id
         WHERE b.user_id = $1
         ORDER BY b.created_at DESC`, [userId]),

  getByMatch: async (matchId) =>
    all(`SELECT b.*, u.username
         FROM bets b
         JOIN users u ON b.user_id = u.id
         WHERE b.match_id = $1`, [matchId]),

  updateStatus: async (status, result, id) => {
    const res = await query('UPDATE bets SET status = $1, result = $2 WHERE id = $3', [status, result, id]);
    return { changes: res.rowCount };
  },

  getPending: async () =>
    all('SELECT * FROM bets WHERE status = $1', ['pending']),

  getAllPublic: async () =>
    all(`SELECT b.*, u.username, m.team1, m.team2, m.round, m.status as match_status
         FROM bets b
         JOIN users u ON b.user_id = u.id
         JOIN matches m ON b.match_id = m.id
         WHERE b.status = 'pending' AND b.amount > 0
         ORDER BY b.created_at DESC`),

  delete: async (id) => {
    const result = await query('DELETE FROM bets WHERE id = $1', [id]);
    return { changes: result.rowCount };
  }
};

// Funcions per apostes combinades
export const parlayQueries = {
  create: async (userId, amount, totalOdds, potentialReturn) => {
    const result = await query(
      `INSERT INTO parlay_bets (user_id, amount, total_odds, potential_return)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [userId, amount, totalOdds, potentialReturn]
    );
    return { lastInsertRowid: result.rows[0].id };
  },

  addItem: async (parlayBetId, betId) => {
    const result = await query(
      'INSERT INTO parlay_bet_items (parlay_bet_id, bet_id) VALUES ($1, $2) RETURNING id',
      [parlayBetId, betId]
    );
    return { lastInsertRowid: result.rows[0].id };
  },

  getByUser: async (userId) =>
    all('SELECT * FROM parlay_bets WHERE user_id = $1 ORDER BY created_at DESC', [userId]),

  getItems: async (parlayBetId) =>
    all(`SELECT b.*, m.team1, m.team2
         FROM parlay_bet_items pbi
         JOIN bets b ON pbi.bet_id = b.id
         JOIN matches m ON b.match_id = m.id
         WHERE pbi.parlay_bet_id = $1`, [parlayBetId]),

  findById: async (id) =>
    get('SELECT * FROM parlay_bets WHERE id = $1', [id]),

  updateStatus: async (status, result, id) => {
    const res = await query('UPDATE parlay_bets SET status = $1, result = $2 WHERE id = $3', [status, result, id]);
    return { changes: res.rowCount };
  },

  delete: async (id) => {
    const result = await query('DELETE FROM parlay_bets WHERE id = $1', [id]);
    return { changes: result.rowCount };
  }
};

// Funcions per transaccions
export const transactionQueries = {
  create: async (userId, amount, type, description) => {
    const result = await query(
      `INSERT INTO transactions (user_id, amount, type, description)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [userId, amount, type, description]
    );
    return { lastInsertRowid: result.rows[0].id };
  },

  getByUser: async (userId) =>
    all('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [userId])
};

// Funcions per classificaciÃ³ fantasy
export const fantasyQueries = {
  addScore: async (team, matchday, points) => {
    const result = await query(
      `INSERT INTO fantasy_scores (team, matchday, points)
       VALUES ($1, $2, $3)
       ON CONFLICT (team, matchday)
       DO UPDATE SET points = $3
       RETURNING id`,
      [team, matchday, points]
    );
    return { lastInsertRowid: result.rows[0].id };
  },

  getByMatchday: async (matchday) =>
    all('SELECT * FROM fantasy_scores WHERE matchday = $1 ORDER BY points DESC', [matchday]),

  getAllScores: async () =>
    all('SELECT * FROM fantasy_scores ORDER BY matchday ASC, points DESC'),

  getClassification: async () =>
    all(`SELECT team,
               SUM(points) as total_points,
               COUNT(*) as matchdays_played
         FROM fantasy_scores
         GROUP BY team
         ORDER BY total_points DESC`),

  getTeamHistory: async (team) =>
    all('SELECT * FROM fantasy_scores WHERE team = $1 ORDER BY matchday ASC', [team])
};

export { pool };
export default pool;

