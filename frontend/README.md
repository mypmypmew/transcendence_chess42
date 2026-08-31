# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



## Custom Design System - minor (1 point)

The frontend includes a custom-made design system built specifically for the ChessMate interface. It is centered around reusable React UI primitives, shared CSS design tokens, and a consistent visual language across

**Components:** `frontend/src/components/ui.jsx` 
 
**Styles and tokens:** shared CSS files in `frontend/src/`: 
- global styles 
- app layout styles 
- auth styles 
- modal styles

### Includes

- **Color palette:** The design system defines a proper color palette using CSS variables for dark and light themes, surfaces, accent colors, borders, text colors, and semantic states like win, loss, draw, online, error and destructive actions.
- **Typography:** shared font families, font sizes, font weights, and line heights. This keeps headings, labels, body text, buttons, forms, and compact UI elements visually consistent.
- **Icons:** reusable `Icon` component using Tabler Icons. This allows pages and components to use icons consistently by passing icon names instead of duplicating icon markup.
- **Reusable components:** more than 10 shared UI components used across the app.

### Reusable Components 

`Icon`, `Button`, `IconButton`, `Input`, `InputIconButton`, `FormField`, `Badge`, `Alert`, `EmptyState`, `StatusDot`, `Panel`, `PanelHeader`, `PanelBody`, `Toolbar`, `ActionCard`, `StatCell`, `ListRow`, `Tabs`, `Tab`, `Table`, `MessageBubble`.

### Used In

These components are actively used throughout the application to keep layout, forms, actions, panels, lists, alerts, badges, and messages consistent.