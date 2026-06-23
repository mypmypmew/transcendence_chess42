import AppLayout from '../components/AppLayout'
import './Profile.css'

const userProfile = {
  username: 'DemoPlayer',
  email: 'demo.player@test.com',
  rating: 1768,
  avatarInitial: 'R',
}

const recentMatches = [
  { id: 1, opponent: 'Serhii', result: 'Win', ratingChange: '+12', moves: 42 },
  { id: 2, opponent: 'Taulant', result: 'Loss', ratingChange: '-8', moves: 35 },
  { id: 3, opponent: 'Tatiana', result: 'Draw', ratingChange: '+0', moves: 58 },
]

const friends = [
  { id: 1, name: 'Serhii', rating: 1812, status: 'online' },
  { id: 2, name: 'Taulant', rating: 1694, status: 'playing' },
  { id: 3, name: 'Tatiana', rating: 1740, status: 'online' },
  { id: 4, name: 'Alima', rating: 1658, status: 'offline' },
]

const statusLabels = {
  online: 'Online',
  playing: 'In game',
  offline: 'Offline',
}

function getResultBadgeClass(result) {
  if (result === 'Win') {
	return 'badge badge-win'
  }

  if (result === 'Loss') {
	return 'badge badge-loss'
  }

  return 'badge badge-draw'
}

function Profile() {
  return (
	<AppLayout
	  eyebrow="Personal account"
	  title="My profile"
	  actions={
		<button className="btn btn-primary" type="button">
		  <i className="ti ti-camera" aria-hidden="true" />
		  Change avatar
		</button>
	  }
	>
	  <div className="profile-grid">
		<section className="profile-card card profile-summary" aria-labelledby="profile-title">
		  <div className="card-body profile-summary-body">
			<div className="avatar avatar-xl avatar-ring profile-avatar" aria-hidden="true">
			  {userProfile.avatarInitial}
			</div>

			<div className="profile-heading">
			  <p className="label">Player profile</p>
			  <h2 id="profile-title">{userProfile.username}</h2>
			  <p className="text-secondary">Your ChessMate personal account</p>
			</div>

			<div className="profile-info-list" aria-label="Profile details">
			  <div className="profile-info-row">
				<span className="text-muted">Rating</span>
				<strong className="text-primary">{userProfile.rating}</strong>
			  </div>
			  <div className="profile-info-row">
				<span className="text-muted">Email</span>
				<strong className="text-primary truncate">{userProfile.email}</strong>
			  </div>
			</div>

			<button className="btn btn-ghost btn-full" type="button">
			  <i className="ti ti-camera" aria-hidden="true" />
			  Change avatar
			</button>
		  </div>
		</section>

		<section className="profile-card card profile-history" aria-labelledby="history-title">
		  <div className="profile-card-header">
			<div>
			  <p className="label">Games</p>
			  <h2 id="history-title">Match history</h2>
			</div>
			<span className="badge badge-accent">Preview</span>
		  </div>

		  <div className="card-body profile-list">
			{recentMatches.map((match) => (
			  <article className="profile-list-row" key={match.id}>
				<div className="min-w-0">
				  <p className="text-primary truncate">vs {match.opponent}</p>
				  <p className="text-muted">{match.moves} moves</p>
				</div>
				<div className="profile-match-meta">
				  <span className={getResultBadgeClass(match.result)}>{match.result}</span>
				  <span className="text-muted">{match.ratingChange}</span>
				</div>
			  </article>
			))}
		  </div>
		</section>

		<section className="profile-card card profile-friends" aria-labelledby="friends-title">
		  <div className="profile-card-header">
			<div>
			  <p className="label">Community</p>
			  <h2 id="friends-title">Friends list</h2>
			</div>
			<span className="badge badge-accent">{friends.length}</span>
		  </div>

		  <div className="card-body profile-list">
			{friends.map((friend) => (
			  <article className="profile-list-row" key={friend.id}>
				<div className="flex items-center gap-3 min-w-0">
				  <div className="avatar avatar-md profile-friend-avatar" aria-hidden="true">
					{friend.name[0]}
				  </div>
				  <div className="min-w-0">
					<p className="text-primary truncate">{friend.name}</p>
					<p className="text-muted">Rating {friend.rating}</p>
				  </div>
				</div>

				<div className="profile-status">
				  <span className={`status-dot ${friend.status}`} aria-hidden="true" />
				  <span>{statusLabels[friend.status]}</span>
				</div>
			  </article>
			))}
		  </div>
		</section>
	  </div>
	</AppLayout>
  )
}

export default Profile
