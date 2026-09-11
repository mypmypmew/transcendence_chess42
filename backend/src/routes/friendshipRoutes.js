const express = require('express');

const requireAuth = require('../middlewares/requireAuth');
const friendshipService = require('../services/friendshipService');

const router = express.Router();

router.post('/friend-requests', requireAuth, async (req, res, next) => {
    try {
        const request = await friendshipService.sendFriendRequest(
            req.userId,
            req.body.recipientId,
        );

        res.status(201).json({ request });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }

        next(err);
    }
});

router.post('/friend-requests/:requestId/accept',
    requireAuth,
    async (req, res, next) => {
    try {
        const requestId = Number(req.params.requestId);

        const friendship = await friendshipService.acceptFriendRequest(
            req.userId,
            requestId,
        );

        res.status(200).json({friendship });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }

        next(err);
    }
});

router.get('/friend-requests', requireAuth, async (req, res, next) => {
        try {
            const requests = await friendshipService.listFriendRequests(req.userId);

            res.status(200).json(requests);
        } catch (err) {
            if (err.status) {
                return res.status(err.status).json({ error: err.message });
            }

            next(err);
        }
    },
);

router.get('/friends', requireAuth, async (req, res, next) => {
    try {
        const friends = await friendshipService.listFriends(req.userId);

        res.status(200).json({ friends });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }

        next(err);
    }
});

router.delete(
    '/friend-requests/:requestId',
    requireAuth,
    async (req, res, next) => {
        try {
            const requestId = Number(req.params.requestId);

            await friendshipService.deleteFriendRequest(
                req.userId,
                requestId,
            );

            res.status(204).end();
        } catch (err) {
            if (err.status) {
                return res.status(err.status).json({ error: err.message });
            }

            next(err);
        }
    },
);

router.delete(
    '/friends/:friendUserId',
    requireAuth,
    async (req, res, next) => {
        try {
            const friendUserId = Number(req.params.friendUserId);

            await friendshipService.removeFriend(
                req.userId,
                friendUserId,
            );

            res.status(204).end();
        } catch (err) {
            if (err.status) {
                return res.status(err.status).json({ error: err.message });
            }

            next(err);
        }
    },
);

module.exports = router;
