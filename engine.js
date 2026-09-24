// CramPlan engine - exam prep allocation math (no DOM)
(function (root) {
  'use strict';

  function parseDay(s) {
    var p = String(s).split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function dayOnly(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function daysLeft(examDateStr, now) {
    return Math.round((parseDay(examDateStr) - dayOnly(now)) / 86400000);
  }

  // A topic: {id, name, confidence 1-5, done: [dateKeys]}
  // Weight: least confident gets most sessions. confidence 1 -> 5, 5 -> 1.
  function weight(topic) {
    var c = Math.max(1, Math.min(5, Number(topic.confidence) || 3));
    return 6 - c;
  }

  // Total sessions available = daysLeft * sessionsPerDay (daysLeft 0 = exam day, still 1 slot).
  function totalSlots(days, sessionsPerDay) {
    return Math.max(1, days) * Math.max(1, sessionsPerDay);
  }

  // Allocate N slots across topics proportional to weight, largest remainder method.
  function allocate(topics, slots) {
    var totalW = 0;
    topics.forEach(function (t) { totalW += weight(t); });
    if (totalW === 0 || !topics.length) return [];
    var raw = topics.map(function (t) {
      var exact = slots * weight(t) / totalW;
      return { id: t.id, name: t.name, exact: exact, sessions: Math.floor(exact), rem: exact - Math.floor(exact) };
    });
    var assigned = raw.reduce(function (s, r) { return s + r.sessions; }, 0);
    var left = slots - assigned;
    raw.sort(function (a, b) { return b.rem - a.rem; });
    for (var i = 0; i < left; i++) raw[i % raw.length].sessions++;
    raw.sort(function (a, b) { return b.sessions - a.sessions; });
    return raw.map(function (r) { return { id: r.id, name: r.name, sessions: r.sessions }; });
  }

  // Today's plan: interleave allocated sessions round-robin so the day mixes topics.
  function todayPlan(topics, days, sessionsPerDay) {
    var slots = totalSlots(days, sessionsPerDay);
    var alloc = allocate(topics, slots);
    var perDay = Math.max(1, sessionsPerDay);
    // Order sessions: interleave topics by descending sessions, take first perDay.
    var queue = [];
    alloc.forEach(function (a) {
      for (var i = 0; i < a.sessions; i++) queue.push({ id: a.id, name: a.name });
    });
    // Round-robin: pick from each topic in turn while slots remain.
    var plan = [];
    var pools = alloc.map(function (a) { return { id: a.id, name: a.name, left: a.sessions }; });
    while (queue.length > 0 && plan.length < queue.length) {
      var any = false;
      for (var p = 0; p < pools.length; p++) {
        if (pools[p].left > 0) {
          plan.push({ id: pools[p].id, name: pools[p].name });
          pools[p].left--;
          any = true;
          if (plan.length >= queue.length) break;
        }
      }
      if (!any) break;
    }
    return plan.slice(0, perDay);
  }

  // Coverage: what fraction of today's planned sessions are marked done today.
  function todayProgress(plan, topics, dayKey) {
    if (!plan.length) return { done: 0, total: 0, pct: 0 };
    var done = 0;
    plan.forEach(function (p) {
      var t = null;
      topics.forEach(function (x) { if (x.id === p.id) t = x; });
      if (t && t.done && t.done.indexOf(dayKey) !== -1) done++;
    });
    return { done: done, total: plan.length, pct: Math.round(done / plan.length * 100) };
  }

  // Readiness estimate: average confidence weighted by sessions allocated.
  function readiness(topics) {
    if (!topics.length) return 0;
    var sumW = 0, sum = 0;
    topics.forEach(function (t) {
      var w = weight(t);
      sumW += w;
      sum += (Number(t.confidence) || 3) * w;
    });
    return Math.round(sum / sumW / 5 * 100);
  }

  function dateKey(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  var api = { daysLeft: daysLeft, weight: weight, totalSlots: totalSlots, allocate: allocate,
    todayPlan: todayPlan, todayProgress: todayProgress, readiness: readiness, dateKey: dateKey };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CramEngine = api;
})(typeof self !== 'undefined' ? self : this);
