# Aditya Mohan Srivastava — Portfolio

A multipage personal portfolio featuring projects, experience, skills, certificates, and résumés, with light and dark themes.

## Development

Use the pnpm version pinned in package.json.

```sh
pnpm install --frozen-lockfile
pnpm exec next dev
```

## Verification

```sh
pnpm exec tsc --noEmit
node scripts/verify-portfolio.mjs
pnpm exec next build --webpack
```
