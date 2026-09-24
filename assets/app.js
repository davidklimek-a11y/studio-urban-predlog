// Studio Urban · live open/closed line and "today" in the appointment book.
// Hours and labels come from the page (#podaci-vreme), built from data/podaci.json.
(function () {
  var el = document.getElementById('podaci-vreme');
  if (!el) return;
  var cfg;
  try { cfg = JSON.parse(el.textContent); } catch (e) { return; }

  function belgradeNow() {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Belgrade', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
    var day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday'));
    return { day: day, min: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
  }

  function toMin(hhmm) { var p = hhmm.split(':'); return +p[0] * 60 + +p[1]; }

  function update() {
    var now = belgradeNow();
    if (now.day < 0) return;
    var days = cfg.hours, L = cfg.labels, text, open = false;

    document.querySelectorAll('.dan').forEach(function (d, i) {
      d.classList.toggle('dan--danas', i === now.day);
      if (i === now.day) d.setAttribute('aria-current', 'date'); else d.removeAttribute('aria-current');
    });

    var today = days[now.day];
    if (today[1] && now.min >= toMin(today[1]) && now.min < toMin(today[2])) {
      open = true;
      text = L.open_now.replace('{TIME}', today[2]);
    } else {
      for (var k = 0; k < 8; k++) {
        var idx = (now.day + k) % 7, d = days[idx];
        if (!d[1]) continue;
        if (k === 0 && now.min >= toMin(d[1])) continue;
        var when = k === 0 ? L.today : k === 1 ? L.tomorrow : L.days_when[idx];
        text = L.closed_now.replace('{DAY}', when).replace('{TIME}', d[1]);
        break;
      }
    }
    var status = document.querySelector('.status');
    if (!status || !text) return;
    if (cfg.source) text += ' (' + cfg.source + ')';
    var out = status.querySelector('.status__tekst');
    if (out.textContent === text) return;   // aria-live: announce only real changes
    out.textContent = text;
    status.classList.toggle('status--otvoreno', open);
    status.hidden = false;
  }

  update();
  setInterval(update, 60000);
})();
