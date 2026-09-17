const express = require('express');

const requireAuth = require('../middlewares/requireAuth');
const userService = require('../services/userService');
const gameHistoryService = require('../services/gameHistoryService');
const multer = require('multer');
const avatarService = require('../services/avatarService');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: avatarService.MAX_AVATAR_BYTES },
});

function uploadAvatar(req, res, next) {
    upload.single('avatar')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.message });
        }

        next(err);
    });
}

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

router.patch('/me', requireAuth, async (req, res, next) => {
    try {
        const user = await userService.updateProfile(req.userId, req.body);

        res.status(200).json({ user });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }

        next(err);
    }
});

router.post('/me/avatar', requireAuth, uploadAvatar, async (req, res, next) => {
    try {
        const user = await avatarService.saveAvatar(req.userId, req.file);

        res.status(200).json({ user });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }

        next(err);
    }
});

// Authenticated users may view any player's public match history.
router.get('/:userId/games', requireAuth, async (req, res, next) => {
    try {
        const playerId = Number(req.params.userId);
        const games = await gameHistoryService.listPlayerGames(playerId);

        res.status(200).json({ games });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }

        next(err);
    }
});

module.exports = router;
