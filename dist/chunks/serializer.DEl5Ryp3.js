import { readdir as Vs, readFile as ht, mkdir as X, writeFile as se, access as Ys, rename as Js } from "node:fs/promises";
import { join as M, dirname as Gs } from "node:path";
import { z as I } from "zod";
import { AGENT_IDS as ne } from "../types/index.js";
const Hs = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/;
function Ws(s) {
  return s.length >= 2 && (s.startsWith('"') && s.endsWith('"') || s.startsWith("'") && s.endsWith("'")) ? s.slice(1, -1) : s;
}
function Ct(s) {
  return s === "" || /[\s#"]/.test(s) ? `"${s.replace(/"/g, '\\"')}"` : s;
}
function Gt(s) {
  const e = s.trim();
  if (!e || e.startsWith("#")) return null;
  const t = e.match(Hs);
  return t ? { key: t[1], value: Ws(t[2]) } : null;
}
function Ri(s) {
  const e = [];
  for (const t of s.split(`
`)) {
    const n = Gt(t);
    n && e.push(n);
  }
  return e;
}
function Fi(s, e) {
  const t = new Map(e.map((r) => [r.key, r.value])), n = s.length > 0 ? s.split(`
`) : [], i = [];
  for (const r of n) {
    const o = Gt(r);
    if (!o) {
      i.push(r);
      continue;
    }
    t.has(o.key) && (i.push(`${o.key}=${Ct(t.get(o.key) ?? "")}`), t.delete(o.key));
  }
  for (const [r, o] of t)
    i.push(`${r}=${Ct(o)}`);
  for (; i.length > 0 && i[i.length - 1] === ""; ) i.pop();
  return i.length > 0 ? `${i.join(`
`)}
` : "";
}
const dt = Symbol.for("yaml.alias"), it = Symbol.for("yaml.document"), W = Symbol.for("yaml.map"), Ht = Symbol.for("yaml.pair"), V = Symbol.for("yaml.scalar"), he = Symbol.for("yaml.seq"), K = Symbol.for("yaml.node.type"), de = (s) => !!s && typeof s == "object" && s[K] === dt, Ie = (s) => !!s && typeof s == "object" && s[K] === it, Ae = (s) => !!s && typeof s == "object" && s[K] === W, _ = (s) => !!s && typeof s == "object" && s[K] === Ht, T = (s) => !!s && typeof s == "object" && s[K] === V, Oe = (s) => !!s && typeof s == "object" && s[K] === he;
function L(s) {
  if (s && typeof s == "object")
    switch (s[K]) {
      case W:
      case he:
        return !0;
    }
  return !1;
}
function C(s) {
  if (s && typeof s == "object")
    switch (s[K]) {
      case dt:
      case W:
      case V:
      case he:
        return !0;
    }
  return !1;
}
const Wt = (s) => (T(s) || L(s)) && !!s.anchor, Q = Symbol("break visit"), Qs = Symbol("skip children"), ke = Symbol("remove node");
function pe(s, e) {
  const t = Xs(e);
  Ie(s) ? ie(null, s.contents, t, Object.freeze([s])) === ke && (s.contents = null) : ie(null, s, t, Object.freeze([]));
}
pe.BREAK = Q;
pe.SKIP = Qs;
pe.REMOVE = ke;
function ie(s, e, t, n) {
  const i = zs(s, e, t, n);
  if (C(i) || _(i))
    return Zs(s, n, i), ie(s, i, t, n);
  if (typeof i != "symbol") {
    if (L(e)) {
      n = Object.freeze(n.concat(e));
      for (let r = 0; r < e.items.length; ++r) {
        const o = ie(r, e.items[r], t, n);
        if (typeof o == "number")
          r = o - 1;
        else {
          if (o === Q)
            return Q;
          o === ke && (e.items.splice(r, 1), r -= 1);
        }
      }
    } else if (_(e)) {
      n = Object.freeze(n.concat(e));
      const r = ie("key", e.key, t, n);
      if (r === Q)
        return Q;
      r === ke && (e.key = null);
      const o = ie("value", e.value, t, n);
      if (o === Q)
        return Q;
      o === ke && (e.value = null);
    }
  }
  return i;
}
function Xs(s) {
  return typeof s == "object" && (s.Collection || s.Node || s.Value) ? Object.assign({
    Alias: s.Node,
    Map: s.Node,
    Scalar: s.Node,
    Seq: s.Node
  }, s.Value && {
    Map: s.Value,
    Scalar: s.Value,
    Seq: s.Value
  }, s.Collection && {
    Map: s.Collection,
    Seq: s.Collection
  }, s) : s;
}
function zs(s, e, t, n) {
  var i, r, o, a, l;
  if (typeof t == "function")
    return t(s, e, n);
  if (Ae(e))
    return (i = t.Map) == null ? void 0 : i.call(t, s, e, n);
  if (Oe(e))
    return (r = t.Seq) == null ? void 0 : r.call(t, s, e, n);
  if (_(e))
    return (o = t.Pair) == null ? void 0 : o.call(t, s, e, n);
  if (T(e))
    return (a = t.Scalar) == null ? void 0 : a.call(t, s, e, n);
  if (de(e))
    return (l = t.Alias) == null ? void 0 : l.call(t, s, e, n);
}
function Zs(s, e, t) {
  const n = e[e.length - 1];
  if (L(n))
    n.items[s] = t;
  else if (_(n))
    s === "key" ? n.key = t : n.value = t;
  else if (Ie(n))
    n.contents = t;
  else {
    const i = de(n) ? "alias" : "scalar";
    throw new Error(`Cannot replace node with ${i} parent`);
  }
}
const xs = {
  "!": "%21",
  ",": "%2C",
  "[": "%5B",
  "]": "%5D",
  "{": "%7B",
  "}": "%7D"
}, en = (s) => s.replace(/[!,[\]{}]/g, (e) => xs[e]);
class P {
  constructor(e, t) {
    this.docStart = null, this.docEnd = !1, this.yaml = Object.assign({}, P.defaultYaml, e), this.tags = Object.assign({}, P.defaultTags, t);
  }
  clone() {
    const e = new P(this.yaml, this.tags);
    return e.docStart = this.docStart, e;
  }
  /**
   * During parsing, get a Directives instance for the current document and
   * update the stream state according to the current version's spec.
   */
  atDocument() {
    const e = new P(this.yaml, this.tags);
    switch (this.yaml.version) {
      case "1.1":
        this.atNextDocument = !0;
        break;
      case "1.2":
        this.atNextDocument = !1, this.yaml = {
          explicit: P.defaultYaml.explicit,
          version: "1.2"
        }, this.tags = Object.assign({}, P.defaultTags);
        break;
    }
    return e;
  }
  /**
   * @param onError - May be called even if the action was successful
   * @returns `true` on success
   */
  add(e, t) {
    this.atNextDocument && (this.yaml = { explicit: P.defaultYaml.explicit, version: "1.1" }, this.tags = Object.assign({}, P.defaultTags), this.atNextDocument = !1);
    const n = e.trim().split(/[ \t]+/), i = n.shift();
    switch (i) {
      case "%TAG": {
        if (n.length !== 2 && (t(0, "%TAG directive should contain exactly two parts"), n.length < 2))
          return !1;
        const [r, o] = n;
        return this.tags[r] = o, !0;
      }
      case "%YAML": {
        if (this.yaml.explicit = !0, n.length !== 1)
          return t(0, "%YAML directive should contain exactly one part"), !1;
        const [r] = n;
        if (r === "1.1" || r === "1.2")
          return this.yaml.version = r, !0;
        {
          const o = /^\d+\.\d+$/.test(r);
          return t(6, `Unsupported YAML version ${r}`, o), !1;
        }
      }
      default:
        return t(0, `Unknown directive ${i}`, !0), !1;
    }
  }
  /**
   * Resolves a tag, matching handles to those defined in %TAG directives.
   *
   * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
   *   `'!local'` tag, or `null` if unresolvable.
   */
  tagName(e, t) {
    if (e === "!")
      return "!";
    if (e[0] !== "!")
      return t(`Not a valid tag: ${e}`), null;
    if (e[1] === "<") {
      const o = e.slice(2, -1);
      return o === "!" || o === "!!" ? (t(`Verbatim tags aren't resolved, so ${e} is invalid.`), null) : (e[e.length - 1] !== ">" && t("Verbatim tags must end with a >"), o);
    }
    const [, n, i] = e.match(/^(.*!)([^!]*)$/s);
    i || t(`The ${e} tag has no suffix`);
    const r = this.tags[n];
    if (r)
      try {
        return r + decodeURIComponent(i);
      } catch (o) {
        return t(String(o)), null;
      }
    return n === "!" ? e : (t(`Could not resolve tag: ${e}`), null);
  }
  /**
   * Given a fully resolved tag, returns its printable string form,
   * taking into account current tag prefixes and defaults.
   */
  tagString(e) {
    for (const [t, n] of Object.entries(this.tags))
      if (e.startsWith(n))
        return t + en(e.substring(n.length));
    return e[0] === "!" ? e : `!<${e}>`;
  }
  toString(e) {
    const t = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [], n = Object.entries(this.tags);
    let i;
    if (e && n.length > 0 && C(e.contents)) {
      const r = {};
      pe(e.contents, (o, a) => {
        C(a) && a.tag && (r[a.tag] = !0);
      }), i = Object.keys(r);
    } else
      i = [];
    for (const [r, o] of n)
      r === "!!" && o === "tag:yaml.org,2002:" || (!e || i.some((a) => a.startsWith(o))) && t.push(`%TAG ${r} ${o}`);
    return t.join(`
`);
  }
}
P.defaultYaml = { explicit: !1, version: "1.2" };
P.defaultTags = { "!!": "tag:yaml.org,2002:" };
function Qt(s) {
  if (/[\x00-\x19\s,[\]{}]/.test(s)) {
    const t = `Anchor must not contain whitespace or control characters: ${JSON.stringify(s)}`;
    throw new Error(t);
  }
  return !0;
}
function Xt(s) {
  const e = /* @__PURE__ */ new Set();
  return pe(s, {
    Value(t, n) {
      n.anchor && e.add(n.anchor);
    }
  }), e;
}
function zt(s, e) {
  for (let t = 1; ; ++t) {
    const n = `${s}${t}`;
    if (!e.has(n))
      return n;
  }
}
function tn(s, e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let i = null;
  return {
    onAnchor: (r) => {
      t.push(r), i ?? (i = Xt(s));
      const o = zt(e, i);
      return i.add(o), o;
    },
    /**
     * With circular references, the source node is only resolved after all
     * of its child nodes are. This is why anchors are set only after all of
     * the nodes have been created.
     */
    setAnchors: () => {
      for (const r of t) {
        const o = n.get(r);
        if (typeof o == "object" && o.anchor && (T(o.node) || L(o.node)))
          o.node.anchor = o.anchor;
        else {
          const a = new Error("Failed to resolve repeated object (this should not happen)");
          throw a.source = r, a;
        }
      }
    },
    sourceObjects: n
  };
}
function re(s, e, t, n) {
  if (n && typeof n == "object")
    if (Array.isArray(n))
      for (let i = 0, r = n.length; i < r; ++i) {
        const o = n[i], a = re(s, n, String(i), o);
        a === void 0 ? delete n[i] : a !== o && (n[i] = a);
      }
    else if (n instanceof Map)
      for (const i of Array.from(n.keys())) {
        const r = n.get(i), o = re(s, n, i, r);
        o === void 0 ? n.delete(i) : o !== r && n.set(i, o);
      }
    else if (n instanceof Set)
      for (const i of Array.from(n)) {
        const r = re(s, n, i, i);
        r === void 0 ? n.delete(i) : r !== i && (n.delete(i), n.add(r));
      }
    else
      for (const [i, r] of Object.entries(n)) {
        const o = re(s, n, i, r);
        o === void 0 ? delete n[i] : o !== r && (n[i] = o);
      }
  return s.call(e, t, n);
}
function D(s, e, t) {
  if (Array.isArray(s))
    return s.map((n, i) => D(n, String(i), t));
  if (s && typeof s.toJSON == "function") {
    if (!t || !Wt(s))
      return s.toJSON(e, t);
    const n = { aliasCount: 0, count: 1, res: void 0 };
    t.anchors.set(s, n), t.onCreate = (r) => {
      n.res = r, delete t.onCreate;
    };
    const i = s.toJSON(e, t);
    return t.onCreate && t.onCreate(i), i;
  }
  return typeof s == "bigint" && !(t != null && t.keep) ? Number(s) : s;
}
class pt {
  constructor(e) {
    Object.defineProperty(this, K, { value: e });
  }
  /** Create a copy of this node.  */
  clone() {
    const e = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    return this.range && (e.range = this.range.slice()), e;
  }
  /** A plain JavaScript representation of this node. */
  toJS(e, { mapAsMap: t, maxAliasCount: n, onAnchor: i, reviver: r } = {}) {
    if (!Ie(e))
      throw new TypeError("A document argument is required");
    const o = {
      anchors: /* @__PURE__ */ new Map(),
      doc: e,
      keep: !0,
      mapAsMap: t === !0,
      mapKeyWarned: !1,
      maxAliasCount: typeof n == "number" ? n : 100
    }, a = D(this, "", o);
    if (typeof i == "function")
      for (const { count: l, res: c } of o.anchors.values())
        i(c, l);
    return typeof r == "function" ? re(r, { "": a }, "", a) : a;
  }
}
class mt extends pt {
  constructor(e) {
    super(dt), this.source = e, Object.defineProperty(this, "tag", {
      set() {
        throw new Error("Alias nodes cannot have tags");
      }
    });
  }
  /**
   * Resolve the value of this alias within `doc`, finding the last
   * instance of the `source` anchor before this node.
   */
  resolve(e, t) {
    if ((t == null ? void 0 : t.maxAliasCount) === 0)
      throw new ReferenceError("Alias resolution is disabled");
    let n;
    t != null && t.aliasResolveCache ? n = t.aliasResolveCache : (n = [], pe(e, {
      Node: (r, o) => {
        (de(o) || Wt(o)) && n.push(o);
      }
    }), t && (t.aliasResolveCache = n));
    let i;
    for (const r of n) {
      if (r === this)
        break;
      r.anchor === this.source && (i = r);
    }
    return i;
  }
  toJSON(e, t) {
    if (!t)
      return { source: this.source };
    const { anchors: n, doc: i, maxAliasCount: r } = t, o = this.resolve(i, t);
    if (!o) {
      const l = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
      throw new ReferenceError(l);
    }
    let a = n.get(o);
    if (a || (D(o, null, t), a = n.get(o)), (a == null ? void 0 : a.res) === void 0) {
      const l = "This should not happen: Alias anchor was not resolved?";
      throw new ReferenceError(l);
    }
    if (r >= 0 && (a.count += 1, a.aliasCount === 0 && (a.aliasCount = je(i, o, n)), a.count * a.aliasCount > r)) {
      const l = "Excessive alias count indicates a resource exhaustion attack";
      throw new ReferenceError(l);
    }
    return a.res;
  }
  toString(e, t, n) {
    const i = `*${this.source}`;
    if (e) {
      if (Qt(this.source), e.options.verifyAliasOrder && !e.anchors.has(this.source)) {
        const r = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new Error(r);
      }
      if (e.implicitKey)
        return `${i} `;
    }
    return i;
  }
}
function je(s, e, t) {
  if (de(e)) {
    const n = e.resolve(s), i = t && n && t.get(n);
    return i ? i.count * i.aliasCount : 0;
  } else if (L(e)) {
    let n = 0;
    for (const i of e.items) {
      const r = je(s, i, t);
      r > n && (n = r);
    }
    return n;
  } else if (_(e)) {
    const n = je(s, e.key, t), i = je(s, e.value, t);
    return Math.max(n, i);
  }
  return 1;
}
const Zt = (s) => !s || typeof s != "function" && typeof s != "object";
class E extends pt {
  constructor(e) {
    super(V), this.value = e;
  }
  toJSON(e, t) {
    return t != null && t.keep ? this.value : D(this.value, e, t);
  }
  toString() {
    return String(this.value);
  }
}
E.BLOCK_FOLDED = "BLOCK_FOLDED";
E.BLOCK_LITERAL = "BLOCK_LITERAL";
E.PLAIN = "PLAIN";
E.QUOTE_DOUBLE = "QUOTE_DOUBLE";
E.QUOTE_SINGLE = "QUOTE_SINGLE";
const sn = "tag:yaml.org,2002:";
function nn(s, e, t) {
  if (e) {
    const n = t.filter((r) => r.tag === e), i = n.find((r) => !r.format) ?? n[0];
    if (!i)
      throw new Error(`Tag ${e} not found`);
    return i;
  }
  return t.find((n) => {
    var i;
    return ((i = n.identify) == null ? void 0 : i.call(n, s)) && !n.format;
  });
}
function Ne(s, e, t) {
  var f, h, d;
  if (Ie(s) && (s = s.contents), C(s))
    return s;
  if (_(s)) {
    const g = (h = (f = t.schema[W]).createNode) == null ? void 0 : h.call(f, t.schema, null, t);
    return g.items.push(s), g;
  }
  (s instanceof String || s instanceof Number || s instanceof Boolean || typeof BigInt < "u" && s instanceof BigInt) && (s = s.valueOf());
  const { aliasDuplicateObjects: n, onAnchor: i, onTagObj: r, schema: o, sourceObjects: a } = t;
  let l;
  if (n && s && typeof s == "object") {
    if (l = a.get(s), l)
      return l.anchor ?? (l.anchor = i(s)), new mt(l.anchor);
    l = { anchor: null, node: null }, a.set(s, l);
  }
  e != null && e.startsWith("!!") && (e = sn + e.slice(2));
  let c = nn(s, e, o.tags);
  if (!c) {
    if (s && typeof s.toJSON == "function" && (s = s.toJSON()), !s || typeof s != "object") {
      const g = new E(s);
      return l && (l.node = g), g;
    }
    c = s instanceof Map ? o[W] : Symbol.iterator in Object(s) ? o[he] : o[W];
  }
  r && (r(c), delete t.onTagObj);
  const p = c != null && c.createNode ? c.createNode(t.schema, s, t) : typeof ((d = c == null ? void 0 : c.nodeClass) == null ? void 0 : d.from) == "function" ? c.nodeClass.from(t.schema, s, t) : new E(s);
  return e ? p.tag = e : c.default || (p.tag = c.tag), l && (l.node = p), p;
}
function Re(s, e, t) {
  let n = t;
  for (let i = e.length - 1; i >= 0; --i) {
    const r = e[i];
    if (typeof r == "number" && Number.isInteger(r) && r >= 0) {
      const o = [];
      o[r] = n, n = o;
    } else
      n = /* @__PURE__ */ new Map([[r, n]]);
  }
  return Ne(n, void 0, {
    aliasDuplicateObjects: !1,
    keepUndefined: !1,
    onAnchor: () => {
      throw new Error("This should not happen, please report a bug.");
    },
    schema: s,
    sourceObjects: /* @__PURE__ */ new Map()
  });
}
const be = (s) => s == null || typeof s == "object" && !!s[Symbol.iterator]().next().done;
class xt extends pt {
  constructor(e, t) {
    super(e), Object.defineProperty(this, "schema", {
      value: t,
      configurable: !0,
      enumerable: !1,
      writable: !0
    });
  }
  /**
   * Create a copy of this collection.
   *
   * @param schema - If defined, overwrites the original's schema
   */
  clone(e) {
    const t = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    return e && (t.schema = e), t.items = t.items.map((n) => C(n) || _(n) ? n.clone(e) : n), this.range && (t.range = this.range.slice()), t;
  }
  /**
   * Adds a value to the collection. For `!!map` and `!!omap` the value must
   * be a Pair instance or a `{ key, value }` object, which may not have a key
   * that already exists in the map.
   */
  addIn(e, t) {
    if (be(e))
      this.add(t);
    else {
      const [n, ...i] = e, r = this.get(n, !0);
      if (L(r))
        r.addIn(i, t);
      else if (r === void 0 && this.schema)
        this.set(n, Re(this.schema, i, t));
      else
        throw new Error(`Expected YAML collection at ${n}. Remaining path: ${i}`);
    }
  }
  /**
   * Removes a value from the collection.
   * @returns `true` if the item was found and removed.
   */
  deleteIn(e) {
    const [t, ...n] = e;
    if (n.length === 0)
      return this.delete(t);
    const i = this.get(t, !0);
    if (L(i))
      return i.deleteIn(n);
    throw new Error(`Expected YAML collection at ${t}. Remaining path: ${n}`);
  }
  /**
   * Returns item at `key`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  getIn(e, t) {
    const [n, ...i] = e, r = this.get(n, !0);
    return i.length === 0 ? !t && T(r) ? r.value : r : L(r) ? r.getIn(i, t) : void 0;
  }
  hasAllNullValues(e) {
    return this.items.every((t) => {
      if (!_(t))
        return !1;
      const n = t.value;
      return n == null || e && T(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
    });
  }
  /**
   * Checks if the collection includes a value with the key `key`.
   */
  hasIn(e) {
    const [t, ...n] = e;
    if (n.length === 0)
      return this.has(t);
    const i = this.get(t, !0);
    return L(i) ? i.hasIn(n) : !1;
  }
  /**
   * Sets a value in this collection. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  setIn(e, t) {
    const [n, ...i] = e;
    if (i.length === 0)
      this.set(n, t);
    else {
      const r = this.get(n, !0);
      if (L(r))
        r.setIn(i, t);
      else if (r === void 0 && this.schema)
        this.set(n, Re(this.schema, i, t));
      else
        throw new Error(`Expected YAML collection at ${n}. Remaining path: ${i}`);
    }
  }
}
const rn = (s) => s.replace(/^(?!$)(?: $)?/gm, "#");
function J(s, e) {
  return /^\n+$/.test(s) ? s.substring(1) : e ? s.replace(/^(?! *$)/gm, e) : s;
}
const z = (s, e, t) => s.endsWith(`
`) ? J(t, e) : t.includes(`
`) ? `
` + J(t, e) : (s.endsWith(" ") ? "" : " ") + t, es = "flow", rt = "block", De = "quoted";
function Ue(s, e, t = "flow", { indentAtStart: n, lineWidth: i = 80, minContentWidth: r = 20, onFold: o, onOverflow: a } = {}) {
  if (!i || i < 0)
    return s;
  i < r && (r = 0);
  const l = Math.max(1 + r, 1 + i - e.length);
  if (s.length <= l)
    return s;
  const c = [], p = {};
  let f = i - e.length;
  typeof n == "number" && (n > i - Math.max(2, r) ? c.push(0) : f = i - n);
  let h, d, g = !1, u = -1, m = -1, y = -1;
  t === rt && (u = _t(s, u, e.length), u !== -1 && (f = u + l));
  for (let S; S = s[u += 1]; ) {
    if (t === De && S === "\\") {
      switch (m = u, s[u + 1]) {
        case "x":
          u += 3;
          break;
        case "u":
          u += 5;
          break;
        case "U":
          u += 9;
          break;
        default:
          u += 1;
      }
      y = u;
    }
    if (S === `
`)
      t === rt && (u = _t(s, u, e.length)), f = u + e.length + l, h = void 0;
    else {
      if (S === " " && d && d !== " " && d !== `
` && d !== "	") {
        const k = s[u + 1];
        k && k !== " " && k !== `
` && k !== "	" && (h = u);
      }
      if (u >= f)
        if (h)
          c.push(h), f = h + l, h = void 0;
        else if (t === De) {
          for (; d === " " || d === "	"; )
            d = S, S = s[u += 1], g = !0;
          const k = u > y + 1 ? u - 2 : m - 1;
          if (p[k])
            return s;
          c.push(k), p[k] = !0, f = k + l, h = void 0;
        } else
          g = !0;
    }
    d = S;
  }
  if (g && a && a(), c.length === 0)
    return s;
  o && o();
  let b = s.slice(0, c[0]);
  for (let S = 0; S < c.length; ++S) {
    const k = c[S], N = c[S + 1] || s.length;
    k === 0 ? b = `
${e}${s.slice(0, N)}` : (t === De && p[k] && (b += `${s[k]}\\`), b += `
${e}${s.slice(k + 1, N)}`);
  }
  return b;
}
function _t(s, e, t) {
  let n = e, i = e + 1, r = s[i];
  for (; r === " " || r === "	"; )
    if (e < i + t)
      r = s[++e];
    else {
      do
        r = s[++e];
      while (r && r !== `
`);
      n = e, i = e + 1, r = s[i];
    }
  return n;
}
const Ve = (s, e) => ({
  indentAtStart: e ? s.indent.length : s.indentAtStart,
  lineWidth: s.options.lineWidth,
  minContentWidth: s.options.minContentWidth
}), Ye = (s) => /^(%|---|\.\.\.)/m.test(s);
function on(s, e, t) {
  if (!e || e < 0)
    return !1;
  const n = e - t, i = s.length;
  if (i <= n)
    return !1;
  for (let r = 0, o = 0; r < i; ++r)
    if (s[r] === `
`) {
      if (r - o > n)
        return !0;
      if (o = r + 1, i - o <= n)
        return !1;
    }
  return !0;
}
function Se(s, e) {
  const t = JSON.stringify(s);
  if (e.options.doubleQuotedAsJSON)
    return t;
  const { implicitKey: n } = e, i = e.options.doubleQuotedMinMultiLineLength, r = e.indent || (Ye(s) ? "  " : "");
  let o = "", a = 0;
  for (let l = 0, c = t[l]; c; c = t[++l])
    if (c === " " && t[l + 1] === "\\" && t[l + 2] === "n" && (o += t.slice(a, l) + "\\ ", l += 1, a = l, c = "\\"), c === "\\")
      switch (t[l + 1]) {
        case "u":
          {
            o += t.slice(a, l);
            const p = t.substr(l + 2, 4);
            switch (p) {
              case "0000":
                o += "\\0";
                break;
              case "0007":
                o += "\\a";
                break;
              case "000b":
                o += "\\v";
                break;
              case "001b":
                o += "\\e";
                break;
              case "0085":
                o += "\\N";
                break;
              case "00a0":
                o += "\\_";
                break;
              case "2028":
                o += "\\L";
                break;
              case "2029":
                o += "\\P";
                break;
              default:
                p.substr(0, 2) === "00" ? o += "\\x" + p.substr(2) : o += t.substr(l, 6);
            }
            l += 5, a = l + 1;
          }
          break;
        case "n":
          if (n || t[l + 2] === '"' || t.length < i)
            l += 1;
          else {
            for (o += t.slice(a, l) + `

`; t[l + 2] === "\\" && t[l + 3] === "n" && t[l + 4] !== '"'; )
              o += `
`, l += 2;
            o += r, t[l + 2] === " " && (o += "\\"), l += 1, a = l + 1;
          }
          break;
        default:
          l += 1;
      }
  return o = a ? o + t.slice(a) : t, n ? o : Ue(o, r, De, Ve(e, !1));
}
function ot(s, e) {
  if (e.options.singleQuote === !1 || e.implicitKey && s.includes(`
`) || /[ \t]\n|\n[ \t]/.test(s))
    return Se(s, e);
  const t = e.indent || (Ye(s) ? "  " : ""), n = "'" + s.replace(/'/g, "''").replace(/\n+/g, `$&
${t}`) + "'";
  return e.implicitKey ? n : Ue(n, t, es, Ve(e, !1));
}
function oe(s, e) {
  const { singleQuote: t } = e.options;
  let n;
  if (t === !1)
    n = Se;
  else {
    const i = s.includes('"'), r = s.includes("'");
    i && !r ? n = ot : r && !i ? n = Se : n = t ? ot : Se;
  }
  return n(s, e);
}
let at;
try {
  at = new RegExp(`(^|(?<!
))
+(?!
|$)`, "g");
} catch {
  at = /\n+(?!\n|$)/g;
}
function Ke({ comment: s, type: e, value: t }, n, i, r) {
  const { blockQuote: o, commentString: a, lineWidth: l } = n.options;
  if (!o || /\n[\t ]+$/.test(t))
    return oe(t, n);
  const c = n.indent || (n.forceBlockIndent || Ye(t) ? "  " : ""), p = o === "literal" ? !0 : o === "folded" || e === E.BLOCK_FOLDED ? !1 : e === E.BLOCK_LITERAL ? !0 : !on(t, l, c.length);
  if (!t)
    return p ? `|
` : `>
`;
  let f, h;
  for (h = t.length; h > 0; --h) {
    const N = t[h - 1];
    if (N !== `
` && N !== "	" && N !== " ")
      break;
  }
  let d = t.substring(h);
  const g = d.indexOf(`
`);
  g === -1 ? f = "-" : t === d || g !== d.length - 1 ? (f = "+", r && r()) : f = "", d && (t = t.slice(0, -d.length), d[d.length - 1] === `
` && (d = d.slice(0, -1)), d = d.replace(at, `$&${c}`));
  let u = !1, m, y = -1;
  for (m = 0; m < t.length; ++m) {
    const N = t[m];
    if (N === " ")
      u = !0;
    else if (N === `
`)
      y = m;
    else
      break;
  }
  let b = t.substring(0, y < m ? y + 1 : m);
  b && (t = t.substring(b.length), b = b.replace(/\n+/g, `$&${c}`));
  let k = (u ? c ? "2" : "1" : "") + f;
  if (s && (k += " " + a(s.replace(/ ?[\r\n]+/g, " ")), i && i()), !p) {
    const N = t.replace(/\n+/g, `
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${c}`);
    let O = !1;
    const A = Ve(n, !0);
    o !== "folded" && e !== E.BLOCK_FOLDED && (A.onOverflow = () => {
      O = !0;
    });
    const w = Ue(`${b}${N}${d}`, c, rt, A);
    if (!O)
      return `>${k}
${c}${w}`;
  }
  return t = t.replace(/\n+/g, `$&${c}`), `|${k}
${c}${b}${t}${d}`;
}
function an(s, e, t, n) {
  const { type: i, value: r } = s, { actualString: o, implicitKey: a, indent: l, indentStep: c, inFlow: p } = e;
  if (a && r.includes(`
`) || p && /[[\]{},]/.test(r))
    return oe(r, e);
  if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(r))
    return a || p || !r.includes(`
`) ? oe(r, e) : Ke(s, e, t, n);
  if (!a && !p && i !== E.PLAIN && r.includes(`
`))
    return Ke(s, e, t, n);
  if (Ye(r)) {
    if (l === "")
      return e.forceBlockIndent = !0, Ke(s, e, t, n);
    if (a && l === c)
      return oe(r, e);
  }
  const f = r.replace(/\n+/g, `$&
${l}`);
  if (o) {
    const h = (u) => {
      var m;
      return u.default && u.tag !== "tag:yaml.org,2002:str" && ((m = u.test) == null ? void 0 : m.test(f));
    }, { compat: d, tags: g } = e.doc.schema;
    if (g.some(h) || d != null && d.some(h))
      return oe(r, e);
  }
  return a ? f : Ue(f, l, es, Ve(e, !1));
}
function gt(s, e, t, n) {
  const { implicitKey: i, inFlow: r } = e, o = typeof s.value == "string" ? s : Object.assign({}, s, { value: String(s.value) });
  let { type: a } = s;
  a !== E.QUOTE_DOUBLE && /[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(o.value) && (a = E.QUOTE_DOUBLE);
  const l = (p) => {
    switch (p) {
      case E.BLOCK_FOLDED:
      case E.BLOCK_LITERAL:
        return i || r ? oe(o.value, e) : Ke(o, e, t, n);
      case E.QUOTE_DOUBLE:
        return Se(o.value, e);
      case E.QUOTE_SINGLE:
        return ot(o.value, e);
      case E.PLAIN:
        return an(o, e, t, n);
      default:
        return null;
    }
  };
  let c = l(a);
  if (c === null) {
    const { defaultKeyType: p, defaultStringType: f } = e.options, h = i && p || f;
    if (c = l(h), c === null)
      throw new Error(`Unsupported default string type ${h}`);
  }
  return c;
}
function ts(s, e) {
  const t = Object.assign({
    blockQuote: !0,
    commentString: rn,
    defaultKeyType: null,
    defaultStringType: "PLAIN",
    directives: null,
    doubleQuotedAsJSON: !1,
    doubleQuotedMinMultiLineLength: 40,
    falseStr: "false",
    flowCollectionPadding: !0,
    indentSeq: !0,
    lineWidth: 80,
    minContentWidth: 20,
    nullStr: "null",
    simpleKeys: !1,
    singleQuote: null,
    trailingComma: !1,
    trueStr: "true",
    verifyAliasOrder: !0
  }, s.schema.toStringOptions, e);
  let n;
  switch (t.collectionStyle) {
    case "block":
      n = !1;
      break;
    case "flow":
      n = !0;
      break;
    default:
      n = null;
  }
  return {
    anchors: /* @__PURE__ */ new Set(),
    doc: s,
    flowCollectionPadding: t.flowCollectionPadding ? " " : "",
    indent: "",
    indentStep: typeof t.indent == "number" ? " ".repeat(t.indent) : "  ",
    inFlow: n,
    options: t
  };
}
function ln(s, e) {
  var i;
  if (e.tag) {
    const r = s.filter((o) => o.tag === e.tag);
    if (r.length > 0)
      return r.find((o) => o.format === e.format) ?? r[0];
  }
  let t, n;
  if (T(e)) {
    n = e.value;
    let r = s.filter((o) => {
      var a;
      return (a = o.identify) == null ? void 0 : a.call(o, n);
    });
    if (r.length > 1) {
      const o = r.filter((a) => a.test);
      o.length > 0 && (r = o);
    }
    t = r.find((o) => o.format === e.format) ?? r.find((o) => !o.format);
  } else
    n = e, t = s.find((r) => r.nodeClass && n instanceof r.nodeClass);
  if (!t) {
    const r = ((i = n == null ? void 0 : n.constructor) == null ? void 0 : i.name) ?? (n === null ? "null" : typeof n);
    throw new Error(`Tag not resolved for ${r} value`);
  }
  return t;
}
function cn(s, e, { anchors: t, doc: n }) {
  if (!n.directives)
    return "";
  const i = [], r = (T(s) || L(s)) && s.anchor;
  r && Qt(r) && (t.add(r), i.push(`&${r}`));
  const o = s.tag ?? (e.default ? null : e.tag);
  return o && i.push(n.directives.tagString(o)), i.join(" ");
}
function ce(s, e, t, n) {
  var l;
  if (_(s))
    return s.toString(e, t, n);
  if (de(s)) {
    if (e.doc.directives)
      return s.toString(e);
    if ((l = e.resolvedAliases) != null && l.has(s))
      throw new TypeError("Cannot stringify circular structure without alias nodes");
    e.resolvedAliases ? e.resolvedAliases.add(s) : e.resolvedAliases = /* @__PURE__ */ new Set([s]), s = s.resolve(e.doc);
  }
  let i;
  const r = C(s) ? s : e.doc.createNode(s, { onTagObj: (c) => i = c });
  i ?? (i = ln(e.doc.schema.tags, r));
  const o = cn(r, i, e);
  o.length > 0 && (e.indentAtStart = (e.indentAtStart ?? 0) + o.length + 1);
  const a = typeof i.stringify == "function" ? i.stringify(r, e, t, n) : T(r) ? gt(r, e, t, n) : r.toString(e, t, n);
  return o ? T(r) || a[0] === "{" || a[0] === "[" ? `${o} ${a}` : `${o}
${e.indent}${a}` : a;
}
function fn({ key: s, value: e }, t, n, i) {
  const { allNullValues: r, doc: o, indent: a, indentStep: l, options: { commentString: c, indentSeq: p, simpleKeys: f } } = t;
  let h = C(s) && s.comment || null;
  if (f) {
    if (h)
      throw new Error("With simple keys, key nodes cannot have comments");
    if (L(s) || !C(s) && typeof s == "object") {
      const A = "With simple keys, collection cannot be used as a key value";
      throw new Error(A);
    }
  }
  let d = !f && (!s || h && e == null && !t.inFlow || L(s) || (T(s) ? s.type === E.BLOCK_FOLDED || s.type === E.BLOCK_LITERAL : typeof s == "object"));
  t = Object.assign({}, t, {
    allNullValues: !1,
    implicitKey: !d && (f || !r),
    indent: a + l
  });
  let g = !1, u = !1, m = ce(s, t, () => g = !0, () => u = !0);
  if (!d && !t.inFlow && m.length > 1024) {
    if (f)
      throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
    d = !0;
  }
  if (t.inFlow) {
    if (r || e == null)
      return g && n && n(), m === "" ? "?" : d ? `? ${m}` : m;
  } else if (r && !f || e == null && d)
    return m = `? ${m}`, h && !g ? m += z(m, t.indent, c(h)) : u && i && i(), m;
  g && (h = null), d ? (h && (m += z(m, t.indent, c(h))), m = `? ${m}
${a}:`) : (m = `${m}:`, h && (m += z(m, t.indent, c(h))));
  let y, b, S;
  C(e) ? (y = !!e.spaceBefore, b = e.commentBefore, S = e.comment) : (y = !1, b = null, S = null, e && typeof e == "object" && (e = o.createNode(e))), t.implicitKey = !1, !d && !h && T(e) && (t.indentAtStart = m.length + 1), u = !1, !p && l.length >= 2 && !t.inFlow && !d && Oe(e) && !e.flow && !e.tag && !e.anchor && (t.indent = t.indent.substring(2));
  let k = !1;
  const N = ce(e, t, () => k = !0, () => u = !0);
  let O = " ";
  if (h || y || b) {
    if (O = y ? `
` : "", b) {
      const A = c(b);
      O += `
${J(A, t.indent)}`;
    }
    N === "" && !t.inFlow ? O === `
` && S && (O = `

`) : O += `
${t.indent}`;
  } else if (!d && L(e)) {
    const A = N[0], w = N.indexOf(`
`), $ = w !== -1, v = t.inFlow ?? e.flow ?? e.items.length === 0;
    if ($ || !v) {
      let Y = !1;
      if ($ && (A === "&" || A === "!")) {
        let R = N.indexOf(" ");
        A === "&" && R !== -1 && R < w && N[R + 1] === "!" && (R = N.indexOf(" ", R + 1)), (R === -1 || w < R) && (Y = !0);
      }
      Y || (O = `
${t.indent}`);
    }
  } else (N === "" || N[0] === `
`) && (O = "");
  return m += O + N, t.inFlow ? k && n && n() : S && !k ? m += z(m, t.indent, c(S)) : u && i && i(), m;
}
function ss(s, e) {
  (s === "debug" || s === "warn") && console.warn(e);
}
const Ce = "<<", G = {
  identify: (s) => s === Ce || typeof s == "symbol" && s.description === Ce,
  default: "key",
  tag: "tag:yaml.org,2002:merge",
  test: /^<<$/,
  resolve: () => Object.assign(new E(Symbol(Ce)), {
    addToJSMap: ns
  }),
  stringify: () => Ce
}, un = (s, e) => (G.identify(e) || T(e) && (!e.type || e.type === E.PLAIN) && G.identify(e.value)) && (s == null ? void 0 : s.doc.schema.tags.some((t) => t.tag === G.tag && t.default));
function ns(s, e, t) {
  const n = is(s, t);
  if (Oe(n))
    for (const i of n.items)
      Ze(s, e, i);
  else if (Array.isArray(n))
    for (const i of n)
      Ze(s, e, i);
  else
    Ze(s, e, n);
}
function Ze(s, e, t) {
  const n = is(s, t);
  if (!Ae(n))
    throw new Error("Merge sources must be maps or map aliases");
  const i = n.toJSON(null, s, Map);
  for (const [r, o] of i)
    e instanceof Map ? e.has(r) || e.set(r, o) : e instanceof Set ? e.add(r) : Object.prototype.hasOwnProperty.call(e, r) || Object.defineProperty(e, r, {
      value: o,
      writable: !0,
      enumerable: !0,
      configurable: !0
    });
  return e;
}
function is(s, e) {
  return s && de(e) ? e.resolve(s.doc, s) : e;
}
function rs(s, e, { key: t, value: n }) {
  if (C(t) && t.addToJSMap)
    t.addToJSMap(s, e, n);
  else if (un(s, t))
    ns(s, e, n);
  else {
    const i = D(t, "", s);
    if (e instanceof Map)
      e.set(i, D(n, i, s));
    else if (e instanceof Set)
      e.add(i);
    else {
      const r = hn(t, i, s), o = D(n, r, s);
      r in e ? Object.defineProperty(e, r, {
        value: o,
        writable: !0,
        enumerable: !0,
        configurable: !0
      }) : e[r] = o;
    }
  }
  return e;
}
function hn(s, e, t) {
  if (e === null)
    return "";
  if (typeof e != "object")
    return String(e);
  if (C(s) && (t != null && t.doc)) {
    const n = ts(t.doc, {});
    n.anchors = /* @__PURE__ */ new Set();
    for (const r of t.anchors.keys())
      n.anchors.add(r.anchor);
    n.inFlow = !0, n.inStringifyKey = !0;
    const i = s.toString(n);
    if (!t.mapKeyWarned) {
      let r = JSON.stringify(i);
      r.length > 40 && (r = r.substring(0, 36) + '..."'), ss(t.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${r}. Set mapAsMap: true to use object keys.`), t.mapKeyWarned = !0;
    }
    return i;
  }
  return JSON.stringify(e);
}
function yt(s, e, t) {
  const n = Ne(s, void 0, t), i = Ne(e, void 0, t);
  return new B(n, i);
}
class B {
  constructor(e, t = null) {
    Object.defineProperty(this, K, { value: Ht }), this.key = e, this.value = t;
  }
  clone(e) {
    let { key: t, value: n } = this;
    return C(t) && (t = t.clone(e)), C(n) && (n = n.clone(e)), new B(t, n);
  }
  toJSON(e, t) {
    const n = t != null && t.mapAsMap ? /* @__PURE__ */ new Map() : {};
    return rs(t, n, this);
  }
  toString(e, t, n) {
    return e != null && e.doc ? fn(this, e, t, n) : JSON.stringify(this);
  }
}
function os(s, e, t) {
  return (e.inFlow ?? s.flow ? pn : dn)(s, e, t);
}
function dn({ comment: s, items: e }, t, { blockItemPrefix: n, flowChars: i, itemIndent: r, onChompKeep: o, onComment: a }) {
  const { indent: l, options: { commentString: c } } = t, p = Object.assign({}, t, { indent: r, type: null });
  let f = !1;
  const h = [];
  for (let g = 0; g < e.length; ++g) {
    const u = e[g];
    let m = null;
    if (C(u))
      !f && u.spaceBefore && h.push(""), Fe(t, h, u.commentBefore, f), u.comment && (m = u.comment);
    else if (_(u)) {
      const b = C(u.key) ? u.key : null;
      b && (!f && b.spaceBefore && h.push(""), Fe(t, h, b.commentBefore, f));
    }
    f = !1;
    let y = ce(u, p, () => m = null, () => f = !0);
    m && (y += z(y, r, c(m))), f && m && (f = !1), h.push(n + y);
  }
  let d;
  if (h.length === 0)
    d = i.start + i.end;
  else {
    d = h[0];
    for (let g = 1; g < h.length; ++g) {
      const u = h[g];
      d += u ? `
${l}${u}` : `
`;
    }
  }
  return s ? (d += `
` + J(c(s), l), a && a()) : f && o && o(), d;
}
function pn({ items: s }, e, { flowChars: t, itemIndent: n }) {
  const { indent: i, indentStep: r, flowCollectionPadding: o, options: { commentString: a } } = e;
  n += r;
  const l = Object.assign({}, e, {
    indent: n,
    inFlow: !0,
    type: null
  });
  let c = !1, p = 0;
  const f = [];
  for (let g = 0; g < s.length; ++g) {
    const u = s[g];
    let m = null;
    if (C(u))
      u.spaceBefore && f.push(""), Fe(e, f, u.commentBefore, !1), u.comment && (m = u.comment);
    else if (_(u)) {
      const b = C(u.key) ? u.key : null;
      b && (b.spaceBefore && f.push(""), Fe(e, f, b.commentBefore, !1), b.comment && (c = !0));
      const S = C(u.value) ? u.value : null;
      S ? (S.comment && (m = S.comment), S.commentBefore && (c = !0)) : u.value == null && (b != null && b.comment) && (m = b.comment);
    }
    m && (c = !0);
    let y = ce(u, l, () => m = null);
    c || (c = f.length > p || y.includes(`
`)), g < s.length - 1 ? y += "," : e.options.trailingComma && (e.options.lineWidth > 0 && (c || (c = f.reduce((b, S) => b + S.length + 2, 2) + (y.length + 2) > e.options.lineWidth)), c && (y += ",")), m && (y += z(y, n, a(m))), f.push(y), p = f.length;
  }
  const { start: h, end: d } = t;
  if (f.length === 0)
    return h + d;
  if (!c) {
    const g = f.reduce((u, m) => u + m.length + 2, 2);
    c = e.options.lineWidth > 0 && g > e.options.lineWidth;
  }
  if (c) {
    let g = h;
    for (const u of f)
      g += u ? `
${r}${i}${u}` : `
`;
    return `${g}
${i}${d}`;
  } else
    return `${h}${o}${f.join(" ")}${o}${d}`;
}
function Fe({ indent: s, options: { commentString: e } }, t, n, i) {
  if (n && i && (n = n.replace(/^\n+/, "")), n) {
    const r = J(e(n), s);
    t.push(r.trimStart());
  }
}
function Z(s, e) {
  const t = T(e) ? e.value : e;
  for (const n of s)
    if (_(n) && (n.key === e || n.key === t || T(n.key) && n.key.value === t))
      return n;
}
class j extends xt {
  static get tagName() {
    return "tag:yaml.org,2002:map";
  }
  constructor(e) {
    super(W, e), this.items = [];
  }
  /**
   * A generic collection parsing method that can be extended
   * to other node classes that inherit from YAMLMap
   */
  static from(e, t, n) {
    const { keepUndefined: i, replacer: r } = n, o = new this(e), a = (l, c) => {
      if (typeof r == "function")
        c = r.call(t, l, c);
      else if (Array.isArray(r) && !r.includes(l))
        return;
      (c !== void 0 || i) && o.items.push(yt(l, c, n));
    };
    if (t instanceof Map)
      for (const [l, c] of t)
        a(l, c);
    else if (t && typeof t == "object")
      for (const l of Object.keys(t))
        a(l, t[l]);
    return typeof e.sortMapEntries == "function" && o.items.sort(e.sortMapEntries), o;
  }
  /**
   * Adds a value to the collection.
   *
   * @param overwrite - If not set `true`, using a key that is already in the
   *   collection will throw. Otherwise, overwrites the previous value.
   */
  add(e, t) {
    var o;
    let n;
    _(e) ? n = e : !e || typeof e != "object" || !("key" in e) ? n = new B(e, e == null ? void 0 : e.value) : n = new B(e.key, e.value);
    const i = Z(this.items, n.key), r = (o = this.schema) == null ? void 0 : o.sortMapEntries;
    if (i) {
      if (!t)
        throw new Error(`Key ${n.key} already set`);
      T(i.value) && Zt(n.value) ? i.value.value = n.value : i.value = n.value;
    } else if (r) {
      const a = this.items.findIndex((l) => r(n, l) < 0);
      a === -1 ? this.items.push(n) : this.items.splice(a, 0, n);
    } else
      this.items.push(n);
  }
  delete(e) {
    const t = Z(this.items, e);
    return t ? this.items.splice(this.items.indexOf(t), 1).length > 0 : !1;
  }
  get(e, t) {
    const n = Z(this.items, e), i = n == null ? void 0 : n.value;
    return (!t && T(i) ? i.value : i) ?? void 0;
  }
  has(e) {
    return !!Z(this.items, e);
  }
  set(e, t) {
    this.add(new B(e, t), !0);
  }
  /**
   * @param ctx - Conversion context, originally set in Document#toJS()
   * @param {Class} Type - If set, forces the returned collection type
   * @returns Instance of Type, Map, or Object
   */
  toJSON(e, t, n) {
    const i = n ? new n() : t != null && t.mapAsMap ? /* @__PURE__ */ new Map() : {};
    t != null && t.onCreate && t.onCreate(i);
    for (const r of this.items)
      rs(t, i, r);
    return i;
  }
  toString(e, t, n) {
    if (!e)
      return JSON.stringify(this);
    for (const i of this.items)
      if (!_(i))
        throw new Error(`Map items must all be pairs; found ${JSON.stringify(i)} instead`);
    return !e.allNullValues && this.hasAllNullValues(!1) && (e = Object.assign({}, e, { allNullValues: !0 })), os(this, e, {
      blockItemPrefix: "",
      flowChars: { start: "{", end: "}" },
      itemIndent: e.indent || "",
      onChompKeep: n,
      onComment: t
    });
  }
}
const me = {
  collection: "map",
  default: !0,
  nodeClass: j,
  tag: "tag:yaml.org,2002:map",
  resolve(s, e) {
    return Ae(s) || e("Expected a mapping for this tag"), s;
  },
  createNode: (s, e, t) => j.from(s, e, t)
};
class x extends xt {
  static get tagName() {
    return "tag:yaml.org,2002:seq";
  }
  constructor(e) {
    super(he, e), this.items = [];
  }
  add(e) {
    this.items.push(e);
  }
  /**
   * Removes a value from the collection.
   *
   * `key` must contain a representation of an integer for this to succeed.
   * It may be wrapped in a `Scalar`.
   *
   * @returns `true` if the item was found and removed.
   */
  delete(e) {
    const t = _e(e);
    return typeof t != "number" ? !1 : this.items.splice(t, 1).length > 0;
  }
  get(e, t) {
    const n = _e(e);
    if (typeof n != "number")
      return;
    const i = this.items[n];
    return !t && T(i) ? i.value : i;
  }
  /**
   * Checks if the collection includes a value with the key `key`.
   *
   * `key` must contain a representation of an integer for this to succeed.
   * It may be wrapped in a `Scalar`.
   */
  has(e) {
    const t = _e(e);
    return typeof t == "number" && t < this.items.length;
  }
  /**
   * Sets a value in this collection. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   *
   * If `key` does not contain a representation of an integer, this will throw.
   * It may be wrapped in a `Scalar`.
   */
  set(e, t) {
    const n = _e(e);
    if (typeof n != "number")
      throw new Error(`Expected a valid index, not ${e}.`);
    const i = this.items[n];
    T(i) && Zt(t) ? i.value = t : this.items[n] = t;
  }
  toJSON(e, t) {
    const n = [];
    t != null && t.onCreate && t.onCreate(n);
    let i = 0;
    for (const r of this.items)
      n.push(D(r, String(i++), t));
    return n;
  }
  toString(e, t, n) {
    return e ? os(this, e, {
      blockItemPrefix: "- ",
      flowChars: { start: "[", end: "]" },
      itemIndent: (e.indent || "") + "  ",
      onChompKeep: n,
      onComment: t
    }) : JSON.stringify(this);
  }
  static from(e, t, n) {
    const { replacer: i } = n, r = new this(e);
    if (t && Symbol.iterator in Object(t)) {
      let o = 0;
      for (let a of t) {
        if (typeof i == "function") {
          const l = t instanceof Set ? a : String(o++);
          a = i.call(t, l, a);
        }
        r.items.push(Ne(a, void 0, n));
      }
    }
    return r;
  }
}
function _e(s) {
  let e = T(s) ? s.value : s;
  return e && typeof e == "string" && (e = Number(e)), typeof e == "number" && Number.isInteger(e) && e >= 0 ? e : null;
}
const ge = {
  collection: "seq",
  default: !0,
  nodeClass: x,
  tag: "tag:yaml.org,2002:seq",
  resolve(s, e) {
    return Oe(s) || e("Expected a sequence for this tag"), s;
  },
  createNode: (s, e, t) => x.from(s, e, t)
}, Je = {
  identify: (s) => typeof s == "string",
  default: !0,
  tag: "tag:yaml.org,2002:str",
  resolve: (s) => s,
  stringify(s, e, t, n) {
    return e = Object.assign({ actualString: !0 }, e), gt(s, e, t, n);
  }
}, Ge = {
  identify: (s) => s == null,
  createNode: () => new E(null),
  default: !0,
  tag: "tag:yaml.org,2002:null",
  test: /^(?:~|[Nn]ull|NULL)?$/,
  resolve: () => new E(null),
  stringify: ({ source: s }, e) => typeof s == "string" && Ge.test.test(s) ? s : e.options.nullStr
}, bt = {
  identify: (s) => typeof s == "boolean",
  default: !0,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
  resolve: (s) => new E(s[0] === "t" || s[0] === "T"),
  stringify({ source: s, value: e }, t) {
    if (s && bt.test.test(s)) {
      const n = s[0] === "t" || s[0] === "T";
      if (e === n)
        return s;
    }
    return e ? t.options.trueStr : t.options.falseStr;
  }
};
function U({ format: s, minFractionDigits: e, tag: t, value: n }) {
  if (typeof n == "bigint")
    return String(n);
  const i = typeof n == "number" ? n : Number(n);
  if (!isFinite(i))
    return isNaN(i) ? ".nan" : i < 0 ? "-.inf" : ".inf";
  let r = Object.is(n, -0) ? "-0" : JSON.stringify(n);
  if (!s && e && (!t || t === "tag:yaml.org,2002:float") && /^-?\d/.test(r) && !r.includes("e")) {
    let o = r.indexOf(".");
    o < 0 && (o = r.length, r += ".");
    let a = e - (r.length - o - 1);
    for (; a-- > 0; )
      r += "0";
  }
  return r;
}
const as = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
  resolve: (s) => s.slice(-3).toLowerCase() === "nan" ? NaN : s[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  stringify: U
}, ls = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  format: "EXP",
  test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
  resolve: (s) => parseFloat(s),
  stringify(s) {
    const e = Number(s.value);
    return isFinite(e) ? e.toExponential() : U(s);
  }
}, cs = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
  resolve(s) {
    const e = new E(parseFloat(s)), t = s.indexOf(".");
    return t !== -1 && s[s.length - 1] === "0" && (e.minFractionDigits = s.length - t - 1), e;
  },
  stringify: U
}, He = (s) => typeof s == "bigint" || Number.isInteger(s), wt = (s, e, t, { intAsBigInt: n }) => n ? BigInt(s) : parseInt(s.substring(e), t);
function fs(s, e, t) {
  const { value: n } = s;
  return He(n) && n >= 0 ? t + n.toString(e) : U(s);
}
const us = {
  identify: (s) => He(s) && s >= 0,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "OCT",
  test: /^0o[0-7]+$/,
  resolve: (s, e, t) => wt(s, 2, 8, t),
  stringify: (s) => fs(s, 8, "0o")
}, hs = {
  identify: He,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  test: /^[-+]?[0-9]+$/,
  resolve: (s, e, t) => wt(s, 0, 10, t),
  stringify: U
}, ds = {
  identify: (s) => He(s) && s >= 0,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "HEX",
  test: /^0x[0-9a-fA-F]+$/,
  resolve: (s, e, t) => wt(s, 2, 16, t),
  stringify: (s) => fs(s, 16, "0x")
}, mn = [
  me,
  ge,
  Je,
  Ge,
  bt,
  us,
  hs,
  ds,
  as,
  ls,
  cs
];
function vt(s) {
  return typeof s == "bigint" || Number.isInteger(s);
}
const ve = ({ value: s }) => JSON.stringify(s), gn = [
  {
    identify: (s) => typeof s == "string",
    default: !0,
    tag: "tag:yaml.org,2002:str",
    resolve: (s) => s,
    stringify: ve
  },
  {
    identify: (s) => s == null,
    createNode: () => new E(null),
    default: !0,
    tag: "tag:yaml.org,2002:null",
    test: /^null$/,
    resolve: () => null,
    stringify: ve
  },
  {
    identify: (s) => typeof s == "boolean",
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^true$|^false$/,
    resolve: (s) => s === "true",
    stringify: ve
  },
  {
    identify: vt,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    test: /^-?(?:0|[1-9][0-9]*)$/,
    resolve: (s, e, { intAsBigInt: t }) => t ? BigInt(s) : parseInt(s, 10),
    stringify: ({ value: s }) => vt(s) ? s.toString() : JSON.stringify(s)
  },
  {
    identify: (s) => typeof s == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
    resolve: (s) => parseFloat(s),
    stringify: ve
  }
], yn = {
  default: !0,
  tag: "",
  test: /^/,
  resolve(s, e) {
    return e(`Unresolved plain scalar ${JSON.stringify(s)}`), s;
  }
}, bn = [me, ge].concat(gn, yn), kt = {
  identify: (s) => s instanceof Uint8Array,
  // Buffer inherits from Uint8Array
  default: !1,
  tag: "tag:yaml.org,2002:binary",
  /**
   * Returns a Buffer in node and an Uint8Array in browsers
   *
   * To use the resulting buffer as an image, you'll want to do something like:
   *
   *   const blob = new Blob([buffer], { type: 'image/jpeg' })
   *   document.querySelector('#photo').src = URL.createObjectURL(blob)
   */
  resolve(s, e) {
    if (typeof atob == "function") {
      const t = atob(s.replace(/[\n\r]/g, "")), n = new Uint8Array(t.length);
      for (let i = 0; i < t.length; ++i)
        n[i] = t.charCodeAt(i);
      return n;
    } else
      return e("This environment does not support reading binary tags; either Buffer or atob is required"), s;
  },
  stringify({ comment: s, type: e, value: t }, n, i, r) {
    if (!t)
      return "";
    const o = t;
    let a;
    if (typeof btoa == "function") {
      let l = "";
      for (let c = 0; c < o.length; ++c)
        l += String.fromCharCode(o[c]);
      a = btoa(l);
    } else
      throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
    if (e ?? (e = E.BLOCK_LITERAL), e !== E.QUOTE_DOUBLE) {
      const l = Math.max(n.options.lineWidth - n.indent.length, n.options.minContentWidth), c = Math.ceil(a.length / l), p = new Array(c);
      for (let f = 0, h = 0; f < c; ++f, h += l)
        p[f] = a.substr(h, l);
      a = p.join(e === E.BLOCK_LITERAL ? `
` : " ");
    }
    return gt({ comment: s, type: e, value: a }, n, i, r);
  }
};
function ps(s, e) {
  if (Oe(s))
    for (let t = 0; t < s.items.length; ++t) {
      let n = s.items[t];
      if (!_(n)) {
        if (Ae(n)) {
          n.items.length > 1 && e("Each pair must have its own sequence indicator");
          const i = n.items[0] || new B(new E(null));
          if (n.commentBefore && (i.key.commentBefore = i.key.commentBefore ? `${n.commentBefore}
${i.key.commentBefore}` : n.commentBefore), n.comment) {
            const r = i.value ?? i.key;
            r.comment = r.comment ? `${n.comment}
${r.comment}` : n.comment;
          }
          n = i;
        }
        s.items[t] = _(n) ? n : new B(n);
      }
    }
  else
    e("Expected a sequence for this tag");
  return s;
}
function ms(s, e, t) {
  const { replacer: n } = t, i = new x(s);
  i.tag = "tag:yaml.org,2002:pairs";
  let r = 0;
  if (e && Symbol.iterator in Object(e))
    for (let o of e) {
      typeof n == "function" && (o = n.call(e, String(r++), o));
      let a, l;
      if (Array.isArray(o))
        if (o.length === 2)
          a = o[0], l = o[1];
        else
          throw new TypeError(`Expected [key, value] tuple: ${o}`);
      else if (o && o instanceof Object) {
        const c = Object.keys(o);
        if (c.length === 1)
          a = c[0], l = o[a];
        else
          throw new TypeError(`Expected tuple with one key, not ${c.length} keys`);
      } else
        a = o;
      i.items.push(yt(a, l, t));
    }
  return i;
}
const St = {
  collection: "seq",
  default: !1,
  tag: "tag:yaml.org,2002:pairs",
  resolve: ps,
  createNode: ms
};
class ae extends x {
  constructor() {
    super(), this.add = j.prototype.add.bind(this), this.delete = j.prototype.delete.bind(this), this.get = j.prototype.get.bind(this), this.has = j.prototype.has.bind(this), this.set = j.prototype.set.bind(this), this.tag = ae.tag;
  }
  /**
   * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
   * but TypeScript won't allow widening the signature of a child method.
   */
  toJSON(e, t) {
    if (!t)
      return super.toJSON(e);
    const n = /* @__PURE__ */ new Map();
    t != null && t.onCreate && t.onCreate(n);
    for (const i of this.items) {
      let r, o;
      if (_(i) ? (r = D(i.key, "", t), o = D(i.value, r, t)) : r = D(i, "", t), n.has(r))
        throw new Error("Ordered maps must not include duplicate keys");
      n.set(r, o);
    }
    return n;
  }
  static from(e, t, n) {
    const i = ms(e, t, n), r = new this();
    return r.items = i.items, r;
  }
}
ae.tag = "tag:yaml.org,2002:omap";
const Nt = {
  collection: "seq",
  identify: (s) => s instanceof Map,
  nodeClass: ae,
  default: !1,
  tag: "tag:yaml.org,2002:omap",
  resolve(s, e) {
    const t = ps(s, e), n = [];
    for (const { key: i } of t.items)
      T(i) && (n.includes(i.value) ? e(`Ordered maps must not include duplicate keys: ${i.value}`) : n.push(i.value));
    return Object.assign(new ae(), t);
  },
  createNode: (s, e, t) => ae.from(s, e, t)
};
function gs({ value: s, source: e }, t) {
  return e && (s ? ys : bs).test.test(e) ? e : s ? t.options.trueStr : t.options.falseStr;
}
const ys = {
  identify: (s) => s === !0,
  default: !0,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
  resolve: () => new E(!0),
  stringify: gs
}, bs = {
  identify: (s) => s === !1,
  default: !0,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
  resolve: () => new E(!1),
  stringify: gs
}, wn = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
  resolve: (s) => s.slice(-3).toLowerCase() === "nan" ? NaN : s[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  stringify: U
}, kn = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  format: "EXP",
  test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
  resolve: (s) => parseFloat(s.replace(/_/g, "")),
  stringify(s) {
    const e = Number(s.value);
    return isFinite(e) ? e.toExponential() : U(s);
  }
}, Sn = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
  resolve(s) {
    const e = new E(parseFloat(s.replace(/_/g, ""))), t = s.indexOf(".");
    if (t !== -1) {
      const n = s.substring(t + 1).replace(/_/g, "");
      n[n.length - 1] === "0" && (e.minFractionDigits = n.length);
    }
    return e;
  },
  stringify: U
}, $e = (s) => typeof s == "bigint" || Number.isInteger(s);
function We(s, e, t, { intAsBigInt: n }) {
  const i = s[0];
  if ((i === "-" || i === "+") && (e += 1), s = s.substring(e).replace(/_/g, ""), n) {
    switch (t) {
      case 2:
        s = `0b${s}`;
        break;
      case 8:
        s = `0o${s}`;
        break;
      case 16:
        s = `0x${s}`;
        break;
    }
    const o = BigInt(s);
    return i === "-" ? BigInt(-1) * o : o;
  }
  const r = parseInt(s, t);
  return i === "-" ? -1 * r : r;
}
function Et(s, e, t) {
  const { value: n } = s;
  if ($e(n)) {
    const i = n.toString(e);
    return n < 0 ? "-" + t + i.substr(1) : t + i;
  }
  return U(s);
}
const Nn = {
  identify: $e,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "BIN",
  test: /^[-+]?0b[0-1_]+$/,
  resolve: (s, e, t) => We(s, 2, 2, t),
  stringify: (s) => Et(s, 2, "0b")
}, En = {
  identify: $e,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "OCT",
  test: /^[-+]?0[0-7_]+$/,
  resolve: (s, e, t) => We(s, 1, 8, t),
  stringify: (s) => Et(s, 8, "0")
}, In = {
  identify: $e,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  test: /^[-+]?[0-9][0-9_]*$/,
  resolve: (s, e, t) => We(s, 0, 10, t),
  stringify: U
}, An = {
  identify: $e,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "HEX",
  test: /^[-+]?0x[0-9a-fA-F_]+$/,
  resolve: (s, e, t) => We(s, 2, 16, t),
  stringify: (s) => Et(s, 16, "0x")
};
class le extends j {
  constructor(e) {
    super(e), this.tag = le.tag;
  }
  add(e) {
    let t;
    _(e) ? t = e : e && typeof e == "object" && "key" in e && "value" in e && e.value === null ? t = new B(e.key, null) : t = new B(e, null), Z(this.items, t.key) || this.items.push(t);
  }
  /**
   * If `keepPair` is `true`, returns the Pair matching `key`.
   * Otherwise, returns the value of that Pair's key.
   */
  get(e, t) {
    const n = Z(this.items, e);
    return !t && _(n) ? T(n.key) ? n.key.value : n.key : n;
  }
  set(e, t) {
    if (typeof t != "boolean")
      throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof t}`);
    const n = Z(this.items, e);
    n && !t ? this.items.splice(this.items.indexOf(n), 1) : !n && t && this.items.push(new B(e));
  }
  toJSON(e, t) {
    return super.toJSON(e, t, Set);
  }
  toString(e, t, n) {
    if (!e)
      return JSON.stringify(this);
    if (this.hasAllNullValues(!0))
      return super.toString(Object.assign({}, e, { allNullValues: !0 }), t, n);
    throw new Error("Set items must all have null values");
  }
  static from(e, t, n) {
    const { replacer: i } = n, r = new this(e);
    if (t && Symbol.iterator in Object(t))
      for (let o of t)
        typeof i == "function" && (o = i.call(t, o, o)), r.items.push(yt(o, null, n));
    return r;
  }
}
le.tag = "tag:yaml.org,2002:set";
const It = {
  collection: "map",
  identify: (s) => s instanceof Set,
  nodeClass: le,
  default: !1,
  tag: "tag:yaml.org,2002:set",
  createNode: (s, e, t) => le.from(s, e, t),
  resolve(s, e) {
    if (Ae(s)) {
      if (s.hasAllNullValues(!0))
        return Object.assign(new le(), s);
      e("Set items must all have null values");
    } else
      e("Expected a mapping for this tag");
    return s;
  }
};
function At(s, e) {
  const t = s[0], n = t === "-" || t === "+" ? s.substring(1) : s, i = (o) => e ? BigInt(o) : Number(o), r = n.replace(/_/g, "").split(":").reduce((o, a) => o * i(60) + i(a), i(0));
  return t === "-" ? i(-1) * r : r;
}
function ws(s) {
  let { value: e } = s, t = (o) => o;
  if (typeof e == "bigint")
    t = (o) => BigInt(o);
  else if (isNaN(e) || !isFinite(e))
    return U(s);
  let n = "";
  e < 0 && (n = "-", e *= t(-1));
  const i = t(60), r = [e % i];
  return e < 60 ? r.unshift(0) : (e = (e - r[0]) / i, r.unshift(e % i), e >= 60 && (e = (e - r[0]) / i, r.unshift(e))), n + r.map((o) => String(o).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
}
const ks = {
  identify: (s) => typeof s == "bigint" || Number.isInteger(s),
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "TIME",
  test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
  resolve: (s, e, { intAsBigInt: t }) => At(s, t),
  stringify: ws
}, Ss = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  format: "TIME",
  test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
  resolve: (s) => At(s, !1),
  stringify: ws
}, Qe = {
  identify: (s) => s instanceof Date,
  default: !0,
  tag: "tag:yaml.org,2002:timestamp",
  // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
  // may be omitted altogether, resulting in a date format. In such a case, the time part is
  // assumed to be 00:00:00Z (start of day, UTC).
  test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
  resolve(s) {
    const e = s.match(Qe.test);
    if (!e)
      throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
    const [, t, n, i, r, o, a] = e.map(Number), l = e[7] ? Number((e[7] + "00").substr(1, 3)) : 0;
    let c = Date.UTC(t, n - 1, i, r || 0, o || 0, a || 0, l);
    const p = e[8];
    if (p && p !== "Z") {
      let f = At(p, !1);
      Math.abs(f) < 30 && (f *= 60), c -= 6e4 * f;
    }
    return new Date(c);
  },
  stringify: ({ value: s }) => (s == null ? void 0 : s.toISOString().replace(/(T00:00:00)?\.000Z$/, "")) ?? ""
}, Pt = [
  me,
  ge,
  Je,
  Ge,
  ys,
  bs,
  Nn,
  En,
  In,
  An,
  wn,
  kn,
  Sn,
  kt,
  G,
  Nt,
  St,
  It,
  ks,
  Ss,
  Qe
], Bt = /* @__PURE__ */ new Map([
  ["core", mn],
  ["failsafe", [me, ge, Je]],
  ["json", bn],
  ["yaml11", Pt],
  ["yaml-1.1", Pt]
]), Mt = {
  binary: kt,
  bool: bt,
  float: cs,
  floatExp: ls,
  floatNaN: as,
  floatTime: Ss,
  int: hs,
  intHex: ds,
  intOct: us,
  intTime: ks,
  map: me,
  merge: G,
  null: Ge,
  omap: Nt,
  pairs: St,
  seq: ge,
  set: It,
  timestamp: Qe
}, On = {
  "tag:yaml.org,2002:binary": kt,
  "tag:yaml.org,2002:merge": G,
  "tag:yaml.org,2002:omap": Nt,
  "tag:yaml.org,2002:pairs": St,
  "tag:yaml.org,2002:set": It,
  "tag:yaml.org,2002:timestamp": Qe
};
function xe(s, e, t) {
  const n = Bt.get(e);
  if (n && !s)
    return t && !n.includes(G) ? n.concat(G) : n.slice();
  let i = n;
  if (!i)
    if (Array.isArray(s))
      i = [];
    else {
      const r = Array.from(Bt.keys()).filter((o) => o !== "yaml11").map((o) => JSON.stringify(o)).join(", ");
      throw new Error(`Unknown schema "${e}"; use one of ${r} or define customTags array`);
    }
  if (Array.isArray(s))
    for (const r of s)
      i = i.concat(r);
  else typeof s == "function" && (i = s(i.slice()));
  return t && (i = i.concat(G)), i.reduce((r, o) => {
    const a = typeof o == "string" ? Mt[o] : o;
    if (!a) {
      const l = JSON.stringify(o), c = Object.keys(Mt).map((p) => JSON.stringify(p)).join(", ");
      throw new Error(`Unknown custom tag ${l}; use one of ${c}`);
    }
    return r.includes(a) || r.push(a), r;
  }, []);
}
const $n = (s, e) => s.key < e.key ? -1 : s.key > e.key ? 1 : 0;
class Ot {
  constructor({ compat: e, customTags: t, merge: n, resolveKnownTags: i, schema: r, sortMapEntries: o, toStringDefaults: a }) {
    this.compat = Array.isArray(e) ? xe(e, "compat") : e ? xe(null, e) : null, this.name = typeof r == "string" && r || "core", this.knownTags = i ? On : {}, this.tags = xe(t, this.name, n), this.toStringOptions = a ?? null, Object.defineProperty(this, W, { value: me }), Object.defineProperty(this, V, { value: Je }), Object.defineProperty(this, he, { value: ge }), this.sortMapEntries = typeof o == "function" ? o : o === !0 ? $n : null;
  }
  clone() {
    const e = Object.create(Ot.prototype, Object.getOwnPropertyDescriptors(this));
    return e.tags = this.tags.slice(), e;
  }
}
function Tn(s, e) {
  var l;
  const t = [];
  let n = e.directives === !0;
  if (e.directives !== !1 && s.directives) {
    const c = s.directives.toString(s);
    c ? (t.push(c), n = !0) : s.directives.docStart && (n = !0);
  }
  n && t.push("---");
  const i = ts(s, e), { commentString: r } = i.options;
  if (s.commentBefore) {
    t.length !== 1 && t.unshift("");
    const c = r(s.commentBefore);
    t.unshift(J(c, ""));
  }
  let o = !1, a = null;
  if (s.contents) {
    if (C(s.contents)) {
      if (s.contents.spaceBefore && n && t.push(""), s.contents.commentBefore) {
        const f = r(s.contents.commentBefore);
        t.push(J(f, ""));
      }
      i.forceBlockIndent = !!s.comment, a = s.contents.comment;
    }
    const c = a ? void 0 : () => o = !0;
    let p = ce(s.contents, i, () => a = null, c);
    a && (p += z(p, "", r(a))), (p[0] === "|" || p[0] === ">") && t[t.length - 1] === "---" ? t[t.length - 1] = `--- ${p}` : t.push(p);
  } else
    t.push(ce(s.contents, i));
  if ((l = s.directives) != null && l.docEnd)
    if (s.comment) {
      const c = r(s.comment);
      c.includes(`
`) ? (t.push("..."), t.push(J(c, ""))) : t.push(`... ${c}`);
    } else
      t.push("...");
  else {
    let c = s.comment;
    c && o && (c = c.replace(/^\n+/, "")), c && ((!o || a) && t[t.length - 1] !== "" && t.push(""), t.push(J(r(c), "")));
  }
  return t.join(`
`) + `
`;
}
class Te {
  constructor(e, t, n) {
    this.commentBefore = null, this.comment = null, this.errors = [], this.warnings = [], Object.defineProperty(this, K, { value: it });
    let i = null;
    typeof t == "function" || Array.isArray(t) ? i = t : n === void 0 && t && (n = t, t = void 0);
    const r = Object.assign({
      intAsBigInt: !1,
      keepSourceTokens: !1,
      logLevel: "warn",
      prettyErrors: !0,
      strict: !0,
      stringKeys: !1,
      uniqueKeys: !0,
      version: "1.2"
    }, n);
    this.options = r;
    let { version: o } = r;
    n != null && n._directives ? (this.directives = n._directives.atDocument(), this.directives.yaml.explicit && (o = this.directives.yaml.version)) : this.directives = new P({ version: o }), this.setSchema(o, n), this.contents = e === void 0 ? null : this.createNode(e, i, n);
  }
  /**
   * Create a deep copy of this Document and its contents.
   *
   * Custom Node values that inherit from `Object` still refer to their original instances.
   */
  clone() {
    const e = Object.create(Te.prototype, {
      [K]: { value: it }
    });
    return e.commentBefore = this.commentBefore, e.comment = this.comment, e.errors = this.errors.slice(), e.warnings = this.warnings.slice(), e.options = Object.assign({}, this.options), this.directives && (e.directives = this.directives.clone()), e.schema = this.schema.clone(), e.contents = C(this.contents) ? this.contents.clone(e.schema) : this.contents, this.range && (e.range = this.range.slice()), e;
  }
  /** Adds a value to the document. */
  add(e) {
    ee(this.contents) && this.contents.add(e);
  }
  /** Adds a value to the document. */
  addIn(e, t) {
    ee(this.contents) && this.contents.addIn(e, t);
  }
  /**
   * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
   *
   * If `node` already has an anchor, `name` is ignored.
   * Otherwise, the `node.anchor` value will be set to `name`,
   * or if an anchor with that name is already present in the document,
   * `name` will be used as a prefix for a new unique anchor.
   * If `name` is undefined, the generated anchor will use 'a' as a prefix.
   */
  createAlias(e, t) {
    if (!e.anchor) {
      const n = Xt(this);
      e.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      !t || n.has(t) ? zt(t || "a", n) : t;
    }
    return new mt(e.anchor);
  }
  createNode(e, t, n) {
    let i;
    if (typeof t == "function")
      e = t.call({ "": e }, "", e), i = t;
    else if (Array.isArray(t)) {
      const m = (b) => typeof b == "number" || b instanceof String || b instanceof Number, y = t.filter(m).map(String);
      y.length > 0 && (t = t.concat(y)), i = t;
    } else n === void 0 && t && (n = t, t = void 0);
    const { aliasDuplicateObjects: r, anchorPrefix: o, flow: a, keepUndefined: l, onTagObj: c, tag: p } = n ?? {}, { onAnchor: f, setAnchors: h, sourceObjects: d } = tn(
      this,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      o || "a"
    ), g = {
      aliasDuplicateObjects: r ?? !0,
      keepUndefined: l ?? !1,
      onAnchor: f,
      onTagObj: c,
      replacer: i,
      schema: this.schema,
      sourceObjects: d
    }, u = Ne(e, p, g);
    return a && L(u) && (u.flow = !0), h(), u;
  }
  /**
   * Convert a key and a value into a `Pair` using the current schema,
   * recursively wrapping all values as `Scalar` or `Collection` nodes.
   */
  createPair(e, t, n = {}) {
    const i = this.createNode(e, null, n), r = this.createNode(t, null, n);
    return new B(i, r);
  }
  /**
   * Removes a value from the document.
   * @returns `true` if the item was found and removed.
   */
  delete(e) {
    return ee(this.contents) ? this.contents.delete(e) : !1;
  }
  /**
   * Removes a value from the document.
   * @returns `true` if the item was found and removed.
   */
  deleteIn(e) {
    return be(e) ? this.contents == null ? !1 : (this.contents = null, !0) : ee(this.contents) ? this.contents.deleteIn(e) : !1;
  }
  /**
   * Returns item at `key`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  get(e, t) {
    return L(this.contents) ? this.contents.get(e, t) : void 0;
  }
  /**
   * Returns item at `path`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  getIn(e, t) {
    return be(e) ? !t && T(this.contents) ? this.contents.value : this.contents : L(this.contents) ? this.contents.getIn(e, t) : void 0;
  }
  /**
   * Checks if the document includes a value with the key `key`.
   */
  has(e) {
    return L(this.contents) ? this.contents.has(e) : !1;
  }
  /**
   * Checks if the document includes a value at `path`.
   */
  hasIn(e) {
    return be(e) ? this.contents !== void 0 : L(this.contents) ? this.contents.hasIn(e) : !1;
  }
  /**
   * Sets a value in this document. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  set(e, t) {
    this.contents == null ? this.contents = Re(this.schema, [e], t) : ee(this.contents) && this.contents.set(e, t);
  }
  /**
   * Sets a value in this document. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  setIn(e, t) {
    be(e) ? this.contents = t : this.contents == null ? this.contents = Re(this.schema, Array.from(e), t) : ee(this.contents) && this.contents.setIn(e, t);
  }
  /**
   * Change the YAML version and schema used by the document.
   * A `null` version disables support for directives, explicit tags, anchors, and aliases.
   * It also requires the `schema` option to be given as a `Schema` instance value.
   *
   * Overrides all previously set schema options.
   */
  setSchema(e, t = {}) {
    typeof e == "number" && (e = String(e));
    let n;
    switch (e) {
      case "1.1":
        this.directives ? this.directives.yaml.version = "1.1" : this.directives = new P({ version: "1.1" }), n = { resolveKnownTags: !1, schema: "yaml-1.1" };
        break;
      case "1.2":
      case "next":
        this.directives ? this.directives.yaml.version = e : this.directives = new P({ version: e }), n = { resolveKnownTags: !0, schema: "core" };
        break;
      case null:
        this.directives && delete this.directives, n = null;
        break;
      default: {
        const i = JSON.stringify(e);
        throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${i}`);
      }
    }
    if (t.schema instanceof Object)
      this.schema = t.schema;
    else if (n)
      this.schema = new Ot(Object.assign(n, t));
    else
      throw new Error("With a null YAML version, the { schema: Schema } option is required");
  }
  // json & jsonArg are only used from toJSON()
  toJS({ json: e, jsonArg: t, mapAsMap: n, maxAliasCount: i, onAnchor: r, reviver: o } = {}) {
    const a = {
      anchors: /* @__PURE__ */ new Map(),
      doc: this,
      keep: !e,
      mapAsMap: n === !0,
      mapKeyWarned: !1,
      maxAliasCount: typeof i == "number" ? i : 100
    }, l = D(this.contents, t ?? "", a);
    if (typeof r == "function")
      for (const { count: c, res: p } of a.anchors.values())
        r(p, c);
    return typeof o == "function" ? re(o, { "": l }, "", l) : l;
  }
  /**
   * A JSON representation of the document `contents`.
   *
   * @param jsonArg Used by `JSON.stringify` to indicate the array index or
   *   property name.
   */
  toJSON(e, t) {
    return this.toJS({ json: !0, jsonArg: e, mapAsMap: !1, onAnchor: t });
  }
  /** A YAML representation of the document. */
  toString(e = {}) {
    if (this.errors.length > 0)
      throw new Error("Document with errors cannot be stringified");
    if ("indent" in e && (!Number.isInteger(e.indent) || Number(e.indent) <= 0)) {
      const t = JSON.stringify(e.indent);
      throw new Error(`"indent" option must be a positive integer, not ${t}`);
    }
    return Tn(this, e);
  }
}
function ee(s) {
  if (L(s))
    return !0;
  throw new Error("Expected a YAML collection as document contents");
}
class Ns extends Error {
  constructor(e, t, n, i) {
    super(), this.name = e, this.code = n, this.message = i, this.pos = t;
  }
}
class we extends Ns {
  constructor(e, t, n) {
    super("YAMLParseError", e, t, n);
  }
}
class Ln extends Ns {
  constructor(e, t, n) {
    super("YAMLWarning", e, t, n);
  }
}
const jt = (s, e) => (t) => {
  if (t.pos[0] === -1)
    return;
  t.linePos = t.pos.map((a) => e.linePos(a));
  const { line: n, col: i } = t.linePos[0];
  t.message += ` at line ${n}, column ${i}`;
  let r = i - 1, o = s.substring(e.lineStarts[n - 1], e.lineStarts[n]).replace(/[\n\r]+$/, "");
  if (r >= 60 && o.length > 80) {
    const a = Math.min(r - 39, o.length - 79);
    o = "…" + o.substring(a), r -= a - 1;
  }
  if (o.length > 80 && (o = o.substring(0, 79) + "…"), n > 1 && /^ *$/.test(o.substring(0, r))) {
    let a = s.substring(e.lineStarts[n - 2], e.lineStarts[n - 1]);
    a.length > 80 && (a = a.substring(0, 79) + `…
`), o = a + o;
  }
  if (/[^ ]/.test(o)) {
    let a = 1;
    const l = t.linePos[1];
    (l == null ? void 0 : l.line) === n && l.col > i && (a = Math.max(1, Math.min(l.col - i, 80 - r)));
    const c = " ".repeat(r) + "^".repeat(a);
    t.message += `:

${o}
${c}
`;
  }
};
function fe(s, { flow: e, indicator: t, next: n, offset: i, onError: r, parentIndent: o, startOnNewline: a }) {
  let l = !1, c = a, p = a, f = "", h = "", d = !1, g = !1, u = null, m = null, y = null, b = null, S = null, k = null, N = null;
  for (const w of s)
    switch (g && (w.type !== "space" && w.type !== "newline" && w.type !== "comma" && r(w.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space"), g = !1), u && (c && w.type !== "comment" && w.type !== "newline" && r(u, "TAB_AS_INDENT", "Tabs are not allowed as indentation"), u = null), w.type) {
      case "space":
        !e && (t !== "doc-start" || (n == null ? void 0 : n.type) !== "flow-collection") && w.source.includes("	") && (u = w), p = !0;
        break;
      case "comment": {
        p || r(w, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
        const $ = w.source.substring(1) || " ";
        f ? f += h + $ : f = $, h = "", c = !1;
        break;
      }
      case "newline":
        c ? f ? f += w.source : (!k || t !== "seq-item-ind") && (l = !0) : h += w.source, c = !0, d = !0, (m || y) && (b = w), p = !0;
        break;
      case "anchor":
        m && r(w, "MULTIPLE_ANCHORS", "A node can have at most one anchor"), w.source.endsWith(":") && r(w.offset + w.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", !0), m = w, N ?? (N = w.offset), c = !1, p = !1, g = !0;
        break;
      case "tag": {
        y && r(w, "MULTIPLE_TAGS", "A node can have at most one tag"), y = w, N ?? (N = w.offset), c = !1, p = !1, g = !0;
        break;
      }
      case t:
        (m || y) && r(w, "BAD_PROP_ORDER", `Anchors and tags must be after the ${w.source} indicator`), k && r(w, "UNEXPECTED_TOKEN", `Unexpected ${w.source} in ${e ?? "collection"}`), k = w, c = t === "seq-item-ind" || t === "explicit-key-ind", p = !1;
        break;
      case "comma":
        if (e) {
          S && r(w, "UNEXPECTED_TOKEN", `Unexpected , in ${e}`), S = w, c = !1, p = !1;
          break;
        }
      default:
        r(w, "UNEXPECTED_TOKEN", `Unexpected ${w.type} token`), c = !1, p = !1;
    }
  const O = s[s.length - 1], A = O ? O.offset + O.source.length : i;
  return g && n && n.type !== "space" && n.type !== "newline" && n.type !== "comma" && (n.type !== "scalar" || n.source !== "") && r(n.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space"), u && (c && u.indent <= o || (n == null ? void 0 : n.type) === "block-map" || (n == null ? void 0 : n.type) === "block-seq") && r(u, "TAB_AS_INDENT", "Tabs are not allowed as indentation"), {
    comma: S,
    found: k,
    spaceBefore: l,
    comment: f,
    hasNewline: d,
    anchor: m,
    tag: y,
    newlineAfterProp: b,
    end: A,
    start: N ?? A
  };
}
function Ee(s) {
  if (!s)
    return null;
  switch (s.type) {
    case "alias":
    case "scalar":
    case "double-quoted-scalar":
    case "single-quoted-scalar":
      if (s.source.includes(`
`))
        return !0;
      if (s.end) {
        for (const e of s.end)
          if (e.type === "newline")
            return !0;
      }
      return !1;
    case "flow-collection":
      for (const e of s.items) {
        for (const t of e.start)
          if (t.type === "newline")
            return !0;
        if (e.sep) {
          for (const t of e.sep)
            if (t.type === "newline")
              return !0;
        }
        if (Ee(e.key) || Ee(e.value))
          return !0;
      }
      return !1;
    default:
      return !0;
  }
}
function lt(s, e, t) {
  if ((e == null ? void 0 : e.type) === "flow-collection") {
    const n = e.end[0];
    n.indent === s && (n.source === "]" || n.source === "}") && Ee(e) && t(n, "BAD_INDENT", "Flow end indicator should be more indented than parent", !0);
  }
}
function Es(s, e, t) {
  const { uniqueKeys: n } = s.options;
  if (n === !1)
    return !1;
  const i = typeof n == "function" ? n : (r, o) => r === o || T(r) && T(o) && r.value === o.value;
  return e.some((r) => i(r.key, t));
}
const Dt = "All mapping items must start at the same column";
function Cn({ composeNode: s, composeEmptyNode: e }, t, n, i, r) {
  var p;
  const o = (r == null ? void 0 : r.nodeClass) ?? j, a = new o(t.schema);
  t.atRoot && (t.atRoot = !1);
  let l = n.offset, c = null;
  for (const f of n.items) {
    const { start: h, key: d, sep: g, value: u } = f, m = fe(h, {
      indicator: "explicit-key-ind",
      next: d ?? (g == null ? void 0 : g[0]),
      offset: l,
      onError: i,
      parentIndent: n.indent,
      startOnNewline: !0
    }), y = !m.found;
    if (y) {
      if (d && (d.type === "block-seq" ? i(l, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key") : "indent" in d && d.indent !== n.indent && i(l, "BAD_INDENT", Dt)), !m.anchor && !m.tag && !g) {
        c = m.end, m.comment && (a.comment ? a.comment += `
` + m.comment : a.comment = m.comment);
        continue;
      }
      (m.newlineAfterProp || Ee(d)) && i(d ?? h[h.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
    } else ((p = m.found) == null ? void 0 : p.indent) !== n.indent && i(l, "BAD_INDENT", Dt);
    t.atKey = !0;
    const b = m.end, S = d ? s(t, d, m, i) : e(t, b, h, null, m, i);
    t.schema.compat && lt(n.indent, d, i), t.atKey = !1, Es(t, a.items, S) && i(b, "DUPLICATE_KEY", "Map keys must be unique");
    const k = fe(g ?? [], {
      indicator: "map-value-ind",
      next: u,
      offset: S.range[2],
      onError: i,
      parentIndent: n.indent,
      startOnNewline: !d || d.type === "block-scalar"
    });
    if (l = k.end, k.found) {
      y && ((u == null ? void 0 : u.type) === "block-map" && !k.hasNewline && i(l, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings"), t.options.strict && m.start < k.found.offset - 1024 && i(S.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key"));
      const N = u ? s(t, u, k, i) : e(t, l, g, null, k, i);
      t.schema.compat && lt(n.indent, u, i), l = N.range[2];
      const O = new B(S, N);
      t.options.keepSourceTokens && (O.srcToken = f), a.items.push(O);
    } else {
      y && i(S.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values"), k.comment && (S.comment ? S.comment += `
` + k.comment : S.comment = k.comment);
      const N = new B(S);
      t.options.keepSourceTokens && (N.srcToken = f), a.items.push(N);
    }
  }
  return c && c < l && i(c, "IMPOSSIBLE", "Map comment with trailing content"), a.range = [n.offset, l, c ?? l], a;
}
function _n({ composeNode: s, composeEmptyNode: e }, t, n, i, r) {
  const o = (r == null ? void 0 : r.nodeClass) ?? x, a = new o(t.schema);
  t.atRoot && (t.atRoot = !1), t.atKey && (t.atKey = !1);
  let l = n.offset, c = null;
  for (const { start: p, value: f } of n.items) {
    const h = fe(p, {
      indicator: "seq-item-ind",
      next: f,
      offset: l,
      onError: i,
      parentIndent: n.indent,
      startOnNewline: !0
    });
    if (!h.found)
      if (h.anchor || h.tag || f)
        (f == null ? void 0 : f.type) === "block-seq" ? i(h.end, "BAD_INDENT", "All sequence items must start at the same column") : i(l, "MISSING_CHAR", "Sequence item without - indicator");
      else {
        c = h.end, h.comment && (a.comment = h.comment);
        continue;
      }
    const d = f ? s(t, f, h, i) : e(t, h.end, p, null, h, i);
    t.schema.compat && lt(n.indent, f, i), l = d.range[2], a.items.push(d);
  }
  return a.range = [n.offset, l, c ?? l], a;
}
function Le(s, e, t, n) {
  let i = "";
  if (s) {
    let r = !1, o = "";
    for (const a of s) {
      const { source: l, type: c } = a;
      switch (c) {
        case "space":
          r = !0;
          break;
        case "comment": {
          t && !r && n(a, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const p = l.substring(1) || " ";
          i ? i += o + p : i = p, o = "";
          break;
        }
        case "newline":
          i && (o += l), r = !0;
          break;
        default:
          n(a, "UNEXPECTED_TOKEN", `Unexpected ${c} at node end`);
      }
      e += l.length;
    }
  }
  return { comment: i, offset: e };
}
const et = "Block collections are not allowed within flow collections", tt = (s) => s && (s.type === "block-map" || s.type === "block-seq");
function vn({ composeNode: s, composeEmptyNode: e }, t, n, i, r) {
  var m;
  const o = n.start.source === "{", a = o ? "flow map" : "flow sequence", l = (r == null ? void 0 : r.nodeClass) ?? (o ? j : x), c = new l(t.schema);
  c.flow = !0;
  const p = t.atRoot;
  p && (t.atRoot = !1), t.atKey && (t.atKey = !1);
  let f = n.offset + n.start.source.length;
  for (let y = 0; y < n.items.length; ++y) {
    const b = n.items[y], { start: S, key: k, sep: N, value: O } = b, A = fe(S, {
      flow: a,
      indicator: "explicit-key-ind",
      next: k ?? (N == null ? void 0 : N[0]),
      offset: f,
      onError: i,
      parentIndent: n.indent,
      startOnNewline: !1
    });
    if (!A.found) {
      if (!A.anchor && !A.tag && !N && !O) {
        y === 0 && A.comma ? i(A.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${a}`) : y < n.items.length - 1 && i(A.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${a}`), A.comment && (c.comment ? c.comment += `
` + A.comment : c.comment = A.comment), f = A.end;
        continue;
      }
      !o && t.options.strict && Ee(k) && i(
        k,
        // checked by containsNewline()
        "MULTILINE_IMPLICIT_KEY",
        "Implicit keys of flow sequence pairs need to be on a single line"
      );
    }
    if (y === 0)
      A.comma && i(A.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${a}`);
    else if (A.comma || i(A.start, "MISSING_CHAR", `Missing , between ${a} items`), A.comment) {
      let w = "";
      e: for (const $ of S)
        switch ($.type) {
          case "comma":
          case "space":
            break;
          case "comment":
            w = $.source.substring(1);
            break e;
          default:
            break e;
        }
      if (w) {
        let $ = c.items[c.items.length - 1];
        _($) && ($ = $.value ?? $.key), $.comment ? $.comment += `
` + w : $.comment = w, A.comment = A.comment.substring(w.length + 1);
      }
    }
    if (!o && !N && !A.found) {
      const w = O ? s(t, O, A, i) : e(t, A.end, N, null, A, i);
      c.items.push(w), f = w.range[2], tt(O) && i(w.range, "BLOCK_IN_FLOW", et);
    } else {
      t.atKey = !0;
      const w = A.end, $ = k ? s(t, k, A, i) : e(t, w, S, null, A, i);
      tt(k) && i($.range, "BLOCK_IN_FLOW", et), t.atKey = !1;
      const v = fe(N ?? [], {
        flow: a,
        indicator: "map-value-ind",
        next: O,
        offset: $.range[2],
        onError: i,
        parentIndent: n.indent,
        startOnNewline: !1
      });
      if (v.found) {
        if (!o && !A.found && t.options.strict) {
          if (N)
            for (const F of N) {
              if (F === v.found)
                break;
              if (F.type === "newline") {
                i(F, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                break;
              }
            }
          A.start < v.found.offset - 1024 && i(v.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
        }
      } else O && ("source" in O && ((m = O.source) == null ? void 0 : m[0]) === ":" ? i(O, "MISSING_CHAR", `Missing space after : in ${a}`) : i(v.start, "MISSING_CHAR", `Missing , or : between ${a} items`));
      const Y = O ? s(t, O, v, i) : v.found ? e(t, v.end, N, null, v, i) : null;
      Y ? tt(O) && i(Y.range, "BLOCK_IN_FLOW", et) : v.comment && ($.comment ? $.comment += `
` + v.comment : $.comment = v.comment);
      const R = new B($, Y);
      if (t.options.keepSourceTokens && (R.srcToken = b), o) {
        const F = c;
        Es(t, F.items, $) && i(w, "DUPLICATE_KEY", "Map keys must be unique"), F.items.push(R);
      } else {
        const F = new j(t.schema);
        F.flow = !0, F.items.push(R);
        const Lt = (Y ?? $).range;
        F.range = [$.range[0], Lt[1], Lt[2]], c.items.push(F);
      }
      f = Y ? Y.range[2] : v.end;
    }
  }
  const h = o ? "}" : "]", [d, ...g] = n.end;
  let u = f;
  if ((d == null ? void 0 : d.source) === h)
    u = d.offset + d.source.length;
  else {
    const y = a[0].toUpperCase() + a.substring(1), b = p ? `${y} must end with a ${h}` : `${y} in block collection must be sufficiently indented and end with a ${h}`;
    i(f, p ? "MISSING_CHAR" : "BAD_INDENT", b), d && d.source.length !== 1 && g.unshift(d);
  }
  if (g.length > 0) {
    const y = Le(g, u, t.options.strict, i);
    y.comment && (c.comment ? c.comment += `
` + y.comment : c.comment = y.comment), c.range = [n.offset, u, y.offset];
  } else
    c.range = [n.offset, u, u];
  return c;
}
function st(s, e, t, n, i, r) {
  const o = t.type === "block-map" ? Cn(s, e, t, n, r) : t.type === "block-seq" ? _n(s, e, t, n, r) : vn(s, e, t, n, r), a = o.constructor;
  return i === "!" || i === a.tagName ? (o.tag = a.tagName, o) : (i && (o.tag = i), o);
}
function Pn(s, e, t, n, i) {
  var h;
  const r = n.tag, o = r ? e.directives.tagName(r.source, (d) => i(r, "TAG_RESOLVE_FAILED", d)) : null;
  if (t.type === "block-seq") {
    const { anchor: d, newlineAfterProp: g } = n, u = d && r ? d.offset > r.offset ? d : r : d ?? r;
    u && (!g || g.offset < u.offset) && i(u, "MISSING_CHAR", "Missing newline after block sequence props");
  }
  const a = t.type === "block-map" ? "map" : t.type === "block-seq" ? "seq" : t.start.source === "{" ? "map" : "seq";
  if (!r || !o || o === "!" || o === j.tagName && a === "map" || o === x.tagName && a === "seq")
    return st(s, e, t, i, o);
  let l = e.schema.tags.find((d) => d.tag === o && d.collection === a);
  if (!l) {
    const d = e.schema.knownTags[o];
    if ((d == null ? void 0 : d.collection) === a)
      e.schema.tags.push(Object.assign({}, d, { default: !1 })), l = d;
    else
      return d ? i(r, "BAD_COLLECTION_TYPE", `${d.tag} used for ${a} collection, but expects ${d.collection ?? "scalar"}`, !0) : i(r, "TAG_RESOLVE_FAILED", `Unresolved tag: ${o}`, !0), st(s, e, t, i, o);
  }
  const c = st(s, e, t, i, o, l), p = ((h = l.resolve) == null ? void 0 : h.call(l, c, (d) => i(r, "TAG_RESOLVE_FAILED", d), e.options)) ?? c, f = C(p) ? p : new E(p);
  return f.range = c.range, f.tag = o, l != null && l.format && (f.format = l.format), f;
}
function Bn(s, e, t) {
  const n = e.offset, i = Mn(e, s.options.strict, t);
  if (!i)
    return { value: "", type: null, comment: "", range: [n, n, n] };
  const r = i.mode === ">" ? E.BLOCK_FOLDED : E.BLOCK_LITERAL, o = e.source ? jn(e.source) : [];
  let a = o.length;
  for (let u = o.length - 1; u >= 0; --u) {
    const m = o[u][1];
    if (m === "" || m === "\r")
      a = u;
    else
      break;
  }
  if (a === 0) {
    const u = i.chomp === "+" && o.length > 0 ? `
`.repeat(Math.max(1, o.length - 1)) : "";
    let m = n + i.length;
    return e.source && (m += e.source.length), { value: u, type: r, comment: i.comment, range: [n, m, m] };
  }
  let l = e.indent + i.indent, c = e.offset + i.length, p = 0;
  for (let u = 0; u < a; ++u) {
    const [m, y] = o[u];
    if (y === "" || y === "\r")
      i.indent === 0 && m.length > l && (l = m.length);
    else {
      m.length < l && t(c + m.length, "MISSING_CHAR", "Block scalars with more-indented leading empty lines must use an explicit indentation indicator"), i.indent === 0 && (l = m.length), p = u, l === 0 && !s.atRoot && t(c, "BAD_INDENT", "Block scalar values in collections must be indented");
      break;
    }
    c += m.length + y.length + 1;
  }
  for (let u = o.length - 1; u >= a; --u)
    o[u][0].length > l && (a = u + 1);
  let f = "", h = "", d = !1;
  for (let u = 0; u < p; ++u)
    f += o[u][0].slice(l) + `
`;
  for (let u = p; u < a; ++u) {
    let [m, y] = o[u];
    c += m.length + y.length + 1;
    const b = y[y.length - 1] === "\r";
    if (b && (y = y.slice(0, -1)), y && m.length < l) {
      const k = `Block scalar lines must not be less indented than their ${i.indent ? "explicit indentation indicator" : "first line"}`;
      t(c - y.length - (b ? 2 : 1), "BAD_INDENT", k), m = "";
    }
    r === E.BLOCK_LITERAL ? (f += h + m.slice(l) + y, h = `
`) : m.length > l || y[0] === "	" ? (h === " " ? h = `
` : !d && h === `
` && (h = `

`), f += h + m.slice(l) + y, h = `
`, d = !0) : y === "" ? h === `
` ? f += `
` : h = `
` : (f += h + y, h = " ", d = !1);
  }
  switch (i.chomp) {
    case "-":
      break;
    case "+":
      for (let u = a; u < o.length; ++u)
        f += `
` + o[u][0].slice(l);
      f[f.length - 1] !== `
` && (f += `
`);
      break;
    default:
      f += `
`;
  }
  const g = n + i.length + e.source.length;
  return { value: f, type: r, comment: i.comment, range: [n, g, g] };
}
function Mn({ offset: s, props: e }, t, n) {
  if (e[0].type !== "block-scalar-header")
    return n(e[0], "IMPOSSIBLE", "Block scalar header not found"), null;
  const { source: i } = e[0], r = i[0];
  let o = 0, a = "", l = -1;
  for (let h = 1; h < i.length; ++h) {
    const d = i[h];
    if (!a && (d === "-" || d === "+"))
      a = d;
    else {
      const g = Number(d);
      !o && g ? o = g : l === -1 && (l = s + h);
    }
  }
  l !== -1 && n(l, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${i}`);
  let c = !1, p = "", f = i.length;
  for (let h = 1; h < e.length; ++h) {
    const d = e[h];
    switch (d.type) {
      case "space":
        c = !0;
      case "newline":
        f += d.source.length;
        break;
      case "comment":
        t && !c && n(d, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters"), f += d.source.length, p = d.source.substring(1);
        break;
      case "error":
        n(d, "UNEXPECTED_TOKEN", d.message), f += d.source.length;
        break;
      default: {
        const g = `Unexpected token in block scalar header: ${d.type}`;
        n(d, "UNEXPECTED_TOKEN", g);
        const u = d.source;
        u && typeof u == "string" && (f += u.length);
      }
    }
  }
  return { mode: r, indent: o, chomp: a, comment: p, length: f };
}
function jn(s) {
  const e = s.split(/\n( *)/), t = e[0], n = t.match(/^( *)/), r = [n != null && n[1] ? [n[1], t.slice(n[1].length)] : ["", t]];
  for (let o = 1; o < e.length; o += 2)
    r.push([e[o], e[o + 1]]);
  return r;
}
function Dn(s, e, t) {
  const { offset: n, type: i, source: r, end: o } = s;
  let a, l;
  const c = (h, d, g) => t(n + h, d, g);
  switch (i) {
    case "scalar":
      a = E.PLAIN, l = Kn(r, c);
      break;
    case "single-quoted-scalar":
      a = E.QUOTE_SINGLE, l = Rn(r, c);
      break;
    case "double-quoted-scalar":
      a = E.QUOTE_DOUBLE, l = Fn(r, c);
      break;
    default:
      return t(s, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${i}`), {
        value: "",
        type: null,
        comment: "",
        range: [n, n + r.length, n + r.length]
      };
  }
  const p = n + r.length, f = Le(o, p, e, t);
  return {
    value: l,
    type: a,
    comment: f.comment,
    range: [n, p, f.offset]
  };
}
function Kn(s, e) {
  let t = "";
  switch (s[0]) {
    case "	":
      t = "a tab character";
      break;
    case ",":
      t = "flow indicator character ,";
      break;
    case "%":
      t = "directive indicator character %";
      break;
    case "|":
    case ">": {
      t = `block scalar indicator ${s[0]}`;
      break;
    }
    case "@":
    case "`": {
      t = `reserved character ${s[0]}`;
      break;
    }
  }
  return t && e(0, "BAD_SCALAR_START", `Plain value cannot start with ${t}`), Is(s);
}
function Rn(s, e) {
  return (s[s.length - 1] !== "'" || s.length === 1) && e(s.length, "MISSING_CHAR", "Missing closing 'quote"), Is(s.slice(1, -1)).replace(/''/g, "'");
}
function Is(s) {
  let e, t;
  try {
    e = new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`, "sy"), t = new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`, "sy");
  } catch {
    e = /(.*?)[ \t]*\r?\n/sy, t = /[ \t]*(.*?)[ \t]*\r?\n/sy;
  }
  let n = e.exec(s);
  if (!n)
    return s;
  let i = n[1], r = " ", o = e.lastIndex;
  for (t.lastIndex = o; n = t.exec(s); )
    n[1] === "" ? r === `
` ? i += r : r = `
` : (i += r + n[1], r = " "), o = t.lastIndex;
  const a = /[ \t]*(.*)/sy;
  return a.lastIndex = o, n = a.exec(s), i + r + ((n == null ? void 0 : n[1]) ?? "");
}
function Fn(s, e) {
  let t = "";
  for (let n = 1; n < s.length - 1; ++n) {
    const i = s[n];
    if (!(i === "\r" && s[n + 1] === `
`))
      if (i === `
`) {
        const { fold: r, offset: o } = qn(s, n);
        t += r, n = o;
      } else if (i === "\\") {
        let r = s[++n];
        const o = Un[r];
        if (o)
          t += o;
        else if (r === `
`)
          for (r = s[n + 1]; r === " " || r === "	"; )
            r = s[++n + 1];
        else if (r === "\r" && s[n + 1] === `
`)
          for (r = s[++n + 1]; r === " " || r === "	"; )
            r = s[++n + 1];
        else if (r === "x" || r === "u" || r === "U") {
          const a = r === "x" ? 2 : r === "u" ? 4 : 8;
          t += Vn(s, n + 1, a, e), n += a;
        } else {
          const a = s.substr(n - 1, 2);
          e(n - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${a}`), t += a;
        }
      } else if (i === " " || i === "	") {
        const r = n;
        let o = s[n + 1];
        for (; o === " " || o === "	"; )
          o = s[++n + 1];
        o !== `
` && !(o === "\r" && s[n + 2] === `
`) && (t += n > r ? s.slice(r, n + 1) : i);
      } else
        t += i;
  }
  return (s[s.length - 1] !== '"' || s.length === 1) && e(s.length, "MISSING_CHAR", 'Missing closing "quote'), t;
}
function qn(s, e) {
  let t = "", n = s[e + 1];
  for (; (n === " " || n === "	" || n === `
` || n === "\r") && !(n === "\r" && s[e + 2] !== `
`); )
    n === `
` && (t += `
`), e += 1, n = s[e + 1];
  return t || (t = " "), { fold: t, offset: e };
}
const Un = {
  0: "\0",
  // null character
  a: "\x07",
  // bell character
  b: "\b",
  // backspace
  e: "\x1B",
  // escape character
  f: "\f",
  // form feed
  n: `
`,
  // line feed
  r: "\r",
  // carriage return
  t: "	",
  // horizontal tab
  v: "\v",
  // vertical tab
  N: "",
  // Unicode next line
  _: " ",
  // Unicode non-breaking space
  L: "\u2028",
  // Unicode line separator
  P: "\u2029",
  // Unicode paragraph separator
  " ": " ",
  '"': '"',
  "/": "/",
  "\\": "\\",
  "	": "	"
};
function Vn(s, e, t, n) {
  const i = s.substr(e, t), o = i.length === t && /^[0-9a-fA-F]+$/.test(i) ? parseInt(i, 16) : NaN;
  try {
    return String.fromCodePoint(o);
  } catch {
    const a = s.substr(e - 2, t + 2);
    return n(e - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${a}`), a;
  }
}
function As(s, e, t, n) {
  const { value: i, type: r, comment: o, range: a } = e.type === "block-scalar" ? Bn(s, e, n) : Dn(e, s.options.strict, n), l = t ? s.directives.tagName(t.source, (f) => n(t, "TAG_RESOLVE_FAILED", f)) : null;
  let c;
  s.options.stringKeys && s.atKey ? c = s.schema[V] : l ? c = Yn(s.schema, i, l, t, n) : e.type === "scalar" ? c = Jn(s, i, e, n) : c = s.schema[V];
  let p;
  try {
    const f = c.resolve(i, (h) => n(t ?? e, "TAG_RESOLVE_FAILED", h), s.options);
    p = T(f) ? f : new E(f);
  } catch (f) {
    const h = f instanceof Error ? f.message : String(f);
    n(t ?? e, "TAG_RESOLVE_FAILED", h), p = new E(i);
  }
  return p.range = a, p.source = i, r && (p.type = r), l && (p.tag = l), c.format && (p.format = c.format), o && (p.comment = o), p;
}
function Yn(s, e, t, n, i) {
  var a;
  if (t === "!")
    return s[V];
  const r = [];
  for (const l of s.tags)
    if (!l.collection && l.tag === t)
      if (l.default && l.test)
        r.push(l);
      else
        return l;
  for (const l of r)
    if ((a = l.test) != null && a.test(e))
      return l;
  const o = s.knownTags[t];
  return o && !o.collection ? (s.tags.push(Object.assign({}, o, { default: !1, test: void 0 })), o) : (i(n, "TAG_RESOLVE_FAILED", `Unresolved tag: ${t}`, t !== "tag:yaml.org,2002:str"), s[V]);
}
function Jn({ atKey: s, directives: e, schema: t }, n, i, r) {
  const o = t.tags.find((a) => {
    var l;
    return (a.default === !0 || s && a.default === "key") && ((l = a.test) == null ? void 0 : l.test(n));
  }) || t[V];
  if (t.compat) {
    const a = t.compat.find((l) => {
      var c;
      return l.default && ((c = l.test) == null ? void 0 : c.test(n));
    }) ?? t[V];
    if (o.tag !== a.tag) {
      const l = e.tagString(o.tag), c = e.tagString(a.tag), p = `Value may be parsed as either ${l} or ${c}`;
      r(i, "TAG_RESOLVE_FAILED", p, !0);
    }
  }
  return o;
}
function Gn(s, e, t) {
  if (e) {
    t ?? (t = e.length);
    for (let n = t - 1; n >= 0; --n) {
      let i = e[n];
      switch (i.type) {
        case "space":
        case "comment":
        case "newline":
          s -= i.source.length;
          continue;
      }
      for (i = e[++n]; (i == null ? void 0 : i.type) === "space"; )
        s += i.source.length, i = e[++n];
      break;
    }
  }
  return s;
}
const Hn = { composeNode: Os, composeEmptyNode: $t };
function Os(s, e, t, n) {
  const i = s.atKey, { spaceBefore: r, comment: o, anchor: a, tag: l } = t;
  let c, p = !0;
  switch (e.type) {
    case "alias":
      c = Wn(s, e, n), (a || l) && n(e, "ALIAS_PROPS", "An alias node must not specify any properties");
      break;
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "block-scalar":
      c = As(s, e, l, n), a && (c.anchor = a.source.substring(1));
      break;
    case "block-map":
    case "block-seq":
    case "flow-collection":
      try {
        c = Pn(Hn, s, e, t, n), a && (c.anchor = a.source.substring(1));
      } catch (f) {
        const h = f instanceof Error ? f.message : String(f);
        n(e, "RESOURCE_EXHAUSTION", h);
      }
      break;
    default: {
      const f = e.type === "error" ? e.message : `Unsupported token (type: ${e.type})`;
      n(e, "UNEXPECTED_TOKEN", f), p = !1;
    }
  }
  return c ?? (c = $t(s, e.offset, void 0, null, t, n)), a && c.anchor === "" && n(a, "BAD_ALIAS", "Anchor cannot be an empty string"), i && s.options.stringKeys && (!T(c) || typeof c.value != "string" || c.tag && c.tag !== "tag:yaml.org,2002:str") && n(l ?? e, "NON_STRING_KEY", "With stringKeys, all keys must be strings"), r && (c.spaceBefore = !0), o && (e.type === "scalar" && e.source === "" ? c.comment = o : c.commentBefore = o), s.options.keepSourceTokens && p && (c.srcToken = e), c;
}
function $t(s, e, t, n, { spaceBefore: i, comment: r, anchor: o, tag: a, end: l }, c) {
  const p = {
    type: "scalar",
    offset: Gn(e, t, n),
    indent: -1,
    source: ""
  }, f = As(s, p, a, c);
  return o && (f.anchor = o.source.substring(1), f.anchor === "" && c(o, "BAD_ALIAS", "Anchor cannot be an empty string")), i && (f.spaceBefore = !0), r && (f.comment = r, f.range[2] = l), f;
}
function Wn({ options: s }, { offset: e, source: t, end: n }, i) {
  const r = new mt(t.substring(1));
  r.source === "" && i(e, "BAD_ALIAS", "Alias cannot be an empty string"), r.source.endsWith(":") && i(e + t.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", !0);
  const o = e + t.length, a = Le(n, o, s.strict, i);
  return r.range = [e, o, a.offset], a.comment && (r.comment = a.comment), r;
}
function Qn(s, e, { offset: t, start: n, value: i, end: r }, o) {
  const a = Object.assign({ _directives: e }, s), l = new Te(void 0, a), c = {
    atKey: !1,
    atRoot: !0,
    directives: l.directives,
    options: l.options,
    schema: l.schema
  }, p = fe(n, {
    indicator: "doc-start",
    next: i ?? (r == null ? void 0 : r[0]),
    offset: t,
    onError: o,
    parentIndent: 0,
    startOnNewline: !0
  });
  p.found && (l.directives.docStart = !0, i && (i.type === "block-map" || i.type === "block-seq") && !p.hasNewline && o(p.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker")), l.contents = i ? Os(c, i, p, o) : $t(c, p.end, n, null, p, o);
  const f = l.contents.range[2], h = Le(r, f, !1, o);
  return h.comment && (l.comment = h.comment), l.range = [t, f, h.offset], l;
}
function ye(s) {
  if (typeof s == "number")
    return [s, s + 1];
  if (Array.isArray(s))
    return s.length === 2 ? s : [s[0], s[1]];
  const { offset: e, source: t } = s;
  return [e, e + (typeof t == "string" ? t.length : 1)];
}
function Kt(s) {
  var i;
  let e = "", t = !1, n = !1;
  for (let r = 0; r < s.length; ++r) {
    const o = s[r];
    switch (o[0]) {
      case "#":
        e += (e === "" ? "" : n ? `

` : `
`) + (o.substring(1) || " "), t = !0, n = !1;
        break;
      case "%":
        ((i = s[r + 1]) == null ? void 0 : i[0]) !== "#" && (r += 1), t = !1;
        break;
      default:
        t || (n = !0), t = !1;
    }
  }
  return { comment: e, afterEmptyLine: n };
}
class Xn {
  constructor(e = {}) {
    this.doc = null, this.atDirectives = !1, this.prelude = [], this.errors = [], this.warnings = [], this.onError = (t, n, i, r) => {
      const o = ye(t);
      r ? this.warnings.push(new Ln(o, n, i)) : this.errors.push(new we(o, n, i));
    }, this.directives = new P({ version: e.version || "1.2" }), this.options = e;
  }
  decorate(e, t) {
    const { comment: n, afterEmptyLine: i } = Kt(this.prelude);
    if (n) {
      const r = e.contents;
      if (t)
        e.comment = e.comment ? `${e.comment}
${n}` : n;
      else if (i || e.directives.docStart || !r)
        e.commentBefore = n;
      else if (L(r) && !r.flow && r.items.length > 0) {
        let o = r.items[0];
        _(o) && (o = o.key);
        const a = o.commentBefore;
        o.commentBefore = a ? `${n}
${a}` : n;
      } else {
        const o = r.commentBefore;
        r.commentBefore = o ? `${n}
${o}` : n;
      }
    }
    if (t) {
      for (let r = 0; r < this.errors.length; ++r)
        e.errors.push(this.errors[r]);
      for (let r = 0; r < this.warnings.length; ++r)
        e.warnings.push(this.warnings[r]);
    } else
      e.errors = this.errors, e.warnings = this.warnings;
    this.prelude = [], this.errors = [], this.warnings = [];
  }
  /**
   * Current stream status information.
   *
   * Mostly useful at the end of input for an empty stream.
   */
  streamInfo() {
    return {
      comment: Kt(this.prelude).comment,
      directives: this.directives,
      errors: this.errors,
      warnings: this.warnings
    };
  }
  /**
   * Compose tokens into documents.
   *
   * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
   * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
   */
  *compose(e, t = !1, n = -1) {
    for (const i of e)
      yield* this.next(i);
    yield* this.end(t, n);
  }
  /** Advance the composer by one CST token. */
  *next(e) {
    switch (e.type) {
      case "directive":
        this.directives.add(e.source, (t, n, i) => {
          const r = ye(e);
          r[0] += t, this.onError(r, "BAD_DIRECTIVE", n, i);
        }), this.prelude.push(e.source), this.atDirectives = !0;
        break;
      case "document": {
        const t = Qn(this.options, this.directives, e, this.onError);
        this.atDirectives && !t.directives.docStart && this.onError(e, "MISSING_CHAR", "Missing directives-end/doc-start indicator line"), this.decorate(t, !1), this.doc && (yield this.doc), this.doc = t, this.atDirectives = !1;
        break;
      }
      case "byte-order-mark":
      case "space":
        break;
      case "comment":
      case "newline":
        this.prelude.push(e.source);
        break;
      case "error": {
        const t = e.source ? `${e.message}: ${JSON.stringify(e.source)}` : e.message, n = new we(ye(e), "UNEXPECTED_TOKEN", t);
        this.atDirectives || !this.doc ? this.errors.push(n) : this.doc.errors.push(n);
        break;
      }
      case "doc-end": {
        if (!this.doc) {
          const n = "Unexpected doc-end without preceding document";
          this.errors.push(new we(ye(e), "UNEXPECTED_TOKEN", n));
          break;
        }
        this.doc.directives.docEnd = !0;
        const t = Le(e.end, e.offset + e.source.length, this.doc.options.strict, this.onError);
        if (this.decorate(this.doc, !0), t.comment) {
          const n = this.doc.comment;
          this.doc.comment = n ? `${n}
${t.comment}` : t.comment;
        }
        this.doc.range[2] = t.offset;
        break;
      }
      default:
        this.errors.push(new we(ye(e), "UNEXPECTED_TOKEN", `Unsupported token ${e.type}`));
    }
  }
  /**
   * Call at end of input to yield any remaining document.
   *
   * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
   * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
   */
  *end(e = !1, t = -1) {
    if (this.doc)
      this.decorate(this.doc, !0), yield this.doc, this.doc = null;
    else if (e) {
      const n = Object.assign({ _directives: this.directives }, this.options), i = new Te(void 0, n);
      this.atDirectives && this.onError(t, "MISSING_CHAR", "Missing directives-end indicator line"), i.range = [0, t, t], this.decorate(i, !1), yield i;
    }
  }
}
const $s = "\uFEFF", Ts = "", Ls = "", ct = "";
function zn(s) {
  switch (s) {
    case $s:
      return "byte-order-mark";
    case Ts:
      return "doc-mode";
    case Ls:
      return "flow-error-end";
    case ct:
      return "scalar";
    case "---":
      return "doc-start";
    case "...":
      return "doc-end";
    case "":
    case `
`:
    case `\r
`:
      return "newline";
    case "-":
      return "seq-item-ind";
    case "?":
      return "explicit-key-ind";
    case ":":
      return "map-value-ind";
    case "{":
      return "flow-map-start";
    case "}":
      return "flow-map-end";
    case "[":
      return "flow-seq-start";
    case "]":
      return "flow-seq-end";
    case ",":
      return "comma";
  }
  switch (s[0]) {
    case " ":
    case "	":
      return "space";
    case "#":
      return "comment";
    case "%":
      return "directive-line";
    case "*":
      return "alias";
    case "&":
      return "anchor";
    case "!":
      return "tag";
    case "'":
      return "single-quoted-scalar";
    case '"':
      return "double-quoted-scalar";
    case "|":
    case ">":
      return "block-scalar-header";
  }
  return null;
}
function q(s) {
  switch (s) {
    case void 0:
    case " ":
    case `
`:
    case "\r":
    case "	":
      return !0;
    default:
      return !1;
  }
}
const Rt = new Set("0123456789ABCDEFabcdef"), Zn = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()"), Pe = new Set(",[]{}"), xn = new Set(` ,[]{}
\r	`), nt = (s) => !s || xn.has(s);
class ei {
  constructor() {
    this.atEnd = !1, this.blockScalarIndent = -1, this.blockScalarKeep = !1, this.buffer = "", this.flowKey = !1, this.flowLevel = 0, this.indentNext = 0, this.indentValue = 0, this.lineEndPos = null, this.next = null, this.pos = 0;
  }
  /**
   * Generate YAML tokens from the `source` string. If `incomplete`,
   * a part of the last line may be left as a buffer for the next call.
   *
   * @returns A generator of lexical tokens
   */
  *lex(e, t = !1) {
    if (e) {
      if (typeof e != "string")
        throw TypeError("source is not a string");
      this.buffer = this.buffer ? this.buffer + e : e, this.lineEndPos = null;
    }
    this.atEnd = !t;
    let n = this.next ?? "stream";
    for (; n && (t || this.hasChars(1)); )
      n = yield* this.parseNext(n);
  }
  atLineEnd() {
    let e = this.pos, t = this.buffer[e];
    for (; t === " " || t === "	"; )
      t = this.buffer[++e];
    return !t || t === "#" || t === `
` ? !0 : t === "\r" ? this.buffer[e + 1] === `
` : !1;
  }
  charAt(e) {
    return this.buffer[this.pos + e];
  }
  continueScalar(e) {
    let t = this.buffer[e];
    if (this.indentNext > 0) {
      let n = 0;
      for (; t === " "; )
        t = this.buffer[++n + e];
      if (t === "\r") {
        const i = this.buffer[n + e + 1];
        if (i === `
` || !i && !this.atEnd)
          return e + n + 1;
      }
      return t === `
` || n >= this.indentNext || !t && !this.atEnd ? e + n : -1;
    }
    if (t === "-" || t === ".") {
      const n = this.buffer.substr(e, 3);
      if ((n === "---" || n === "...") && q(this.buffer[e + 3]))
        return -1;
    }
    return e;
  }
  getLine() {
    let e = this.lineEndPos;
    return (typeof e != "number" || e !== -1 && e < this.pos) && (e = this.buffer.indexOf(`
`, this.pos), this.lineEndPos = e), e === -1 ? this.atEnd ? this.buffer.substring(this.pos) : null : (this.buffer[e - 1] === "\r" && (e -= 1), this.buffer.substring(this.pos, e));
  }
  hasChars(e) {
    return this.pos + e <= this.buffer.length;
  }
  setNext(e) {
    return this.buffer = this.buffer.substring(this.pos), this.pos = 0, this.lineEndPos = null, this.next = e, null;
  }
  peek(e) {
    return this.buffer.substr(this.pos, e);
  }
  *parseNext(e) {
    switch (e) {
      case "stream":
        return yield* this.parseStream();
      case "line-start":
        return yield* this.parseLineStart();
      case "block-start":
        return yield* this.parseBlockStart();
      case "doc":
        return yield* this.parseDocument();
      case "flow":
        return yield* this.parseFlowCollection();
      case "quoted-scalar":
        return yield* this.parseQuotedScalar();
      case "block-scalar":
        return yield* this.parseBlockScalar();
      case "plain-scalar":
        return yield* this.parsePlainScalar();
    }
  }
  *parseStream() {
    let e = this.getLine();
    if (e === null)
      return this.setNext("stream");
    if (e[0] === $s && (yield* this.pushCount(1), e = e.substring(1)), e[0] === "%") {
      let t = e.length, n = e.indexOf("#");
      for (; n !== -1; ) {
        const r = e[n - 1];
        if (r === " " || r === "	") {
          t = n - 1;
          break;
        } else
          n = e.indexOf("#", n + 1);
      }
      for (; ; ) {
        const r = e[t - 1];
        if (r === " " || r === "	")
          t -= 1;
        else
          break;
      }
      const i = (yield* this.pushCount(t)) + (yield* this.pushSpaces(!0));
      return yield* this.pushCount(e.length - i), this.pushNewline(), "stream";
    }
    if (this.atLineEnd()) {
      const t = yield* this.pushSpaces(!0);
      return yield* this.pushCount(e.length - t), yield* this.pushNewline(), "stream";
    }
    return yield Ts, yield* this.parseLineStart();
  }
  *parseLineStart() {
    const e = this.charAt(0);
    if (!e && !this.atEnd)
      return this.setNext("line-start");
    if (e === "-" || e === ".") {
      if (!this.atEnd && !this.hasChars(4))
        return this.setNext("line-start");
      const t = this.peek(3);
      if ((t === "---" || t === "...") && q(this.charAt(3)))
        return yield* this.pushCount(3), this.indentValue = 0, this.indentNext = 0, t === "---" ? "doc" : "stream";
    }
    return this.indentValue = yield* this.pushSpaces(!1), this.indentNext > this.indentValue && !q(this.charAt(1)) && (this.indentNext = this.indentValue), yield* this.parseBlockStart();
  }
  *parseBlockStart() {
    const [e, t] = this.peek(2);
    if (!t && !this.atEnd)
      return this.setNext("block-start");
    if ((e === "-" || e === "?" || e === ":") && q(t)) {
      const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0));
      return this.indentNext = this.indentValue + 1, this.indentValue += n, "block-start";
    }
    return "doc";
  }
  *parseDocument() {
    yield* this.pushSpaces(!0);
    const e = this.getLine();
    if (e === null)
      return this.setNext("doc");
    let t = yield* this.pushIndicators();
    switch (e[t]) {
      case "#":
        yield* this.pushCount(e.length - t);
      case void 0:
        return yield* this.pushNewline(), yield* this.parseLineStart();
      case "{":
      case "[":
        return yield* this.pushCount(1), this.flowKey = !1, this.flowLevel = 1, "flow";
      case "}":
      case "]":
        return yield* this.pushCount(1), "doc";
      case "*":
        return yield* this.pushUntil(nt), "doc";
      case '"':
      case "'":
        return yield* this.parseQuotedScalar();
      case "|":
      case ">":
        return t += yield* this.parseBlockScalarHeader(), t += yield* this.pushSpaces(!0), yield* this.pushCount(e.length - t), yield* this.pushNewline(), yield* this.parseBlockScalar();
      default:
        return yield* this.parsePlainScalar();
    }
  }
  *parseFlowCollection() {
    let e, t, n = -1;
    do
      e = yield* this.pushNewline(), e > 0 ? (t = yield* this.pushSpaces(!1), this.indentValue = n = t) : t = 0, t += yield* this.pushSpaces(!0);
    while (e + t > 0);
    const i = this.getLine();
    if (i === null)
      return this.setNext("flow");
    if ((n !== -1 && n < this.indentNext && i[0] !== "#" || n === 0 && (i.startsWith("---") || i.startsWith("...")) && q(i[3])) && !(n === this.indentNext - 1 && this.flowLevel === 1 && (i[0] === "]" || i[0] === "}")))
      return this.flowLevel = 0, yield Ls, yield* this.parseLineStart();
    let r = 0;
    for (; i[r] === ","; )
      r += yield* this.pushCount(1), r += yield* this.pushSpaces(!0), this.flowKey = !1;
    switch (r += yield* this.pushIndicators(), i[r]) {
      case void 0:
        return "flow";
      case "#":
        return yield* this.pushCount(i.length - r), "flow";
      case "{":
      case "[":
        return yield* this.pushCount(1), this.flowKey = !1, this.flowLevel += 1, "flow";
      case "}":
      case "]":
        return yield* this.pushCount(1), this.flowKey = !0, this.flowLevel -= 1, this.flowLevel ? "flow" : "doc";
      case "*":
        return yield* this.pushUntil(nt), "flow";
      case '"':
      case "'":
        return this.flowKey = !0, yield* this.parseQuotedScalar();
      case ":": {
        const o = this.charAt(1);
        if (this.flowKey || q(o) || o === ",")
          return this.flowKey = !1, yield* this.pushCount(1), yield* this.pushSpaces(!0), "flow";
      }
      default:
        return this.flowKey = !1, yield* this.parsePlainScalar();
    }
  }
  *parseQuotedScalar() {
    const e = this.charAt(0);
    let t = this.buffer.indexOf(e, this.pos + 1);
    if (e === "'")
      for (; t !== -1 && this.buffer[t + 1] === "'"; )
        t = this.buffer.indexOf("'", t + 2);
    else
      for (; t !== -1; ) {
        let r = 0;
        for (; this.buffer[t - 1 - r] === "\\"; )
          r += 1;
        if (r % 2 === 0)
          break;
        t = this.buffer.indexOf('"', t + 1);
      }
    const n = this.buffer.substring(0, t);
    let i = n.indexOf(`
`, this.pos);
    if (i !== -1) {
      for (; i !== -1; ) {
        const r = this.continueScalar(i + 1);
        if (r === -1)
          break;
        i = n.indexOf(`
`, r);
      }
      i !== -1 && (t = i - (n[i - 1] === "\r" ? 2 : 1));
    }
    if (t === -1) {
      if (!this.atEnd)
        return this.setNext("quoted-scalar");
      t = this.buffer.length;
    }
    return yield* this.pushToIndex(t + 1, !1), this.flowLevel ? "flow" : "doc";
  }
  *parseBlockScalarHeader() {
    this.blockScalarIndent = -1, this.blockScalarKeep = !1;
    let e = this.pos;
    for (; ; ) {
      const t = this.buffer[++e];
      if (t === "+")
        this.blockScalarKeep = !0;
      else if (t > "0" && t <= "9")
        this.blockScalarIndent = Number(t) - 1;
      else if (t !== "-")
        break;
    }
    return yield* this.pushUntil((t) => q(t) || t === "#");
  }
  *parseBlockScalar() {
    let e = this.pos - 1, t = 0, n;
    e: for (let r = this.pos; n = this.buffer[r]; ++r)
      switch (n) {
        case " ":
          t += 1;
          break;
        case `
`:
          e = r, t = 0;
          break;
        case "\r": {
          const o = this.buffer[r + 1];
          if (!o && !this.atEnd)
            return this.setNext("block-scalar");
          if (o === `
`)
            break;
        }
        default:
          break e;
      }
    if (!n && !this.atEnd)
      return this.setNext("block-scalar");
    if (t >= this.indentNext) {
      this.blockScalarIndent === -1 ? this.indentNext = t : this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
      do {
        const r = this.continueScalar(e + 1);
        if (r === -1)
          break;
        e = this.buffer.indexOf(`
`, r);
      } while (e !== -1);
      if (e === -1) {
        if (!this.atEnd)
          return this.setNext("block-scalar");
        e = this.buffer.length;
      }
    }
    let i = e + 1;
    for (n = this.buffer[i]; n === " "; )
      n = this.buffer[++i];
    if (n === "	") {
      for (; n === "	" || n === " " || n === "\r" || n === `
`; )
        n = this.buffer[++i];
      e = i - 1;
    } else if (!this.blockScalarKeep)
      do {
        let r = e - 1, o = this.buffer[r];
        o === "\r" && (o = this.buffer[--r]);
        const a = r;
        for (; o === " "; )
          o = this.buffer[--r];
        if (o === `
` && r >= this.pos && r + 1 + t > a)
          e = r;
        else
          break;
      } while (!0);
    return yield ct, yield* this.pushToIndex(e + 1, !0), yield* this.parseLineStart();
  }
  *parsePlainScalar() {
    const e = this.flowLevel > 0;
    let t = this.pos - 1, n = this.pos - 1, i;
    for (; i = this.buffer[++n]; )
      if (i === ":") {
        const r = this.buffer[n + 1];
        if (q(r) || e && Pe.has(r))
          break;
        t = n;
      } else if (q(i)) {
        let r = this.buffer[n + 1];
        if (i === "\r" && (r === `
` ? (n += 1, i = `
`, r = this.buffer[n + 1]) : t = n), r === "#" || e && Pe.has(r))
          break;
        if (i === `
`) {
          const o = this.continueScalar(n + 1);
          if (o === -1)
            break;
          n = Math.max(n, o - 2);
        }
      } else {
        if (e && Pe.has(i))
          break;
        t = n;
      }
    return !i && !this.atEnd ? this.setNext("plain-scalar") : (yield ct, yield* this.pushToIndex(t + 1, !0), e ? "flow" : "doc");
  }
  *pushCount(e) {
    return e > 0 ? (yield this.buffer.substr(this.pos, e), this.pos += e, e) : 0;
  }
  *pushToIndex(e, t) {
    const n = this.buffer.slice(this.pos, e);
    return n ? (yield n, this.pos += n.length, n.length) : (t && (yield ""), 0);
  }
  *pushIndicators() {
    let e = 0;
    e: for (; ; ) {
      switch (this.charAt(0)) {
        case "!":
          e += yield* this.pushTag(), e += yield* this.pushSpaces(!0);
          continue e;
        case "&":
          e += yield* this.pushUntil(nt), e += yield* this.pushSpaces(!0);
          continue e;
        case "-":
        case "?":
        case ":": {
          const t = this.flowLevel > 0, n = this.charAt(1);
          if (q(n) || t && Pe.has(n)) {
            t ? this.flowKey && (this.flowKey = !1) : this.indentNext = this.indentValue + 1, e += yield* this.pushCount(1), e += yield* this.pushSpaces(!0);
            continue e;
          }
        }
      }
      break e;
    }
    return e;
  }
  *pushTag() {
    if (this.charAt(1) === "<") {
      let e = this.pos + 2, t = this.buffer[e];
      for (; !q(t) && t !== ">"; )
        t = this.buffer[++e];
      return yield* this.pushToIndex(t === ">" ? e + 1 : e, !1);
    } else {
      let e = this.pos + 1, t = this.buffer[e];
      for (; t; )
        if (Zn.has(t))
          t = this.buffer[++e];
        else if (t === "%" && Rt.has(this.buffer[e + 1]) && Rt.has(this.buffer[e + 2]))
          t = this.buffer[e += 3];
        else
          break;
      return yield* this.pushToIndex(e, !1);
    }
  }
  *pushNewline() {
    const e = this.buffer[this.pos];
    return e === `
` ? yield* this.pushCount(1) : e === "\r" && this.charAt(1) === `
` ? yield* this.pushCount(2) : 0;
  }
  *pushSpaces(e) {
    let t = this.pos - 1, n;
    do
      n = this.buffer[++t];
    while (n === " " || e && n === "	");
    const i = t - this.pos;
    return i > 0 && (yield this.buffer.substr(this.pos, i), this.pos = t), i;
  }
  *pushUntil(e) {
    let t = this.pos, n = this.buffer[t];
    for (; !e(n); )
      n = this.buffer[++t];
    return yield* this.pushToIndex(t, !1);
  }
}
class ti {
  constructor() {
    this.lineStarts = [], this.addNewLine = (e) => this.lineStarts.push(e), this.linePos = (e) => {
      let t = 0, n = this.lineStarts.length;
      for (; t < n; ) {
        const r = t + n >> 1;
        this.lineStarts[r] < e ? t = r + 1 : n = r;
      }
      if (this.lineStarts[t] === e)
        return { line: t + 1, col: 1 };
      if (t === 0)
        return { line: 0, col: e };
      const i = this.lineStarts[t - 1];
      return { line: t, col: e - i + 1 };
    };
  }
}
function H(s, e) {
  for (let t = 0; t < s.length; ++t)
    if (s[t].type === e)
      return !0;
  return !1;
}
function Ft(s) {
  for (let e = 0; e < s.length; ++e)
    switch (s[e].type) {
      case "space":
      case "comment":
      case "newline":
        break;
      default:
        return e;
    }
  return -1;
}
function Cs(s) {
  switch (s == null ? void 0 : s.type) {
    case "alias":
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "flow-collection":
      return !0;
    default:
      return !1;
  }
}
function Be(s) {
  switch (s.type) {
    case "document":
      return s.start;
    case "block-map": {
      const e = s.items[s.items.length - 1];
      return e.sep ?? e.start;
    }
    case "block-seq":
      return s.items[s.items.length - 1].start;
    default:
      return [];
  }
}
function te(s) {
  var t;
  if (s.length === 0)
    return [];
  let e = s.length;
  e: for (; --e >= 0; )
    switch (s[e].type) {
      case "doc-start":
      case "explicit-key-ind":
      case "map-value-ind":
      case "seq-item-ind":
      case "newline":
        break e;
    }
  for (; ((t = s[++e]) == null ? void 0 : t.type) === "space"; )
    ;
  return s.splice(e, s.length);
}
function qe(s, e) {
  if (e.length < 1e5)
    Array.prototype.push.apply(s, e);
  else
    for (let t = 0; t < e.length; ++t)
      s.push(e[t]);
}
function qt(s) {
  if (s.start.type === "flow-seq-start")
    for (const e of s.items)
      e.sep && !e.value && !H(e.start, "explicit-key-ind") && !H(e.sep, "map-value-ind") && (e.key && (e.value = e.key), delete e.key, Cs(e.value) ? e.value.end ? qe(e.value.end, e.sep) : e.value.end = e.sep : qe(e.start, e.sep), delete e.sep);
}
class si {
  /**
   * @param onNewLine - If defined, called separately with the start position of
   *   each new line (in `parse()`, including the start of input).
   */
  constructor(e) {
    this.atNewLine = !0, this.atScalar = !1, this.indent = 0, this.offset = 0, this.onKeyLine = !1, this.stack = [], this.source = "", this.type = "", this.lexer = new ei(), this.onNewLine = e;
  }
  /**
   * Parse `source` as a YAML stream.
   * If `incomplete`, a part of the last line may be left as a buffer for the next call.
   *
   * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
   *
   * @returns A generator of tokens representing each directive, document, and other structure.
   */
  *parse(e, t = !1) {
    this.onNewLine && this.offset === 0 && this.onNewLine(0);
    for (const n of this.lexer.lex(e, t))
      yield* this.next(n);
    t || (yield* this.end());
  }
  /**
   * Advance the parser by the `source` of one lexical token.
   */
  *next(e) {
    if (this.source = e, this.atScalar) {
      this.atScalar = !1, yield* this.step(), this.offset += e.length;
      return;
    }
    const t = zn(e);
    if (t)
      if (t === "scalar")
        this.atNewLine = !1, this.atScalar = !0, this.type = "scalar";
      else {
        switch (this.type = t, yield* this.step(), t) {
          case "newline":
            this.atNewLine = !0, this.indent = 0, this.onNewLine && this.onNewLine(this.offset + e.length);
            break;
          case "space":
            this.atNewLine && e[0] === " " && (this.indent += e.length);
            break;
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
            this.atNewLine && (this.indent += e.length);
            break;
          case "doc-mode":
          case "flow-error-end":
            return;
          default:
            this.atNewLine = !1;
        }
        this.offset += e.length;
      }
    else {
      const n = `Not a YAML token: ${e}`;
      yield* this.pop({ type: "error", offset: this.offset, message: n, source: e }), this.offset += e.length;
    }
  }
  /** Call at end of input to push out any remaining constructions */
  *end() {
    for (; this.stack.length > 0; )
      yield* this.pop();
  }
  get sourceToken() {
    return {
      type: this.type,
      offset: this.offset,
      indent: this.indent,
      source: this.source
    };
  }
  *step() {
    const e = this.peek(1);
    if (this.type === "doc-end" && (e == null ? void 0 : e.type) !== "doc-end") {
      for (; this.stack.length > 0; )
        yield* this.pop();
      this.stack.push({
        type: "doc-end",
        offset: this.offset,
        source: this.source
      });
      return;
    }
    if (!e)
      return yield* this.stream();
    switch (e.type) {
      case "document":
        return yield* this.document(e);
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return yield* this.scalar(e);
      case "block-scalar":
        return yield* this.blockScalar(e);
      case "block-map":
        return yield* this.blockMap(e);
      case "block-seq":
        return yield* this.blockSequence(e);
      case "flow-collection":
        return yield* this.flowCollection(e);
      case "doc-end":
        return yield* this.documentEnd(e);
    }
    yield* this.pop();
  }
  peek(e) {
    return this.stack[this.stack.length - e];
  }
  *pop(e) {
    const t = e ?? this.stack.pop();
    if (!t)
      yield { type: "error", offset: this.offset, source: "", message: "Tried to pop an empty stack" };
    else if (this.stack.length === 0)
      yield t;
    else {
      const n = this.peek(1);
      switch (t.type === "block-scalar" ? t.indent = "indent" in n ? n.indent : 0 : t.type === "flow-collection" && n.type === "document" && (t.indent = 0), t.type === "flow-collection" && qt(t), n.type) {
        case "document":
          n.value = t;
          break;
        case "block-scalar":
          n.props.push(t);
          break;
        case "block-map": {
          const i = n.items[n.items.length - 1];
          if (i.value) {
            n.items.push({ start: [], key: t, sep: [] }), this.onKeyLine = !0;
            return;
          } else if (i.sep)
            i.value = t;
          else {
            Object.assign(i, { key: t, sep: [] }), this.onKeyLine = !i.explicitKey;
            return;
          }
          break;
        }
        case "block-seq": {
          const i = n.items[n.items.length - 1];
          i.value ? n.items.push({ start: [], value: t }) : i.value = t;
          break;
        }
        case "flow-collection": {
          const i = n.items[n.items.length - 1];
          !i || i.value ? n.items.push({ start: [], key: t, sep: [] }) : i.sep ? i.value = t : Object.assign(i, { key: t, sep: [] });
          return;
        }
        default:
          yield* this.pop(), yield* this.pop(t);
      }
      if ((n.type === "document" || n.type === "block-map" || n.type === "block-seq") && (t.type === "block-map" || t.type === "block-seq")) {
        const i = t.items[t.items.length - 1];
        i && !i.sep && !i.value && i.start.length > 0 && Ft(i.start) === -1 && (t.indent === 0 || i.start.every((r) => r.type !== "comment" || r.indent < t.indent)) && (n.type === "document" ? n.end = i.start : n.items.push({ start: i.start }), t.items.splice(-1, 1));
      }
    }
  }
  *stream() {
    switch (this.type) {
      case "directive-line":
        yield { type: "directive", offset: this.offset, source: this.source };
        return;
      case "byte-order-mark":
      case "space":
      case "comment":
      case "newline":
        yield this.sourceToken;
        return;
      case "doc-mode":
      case "doc-start": {
        const e = {
          type: "document",
          offset: this.offset,
          start: []
        };
        this.type === "doc-start" && e.start.push(this.sourceToken), this.stack.push(e);
        return;
      }
    }
    yield {
      type: "error",
      offset: this.offset,
      message: `Unexpected ${this.type} token in YAML stream`,
      source: this.source
    };
  }
  *document(e) {
    if (e.value)
      return yield* this.lineEnd(e);
    switch (this.type) {
      case "doc-start": {
        Ft(e.start) !== -1 ? (yield* this.pop(), yield* this.step()) : e.start.push(this.sourceToken);
        return;
      }
      case "anchor":
      case "tag":
      case "space":
      case "comment":
      case "newline":
        e.start.push(this.sourceToken);
        return;
    }
    const t = this.startBlockValue(e);
    t ? this.stack.push(t) : yield {
      type: "error",
      offset: this.offset,
      message: `Unexpected ${this.type} token in YAML document`,
      source: this.source
    };
  }
  *scalar(e) {
    if (this.type === "map-value-ind") {
      const t = Be(this.peek(2)), n = te(t);
      let i;
      e.end ? (i = e.end, i.push(this.sourceToken), delete e.end) : i = [this.sourceToken];
      const r = {
        type: "block-map",
        offset: e.offset,
        indent: e.indent,
        items: [{ start: n, key: e, sep: i }]
      };
      this.onKeyLine = !0, this.stack[this.stack.length - 1] = r;
    } else
      yield* this.lineEnd(e);
  }
  *blockScalar(e) {
    switch (this.type) {
      case "space":
      case "comment":
      case "newline":
        e.props.push(this.sourceToken);
        return;
      case "scalar":
        if (e.source = this.source, this.atNewLine = !0, this.indent = 0, this.onNewLine) {
          let t = this.source.indexOf(`
`) + 1;
          for (; t !== 0; )
            this.onNewLine(this.offset + t), t = this.source.indexOf(`
`, t) + 1;
        }
        yield* this.pop();
        break;
      default:
        yield* this.pop(), yield* this.step();
    }
  }
  *blockMap(e) {
    var n;
    const t = e.items[e.items.length - 1];
    switch (this.type) {
      case "newline":
        if (this.onKeyLine = !1, t.value) {
          const i = "end" in t.value ? t.value.end : void 0, r = Array.isArray(i) ? i[i.length - 1] : void 0;
          (r == null ? void 0 : r.type) === "comment" ? i == null || i.push(this.sourceToken) : e.items.push({ start: [this.sourceToken] });
        } else t.sep ? t.sep.push(this.sourceToken) : t.start.push(this.sourceToken);
        return;
      case "space":
      case "comment":
        if (t.value)
          e.items.push({ start: [this.sourceToken] });
        else if (t.sep)
          t.sep.push(this.sourceToken);
        else {
          if (this.atIndentedComment(t.start, e.indent)) {
            const i = e.items[e.items.length - 2], r = (n = i == null ? void 0 : i.value) == null ? void 0 : n.end;
            if (Array.isArray(r)) {
              qe(r, t.start), r.push(this.sourceToken), e.items.pop();
              return;
            }
          }
          t.start.push(this.sourceToken);
        }
        return;
    }
    if (this.indent >= e.indent) {
      const i = !this.onKeyLine && this.indent === e.indent, r = i && (t.sep || t.explicitKey) && this.type !== "seq-item-ind";
      let o = [];
      if (r && t.sep && !t.value) {
        const a = [];
        for (let l = 0; l < t.sep.length; ++l) {
          const c = t.sep[l];
          switch (c.type) {
            case "newline":
              a.push(l);
              break;
            case "space":
              break;
            case "comment":
              c.indent > e.indent && (a.length = 0);
              break;
            default:
              a.length = 0;
          }
        }
        a.length >= 2 && (o = t.sep.splice(a[1]));
      }
      switch (this.type) {
        case "anchor":
        case "tag":
          r || t.value ? (o.push(this.sourceToken), e.items.push({ start: o }), this.onKeyLine = !0) : t.sep ? t.sep.push(this.sourceToken) : t.start.push(this.sourceToken);
          return;
        case "explicit-key-ind":
          !t.sep && !t.explicitKey ? (t.start.push(this.sourceToken), t.explicitKey = !0) : r || t.value ? (o.push(this.sourceToken), e.items.push({ start: o, explicitKey: !0 })) : this.stack.push({
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: [this.sourceToken], explicitKey: !0 }]
          }), this.onKeyLine = !0;
          return;
        case "map-value-ind":
          if (t.explicitKey)
            if (t.sep)
              if (t.value)
                e.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (H(t.sep, "map-value-ind"))
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: o, key: null, sep: [this.sourceToken] }]
                });
              else if (Cs(t.key) && !H(t.sep, "newline")) {
                const a = te(t.start), l = t.key, c = t.sep;
                c.push(this.sourceToken), delete t.key, delete t.sep, this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: a, key: l, sep: c }]
                });
              } else o.length > 0 ? t.sep = t.sep.concat(o, this.sourceToken) : t.sep.push(this.sourceToken);
            else if (H(t.start, "newline"))
              Object.assign(t, { key: null, sep: [this.sourceToken] });
            else {
              const a = te(t.start);
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: a, key: null, sep: [this.sourceToken] }]
              });
            }
          else
            t.sep ? t.value || r ? e.items.push({ start: o, key: null, sep: [this.sourceToken] }) : H(t.sep, "map-value-ind") ? this.stack.push({
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [], key: null, sep: [this.sourceToken] }]
            }) : t.sep.push(this.sourceToken) : Object.assign(t, { key: null, sep: [this.sourceToken] });
          this.onKeyLine = !0;
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          const a = this.flowScalar(this.type);
          r || t.value ? (e.items.push({ start: o, key: a, sep: [] }), this.onKeyLine = !0) : t.sep ? this.stack.push(a) : (Object.assign(t, { key: a, sep: [] }), this.onKeyLine = !0);
          return;
        }
        default: {
          const a = this.startBlockValue(e);
          if (a) {
            if (a.type === "block-seq") {
              if (!t.explicitKey && t.sep && !H(t.sep, "newline")) {
                yield* this.pop({
                  type: "error",
                  offset: this.offset,
                  message: "Unexpected block-seq-ind on same line with key",
                  source: this.source
                });
                return;
              }
            } else i && e.items.push({ start: o });
            this.stack.push(a);
            return;
          }
        }
      }
    }
    yield* this.pop(), yield* this.step();
  }
  *blockSequence(e) {
    var n;
    const t = e.items[e.items.length - 1];
    switch (this.type) {
      case "newline":
        if (t.value) {
          const i = "end" in t.value ? t.value.end : void 0, r = Array.isArray(i) ? i[i.length - 1] : void 0;
          (r == null ? void 0 : r.type) === "comment" ? i == null || i.push(this.sourceToken) : e.items.push({ start: [this.sourceToken] });
        } else
          t.start.push(this.sourceToken);
        return;
      case "space":
      case "comment":
        if (t.value)
          e.items.push({ start: [this.sourceToken] });
        else {
          if (this.atIndentedComment(t.start, e.indent)) {
            const i = e.items[e.items.length - 2], r = (n = i == null ? void 0 : i.value) == null ? void 0 : n.end;
            if (Array.isArray(r)) {
              qe(r, t.start), r.push(this.sourceToken), e.items.pop();
              return;
            }
          }
          t.start.push(this.sourceToken);
        }
        return;
      case "anchor":
      case "tag":
        if (t.value || this.indent <= e.indent)
          break;
        t.start.push(this.sourceToken);
        return;
      case "seq-item-ind":
        if (this.indent !== e.indent)
          break;
        t.value || H(t.start, "seq-item-ind") ? e.items.push({ start: [this.sourceToken] }) : t.start.push(this.sourceToken);
        return;
    }
    if (this.indent > e.indent) {
      const i = this.startBlockValue(e);
      if (i) {
        this.stack.push(i);
        return;
      }
    }
    yield* this.pop(), yield* this.step();
  }
  *flowCollection(e) {
    const t = e.items[e.items.length - 1];
    if (this.type === "flow-error-end") {
      let n;
      do
        yield* this.pop(), n = this.peek(1);
      while ((n == null ? void 0 : n.type) === "flow-collection");
    } else if (e.end.length === 0) {
      switch (this.type) {
        case "comma":
        case "explicit-key-ind":
          !t || t.sep ? e.items.push({ start: [this.sourceToken] }) : t.start.push(this.sourceToken);
          return;
        case "map-value-ind":
          !t || t.value ? e.items.push({ start: [], key: null, sep: [this.sourceToken] }) : t.sep ? t.sep.push(this.sourceToken) : Object.assign(t, { key: null, sep: [this.sourceToken] });
          return;
        case "space":
        case "comment":
        case "newline":
        case "anchor":
        case "tag":
          !t || t.value ? e.items.push({ start: [this.sourceToken] }) : t.sep ? t.sep.push(this.sourceToken) : t.start.push(this.sourceToken);
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          const i = this.flowScalar(this.type);
          !t || t.value ? e.items.push({ start: [], key: i, sep: [] }) : t.sep ? this.stack.push(i) : Object.assign(t, { key: i, sep: [] });
          return;
        }
        case "flow-map-end":
        case "flow-seq-end":
          e.end.push(this.sourceToken);
          return;
      }
      const n = this.startBlockValue(e);
      n ? this.stack.push(n) : (yield* this.pop(), yield* this.step());
    } else {
      const n = this.peek(2);
      if (n.type === "block-map" && (this.type === "map-value-ind" && n.indent === e.indent || this.type === "newline" && !n.items[n.items.length - 1].sep))
        yield* this.pop(), yield* this.step();
      else if (this.type === "map-value-ind" && n.type !== "flow-collection") {
        const i = Be(n), r = te(i);
        qt(e);
        const o = e.end.splice(1, e.end.length);
        o.push(this.sourceToken);
        const a = {
          type: "block-map",
          offset: e.offset,
          indent: e.indent,
          items: [{ start: r, key: e, sep: o }]
        };
        this.onKeyLine = !0, this.stack[this.stack.length - 1] = a;
      } else
        yield* this.lineEnd(e);
    }
  }
  flowScalar(e) {
    if (this.onNewLine) {
      let t = this.source.indexOf(`
`) + 1;
      for (; t !== 0; )
        this.onNewLine(this.offset + t), t = this.source.indexOf(`
`, t) + 1;
    }
    return {
      type: e,
      offset: this.offset,
      indent: this.indent,
      source: this.source
    };
  }
  startBlockValue(e) {
    switch (this.type) {
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return this.flowScalar(this.type);
      case "block-scalar-header":
        return {
          type: "block-scalar",
          offset: this.offset,
          indent: this.indent,
          props: [this.sourceToken],
          source: ""
        };
      case "flow-map-start":
      case "flow-seq-start":
        return {
          type: "flow-collection",
          offset: this.offset,
          indent: this.indent,
          start: this.sourceToken,
          items: [],
          end: []
        };
      case "seq-item-ind":
        return {
          type: "block-seq",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: [this.sourceToken] }]
        };
      case "explicit-key-ind": {
        this.onKeyLine = !0;
        const t = Be(e), n = te(t);
        return n.push(this.sourceToken), {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: n, explicitKey: !0 }]
        };
      }
      case "map-value-ind": {
        this.onKeyLine = !0;
        const t = Be(e), n = te(t);
        return {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: n, key: null, sep: [this.sourceToken] }]
        };
      }
    }
    return null;
  }
  atIndentedComment(e, t) {
    return this.type !== "comment" || this.indent <= t ? !1 : e.every((n) => n.type === "newline" || n.type === "space");
  }
  *documentEnd(e) {
    this.type !== "doc-mode" && (e.end ? e.end.push(this.sourceToken) : e.end = [this.sourceToken], this.type === "newline" && (yield* this.pop()));
  }
  *lineEnd(e) {
    switch (this.type) {
      case "comma":
      case "doc-start":
      case "doc-end":
      case "flow-seq-end":
      case "flow-map-end":
      case "map-value-ind":
        yield* this.pop(), yield* this.step();
        break;
      case "newline":
        this.onKeyLine = !1;
      case "space":
      case "comment":
      default:
        e.end ? e.end.push(this.sourceToken) : e.end = [this.sourceToken], this.type === "newline" && (yield* this.pop());
    }
  }
}
function ni(s) {
  const e = s.prettyErrors !== !1;
  return { lineCounter: s.lineCounter || e && new ti() || null, prettyErrors: e };
}
function ii(s, e = {}) {
  const { lineCounter: t, prettyErrors: n } = ni(e), i = new si(t == null ? void 0 : t.addNewLine), r = new Xn(e);
  let o = null;
  for (const a of r.compose(i.parse(s), !0, s.length))
    if (!o)
      o = a;
    else if (o.options.logLevel !== "silent") {
      o.errors.push(new we(a.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
      break;
    }
  return n && t && (o.errors.forEach(jt(s, t)), o.warnings.forEach(jt(s, t))), o;
}
function ri(s, e, t) {
  let n;
  const i = ii(s, t);
  if (!i)
    return null;
  if (i.warnings.forEach((r) => ss(i.options.logLevel, r)), i.errors.length > 0) {
    if (i.options.logLevel !== "silent")
      throw i.errors[0];
    i.errors = [];
  }
  return i.toJS(Object.assign({ reviver: n }, t));
}
function oi(s, e, t) {
  let n = null;
  if (Array.isArray(e) && (n = e), s === void 0) {
    const { keepUndefined: i } = {};
    if (!i)
      return;
  }
  return Ie(s) && !n ? s.toString(t) : new Te(s, n, t).toString(t);
}
const ue = I.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD"), ai = I.object({
  status: I.enum(["idea", "planned", "in-progress", "review", "done", "dropped"]),
  kind: I.enum(["feat", "fix", "chore", "docs", "refactor"]).optional(),
  id: I.string().optional(),
  idea: I.string().optional(),
  agent: I.enum(ne).optional(),
  created: ue,
  updated: ue.optional(),
  tags: I.string().optional()
}), li = I.object({
  date: ue,
  status: I.enum(["decided", "superseded"]),
  "superseded-by": I.string().optional()
}), ci = I.object({
  status: I.enum(["open", "resolved"]),
  raised: ue,
  "resolved-by": I.string().optional(),
  blocks: I.string().optional()
}), fi = I.object({
  id: I.string().describe("Permanent plan ID, e.g. FEAT-24"),
  title: I.string().describe('Human-readable plan name, e.g. "Plan storage architecture"'),
  kind: I.enum(["feat", "fix", "chore", "docs", "refactor"]).describe("Plan kind matching Conventional Commits types"),
  status: I.enum(["idea", "planned", "in-progress", "review", "done", "dropped"]).describe("Current lifecycle status"),
  idea: I.string().optional().describe("IDEA-N backlink if this plan grew out of an idea"),
  agent: I.enum(ne).optional().describe("Per-plan agent override"),
  created: ue.describe("Creation date (YYYY-MM-DD)"),
  updated: ue.optional().describe("Last significant update date (YYYY-MM-DD)"),
  tags: I.array(I.string()).optional().describe("Tagging categories")
}), ui = I.object({
  id: I.string().describe("Permanent idea ID, e.g. IDEA-20"),
  title: I.string().describe("Short idea headline (3-6 words)")
}), hi = I.object({
  version: I.string(),
  projectName: I.string(),
  initializedAt: I.string(),
  nextId: I.object({
    feat: I.number(),
    fix: I.number(),
    chore: I.number(),
    docs: I.number(),
    refactor: I.number()
  }).optional(),
  defaultAgent: I.enum(ne).optional(),
  defaultAgents: I.object({
    phase: I.enum(ne),
    planDraft: I.enum(ne),
    ideaExtend: I.enum(ne)
  }).optional()
}), Ut = /^##\s+(.+?)\s*$/, di = /^\*\*([A-Za-z][A-Za-z-]*):\*\*\s*(.*)$/, pi = /^###\s+Phases\s*$/i, mi = /^###\s+Log\s*$/i, gi = /^###\s+Clarifications\s*$/i, _s = /^#{2,3}\s+/, Vt = /^[-*]\s+\[([ xX])\]\s+(.*)$/, yi = /^\[review\]\s+(.*)$/, bi = /^-\s+(\d{4}-\d{2}-\d{2}):\s*(.*)$/;
function vs(s, e, t) {
  const n = s.split(`
`), i = n.findIndex((l) => e.test(l));
  if (i === -1) return { body: s, entries: [] };
  let r = n.length;
  for (let l = i + 1; l < n.length; l++)
    if (_s.test(n[l])) {
      r = l;
      break;
    }
  const o = t(n, i + 1, r);
  return { body: [...n.slice(0, i), ...n.slice(r)].join(`
`).trim(), entries: o };
}
function wi(s, e, t) {
  const n = [];
  let i = e;
  for (; i < t; ) {
    const r = s[i].match(Vt);
    if (r) {
      const o = r[1].toLowerCase() === "x", a = r[2].trim(), l = a.match(yi), c = l ? l[1].trim() : a, p = l ? "review" : void 0, f = [];
      for (i++; i < t; ) {
        const h = s[i];
        if (h.trim() === "" || Vt.test(h) || _s.test(h)) break;
        if (/^\s/.test(h))
          f.push(h.trimStart()), i++;
        else
          break;
      }
      n.push({
        done: o,
        text: c,
        description: f.length > 0 ? f.join(`
`) : void 0,
        source: p
      });
    } else
      i++;
  }
  return n;
}
function Ps(s) {
  const e = vs(s, pi, wi);
  return { body: e.body, phases: e.entries };
}
function ki(s, e, t) {
  const n = [];
  for (let i = e; i < t; i++) {
    const r = s[i].match(bi);
    r && n.push({ date: r[1], text: r[2].trim() });
  }
  return n;
}
function Bs(s, e) {
  return vs(s, e, ki);
}
function Ms(s) {
  const { body: e, entries: t } = Bs(s, mi);
  return { body: e, log: t };
}
function js(s) {
  const { body: e, entries: t } = Bs(s, gi);
  return { body: e, clarifications: t };
}
function Xe(s) {
  const e = s.split(`
`), t = [];
  for (let i = 0; i < e.length; i++)
    Ut.test(e[i]) && t.push(i);
  const n = [];
  for (let i = 0; i < t.length; i++) {
    const r = t[i], o = i + 1 < t.length ? t[i + 1] : e.length, a = e[r].match(Ut)[1], l = e.slice(r + 1, o);
    let c = 0;
    for (; c < l.length && l[c].trim() === ""; ) c++;
    const p = {};
    for (; c < l.length; ) {
      const b = l[c].match(di);
      if (!b) break;
      p[b[1].toLowerCase()] = b[2].trim(), c++;
    }
    for (; c < l.length && l[c].trim() === ""; ) c++;
    const f = l.slice(c).join(`
`).trim();
    let { body: h, phases: d } = Ps(f);
    const { body: g, log: u } = Ms(h);
    h = g;
    const { body: m, clarifications: y } = js(h);
    h = m, n.push({ title: a, fields: p, body: h, phases: d, log: u, clarifications: y });
  }
  return n;
}
function ft(s) {
  const e = [], t = [];
  for (const n of Xe(s)) {
    const i = ai.safeParse(n.fields);
    if (!i.success) {
      t.push({
        title: n.title,
        message: i.error.issues.map((o) => o.message).join("; ")
      });
      continue;
    }
    const r = i.data;
    e.push({
      title: n.title,
      status: r.status,
      kind: r.kind,
      id: r.id,
      idea: r.idea,
      agent: r.agent,
      created: r.created,
      updated: r.updated,
      tags: r.tags ? r.tags.split(",").map((o) => o.trim()).filter(Boolean) : [],
      body: n.body,
      phases: n.phases,
      log: n.log,
      clarifications: n.clarifications
    });
  }
  return { entries: e, warnings: t };
}
function Si(s) {
  const e = [], t = [];
  for (const n of Xe(s)) {
    const i = li.safeParse(n.fields);
    if (!i.success) {
      t.push({
        title: n.title,
        message: i.error.issues.map((o) => o.message).join("; ")
      });
      continue;
    }
    const r = i.data;
    e.push({
      title: n.title,
      date: r.date,
      status: r.status,
      supersededBy: r["superseded-by"],
      body: n.body
    });
  }
  return { entries: e, warnings: t };
}
function Ni(s) {
  const e = [], t = [];
  for (const n of Xe(s)) {
    const i = ci.safeParse(n.fields);
    if (!i.success) {
      t.push({
        title: n.title,
        message: i.error.issues.map((o) => o.message).join("; ")
      });
      continue;
    }
    const r = i.data;
    e.push({
      title: n.title,
      status: r.status,
      raised: r.raised,
      resolvedBy: r["resolved-by"],
      blocks: r.blocks,
      body: n.body
    });
  }
  return { entries: e, warnings: t };
}
const Ei = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
function Tt(s, e) {
  const t = [], n = s.match(Ei);
  if (!n)
    return { data: null, body: s.trim(), warnings: t };
  const i = n[1], r = s.slice(n[0].length).trim();
  let o;
  try {
    o = ri(i);
  } catch (l) {
    return t.push({
      title: "(frontmatter)",
      message: `Invalid YAML frontmatter: ${l.message}`
    }), { data: null, body: r, warnings: t };
  }
  if (typeof o != "object" || o === null || Array.isArray(o))
    return t.push({
      title: "(frontmatter)",
      message: "YAML frontmatter did not produce an object"
    }), { data: null, body: r, warnings: t };
  const a = e.safeParse(o);
  if (!a.success) {
    const l = o.id;
    return t.push({
      title: l ?? "(frontmatter)",
      message: a.error.issues.map((c) => c.message).join("; ")
    }), { data: null, body: r, warnings: t };
  }
  return { data: a.data, body: r, warnings: t };
}
function Ds(s) {
  const e = [], {
    data: t,
    body: n,
    warnings: i
  } = Tt(s, fi);
  if (e.push(...i), !t)
    return { entries: [], warnings: e };
  let r = n;
  const { body: o, phases: a } = Ps(r);
  r = o;
  const { body: l, log: c } = Ms(r);
  r = l;
  const { body: p, clarifications: f } = js(r);
  return r = p, { entries: [{
    title: t.title,
    status: t.status,
    kind: t.kind,
    id: t.id,
    idea: t.idea,
    agent: t.agent,
    created: t.created,
    updated: t.updated,
    tags: t.tags ?? [],
    body: r,
    phases: a,
    log: c,
    clarifications: f
  }], warnings: e };
}
function Ks(s) {
  const {
    data: e,
    body: t,
    warnings: n
  } = Tt(s, ui);
  return e ? { entries: [{
    id: e.id,
    title: e.title,
    body: t || ""
  }], warnings: n } : { entries: [], warnings: n };
}
const Ii = /^(IDEA-\d+):\s*/, Ai = /\n---+\n/;
function ut(s) {
  return s.split(Ai).filter(Boolean).map((t) => {
    var l;
    const n = t.match(/^#{1,3}\s+(.+)/m), i = n ? n[1].trim() : ((l = t.trim().split(`
`)[0]) == null ? void 0 : l.trim()) ?? "Untitled", r = i.match(Ii), o = (r == null ? void 0 : r[1]) ?? null, a = o ? i.slice(r[0].length) : i;
    return { id: o, title: a, body: t.trim() };
  });
}
function Oi(s, e, t) {
  const n = new Set(s.map((r) => r.title)), i = [];
  for (const r of s)
    r.supersededBy && !n.has(r.supersededBy) && i.push({
      kind: "dangling-superseded-by",
      section: "decisions",
      title: r.title,
      message: `Superseded-by "${r.supersededBy}" doesn't match any decision`
    });
  for (const r of e)
    if (r.resolvedBy && !n.has(r.resolvedBy) && i.push({
      kind: "dangling-resolved-by",
      section: "open-questions",
      title: r.title,
      message: `Resolved-by "${r.resolvedBy}" doesn't match any decision`
    }), r.status === "open" && r.blocks) {
      const o = t.find((a) => a.id === r.blocks);
      o && (o.status === "in-progress" || o.status === "review") && i.push({
        kind: "blocked-plan-active",
        section: "open-questions",
        title: r.title,
        planId: o.id,
        message: `Still open but blocks "${o.title}" (${o.id}), already ${o.status}`
      });
    }
  return i;
}
const Yt = /^##\s+(\d{4}-\d{2}-\d{2})\s*$/, $i = /^[-*]\s+(.*)$/;
async function Rs(s) {
  try {
    return await Vs(s);
  } catch {
    return [];
  }
}
async function ze(s) {
  try {
    return await ht(s, "utf-8");
  } catch {
    return "";
  }
}
async function Fs(s) {
  const e = [], t = [], n = (await Rs(s)).filter((i) => i.endsWith(".md") && i !== "index.md");
  for (const i of n) {
    const r = await ze(M(s, i));
    if (!r) continue;
    const o = Ds(r);
    e.push(...o.entries), t.push(...o.warnings);
  }
  return { entries: e, warnings: t };
}
async function qs(s) {
  const e = [], t = [], n = (await Rs(s)).filter((i) => i.endsWith(".md") && i !== "index.md");
  for (const i of n) {
    const r = await ze(M(s, i));
    if (!r) continue;
    const o = Ks(r);
    e.push(...o.entries), t.push(...o.warnings);
  }
  return { entries: e, warnings: t };
}
async function Ti(s, e) {
  const [t, n] = await Promise.all([
    Fs(s),
    ze(e)
  ]);
  if (t.entries.length === 0)
    return ft(n);
  const i = ft(n), r = /* @__PURE__ */ new Set();
  for (const a of t.entries)
    r.add(a.id ?? a.title);
  const o = i.entries.filter((a) => {
    const l = a.id ?? a.title;
    return r.has(l) ? !1 : (r.add(l), !0);
  });
  return {
    entries: [...t.entries, ...o],
    warnings: [...i.warnings, ...t.warnings]
  };
}
async function Li(s, e) {
  const [t, n] = await Promise.all([
    qs(s),
    ze(e)
  ]);
  if (t.entries.length === 0 && !n)
    return { entries: [], warnings: [] };
  if (t.entries.length === 0)
    return { entries: ut(n), warnings: [] };
  if (!n)
    return t;
  const i = ut(n), r = /* @__PURE__ */ new Set();
  for (const a of t.entries)
    a.id && r.add(a.id);
  const o = i.filter((a) => a.id ? r.has(a.id) ? !1 : (r.add(a.id), !0) : !0);
  return {
    entries: [...t.entries, ...o],
    warnings: [...t.warnings]
  };
}
function Ci(s) {
  const e = s.split(`
`), t = [];
  for (let i = 0; i < e.length; i++)
    Yt.test(e[i]) && t.push(i);
  const n = [];
  for (let i = 0; i < t.length; i++) {
    const r = t[i], o = i + 1 < t.length ? t[i + 1] : e.length, a = e[r].match(Yt)[1], l = e.slice(r + 1, o).map((c) => c.match($i)).filter((c) => c !== null).map((c) => c[1].trim());
    n.push({ date: a, items: l });
  }
  return n;
}
const qi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  findConsistencyIssues: Oi,
  parseDecisions: Si,
  parseFrontmatter: Tt,
  parseIdeaFile: Ks,
  parseIdeas: ut,
  parseOpenQuestions: Ni,
  parsePlanFile: Ds,
  parsePlans: ft,
  parseProgress: Ci,
  parseRawEntries: Xe,
  readAllIdeaFiles: qs,
  readAllPlanFiles: Fs,
  readIdeasMerged: Li,
  readPlansMerged: Ti
}, Symbol.toStringTag, { value: "Module" })), _i = "0.1.0";
class vi extends Error {
  constructor(e) {
    super(`Paper Camp is already initialized in ${e} (papercamp/config.json exists).`);
  }
}
async function Me(s) {
  try {
    return await Ys(s), !0;
  } catch {
    return !1;
  }
}
const Pi = ["progress.md", "decisions.md", "open-questions.md"];
async function Ui(s, e) {
  const t = M(s, "papercamp"), n = M(t, "config.json");
  if (await Me(n))
    throw new vi(s);
  const i = {
    version: _i,
    projectName: e.projectName,
    initializedAt: (/* @__PURE__ */ new Date()).toISOString(),
    nextId: { feat: 1, fix: 1, chore: 1, docs: 1, refactor: 1 }
  };
  hi.parse(i), await X(t, { recursive: !0 }), await se(n, `${JSON.stringify(i, null, 2)}
`, "utf-8"), await X(t, { recursive: !0 });
  const r = M(t, "plans");
  await X(r, { recursive: !0 });
  const o = M(r, "index.md");
  await Me(o) || await se(o, `# Plans

No plans yet.
`, "utf-8");
  const a = M(r, "archive");
  await X(a, { recursive: !0 });
  const l = M(t, "ideas");
  await X(l, { recursive: !0 });
  const c = M(l, "index.md");
  if (!await Me(c)) {
    const p = e.intent ? `# ${e.projectName}

${e.intent}
` : `# ${e.projectName}

What are you building, and why?
`;
    await se(c, p, "utf-8");
  }
  for (const p of Pi) {
    const f = M(t, p);
    await Me(f) || await se(f, "", "utf-8");
  }
}
function Vi() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
let Jt = Promise.resolve();
async function Yi(s, e) {
  const t = Jt.then(async () => {
    let n = null;
    try {
      n = JSON.parse(await ht(s, "utf-8"));
    } catch {
      return;
    }
    if (!(n != null && n.nextId)) return;
    const i = n.nextId[e] ?? 1, r = `${e.toUpperCase()}-${i}`;
    return n.nextId[e] = i + 1, await se(s, `${JSON.stringify(n, null, 2)}
`), r;
  });
  return Jt = t.catch(() => {
  }), t;
}
function Bi(s) {
  const e = [`## ${s.title}`, "", `**Status:** ${s.status}`];
  if (s.kind && e.push(`**Kind:** ${s.kind}`), s.id && e.push(`**Id:** ${s.id}`), s.idea && e.push(`**Idea:** ${s.idea}`), s.agent && e.push(`**Agent:** ${s.agent}`), e.push(`**Created:** ${s.created}`), s.updated && e.push(`**Updated:** ${s.updated}`), s.tags && s.tags.length > 0 && e.push(`**Tags:** ${s.tags.join(", ")}`), e.push(""), s.body && e.push(s.body, ""), s.clarifications && s.clarifications.length > 0) {
    e.push("### Clarifications");
    for (const t of s.clarifications)
      e.push(`- ${t.date}: ${t.text}`);
    e.push("");
  }
  if (s.phases && s.phases.length > 0) {
    e.push("### Phases");
    for (const t of s.phases) {
      const n = t.source === "review" ? `[review] ${t.text}` : t.text;
      if (e.push(`- [${t.done ? "x" : " "}] ${n}`), t.description)
        for (const i of t.description.split(`
`))
          e.push(`      ${i}`);
    }
  }
  if (s.log && s.log.length > 0) {
    e.push("", "### Log");
    for (const t of s.log)
      e.push(`- ${t.date}: ${t.text}`);
  }
  return e.join(`
`).trimEnd();
}
function Ji(s) {
  const e = [`## ${s.title}`, "", `**Date:** ${s.date}`, `**Status:** ${s.status}`];
  return s.supersededBy && e.push(`**Superseded-by:** ${s.supersededBy}`), e.push(""), s.body && e.push(s.body), e.join(`
`).trimEnd();
}
function Gi(s) {
  const e = [
    `## ${s.title}`,
    "",
    `**Status:** ${s.status}`,
    `**Raised:** ${s.raised}`
  ];
  return s.resolvedBy && e.push(`**Resolved-by:** ${s.resolvedBy}`), s.blocks && e.push(`**Blocks:** ${s.blocks}`), e.push(""), s.body && e.push(s.body), e.join(`
`).trimEnd();
}
function Hi(s, e) {
  return [`## ${s}`, ...e.map((t) => `- ${t}`)].join(`
`);
}
function Wi(s) {
  return s.length === 0 ? "" : `${s.map((e) => Bi(e)).join(`

`)}
`;
}
async function Qi(s, e) {
  await X(Gs(s), { recursive: !0 });
  let t = "";
  try {
    t = await ht(s, "utf-8");
  } catch (r) {
    if (r.code !== "ENOENT") throw r;
  }
  const n = t.trimEnd(), i = n.length > 0 ? `${n}

${e}
` : `${e}
`;
  await se(s, i, "utf-8");
}
function Us(s) {
  let e = oi(s);
  return e = e.trimEnd(), `---
${e}
---`;
}
function Xi(s) {
  const e = {
    id: s.id,
    title: s.title,
    kind: s.kind,
    status: s.status,
    created: s.created
  };
  s.idea && (e.idea = s.idea), s.agent && (e.agent = s.agent), s.updated && (e.updated = s.updated), s.tags && s.tags.length > 0 && (e.tags = s.tags);
  const t = [Us(e)];
  if (s.body && t.push(s.body), s.clarifications && s.clarifications.length > 0) {
    const n = ["### Clarifications"];
    for (const i of s.clarifications)
      n.push(`- ${i.date}: ${i.text}`);
    t.push(n.join(`
`));
  }
  if (s.phases && s.phases.length > 0) {
    const n = ["### Phases"];
    for (const i of s.phases) {
      const r = i.source === "review" ? `[review] ${i.text}` : i.text;
      if (n.push(`- [${i.done ? "x" : " "}] ${r}`), i.description)
        for (const o of i.description.split(`
`))
          n.push(`      ${o}`);
    }
    t.push(n.join(`
`));
  }
  if (s.log && s.log.length > 0) {
    const n = ["### Log"];
    for (const i of s.log)
      n.push(`- ${i.date}: ${i.text}`);
    t.push(n.join(`
`));
  }
  return t.join(`

`).trimEnd();
}
function zi(s) {
  const e = {
    id: s.id,
    title: s.title
  }, t = [Us(e)];
  return s.body && t.push(s.body), t.join(`

`).trimEnd();
}
async function Zi(s, e) {
  const t = M(s, "papercamp", "plans"), n = M(t, "archive"), i = M(t, `${e}.md`), r = M(n, `${e}.md`);
  await X(n, { recursive: !0 });
  try {
    return await Js(i, r), !0;
  } catch (o) {
    if (o.code === "ENOENT") return !1;
    throw o;
  }
}
function xi(s) {
  return s.length === 0 ? `# Plans

No plans yet.
` : `# Plans

| Id | Title | Status | Tags |
|----|-------|--------|------|
${[...s].sort((n, i) => {
    const r = n.id ? Number.parseInt(n.id.replace(/^[A-Z]+-/, ""), 10) : Number.NaN, o = i.id ? Number.parseInt(i.id.replace(/^[A-Z]+-/, ""), 10) : Number.NaN;
    return !Number.isNaN(r) && !Number.isNaN(o) ? r - o : (n.title || "").localeCompare(i.title || "");
  }).map(
    (n) => `| ${n.id || ""} | ${(n.title || "").replace(/\|/g, "\\|")} | ${n.status} | ${(n.tags || []).join(", ")} |`
  ).join(`
`)}
`;
}
function er(s) {
  return s.length === 0 ? `# Ideas

No ideas yet.
` : `# Ideas

| Id | Title | Status |
|----|-------|--------|
${[...s].sort((n, i) => {
    const r = n.id ? Number.parseInt(n.id.replace("IDEA-", ""), 10) : Number.NaN, o = i.id ? Number.parseInt(i.id.replace("IDEA-", ""), 10) : Number.NaN;
    return !Number.isNaN(r) && !Number.isNaN(o) ? r - o : (n.title || "").localeCompare(i.title || "");
  }).map(
    (n) => `| ${n.id || ""} | ${(n.title || "").replace(/\|/g, "\\|")} | ${n.status || "planned"} |`
  ).join(`
`)}
`;
}
export {
  vi as A,
  Ds as B,
  ft as C,
  Ci as D,
  Xe as E,
  ai as F,
  fi as G,
  qs as H,
  Fs as I,
  Li as J,
  Ti as K,
  Us as L,
  Vi as M,
  qi as N,
  _i as P,
  Qi as a,
  Fi as b,
  Zi as c,
  Yi as d,
  ue as e,
  li as f,
  Oi as g,
  Ji as h,
  zi as i,
  er as j,
  Gi as k,
  Bi as l,
  Xi as m,
  Wi as n,
  xi as o,
  Hi as p,
  ui as q,
  Ui as r,
  ci as s,
  hi as t,
  Si as u,
  Ri as v,
  Tt as w,
  Ks as x,
  ut as y,
  Ni as z
};
//# sourceMappingURL=serializer.DEl5Ryp3.js.map
