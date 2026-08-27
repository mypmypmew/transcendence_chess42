const { FriendshipStatus } = require('@prisma/client');

const friendshipRepository = require('../repositories/friendshipRepository');
const userRepository = require('../repositories/userRepository');

function httpError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

function toPublicUser(user) {
    return {
        id: user.id,
        username: user.username,
        rating: user.rating,
    };
}

async function sendFriendRequest(requesterId, recipientId) {
    if (!Number.isInteger(recipientId) || recipientId <= 0) {
        throw httpError(400, 'recipientId must be a positive integer');
    }

    if (requesterId === recipientId) {
        throw httpError(400, 'Users cannot send friend requests to themselves');
    }

    const recipient = await userRepository.findPublicUserById(recipientId);

    if (!recipient) {
        throw httpError(404, 'Recipient not found');
    }

    const existingFriendship = await friendshipRepository.findFriendship(
        requesterId,
        recipientId,
    );

    if (existingFriendship?.status === FriendshipStatus.PENDING) {
        throw httpError(409, 'Friend request already exists');
    }

    if (existingFriendship?.status === FriendshipStatus.ACCEPTED) {
        throw httpError(409, 'Users are already friends');
    }

    try {
        const request = await friendshipRepository.createFriendRequest(
            requesterId,
            recipientId,
        );

        return {
            id: request.id,
            status: request.status,
            createdAt: request.createdAt,
            recipient: toPublicUser(recipient),
        };
    } catch (err) {
        if (err?.code === 'P2002') {
            throw httpError(409, 'Friend request already exists');
        }

        throw err;
    }
}

module.exports = {
    sendFriendRequest,
};