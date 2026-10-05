# Changes

- [x] Calendar pill click opens an event detail modal; its Edit action fetches the full event first so multi-instance properties (recurrence, alarms, attendees) reach the editor intact — closes a CalDAV round-trip collapse of duplicate properties (2026-09-28, `03ebb58`, `cf5d652`, `b66dcbb`).
- [x] New-calendar creation dialog accepts an `.ics` file to import events at creation time (2026-09-28, `655cd02`).

- [x] Use AM/PM instead of 24hr time in the web ui
- [x] Do not show a calendar unless it is selected
- [x] Page height should be 100% of the viewport with no scrollbars. Same for width. (USe bootstrap methods)

# Fixes

- [x] notify_send job chains multiplied: every alarm_scan pass unconditionally re-enqueued a notify_send, and each new chain did the same on its next tick. durable_jobs grew ~44M rows in 8 days in a running deployment. Fixed with `db::jobs::enqueue_unless_pending` — an atomic insert that skips when an unfinished job of the type exists (except the caller's own running job). alarm_scan and notify_send both reschedule through it. One-time cleanup of the duplicate pending rows handled manually; the 7-day retention delete in `retention_purge` prunes completed history (2026-10-05, `402bf26`).
- [x] Pooled DB connections served stale cached plans for `SELECT *` after schema changes ("cached plan must not change result type"). `max_lifetime: 10 minutes` added to `PgPoolOptions` (2026-10-05, `a7e876e`).

- [x] Admin page audit log rendered `[object Object]` in the Summary column — `change_summary` is a JSON object (`{path, status}`) and `admin.js` printed it raw. Now renders `path (status)` (2026-09-27).
- [x] Moving an event to another calendar from Thunderbird failed with 403. TB reuses the event's UID as the target filename; canonical `<uuid>.ics` URLs derive the row's `events.id`, which is a globally-unique primary key, so the same URL in a second calendar collided on the PK and was mislabeled as a uid conflict. `put_series` now pre-checks the collision and stores the href explicitly with a fresh row id, keeping the URL resolvable. Regression tests: DB unit test + interop suite step (2026-09-28, `daf1095`).
- [x] Calendar sidebar collapses into the far left sidebar - this should be redesigned
- [x] What exactly are tasks? That should be removed.
- [x] The datetime selector in the calendar webui is using 24hr time, not AM/PM - this was missed during the above changes.
- [ ] When the calendar first loads, no events show. Click on the calendar label again and the events show. Strange bug
  - Root cause is inside the vendored bs-calendar 2.4.0 bundle (confirmed the latest upstream release, github.com/ThomasDev-de/bs-calendar — not a version we're behind on): its week view computes a wrong internal fetch/paint date range (verified: same wrong range regardless of `startDate`/`date` construction options, `setDate()`/`setToday()`, or destroy+reconstruct). That same wrong range gates which returned appointments get painted, not just what gets fetched. Our `url`/`requestData` usage matches their documented contract exactly, so this isn't a misuse on our side.
  - Applied and kept: lazy-construct the widget only once a calendar is actually selected (was being built while hidden), and compute the fetch's date range from the rendered day-header cells (`.wc-day-header[data-date]`) instead of trusting the plugin's own `requestData.fromDate/toDate`. This makes the outgoing `/occurrences` request correct, but appointments still don't render — the separate paint-side range check inside the bundle is unreachable from any public API and needs a vendor patch or a fixed release upstream. Worth filing as an issue against the library.
  - Default view switched to `month` (2026-09-12). Confirmed the same upstream defect hits month view too, and worse: on first load it rendered "June 2026" with the 10th highlighted as today, instead of September 2026/the 12th. No DOM-based fetch-range mitigation applied for month view yet (only week view has one) — this is a known, accepted limitation, not a regression.