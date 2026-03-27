# Telisik UI

Frontend for Telisik

## Stack

- React
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Backend API Documentation

[https://api.telisik.org/docs/](https://api.telisik.org/docs/)

## Deployment Notes (Vercel + CORS)

- Frontend defaults to same-origin API calls (`VITE_API_BASE` empty), then:
  - local dev uses Vite `server.proxy`
  - Vercel uses `vercel.json` rewrites
- This avoids browser CORS errors because requests are sent to your own domain first.

### Recommended Vercel Environment Variables

- `VITE_API_BASE=` (empty)
- `VITE_WS_BASE=wss://api.telisik.org` (or your websocket gateway)

If `VITE_API_BASE` is set to `https://api.telisik.org`, browser calls become cross-origin again and can fail due to backend CORS policy.
