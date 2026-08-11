# Data Safety Rules (DO NOT VIOLATE)

The PostgreSQL database behind this backend may contain real user/production data
(products, orders, carts, users). The following rules are absolute:

1. NEVER run destructive operations (`deleteMany`, `delete`, `$executeRaw` DELETE/DROP,
   `truncate`) against this database with the intent to "clean up".
2. If cleanup of test data is ever required, delete ONLY the exact rows that were
   created during the current session for testing purposes, scoped by the specific
   IDs/emails that the session itself created (e.g. `where: { id: { in: [...] } }`).
   Never unfiltered `deleteMany()`.
3. Before any deletion, first run a `findMany`/`count` to list exactly what will be
   deleted, and confirm the target set contains ONLY the session's own test rows.
4. Never delete rows belonging to the user (`subukhatiwada123@gmail.com`, admin, or any
   non-test account) or any product/order the user created.
5. Prefer non-destructive verification (create + cleanup of your own rows, or no
   cleanup at all) whenever possible. When in doubt, delete nothing and ask.

Rule of thumb: if a row could have been created by anyone other than the current
test session, do not delete it.
