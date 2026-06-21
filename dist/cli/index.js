#!/usr/bin/env node
import { join as f, dirname as D, extname as R, basename as I, resolve as L } from "node:path";
import { Command as U } from "commander";
import { l as x, j as k, h as E, k as T, e as J, c as M, t as O, a as A, P as F, i as G, A as Q } from "../chunks/serializer.D8LSvRYD.js";
import { readFile as S, writeFile as v, mkdir as z, stat as B } from "node:fs/promises";
import { createServer as _ } from "node:http";
import { fileURLToPath as W } from "node:url";
import { watch as V } from "node:fs";
const j = (e, s) => f(e, "papercamp", s), P = (e) => S(e, "utf-8").catch(() => "");
async function $(e) {
  const [s, n, t, p] = await Promise.all([
    P(j(e, "plans.md")),
    P(j(e, "decisions.md")),
    P(j(e, "open-questions.md")),
    P(j(e, "progress.md"))
  ]);
  return {
    plans: T(s).entries,
    decisions: E(n).entries,
    openQuestions: k(t).entries,
    progress: x(p)
  };
}
function K(e, s) {
  const n = [], t = (/* @__PURE__ */ new Date()).toISOString(), p = new Map(e.plans.map((a) => [a.title, a])), l = new Map(s.plans.map((a) => [a.title, a]));
  for (const [a, u] of l) {
    const C = p.get(a);
    if (!C)
      n.push({ message: `New plan added: ${a}`, timestamp: t });
    else if (C.status !== u.status)
      n.push({ message: `Plan "${a}" marked ${u.status}`, timestamp: t });
    else
      for (let h = 0; h < u.phases.length; h++) {
        const y = C.phases[h], b = u.phases[h];
        y && y.done !== b.done && n.push({
          message: b.done ? `Phase ${h + 1}/${u.phases.length} checked off in "${a}"` : `Phase ${h + 1}/${u.phases.length} unchecked in "${a}"`,
          timestamp: t
        });
      }
  }
  for (const [a] of p)
    l.has(a) || n.push({ message: `Plan removed: ${a}`, timestamp: t });
  const d = new Map(e.decisions.map((a) => [a.title, a])), r = new Map(s.decisions.map((a) => [a.title, a]));
  for (const [a] of r)
    d.has(a) || n.push({ message: `New decision: ${a}`, timestamp: t });
  const o = new Map(e.openQuestions.map((a) => [a.title, a])), i = new Map(s.openQuestions.map((a) => [a.title, a]));
  for (const [a] of i)
    o.has(a) || n.push({ message: `New open question: ${a}`, timestamp: t });
  const c = new Map(e.progress.map((a) => [a.date, a])), m = new Map(s.progress.map((a) => [a.date, a]));
  for (const [a] of m)
    c.has(a) || n.push({ message: `Progress logged: ${a}`, timestamp: t });
  return n;
}
function X(e) {
  const s = /* @__PURE__ */ new Set();
  let n = null, t = null;
  const p = ["plans.md", "decisions.md", "open-questions.md", "progress.md"];
  async function l() {
    try {
      const d = await $(e);
      if (n) {
        const r = K(n, d);
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
      n = d;
    } catch {
    }
  }
  for (const d of p) {
    const r = j(e, d);
    try {
      V(r, () => {
        t && clearTimeout(t), t = setTimeout(l, 300);
      });
    } catch {
    }
  }
  return $(e).then((d) => {
    n = d;
  }), {
    subscribe(d) {
      s.add(d);
      const r = JSON.stringify({
        message: "Watching for changes…",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      d.write(`data: ${r}

`), d.on("close", () => s.delete(d));
    }
  };
}
async function g(e) {
  try {
    return await S(e, "utf-8");
  } catch (s) {
    if (s.code === "ENOENT") return "";
    throw s;
  }
}
async function H(e) {
  return new Promise((s, n) => {
    let t = "";
    e.on("data", (p) => {
      t += p;
    }), e.on("end", () => s(t)), e.on("error", n);
  });
}
const w = (e, s) => f(e, "papercamp", s), Y = [
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
      const s = await g(f(e, "package.json"));
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
    handler: async (e) => T(await g(w(e, "plans.md")))
  },
  {
    path: "/api/progress",
    handler: async (e) => ({
      entries: x(await g(w(e, "progress.md")))
    })
  },
  {
    path: "/api/decisions",
    handler: async (e) => E(await g(w(e, "decisions.md")))
  },
  {
    path: "/api/open-questions",
    handler: async (e) => k(await g(w(e, "open-questions.md")))
  },
  {
    path: "/api/ideas",
    handler: async (e) => ({
      content: await g(w(e, "ideas.md"))
    })
  },
  {
    path: "/api/config",
    handler: async (e) => {
      const s = await g(f(e, ".paper-camp", "config.json"));
      return s ? JSON.parse(s) : null;
    }
  },
  {
    path: "/api/docs",
    handler: async (e) => {
      const s = ["README.md", "CHANGELOG.md", "LICENSE"], n = [];
      for (const t of s) {
        const p = await g(f(e, t));
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
        await g(f(e, t)) && n.push(t);
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
        const i = w(e, "plans.md"), c = T(await g(i)), m = o.trim(), a = c.entries.filter((u) => u.title !== m);
        if (a.length === c.entries.length) {
          t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "plan not found" }));
          return;
        }
        await v(i, J(a)), t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      } catch (r) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: r.message }));
      }
      return;
    }
    if (n.method === "POST" && l === "/api/plans") {
      try {
        const r = await H(n), { title: o, content: i } = JSON.parse(r);
        if (!(o != null && o.trim())) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "title is required" }));
          return;
        }
        const c = M({
          title: o.trim(),
          status: "idea",
          created: O(),
          body: i == null ? void 0 : i.trim()
        });
        await A(w(e, "plans.md"), c), t.statusCode = 201, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
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
        const i = await H(n), c = JSON.parse(i), m = w(e, "plans.md"), a = T(await g(m)), u = o.trim();
        let C = !1;
        const h = a.entries.map((y) => y.title === u ? (C = !0, {
          ...y,
          ...c.status !== void 0 && { status: c.status },
          ...c.phases !== void 0 && { phases: c.phases },
          updated: O()
        }) : c.status === "in-progress" && y.status === "in-progress" ? { ...y, status: "planned", updated: O() } : y);
        if (!C) {
          t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "plan not found" }));
          return;
        }
        await v(m, J(h)), t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
      } catch (r) {
        t.statusCode = 500, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: r.message }));
      }
      return;
    }
    if (n.method === "GET" && l === "/api/icon") {
      const r = f(e, ".paper-camp", "assets"), o = {
        svg: "image/svg+xml",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        webp: "image/webp"
      };
      for (const [i, c] of Object.entries(o))
        try {
          const m = await S(f(r, `icon.${i}`));
          t.statusCode = 200, t.setHeader("Content-Type", c), t.setHeader("Cache-Control", "no-cache"), t.end(m);
          return;
        } catch {
        }
      t.statusCode = 404, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "no icon uploaded" }));
      return;
    }
    if (n.method === "POST" && l === "/api/icon") {
      try {
        const r = await H(n), { dataUri: o } = JSON.parse(r);
        if (!o) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "dataUri is required" }));
          return;
        }
        const i = o.match(/^data:(image\/[a-z0-9+.-]+);base64,(.+)$/);
        if (!i) {
          t.statusCode = 400, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ error: "invalid data URI" }));
          return;
        }
        const c = i[1], m = c === "image/svg+xml" ? "svg" : c.split("/")[1], a = Buffer.from(i[2], "base64"), u = f(e, ".paper-camp", "assets");
        await z(u, { recursive: !0 }), await v(f(u, `icon.${m}`), a), t.statusCode = 200, t.setHeader("Content-Type", "application/json"), t.end(JSON.stringify({ ok: !0 }));
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
          const i = await g(f(e, o));
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
    const d = Z.find((r) => r.path === l);
    if (!d) {
      p();
      return;
    }
    try {
      const r = await d.handler(e);
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
  return f(D(W(import.meta.url)), "..", "app");
}
async function nt({ root: e, port: s }) {
  const n = et(), t = f(n, "index.html"), p = await S(t, "utf-8").catch(() => null);
  if (p === null)
    throw new Error(
      `Dashboard assets not found at ${n}. Run \`pnpm build\` (or reinstall the package) so dist/app exists.`
    );
  const l = q(e);
  async function d(o, i) {
    const c = decodeURIComponent((o.url ?? "/").split("?")[0]), m = f(n, c === "/" ? "index.html" : c);
    try {
      if ((await B(m)).isFile()) {
        i.statusCode = 200, i.setHeader("Content-Type", tt[R(m)] ?? "application/octet-stream"), i.end(await S(m));
        return;
      }
    } catch {
    }
    i.statusCode = 200, i.setHeader("Content-Type", "text/html; charset=utf-8"), i.end(p);
  }
  const r = _((o, i) => {
    l(o, i, () => {
      d(o, i).catch((c) => {
        i.statusCode = 500, i.end(String(c));
      });
    });
  });
  await new Promise((o) => r.listen(s, o));
}
const N = new U();
N.name("paper-camp").description("Local-first, AI-native project companion.").version(F);
N.command("init [project-name]").description("Initialize Paper Camp in the current directory").option("-i, --intent <text>", "one-line description of what you are building").action(async (e, s) => {
  const n = process.cwd(), t = e ?? I(n);
  try {
    await G(n, { projectName: t, intent: s.intent }), console.log(`Initialized Paper Camp in ${n}`), console.log("  .paper-camp/config.json"), console.log("  papercamp/ideas.md, plans.md, progress.md, decisions.md, open-questions.md");
  } catch (p) {
    if (p instanceof Q) {
      console.error(p.message), process.exitCode = 1;
      return;
    }
    throw p;
  }
});
N.command("dev").description("Start the local dashboard").option("-p, --port <number>", "port to listen on", "3333").action(async (e) => {
  const s = Number(e.port), n = process.cwd();
  try {
    await nt({ root: n, port: s }), console.log(`Paper Camp dashboard running at http://localhost:${s}`);
  } catch (t) {
    console.error(t.message), process.exitCode = 1;
  }
});
N.command("add <type> [name]").description("Add a new entry (currently supports: plan)").action(async (e, s) => {
  if (e !== "plan") {
    console.error(`Unknown type "${e}". Supported types: plan`), process.exitCode = 1;
    return;
  }
  if (!s) {
    console.error("Usage: paper-camp add plan <name>"), process.exitCode = 1;
    return;
  }
  const n = L(process.cwd(), "papercamp", "plans.md"), t = M({ title: s, status: "idea", created: O() });
  await A(n, t), console.log(`Added plan "${s}" to papercamp/plans.md`);
});
N.parseAsync(process.argv);
//# sourceMappingURL=index.js.map
