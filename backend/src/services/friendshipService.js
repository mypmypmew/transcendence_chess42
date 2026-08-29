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

function getOtherParticipant(friendship, userId) {
    return friendship.userAId === userId
            ? friendship.userB
            : friendship.userA;
}

async function removeFriend(currentUserId, friendUserId) {
    if (!Number.isInteger(friendUserId) || friendUserId <= 0) {
        throw httpError(400, 'friendId must be a positive integer');
    }

    if (currentUserId === friendUserId) {
        throw httpError(400, 'A user cannot remove themselves as a friend');
    }

    const friendship = await friendshipRepository.findFriendship(
        currentUserId,
        friendUserId,
    );

    if (!friendship) {
        throw httpError(404, 'Friendship not found');
    }

    if (friendship.status !== FriendshipStatus.ACCEPTED) {
        throw httpError(409, 'Only accepted friendships can be removed');
    }

    try {
        await friendshipRepository.deleteFriendshipById(friendship.id);
    } catch (err) {
        if (err?.code === 'P2025') {
            throw httpError(404, 'Friendship not found');
        }

        throw err;
    }
}

function validateRequestId(requestId) {
    if (!Number.isInteger(requestId) || requestId <= 0) {
        throw httpError(400, 'requestId must be a positive integer');
    }
}

function getRecipientId(request) {
    return request.requestedById === request.userAId
            ? request.userBId
            : request.userAId;
}

async function acceptFriendRequest(currentUserId, requestId) {
    validateRequestId(requestId);

    const request = await friendshipRepository.findFriendshipById(requestId);

    if (!request) {
        throw httpError(404, 'Friend request not found');
    }

    if (currentUserId !== getRecipientId(request)) {
        throw httpError(403, 'Only the recipient can accept this request');
    }

    if (request.status !== FriendshipStatus.PENDING) {
        throw httpError(409, 'Friend request is not pending');
    }

    try {
        const accepted = await friendshipRepository.acceptFriendRequest(requestId);

        return {
            id: accepted.id,
            status: accepted.status,
            createdAt: accepted.createdAt,
        };
    } catch (err) {
        if (err?.code === 'P2025') {
            throw httpError(409, 'Friend request is no longer pending');
        }

        throw err;
    }
}

async function deleteFriendRequest(currentUserId, requestId) {
    validateRequestId(requestId);

    const request = await friendshipRepository.findFriendshipById(requestId);

    if (!request) {
        throw httpError(404, 'Friend request not found');
    }

    const isParticipant = (
        request.userAId === currentUserId
        || request.userBId === currentUserId
    );

    if (!isParticipant) {
        throw httpError(403, 'You cannot delete this friend request');
    }

    if (request.status !== FriendshipStatus.PENDING) {
        throw httpError(409, 'Only pending requests can be deleted');
    }

    try {
        await friendshipRepository.deleteFriendshipById(requestId);
    } catch (err) {
        if (err?.code === 'P2025') {
            throw httpError(404, 'Friend request not found');
        }

        throw err;
    }
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

async function listFriendRequests(userId) {
    const requests =
        await friendshipRepository.findPendingFriendRequestsByUserId(userId);

    const incoming = [];
    const outgoing = [];

    for (const request of requests) {
        if (request.requestedById === userId) {
            outgoing.push({
                id: request.id,
                status: request.status,
                createdAt: request.createdAt,
                recipient: toPublicUser(getOtherParticipant(request, userId)),
            });
            continue;
        }

        const requester = request.requestedById === request.userAId
            ? request.userA
            : request.userB;

        incoming.push({
            id: request.id,
            status: request.status,
            createdAt: request.createdAt,
            requester: toPublicUser(requester),
        });
    }

    return {
        incoming,
        outgoing,
    };
}

module.exports = {
    sendFriendRequest,
    listFriendRequests,
    acceptFriendRequest,
    deleteFriendRequest,
    removeFriend,
};