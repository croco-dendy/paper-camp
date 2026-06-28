#!/usr/bin/env node
import { readFile as A, unlink as Tt, mkdir as P, writeFile as $, stat as ot } from "node:fs/promises";
import { join as C, dirname as Nt, extname as Ot, basename as jt, resolve as R } from "node:path";
import { Command as bt } from "commander";
import { D as mt, z as nt, u as at, C as K, H as _, I as k, d as yt, m as G, M as Q, B as ct, c as Jt, i as ht, y as it, v as pt, b as vt, K as st, J as wt, o as rt, j as Ct, g as $t, P as It, r as xt, A as Ht } from "../chunks/serializer.DEl5Ryp3.js";
import { DEFAULT_AGENTS as lt, PLAN_KINDS as Y, AGENT_IDS as tt } from "../types/index.js";
import { createServer as kt } from "node:http";
import { fileURLToPath as Pt } from "node:url";
import { watch as Z, readFileSync as At } from "node:fs";
import { spawn as V, spawnSync as U } from "node:child_process";
import { createInterface as Dt } from "node:readline";
function St(e, d) {
  return e.map((s) => {
    if (!s.id)
      return { ...s, status: "planned" };
    const o = d.filter((h) => h.idea === s.id);
    if (o.length === 0)
      return { ...s, status: "planned" };
    const u = o.every((h) => h.status === "done" || h.status === "dropped");
    return { ...s, status: u ? "done" : "planned" };
  });
}
const M = (e, d) => C(e, "papercamp", d), z = (e) => A(e, "utf-8").catch(() => "");
async function ut(e) {
  const [d, s, o, u] = await Promise.all([
    z(M(e, "plans.md")),
    z(M(e, "decisions.md")),
    z(M(e, "open-questions.md")),
    z(M(e, "progress.md"))
  ]);
  return {
    plans: K(d).entries,
    decisions: at(s).entries,
    openQuestions: nt(o).entries,
    progress: mt(u)
  };
}
function Et(e, d) {
  const s = [], o = (/* @__PURE__ */ new Date()).toISOString(), u = new Map(e.plans.map((a) => [a.title, a])), h = new Map(d.plans.map((a) => [a.title, a]));
  for (const [a, p] of h) {
    const f = u.get(a);
    if (!f)
      s.push({ message: `New plan added: ${a}`, timestamp: o });
    else if (f.status !== p.status)
      s.push({ message: `Plan "${a}" marked ${p.status}`, timestamp: o });
    else
      for (let g = 0; g < p.phases.length; g++) {
        const l = f.phases[g], c = p.phases[g];
        l && l.done !== c.done && s.push({
          message: c.done ? `Phase ${g + 1}/${p.phases.length} checked off in "${a}"` : `Phase ${g + 1}/${p.phases.length} unchecked in "${a}"`,
          timestamp: o
        });
      }
  }
  for (const [a] of u)
    h.has(a) || s.push({ message: `Plan removed: ${a}`, timestamp: o });
  const r = new Map(e.decisions.map((a) => [a.title, a])), t = new Map(d.decisions.map((a) => [a.title, a]));
  for (const [a] of t)
    r.has(a) || s.push({ message: `New decision: ${a}`, timestamp: o });
  const j = new Map(e.openQuestions.map((a) => [a.title, a])), w = new Map(d.openQuestions.map((a) => [a.title, a]));
  for (const [a] of w)
    j.has(a) || s.push({ message: `New open question: ${a}`, timestamp: o });
  const N = new Map(e.progress.map((a) => [a.date, a])), i = new Map(d.progress.map((a) => [a.date, a]));
  for (const [a] of i)
    N.has(a) || s.push({ message: `Progress logged: ${a}`, timestamp: o });
  return s;
}
function Rt(e) {
  const d = /* @__PURE__ */ new Set();
  let s = null, o = null;
  const u = ["plans.md", "decisions.md", "open-questions.md", "progress.md"];
  async function h() {
    try {
      const r = await ut(e);
      if (s) {
        const t = Et(s, r);
        for (const j of t) {
          const w = `data: ${JSON.stringify(j)}

`;
          for (const N of d)
            try {
              N.write(w);
            } catch {
              d.delete(N);
            }
        }
      }
      s = r;
    } catch {
    }
  }
  for (const r of u) {
    const t = M(e, r);
    try {
      Z(t, () => {
        o && clearTimeout(o), o = setTimeout(h, 300);
      });
    } catch {
    }
  }
  return ut(e).then((r) => {
    s = r;
  }), {
    subscribe(r) {
      d.add(r);
      const t = JSON.stringify({
        message: "Watching for changes…",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      r.write(`data: ${t}

`), r.on("close", () => d.delete(r));
    }
  };
}
function Bt(e) {
  return ["-p", e, "--output-format", "stream-json", "--verbose", "--permission-mode", "auto"];
}
function Ft(e) {
  let d;
  try {
    d = JSON.parse(e);
  } catch {
    return null;
  }
  switch (d.type) {
    case "system":
      return d.subtype === "init" ? { text: "Agent session started" } : d.subtype === "post_turn_summary" && typeof d.status_detail == "string" ? { text: d.status_detail } : null;
    case "rate_limit_event":
      return null;
    case "assistant": {
      const s = d.message, o = (s == null ? void 0 : s.content) ?? [];
      for (const u of o) {
        const h = u;
        if (h.type === "tool_use")
          return { text: `Running ${h.name ?? "a tool"}…` };
        if (h.type === "text" && typeof h.text == "string" && h.text.trim())
          return { text: h.text.trim() };
      }
      return null;
    }
    case "user": {
      const s = d.message, o = s == null ? void 0 : s.content, u = Array.isArray(o) ? o[0] : void 0;
      return u != null && u.is_error ? { text: `Error: ${typeof u.content == "string" ? u.content : "Tool call failed"}`, error: !0 } : { text: "Tool finished" };
    }
    case "result": {
      const s = !!d.is_error;
      return { text: (typeof d.result == "string" ? d.result.trim() : "") || (s ? "Agent run failed" : "Agent run finished"), done: !0, error: s };
    }
    default:
      return { text: "Agent is working…" };
  }
}
function Lt(e) {
  return ["run", e, "--format", "json"];
}
const Mt = {
  bash: "Running command",
  read: "Reading file",
  edit: "Editing file",
  write: "Writing file",
  glob: "Searching files",
  grep: "Searching code",
  websearch: "Searching web",
  webfetch: "Fetching URL",
  question: "Asking for input"
};
function _t(e) {
  let d;
  try {
    d = JSON.parse(e);
  } catch {
    return null;
  }
  const s = d.type, o = d.part;
  if (!s || !o) return null;
  switch (s) {
    case "step_start":
      return null;
    case "text": {
      const u = o.text;
      return u != null && u.trim() ? { text: u.trim() } : null;
    }
    case "tool_use": {
      const u = o.tool, h = o.state ? o.state.input : void 0, r = h ? h.description : void 0, t = u ? Mt[u] : "Running tool", j = typeof r == "string" && r.trim() ? `: ${r.trim()}` : "";
      return u ? { text: `${t}${j}…` } : null;
    }
    case "step_finish": {
      const u = o.reason, h = u === "tool-calls" ? null : u === "stop" ? "Done" : "Step finished";
      return h ? { text: h } : null;
    }
    default:
      return null;
  }
}
const ft = "claude-code", L = {
  "claude-code": {
    command: "claude",
    buildArgs: Bt,
    parseLine: Ft
  },
  opencode: {
    command: "opencode",
    buildArgs: Lt,
    parseLine: _t
  }
}, Gt = {
  phase: "phase",
  audit: "phase",
  draft: "planDraft",
  extend: "ideaExtend"
};
function Kt(e) {
  const { agentId: d, defaultAgents: s, taskKind: o } = e;
  if (d && d in L) return { id: d, adapter: L[d] };
  if (o && s) {
    const u = Gt[o], h = s[u];
    if (h && h in L) return { id: h, adapter: L[h] };
  }
  return { id: ft, adapter: L[ft] };
}
const Ut = 50;
function zt(e) {
  try {
    const d = At(C(e, "papercamp", "config.json"), "utf-8"), s = JSON.parse(d);
    return s.defaultAgents ? s.defaultAgents : s.defaultAgent ? {
      phase: s.defaultAgent,
      planDraft: s.defaultAgent,
      ideaExtend: s.defaultAgent
    } : lt;
  } catch {
    return lt;
  }
}
function Wt(e, d, s) {
  return `You're working on phase ${s + 1} ("${d.text}") of the plan "${e.title}" (${e.id ?? "no id"}) in papercamp/plans.md.

${d.description ?? ""}

Plan context: ${e.body}

Do only this phase. When done, check it off in plans.md (- [ ] -> - [x]) and append what you did to progress.md. If this was the last unchecked phase, set the plan's Status to \`review\`, not \`done\`, per this repo's AGENTS.md.`;
}
function Qt(e, d = () => {
}) {
  const s = /* @__PURE__ */ new Set();
  let o = null;
  function u(n) {
    const y = `data: ${JSON.stringify({ message: n, timestamp: (/* @__PURE__ */ new Date()).toISOString(), type: "agent" })}

`;
    for (const S of s)
      try {
        S.write(y);
      } catch {
        s.delete(S);
      }
  }
  function h(n, y) {
    n.lines.push(y), n.lines.length > Ut && n.lines.shift(), u(y);
  }
  function r(n, y) {
    n.status = y, u(`agent: ${y}`);
  }
  async function t(n) {
    var y, S;
    try {
      if (n.taskKind === "extend") {
        const I = C(e, "papercamp", "ideas"), F = (await _(I)).entries.find((x) => x.id === n.ideaId);
        if (!F) {
          const x = await A(C(e, "papercamp", "ideas.md"), "utf-8").catch(() => ""), { parseIdeas: X } = await import("../chunks/serializer.DEl5Ryp3.js").then((q) => q.N), dt = X(x).find(
            (q) => q.id === n.ideaId
          );
          return !dt || n.ideaBodyBaseline === void 0 ? null : dt.body !== n.ideaBodyBaseline;
        }
        return n.ideaBodyBaseline === void 0 ? null : F.body !== n.ideaBodyBaseline;
      }
      const T = C(e, "papercamp", "plans"), { entries: b } = await k(T);
      if (n.ideaId !== void 0)
        return b.some((I) => I.idea === n.ideaId);
      const v = b.find((I) => I.id === n.planId) ?? b.find((I) => I.title === n.planTitle);
      return v ? n.phaseIndex !== void 0 ? ((y = v.phases[n.phaseIndex]) == null ? void 0 : y.done) ?? null : n.planBaseline ? v.phases.length > n.planBaseline.phases || (((S = v.log) == null ? void 0 : S.length) ?? 0) > n.planBaseline.log : null : null;
    } catch {
      return null;
    }
  }
  function j(n, y) {
    r(n, y ? "error" : "done"), !y && t(n).then((S) => {
      if (o === n && S === !1) {
        const T = n.taskKind === "extend" ? `Warning: agent finished but the idea body for ${n.ideaId} did not change — verify manually` : n.ideaId !== void 0 ? `Warning: agent finished but no plan linking idea: ${n.ideaId} appeared in plans.md — verify manually` : n.phaseIndex !== void 0 ? "Warning: agent finished but did not check off this phase in plans.md — verify manually" : "Warning: agent finished but appended nothing to Phases or Log — verify manually";
        h(n, T);
      }
    });
  }
  function w(n) {
    if (!n.proc.stdout) return;
    Dt({ input: n.proc.stdout }).on("line", (S) => {
      if (o !== n || !S.trim()) return;
      const T = n.adapter.parseLine(S);
      T && (h(n, T.text), T.done && j(n, !!T.error));
    }), n.proc.on("close", (S) => {
      o === n && (n.status === "starting" || n.status === "running" ? j(n, S !== 0) : n.status === "stopping" && r(n, "done"));
    }), n.proc.on("error", (S) => {
      o === n && (h(n, `Failed to spawn agent: ${S.message}`), r(n, "error"));
    });
  }
  function N(n, y) {
    return V(n.command, y, {
      cwd: e,
      stdio: ["ignore", "pipe", "pipe"]
    });
  }
  function i() {
    return o !== null && o.status !== "done" && o.status !== "error";
  }
  function a(n, y, S) {
    if (i())
      return { ok: !1, error: "An agent task is already running" };
    const T = zt(e), { id: b, adapter: v } = Kt({
      agentId: n.agentOverride,
      defaultAgents: T,
      taskKind: S.taskKind
    }), I = N(v, v.buildArgs(y)), D = {
      planTitle: n.planTitle,
      planId: n.planId,
      status: "starting",
      agentId: b,
      adapter: v,
      proc: I,
      lines: [],
      ...S
    };
    return o = D, w(D), r(D, "running"), { ok: !0 };
  }
  function p(n, y) {
    if (i())
      return { ok: !1, error: "An agent task is already running" };
    const S = n.phases[y];
    if (!S)
      return { ok: !1, error: "Phase not found" };
    d(n);
    const T = Wt(n, S, y);
    return a({ planTitle: n.title, planId: n.id, agentOverride: n.agent }, T, {
      taskKind: "phase",
      phaseIndex: y
    });
  }
  function f(n, y) {
    var S;
    return a({ planTitle: n.title, planId: n.id, agentOverride: n.agent }, y, {
      taskKind: "audit",
      planBaseline: { phases: n.phases.length, log: ((S = n.log) == null ? void 0 : S.length) ?? 0 }
    });
  }
  function g(n, y) {
    return n.id ? a({ planTitle: `Draft plan for ${n.id}` }, y, {
      taskKind: "draft",
      ideaId: n.id
    }) : { ok: !1, error: "Idea has no id to link a drafted plan back to" };
  }
  function l(n, y) {
    return n.id ? a({ planTitle: `Extend ${n.id}` }, y, {
      taskKind: "extend",
      ideaId: n.id,
      ideaBodyBaseline: n.body
    }) : { ok: !1, error: "Idea has no id to extend" };
  }
  function c() {
    if (!o)
      return { ok: !1, error: "No agent task running" };
    const n = o;
    return r(n, "stopping"), n.proc.killed || n.proc.kill("SIGTERM"), setTimeout(() => {
      o === n && n.status === "stopping" && n.proc.kill("SIGKILL");
    }, 5e3), { ok: !0 };
  }
  function m() {
    return o ? {
      status: o.status,
      taskKind: o.taskKind,
      planTitle: o.planTitle,
      planId: o.planId,
      phaseIndex: o.phaseIndex,
      ideaId: o.ideaId,
      agentId: o.agentId,
      lines: [...o.lines]
    } : null;
  }
  return {
    start: p,
    startForPlan: f,
    startForIdea: g,
    startForIdeaExtend: l,
    stop: c,
    getStatus: m,
    subscribe(n) {
      s.add(n), n.on("close", () => s.delete(n));
    },
    killCurrent() {
      o != null && o.proc && !o.proc.killed && o.proc.kill();
    }
  };
}
function Yt(e) {
  const d = /* @__PURE__ */ new Set();
  function s(g) {
    const l = `data: ${JSON.stringify(g)}

`;
    for (const c of d)
      try {
        c.write(l);
      } catch {
        d.delete(c);
      }
  }
  function o(g) {
    const l = [];
    for (const c of g.split(`
`)) {
      if (!c.trim()) continue;
      const m = c[0] ?? " ", n = c[1] ?? " ", y = c.slice(3), S = y.split(" -> ").pop() ?? y;
      l.push({
        path: S,
        status: `${m}${n}`,
        staged: m !== " " && m !== "?"
      });
    }
    return l;
  }
  function u(g) {
    return new Promise((l, c) => {
      var S, T;
      const m = V("git", g, {
        cwd: e,
        stdio: ["ignore", "pipe", "pipe"]
      });
      let n = "", y = "";
      (S = m.stdout) == null || S.on("data", (b) => {
        n += b.toString();
      }), (T = m.stderr) == null || T.on("data", (b) => {
        y += b.toString();
      }), m.on("close", (b) => {
        b === 0 ? l(n) : c(new Error(y || `git ${g[0]} exited with code ${b}`));
      }), m.on("error", c);
    });
  }
  function h() {
    return u(["status", "--porcelain=v1"]).then(o);
  }
  async function r(g, l, c) {
    g.length > 0 && await u(["add", "--", ...g]);
    const m = ["commit", "-m", l];
    c && m.push("-m", c), await u(m);
  }
  function t(g) {
    if (!g.kind || !g.id) return;
    const l = g.kind.toLowerCase(), c = g.id.toLowerCase(), m = g.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""), n = `${l}/${c}-${m}`, y = U("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: e });
    if (y.status !== 0)
      throw new Error(
        y.stderr.toString().trim() || "Unable to read current git branch"
      );
    if (y.stdout.toString().trim() === n) return;
    const T = U("git", ["checkout", "-b", n, "main"], { cwd: e });
    if (T.status !== 0) {
      const b = U("git", ["checkout", n], { cwd: e });
      if (b.status !== 0)
        throw new Error(
          b.stderr.toString().trim() || T.stderr.toString().trim() || `Unable to check out ${n}`
        );
    }
  }
  async function j() {
    try {
      await h(), s({
        message: "Working tree status updated",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch {
    }
  }
  const w = C(e, ".git");
  let N = null;
  try {
    Z(w, { recursive: !0 }, (g, l) => {
      l === "index" && (N && clearTimeout(N), N = setTimeout(j, 500));
    });
  } catch {
  }
  const i = C(e, "src");
  let a = null;
  try {
    Z(i, { recursive: !0 }, () => {
      a && clearTimeout(a), a = setTimeout(j, 500);
    });
  } catch {
  }
  function p() {
    return U("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: e }).stdout.toString().trim();
  }
  function f() {
    const l = p().match(/^[a-z]+\/([a-z]+-\d+)-/);
    return l ? l[1].toUpperCase() : null;
  }
  return {
    async getStatus() {
      return h();
    },
    getCurrentBranch: p,
    commit: r,
    ensureBranch: t,
    getFeatureBranchPlanId: f,
    subscribe(g) {
      d.add(g), g.on("close", () => d.delete(g));
    }
  };
}
const Zt = {
  lint: "npx biome lint .",
  format: "npx biome format .",
  test: "npx vitest run"
};
function Vt(e) {
  const d = /* @__PURE__ */ new Set(), s = {
    lint: { status: "stale", lastRun: null, output: "" },
    format: { status: "stale", lastRun: null, output: "" },
    test: { status: "stale", lastRun: null, output: "" }
  }, o = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Set();
  function h(i) {
    const a = `data: ${JSON.stringify(i)}

`;
    for (const p of d)
      try {
        p.write(a);
      } catch {
        d.delete(p);
      }
  }
  function r(i, a, p) {
    s[i] = { status: a, lastRun: (/* @__PURE__ */ new Date()).toISOString(), output: p }, h({
      message: `${i}: ${a}`,
      timestamp: s[i].lastRun
    }), a !== "running" && u.has(i) && (u.delete(i), t(i));
  }
  function t(i) {
    var l, c;
    if (o.has(i)) {
      u.add(i);
      return;
    }
    o.add(i), r(i, "running", "");
    const a = Zt[i], p = V(a, {
      cwd: e,
      stdio: ["ignore", "pipe", "pipe"],
      shell: !0
    });
    let f = "", g = "";
    (l = p.stdout) == null || l.on("data", (m) => {
      f += m.toString();
    }), (c = p.stderr) == null || c.on("data", (m) => {
      g += m.toString();
    }), p.on("close", (m) => {
      o.delete(i);
      const n = f + g;
      m === 0 ? r(i, "pass", n) : r(i, "fail", n);
    }), p.on("error", (m) => {
      o.delete(i), r(i, "fail", `Failed to spawn process: ${m.message}`);
    });
  }
  function j() {
    if (o.has("lint") || o.has("format")) return;
    r("lint", "running", "Applying automatic fixes…"), r("format", "running", "Applying automatic fixes…");
    const i = V("npx biome check . --write", {
      cwd: e,
      stdio: ["ignore", "pipe", "pipe"],
      shell: !0
    });
    i.on("close", () => {
      t("lint"), t("format");
    }), i.on("error", (a) => {
      const p = `Failed to spawn fix process: ${a.message}`;
      r("lint", "fail", p), r("format", "fail", p);
    });
  }
  const w = C(e, "src");
  let N = null;
  try {
    Z(w, { recursive: !0 }, () => {
      N && clearTimeout(N), N = setTimeout(() => {
        t("lint"), t("format");
      }, 1e3);
    });
  } catch {
  }
  return {
    getStatus() {
      return {
        lint: { ...s.lint },
        format: { ...s.format },
        test: { ...s.test }
      };
    },
    runCheck: t,
    runQualityFix: j,
    subscribe(i) {
      d.add(i);
      for (const a of ["lint", "format", "test"]) {
        const p = s[a];
        p.status !== "stale" && i.write(
          `data: ${JSON.stringify({ message: `${a}: ${p.status}`, timestamp: p.lastRun })}

`
        );
      }
      i.on("close", () => d.delete(i));
    }
  };
}
async function J(e) {
  try {
    return await A(e, "utf-8");
  } catch (d) {
    if (d.code === "ENOENT") return "";
    throw d;
  }
}
async function et(e) {
  try {
    return await ot(e), !0;
  } catch {
    return !1;
  }
}
async function H(e) {
  return new Promise((d, s) => {
    let o = "";
    e.on("data", (u) => {
      o += u;
    }), e.on("end", () => d(o)), e.on("error", s);
  });
}
const O = (e, d) => C(e, "papercamp", d), Xt = [
  "biome.json",
  "tsconfig.json",
  "tailwind.config.ts",
  "vite.config.ts",
  "vite.app.config.ts",
  "postcss.config.js",
  "package.json"
];
async function E(e, d, s) {
  const o = d.getFeatureBranchPlanId();
  if (!o || s && o === s) return null;
  const u = O(e, "plans"), { entries: h } = await k(u), r = h.find((t) => t.id === o);
  if (!r || r.status === "done" || r.status === "dropped") return null;
  if (!r) {
    const t = await J(O(e, "plans.md"));
    if (!t) return null;
    const j = K(t).entries.find((w) => w.id === o);
    return !j || j.status === "done" || j.status === "dropped" ? null : `Finish \`${o}\` — ${j.title} — before starting another plan`;
  }
  return `Finish \`${o}\` — ${r.title} — before starting another plan`;
}
async function W(e) {
  const d = O(e, "plans"), s = O(e, "ideas"), [o, u] = await Promise.all([
    st(d, O(e, "plans.md")),
    wt(s, O(e, "ideas.md"))
  ]), h = St(u.entries, o.entries);
  await P(d, { recursive: !0 }), await P(s, { recursive: !0 }), await Promise.all([
    $(C(d, "index.md"), rt(o.entries)),
    $(C(s, "index.md"), Ct(h))
  ]);
}
const qt = [
  {
    path: "/api/package-name",
    handler: async (e) => {
      const d = await J(C(e, "package.json"));
      if (!d) return null;
      try {
        return JSON.parse(d).name ?? null;
      } catch {
        return null;
      }
    }
  },
  {
    path: "/api/plans",
    handler: async (e) => st(O(e, "plans"), O(e, "plans.md"))
  },
  {
    path: "/api/progress",
    handler: async (e) => ({
      entries: mt(await J(O(e, "progress.md")))
    })
  },
  {
    path: "/api/decisions",
    handler: async (e) => at(await J(O(e, "decisions.md")))
  },
  {
    path: "/api/open-questions",
    handler: async (e) => nt(await J(O(e, "open-questions.md")))
  },
  {
    path: "/api/ideas",
    handler: async (e) => wt(O(e, "ideas"), O(e, "ideas.md"))
  },
  {
    path: "/api/consistency",
    handler: async (e) => {
      const [d, s, o] = await Promise.all([
        J(O(e, "decisions.md")),
        J(O(e, "open-questions.md")),
        st(O(e, "plans"), O(e, "plans.md"))
      ]), u = at(d), h = nt(s);
      return $t(u.entries, h.entries, o.entries);
    }
  },
  {
    path: "/api/config",
    handler: async (e) => {
      const d = await J(C(e, "papercamp", "config.json"));
      return d ? JSON.parse(d) : null;
    }
  },
  {
    path: "/api/docs",
    handler: async (e) => {
      const d = ["MAIN.md", "README.md", "CHANGELOG.md", "LICENSE"], s = [];
      for (const o of d) {
        const u = await J(C(e, o));
        u && s.push({ name: o, content: u });
      }
      return { files: s };
    }
  },
  {
    path: "/api/configs",
    handler: async (e) => {
      const d = [
        "biome.json",
        "tsconfig.json",
        "tailwind.config.ts",
        "vite.config.ts",
        "vite.app.config.ts",
        "postcss.config.js",
        "package.json"
      ], s = [];
      for (const o of d)
        await J(C(e, o)) && s.push(o);
      return { files: s };
    }
  }
];
function te(e) {
  const d = Rt(e), s = Yt(e), o = Vt(e), u = Qt(e, (r) => s.ensureBranch(r)), h = async (r, t, j) => {
    const w = (r.url ?? "").split("?")[0];
    if (r.method === "DELETE" && w === "/api/plans") {
      try {
        const a = new URL(r.url ?? "", `http://${r.headers.host ?? "localhost"}`).searchParams.get("title");
        if (!(a != null && a.trim())) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "title is required" }));
          return;
        }
        const p = O(e, "plans"), f = a.trim(), { entries: g } = await k(p), l = g.find((m) => m.title === f || m.id === f);
        if (!(l != null && l.id)) {
          t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "plan not found in per-file storage" }));
          return;
        }
        const c = C(p, `${l.id}.md`);
        if (!await et(c)) {
          t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "plan file not found" }));
          return;
        }
        await Tt(c), await W(e), t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      } catch (i) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.message }));
      }
      return;
    }
    if (r.method === "POST" && w === "/api/plans") {
      try {
        const i = await H(r), { title: a, content: p, kind: f } = JSON.parse(i);
        if (!(a != null && a.trim())) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "title is required" }));
          return;
        }
        const g = f && Y.includes(f) ? f : "feat", l = C(e, "papercamp", "config.json"), c = await yt(l, g);
        if (!c) {
          t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "could not assign plan ID" }));
          return;
        }
        const m = O(e, "plans");
        await P(m, { recursive: !0 });
        const n = G({
          id: c,
          title: a.trim(),
          kind: g,
          status: "idea",
          created: Q(),
          body: p == null ? void 0 : p.trim()
        });
        await $(C(m, `${c}.md`), `${n}
`, "utf-8"), await W(e), t.statusCode = 201, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0, id: c }));
      } catch (i) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.message }));
      }
      return;
    }
    if (r.method === "PATCH" && w === "/api/plans") {
      try {
        const a = new URL(r.url ?? "", `http://${r.headers.host ?? "localhost"}`).searchParams.get("title");
        if (!(a != null && a.trim())) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "title is required" }));
          return;
        }
        const p = await H(r), f = JSON.parse(p);
        if (f.agent && !tt.includes(f.agent)) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "agent must be a known agent id" }));
          return;
        }
        const g = O(e, "plans"), { entries: l } = await k(g), c = a.trim(), m = l.find((v) => v.title === c || v.id === c);
        if (!(m != null && m.id)) {
          t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "plan not found" }));
          return;
        }
        const n = C(g, `${m.id}.md`), y = await J(n);
        if (!y) {
          t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "plan file not found" }));
          return;
        }
        const S = ct(y);
        if (S.entries.length === 0) {
          t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "failed to parse plan file" }));
          return;
        }
        const T = {
          ...S.entries[0],
          ...f.status !== void 0 && { status: f.status },
          ...f.phases !== void 0 && { phases: f.phases },
          ...f.log !== void 0 && { log: f.log },
          ...f.agent !== void 0 && { agent: f.agent ?? void 0 },
          updated: Q()
        };
        if (f.status === "done" || f.status === "dropped") {
          const v = await E(e, s, m.id);
          if (v) {
            t.statusCode = 409, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: v }));
            return;
          }
        }
        if (f.status === "in-progress") {
          const v = await k(g);
          for (const I of v.entries)
            if (I.id !== m.id && I.status === "in-progress") {
              const D = C(g, `${I.id}.md`), F = await J(D);
              if (F) {
                const x = ct(F);
                if (x.entries.length > 0) {
                  const X = {
                    id: x.entries[0].id ?? I.id,
                    title: x.entries[0].title,
                    kind: x.entries[0].kind ?? "feat",
                    status: "planned",
                    created: x.entries[0].created,
                    updated: Q(),
                    body: x.entries[0].body,
                    phases: x.entries[0].phases,
                    log: x.entries[0].log,
                    clarifications: x.entries[0].clarifications
                  };
                  await $(D, `${G(X)}
`, "utf-8");
                }
              }
            }
        }
        const b = {
          id: T.id ?? m.id,
          title: T.title,
          kind: T.kind ?? "feat",
          status: T.status,
          idea: T.idea,
          agent: T.agent,
          created: T.created,
          updated: T.updated,
          tags: T.tags,
          body: T.body,
          phases: T.phases,
          log: T.log,
          clarifications: T.clarifications
        };
        if (await $(n, `${G(b)}
`, "utf-8"), await W(e), f.status === "done" || f.status === "dropped") {
          await Jt(e, m.id);
          try {
            s.ensureBranch(T);
          } catch {
          }
        }
        t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      } catch (i) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.message }));
      }
      return;
    }
    if (r.method === "POST" && w === "/api/ideas") {
      try {
        const i = await H(r), { title: a, content: p } = JSON.parse(i);
        if (!(a != null && a.trim())) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "title is required" }));
          return;
        }
        const f = O(e, "ideas"), c = `IDEA-${(await _(f)).entries.reduce((n, y) => {
          if (y.id) {
            const S = Number.parseInt(y.id.replace("IDEA-", ""), 10);
            return Number.isNaN(S) ? n : Math.max(n, S);
          }
          return n;
        }, 0) + 1}`;
        await P(f, { recursive: !0 });
        const m = ht({
          id: c,
          title: a.trim(),
          body: p == null ? void 0 : p.trim()
        });
        await $(C(f, `${c}.md`), `${m}
`, "utf-8"), await W(e), t.statusCode = 201, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0, id: c }));
      } catch (i) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.message }));
      }
      return;
    }
    if (r.method === "GET" && w === "/api/icon") {
      const i = C(e, "papercamp", "assets"), a = {
        svg: "image/svg+xml",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        webp: "image/webp"
      };
      for (const [p, f] of Object.entries(a))
        try {
          const g = await A(C(i, `icon.${p}`));
          t.statusCode = 200, t.setHeader("Content-Type", f), t.setHeader("Cache-Control", "no-cache"), t.end(g);
          return;
        } catch {
        }
      t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "no icon uploaded" }));
      return;
    }
    if (r.method === "POST" && w === "/api/icon") {
      try {
        const i = await H(r), { dataUri: a } = JSON.parse(i);
        if (!a) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "dataUri is required" }));
          return;
        }
        const p = a.match(/^data:(image\/[a-z0-9+.-]+);base64,(.+)$/);
        if (!p) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "invalid data URI" }));
          return;
        }
        const f = p[1], g = f === "image/svg+xml" ? "svg" : f.split("/")[1], l = Buffer.from(p[2], "base64"), c = C(e, "papercamp", "assets");
        await P(c, { recursive: !0 }), await $(C(c, `icon.${g}`), l), t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      } catch (i) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.message }));
      }
      return;
    }
    if (r.method === "GET" && w === "/api/git/status") {
      try {
        const i = await s.getStatus(), a = s.getCurrentBranch();
        t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ branch: a, entries: i }));
      } catch (i) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.message }));
      }
      return;
    }
    if (r.method === "POST" && w === "/api/git/commit") {
      try {
        const i = await H(r), { files: a, title: p, message: f } = JSON.parse(i);
        if (!(p != null && p.trim())) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "title is required" }));
          return;
        }
        await s.commit(a ?? [], p.trim(), f == null ? void 0 : f.trim()), t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      } catch (i) {
        t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.message }));
      }
      return;
    }
    if (r.method === "GET" && w === "/api/status") {
      t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify(o.getStatus()));
      return;
    }
    if (r.method === "POST" && w === "/api/status/check") {
      const a = new URL(r.url ?? "", `http://${r.headers.host ?? "localhost"}`).searchParams.get("name");
      if (a !== "lint" && a !== "format" && a !== "test") {
        t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "name must be lint, format, or test" }));
        return;
      }
      o.runCheck(a), t.statusCode = 202, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      return;
    }
    if (r.method === "POST" && w === "/api/status/fix") {
      o.runQualityFix(), t.statusCode = 202, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      return;
    }
    if (r.method === "GET" && w === "/api/activity/stream") {
      t.statusCode = 200, t.setHeader("Content-Type", "text/event-stream"), t.setHeader("Cache-Control", "no-cache"), t.setHeader("Connection", "keep-alive"), t.flushHeaders(), d.subscribe(t), s.subscribe(t), o.subscribe(t), u.subscribe(t);
      return;
    }
    if (r.method === "GET" && w === "/api/agent/status") {
      t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify(u.getStatus()));
      return;
    }
    if (r.method === "POST" && w === "/api/agent/launch") {
      try {
        const i = await H(r), { planId: a, phaseIndex: p } = JSON.parse(i);
        if (!a || typeof p != "number") {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "planId and phaseIndex are required" }));
          return;
        }
        const f = O(e, "plans"), l = (await k(f)).entries.find((n) => n.id === a);
        if (!l) {
          const y = K(await J(O(e, "plans.md"))).entries.find((b) => b.id === a);
          if (!y) {
            t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "plan not found" }));
            return;
          }
          const S = await E(e, s, y.id);
          if (S) {
            t.statusCode = 409, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: S }));
            return;
          }
          const T = await u.start(y, p);
          if (!T.ok) {
            t.statusCode = 409, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: T.error }));
            return;
          }
          t.statusCode = 202, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
          return;
        }
        const c = await E(e, s, l.id);
        if (c) {
          t.statusCode = 409, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: c }));
          return;
        }
        const m = await u.start(l, p);
        if (!m.ok) {
          t.statusCode = 409, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: m.error }));
          return;
        }
        t.statusCode = 202, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      } catch (i) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.message }));
      }
      return;
    }
    if (r.method === "POST" && w === "/api/agent/launch-audit") {
      try {
        const i = await H(r), { planId: a, prompt: p } = JSON.parse(i);
        if (!a || !p) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "planId and prompt are required" }));
          return;
        }
        const f = O(e, "plans");
        let l = (await k(f)).entries.find((n) => n.id === a);
        if (l || (l = K(await J(O(e, "plans.md"))).entries.find((y) => y.id === a)), !l) {
          t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "plan not found" }));
          return;
        }
        const c = await E(e, s, l.id);
        if (c) {
          t.statusCode = 409, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: c }));
          return;
        }
        const m = u.startForPlan(l, p);
        if (!m.ok) {
          t.statusCode = 409, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: m.error }));
          return;
        }
        t.statusCode = 202, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      } catch (i) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.message }));
      }
      return;
    }
    if (r.method === "POST" && w === "/api/agent/launch-draft") {
      try {
        const i = await H(r), { ideaId: a, prompt: p } = JSON.parse(i);
        if (!a || !p) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "ideaId and prompt are required" }));
          return;
        }
        const f = O(e, "ideas");
        let l = (await _(f)).entries.find((n) => n.id === a);
        if (l || (l = it(await J(O(e, "ideas.md"))).find((y) => y.id === a)), !l) {
          t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "idea not found" }));
          return;
        }
        const c = await E(e, s);
        if (c) {
          t.statusCode = 409, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: c }));
          return;
        }
        const m = u.startForIdea(l, p);
        if (!m.ok) {
          t.statusCode = 409, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: m.error }));
          return;
        }
        t.statusCode = 202, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      } catch (i) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.message }));
      }
      return;
    }
    if (r.method === "POST" && w === "/api/agent/launch-extend") {
      try {
        const i = await H(r), { ideaId: a, prompt: p } = JSON.parse(i);
        if (!a || !p) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "ideaId and prompt are required" }));
          return;
        }
        const f = O(e, "ideas");
        let l = (await _(f)).entries.find((n) => n.id === a);
        if (l || (l = it(await J(O(e, "ideas.md"))).find((y) => y.id === a)), !l) {
          t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "idea not found" }));
          return;
        }
        const c = await E(e, s);
        if (c) {
          t.statusCode = 409, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: c }));
          return;
        }
        const m = u.startForIdeaExtend(l, p);
        if (!m.ok) {
          t.statusCode = 409, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: m.error }));
          return;
        }
        t.statusCode = 202, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      } catch (i) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.message }));
      }
      return;
    }
    if (r.method === "POST" && w === "/api/agent/stop") {
      const i = u.stop();
      if (!i.ok) {
        t.statusCode = 409, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.error }));
        return;
      }
      t.statusCode = 202, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      return;
    }
    if (r.method === "POST" && w === "/api/config") {
      try {
        const i = C(e, "papercamp", "config.json"), a = await J(i);
        if (!a) {
          t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "config not found" }));
          return;
        }
        const p = await H(r), { port: f, projectName: g, defaultAgent: l, defaultAgents: c } = JSON.parse(p);
        if (f !== void 0 && (!Number.isInteger(f) || f <= 0)) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "port must be a positive integer" }));
          return;
        }
        if (g !== void 0 && g.trim().length === 0) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "projectName must not be empty" }));
          return;
        }
        if (l !== void 0 && !tt.includes(l)) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "defaultAgent must be a known agent id" }));
          return;
        }
        if (c !== void 0) {
          for (const v of ["phase", "planDraft", "ideaExtend"])
            if (!tt.includes(c[v])) {
              t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: `defaultAgents.${v} must be a known agent id` }));
              return;
            }
        }
        const m = JSON.parse(a), n = c ?? (l !== void 0 ? { phase: l, planDraft: l, ideaExtend: l } : void 0), y = m, { defaultAgent: S, ...T } = y, b = {
          ...T,
          ...f !== void 0 && { port: f },
          ...g !== void 0 && { projectName: g.trim() },
          ...n && { defaultAgents: n }
        };
        await $(i, JSON.stringify(b, null, 2)), t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      } catch (i) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.message }));
      }
      return;
    }
    if (r.method === "GET" && w === "/api/env") {
      try {
        const i = C(e, ".env"), a = C(e, ".env.example"), [p, f] = await Promise.all([
          et(i),
          et(a)
        ]), g = p ? pt(await J(i)) : [], l = f ? pt(await J(a)).map((n) => n.key) : [], c = new Set(g.map((n) => n.key)), m = l.filter((n) => !c.has(n));
        t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ exists: p, exampleExists: f, entries: g, missingKeys: m }));
      } catch (i) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.message }));
      }
      return;
    }
    if (r.method === "POST" && w === "/api/env") {
      try {
        const i = await H(r), { entries: a } = JSON.parse(i);
        if (!Array.isArray(a)) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "entries is required" }));
          return;
        }
        const p = /* @__PURE__ */ new Set();
        for (const l of a) {
          if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(l.key)) {
            t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: `invalid key: ${l.key}` }));
            return;
          }
          if (p.has(l.key)) {
            t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: `duplicate key: ${l.key}` }));
            return;
          }
          p.add(l.key);
        }
        const f = C(e, ".env"), g = await J(f);
        await $(f, vt(g, a)), t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      } catch (i) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.message }));
      }
      return;
    }
    if (r.method === "GET" && w === "/api/configs") {
      const a = new URL(r.url ?? "", `http://${r.headers.host ?? "localhost"}`).searchParams.get("name");
      if (a)
        try {
          if (!Xt.includes(a)) {
            t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "invalid config file name" }));
            return;
          }
          const p = await J(C(e, a));
          if (!p) {
            t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "config file not found" }));
            return;
          }
          t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ name: a, content: p }));
          return;
        } catch (p) {
          t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: p.message }));
          return;
        }
    }
    const N = qt.find((i) => i.path === w);
    if (!N) {
      j();
      return;
    }
    try {
      const i = await N.handler(e);
      t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify(i));
    } catch (i) {
      t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.message }));
    }
  };
  return h.agent = u, h;
}
const ee = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};
function ne() {
  return C(Nt(Pt(import.meta.url)), "..", "app");
}
async function ae({ root: e, port: d }) {
  const s = ne(), o = C(s, "index.html"), u = await A(o, "utf-8").catch(() => null);
  if (u === null)
    throw new Error(
      `Dashboard assets not found at ${s}. Run \`pnpm build\` (or reinstall the package) so dist/app exists.`
    );
  const h = te(e);
  async function r(w, N) {
    const i = decodeURIComponent((w.url ?? "/").split("?")[0]), a = C(s, i === "/" ? "index.html" : i);
    try {
      if ((await ot(a)).isFile()) {
        N.statusCode = 200, N.setHeader("Content-Type", ee[Ot(a)] ?? "application/octet-stream"), N.end(await A(a));
        return;
      }
    } catch {
    }
    N.statusCode = 200, N.setHeader("Content-Type", "text/html; charset=utf-8"), N.end(u);
  }
  const t = kt((w, N) => {
    h(w, N, () => {
      r(w, N).catch((i) => {
        N.statusCode = 500, N.end(String(i));
      });
    });
  }), j = () => {
    h.agent.killCurrent(), process.exit(0);
  };
  process.on("SIGINT", j), process.on("SIGTERM", j), await new Promise((w) => t.listen(d, w));
}
async function gt(e) {
  try {
    return await ot(e), !0;
  } catch {
    return !1;
  }
}
const B = new bt();
B.name("paper-camp").description("Local-first, AI-native project companion.").version(It);
B.command("init [project-name]").description("Initialize Paper Camp in the current directory").option("-i, --intent <text>", "one-line description of what you are building").action(async (e, d) => {
  const s = process.cwd(), o = e ?? jt(s);
  try {
    await xt(s, { projectName: o, intent: d.intent }), console.log(`Initialized Paper Camp in ${s}`), console.log("  papercamp/config.json"), console.log("  papercamp/plans/          (per-file plan entries)"), console.log("  papercamp/plans/index.md"), console.log("  papercamp/plans/archive/"), console.log("  papercamp/ideas/          (per-file idea entries)"), console.log("  papercamp/ideas/index.md"), console.log("  papercamp/progress.md, decisions.md, open-questions.md");
  } catch (u) {
    if (u instanceof Ht) {
      console.error(u.message), process.exitCode = 1;
      return;
    }
    throw u;
  }
});
B.command("dev").description("Start the local dashboard").option("-p, --port <number>", "port to listen on", "3333").action(async (e) => {
  const d = Number(e.port), s = process.cwd();
  try {
    await ae({ root: s, port: d }), console.log(`Paper Camp dashboard running at http://localhost:${d}`);
  } catch (o) {
    console.error(o.message), process.exitCode = 1;
  }
});
B.command("add <type> [name]").description("Add a new entry (currently supports: plan)").option("-k, --kind <kind>", `plan kind (${Y.join("|")})`, "feat").action(async (e, d, s) => {
  if (e !== "plan") {
    console.error(`Unknown type "${e}". Supported types: plan`), process.exitCode = 1;
    return;
  }
  if (!d) {
    console.error("Usage: paper-camp add plan <name> [--kind feat|fix|chore|docs|refactor]"), process.exitCode = 1;
    return;
  }
  if (!Y.includes(s.kind)) {
    console.error(`Unknown kind "${s.kind}". Supported kinds: ${Y.join(", ")}`), process.exitCode = 1;
    return;
  }
  const o = s.kind, u = process.cwd(), h = R(u, "papercamp", "config.json"), r = await yt(h, o);
  if (!r) {
    console.error("Could not assign plan ID — is the project initialized?"), process.exitCode = 1;
    return;
  }
  const t = R(u, "papercamp", "plans");
  await P(t, { recursive: !0 });
  const j = G({
    id: r,
    title: d,
    kind: o,
    status: "idea",
    created: Q()
  });
  await $(C(t, `${r}.md`), `${j}
`, "utf-8");
  const { entries: w } = await k(t);
  await $(C(t, "index.md"), rt(w), "utf-8"), console.log(`Added plan "${d}" (${r}) to papercamp/plans/${r}.md`);
});
B.command("migrate").description(
  "One-time migration: split monolithic plans.md/ideas.md into per-file YAML frontmatter entries"
).action(async () => {
  const e = process.cwd(), d = R(e, "papercamp", "plans"), s = C(d, "archive"), o = R(e, "papercamp", "ideas");
  await P(s, { recursive: !0 }), await P(o, { recursive: !0 });
  const u = R(e, "papercamp", "plans.md"), h = R(e, "papercamp", "ideas.md");
  let r = 0, t = 0;
  const j = await A(u, "utf-8").catch(() => "");
  if (j.trim()) {
    const { entries: g, warnings: l } = K(j);
    for (const c of l)
      console.warn(`  warning: ${c.title}: ${c.message}`);
    for (const c of g) {
      if (!c.id) {
        console.warn(`  skipping plan "${c.title}" — no Id assigned, cannot migrate`), t++;
        continue;
      }
      const m = c.status === "done" || c.status === "dropped" ? s : d, n = C(m, `${c.id}.md`);
      if (await gt(n)) {
        t++;
        continue;
      }
      const y = G({
        id: c.id,
        title: c.title,
        kind: c.kind ?? "feat",
        status: c.status,
        idea: c.idea,
        agent: c.agent,
        created: c.created,
        updated: c.updated,
        tags: c.tags,
        body: c.body,
        phases: c.phases,
        log: c.log,
        clarifications: c.clarifications
      });
      await $(n, `${y}
`, "utf-8"), r++;
    }
  }
  let w = 0, N = 0;
  const i = await A(h, "utf-8").catch(() => "");
  if (i.trim()) {
    const g = it(i);
    for (const l of g) {
      if (!l.id) {
        console.warn(`  skipping idea "${l.title}" — no Id assigned, cannot migrate`), N++;
        continue;
      }
      const c = C(o, `${l.id}.md`);
      if (await gt(c)) {
        N++;
        continue;
      }
      const m = ht({ id: l.id, title: l.title, body: l.body });
      await $(c, `${m}
`, "utf-8"), w++;
    }
  }
  const { entries: a } = await k(d);
  await $(C(d, "index.md"), rt(a), "utf-8");
  const { entries: p } = await _(o), f = St(p, a);
  await $(C(o, "index.md"), Ct(f), "utf-8"), r > 0 && t === 0 && await $(u, "", "utf-8"), w > 0 && N === 0 && await $(h, "", "utf-8"), console.log(
    `Migrated ${r} plans (${t} skipped), ${w} ideas (${N} skipped).`
  );
});
B.parseAsync(process.argv);
//# sourceMappingURL=index.js.map
