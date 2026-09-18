# ChessMate Frontend

The frontend is a React + Vite single-page application for ChessMate. It handles authentication screens, the authenticated dashboard, profile management, friends, chat, the quick match lobby, and real-time multiplayer chess gameplay.

## Tech Stack

- React 19
- Vite
- React Router
- Socket.IO Client
- chess.js
- react-chessboard
- Tabler Icons
- ESLint

## Getting Started

Install dependencies and start the development server from the `frontend` directory:

```bash
npm install
npm run dev
```

Build and preview the production bundle:

```bash
npm run build
npm run preview
```

## Available Scripts

- `npm run dev` - starts the Vite development server
- `npm run build` - creates a production build
- `npm run preview` - serves the production build locally
- `npm run lint` - runs ESLint

## Backend Connection

The frontend uses the same origin for HTTP and Socket.IO traffic:

- REST requests are sent through the shared client in `src/api/httpClient.js`
- Socket.IO is initialized in `src/socket/socket.js`
- requests include cookies through `credentials: include`

During local Docker development, Vite proxies backend routes:

- `/api` -> `http://backend:3000`
- `/uploads` -> `http://backend:3000`
- `/socket.io` -> `http://backend:3000`

## Project Structure

```text
frontend/
  src/
    api/          REST API clients
    assets/       theme backgrounds and static assets
    avatars/      local avatar assets
    components/   shared UI, layout, chess board, and modals
    context/      auth, theme, socket, and presence providers
    hooks/        matchmaking, multiplayer game, friends, and chat hooks
    pages/        route-level pages
    socket/       Socket.IO client setup
    utils/        chess guide and game statistics helpers
```

## Main Routes

- `/login` and `/register` - public authentication pages
- `/dashboard` - authenticated home page with user stats and actions
- `/game-lobby` and `/game` - active game lookup and quick match entry
- `/game/:gameId` - real-time multiplayer chess game
- `/profile` - profile editing and avatar upload
- `/friends` - user search, friend requests, friends list, and presence
- `/chat` - conversations and messages
- `/privacy-policy` and `/terms-of-service` - public legal pages

Protected pages are wrapped by `ProtectedRoute`; login and registration are wrapped by `PublicOnlyRoute`.

## State and Real-Time Flow

- `AuthProvider` restores the current user with `/api/auth/me` and exposes login, register, logout, refresh, and replace helpers.
- `ThemeProvider` stores the selected theme in `localStorage` and applies it through `data-theme`.
- `SocketProvider` connects Socket.IO after authentication and disconnects it after logout.
- `PresenceProvider` tracks online users through the shared socket connection.
- `useMatchmaking` manages the quick match queue and redirects to `/game/:gameId` after a match is created.
- `useMultiplayerGame` joins the game room, receives authoritative `game:state` snapshots, sends moves, and handles resignation.

## Player Analytics

The dashboard includes a small analytics/statistics section for the authenticated player. It loads game history through `GET /api/games`, combines it with the current user from `AuthProvider`, and calculates frontend display metrics in `src/utils/gameStatistics.js`.

Displayed analytics:

- current player rating
- completed games count
- win rate percentage
- completed games over the last 7 days
- five most recent completed games

Related components:

- `src/pages/Dashboard.jsx` - loads games and renders the analytics section
- `src/utils/gameStatistics.js` - calculates total games, wins, win rate, recent games, and weekly activity
- `src/components/WeeklyActivityChart.jsx` - renders the 7-day activity chart
- `src/components/MatchHistory.jsx` - renders recent games and result badges

## Custom Design System - minor (1 point)

The frontend includes a custom design system built specifically for the ChessMate interface. It is centered around reusable React UI primitives, shared CSS styles, theme tokens, and a consistent visual language across authentication pages, the dashboard, the game lobby, multiplayer chess screens, profile management, friends, chat, and modal views.

**Components:** `frontend/src/components/ui.jsx`

**Styles and tokens:**

- `frontend/src/index.css` - global styles, shared utility classes, and base theme variables
- `frontend/src/pages/App.css` - application shell, panels, dashboard, game, friends, chat, and responsive layouts
- `frontend/src/pages/Auth.css` - login and registration screens
- `frontend/src/components/Modal.css` - shared modal presentation

### Includes

- **Color palette:** The design system defines dark and light themes with CSS variables for backgrounds, surfaces, elevated panels, borders, text colors, accent actions, destructive actions, success states, errors, and online/offline indicators.
- **Typography:** Shared font families, font sizes, font weights, and line heights keep headings, labels, body text, buttons, forms, tables, messages, and compact UI elements visually consistent.
- **Icons:** The reusable `Icon` component wraps Tabler Icons, allowing pages and components to use icon names instead of duplicating icon markup.
- **Reusable components:** More than 10 shared UI components are used across the app for forms, actions, panels, lists, alerts, badges, tables, tabs, and chat messages.
- **Theme support:** `ThemeProvider` stores the selected theme in `localStorage`, applies it through `data-theme`, and powers the shared `ThemeToggle`.
- **Application layout:** `AppLayout`, `Sidebar`, `LegalFooter`, and `LeaderboardModal` provide a consistent authenticated shell for the main product pages.

### Reusable Components

`Icon`, `Button`, `IconButton`, `Input`, `InputIconButton`, `FormField`, `Badge`, `Alert`, `EmptyState`, `StatusDot`, `Panel`, `PanelHeader`, `PanelBody`, `Toolbar`, `ActionCard`, `StatCell`, `ListRow`, `Tabs`, `Tab`, `Table`, `MessageBubble`.

### Used In

These components are actively used across authentication forms, dashboard cards and statistics, profile editing, avatar upload, friends and presence rows, chat conversations, quick match lobby states, multiplayer chess controls, leaderboard views, user profile modals, game over modals, and the chess guide.

This keeps layout, forms, actions, panels, lists, alerts, badges, messages, and game controls consistent across the frontend.
