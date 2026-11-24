# Testing

## Unit tests (Vitest, via the Angular CLI)

```bash
npm test          # watch mode
npm run test:ci   # single run
```

Shared helpers live in `src/testing/fixtures.ts` (`makeItem`, `makeUser`, `typeInto`, …). They are excluded from the app build.

| Area | Spec files | What is covered |
| --- | --- | --- |
| Services | `core/services/*/*.spec.ts` | URL, HTTP method, request body and response mapping for items and customers; `BasketService` (add/merge, update, remove, clear, count, immutability); `ThemeService` (OS default, saved choice, toggle, `data-bs-theme`) |
| Mappers | `core/mappers/mappers.spec.ts` | stock urgency mapping, trimming, missing nested fields |
| Forms | `pages/forms/**` | every validation rule and message, 255-char counter, email split, calling code without "+" (sent back with "+"), loading/error states, navigation after save, cancel, read-only mode |
| Items / customers pages | `pages/items/**`, `pages/users/**` | search, paging (8 per page), card colours and image fallback, table columns and buttons, create/update/display wiring, routes |
| Home | `pages/home/**` | counts, low-stock list (lowest first, max 5), Restock links, loading placeholders, backend-down warning |
| Basket | `pages/basket/**`, `display-item` | empty state, table rows are real `<tr>`s, line totals, total, amount changes go through the service, invalid amounts are reset, remove, Add to basket on the item page |
| Layout / app | `layout/**`, `app.spec.ts` | header links and active state, mobile toggler target, basket badge, theme toggle, footer, top-level routes |

## E2E tests (Playwright)

```bash
npx playwright install chromium   # once
npm run e2e
```

`playwright.config.ts` starts `ng serve` itself. The real backend is **not** needed: `e2e/support/mock-backend.ts`
intercepts `http://localhost:9001`, keeps what you create/update in memory and records every request, so tests check both
the screen and the exact payload. Set `PW_CHROME_PATH=/path/to/chrome` to use an installed Chrome instead.

| Spec | Scenarios |
| --- | --- |
| `items.spec.ts` | create, invalid form not saved, update, cancel update, overview → detail → edit |
| `customers.spec.ts` | create (types `32`, sends `+32`), invalid form not saved, update, cancel update |
| `navigation.spec.ts` | header → listings → Add Item / Add Customer, basket button |
| `home.spec.ts` | counts + Restock link, backend-down warning |
| `theme.spec.ts` | dark theme survives reload and navigation, first visit follows the OS |
| `basket.spec.ts` | add from the item page, change amounts, invalid amount reset, remove, total and badge; Place order placeholder |

## App fixes included

- Create/update item pages no longer navigate on their own (the form does it); this removed the broken `/item/:id` route.
- Customer table: first/last name cells match their headers.
- Calling code: digits only behind the "+" label (placeholder `32`, number keyboard); `+` is stripped when loading and added back when saving.
