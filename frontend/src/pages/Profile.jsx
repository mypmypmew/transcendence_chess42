import AppLayout from '../components/AppLayout'
import './App.css'

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
	  <div className="cm-profile-grid">
		<section className="cm-panel" aria-labelledby="profile-title">
		  <div className="cm-panel-body flex flex-col items-center gap-5 text-center">
			<div className="avatar avatar-xl avatar-ring cm-avatar-photo" aria-hidden="true">
			  {userProfile.avatarInitial}
			</div>

			<div>
			  <p className="label">Player profile</p>
			  <h2 className="cm-section-title" id="profile-title">{userProfile.username}</h2>
			  <p className="cm-muted">Your ChessMate personal account</p>
			</div>

			<div className="cm-list" aria-label="Profile details">
			  <div className="cm-list-row">
				<i className="ti ti-chart-bar text-accent" aria-hidden="true" />
				<span className="cm-muted">Rating</span>
				<strong className="text-primary">{userProfile.rating}</strong>
			  </div>
			  <div className="cm-list-row">
				<i className="ti ti-mail text-accent" aria-hidden="true" />
				<span className="cm-muted">Email</span>
				<strong className="text-primary truncate">{userProfile.email}</strong>
			  </div>
			</div>

			<button className="btn btn-ghost btn-full" type="button">
			  <i className="ti ti-camera" aria-hidden="true" />
			  Change avatar
			</button>
		  </div>
		</section>

		<section className="cm-panel" aria-labelledby="history-title">
		  <div className="cm-panel-header">
			<div>
			  <p className="label">Games</p>
			  <h2 className="cm-section-title" id="history-title">Match history</h2>
			</div>
			<span className="badge badge-accent">Preview</span>
		  </div>

		  <div className="cm-panel-body cm-list">
			{recentMatches.map((match) => (
			  <article className="cm-list-row" key={match.id}>
				<i className="ti ti-chess text-accent" aria-hidden="true" />
				<div className="min-w-0">
				  <p className="text-primary truncate">vs {match.opponent}</p>
				  <p className="cm-muted">{match.moves} moves</p>
				</div>
				<div className="flex items-center gap-2">
				  <span className={getResultBadgeClass(match.result)}>{match.result}</span>
				  <span className="cm-muted">{match.ratingChange}</span>
				</div>
			  </article>
			))}
		  </div>
		</section>

		<section className="cm-panel" aria-labelledby="friends-title">
		  <div className="cm-panel-header">
			<div>
			  <p className="label">Community</p>
			  <h2 className="cm-section-title" id="friends-title">Friends list</h2>
			</div>
			<span className="badge badge-accent">{friends.length}</span>
		  </div>

		  <div className="cm-panel-body cm-list">
			{friends.map((friend) => (
			  <article className="cm-list-row" key={friend.id}>
				<div className="avatar avatar-md cm-avatar-photo" aria-hidden="true">
				  {friend.name[0]}
				</div>
				<div className="min-w-0">
				  <p className="text-primary truncate">{friend.name}</p>
				  <p className="cm-muted">Rating {friend.rating}</p>
				</div>

				<div className="flex items-center gap-2 cm-muted">
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
