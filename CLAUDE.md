# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

React + TypeScript (Vite) admin frontend for the voucher system. It talks to the Spring Boot
backend in the sibling repo `../voucher-app` over HTTP. The UI and all domain labels are in
Polish (e.g. voucher `realized` status shows as `Tak`/`Nie`).

## Commands

```bash
npm install
npm run dev        # Vite dev server (default http://localhost:5173)
npm run build      # tsc -b type-check, then vite build -> dist/
npm run lint       # eslint over the repo
npm run preview    # serve the production build locally
```

There are no tests in this project. `npm run build` runs `tsc -b` first, so a type error
fails the build — treat the type-check as the gate.

## Architecture

- `src/main.tsx` → `src/App.tsx` is the root. `App` owns two pieces of global state:
  `darkMode` (persisted to `localStorage` under `theme`, applied via the
  `data-theme` attribute on `.app-container`) and `isLoggedIn`.
- **Routing/auth**: `react-router-dom` v7. Only `/login` and `/add-realize` are public.
  Every other route (`/`, `/add`, `/deleted`, `/sent`, `/report`, `/custom-report`,
  `/date-range`) is rendered **only when `isLoggedIn` is true** — they are conditionally
  mounted inside `App`, not guarded by a wrapper component. Login is a hardcoded
  client-side password check in `components/Login/Login.tsx` with no token or persistence,
  so a page refresh logs the user out. There is no server-side auth.
- **Components** live one-folder-each under `src/components/<Name>/` as `<Name>.tsx` +
  `<Name>.css`. Follow that pattern for new components.
- **API layer**: all HTTP lives in `src/services/` (`voucherService`, `notificationService`,
  `reportService`) using `axios`. Components import these functions rather than calling axios
  directly. Each service hardcodes its base URL to `http://localhost:8080/api/...` — there is
  no env-based config, so changing the backend host means editing each service file. Report
  endpoints use `responseType: "blob"` for PDF downloads.
- **Models**: `src/models/Voucher.ts` and `DeletedVoucher.ts` mirror the backend record DTOs.
  Keep these in sync with `../voucher-app` DTOs when the API shape changes.

## Notes

- This is the source for the build that gets copied into the backend's
  `src/main/resources/static/dist/` and served at the backend root. A `dist/` is also checked
  in here.
- ESLint is flat-config (`eslint.config.js`) with `typescript-eslint` + React Hooks/Refresh
  plugins; `dist` is ignored.
- README.md is the unmodified Vite template and not project-specific.
