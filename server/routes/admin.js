import express from 'express';
import bcrypt from 'bcryptjs';
import { userQueries, matchQueries, fantasyQueries } from '../config/db.js';

const router = express.Router();

// Endpoint per NETEJAR COMPLETAMENT i reinicialitzar la BD
router.post('/clean-and-init', async (req, res) => {
  try {
    const { pool } = await import('../config/db.js');
    
    // ESBORRAR TOT (excepte usuaris)
    await pool.query('DELETE FROM parlay_bet_items');
    await pool.query('DELETE FROM parlay_bets');
    await pool.query('DELETE FROM bets');
    await pool.query('DELETE FROM matches');
    await pool.query('DELETE FROM fantasy_scores');
    await pool.query('DELETE FROM transactions WHERE type != \'initial_balance\'');
    
    // CREAR EQUIPS FANTASY CORRECTES
    const teams = [
      'Jaume Creixell U.E.',
      "L'ESQUADRA VILAS...",
      'CE FerranitoPito',
      'Nottingham_Pressa',
      'AstoNitu F.C',
      'Ruizinho F. C.',
      'Laminyamal T\'FC',
      'SANCOTS 304',
      'pepe rubianes',
      'ArnauBabau F.C',
      'jaaavichu05',
      'Ao Tat Kha FC',
      'Catllaneta',
      'Babycots F.C'
    ];

    const scores = {
      'Jaume Creixell U.E.': [85, 100, 60, 75, 64, 88, 73, 62, 68, 52, 80, 82, 67, 67],
      "L'ESQUADRA VILAS...": [69, 90, 65, 70, 71, 71, 85, 47, 64, 61, 85, 64, 65, 41],
      'CE FerranitoPito': [86, 51, 91, 35, 72, 61, 80, 38, 73, 49, 83, 80, 61, 86],
      'Nottingham_Pressa': [73, 64, 57, 72, 69, 48, 54, 34, 71, 53, 71, 82, 63, 82],
      'AstoNitu F.C': [63, 58, 44, 77, 57, 51, 53, 61, 70, 61, 60, 89, 41, 87],
      'Ruizinho F. C.': [47, 59, 51, 80, 52, 54, 70, 40, 86, 76, 44, 27, 65, 79],
      'Laminyamal T\'FC': [52, 84, 73, 58, 74, 52, 60, 27, 60, 32, 80, 57, 46, 45],
      'SANCOTS 304': [53, 51, 69, 25, 56, 37, 47, 21, 67, 68, 77, 73, 81, 58],
      'pepe rubianes': [71, 43, 50, 59, 0, 83, 61, 53, 60, 83, 77, 55, 67, 65],
      'ArnauBabau F.C': [65, 31, 54, 49, 70, 43, 40, 42, 74, 59, 67, 60, 77, 48],
      'jaaavichu05': [60, 51, 80, 52, 45, 64, 55, 59, 74, 49, 34, 60, 33, 47],
      'Ao Tat Kha FC': [34, 47, 37, 43, 23, 39, 60, 56, 44, 70, 72, 40, 50, 62],
      'Catllaneta': [50, 68, 42, 20, 47, 63, 31, 46, 42, 40, 63, 53, 45, 65],
      'Babycots F.C': [47, 39, 35, 54, 52, 44, 21, 66, 70, 53, 64, 43, 57, 55]
    };

    for (const team of teams) {
      for (let matchday = 1; matchday <= 14; matchday++) {
        const points = scores[team][matchday - 1];
        await fantasyQueries.addScore(team, matchday, points);
      }
    }

    // CREAR ÚNIC PARTIT VÀLID
    await matchQueries.create(
      'Jaume Creixell U.E.',
      'jaaavichu05',
      'Jornada 18',
      new Date('2025-12-12T20:59:00')
    );

    res.json({
      success: true,
      message: 'Base de dades netejada i reinicialitzada correctament',
      data: {
        teams: teams.length,
        matches: 1,
        match: 'Jaume Creixell U.E. vs jaaavichu05 (12/12/2025 20:59)'
      }
    });
  } catch (error) {
    console.error('Error netejant BD:', error);
    res.status(500).json({
      success: false,
      error: 'Error netejant base de dades',
      details: error.message
    });
  }
});

export default router;
