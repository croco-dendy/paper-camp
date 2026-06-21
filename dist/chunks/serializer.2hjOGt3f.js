import { mkdir as $, writeFile as p, access as I, readFile as N } from "node:fs/promises";
import { join as h, dirname as R } from "node:path";
import { z as o } from "zod";
const m = o.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected a YYYY-MM-DD date"), k = o.object({
  status: o.enum(["idea", "planned", "in-progress", "done", "dropped"]),
  kind: o.enum(["feat", "fix", "chore", "docs", "refactor"]).optional(),
  id: o.string().optional(),
  idea: o.string().optional(),
  created: m,
  updated: m.optional(),
  tags: o.string().optional()
}), v = o.object({
  date: m,
  status: o.enum(["decided", "superseded"]),
  "superseded-by": o.string().optional()
}), A = o.object({
  status: o.enum(["open", "resolved"]),
  raised: m,
  "resolved-by": o.string().optional()
}), B = o.object({
  version: o.string(),
  projectName: o.string(),
  initializedAt: o.string(),
  nextId: o.object({
    feat: o.number(),
    fix: o.number(),
    chore: o.number(),
    docs: o.number(),
    refactor: o.number()
  }).optional()
}), E = /^##\s+(.+?)\s*$/, D = /^\*\*([A-Za-z][A-Za-z-]*):\*\*\s*(.*)$/, _ = /^###\s+Phases\s*$/i, w = /^#{2,3}\s+/, j = /^[-*]\s+\[([ xX])\]\s+(.*)$/;
function O(s) {
  const e = s.split(`
`), n = e.findIndex((r) => _.test(r));
  if (n === -1)
    return { body: s, phases: [] };
  let i = e.length;
  for (let r = n + 1; r < e.length; r++)
    if (w.test(e[r])) {
      i = r;
      break;
    }
  const t = [];
  let a = n + 1;
  for (; a < i; ) {
    const r = e[a].match(j);
    if (r) {
      const l = r[2].trim(), c = r[1].toLowerCase() === "x", u = [];
      for (a++; a < i; ) {
        const f = e[a];
        if (f.trim() === "" || j.test(f) || w.test(f)) break;
        if (/^\s/.test(f))
          u.push(f.trimStart()), a++;
        else
          break;
      }
      t.push({
        done: c,
        text: l,
        description: u.length > 0 ? u.join(`
`) : void 0
      });
    } else
      a++;
  }
  return { body: [...e.slice(0, n), ...e.slice(i)].join(`
`).trim(), phases: t };
}
function b(s) {
  const e = s.split(`
`), n = [];
  for (let t = 0; t < e.length; t++)
    E.test(e[t]) && n.push(t);
  const i = [];
  for (let t = 0; t < n.length; t++) {
    const a = n[t], d = t + 1 < n.length ? n[t + 1] : e.length, r = e[a].match(E)[1], l = e.slice(a + 1, d);
    let c = 0;
    for (; c < l.length && l[c].trim() === ""; ) c++;
    const u = {};
    for (; c < l.length; ) {
      const g = l[c].match(D);
      if (!g) break;
      u[g[1].toLowerCase()] = g[2].trim(), c++;
    }
    for (; c < l.length && l[c].trim() === ""; ) c++;
    const f = l.slice(c).join(`
`).trim(), { body: x, phases: P } = O(f);
    i.push({ title: r, fields: u, body: x, phases: P });
  }
  return i;
}
function K(s) {
  const e = [], n = [];
  for (const i of b(s)) {
    const t = k.safeParse(i.fields);
    if (!t.success) {
      n.push({
        title: i.title,
        message: t.error.issues.map((d) => d.message).join("; ")
      });
      continue;
    }
    const a = t.data;
    e.push({
      title: i.title,
      status: a.status,
      kind: a.kind,
      id: a.id,
      idea: a.idea,
      created: a.created,
      updated: a.updated,
      tags: a.tags ? a.tags.split(",").map((d) => d.trim()).filter(Boolean) : [],
      body: i.body,
      phases: i.phases
    });
  }
  return { entries: e, warnings: n };
}
function M(s) {
  const e = [], n = [];
  for (const i of b(s)) {
    const t = v.safeParse(i.fields);
    if (!t.success) {
      n.push({
        title: i.title,
        message: t.error.issues.map((d) => d.message).join("; ")
      });
      continue;
    }
    const a = t.data;
    e.push({
      title: i.title,
      date: a.date,
      status: a.status,
      supersededBy: a["superseded-by"],
      body: i.body
    });
  }
  return { entries: e, warnings: n };
}
function Q(s) {
  const e = [], n = [];
  for (const i of b(s)) {
    const t = A.safeParse(i.fields);
    if (!t.success) {
      n.push({
        title: i.title,
        message: t.error.issues.map((d) => d.message).join("; ")
      });
      continue;
    }
    const a = t.data;
    e.push({
      title: i.title,
      status: a.status,
      raised: a.raised,
      resolvedBy: a["resolved-by"],
      body: i.body
    });
  }
  return { entries: e, warnings: n };
}
const S = /^##\s+(\d{4}-\d{2}-\d{2})\s*$/, C = /^[-*]\s+(.*)$/;
function U(s) {
  const e = s.split(`
`), n = [];
  for (let t = 0; t < e.length; t++)
    S.test(e[t]) && n.push(t);
  const i = [];
  for (let t = 0; t < n.length; t++) {
    const a = n[t], d = t + 1 < n.length ? n[t + 1] : e.length, r = e[a].match(S)[1], l = e.slice(a + 1, d).map((c) => c.match(C)).filter((c) => c !== null).map((c) => c[1].trim());
    i.push({ date: r, items: l });
  }
  return i;
}
const L = "0.1.0";
class z extends Error {
  constructor(e) {
    super(`Paper Camp is already initialized in ${e} (.paper-camp/config.json exists).`);
  }
}
async function y(s) {
  try {
    return await I(s), !0;
  } catch {
    return !1;
  }
}
const F = ["plans.md", "progress.md", "decisions.md", "open-questions.md"];
async function X(s, e) {
  const n = h(s, ".paper-camp"), i = h(n, "config.json"), t = h(s, "papercamp");
  if (await y(i))
    throw new z(s);
  const a = {
    version: L,
    projectName: e.projectName,
    initializedAt: (/* @__PURE__ */ new Date()).toISOString(),
    nextId: { feat: 1, fix: 1, chore: 1, docs: 1, refactor: 1 }
  };
  B.parse(a), await $(n, { recursive: !0 }), await p(i, `${JSON.stringify(a, null, 2)}
`, "utf-8"), await $(t, { recursive: !0 });
  const d = h(t, "ideas.md");
  if (!await y(d)) {
    const r = e.intent ? `# ${e.projectName}

${e.intent}
` : `# ${e.projectName}

What are you building, and why?
`;
    await p(d, r, "utf-8");
  }
  for (const r of F) {
    const l = h(t, r);
    await y(l) || await p(l, "", "utf-8");
  }
}
function Z() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function H(s) {
  const e = [`## ${s.title}`, "", `**Status:** ${s.status}`];
  if (s.kind && e.push(`**Kind:** ${s.kind}`), s.id && e.push(`**Id:** ${s.id}`), s.idea && e.push(`**Idea:** ${s.idea}`), e.push(`**Created:** ${s.created}`), s.updated && e.push(`**Updated:** ${s.updated}`), s.tags && s.tags.length > 0 && e.push(`**Tags:** ${s.tags.join(", ")}`), e.push(""), s.body && e.push(s.body, ""), s.phases && s.phases.length > 0) {
    e.push("### Phases");
    for (const n of s.phases)
      if (e.push(`- [${n.done ? "x" : " "}] ${n.text}`), n.description)
        for (const i of n.description.split(`
`))
          e.push(`      ${i}`);
  }
  return e.join(`
`).trimEnd();
}
function q(s) {
  const e = [`## ${s.title}`, "", `**Date:** ${s.date}`, `**Status:** ${s.status}`];
  return s.supersededBy && e.push(`**Superseded-by:** ${s.supersededBy}`), e.push(""), s.body && e.push(s.body), e.join(`
`).trimEnd();
}
function J(s) {
  const e = [
    `## ${s.title}`,
    "",
    `**Status:** ${s.status}`,
    `**Raised:** ${s.raised}`
  ];
  return s.resolvedBy && e.push(`**Resolved-by:** ${s.resolvedBy}`), e.push(""), s.body && e.push(s.body), e.join(`
`).trimEnd();
}
function V(s, e) {
  return [`## ${s}`, ...e.map((n) => `- ${n}`)].join(`
`);
}
function W(s) {
  return s.length === 0 ? "" : `${s.map((e) => H(e)).join(`

`)}
`;
}
async function ee(s, e) {
  await $(R(s), { recursive: !0 });
  let n = "";
  try {
    n = await N(s, "utf-8");
  } catch (a) {
    if (a.code !== "ENOENT") throw a;
  }
  const i = n.trimEnd(), t = i.length > 0 ? `${i}

${e}
` : `${e}
`;
  await p(s, t, "utf-8");
}
export {
  z as A,
  L as P,
  ee as a,
  J as b,
  H as c,
  v as d,
  W as e,
  q as f,
  V as g,
  M as h,
  X as i,
  Q as j,
  K as k,
  U as l,
  b as m,
  k as n,
  A as o,
  B as p,
  Z as t
};
//# sourceMappingURL=serializer.2hjOGt3f.js.map
