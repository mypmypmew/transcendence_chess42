function toModalPlayer(user, options = {}) {
  return {
    id: user.id,
    avatar: user.avatar || null,
    nickname: user.username,
    rating: user.rating,
    isFriend: options.isFriend ?? true,
    hasPendingFriendRequest: options.hasPendingFriendRequest ?? false,
    friendActionLabel: options.friendActionLabel,
  }
}

export { toModalPlayer }
