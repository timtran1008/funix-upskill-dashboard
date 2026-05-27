/* =============================================================================
   Funix Upskill Q2 2026 — Dashboard config
   -----------------------------------------------------------------------------
   This is the ONLY file Tim edits to wire the live data. No PII lives here —
   only Google Sheet IDs + tab gids. All names / submissions / roster are
   fetched LIVE from the shared sheet(s) at runtime.

   PREREQUISITE: each weekly Google Form must be linked to a Google Sheet
   (Form -> Responses tab -> Link to Sheets). That is what makes responses
   web-readable. Two ways to wire, pick one:

   --- OPTION A (recommended): ONE master sheet, 7 tabs --------------------------
     1. Form Tuần 0 -> Responses -> Link to Sheets -> "Create a new spreadsheet".
     2. Forms Tuần 1..6 -> Responses -> Link to Sheets -> "Select existing" ->
        pick the SAME spreadsheet. (Now it has 7 tabs.)
     3. Share that spreadsheet: "Anyone with the link" -> Viewer.
     4. Paste its ID into SHEET_ID below (the part of the URL between /d/ and /edit).
     5. Open each tab, copy the gid from the URL (...#gid=NNN) into weeks[].gid.

   --- OPTION B: one sheet per form --------------------------------------------
     1. Each form -> Responses -> Link to Sheets -> "Create a new spreadsheet".
     2. Share each spreadsheet "Anyone with the link" -> Viewer.
     3. Paste each spreadsheet's ID into the matching weeks[].sheetId.
        Leave weeks[].gid blank — it defaults to the first (responses) tab.

   Roster (optional, to track who HASN'T submitted): make a sheet/tab with
   columns Name | Email | Team, share it, put its id+gid into `roster`.

   Until anything is wired, the dashboard renders bundled SAMPLE data with a red
   "SAMPLE DATA" badge. Linking a form also back-fills responses already submitted.
   ============================================================================= */

window.FUNIX_CONFIG = {
  cohort: 'Funix Upskill Q2 2026',
  timezone: '+07:00',                 // VN time, used for deadline comparison

  // OPTION A: paste the ONE master spreadsheet ID here (default for all weeks).
  // OPTION B: leave '' and fill weeks[].sheetId per form instead.
  // WIRED 2026-05-27: all 7 forms linked to one master sheet (tabs "Form Responses 1..7").
  SHEET_ID: '1hI80rkNtOONrbYgdDfMGCcK3zZHGoNk5Wm3CyhdHV3U',

  // The three locked teams (roster May 22 — PTCT dropped).
  // `formValues` maps the OLD "Bạn thuộc nhóm nào?" form choices onto each team,
  // because the 7 forms still use the pre-lock choices (Sale B2C / Sale B2B /
  // Hannah / Mentor). Tim: if you update the forms' group choices, update these.
  teams: [
    { id: 'b2b',     name: 'Team B2B',                         coachingDay: 'Thứ Hai', formValues: ['Sale B2B'] },
    { id: 'saleMkt', name: 'Team Sale + MKT B2C',              coachingDay: 'Thứ Tư',  formValues: ['Sale B2C'] },
    { id: 'hannah',  name: 'Hannah & mentor khảo thí đào tạo', coachingDay: 'Thứ Năm', formValues: ['Hannah', 'Mentor'] },
  ],

  // Optional roster for "who hasn't submitted" tracking (columns Name|Email|Team).
  // To enable: add a tab to the master sheet (e.g. named "Roster") and set
  // sheetName below. Without it, the dashboard shows only people who submitted.
  roster: { sheetId: '', sheetName: 'Roster', gid: '' },

  // The 8-week assignment schedule. `deadline` = 24h before the Sunday plenary
  // (Sat 14:00 VN), per the syllabus. `source: 'form'` weeks auto-track from
  // their linked tab; `source: 'group'` weeks (T7/T8) are group/manual.
  // Tab selector precedence: sheetName > gid > (own sheet's first tab).
  //   sheetName : the response tab name (Option A, master sheet — used here).
  //   sheetId   : per-form spreadsheet id (Option B); '' = use master SHEET_ID.
  //   gid       : numeric tab gid (alternative to sheetName).
  weeks: [
    { key: 'T0', label: 'T0 · Cài đặt',        deadline: '2026-05-30T14:00:00', source: 'form',  sheetName: 'Form Responses 1', sheetId: '', gid: '' },
    { key: 'T1', label: 'T1 · 4 Biết/Giao',    deadline: '2026-05-30T14:00:00', source: 'form',  sheetName: 'Form Responses 2', sheetId: '', gid: '' },
    { key: 'T2', label: 'T2 · Biết Gõ',        deadline: '2026-06-06T14:00:00', source: 'form',  sheetName: 'Form Responses 3', sheetId: '', gid: '' },
    { key: 'T3', label: 'T3 · Biết Gạn',       deadline: '2026-06-13T14:00:00', source: 'form',  sheetName: 'Form Responses 4', sheetId: '', gid: '' },
    { key: 'T4', label: 'T4 · Vòng lặp',       deadline: '2026-06-20T14:00:00', source: 'form',  sheetName: 'Form Responses 5', sheetId: '', gid: '' },
    { key: 'T5', label: 'T5 · profile.md',     deadline: '2026-06-27T14:00:00', source: 'form',  sheetName: 'Form Responses 6', sheetId: '', gid: '' },
    { key: 'T6', label: 'T6 · PARA',           deadline: '2026-07-04T14:00:00', source: 'form',  sheetName: 'Form Responses 7', sheetId: '', gid: '' },
    { key: 'T7', label: 'T7 · Bảng tổng hợp',  deadline: '2026-07-16T09:00:00', source: 'group', sheetName: '', sheetId: '', gid: '' },
    { key: 'T8', label: 'T8 · Nghiệm thu',     deadline: '2026-07-23T09:00:00', source: 'group', sheetName: '', sheetId: '', gid: '' },
  ],
};
