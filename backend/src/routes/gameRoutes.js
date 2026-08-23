const express = require('express');
const requireAuth = require('../middlewares/requireAuth');
const gameHistoryService = require('../services/gameHistoryService');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const games = await gameHistoryService.listGames(req.userId);
    res.status(200).json({ games });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
});

router.get('/:gameId', requireAuth, async (req, res, next) => {
  try {
    const gameId = Number(req.params.gameId);
    const game = await gameHistoryService.getGame(req.userId, gameId);
    res.status(200).json({ game });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
});

module.exports = router;