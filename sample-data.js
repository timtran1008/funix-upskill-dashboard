/* =============================================================================
   Sample data — used ONLY when config.SHEET_ID is empty, so the layout is
   reviewable before the live sheet is wired. Fictional names. Delete-safe:
   once SHEET_ID is set, this file is ignored.

   `asOf` pins a fake "now" so the sample shows a realistic mix of on-time /
   late / missing. In LIVE mode the dashboard uses the real current time.
   ============================================================================= */

window.FUNIX_SAMPLE = {
  asOf: '2026-07-06T10:00:00+07:00',   // pretend it's just after the T6 deadline

  // {name, email, teamId}  (teamId matches config.teams[].id)
  roster: [
    { name: 'Nguyễn Văn An',    email: 'an.nv@funix.test',    teamId: 'b2b' },
    { name: 'Trần Thị Bình',    email: 'binh.tt@funix.test',  teamId: 'b2b' },
    { name: 'Lê Hoàng Cường',   email: 'cuong.lh@funix.test', teamId: 'b2b' },
    { name: 'Phạm Thu Dung',    email: 'dung.pt@funix.test',  teamId: 'b2b' },
    { name: 'Vũ Minh Đức',      email: 'duc.vm@funix.test',   teamId: 'saleMkt' },
    { name: 'Đỗ Thị Hà',        email: 'ha.dt@funix.test',    teamId: 'saleMkt' },
    { name: 'Bùi Quang Huy',    email: 'huy.bq@funix.test',   teamId: 'saleMkt' },
    { name: 'Ngô Thị Lan',      email: 'lan.nt@funix.test',   teamId: 'saleMkt' },
    { name: 'Hồ Văn Minh',      email: 'minh.hv@funix.test',  teamId: 'saleMkt' },
    { name: 'Đặng Thị Nga',     email: 'nga.dt@funix.test',   teamId: 'hannah' },
    { name: 'Phan Hoài Phong',  email: 'phong.ph@funix.test', teamId: 'hannah' },
    { name: 'Lý Thị Quỳnh',     email: 'quynh.lt@funix.test', teamId: 'hannah' },
    { name: 'Trương Văn Sơn',   email: 'son.tv@funix.test',   teamId: 'hannah' },
  ],

  // Submissions: {email, week, timestamp}. Absence = not submitted.
  // teamFormValue mirrors what the form's "Bạn thuộc nhóm nào?" would record.
  submissions: [
    // An — model student, all on time
    sub('an.nv@funix.test', 'Sale B2B', { T0:'2026-05-29T20:00', T1:'2026-05-29T21:00', T2:'2026-06-05T19:00', T3:'2026-06-12T20:00', T4:'2026-06-19T18:00', T5:'2026-06-26T20:00', T6:'2026-07-03T19:00' }),
    // Bình — a couple late
    sub('binh.tt@funix.test', 'Sale B2B', { T0:'2026-05-30T18:00', T1:'2026-05-30T22:00', T2:'2026-06-07T09:00'/*late*/, T3:'2026-06-12T20:00', T4:'2026-06-20T22:00'/*late*/, T5:'2026-06-26T20:00' /* T6 missing */ }),
    // Cường — falling behind
    sub('cuong.lh@funix.test', 'Sale B2B', { T0:'2026-05-29T20:00', T1:'2026-06-01T09:00'/*late*/, T2:'2026-06-05T19:00' /* T3-T6 missing */ }),
    // Dung — only setup, then silent (at risk)
    sub('dung.pt@funix.test', 'Sale B2B', { T0:'2026-05-30T08:00' /* nothing after */ }),
    // Đức — strong
    sub('duc.vm@funix.test', 'Sale B2C', { T0:'2026-05-28T20:00', T1:'2026-05-29T20:00', T2:'2026-06-05T19:00', T3:'2026-06-12T20:00', T4:'2026-06-19T18:00', T5:'2026-06-26T20:00', T6:'2026-07-03T19:00' }),
    // Hà — mostly on time, one miss
    sub('ha.dt@funix.test', 'Sale B2C', { T0:'2026-05-29T20:00', T1:'2026-05-30T10:00', T2:'2026-06-05T19:00', T3:'2026-06-12T20:00', T5:'2026-06-26T20:00', T6:'2026-07-03T19:00' /* T4 missing */ }),
    // Huy — late starter, catching up
    sub('huy.bq@funix.test', 'Sale B2C', { T1:'2026-06-02T09:00'/*late, no T0*/, T2:'2026-06-06T09:00', T3:'2026-06-13T09:00', T4:'2026-06-19T18:00', T5:'2026-06-26T20:00', T6:'2026-07-03T19:00' }),
    // Lan — on time throughout
    sub('lan.nt@funix.test', 'Sale B2C', { T0:'2026-05-29T20:00', T1:'2026-05-29T20:00', T2:'2026-06-05T19:00', T3:'2026-06-12T20:00', T4:'2026-06-19T18:00', T5:'2026-06-26T20:00', T6:'2026-07-03T19:00' }),
    // Minh — dropped off after T2 (at risk)
    sub('minh.hv@funix.test', 'Sale B2C', { T0:'2026-05-29T20:00', T1:'2026-05-30T10:00', T2:'2026-06-05T19:00' /* silent after */ }),
    // Nga — strong
    sub('nga.dt@funix.test', 'Hannah', { T0:'2026-05-29T20:00', T1:'2026-05-29T20:00', T2:'2026-06-05T19:00', T3:'2026-06-12T20:00', T4:'2026-06-19T18:00', T5:'2026-06-26T20:00', T6:'2026-07-03T19:00' }),
    // Phong — some late
    sub('phong.ph@funix.test', 'Mentor', { T0:'2026-05-30T20:00', T1:'2026-05-31T10:00'/*late*/, T2:'2026-06-05T19:00', T3:'2026-06-14T09:00'/*late*/, T4:'2026-06-19T18:00', T6:'2026-07-03T19:00' /* T5 missing */ }),
    // Quỳnh — never started (full at risk)
    // (no submissions on purpose)
    // Sơn — mid
    sub('son.tv@funix.test', 'Mentor', { T0:'2026-05-29T20:00', T1:'2026-05-29T20:00', T2:'2026-06-05T19:00', T4:'2026-06-19T18:00', T5:'2026-06-26T20:00' /* T3, T6 missing */ }),
  ].flat(),
};

function sub(email, teamFormValue, weeks) {
  return Object.keys(weeks).map(function (wk) {
    return { email: email, teamFormValue: teamFormValue, week: wk, timestamp: weeks[wk] + ':00+07:00' };
  });
}
