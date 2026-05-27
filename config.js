/* =============================================================================
   Funix Upskill Q2 2026 — Dashboard config
   -----------------------------------------------------------------------------
   This is the ONLY file Tim edits to wire the live data. No PII lives here —
   only the Google Sheet ID + the numeric tab id (gid) of each week's responses.
   All names / submissions / roster are fetched LIVE from the shared sheet.

   HOW TO WIRE THE LIVE SHEET (one-time, ~5 min):
     1. Open the master responses spreadsheet (the one the 7 Google Forms feed).
     2. Share it: "Anyone with the link" -> "Viewer".  (Required for gviz fetch.)
     3. Copy the spreadsheet ID from its URL:
          docs.google.com/spreadsheets/d/<<THIS PART>>/edit
        -> paste into SHEET_ID below.
     4. For each week's response tab, open it and read the gid from the URL:
          ...../edit#gid=<<THIS NUMBER>>
        -> paste into the matching WEEKS[].gid below.
     5. (Optional, for "who hasn't submitted" tracking) Add a tab named "Roster"
        with columns: Name | Email | Team. Put its gid into ROSTER.gid.
     6. Commit + push. The live URL updates automatically as forms come in.

   Until SHEET_ID is filled, the dashboard renders bundled SAMPLE data so the
   layout is reviewable. A red "SAMPLE DATA" badge shows when not yet live.
   ============================================================================= */

window.FUNIX_CONFIG = {
  cohort: 'Funix Upskill Q2 2026',
  timezone: '+07:00',                 // VN time, used for deadline comparison

  // Paste the spreadsheet ID here to go live. Leave '' to use sample data.
  SHEET_ID: '',

  // The three locked teams (roster May 22 — PTCT dropped).
  // `formValues` maps the OLD "Bạn thuộc nhóm nào?" form choices onto each team,
  // because the 7 forms still use the pre-lock choices (Sale B2C / Sale B2B /
  // Hannah / Mentor). Tim: if you update the forms' group choices, update these.
  teams: [
    { id: 'b2b',     name: 'Team B2B',                         coachingDay: 'Thứ Hai', formValues: ['Sale B2B'] },
    { id: 'saleMkt', name: 'Team Sale + MKT B2C',              coachingDay: 'Thứ Tư',  formValues: ['Sale B2C'] },
    { id: 'hannah',  name: 'Hannah & mentor khảo thí đào tạo', coachingDay: 'Thứ Năm', formValues: ['Hannah', 'Mentor'] },
  ],

  // Optional roster tab for "who hasn't submitted" tracking.
  // Without it, the dashboard shows only people who submitted at least once.
  roster: { gid: '' },

  // The 8-week assignment schedule. `deadline` = 24h before the Sunday plenary
  // (Sat 14:00 VN), per the syllabus. `source: 'form'` weeks are auto-tracked
  // from their response tab; `source: 'group'` weeks (T7/T8) are group/manual
  // deliverables shown for context.
  weeks: [
    { key: 'T0', label: 'T0 · Cài đặt',        deadline: '2026-05-30T14:00:00', source: 'form',  gid: '' },
    { key: 'T1', label: 'T1 · 4 Biết/Giao',    deadline: '2026-05-30T14:00:00', source: 'form',  gid: '' },
    { key: 'T2', label: 'T2 · Biết Gõ',        deadline: '2026-06-06T14:00:00', source: 'form',  gid: '' },
    { key: 'T3', label: 'T3 · Biết Gạn',       deadline: '2026-06-13T14:00:00', source: 'form',  gid: '' },
    { key: 'T4', label: 'T4 · Vòng lặp',       deadline: '2026-06-20T14:00:00', source: 'form',  gid: '' },
    { key: 'T5', label: 'T5 · profile.md',     deadline: '2026-06-27T14:00:00', source: 'form',  gid: '' },
    { key: 'T6', label: 'T6 · PARA',           deadline: '2026-07-04T14:00:00', source: 'form',  gid: '' },
    { key: 'T7', label: 'T7 · Bảng tổng hợp',  deadline: '2026-07-16T09:00:00', source: 'group', gid: '' },
    { key: 'T8', label: 'T8 · Nghiệm thu',     deadline: '2026-07-23T09:00:00', source: 'group', gid: '' },
  ],
};
