# Funix Upskill Q2 2026 — Assignment Dashboard

Live, zero-backend dashboard that tracks every learner's weekly assignment status
(Tuần 0–8) for the Funix Q2 2026 upskill program. Static HTML on GitHub Pages;
data is fetched **live at runtime** from the Google Sheet the 7 forms feed into.

**Live URL:** https://timtran1008.github.io/funix-upskill-dashboard/

## What it shows

- A learner × week matrix: ✓ on-time · ⚠ late · ✗ missing (past deadline) · · not-yet-due · ◇ group week (T7/T8)
- Per-team sections (Team B2B · Team Sale + MKT B2C · Hannah & mentor khảo thí đào tạo)
- At-risk learners (≥2 missing, or not started) sorted to the top with a flag
- KPIs: headcount, % submitted, % on-time, # at-risk
- Per-learner completion bar
- Deadlines computed from the real schedule (T0 30/05 → T6 04/07; T7/T8 group)

## Privacy model — read before wiring real data

- **The repo contains NO learner data.** Only code + the sheet ID/gids. Names,
  submissions, and roster are pulled live from the Google Sheet by the browser.
- **But the live page renders real names once wired**, and free GitHub Pages is
  public. To read the sheet, `gviz` needs it shared "anyone with link → Viewer".
  Net effect: anyone who has the dashboard URL can see who is behind on homework.
- Decide with that in mind. Options if you want it private:
  - Keep the sheet link-restricted and run `index.html` locally (open the file) — no GitHub.
  - Use a private repo + GitHub Pages (needs GitHub Pro).
  - Accept the public URL (unguessable path) — matches the existing TNA-tool model.

## Going live — one-time wiring (~5 min)

Edit **`config.js`** only:

1. Open the master responses spreadsheet (the one the 7 forms write to).
2. Share → "Anyone with the link" → **Viewer**.
3. Copy the spreadsheet ID from its URL and paste into `SHEET_ID`.
4. For each weekly response tab, read its `gid` from the tab URL (`...#gid=NNN`)
   and paste into the matching `weeks[].gid`.
5. (Optional) Add a tab `Roster` with columns **Name | Email | Team** to track
   who *hasn't* submitted; put its gid into `roster.gid`.
6. Commit + push. The page updates automatically as submissions arrive.

The red **SAMPLE DATA** badge becomes a green **LIVE** badge once `SHEET_ID` is set.

## Known data caveat

The 7 forms' "Bạn thuộc nhóm nào?" still use the pre-lock choices
(Sale B2C / Sale B2B / Hannah / Mentor), not the locked 3-team roster. `config.js`
`teams[].formValues` maps the old choices onto the 3 teams. If you update the
forms' group choices, update `formValues` to match.

## Files

| File | Role |
|------|------|
| `index.html` | Markup + styles |
| `app.js` | Fetch (gviz JSON) + parse + status logic + render |
| `config.js` | **The only file to edit** — sheet ID, gids, teams, schedule |
| `sample-data.js` | Fictional demo data; ignored once `SHEET_ID` is set |

## Source of truth

Master copy lives in the vault at
`01_Projects/Client-Service/C105_funix/upskill-program-q2-2026/dashboard/`.
This GitHub repo is the deploy mirror (same pattern as `ai-readiness-diagnostics`).
