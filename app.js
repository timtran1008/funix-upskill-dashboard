/* =============================================================================
   Funix Upskill Q2 2026 — Dashboard app
   Zero dependencies. Fetches live from a link-shared Google Sheet via the
   gviz JSON endpoint (locale-proof dates), or renders bundled sample data.
   ============================================================================= */
(function () {
  'use strict';

  var CFG = window.FUNIX_CONFIG;
  var SAMPLE = window.FUNIX_SAMPLE;

  function trimv(s) { return (s == null ? '' : ('' + s)).trim(); }
  // a form week's resolved spreadsheet id (per-week override, else master)
  function weekSheetId(w) { return trimv(w.sheetId) || trimv(CFG.SHEET_ID); }
  var ROSTER_SHEET = (CFG.roster && (trimv(CFG.roster.sheetId) || trimv(CFG.SHEET_ID))) || '';
  // LIVE = anything is wired to a real sheet
  var LIVE = !!trimv(CFG.SHEET_ID) ||
    CFG.weeks.some(function (w) { return w.source === 'form' && trimv(w.sheetId); }) ||
    !!trimv(CFG.roster && CFG.roster.sheetId);
  // a form week is "wired" (has a data source) in the current mode
  function weekWired(w) { return w.source === 'form' && (LIVE ? !!weekSheetId(w) : true); }

  // ---- helpers --------------------------------------------------------------
  function $(sel) { return document.querySelector(sel); }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function stripD(s) {
    return (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  }
  function normEmail(s) { return (s || '').toString().trim().toLowerCase(); }
  function normName(s) { return stripD(s).replace(/\s+/g, ' ').trim(); }

  function teamById(id) {
    for (var i = 0; i < CFG.teams.length; i++) if (CFG.teams[i].id === id) return CFG.teams[i];
    return null;
  }
  // map a form's "Bạn thuộc nhóm nào?" value onto a team id
  function teamIdFromFormValue(val) {
    var v = stripD(val);
    for (var i = 0; i < CFG.teams.length; i++) {
      var fvs = CFG.teams[i].formValues || [];
      for (var j = 0; j < fvs.length; j++) if (stripD(fvs[j]) === v) return CFG.teams[i].id;
    }
    return null;
  }
  // map a roster "Team" cell (free text) onto a team id, by name or formValue
  function teamIdFromRosterTeam(val) {
    var v = stripD(val);
    for (var i = 0; i < CFG.teams.length; i++) {
      if (stripD(CFG.teams[i].name) === v || CFG.teams[i].id === v) return CFG.teams[i].id;
    }
    return teamIdFromFormValue(val);
  }

  // parse gviz "Date(2026,4,29,20,0,0)" -> Date (month is 0-indexed already)
  function parseGvizDate(v) {
    if (v == null) return null;
    if (typeof v !== 'string') return null;
    var m = v.match(/^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)$/);
    if (!m) { var d = new Date(v); return isNaN(d) ? null : d; }
    return new Date(+m[1], +m[2], +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  }

  // ---- gviz fetch -----------------------------------------------------------
  function gvizUrl(sheetId, gid) {
    return 'https://docs.google.com/spreadsheets/d/' + sheetId +
      '/gviz/tq?tqx=out:json&headers=1' +
      (trimv(gid) ? '&gid=' + encodeURIComponent(trimv(gid)) : '') +
      '&_=' + Date.now();   // cache-bust so refresh shows fresh submissions
  }
  function fetchTab(sheetId, gid) {
    return fetch(gvizUrl(sheetId, gid)).then(function (r) { return r.text(); }).then(function (txt) {
      var a = txt.indexOf('('), b = txt.lastIndexOf(')');
      if (a < 0 || b < 0) throw new Error('Không đọc được dữ liệu (sheet chưa chia sẻ "ai có link đều xem"?)');
      var payload = JSON.parse(txt.substring(a + 1, b));
      if (payload.status === 'error') {
        throw new Error('Google Sheet báo lỗi: ' + (payload.errors && payload.errors[0] && payload.errors[0].detailed_message || 'không rõ'));
      }
      return payload.table;
    });
  }
  // locate columns by header keyword (diacritic-insensitive)
  function colIndex(cols, keywords, fallback) {
    for (var i = 0; i < cols.length; i++) {
      var lab = stripD(cols[i].label || '');
      for (var k = 0; k < keywords.length; k++) if (lab.indexOf(keywords[k]) >= 0) return i;
    }
    return (fallback == null ? -1 : fallback);
  }

  // ---- build the normalized model ------------------------------------------
  // returns { roster:[{name,email,teamId}], subs:[{email,name,teamFormValue,week,ts:Date}] }
  function buildLiveModel() {
    var formWeeks = CFG.weeks.filter(function (w) { return w.source === 'form' && weekSheetId(w); });
    var jobs = formWeeks.map(function (w) {
      return fetchTab(weekSheetId(w), w.gid).then(function (table) { return { week: w.key, table: table }; });
    });
    var rosterJob = ROSTER_SHEET
      ? fetchTab(ROSTER_SHEET, CFG.roster.gid).then(function (t) { return t; }).catch(function () { return null; })
      : Promise.resolve(null);

    return Promise.all([rosterJob, Promise.all(jobs)]).then(function (res) {
      var rosterTable = res[0], weekTables = res[1];
      var roster = [];
      if (rosterTable) {
        var rc = rosterTable.cols, rrows = rosterTable.rows || [];
        var ni = colIndex(rc, ['ho va ten', 'ho ten', 'name', 'ten'], 0);
        var ei = colIndex(rc, ['email', 'dia chi email'], -1);
        var ti = colIndex(rc, ['nhom', 'team'], -1);
        rrows.forEach(function (row) {
          var c = row.c || [];
          var name = c[ni] && c[ni].v; if (!name) return;
          roster.push({
            name: ('' + name).trim(),
            email: ei >= 0 && c[ei] && c[ei].v ? normEmail(c[ei].v) : '',
            teamId: ti >= 0 && c[ti] && c[ti].v ? teamIdFromRosterTeam(c[ti].v) : null,
          });
        });
      }
      var subs = [];
      weekTables.forEach(function (wt) {
        var cols = wt.table.cols, rows = wt.table.rows || [];
        var tsi = colIndex(cols, ['timestamp', 'dau thoi gian'], 0);
        var ei = colIndex(cols, ['email', 'dia chi email'], -1);
        var ni = colIndex(cols, ['ho va ten', 'ho ten', 'name'], -1);
        var gi = colIndex(cols, ['nhom'], -1);
        rows.forEach(function (row) {
          var c = row.c || [];
          var email = ei >= 0 && c[ei] && c[ei].v ? normEmail(c[ei].v) : '';
          var name = ni >= 0 && c[ni] && c[ni].v ? ('' + c[ni].v).trim() : '';
          if (!email && !name) return;   // blank row
          subs.push({
            email: email,
            name: name,
            teamFormValue: gi >= 0 && c[gi] && c[gi].v ? c[gi].v : '',
            week: wt.week,
            ts: c[tsi] ? parseGvizDate(c[tsi].v) : null,
          });
        });
      });
      return { roster: roster, subs: subs };
    });
  }

  function buildSampleModel() {
    return {
      roster: SAMPLE.roster.map(function (r) { return { name: r.name, email: normEmail(r.email), teamId: r.teamId }; }),
      subs: SAMPLE.submissions.map(function (s) {
        return { email: normEmail(s.email), name: '', teamFormValue: s.teamFormValue, week: s.week, ts: new Date(s.timestamp) };
      }),
    };
  }

  // ---- assemble learners ----------------------------------------------------
  function learnerKey(sub) { return sub.email || ('name:' + normName(sub.name)); }

  function assemble(model, now) {
    var byKey = {};   // key -> learner
    function ensure(key) {
      if (!byKey[key]) byKey[key] = { key: key, name: '', email: '', teamId: null, weeks: {} };
      return byKey[key];
    }
    // seed from roster
    model.roster.forEach(function (r) {
      var key = r.email ? r.email : ('name:' + normName(r.name));
      var L = ensure(key);
      L.name = r.name; L.email = r.email; if (r.teamId) L.teamId = r.teamId;
    });
    // fold submissions
    model.subs.forEach(function (s) {
      var L = ensure(learnerKey(s));
      if (!L.name && s.name) L.name = s.name;
      if (!L.email && s.email) L.email = s.email;
      if (!L.teamId && s.teamFormValue) L.teamId = teamIdFromFormValue(s.teamFormValue);
      // keep earliest submission per week
      var prev = L.weeks[s.week];
      if (!prev || (s.ts && prev && s.ts < prev)) L.weeks[s.week] = s.ts || prev || new Date(0);
      if (!prev) L.weeks[s.week] = s.ts || new Date(0);
    });
    return Object.keys(byKey).map(function (k) { return byKey[k]; });
  }

  // ---- per-cell status ------------------------------------------------------
  // 'ontime' | 'late' | 'submitted' | 'missing' | 'notdue' | 'group' | 'nodata'
  function cellStatus(learner, week, now) {
    var deadline = new Date(week.deadline + (week.deadline.indexOf('+') < 0 ? CFG.timezone : ''));
    var submittedTs = learner.weeks[week.key];
    if (week.source === 'group') return { code: 'group', deadline: deadline };
    if (!weekWired(week)) return { code: 'nodata', deadline: deadline };
    if (submittedTs) {
      if (!(submittedTs instanceof Date) || isNaN(submittedTs)) return { code: 'submitted', deadline: deadline };
      return { code: submittedTs <= deadline ? 'ontime' : 'late', deadline: deadline, ts: submittedTs };
    }
    return { code: now > deadline ? 'missing' : 'notdue', deadline: deadline };
  }

  function summarize(learner, now) {
    var due = 0, submitted = 0, ontime = 0, missing = 0, started = false;
    CFG.weeks.forEach(function (w) {
      if (w.source !== 'form') return;
      var st = cellStatus(learner, w, now);
      if (st.code === 'ontime' || st.code === 'late' || st.code === 'submitted') { submitted++; started = true; }
      if (st.code === 'ontime' || st.code === 'submitted') ontime++;
      if (st.code === 'missing' || st.code === 'ontime' || st.code === 'late' || st.code === 'submitted') due++;
      if (st.code === 'missing') missing++;
    });
    return {
      due: due, submitted: submitted, ontime: ontime, missing: missing,
      pct: due ? Math.round(submitted / due * 100) : null,
      atRisk: missing >= 2 || (due >= 1 && submitted === 0),
    };
  }

  // ---- render ---------------------------------------------------------------
  var GLYPH = {
    ontime:   { ch: '✓', cls: 's-ontime',  t: 'Nộp đúng hạn' },
    late:     { ch: '⚠', cls: 's-late',    t: 'Nộp trễ' },
    submitted:{ ch: '✓', cls: 's-sub',     t: 'Đã nộp (không rõ giờ)' },
    missing:  { ch: '✗', cls: 's-missing', t: 'Chưa nộp (quá hạn)' },
    notdue:   { ch: '·', cls: 's-notdue',  t: 'Chưa tới hạn' },
    group:    { ch: '◇', cls: 's-group',   t: 'Bài nhóm / nghiệm thu' },
    nodata:   { ch: '–', cls: 's-nodata',  t: 'Chưa nối dữ liệu (form chưa link sheet)' },
  };

  function fmtDate(iso) {
    var d = new Date(iso.indexOf('+') < 0 ? iso + CFG.timezone : iso);
    var dd = ('0' + d.getDate()).slice(-2), mm = ('0' + (d.getMonth() + 1)).slice(-2);
    return dd + '/' + mm;
  }

  function render(learners, now, sourceLabel) {
    var root = $('#app');
    root.innerHTML = '';

    // KPIs across all learners
    var totDue = 0, totSub = 0, totOn = 0, atRisk = 0;
    learners.forEach(function (L) {
      var s = summarize(L, now);
      totDue += s.due; totSub += s.submitted; totOn += s.ontime;
      if (s.atRisk) atRisk++;
    });
    var kpi = el('div', 'kpis');
    kpi.appendChild(kpiCard(learners.length, 'Học viên'));
    kpi.appendChild(kpiCard(totDue ? Math.round(totSub / totDue * 100) + '%' : '—', 'Đã nộp (trên số bài tới hạn)'));
    kpi.appendChild(kpiCard(totDue ? Math.round(totOn / totDue * 100) + '%' : '—', 'Nộp đúng hạn'));
    kpi.appendChild(kpiCard(atRisk, 'Đang trễ (≥2 bài / chưa bắt đầu)', atRisk ? 'warn' : ''));
    root.appendChild(kpi);

    root.appendChild(legend());

    // per team
    CFG.teams.forEach(function (team) {
      var members = learners.filter(function (L) { return L.teamId === team.id; });
      members.sort(function (a, b) {
        var sa = summarize(a, now), sb = summarize(b, now);
        if (sa.atRisk !== sb.atRisk) return sa.atRisk ? -1 : 1;
        var pa = sa.pct == null ? 999 : sa.pct, pb = sb.pct == null ? 999 : sb.pct;
        if (pa !== pb) return pa - pb;
        return (a.name || '').localeCompare(b.name || '', 'vi');
      });
      root.appendChild(teamSection(team, members, now));
    });

    // unassigned (submitted but team unknown)
    var orphans = learners.filter(function (L) { return !L.teamId; });
    if (orphans.length) {
      root.appendChild(teamSection({ id: '_none', name: 'Chưa xác định nhóm', coachingDay: '' }, orphans, now));
    }

    $('#meta').textContent = sourceLabel + ' · cập nhật ' + new Date().toLocaleString('vi-VN', { hour12: false });
  }

  function kpiCard(val, label, mod) {
    var c = el('div', 'kpi' + (mod ? ' ' + mod : ''));
    c.appendChild(el('div', 'kpi-val', '' + val));
    c.appendChild(el('div', 'kpi-lab', label));
    return c;
  }

  function legend() {
    var l = el('div', 'legend');
    var items = [['ontime', '✓ đúng hạn'], ['late', '⚠ trễ'], ['missing', '✗ chưa nộp'], ['notdue', '· chưa tới hạn'], ['group', '◇ bài nhóm']];
    if (LIVE && CFG.weeks.some(function (w) { return w.source === 'form' && !weekWired(w); })) {
      items.push(['nodata', '– chưa nối dữ liệu']);
    }
    items.forEach(function (p) {
        var s = el('span', 'lg ' + GLYPH[p[0]].cls);
        s.appendChild(el('span', 'lg-ch', GLYPH[p[0]].ch));
        s.appendChild(document.createTextNode(' ' + p[1].replace(/^.\s/, '')));
        l.appendChild(s);
      });
    return l;
  }

  function teamSection(team, members, now) {
    var sec = el('section', 'team');
    var h = el('div', 'team-head');
    h.appendChild(el('h2', null, team.name));
    var sub = el('div', 'team-sub', members.length + ' học viên' + (team.coachingDay ? ' · kèm cặp ' + team.coachingDay : ''));
    h.appendChild(sub);
    sec.appendChild(h);

    if (!members.length) { sec.appendChild(el('div', 'empty', 'Chưa có dữ liệu nộp bài.')); return sec; }

    var wrap = el('div', 'tbl-wrap');
    var t = el('table', 'matrix');
    // head
    var thead = el('thead'), hr = el('tr');
    hr.appendChild(el('th', 'c-name', 'Học viên'));
    CFG.weeks.forEach(function (w) {
      var th = el('th', 'c-week' + (w.source === 'group' ? ' c-group' : ''));
      th.appendChild(el('div', 'wk-key', w.key));
      th.appendChild(el('div', 'wk-date', 'hạn ' + fmtDate(w.deadline)));
      th.title = w.label;
      hr.appendChild(th);
    });
    hr.appendChild(el('th', 'c-pct', '% nộp'));
    thead.appendChild(hr); t.appendChild(thead);
    // body
    var tb = el('tbody');
    members.forEach(function (L) {
      var s = summarize(L, now);
      var tr = el('tr', s.atRisk ? 'at-risk' : '');
      var nameTd = el('td', 'c-name');
      nameTd.appendChild(el('span', 'nm', L.name || L.email || '(ẩn danh)'));
      if (s.atRisk) nameTd.appendChild(el('span', 'flag', s.submitted === 0 ? 'chưa bắt đầu' : 'đang trễ'));
      tr.appendChild(nameTd);
      CFG.weeks.forEach(function (w) {
        var st = cellStatus(L, w, now);
        var g = GLYPH[st.code];
        var td = el('td', 'cell ' + g.cls);
        td.textContent = g.ch;
        td.title = w.label + ' — ' + g.t + (st.ts ? ' (' + st.ts.toLocaleString('vi-VN', { hour12: false }) + ')' : '');
        tr.appendChild(td);
      });
      var pctTd = el('td', 'c-pct');
      pctTd.appendChild(bar(s.pct));
      tr.appendChild(pctTd);
      tb.appendChild(tr);
    });
    t.appendChild(tb); wrap.appendChild(t); sec.appendChild(wrap);
    return sec;
  }

  function bar(pct) {
    var w = el('div', 'bar');
    if (pct == null) { w.appendChild(el('span', 'bar-na', '—')); return w; }
    var cls = pct >= 80 ? 'b-hi' : pct >= 50 ? 'b-mid' : 'b-lo';
    var track = el('div', 'bar-track');
    var fill = el('div', 'bar-fill ' + cls); fill.style.width = pct + '%';
    track.appendChild(fill);
    w.appendChild(track);
    w.appendChild(el('span', 'bar-num', pct + '%'));
    return w;
  }

  function showError(msg) {
    var root = $('#app');
    root.innerHTML = '';
    var e = el('div', 'err');
    e.appendChild(el('strong', null, 'Không tải được dữ liệu trực tiếp.'));
    e.appendChild(el('p', null, msg));
    e.appendChild(el('p', 'err-hint', 'Kiểm tra: (1) đã chia sẻ Google Sheet ở chế độ "Bất kỳ ai có đường liên kết → Người xem"; (2) SHEET_ID và các gid trong config.js đúng.'));
    root.appendChild(e);
  }

  // ---- boot -----------------------------------------------------------------
  function boot() {
    var badge = $('#badge');
    if (LIVE) {
      badge.textContent = 'LIVE'; badge.className = 'badge live';
      var now = new Date();
      buildLiveModel()
        .then(function (model) { render(assemble(model, now), now, 'Dữ liệu trực tiếp từ Google Sheet'); })
        .catch(function (e) { showError(e.message || ('' + e)); });
    } else {
      badge.textContent = 'SAMPLE DATA'; badge.className = 'badge sample';
      var nowS = new Date(SAMPLE.asOf);
      render(assemble(buildSampleModel(), nowS), nowS, 'Dữ liệu MẪU (chưa nối Google Sheet)');
    }
  }

  $('#refresh').addEventListener('click', boot);
  boot();
})();
