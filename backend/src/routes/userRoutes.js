const express = require('express');

const requireAuth = require('../middlewares/requireAuth');
const userService = require('../services/userService');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
    try {
        const users = await userService.searchUsers(
            req.userId,
            req.query.search,
        );

        res.status(200).json({ users });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }

        next(err);
    }
});

// Return the global leaderboard for authenticated users.
router.get('/leaderboard', requireAuth, async (req, res, next) => {
    try {
        const players = await userService.getLeaderboard();

        res.status(200).json({ players });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
