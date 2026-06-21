#!/usr/bin/env node
import { readFile as j, writeFile as S, mkdir as D, stat as R } from "node:fs/promises";
import { join as u, dirname as U, extname as L, basename as F, resolve as H } from "node:path";
import { Command as G } from "commander";
import { l as k, j as E, h as I, k as v, e as J, c as M, t as T, a as A, P as Q, i as z, A as B } from "../chunks/serializer.2hjOGt3f.js";
import { createServer as _ } from "node:http";
import { fileURLToPath as W } from "node:url";
import { watch as K } from "node:fs";
const N = (e, s) => u(e, "papercamp", s), P = (e) => j(e, "utf-8").catch(() => "");
async function b(e) {
  const [s, n, t, p] = await Promise.all([
    P(N(e, "plans.md")),
    P(N(e, "decisions.md")),
    P(N(e, "open-questions.md")),
    P(N(e, "progress.md"))
  ]);
  return {
    plans: v(s).entries,
    decisions: I(n).entries,
    openQuestions: E(t).entries,
    progress: k(p)
  };
}
function V(e, s) {
  const n = [], t = (/* @__PURE__ */ new Date()).toISOString(), p = new Map(e.plans.map((a) => [a.title, a])), l = new Map(s.plans.map((a) => [a.title, a]));
  for (const [a, d] of l) {
    const y = p.get(a);
    if (!y)
      n.push({ message: `New plan added: ${a}`, timestamp: t });
    else if (y.status !== d.status)
      n.push({ message: `Plan "${a}" marked ${d.status}`, timestamp: t });
    else
      for (let w = 0; w < d.phases.length; w++) {
        const g = y.phases[w], x = d.phases[w];
        g && g.done !== x.done && n.push({
          message: x.done ? `Phase ${w + 1}/${d.phases.length} checked off in "${a}"` : `Phase ${w + 1}/${d.phases.length} unchecked in "${a}"`,
          timestamp: t
        });
      }
  }
  for (const [a] of p)
    l.has(a) || n.push({ message: `Plan removed: ${a}`, timestamp: t });
  const m = new Map(e.decisions.map((a) => [a.title, a])), r = new Map(s.decisions.map((a) => [a.title, a]));
  for (const [a] of r)
    m.has(a) || n.push({ message: `New decision: ${a}`, timestamp: t });
  const o = new Map(e.openQuestions.map((a) => [a.title, a])), i = new Map(s.openQuestions.map((a) => [a.title, a]));
  for (const [a] of i)
    o.has(a) || n.push({ message: `New open question: ${a}`, timestamp: t });
  const c = new Map(e.progress.map((a) => [a.date, a])), f = new Map(s.progress.map((a) => [a.date, a]));
  for (const [a] of f)
    c.has(a) || n.push({ message: `Progress logged: ${a}`, timestamp: t });
  return n;
}
function X(e) {
  const s = /* @__PURE__ */ new Set();
  let n = null, t = null;
  const p = ["plans.md", "decisions.md", "open-questions.md", "progress.md"];
  async function l() {
    try {
      const m = await b(e);
      if (n) {
        const r = V(n, m);
        for (const o of r) {
          const i = `data: ${JSON.stringify(o)}

`;
          for (const c of s)
            try {
              c.write(i);
            } catch {
              s.delete(c);
            }
        }
      }
      n = m;
    } catch {
    }
  }
  for (const m of p) {
    const r = N(e, m);
    try {
      K(r, () => {
        t && clearTimeout(t), t = setTimeout(l, 300);
      });
    } catch {
    }
  }
  return b(e).then((m) => {
    n = m;
  }), {
    subscribe(m) {
      s.add(m);
      const r = JSON.stringify({
        message: "Watching for changes…",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      m.write(`data: ${r}

`), m.on("close", () => s.delete(m));
    }
  };
}
async function h(e) {
  try {
    return await j(e, "utf-8");
  } catch (s) {
    if (s.code === "ENOENT") return "";
    throw s;
  }
}
async function $(e) {
  return new Promise((s, n) => {
    let t = "";
    e.on("data", (p) => {
      t += p;
    }), e.on("end", () => s(t)), e.on("error", n);
  });
}
const C = (e, s) => u(e, "papercamp", s), Y = [
  "biome.json",
  "tsconfig.json",
  "tailwind.config.ts",
  "vite.config.ts",
  "vite.app.config.ts",
  "postcss.config.js",
  "package.json"
], Z = [
  {
    path: "/api/package-name",
    handler: async (e) => {
      const s = await h(u(e, "package.json"));
      if (!s) return null;
      try {
        return JSON.parse(s).name ?? null;
      } catch {
        return null;
      }
    }
  },
  {
    path: "/api/plans",
    handler: async (e) => v(await h(C(e, "plans.md")))
  },
  {
    path: "/api/progress",
    handler: async (e) => ({
      entries: k(await h(C(e, "progress.md")))
    })
  },
  {
    path: "/api/decisions",
    handler: async (e) => I(await h(C(e, "decisions.md")))
  },
  {
    path: "/api/open-questions",
    handler: async (e) => E(await h(C(e, "open-questions.md")))
  },
  {
    path: "/api/ideas",
    handler: async (e) => ({
      content: await h(C(e, "ideas.md"))
    })
  },
  {
    path: "/api/config",
    handler: async (e) => {
      const s = await h(u(e, ".paper-camp", "config.json"));
      return s ? JSON.parse(s) : null;
    }
  },
  {
    path: "/api/docs",
    handler: async (e) => {
      const s = ["README.md", "CHANGELOG.md", "LICENSE"], n = [];
      for (const t of s) {
        const p = await h(u(e, t));
        p && n.push({ name: t, content: p });
      }
      return { files: n };
    }
  },
  {
    path: "/api/configs",
    handler: async (e) => {
      const s = [
        "biome.json",
        "tsconfig.json",
        "tailwind.config.ts",
        "vite.config.ts",
        "vite.app.config.ts",
        "postcss.config.js",
        "package.json"
      ], n = [];
      for (const t of s)
        await h(u(e, t)) && n.push(t);
      return { files: n };
    }
  }
];
function q(e) {
  const s = X(e);
  return async (n, t, p) => {
    const l = (n.url ?? "").split("?")[0];
    if (n.method === "DELETE" && l === "/api/plans") {
      try {
        const o = new URL(n.url ?? "", `http://${n.headers.host ?? "localhost"}`).searchParams.get("title");
        if (!(o != null && o.trim())) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "title is required" }));
          return;
        }
        const i = C(e, "plans.md"), c = v(await h(i)), f = o.trim(), a = c.entries.filter((d) => d.title !== f);
        if (a.length === c.entries.length) {
          t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "plan not found" }));
          return;
        }
        await S(i, J(a)), t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      } catch (r) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: r.message }));
      }
      return;
    }
    if (n.method === "POST" && l === "/api/plans") {
      try {
        const r = await $(n), { title: o, content: i, kind: c } = JSON.parse(r);
        if (!(o != null && o.trim())) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "title is required" }));
          return;
        }
        const f = c && ["feat", "fix", "chore", "docs", "refactor"].includes(c) ? c : "feat", a = u(e, ".paper-camp", "config.json");
        let d = null;
        try {
          d = JSON.parse(await j(a, "utf-8"));
        } catch {
        }
        let y;
        if (d != null && d.nextId) {
          const g = d.nextId[f] ?? 1;
          y = `${f.toUpperCase()}-${g}`, d.nextId[f] = g + 1, await S(a, `${JSON.stringify(d, null, 2)}
`);
        }
        const w = M({
          title: o.trim(),
          status: "idea",
          kind: f,
          id: y,
          created: T(),
          body: i == null ? void 0 : i.trim()
        });
        await A(C(e, "plans.md"), w), t.statusCode = 201, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0, id: y }));
      } catch (r) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: r.message }));
      }
      return;
    }
    if (n.method === "PATCH" && l === "/api/plans") {
      try {
        const o = new URL(n.url ?? "", `http://${n.headers.host ?? "localhost"}`).searchParams.get("title");
        if (!(o != null && o.trim())) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "title is required" }));
          return;
        }
        const i = await $(n), c = JSON.parse(i), f = C(e, "plans.md"), a = v(await h(f)), d = o.trim();
        let y = !1;
        const w = a.entries.map((g) => g.title === d ? (y = !0, {
          ...g,
          ...c.status !== void 0 && { status: c.status },
          ...c.phases !== void 0 && { phases: c.phases },
          updated: T()
        }) : c.status === "in-progress" && g.status === "in-progress" ? { ...g, status: "planned", updated: T() } : g);
        if (!y) {
          t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "plan not found" }));
          return;
        }
        await S(f, J(w)), t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      } catch (r) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: r.message }));
      }
      return;
    }
    if (n.method === "GET" && l === "/api/icon") {
      const r = u(e, ".paper-camp", "assets"), o = {
        svg: "image/svg+xml",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        webp: "image/webp"
      };
      for (const [i, c] of Object.entries(o))
        try {
          const f = await j(u(r, `icon.${i}`));
          t.statusCode = 200, t.setHeader("Content-Type", c), t.setHeader("Cache-Control", "no-cache"), t.end(f);
          return;
        } catch {
        }
      t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "no icon uploaded" }));
      return;
    }
    if (n.method === "POST" && l === "/api/icon") {
      try {
        const r = await $(n), { dataUri: o } = JSON.parse(r);
        if (!o) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "dataUri is required" }));
          return;
        }
        const i = o.match(/^data:(image\/[a-z0-9+.-]+);base64,(.+)$/);
        if (!i) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "invalid data URI" }));
          return;
        }
        const c = i[1], f = c === "image/svg+xml" ? "svg" : c.split("/")[1], a = Buffer.from(i[2], "base64"), d = u(e, ".paper-camp", "assets");
        await D(d, { recursive: !0 }), await S(u(d, `icon.${f}`), a), t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      } catch (r) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: r.message }));
      }
      return;
    }
    if (n.method === "GET" && l === "/api/activity/stream") {
      t.statusCode = 200, t.setHeader("Content-Type", "text/event-stream"), t.setHeader("Cache-Control", "no-cache"), t.setHeader("Connection", "keep-alive"), t.flushHeaders(), s.subscribe(t);
      return;
    }
    if (n.method === "GET" && l === "/api/configs") {
      const o = new URL(n.url ?? "", `http://${n.headers.host ?? "localhost"}`).searchParams.get("name");
      if (o)
        try {
          if (!Y.includes(o)) {
            t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "invalid config file name" }));
            return;
          }
          const i = await h(u(e, o));
          if (!i) {
            t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "config file not found" }));
            return;
          }
          t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ name: o, content: i }));
          return;
        } catch (i) {
          t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: i.message }));
          return;
        }
    }
    const m = Z.find((r) => r.path === l);
    if (!m) {
      p();
      return;
    }
    try {
      const r = await m.handler(e);
      t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify(r));
    } catch (r) {
      t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: r.message }));
    }
  };
}
const tt = {
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
function et() {
  return u(U(W(import.meta.url)), "..", "app");
}
async function nt({ root: e, port: s }) {
  const n = et(), t = u(n, "index.html"), p = await j(t, "utf-8").catch(() => null);
  if (p === null)
    throw new Error(
      `Dashboard assets not found at ${n}. Run \`pnpm build\` (or reinstall the package) so dist/app exists.`
    );
  const l = q(e);
  async function m(o, i) {
    const c = decodeURIComponent((o.url ?? "/").split("?")[0]), f = u(n, c === "/" ? "index.html" : c);
    try {
      if ((await R(f)).isFile()) {
        i.statusCode = 200, i.setHeader("Content-Type", tt[L(f)] ?? "application/octet-stream"), i.end(await j(f));
        return;
      }
    } catch {
    }
    i.statusCode = 200, i.setHeader("Content-Type", "text/html; charset=utf-8"), i.end(p);
  }
  const r = _((o, i) => {
    l(o, i, () => {
      m(o, i).catch((c) => {
        i.statusCode = 500, i.end(String(c));
      });
    });
  });
  await new Promise((o) => r.listen(s, o));
}
const O = new G();
O.name("paper-camp").description("Local-first, AI-native project companion.").version(Q);
O.command("init [project-name]").description("Initialize Paper Camp in the current directory").option("-i, --intent <text>", "one-line description of what you are building").action(async (e, s) => {
  const n = process.cwd(), t = e ?? F(n);
  try {
    await z(n, { projectName: t, intent: s.intent }), console.log(`Initialized Paper Camp in ${n}`), console.log("  .paper-camp/config.json"), console.log("  papercamp/ideas.md, plans.md, progress.md, decisions.md, open-questions.md");
  } catch (p) {
    if (p instanceof B) {
      console.error(p.message), process.exitCode = 1;
      return;
    }
    throw p;
  }
});
O.command("dev").description("Start the local dashboard").option("-p, --port <number>", "port to listen on", "3333").action(async (e) => {
  const s = Number(e.port), n = process.cwd();
  try {
    await nt({ root: n, port: s }), console.log(`Paper Camp dashboard running at http://localhost:${s}`);
  } catch (t) {
    console.error(t.message), process.exitCode = 1;
  }
});
O.command("add <type> [name]").description("Add a new entry (currently supports: plan)").action(async (e, s) => {
  if (e !== "plan") {
    console.error(`Unknown type "${e}". Supported types: plan`), process.exitCode = 1;
    return;
  }
  if (!s) {
    console.error("Usage: paper-camp add plan <name>"), process.exitCode = 1;
    return;
  }
  const n = H(process.cwd(), ".paper-camp", "config.json");
  let t;
  try {
    t = JSON.parse(await j(n, "utf-8"));
  } catch {
  }
  const p = "feat";
  let l;
  if (t != null && t.nextId) {
    const o = t.nextId[p] ?? 1;
    l = `${p.toUpperCase()}-${o}`, t.nextId[p] = o + 1, await S(n, `${JSON.stringify(t, null, 2)}
`);
  }
  const m = H(process.cwd(), "papercamp", "plans.md"), r = M({
    title: s,
    status: "idea",
    kind: p,
    id: l,
    created: T()
  });
  await A(m, r), console.log(`Added plan "${s}"${l ? ` (${l})` : ""} to papercamp/plans.md`);
});
O.parseAsync(process.argv);
//# sourceMappingURL=index.js.map
