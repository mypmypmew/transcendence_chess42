// later API integration will be done from backend and handle actions like remove friend, open profile, message, and challenge.
import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Avatar from '../components/Avatar'
import UserProfileModal from '../components/UserProfileModal'
import { Link } from 'react-router-dom'


const mockFriends = [
  { id: 1, avatar: null, nickname: 'Serhii', rating: 1812, games: 200, online: true },
  { id: 2, avatar: null, nickname: 'Taulant', rating: 1694, games: 150, online: false },
  { id: 3, avatar: null, nickname: 'Tatiana', rating: 1740, games: 178, online: true },
  { id: 4, avatar: null, nickname: 'Alima', rating: 1658, games: 132, online: false },
  { id: 5, avatar: null, nickname: 'Mira', rating: 1775, games: 98, online: true },
  { id: 6, avatar: null, nickname: 'Niko', rating: 1796, games: 88, online: false },
  { id: 7, avatar: null, nickname: 'Elena', rating: 1726, games: 76, online: false },
]

export default function Friends() {
  const [friends, setFriends] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFriend, setSelectedFriend] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFriends([...mockFriends])
      setIsLoading(false)
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [])

	
  const handleRemoveFriend = (friendId) => {
    setFriends((current) => current.filter((friend) => friend.id !== friendId))
    setSelectedFriend((current) => (current?.id === friendId ? null : current))
  }

	const handleOpenProfile = (friend) => {
    setSelectedFriend(friend)
  	}

	const handleMessage = (friend) => {
	<Link to={`/chat/${friend.id}`} className="btn btn-ghost btn-sm">
  	Message
	</Link>
	}

	const handleChallenge = (friend) => {
	<Link to={`/game-lobby?opponent=${friend.id}`} className="btn btn-ghost btn-sm">
  	Challenge
	</Link>
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
            {isLoading ? (
              <div className="empty-state">
                <p>Loading friends...</p>
              </div>
            ) : friends.length === 0 ? (
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

	  {selectedFriend && (
	    <UserProfileModal player={selectedFriend} onClose={() => setSelectedFriend(null)} />
	  )}
    </AppLayout>
  )
}
