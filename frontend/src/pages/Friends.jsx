// later API integration will be done from backend and handle actions like remove friend, open profile, message, and challenge.
import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Avatar from '../components/Avatar'

const mockFriends = [
  { id: 1, avatar: null, nickname: 'Serhii', rating: 1812, games: 200, online: true },
  { id: 2, avatar: null, nickname: 'Taulant', rating: 1694, games: 150, online: false },
  { id: 3, avatar: null, nickname: 'Tatiana', rating: 1740, games: 178, online: true },
  { id: 4, avatar: null, nickname: 'Alima', rating: 1658, games: 132, online: false },
  { id: 5, avatar: null, nickname: 'Mira', rating: 1775, games: 98, online: true },
  { id: 6, avatar: null, nickname: 'Niko', rating: 1796, games: 88, online: false },
  { id: 7, avatar: null, nickname: 'Elena', rating: 1726, games: 76, online: false },
  { id: 8, avatar: null, nickname: 'Arman', rating: 1688, games: 64, online: true },
  { id: 9, avatar: null, nickname: 'Lina', rating: 1632, games: 52, online: false },
  { id: 10, avatar: null, nickname: 'David', rating: 1590, games: 44, online: true },
  { id: 11, avatar: null, nickname: 'Sofia', rating: 1768, games: 39, online: false },
]

export default function Friends() {
  const [friends, setFriends] = useState([...mockFriends])

// TODO add API integration from backend  remove friend
  const handleRemoveFriend = (friendId) => {
    setFriends((current) => current.filter((friend) => friend.id !== friendId))
  }

  const handleOpenProfile = (friend) => {
    // TODO: open profile modal
    console.log('Open profile:', friend.nickname)
  }

  const handleMessage = (friend) => {
    // TODO: open chat
    console.log('Message:', friend.nickname)
  }

  const handleChallenge = (friend) => {
    // TODO: open game lobby
    console.log('Challenge:', friend.nickname)
  }
// TODO add API integration from backend to add friend
  const handleAddFriend = () => {
    // TODO: open friend addition form??
    console.log('Add friend')
  }

  return (
    <AppLayout 
      eyebrow="Friends" 
      title="Friends"
      actions={
        <button className="btn btn-primary" onClick={handleAddFriend}>
          Add Friend
        </button>
      }
    >
      <div className="cm-page-grid">
        <section className="cm-panel">
          <div className="cm-panel-header">
            <div>
              <p className="cm-eyebrow">Friends List</p>
              <h2 className="cm-section-title">Friends</h2>
            </div>
          </div>
          <div className="cm-panel-body">
            {friends.length === 0 ? (
              <div className="empty-state">
                <p>No friends yet</p>
              </div>
            ) : (
              <div className="cm-list">
                {friends.map((friend) => (
                  <div key={friend.id} className="cm-list-row">
                    <Avatar
                      avatar={friend.avatar}
                      name={friend.nickname}
                      className="avatar avatar-md"
                    />
                    
                    <div>
                      <div 
                        className="text-primary"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleOpenProfile(friend)}
                      >
                        {friend.nickname}
                      </div>
                      <div className="flex items-center gap-2">
						<i className="ti ti-trophy text-accent" aria-hidden="true" />
						<span className="text-muted">{friend.rating}</span>
						<i className="ti ti-chess-rook text-accent" aria-hidden="true" />
						<span className="text-muted">{friend.games}</span>
						<span className={`status-dot ${friend.online ? 'online' : 'offline'}`} />
                        <span className="text-muted">
                          {friend.online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleMessage(friend)}
                      >
                        Message
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleChallenge(friend)}
                      >
                        Challenge
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveFriend(friend.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
