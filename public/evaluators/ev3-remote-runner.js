!(function () {
  "use strict";
  var t, e, n;
  (!(function (t) {
    ((t[(t.CALL = 0)] = "CALL"),
      (t[(t.RETURN = 1)] = "RETURN"),
      (t[(t.RETURN_ERR = 2)] = "RETURN_ERR"));
  })(t || (t = {})),
    (function (t) {
      ((t.UNKNOWN = "__unknown"),
        (t.INTERNAL = "__internal"),
        (t.EVALUATOR = "__evaluator"),
        (t.EVALUATOR_SYNTAX = "__evaluator_syntax"),
        (t.EVALUATOR_TYPE = "__evaluator_type"),
        (t.EVALUATOR_RUNTIME = "__evaluator_runtime"));
    })(e || (e = {})));
  class r extends Error {
    name = "ConductorError";
    errorType = e.UNKNOWN;
    constructor(t) {
      super(t);
    }
  }
  class i extends r {
    name = "ConductorInternalError";
    errorType = e.INTERNAL;
    constructor(t) {
      super(t);
    }
  }
  !(function (t) {
    ((t[(t.PROTOCOL_VERSION = 0)] = "PROTOCOL_VERSION"),
      (t[(t.PROTOCOL_MIN_VERSION = 0)] = "PROTOCOL_MIN_VERSION"),
      (t[(t.SETUP_MESSAGES_BUFFER_SIZE = 10)] = "SETUP_MESSAGES_BUFFER_SIZE"));
  })(n || (n = {}));
  class s {
    name;
    t;
    i = new Set();
    h = !0;
    o = [];
    send(t, e) {
      (this.l(), this.t.postMessage(t, e ?? []));
    }
    subscribe(t) {
      if ((this.l(), this.i.add(t), this.o)) {
        for (const e of this.o) t(e);
        delete this.o;
      }
    }
    unsubscribe(t) {
      (this.l(), this.i.delete(t));
    }
    close() {
      (this.l(), (this.h = !1), this.t?.close());
    }
    l() {
      if (!this.h) throw new i(`Channel ${this.name} has been closed`);
    }
    _(t) {
      if ((this.l(), this.o)) {
        if (this.o.length >= n.SETUP_MESSAGES_BUFFER_SIZE)
          return console.warn(
            "Channel buffer full; message dropped (no subscribers on channel)",
            t,
          );
        this.o.push(t);
      } else for (const e of this.i) e(t);
    }
    listenToPort(t) {
      (t.addEventListener("message", t => this._(t.data)), t.start());
    }
    replacePort(t) {
      (this.l(), this.t?.close(), (this.t = t), this.listenToPort(t));
    }
    constructor(t, e) {
      ((this.name = t), this.replacePort(e));
    }
  }
  function o(t) {
    return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
  }
  function u(t) {
    if (Object.prototype.hasOwnProperty.call(t, "__esModule")) return t;
    var e = t.default;
    if ("function" == typeof e) {
      var n = function t() {
        var n = !1;
        try {
          n = this instanceof t;
        } catch {}
        return n ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
      };
      n.prototype = e.prototype;
    } else n = {};
    return (
      Object.defineProperty(n, "__esModule", { value: !0 }),
      Object.keys(t).forEach(function (e) {
        var r = Object.getOwnPropertyDescriptor(t, e);
        Object.defineProperty(
          n,
          e,
          r.get
            ? r
            : {
                enumerable: !0,
                get: function () {
                  return t[e];
                },
              },
        );
      }),
      n
    );
  }
  var a,
    l,
    c,
    p = { exports: {} },
    h =
      (a ||
        ((a = 1),
        (l = p),
        (function (t, e) {
          l.exports ? (l.exports = e()) : (t.nearley = e());
        })(p.exports, function () {
          function t(e, n, r) {
            return (
              (this.id = ++t.highestId),
              (this.name = e),
              (this.symbols = n),
              (this.postprocess = r),
              this
            );
          }
          function e(t, e, n, r) {
            ((this.rule = t),
              (this.dot = e),
              (this.reference = n),
              (this.data = []),
              (this.wantedBy = r),
              (this.isComplete = this.dot === t.symbols.length));
          }
          function n(t, e) {
            ((this.grammar = t),
              (this.index = e),
              (this.states = []),
              (this.wants = {}),
              (this.scannable = []),
              (this.completed = {}));
          }
          function r(t, e) {
            ((this.rules = t), (this.start = e || this.rules[0].name));
            var n = (this.byName = {});
            this.rules.forEach(function (t) {
              (n.hasOwnProperty(t.name) || (n[t.name] = []), n[t.name].push(t));
            });
          }
          function i() {
            this.reset("");
          }
          function s(t, e, s) {
            if (t instanceof r) {
              var o = t;
              s = e;
            } else o = r.fromCompiled(t, e);
            for (var u in ((this.grammar = o),
            (this.options = { keepHistory: !1, lexer: o.lexer || new i() }),
            s || {}))
              this.options[u] = s[u];
            ((this.lexer = this.options.lexer), (this.lexerState = void 0));
            var a = new n(o, 0);
            ((this.table = [a]),
              (a.wants[o.start] = []),
              a.predict(o.start),
              a.process(),
              (this.current = 0));
          }
          function o(t) {
            var e = typeof t;
            if ("string" === e) return t;
            if ("object" === e) {
              if (t.literal) return JSON.stringify(t.literal);
              if (t instanceof RegExp) return t.toString();
              if (t.type) return "%" + t.type;
              if (t.test) return "<" + String(t.test) + ">";
              throw new Error("Unknown symbol type: " + t);
            }
          }
          return (
            (t.highestId = 0),
            (t.prototype.toString = function (t) {
              var e =
                void 0 === t
                  ? this.symbols.map(o).join(" ")
                  : this.symbols.slice(0, t).map(o).join(" ") +
                    " ● " +
                    this.symbols.slice(t).map(o).join(" ");
              return this.name + " → " + e;
            }),
            (e.prototype.toString = function () {
              return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
            }),
            (e.prototype.nextState = function (t) {
              var n = new e(this.rule, this.dot + 1, this.reference, this.wantedBy);
              return (
                (n.left = this),
                (n.right = t),
                n.isComplete && ((n.data = n.build()), (n.right = void 0)),
                n
              );
            }),
            (e.prototype.build = function () {
              var t = [],
                e = this;
              do {
                (t.push(e.right.data), (e = e.left));
              } while (e.left);
              return (t.reverse(), t);
            }),
            (e.prototype.finish = function () {
              this.rule.postprocess &&
                (this.data = this.rule.postprocess(this.data, this.reference, s.fail));
            }),
            (n.prototype.process = function (t) {
              for (
                var e = this.states, n = this.wants, r = this.completed, i = 0;
                i < e.length;
                i++
              ) {
                var o = e[i];
                if (o.isComplete) {
                  if ((o.finish(), o.data !== s.fail)) {
                    for (var u = o.wantedBy, a = u.length; a--;) {
                      var l = u[a];
                      this.complete(l, o);
                    }
                    if (o.reference === this.index) {
                      var c = o.rule.name;
                      (this.completed[c] = this.completed[c] || []).push(o);
                    }
                  }
                } else {
                  if ("string" != typeof (c = o.rule.symbols[o.dot])) {
                    this.scannable.push(o);
                    continue;
                  }
                  if (n[c]) {
                    if ((n[c].push(o), r.hasOwnProperty(c))) {
                      var p = r[c];
                      for (a = 0; a < p.length; a++) {
                        var h = p[a];
                        this.complete(o, h);
                      }
                    }
                  } else ((n[c] = [o]), this.predict(c));
                }
              }
            }),
            (n.prototype.predict = function (t) {
              for (var n = this.grammar.byName[t] || [], r = 0; r < n.length; r++) {
                var i = n[r],
                  s = this.wants[t],
                  o = new e(i, 0, this.index, s);
                this.states.push(o);
              }
            }),
            (n.prototype.complete = function (t, e) {
              var n = t.nextState(e);
              this.states.push(n);
            }),
            (r.fromCompiled = function (e, n) {
              var i = e.Lexer;
              e.ParserStart && ((n = e.ParserStart), (e = e.ParserRules));
              var s = new r(
                (e = e.map(function (e) {
                  return new t(e.name, e.symbols, e.postprocess);
                })),
                n,
              );
              return ((s.lexer = i), s);
            }),
            (i.prototype.reset = function (t, e) {
              ((this.buffer = t),
                (this.index = 0),
                (this.line = e ? e.line : 1),
                (this.lastLineBreak = e ? -e.col : 0));
            }),
            (i.prototype.next = function () {
              if (this.index < this.buffer.length) {
                var t = this.buffer[this.index++];
                return (
                  "\n" === t && ((this.line += 1), (this.lastLineBreak = this.index)),
                  { value: t }
                );
              }
            }),
            (i.prototype.save = function () {
              return { line: this.line, col: this.index - this.lastLineBreak };
            }),
            (i.prototype.formatError = function (t, e) {
              var n = this.buffer;
              if ("string" == typeof n) {
                var r = n.split("\n").slice(Math.max(0, this.line - 5), this.line),
                  i = n.indexOf("\n", this.index);
                -1 === i && (i = n.length);
                var s = this.index - this.lastLineBreak,
                  o = String(this.line).length;
                return (
                  (e += " at line " + this.line + " col " + s + ":\n\n"),
                  (e += r
                    .map(function (t, e) {
                      return u(this.line - r.length + e + 1, o) + " " + t;
                    }, this)
                    .join("\n")) +
                    "\n" +
                    u("", o + s) +
                    "^\n"
                );
              }
              return e + " at index " + (this.index - 1);
              function u(t, e) {
                var n = String(t);
                return Array(e - n.length + 1).join(" ") + n;
              }
            }),
            (s.fail = {}),
            (s.prototype.feed = function (t) {
              var e,
                r = this.lexer;
              for (r.reset(t, this.lexerState); ;) {
                try {
                  if (!(e = r.next())) break;
                } catch (t) {
                  var s = new n(this.grammar, this.current + 1);
                  throw (
                    this.table.push(s),
                    ((a = new Error(this.reportLexerError(t))).offset = this.current),
                    (a.token = t.token),
                    a
                  );
                }
                var o = this.table[this.current];
                this.options.keepHistory || delete this.table[this.current - 1];
                var u = this.current + 1;
                ((s = new n(this.grammar, u)), this.table.push(s));
                for (
                  var a,
                    l = void 0 !== e.text ? e.text : e.value,
                    c = r.constructor === i ? e.value : e,
                    p = o.scannable,
                    h = p.length;
                  h--;
                ) {
                  var f = p[h],
                    m = f.rule.symbols[f.dot];
                  if (m.test ? m.test(c) : m.type ? m.type === e.type : m.literal === l) {
                    var d = f.nextState({ data: c, token: e, isToken: !0, reference: u - 1 });
                    s.states.push(d);
                  }
                }
                if ((s.process(), 0 === s.states.length))
                  throw (
                    ((a = new Error(this.reportError(e))).offset = this.current),
                    (a.token = e),
                    a
                  );
                (this.options.keepHistory && (o.lexerState = r.save()), this.current++);
              }
              return (o && (this.lexerState = r.save()), (this.results = this.finish()), this);
            }),
            (s.prototype.reportLexerError = function (t) {
              var e,
                n,
                r = t.token;
              return (
                r
                  ? ((e = "input " + JSON.stringify(r.text[0]) + " (lexer error)"),
                    (n = this.lexer.formatError(r, "Syntax error")))
                  : ((e = "input (lexer error)"), (n = t.message)),
                this.reportErrorCommon(n, e)
              );
            }),
            (s.prototype.reportError = function (t) {
              var e =
                  (t.type ? t.type + " token: " : "") +
                  JSON.stringify(void 0 !== t.value ? t.value : t),
                n = this.lexer.formatError(t, "Syntax error");
              return this.reportErrorCommon(n, e);
            }),
            (s.prototype.reportErrorCommon = function (t, e) {
              var n = [];
              n.push(t);
              var r = this.table.length - 2,
                i = this.table[r],
                s = i.states.filter(function (t) {
                  var e = t.rule.symbols[t.dot];
                  return e && "string" != typeof e;
                });
              return (
                0 === s.length
                  ? (n.push(
                      "Unexpected " +
                        e +
                        ". I did not expect any more input. Here is the state of my parse table:\n",
                    ),
                    this.displayStateStack(i.states, n))
                  : (n.push(
                      "Unexpected " +
                        e +
                        ". Instead, I was expecting to see one of the following:\n",
                    ),
                    s
                      .map(function (t) {
                        return this.buildFirstStateStack(t, []) || [t];
                      }, this)
                      .forEach(function (t) {
                        var e = t[0],
                          r = e.rule.symbols[e.dot],
                          i = this.getSymbolDisplay(r);
                        (n.push("A " + i + " based on:"), this.displayStateStack(t, n));
                      }, this)),
                n.push(""),
                n.join("\n")
              );
            }),
            (s.prototype.displayStateStack = function (t, e) {
              for (var n, r = 0, i = 0; i < t.length; i++) {
                var s = t[i],
                  o = s.rule.toString(s.dot);
                (o === n
                  ? r++
                  : (r > 0 && e.push("    ^ " + r + " more lines identical to this"),
                    (r = 0),
                    e.push("    " + o)),
                  (n = o));
              }
            }),
            (s.prototype.getSymbolDisplay = function (t) {
              return (function (t) {
                var e = typeof t;
                if ("string" === e) return t;
                if ("object" === e) {
                  if (t.literal) return JSON.stringify(t.literal);
                  if (t instanceof RegExp) return "character matching " + t;
                  if (t.type) return t.type + " token";
                  if (t.test) return "token matching " + String(t.test);
                  throw new Error("Unknown symbol type: " + t);
                }
              })(t);
            }),
            (s.prototype.buildFirstStateStack = function (t, e) {
              if (-1 !== e.indexOf(t)) return null;
              if (0 === t.wantedBy.length) return [t];
              var n = t.wantedBy[0],
                r = [t].concat(e),
                i = this.buildFirstStateStack(n, r);
              return null === i ? null : [t].concat(i);
            }),
            (s.prototype.save = function () {
              var t = this.table[this.current];
              return ((t.lexerState = this.lexerState), t);
            }),
            (s.prototype.restore = function (t) {
              var e = t.index;
              ((this.current = e),
                (this.table[e] = t),
                this.table.splice(e + 1),
                (this.lexerState = t.lexerState),
                (this.results = this.finish()));
            }),
            (s.prototype.rewind = function (t) {
              if (!this.options.keepHistory)
                throw new Error("set option `keepHistory` to enable rewinding");
              this.restore(this.table[t]);
            }),
            (s.prototype.finish = function () {
              var t = [],
                e = this.grammar.start;
              return (
                this.table[this.table.length - 1].states.forEach(function (n) {
                  n.rule.name === e &&
                    n.dot === n.rule.symbols.length &&
                    0 === n.reference &&
                    n.data !== s.fail &&
                    t.push(n);
                }),
                t.map(function (t) {
                  return t.data;
                })
              );
            }),
            { Parser: s, Grammar: r, Rule: t }
          );
        })),
      p.exports),
    f = o(h),
    m = { exports: {} },
    d = m.exports,
    g =
      (c ||
        ((c = 1),
        (function (t) {
          !(function (e, n) {
            t.exports ? (t.exports = n()) : (e.moo = n());
          })(d, function () {
            var t = Object.prototype.hasOwnProperty,
              e = Object.prototype.toString,
              n = "boolean" == typeof new RegExp().sticky;
            function r(t) {
              return t && "[object RegExp]" === e.call(t);
            }
            function i(t) {
              return t && "object" == typeof t && !r(t) && !Array.isArray(t);
            }
            function s(t) {
              return new RegExp("|" + t).exec("").length - 1;
            }
            function o(t) {
              return "(" + t + ")";
            }
            function u(t) {
              if (!t.length) return "(?!)";
              var e = t
                .map(function (t) {
                  return "(?:" + t + ")";
                })
                .join("|");
              return "(?:" + e + ")";
            }
            function a(t) {
              if ("string" == typeof t)
                return (
                  "(?:" +
                  (function (t) {
                    return t.replace(/[-\/\\^$*+?.()|[\]{}]/g, function (t) {
                      return "-" === t ? "\\x2d" : "\\" + t;
                    });
                  })(t) +
                  ")"
                );
              if (r(t)) {
                if (t.ignoreCase) throw new Error("RegExp /i flag not allowed");
                if (t.global) throw new Error("RegExp /g flag is implied");
                if (t.sticky) throw new Error("RegExp /y flag is implied");
                if (t.multiline) throw new Error("RegExp /m flag is implied");
                return t.source;
              }
              throw new Error("Not a pattern: " + t);
            }
            function l(t, e) {
              return t.length > e ? t : Array(e - t.length + 1).join(" ") + t;
            }
            function c(e, n) {
              if ((i(n) || (n = { match: n }), n.include))
                throw new Error("Matching rules cannot also include states");
              var s = {
                defaultType: e,
                lineBreaks: !!n.error || !!n.fallback,
                pop: !1,
                next: null,
                push: null,
                error: !1,
                fallback: !1,
                value: null,
                type: null,
                shouldThrow: !1,
              };
              for (var o in n) t.call(n, o) && (s[o] = n[o]);
              if ("string" == typeof s.type && e !== s.type)
                throw new Error(
                  "Type transform cannot be a string (type '" + s.type + "' for token '" + e + "')",
                );
              var u = s.match;
              return (
                (s.match = Array.isArray(u) ? u : u ? [u] : []),
                s.match.sort(function (t, e) {
                  return r(t) && r(e) ? 0 : r(e) ? -1 : r(t) ? 1 : e.length - t.length;
                }),
                s
              );
            }
            function p(t) {
              return Array.isArray(t)
                ? (function (t) {
                    for (var e = [], n = 0; n < t.length; n++) {
                      var r = t[n];
                      if (r.include)
                        for (var i = [].concat(r.include), s = 0; s < i.length; s++)
                          e.push({ include: i[s] });
                      else {
                        if (!r.type) throw new Error("Rule has no type: " + JSON.stringify(r));
                        e.push(c(r.type, r));
                      }
                    }
                    return e;
                  })(t)
                : (function (t) {
                    for (var e = Object.getOwnPropertyNames(t), n = [], r = 0; r < e.length; r++) {
                      var s = e[r],
                        o = t[s],
                        u = [].concat(o);
                      if ("include" !== s) {
                        var a = [];
                        (u.forEach(function (t) {
                          i(t)
                            ? (a.length && n.push(c(s, a)), n.push(c(s, t)), (a = []))
                            : a.push(t);
                        }),
                          a.length && n.push(c(s, a)));
                      } else for (var l = 0; l < u.length; l++) n.push({ include: u[l] });
                    }
                    return n;
                  })(t);
            }
            var h = c("error", { lineBreaks: !0, shouldThrow: !0 });
            function f(t, e) {
              for (
                var i = null, l = Object.create(null), c = !0, p = null, f = [], m = [], d = 0;
                d < t.length;
                d++
              )
                t[d].fallback && (c = !1);
              for (d = 0; d < t.length; d++) {
                var g = t[d];
                if (g.include) throw new Error("Inheritance is not allowed in stateless lexers");
                if (g.error || g.fallback) {
                  if (i)
                    throw !g.fallback == !i.fallback
                      ? new Error(
                          "Multiple " +
                            (g.fallback ? "fallback" : "error") +
                            " rules not allowed (for token '" +
                            g.defaultType +
                            "')",
                        )
                      : new Error(
                          "fallback and error are mutually exclusive (for token '" +
                            g.defaultType +
                            "')",
                        );
                  i = g;
                }
                var D = g.match.slice();
                if (c)
                  for (; D.length && "string" == typeof D[0] && 1 === D[0].length;)
                    l[D.shift().charCodeAt(0)] = g;
                if (g.pop || g.push || g.next) {
                  if (!e)
                    throw new Error(
                      "State-switching options are not allowed in stateless lexers (for token '" +
                        g.defaultType +
                        "')",
                    );
                  if (g.fallback)
                    throw new Error(
                      "State-switching options are not allowed on fallback tokens (for token '" +
                        g.defaultType +
                        "')",
                    );
                }
                if (0 !== D.length) {
                  ((c = !1), f.push(g));
                  for (var y = 0; y < D.length; y++) {
                    var v = D[y];
                    if (r(v))
                      if (null === p) p = v.unicode;
                      else if (p !== v.unicode && !1 === g.fallback)
                        throw new Error("If one rule is /u then all must be");
                  }
                  var b = u(D.map(a)),
                    w = new RegExp(b);
                  if (w.test("")) throw new Error("RegExp matches empty string: " + w);
                  if (s(b) > 0)
                    throw new Error("RegExp has capture groups: " + w + "\nUse (?: … ) instead");
                  if (!g.lineBreaks && w.test("\n"))
                    throw new Error("Rule should declare lineBreaks: " + w);
                  m.push(o(b));
                }
              }
              var E = i && i.fallback,
                x = n && !E ? "ym" : "gm",
                A = n || E ? "" : "|";
              return (
                !0 === p && (x += "u"),
                { regexp: new RegExp(u(m) + A, x), groups: f, fast: l, error: i || h }
              );
            }
            function m(t, e, n) {
              var r = t && (t.push || t.next);
              if (r && !n[r])
                throw new Error(
                  "Missing state '" +
                    r +
                    "' (in token '" +
                    t.defaultType +
                    "' of state '" +
                    e +
                    "')",
                );
              if (t && t.pop && 1 !== +t.pop)
                throw new Error(
                  "pop must be 1 (in token '" + t.defaultType + "' of state '" + e + "')",
                );
            }
            var d = function (t, e) {
              ((this.startState = e),
                (this.states = t),
                (this.buffer = ""),
                (this.stack = []),
                this.reset());
            };
            ((d.prototype.reset = function (t, e) {
              return (
                (this.buffer = t || ""),
                (this.index = 0),
                (this.line = e ? e.line : 1),
                (this.col = e ? e.col : 1),
                (this.queuedToken = e ? e.queuedToken : null),
                (this.queuedText = e ? e.queuedText : ""),
                (this.queuedThrow = e ? e.queuedThrow : null),
                this.setState(e ? e.state : this.startState),
                (this.stack = e && e.stack ? e.stack.slice() : []),
                this
              );
            }),
              (d.prototype.save = function () {
                return {
                  line: this.line,
                  col: this.col,
                  state: this.state,
                  stack: this.stack.slice(),
                  queuedToken: this.queuedToken,
                  queuedText: this.queuedText,
                  queuedThrow: this.queuedThrow,
                };
              }),
              (d.prototype.setState = function (t) {
                if (t && this.state !== t) {
                  this.state = t;
                  var e = this.states[t];
                  ((this.groups = e.groups),
                    (this.error = e.error),
                    (this.re = e.regexp),
                    (this.fast = e.fast));
                }
              }),
              (d.prototype.popState = function () {
                this.setState(this.stack.pop());
              }),
              (d.prototype.pushState = function (t) {
                (this.stack.push(this.state), this.setState(t));
              }));
            var g = n
              ? function (t, e) {
                  return t.exec(e);
                }
              : function (t, e) {
                  var n = t.exec(e);
                  return 0 === n[0].length ? null : n;
                };
            function D() {
              return this.value;
            }
            if (
              ((d.prototype._getGroup = function (t) {
                for (var e = this.groups.length, n = 0; n < e; n++)
                  if (void 0 !== t[n + 1]) return this.groups[n];
                throw new Error("Cannot find token type for matched text");
              }),
              (d.prototype.next = function () {
                var t = this.index;
                if (this.queuedGroup) {
                  var e = this._token(this.queuedGroup, this.queuedText, t);
                  return ((this.queuedGroup = null), (this.queuedText = ""), e);
                }
                var n = this.buffer;
                if (t !== n.length) {
                  if ((o = this.fast[n.charCodeAt(t)])) return this._token(o, n.charAt(t), t);
                  var r = this.re;
                  r.lastIndex = t;
                  var i = g(r, n),
                    s = this.error;
                  if (null == i) return this._token(s, n.slice(t, n.length), t);
                  var o = this._getGroup(i),
                    u = i[0];
                  return s.fallback && i.index !== t
                    ? ((this.queuedGroup = o),
                      (this.queuedText = u),
                      this._token(s, n.slice(t, i.index), t))
                    : this._token(o, u, t);
                }
              }),
              (d.prototype._token = function (t, e, n) {
                var r = 0;
                if (t.lineBreaks) {
                  var i = /\n/g,
                    s = 1;
                  if ("\n" === e) r = 1;
                  else for (; i.exec(e);) (r++, (s = i.lastIndex));
                }
                var o = {
                    type: ("function" == typeof t.type && t.type(e)) || t.defaultType,
                    value: "function" == typeof t.value ? t.value(e) : e,
                    text: e,
                    toString: D,
                    offset: n,
                    lineBreaks: r,
                    line: this.line,
                    col: this.col,
                  },
                  u = e.length;
                if (
                  ((this.index += u),
                  (this.line += r),
                  0 !== r ? (this.col = u - s + 1) : (this.col += u),
                  t.shouldThrow)
                )
                  throw new Error(this.formatError(o, "invalid syntax"));
                return (
                  t.pop
                    ? this.popState()
                    : t.push
                      ? this.pushState(t.push)
                      : t.next && this.setState(t.next),
                  o
                );
              }),
              "undefined" != typeof Symbol && Symbol.iterator)
            ) {
              var y = function (t) {
                this.lexer = t;
              };
              ((y.prototype.next = function () {
                var t = this.lexer.next();
                return { value: t, done: !t };
              }),
                (y.prototype[Symbol.iterator] = function () {
                  return this;
                }),
                (d.prototype[Symbol.iterator] = function () {
                  return new y(this);
                }));
            }
            return (
              (d.prototype.formatError = function (t, e) {
                if (null == t) {
                  var n = this.buffer.slice(this.index);
                  t = {
                    text: n,
                    offset: this.index,
                    lineBreaks: -1 === n.indexOf("\n") ? 0 : 1,
                    line: this.line,
                    col: this.col,
                  };
                }
                var r = Math.max(t.line - 2, 1),
                  i = t.line + 2,
                  s = String(i).length,
                  o = (function (t, e) {
                    for (var n = t.length, r = 0; ;) {
                      var i = t.lastIndexOf("\n", n - 1);
                      if (-1 === i) break;
                      if (((n = i), ++r === e)) break;
                      if (0 === n) break;
                    }
                    var s = r < e ? 0 : n + 1;
                    return t.substring(s).split("\n");
                  })(this.buffer, this.line - t.line + 2 + 1).slice(0, 5),
                  u = [];
                (u.push(e + " at line " + t.line + " col " + t.col + ":"), u.push(""));
                for (var a = 0; a < o.length; a++) {
                  var c = o[a],
                    p = r + a;
                  (u.push(l(String(p), s) + "  " + c),
                    p === t.line && u.push(l("", s + t.col + 1) + "^"));
                }
                return u.join("\n");
              }),
              (d.prototype.clone = function () {
                return new d(this.states, this.state);
              }),
              (d.prototype.has = function (t) {
                return !0;
              }),
              {
                compile: function (t) {
                  var e = f(p(t));
                  return new d({ start: e }, "start");
                },
                states: function (t, e) {
                  var n = t.$all ? p(t.$all) : [];
                  delete t.$all;
                  var r = Object.getOwnPropertyNames(t);
                  e || (e = r[0]);
                  for (var i = Object.create(null), s = 0; s < r.length; s++)
                    i[(v = r[s])] = p(t[v]).concat(n);
                  for (s = 0; s < r.length; s++)
                    for (var o = i[(v = r[s])], u = Object.create(null), a = 0; a < o.length; a++) {
                      var l = o[a];
                      if (l.include) {
                        var c = [a, 1];
                        if (l.include !== v && !u[l.include]) {
                          u[l.include] = !0;
                          var h = i[l.include];
                          if (!h)
                            throw new Error(
                              "Cannot include nonexistent state '" +
                                l.include +
                                "' (in state '" +
                                v +
                                "')",
                            );
                          for (var g = 0; g < h.length; g++) {
                            var D = h[g];
                            -1 === o.indexOf(D) && c.push(D);
                          }
                        }
                        (o.splice.apply(o, c), a--);
                      }
                    }
                  var y = Object.create(null);
                  for (s = 0; s < r.length; s++) {
                    var v;
                    y[(v = r[s])] = f(i[v], !0);
                  }
                  for (s = 0; s < r.length; s++) {
                    var b = r[s],
                      w = y[b],
                      E = w.groups;
                    for (a = 0; a < E.length; a++) m(E[a], b, y);
                    var x = Object.getOwnPropertyNames(w.fast);
                    for (a = 0; a < x.length; a++) m(w.fast[x[a]], b, y);
                  }
                  return new d(y, e);
                },
                error: Object.freeze({ error: !0 }),
                fallback: Object.freeze({ fallback: !0 }),
                keywords: function (t) {
                  for (
                    var e = "undefined" != typeof Map,
                      n = e ? new Map() : Object.create(null),
                      r = Object.getOwnPropertyNames(t),
                      i = 0;
                    i < r.length;
                    i++
                  ) {
                    var s = r[i],
                      o = t[s];
                    (Array.isArray(o) ? o : [o]).forEach(function (t) {
                      if ("string" != typeof t)
                        throw new Error("keyword must be string (in keyword '" + s + "')");
                      e ? n.set(t, s) : (n[t] = s);
                    });
                  }
                  return function (t) {
                    return e ? n.get(t) : n[t];
                  };
                },
              }
            );
          });
        })(m)),
      m.exports),
    D = o(g);
  class y extends SyntaxError {
    constructor(t, e) {
      (super(`IndentationError at line ${t}: unexpected indent`),
        (this.line = t),
        (this.col = e),
        (this.name = "UnexpectedIndentError"));
    }
  }
  class v extends SyntaxError {
    constructor(t, e) {
      (super(`IndentationError at line ${t}: unindent does not match any outer indentation level`),
        (this.line = t),
        (this.col = e),
        (this.name = "InconsistentDedentError"));
    }
  }
  const b = D.keywords({
      kw_def: "def",
      kw_if: "if",
      kw_elif: "elif",
      kw_else: "else",
      kw_while: "while",
      kw_for: "for",
      kw_in: "in",
      kw_return: "return",
      kw_pass: "pass",
      kw_break: "break",
      kw_continue: "continue",
      kw_and: "and",
      kw_or: "or",
      kw_not: "not",
      kw_is: "is",
      kw_lambda: "lambda",
      kw_from: "from",
      kw_import: "import",
      kw_global: "global",
      kw_nonlocal: "nonlocal",
      kw_as: "as",
      kw_assert: "assert",
      kw_True: "True",
      kw_False: "False",
      kw_None: "None",
      forbidden_async: "async",
      forbidden_await: "await",
      forbidden_yield: "yield",
      forbidden_with: "with",
      forbidden_del: "del",
      forbidden_try: "try",
      forbidden_except: "except",
      forbidden_finally: "finally",
      forbidden_raise: "raise",
      forbidden_class: "class",
    }),
    w = D.compile({
      newline: { match: /\r?\n/, lineBreaks: !0 },
      ws: /[ \t]+/,
      comment: /#[^\r\n]*/,
      number_complex: /(?:\d+\.?\d*|\.\d+)[jJ]/,
      number_float: /(?:\d+\.\d*|\.\d+)(?:[eE][+-]?\d+)?/,
      number_hex: /0[xX][0-9a-fA-F]+/,
      number_oct: /0[oO][0-7]+/,
      number_bin: /0[bB][01]+/,
      number_int: /\d+/,
      string_triple_double: /"""(?:[^\\]|\\.)*?"""/,
      string_triple_single: /'''(?:[^\\]|\\.)*?'''/,
      string_double: /"(?:[^"\\]|\\.)*"/,
      string_single: /'(?:[^'\\]|\\.)*'/,
      doublestar: "**",
      doubleslash: "//",
      doubleequal: "==",
      notequal: "!=",
      lessequal: "<=",
      greaterequal: ">=",
      doublecolon: "::",
      ellipsis: "...",
      lparen: "(",
      rparen: ")",
      lsqb: "[",
      rsqb: "]",
      lbrace: "{",
      rbrace: "}",
      colon: ":",
      comma: ",",
      plus: "+",
      minus: "-",
      star: "*",
      slash: "/",
      percent: "%",
      less: "<",
      greater: ">",
      equal: "=",
      dot: ".",
      semi: ";",
      name: { match: /[a-zA-Z_][a-zA-Z0-9_]*/, type: b },
    }),
    E = new Set(["(", "[", "{"]),
    x = new Set([")", "]", "}"]);
  function A(t, e) {
    return {
      type: t,
      value: "",
      text: "",
      toString: e.toString,
      offset: e.offset,
      lineBreaks: 0,
      line: e.line,
      col: e.col,
    };
  }
  class F {
    constructor() {
      ((this.tokens = []), (this.pos = 0));
    }
    reset(t, e) {
      if (e && "pos" in e && "number" == typeof e.pos) this.pos = e.pos;
      else if (void 0 !== t) {
        w.reset(t);
        const e = [];
        let n;
        for (; (n = w.next());) e.push(n);
        ((this.tokens = (function (t) {
          const e = [],
            n = [""];
          let r = 0,
            i = 0;
          {
            let e = 0;
            for (; e < t.length && ("comment" === t[e].type || "newline" === t[e].type);) e++;
            if (e < t.length && "ws" === t[e].type) throw new y(t[e].line, t[e].col);
          }
          for (; i < t.length;) {
            const s = t[i];
            if ("ws" !== s.type && "comment" !== s.type)
              if (E.has(s.text)) (r++, e.push(s), i++);
              else if (x.has(s.text)) (r--, e.push(s), i++);
              else if ("newline" === s.type && r > 0) i++;
              else {
                if ("newline" === s.type) {
                  (e.push(s), i++);
                  let r = "";
                  for (; i < t.length;) {
                    const e = t[i];
                    if ("ws" !== e.type)
                      if ("comment" !== e.type) {
                        if ("newline" !== e.type) break;
                        (i++, (r = ""));
                      } else (i++, i < t.length && "newline" === t[i].type && i++, (r = ""));
                    else ((r = e.text), i++);
                  }
                  if (i >= t.length) {
                    const r = t[t.length - 1];
                    for (; n.length > 1;) (n.pop(), e.push(A("dedent", r)));
                    continue;
                  }
                  const o = n[n.length - 1];
                  if (r === o);
                  else if (r.startsWith(o) && r.length > o.length)
                    (n.push(r), e.push(A("indent", t[i])));
                  else {
                    for (; n.length > 1 && n[n.length - 1] !== r;)
                      (n.pop(), e.push(A("dedent", t[i])));
                    if (n[n.length - 1] !== r) throw new v(t[i].line, t[i].col);
                  }
                  continue;
                }
                (e.push(s), i++);
              }
            else i++;
          }
          if (n.length > 1) {
            const r =
              t.length > 0 ? t[t.length - 1] : { toString: () => "", offset: 0, line: 1, col: 1 };
            for (; n.length > 1;) (n.pop(), e.push(A("dedent", r)));
          }
          return e;
        })(e)),
          (this.pos = 0));
      }
      return this;
    }
    next() {
      if (!(this.pos >= this.tokens.length)) return this.tokens[this.pos++];
    }
    save() {
      return { pos: this.pos };
    }
    has(t) {
      return "indent" === t || "dedent" === t || w.has(t);
    }
    formatError(t, e) {
      return w.formatError(t, e);
    }
    pushState(t) {
      w.pushState(t);
    }
    popState() {
      w.popState();
    }
    setState(t) {
      w.setState(t);
    }
    [Symbol.iterator]() {
      return {
        next: () => {
          const t = this.next();
          return { value: t, done: !t };
        },
      };
    }
  }
  const C = new F();
  var _, N, S, B;
  !(function (t) {
    ((t[(t.ENDMARKER = 0)] = "ENDMARKER"),
      (t[(t.NAME = 1)] = "NAME"),
      (t[(t.NUMBER = 2)] = "NUMBER"),
      (t[(t.BIGINT = 3)] = "BIGINT"),
      (t[(t.STRING = 4)] = "STRING"),
      (t[(t.NEWLINE = 5)] = "NEWLINE"),
      (t[(t.INDENT = 6)] = "INDENT"),
      (t[(t.DEDENT = 7)] = "DEDENT"),
      (t[(t.LPAR = 8)] = "LPAR"),
      (t[(t.RPAR = 9)] = "RPAR"),
      (t[(t.COLON = 10)] = "COLON"),
      (t[(t.DOUBLECOLON = 11)] = "DOUBLECOLON"),
      (t[(t.COMMA = 12)] = "COMMA"),
      (t[(t.PLUS = 13)] = "PLUS"),
      (t[(t.MINUS = 14)] = "MINUS"),
      (t[(t.BANG = 15)] = "BANG"),
      (t[(t.STAR = 16)] = "STAR"),
      (t[(t.SLASH = 17)] = "SLASH"),
      (t[(t.VBAR = 18)] = "VBAR"),
      (t[(t.AMPER = 19)] = "AMPER"),
      (t[(t.LESS = 20)] = "LESS"),
      (t[(t.GREATER = 21)] = "GREATER"),
      (t[(t.EQUAL = 22)] = "EQUAL"),
      (t[(t.PERCENT = 23)] = "PERCENT"),
      (t[(t.DOUBLEEQUAL = 24)] = "DOUBLEEQUAL"),
      (t[(t.NOTEQUAL = 25)] = "NOTEQUAL"),
      (t[(t.LESSEQUAL = 26)] = "LESSEQUAL"),
      (t[(t.GREATEREQUAL = 27)] = "GREATEREQUAL"),
      (t[(t.DOUBLESTAR = 28)] = "DOUBLESTAR"),
      (t[(t.COMPLEX = 29)] = "COMPLEX"),
      (t[(t.AND = 30)] = "AND"),
      (t[(t.OR = 31)] = "OR"),
      (t[(t.FOR = 32)] = "FOR"),
      (t[(t.WHILE = 33)] = "WHILE"),
      (t[(t.NONE = 34)] = "NONE"),
      (t[(t.TRUE = 35)] = "TRUE"),
      (t[(t.FALSE = 36)] = "FALSE"),
      (t[(t.IS = 37)] = "IS"),
      (t[(t.NOT = 38)] = "NOT"),
      (t[(t.ISNOT = 39)] = "ISNOT"),
      (t[(t.PASS = 40)] = "PASS"),
      (t[(t.DEF = 41)] = "DEF"),
      (t[(t.LAMBDA = 42)] = "LAMBDA"),
      (t[(t.FROM = 43)] = "FROM"),
      (t[(t.DOUBLESLASH = 44)] = "DOUBLESLASH"),
      (t[(t.BREAK = 45)] = "BREAK"),
      (t[(t.CONTINUE = 46)] = "CONTINUE"),
      (t[(t.RETURN = 47)] = "RETURN"),
      (t[(t.ASSERT = 48)] = "ASSERT"),
      (t[(t.IMPORT = 49)] = "IMPORT"),
      (t[(t.GLOBAL = 50)] = "GLOBAL"),
      (t[(t.NONLOCAL = 51)] = "NONLOCAL"),
      (t[(t.IF = 52)] = "IF"),
      (t[(t.ELSE = 53)] = "ELSE"),
      (t[(t.ELIF = 54)] = "ELIF"),
      (t[(t.IN = 55)] = "IN"),
      (t[(t.NOTIN = 56)] = "NOTIN"),
      (t[(t.RSQB = 57)] = "RSQB"),
      (t[(t.LSQB = 58)] = "LSQB"),
      (t[(t.ELLIPSIS = 59)] = "ELLIPSIS"),
      (t[(t.SEMI = 60)] = "SEMI"),
      (t[(t.DOT = 61)] = "DOT"),
      (t[(t.LBRACE = 62)] = "LBRACE"),
      (t[(t.RBRACE = 63)] = "RBRACE"),
      (t[(t.TILDE = 64)] = "TILDE"),
      (t[(t.CIRCUMFLEX = 65)] = "CIRCUMFLEX"),
      (t[(t.LEFTSHIFT = 66)] = "LEFTSHIFT"),
      (t[(t.RIGHTSHIFT = 67)] = "RIGHTSHIFT"),
      (t[(t.PLUSEQUAL = 68)] = "PLUSEQUAL"),
      (t[(t.MINEQUAL = 69)] = "MINEQUAL"),
      (t[(t.STAREQUAL = 70)] = "STAREQUAL"),
      (t[(t.SLASHEQUAL = 71)] = "SLASHEQUAL"),
      (t[(t.PERCENTEQUAL = 72)] = "PERCENTEQUAL"),
      (t[(t.AMPEREQUAL = 73)] = "AMPEREQUAL"),
      (t[(t.VBAREQUAL = 74)] = "VBAREQUAL"),
      (t[(t.CIRCUMFLEXEQUAL = 75)] = "CIRCUMFLEXEQUAL"),
      (t[(t.LEFTSHIFTEQUAL = 76)] = "LEFTSHIFTEQUAL"),
      (t[(t.RIGHTSHIFTEQUAL = 77)] = "RIGHTSHIFTEQUAL"),
      (t[(t.DOUBLESTAREQUAL = 78)] = "DOUBLESTAREQUAL"),
      (t[(t.DOUBLESLASHEQUAL = 79)] = "DOUBLESLASHEQUAL"),
      (t[(t.AT = 80)] = "AT"),
      (t[(t.ATEQUAL = 81)] = "ATEQUAL"),
      (t[(t.RARROW = 82)] = "RARROW"),
      (t[(t.COLONEQUAL = 83)] = "COLONEQUAL"),
      (t[(t.OP = 84)] = "OP"),
      (t[(t.AWAIT = 85)] = "AWAIT"),
      (t[(t.ASYNC = 86)] = "ASYNC"),
      (t[(t.TYPE_IGNORE = 87)] = "TYPE_IGNORE"),
      (t[(t.TYPE_COMMENT = 88)] = "TYPE_COMMENT"),
      (t[(t.YIELD = 89)] = "YIELD"),
      (t[(t.WITH = 90)] = "WITH"),
      (t[(t.DEL = 91)] = "DEL"),
      (t[(t.TRY = 92)] = "TRY"),
      (t[(t.EXCEPT = 93)] = "EXCEPT"),
      (t[(t.FINALLY = 94)] = "FINALLY"),
      (t[(t.RAISE = 95)] = "RAISE"));
  })(_ || (_ = {}));
  class M {
    constructor(t, e, n, r, i) {
      ((this.type = t),
        (this.lexeme = e),
        (this.line = n),
        (this.col = r),
        (this.indexInSource = i));
    }
  }
  (!(function (t) {
    ((t.RESET = "Reset"),
      (t.WHILE = "WhileInstr"),
      (t.FOR = "ForInstr"),
      (t.ASSIGNMENT = "Assignment"),
      (t.LIST_ASSIGNMENT = "ListAssignment"),
      (t.APPLICATION = "Application"),
      (t.UNARY_OP = "UnaryOperation"),
      (t.BINARY_OP = "BinaryOperation"),
      (t.BOOL_OP = "BoolOperation"),
      (t.BREAK = "BreakInstr"),
      (t.CONTINUE = "ContinueInstr"),
      (t.LIST = "ListLiteral"),
      (t.BRANCH = "Branch"),
      (t.POP = "Pop"),
      (t.ENVIRONMENT = "environment"),
      (t.CONTINUE_MARKER = "continueMarker"),
      (t.END_OF_FUNCTION_BODY = "EndOfFunctionBody"),
      (t.LIST_ACCESS = "ListAccess"));
  })(N || (N = {})),
    (function (t) {
      ((t.IMPORT = "Import"), (t.RUNTIME = "Runtime"), (t.SYNTAX = "Syntax"), (t.TYPE = "Type"));
    })(S || (S = {})),
    (function (t) {
      ((t.WARNING = "Warning"), (t.ERROR = "Error"));
    })(B || (B = {})));
  const T = { start: { line: -1, column: -1 }, end: { line: -1, column: -1 } };
  class L {
    constructor(t) {
      ((this.type = S.RUNTIME),
        (this.severity = B.ERROR),
        (this.message = "Error"),
        (this.location = t
          ? {
              start: { line: t.startToken.line, column: t.startToken.col },
              end: { line: t.startToken.line, column: t.startToken.col },
            }
          : T));
    }
    explain() {
      return "";
    }
    elaborate() {
      return this.explain();
    }
  }
  function k(t, e) {
    let n = e,
      r = e;
    for (; n > 0 && "\n" != t[n];) n--;
    for ("\n" === t[n] && n++; r < t.length && "\n" != t[r];) r++;
    return { lineIndex: t.slice(0, n).split("\n").length, fullLine: t.slice(n, r) };
  }
  function I(t, e) {
    let n = "";
    for (let r = 0; r < t.length; r++) n += r === e ? "^" : "~";
    return n;
  }
  class O extends L {
    constructor(t, e, n, r, i, s) {
      (super(e), (this.type = S.TYPE), (this.functionName = n));
      let o = "exactly";
      s && (o = "at least");
      const u = e.startToken.indexInSource,
        { lineIndex: a, fullLine: l } = k(t, u);
      if (
        ((this.message = "TypeError at line " + a + "\n\n    " + l + "\n"), "number" == typeof r)
      ) {
        ((this.missingParamCnt = r), (this.missingParamName = ""));
        const t = i.length;
        1 === this.missingParamCnt || this.missingParamCnt;
        const e = `TypeError: ${this.functionName}() takes ${o} ${this.missingParamCnt} argument (${t} given)\nCheck the function definition of '${this.functionName}' and make sure to provide all required positional arguments in the correct order.`;
        this.message += e;
      } else {
        this.missingParamCnt = r.length - i.length;
        const t = [];
        for (let e = i.length; e < r.length; e++) {
          const n = r[e].name;
          t.push("'" + n + "'");
        }
        this.missingParamName = this.joinWithCommasAndAnd(t);
        const e = `TypeError: ${this.functionName}() missing ${this.missingParamCnt} required positional argument(s): ${this.missingParamName}\nYou called ${this.functionName}() without providing the required positional argument ${this.missingParamName}. Make sure to pass all required arguments when calling ${this.functionName}.`;
        this.message += e;
      }
    }
    joinWithCommasAndAnd(t) {
      if (0 === t.length) return "";
      if (1 === t.length) return t[0];
      if (2 === t.length) return `${t[0]} and ${t[1]}`;
      {
        const e = t.pop();
        return `${t.join(", ")} and ${e}`;
      }
    }
  }
  class R extends L {
    constructor(t, e, n, r, i, s) {
      (super(e), (this.type = S.TYPE), (this.functionName = n));
      let o = "exactly";
      s && (o = "at most");
      const u = e.startToken.indexInSource,
        { lineIndex: a, fullLine: l } = k(t, u);
      ((this.message = "TypeError at line " + a + "\n\n    " + l + "\n"),
        "number" == typeof r
          ? ((this.expectedCount = r),
            (this.givenCount = i.length),
            1 === this.expectedCount || 0 === this.expectedCount
              ? (this.message += `TypeError: ${this.functionName}() takes ${o} ${this.expectedCount} argument (${this.givenCount} given)`)
              : (this.message += `TypeError: ${this.functionName}() takes ${o} ${this.expectedCount} arguments (${this.givenCount} given)`))
          : ((this.expectedCount = r.length),
            (this.givenCount = i.length),
            1 === this.expectedCount || 0 === this.expectedCount
              ? (this.message += `TypeError: ${this.functionName}() takes ${this.expectedCount} positional argument but ${this.givenCount} were given`)
              : (this.message += `TypeError: ${this.functionName}() takes ${this.expectedCount} positional arguments but ${this.givenCount} were given`)),
        (this.message += `\nRemove the extra argument(s) when calling '${this.functionName}', or check if the function definition accepts more arguments.`));
    }
  }
  class P extends L {
    constructor(t, e) {
      (super(e), (this.type = S.TYPE));
      const n = e.startToken.indexInSource,
        { lineIndex: r, fullLine: i } = k(t, n),
        s = t.substring(
          e.startToken.indexInSource,
          e.endToken.indexInSource + e.endToken.lexeme.length,
        );
      let o = "ZeroDivisionError: division by zero.";
      const u = i.indexOf(s),
        a = u >= 0 ? u : 0,
        l = I(s, e.operator.indexInSource - e.startToken.indexInSource);
      switch (e.operator.lexeme) {
        case "/":
        default:
          o = "ZeroDivisionError: division by zero.";
          break;
        case "//":
          o = "ZeroDivisionError: integer division or modulo by zero.";
          break;
        case "%":
          o = "ZeroDivisionError: integer modulo by zero.";
          break;
        case "**":
          o = "ZeroDivisionError: 0.0 cannot be raised to a negative power.";
      }
      const c =
        "ZeroDivisionError at line " +
        r +
        "\n\n    " +
        i +
        "\n    " +
        " ".repeat(a) +
        l +
        "\n" +
        o +
        "\nYou attempted to divide by zero. Division or modulo operations cannot be performed with a divisor of zero. Please ensure that the divisor is non-zero before performing the operation.";
      this.message = c;
    }
  }
  class $ extends L {
    constructor(t, e, n, r) {
      (super(e), (this.type = S.TYPE));
      const i = e.startToken.indexInSource,
        { lineIndex: s, fullLine: o } = k(t, i),
        u = t.substring(
          e.startToken.indexInSource,
          e.endToken.indexInSource + e.endToken.lexeme.length,
        ),
        a = o.indexOf(u),
        l = I(u, 0),
        c = `Ensure that the input value(s) passed to '${r}' satisfy the mathematical requirements`,
        p =
          "ValueError at line " +
          s +
          "\n\n    " +
          o +
          "\n    " +
          " ".repeat(a) +
          l +
          "\nValueError: math domain error. " +
          c;
      this.message = p;
    }
  }
  let U = class extends L {
    constructor(t, e, n, r, i) {
      (super(e),
        (r = (function (t) {
          switch (t) {
            case "bigint":
              return "int";
            case "number":
              return "float";
            case "bool":
              return "bool";
            case "string":
              return "str";
            case "complex":
              return "complex";
            case "none":
              return "NoneType";
            case "closure":
              return "function";
            default:
              return "unknown";
          }
        })(r)),
        (this.type = S.TYPE));
      const s = e.startToken.indexInSource,
        { lineIndex: o, fullLine: u } = k(t, s),
        a = t.substring(
          e.startToken.indexInSource,
          e.endToken.indexInSource + e.endToken.lexeme.length,
        ),
        l = "TypeError: '" + r + "' cannot be interpreted as an '" + i + "'.",
        c = u.indexOf(a),
        p = c >= 0 ? c : 0,
        h = I(a, 0),
        f =
          "TypeError at line " +
          o +
          "\n\n    " +
          u +
          "\n    " +
          " ".repeat(p) +
          h +
          "\n" +
          l +
          " Make sure the value you are passing is compatible with the expected type.";
      this.message = f;
    }
  };
  class z extends L {
    constructor(t, e) {
      (super(e), (this.type = S.RUNTIME), (this.message = t));
    }
  }
  function G(t, e) {
    throw (t.errors.push(e), e);
  }
  class j {
    constructor(t, e) {
      ((this.real = t), (this.imag = e));
    }
    static fromNumber(t) {
      return new j(t, 0);
    }
    static fromBigInt(t) {
      return new j(Number(t), 0);
    }
    static fromString(t) {
      const e = t,
        n = (t = t.trim().replace(/_/g, "").toLowerCase())
          .split(/(?<!e)(?=[+-])/, 2)
          .filter(t => "" !== t),
        r = {
          infinity: 1 / 0,
          "+infinity": 1 / 0,
          "-infinity": -1 / 0,
          inf: 1 / 0,
          "+inf": 1 / 0,
          "-inf": -1 / 0,
          nan: NaN,
          "+nan": NaN,
          "-nan": NaN,
        };
      if (0 === n.length) throw new Error(`Invalid complex string: ${e}`);
      if (1 === n.length) {
        const n = t.endsWith("j");
        if (t.endsWith("j") && ("" == (t = t.slice(0, -1)) || "+" === t || "-" === t))
          return new j(0, "-" === t ? -1 : 1);
        if (t in r) {
          const e = r[t];
          return new j(n ? 0 : e, n ? e : 0);
        }
        const i = Number(t);
        if (isNaN(i)) throw new Error(`Invalid complex string: ${e}`);
        return new j(n ? 0 : i, n ? i : 0);
      }
      const [i, s] = n,
        o = s.slice(0, -1);
      if (!s.endsWith("j")) throw new Error(`Invalid complex string: ${e}`);
      if (!(i in r) && isNaN(Number(i))) throw new Error(`Invalid complex string: ${e}`);
      if (!(o in r) && !["+", "-", ""].includes(o) && isNaN(Number(o)))
        throw new Error(`Invalid complex string: ${e}`);
      const u = i in r ? r[i] : Number(i),
        a = o in r ? r[o] : "+" === o || "" === o ? 1 : "-" === o ? -1 : Number(o);
      return new j(u, a);
    }
    static fromValue(t, e, n, r) {
      if (r instanceof j) return new j(r.real, r.imag);
      if ("boolean" == typeof r) return new j(r ? 1 : 0, 0);
      if ("number" == typeof r) return j.fromNumber(r);
      if ("bigint" == typeof r) return j.fromBigInt(r);
      try {
        return j.fromString(r);
      } catch {
        G(t, new $(e, n, t, "complex"));
      }
    }
    add(t) {
      return new j(this.real + t.real, this.imag + t.imag);
    }
    sub(t) {
      return new j(this.real - t.real, this.imag - t.imag);
    }
    mul(t) {
      const e = this.real * t.real - this.imag * t.imag,
        n = this.real * t.imag + this.imag * t.real;
      return new j(e, n);
    }
    div(t, e, n, r) {
      0 === r.real * r.real + r.imag * r.imag && G(n, new P(t, e));
      const i = this.real,
        s = this.imag,
        o = r.real,
        u = r.imag,
        a = Math.abs(o);
      let l, c;
      if (Math.abs(u) < a) {
        const t = u / o,
          e = o + u * t;
        ((l = (i + s * t) / e), (c = (s - i * t) / e));
      } else {
        const t = o / u,
          e = u + o * t;
        ((l = (i * t + s) / e), (c = (s * t - i) / e));
      }
      return new j(l, c);
    }
    pow(t) {
      const e = this.real,
        n = this.imag,
        r = t.real,
        i = t.imag,
        s = Math.sqrt(e * e + n * n),
        o = Math.atan2(n, e);
      if (0 === s) {
        if (r < 0 || 0 !== i) throw new Error("0 cannot be raised to a negative or complex power");
        return new j(0, 0);
      }
      const u = Math.log(s),
        a = r * u - i * o,
        l = i * u + r * o,
        c = Math.exp(a),
        p = c * Math.cos(l),
        h = c * Math.sin(l);
      return new j(p, h);
    }
    toString() {
      if (0 === this.real) return `${this.imag}j`;
      const t = this.imag >= 0 ? "+" : "";
      return `(${this.toPythonComplexFloat(this.real)}${t}${this.toPythonComplexFloat(this.imag)}j)`;
    }
    toPythonComplexFloat(t) {
      return t === 1 / 0
        ? "inf"
        : t === -1 / 0
          ? "-inf"
          : Math.abs(t) >= 1e16 || (0 !== t && Math.abs(t) < 1e-4)
            ? t.toExponential().replace(/e([+-])(\d)$/, "e$10$2")
            : t.toString();
    }
    equals(t) {
      return Number(this.real) === Number(t.real) && Number(this.imag) === Number(t.imag);
    }
  }
  var q, V;
  (!(function (t) {
    class e {
      constructor(t, e) {
        ((this.startToken = t), (this.endToken = e));
      }
    }
    ((t.Expr = e),
      (t.BigIntLiteral = class extends e {
        constructor(t, e, n) {
          (super(t, e), (this.kind = "BigIntLiteral"), (this.value = n));
        }
        accept(t) {
          return t.visitBigIntLiteralExpr(this);
        }
      }),
      (t.Binary = class extends e {
        constructor(t, e, n, r, i) {
          (super(t, e),
            (this.kind = "Binary"),
            (this.left = n),
            (this.operator = r),
            (this.right = i));
        }
        accept(t) {
          return t.visitBinaryExpr(this);
        }
      }),
      (t.Compare = class extends e {
        constructor(t, e, n, r, i) {
          (super(t, e),
            (this.kind = "Compare"),
            (this.left = n),
            (this.operator = r),
            (this.right = i));
        }
        accept(t) {
          return t.visitCompareExpr(this);
        }
      }),
      (t.BoolOp = class extends e {
        constructor(t, e, n, r, i) {
          (super(t, e),
            (this.kind = "BoolOp"),
            (this.left = n),
            (this.operator = r),
            (this.right = i));
        }
        accept(t) {
          return t.visitBoolOpExpr(this);
        }
      }),
      (t.Grouping = class extends e {
        constructor(t, e, n) {
          (super(t, e), (this.kind = "Grouping"), (this.expression = n));
        }
        accept(t) {
          return t.visitGroupingExpr(this);
        }
      }),
      (t.Literal = class extends e {
        constructor(t, e, n) {
          (super(t, e), (this.kind = "Literal"), (this.value = n));
        }
        accept(t) {
          return t.visitLiteralExpr(this);
        }
      }),
      (t.Unary = class extends e {
        constructor(t, e, n, r) {
          (super(t, e), (this.kind = "Unary"), (this.operator = n), (this.right = r));
        }
        accept(t) {
          return t.visitUnaryExpr(this);
        }
      }),
      (t.Ternary = class extends e {
        constructor(t, e, n, r, i) {
          (super(t, e),
            (this.kind = "Ternary"),
            (this.predicate = n),
            (this.consequent = r),
            (this.alternative = i));
        }
        accept(t) {
          return t.visitTernaryExpr(this);
        }
      }),
      (t.Lambda = class extends e {
        constructor(t, e, n, r) {
          (super(t, e), (this.kind = "Lambda"), (this.parameters = n), (this.body = r));
        }
        accept(t) {
          return t.visitLambdaExpr(this);
        }
      }),
      (t.MultiLambda = class extends e {
        constructor(t, e, n, r, i) {
          (super(t, e),
            (this.kind = "MultiLambda"),
            (this.parameters = n),
            (this.body = r),
            (this.varDecls = i));
        }
        accept(t) {
          return t.visitMultiLambdaExpr(this);
        }
      }),
      (t.Variable = class extends e {
        constructor(t, e, n) {
          (super(t, e), (this.kind = "Variable"), (this.name = n));
        }
        accept(t) {
          return t.visitVariableExpr(this);
        }
      }),
      (t.Call = class extends e {
        constructor(t, e, n, r) {
          (super(t, e), (this.kind = "Call"), (this.callee = n), (this.args = r));
        }
        accept(t) {
          return t.visitCallExpr(this);
        }
      }),
      (t.List = class extends e {
        constructor(t, e, n) {
          (super(t, e), (this.kind = "List"), (this.elements = n));
        }
        accept(t) {
          return t.visitListExpr(this);
        }
      }),
      (t.Subscript = class extends e {
        constructor(t, e, n, r) {
          (super(t, e), (this.kind = "Subscript"), (this.value = n), (this.index = r));
        }
        accept(t) {
          return t.visitSubscriptExpr(this);
        }
      }),
      (t.Starred = class extends e {
        constructor(t, e, n) {
          (super(t, e), (this.kind = "Starred"), (this.value = n));
        }
        accept(t) {
          return t.visitStarredExpr(this);
        }
      }),
      (t.None = class extends e {
        constructor(t, e) {
          (super(t, e), (this.kind = "None"));
        }
        accept(t) {
          return t.visitNoneExpr(this);
        }
      }),
      (t.Complex = class extends e {
        constructor(t, e, n) {
          (super(t, e), (this.kind = "Complex"), (this.value = j.fromString(n)));
        }
        accept(t) {
          return t.visitComplexExpr(this);
        }
      }));
  })(q || (q = {})),
    (function (t) {
      class e {
        constructor(t, e) {
          ((this.startToken = t), (this.endToken = e));
        }
      }
      ((t.Stmt = e),
        (t.Pass = class extends e {
          constructor(t, e) {
            (super(t, e), (this.kind = "Pass"));
          }
          accept(t) {
            return t.visitPassStmt(this);
          }
        }),
        (t.Assign = class extends e {
          constructor(t, e, n, r) {
            (super(t, e), (this.kind = "Assign"), (this.target = n), (this.value = r));
          }
          accept(t) {
            return t.visitAssignStmt(this);
          }
        }),
        (t.AnnAssign = class extends e {
          constructor(t, e, n, r, i) {
            (super(t, e),
              (this.kind = "AnnAssign"),
              (this.target = n),
              (this.value = r),
              (this.ann = i));
          }
          accept(t) {
            return t.visitAnnAssignStmt(this);
          }
        }),
        (t.Break = class extends e {
          constructor(t, e) {
            (super(t, e), (this.kind = "Break"));
          }
          accept(t) {
            return t.visitBreakStmt(this);
          }
        }),
        (t.Continue = class extends e {
          constructor(t, e) {
            (super(t, e), (this.kind = "Continue"));
          }
          accept(t) {
            return t.visitContinueStmt(this);
          }
        }),
        (t.Return = class extends e {
          constructor(t, e, n) {
            (super(t, e), (this.kind = "Return"), (this.value = n));
          }
          accept(t) {
            return t.visitReturnStmt(this);
          }
        }),
        (t.FromImport = class extends e {
          constructor(t, e, n, r) {
            (super(t, e), (this.kind = "FromImport"), (this.module = n), (this.names = r));
          }
          accept(t) {
            return t.visitFromImportStmt(this);
          }
        }),
        (t.Global = class extends e {
          constructor(t, e, n) {
            (super(t, e), (this.kind = "Global"), (this.name = n));
          }
          accept(t) {
            return t.visitGlobalStmt(this);
          }
        }),
        (t.NonLocal = class extends e {
          constructor(t, e, n) {
            (super(t, e), (this.kind = "NonLocal"), (this.name = n));
          }
          accept(t) {
            return t.visitNonLocalStmt(this);
          }
        }),
        (t.Assert = class extends e {
          constructor(t, e, n) {
            (super(t, e), (this.kind = "Assert"), (this.value = n));
          }
          accept(t) {
            return t.visitAssertStmt(this);
          }
        }),
        (t.If = class extends e {
          constructor(t, e, n, r, i) {
            (super(t, e),
              (this.kind = "If"),
              (this.condition = n),
              (this.body = r),
              (this.elseBlock = i));
          }
          accept(t) {
            return t.visitIfStmt(this);
          }
        }),
        (t.While = class extends e {
          constructor(t, e, n, r) {
            (super(t, e), (this.kind = "While"), (this.condition = n), (this.body = r));
          }
          accept(t) {
            return t.visitWhileStmt(this);
          }
        }),
        (t.For = class extends e {
          constructor(t, e, n, r, i) {
            (super(t, e), (this.kind = "For"), (this.target = n), (this.iter = r), (this.body = i));
          }
          accept(t) {
            return t.visitForStmt(this);
          }
        }),
        (t.FunctionDef = class extends e {
          constructor(t, e, n, r, i, s) {
            (super(t, e),
              (this.kind = "FunctionDef"),
              (this.name = n),
              (this.parameters = r),
              (this.body = i),
              (this.varDecls = s));
          }
          accept(t) {
            return t.visitFunctionDefStmt(this);
          }
        }),
        (t.SimpleExpr = class extends e {
          constructor(t, e, n) {
            (super(t, e), (this.kind = "SimpleExpr"), (this.expression = n));
          }
          accept(t) {
            return t.visitSimpleExprStmt(this);
          }
        }),
        (t.FileInput = class extends e {
          constructor(t, e, n, r) {
            (super(t, e), (this.kind = "FileInput"), (this.statements = n), (this.varDecls = r));
          }
          accept(t) {
            return t.visitFileInputStmt(this);
          }
        }));
    })(V || (V = {})));
  const W = {
    name: _.NAME,
    number_float: _.NUMBER,
    number_hex: _.BIGINT,
    number_oct: _.BIGINT,
    number_bin: _.BIGINT,
    number_int: _.BIGINT,
    number_complex: _.COMPLEX,
    string_triple_double: _.STRING,
    string_triple_single: _.STRING,
    string_double: _.STRING,
    string_single: _.STRING,
    newline: _.NEWLINE,
    indent: _.INDENT,
    dedent: _.DEDENT,
    kw_if: _.IF,
    kw_else: _.ELSE,
    kw_elif: _.ELIF,
    kw_while: _.WHILE,
    kw_for: _.FOR,
    kw_in: _.IN,
    kw_def: _.DEF,
    kw_return: _.RETURN,
    kw_pass: _.PASS,
    kw_break: _.BREAK,
    kw_continue: _.CONTINUE,
    kw_lambda: _.LAMBDA,
    kw_None: _.NONE,
    kw_True: _.TRUE,
    kw_False: _.FALSE,
    kw_and: _.AND,
    kw_or: _.OR,
    kw_not: _.NOT,
    kw_is: _.IS,
    kw_from: _.FROM,
    kw_import: _.IMPORT,
    kw_global: _.GLOBAL,
    kw_nonlocal: _.NONLOCAL,
    kw_assert: _.ASSERT,
    doublestar: _.DOUBLESTAR,
    doubleslash: _.DOUBLESLASH,
    doubleequal: _.DOUBLEEQUAL,
    notequal: _.NOTEQUAL,
    lessequal: _.LESSEQUAL,
    greaterequal: _.GREATEREQUAL,
    doublecolon: _.DOUBLECOLON,
    lparen: _.LPAR,
    rparen: _.RPAR,
    lsqb: _.LSQB,
    rsqb: _.RSQB,
    colon: _.COLON,
    comma: _.COMMA,
    plus: _.PLUS,
    minus: _.MINUS,
    star: _.STAR,
    slash: _.SLASH,
    percent: _.PERCENT,
    less: _.LESS,
    greater: _.GREATER,
    equal: _.EQUAL,
  };
  function Q(t) {
    const e = void 0 !== t.type ? (W[t.type] ?? _.NAME) : _.NAME,
      n = t.value ?? "",
      r = (t.col ?? 1) + n.length;
    return new M(e, n, t.line ?? 0, r, t.offset ?? 0);
  }
  function H(t, e) {
    return Object.assign(Q(t), { isStarred: e });
  }
  function Z(t) {
    return t[0];
  }
  const J = ([t]) => {
      const e = Q(t);
      return new q.BigIntLiteral(e, e, t.value);
    },
    Y = ([t]) => {
      const e = Q(t);
      return new q.Literal(
        e,
        e,
        (function (t) {
          let e;
          if (t.startsWith('"""') || t.startsWith("'''")) e = t.slice(3, -3);
          else {
            if (!t.startsWith('"') && !t.startsWith("'")) return t;
            e = t.slice(1, -1);
          }
          return e.replace(/\\(["'\\\/bfnrtav0]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|.)/g, (t, e) => {
            switch (e[0]) {
              case "n":
                return "\n";
              case "t":
                return "\t";
              case "r":
                return "\r";
              case "\\":
                return "\\";
              case "'":
                return "'";
              case '"':
                return '"';
              case "/":
                return "/";
              case "b":
                return "\b";
              case "f":
                return "\f";
              case "a":
                return "";
              case "v":
                return "\v";
              case "0":
                return "\0";
              case "x":
              case "u":
                return String.fromCharCode(parseInt(e.slice(1), 16));
              default:
                return "\\" + e;
            }
          });
        })(t.value),
      );
    },
    X = ([t, e, n]) => new q.Binary(t.startToken, n.endToken, t, e, n),
    K = ([t, e, n]) => new q.BoolOp(t.startToken, n.endToken, t, Q(e), n),
    tt = ([t, e]) => new q.Unary(Q(t), e.endToken, Q(t), e),
    et = ([t]) => Q(t),
    nt = ([t, e]) => [t, ...e.map(t => t[1])],
    rt = [
      { name: "program$ebnf$1", symbols: [] },
      { name: "program$ebnf$1$subexpression$1", symbols: ["import_stmt", { type: "newline" }] },
      {
        name: "program$ebnf$1",
        symbols: ["program$ebnf$1", "program$ebnf$1$subexpression$1"],
        postprocess: function (t) {
          return t[0].concat([t[1]]);
        },
      },
      { name: "program$ebnf$2", symbols: [] },
      { name: "program$ebnf$2$subexpression$1", symbols: ["statement"] },
      { name: "program$ebnf$2$subexpression$1", symbols: [{ type: "newline" }] },
      {
        name: "program$ebnf$2",
        symbols: ["program$ebnf$2", "program$ebnf$2$subexpression$1"],
        postprocess: function (t) {
          return t[0].concat([t[1]]);
        },
      },
      {
        name: "program",
        symbols: ["program$ebnf$1", "program$ebnf$2"],
        postprocess: ([t, e]) => {
          const n = t.map(t => t[0]),
            r = e.map(t => t[0]).filter(t => "startToken" in t),
            i = [...n, ...r],
            s = i[0]
              ? i[0].startToken
              : Q({ type: "newline", value: "", line: 1, col: 1, offset: 0 }),
            o = i.length > 0 ? i[i.length - 1].endToken : s;
          return new V.FileInput(s, o, i, []);
        },
      },
      {
        name: "import_stmt",
        symbols: [{ literal: "from" }, "dotted_name", { literal: "import" }, "import_clause"],
        postprocess: ([t, e, , n]) => {
          const r = n[n.length - 1],
            i = r.alias || r.name;
          return new V.FromImport(Q(t), i, e, n);
        },
      },
      { name: "dotted_name$ebnf$1", symbols: [] },
      { name: "dotted_name$ebnf$1$subexpression$1", symbols: [{ literal: "." }, { type: "name" }] },
      {
        name: "dotted_name$ebnf$1",
        symbols: ["dotted_name$ebnf$1", "dotted_name$ebnf$1$subexpression$1"],
        postprocess: function (t) {
          return t[0].concat([t[1]]);
        },
      },
      {
        name: "dotted_name",
        symbols: [{ type: "name" }, "dotted_name$ebnf$1"],
        postprocess: ([t, e]) => {
          const n = Q(t);
          for (const [, t] of e) {
            const e = Q(t);
            n.lexeme = n.lexeme + "." + e.lexeme;
          }
          return n;
        },
      },
      { name: "import_clause", symbols: ["import_as_names"], postprocess: Z },
      {
        name: "import_clause",
        symbols: [{ literal: "(" }, "import_as_names", { literal: ")" }],
        postprocess: ([, t]) => t,
      },
      { name: "import_as_names$ebnf$1", symbols: [] },
      {
        name: "import_as_names$ebnf$1$subexpression$1",
        symbols: [{ literal: "," }, "import_as_name"],
      },
      {
        name: "import_as_names$ebnf$1",
        symbols: ["import_as_names$ebnf$1", "import_as_names$ebnf$1$subexpression$1"],
        postprocess: function (t) {
          return t[0].concat([t[1]]);
        },
      },
      {
        name: "import_as_names",
        symbols: ["import_as_name", "import_as_names$ebnf$1"],
        postprocess: nt,
      },
      {
        name: "import_as_name",
        symbols: [{ type: "name" }],
        postprocess: ([t]) => ({ name: Q(t), alias: null }),
      },
      {
        name: "import_as_name",
        symbols: [{ type: "name" }, { literal: "as" }, { type: "name" }],
        postprocess: ([t, , e]) => ({ name: Q(t), alias: Q(e) }),
      },
      { name: "statement", symbols: ["statementAssign", { type: "newline" }], postprocess: Z },
      { name: "statement", symbols: ["statementAnnAssign", { type: "newline" }], postprocess: Z },
      {
        name: "statement",
        symbols: ["statementSubscriptAssign", { type: "newline" }],
        postprocess: Z,
      },
      { name: "statement", symbols: ["statementReturn", { type: "newline" }], postprocess: Z },
      { name: "statement", symbols: ["statementPass", { type: "newline" }], postprocess: Z },
      { name: "statement", symbols: ["statementBreak", { type: "newline" }], postprocess: Z },
      { name: "statement", symbols: ["statementContinue", { type: "newline" }], postprocess: Z },
      { name: "statement", symbols: ["statementGlobal", { type: "newline" }], postprocess: Z },
      { name: "statement", symbols: ["statementNonlocal", { type: "newline" }], postprocess: Z },
      { name: "statement", symbols: ["statementAssert", { type: "newline" }], postprocess: Z },
      { name: "statement", symbols: ["statementExpr", { type: "newline" }], postprocess: Z },
      { name: "statement", symbols: ["if_statement"], postprocess: Z },
      { name: "statement", symbols: ["statementWhile"], postprocess: Z },
      { name: "statement", symbols: ["statementFor"], postprocess: Z },
      { name: "statement", symbols: ["statementDef"], postprocess: Z },
      {
        name: "statementAssign",
        symbols: [{ type: "name" }, { literal: "=" }, "expression"],
        postprocess: ([t, , e]) => {
          const n = Q(t);
          return new V.Assign(n, e.endToken, new q.Variable(n, n, n), e);
        },
      },
      {
        name: "statementAnnAssign",
        symbols: [{ type: "name" }, { literal: ":" }, "expression", { literal: "=" }, "expression"],
        postprocess: ([t, , e, , n]) => {
          const r = Q(t);
          return new V.AnnAssign(r, n.endToken, new q.Variable(r, r, r), n, e);
        },
      },
      {
        name: "statementAnnAssign",
        symbols: [{ type: "name" }, { literal: ":" }, "expression"],
        postprocess: ([t, , e]) => {
          const n = Q(t),
            r = new q.None(e.endToken, e.endToken);
          return new V.AnnAssign(n, e.endToken, new q.Variable(n, n, n), r, e);
        },
      },
      {
        name: "statementSubscriptAssign",
        symbols: [
          "expressionPost",
          { type: "lsqb" },
          "expression",
          { type: "rsqb" },
          { literal: "=" },
          "expression",
        ],
        postprocess: function (t) {
          const e = t[0],
            n = t[2],
            r = t[3],
            i = t[5],
            s = new q.Subscript(e.startToken, Q(r), e, n);
          return new V.Assign(e.startToken, i.endToken, s, i);
        },
      },
      {
        name: "statementReturn",
        symbols: [{ literal: "return" }, "expression"],
        postprocess: ([t, e]) => new V.Return(Q(t), e.endToken, e),
      },
      {
        name: "statementReturn",
        symbols: [{ literal: "return" }],
        postprocess: ([t]) => {
          const e = Q(t);
          return new V.Return(e, e, null);
        },
      },
      {
        name: "statementPass",
        symbols: [{ literal: "pass" }],
        postprocess: ([t]) => {
          const e = Q(t);
          return new V.Pass(e, e);
        },
      },
      {
        name: "statementBreak",
        symbols: [{ literal: "break" }],
        postprocess: ([t]) => {
          const e = Q(t);
          return new V.Break(e, e);
        },
      },
      {
        name: "statementContinue",
        symbols: [{ literal: "continue" }],
        postprocess: ([t]) => {
          const e = Q(t);
          return new V.Continue(e, e);
        },
      },
      {
        name: "statementGlobal",
        symbols: [{ literal: "global" }, { type: "name" }],
        postprocess: ([t, e]) => new V.Global(Q(t), Q(e), Q(e)),
      },
      {
        name: "statementNonlocal",
        symbols: [{ literal: "nonlocal" }, { type: "name" }],
        postprocess: ([t, e]) => new V.NonLocal(Q(t), Q(e), Q(e)),
      },
      {
        name: "statementAssert",
        symbols: [{ literal: "assert" }, "expression"],
        postprocess: ([t, e]) => new V.Assert(Q(t), e.endToken, e),
      },
      {
        name: "statementExpr",
        symbols: ["expression"],
        postprocess: ([t]) => new V.SimpleExpr(t.startToken, t.endToken, t),
      },
      {
        name: "statementWhile",
        symbols: [{ literal: "while" }, "expression", { literal: ":" }, "block"],
        postprocess: ([t, e, , n]) => new V.While(Q(t), n[n.length - 1].endToken, e, n),
      },
      {
        name: "statementFor",
        symbols: [
          { literal: "for" },
          { type: "name" },
          { literal: "in" },
          "expression",
          { literal: ":" },
          "block",
        ],
        postprocess: ([t, e, , n, , r]) => new V.For(Q(t), r[r.length - 1].endToken, Q(e), n, r),
      },
      {
        name: "statementDef",
        symbols: [{ literal: "def" }, { type: "name" }, "params", { literal: ":" }, "block"],
        postprocess: ([t, e, n, , r]) =>
          new V.FunctionDef(Q(t), r[r.length - 1].endToken, Q(e), n, r, []),
      },
      { name: "if_statement$ebnf$1", symbols: [] },
      {
        name: "if_statement$ebnf$1$subexpression$1",
        symbols: [{ literal: "elif" }, "expression", { literal: ":" }, "block"],
      },
      {
        name: "if_statement$ebnf$1",
        symbols: ["if_statement$ebnf$1", "if_statement$ebnf$1$subexpression$1"],
        postprocess: function (t) {
          return t[0].concat([t[1]]);
        },
      },
      {
        name: "if_statement$ebnf$2$subexpression$1",
        symbols: [{ literal: "else" }, { literal: ":" }, "block"],
      },
      {
        name: "if_statement$ebnf$2",
        symbols: ["if_statement$ebnf$2$subexpression$1"],
        postprocess: Z,
      },
      { name: "if_statement$ebnf$2", symbols: [], postprocess: () => null },
      {
        name: "if_statement",
        symbols: [
          { literal: "if" },
          "expression",
          { literal: ":" },
          "block",
          "if_statement$ebnf$1",
          "if_statement$ebnf$2",
        ],
        postprocess: ([t, e, , n, r, i]) => {
          let s = i ? i[2] : null;
          for (let t = r.length - 1; t >= 0; t--) {
            const [e, n, , i] = r[t],
              o = s && s.length > 0 ? s[s.length - 1].endToken : i[i.length - 1].endToken;
            s = [new V.If(Q(e), o, n, i, s)];
          }
          const o = s && s.length > 0 ? s[s.length - 1].endToken : n[n.length - 1].endToken;
          return new V.If(Q(t), o, e, n, s);
        },
      },
      { name: "names$ebnf$1", symbols: [] },
      { name: "names$ebnf$1$subexpression$1", symbols: [{ literal: "," }, { type: "name" }] },
      {
        name: "names$ebnf$1",
        symbols: ["names$ebnf$1", "names$ebnf$1$subexpression$1"],
        postprocess: function (t) {
          return t[0].concat([t[1]]);
        },
      },
      {
        name: "names",
        symbols: [{ type: "name" }, "names$ebnf$1"],
        postprocess: ([t, e]) => [Q(t), ...e.map(t => Q(t[1]))],
      },
      { name: "block", symbols: ["blockInline", { type: "newline" }], postprocess: ([t]) => [t] },
      { name: "block$ebnf$1$subexpression$1", symbols: ["statement"] },
      { name: "block$ebnf$1$subexpression$1", symbols: [{ type: "newline" }] },
      { name: "block$ebnf$1", symbols: ["block$ebnf$1$subexpression$1"] },
      { name: "block$ebnf$1$subexpression$2", symbols: ["statement"] },
      { name: "block$ebnf$1$subexpression$2", symbols: [{ type: "newline" }] },
      {
        name: "block$ebnf$1",
        symbols: ["block$ebnf$1", "block$ebnf$1$subexpression$2"],
        postprocess: function (t) {
          return t[0].concat([t[1]]);
        },
      },
      {
        name: "block",
        symbols: [{ type: "newline" }, { type: "indent" }, "block$ebnf$1", { type: "dedent" }],
        postprocess: ([, , t]) => t.map(t => t[0]).filter(t => t && "startToken" in t),
      },
      { name: "blockInline", symbols: ["statementAssign"], postprocess: Z },
      { name: "blockInline", symbols: ["statementAnnAssign"], postprocess: Z },
      { name: "blockInline", symbols: ["statementSubscriptAssign"], postprocess: Z },
      { name: "blockInline", symbols: ["statementReturn"], postprocess: Z },
      { name: "blockInline", symbols: ["statementPass"], postprocess: Z },
      { name: "blockInline", symbols: ["statementBreak"], postprocess: Z },
      { name: "blockInline", symbols: ["statementContinue"], postprocess: Z },
      { name: "blockInline", symbols: ["statementGlobal"], postprocess: Z },
      { name: "blockInline", symbols: ["statementNonlocal"], postprocess: Z },
      { name: "blockInline", symbols: ["statementAssert"], postprocess: Z },
      { name: "blockInline", symbols: ["statementExpr"], postprocess: Z },
      { name: "rest_names", symbols: [{ type: "name" }], postprocess: ([t]) => [H(t, !1)] },
      {
        name: "rest_names",
        symbols: [{ literal: "*" }, { type: "name" }],
        postprocess: ([, t]) => [H(t, !0)],
      },
      {
        name: "rest_names",
        symbols: ["rest_names", { literal: "," }, { type: "name" }],
        postprocess: ([t, , e]) => [...t, H(e, !1)],
      },
      {
        name: "rest_names",
        symbols: ["rest_names", { literal: "," }, { literal: "*" }, { type: "name" }],
        postprocess: ([t, , , e]) => [...t, H(e, !0)],
      },
      { name: "params", symbols: [{ literal: "(" }, { literal: ")" }], postprocess: () => [] },
      {
        name: "params",
        symbols: [{ literal: "(" }, "rest_names", { literal: ")" }],
        postprocess: ([, t]) => t,
      },
      {
        name: "expression",
        symbols: [
          "expressionOr",
          { literal: "if" },
          "expressionOr",
          { literal: "else" },
          "expression",
        ],
        postprocess: ([t, , e, , n]) => new q.Ternary(t.startToken, n.endToken, e, t, n),
      },
      { name: "expression", symbols: ["expressionOr"], postprocess: Z },
      { name: "expression", symbols: ["lambda_expr"], postprocess: Z },
      {
        name: "expressionOr",
        symbols: ["expressionOr", { literal: "or" }, "expressionAnd"],
        postprocess: K,
      },
      { name: "expressionOr", symbols: ["expressionAnd"], postprocess: Z },
      {
        name: "expressionAnd",
        symbols: ["expressionAnd", { literal: "and" }, "expressionNot"],
        postprocess: K,
      },
      { name: "expressionAnd", symbols: ["expressionNot"], postprocess: Z },
      { name: "expressionNot", symbols: [{ literal: "not" }, "expressionNot"], postprocess: tt },
      { name: "expressionNot", symbols: ["expressionCmp"], postprocess: Z },
      {
        name: "expressionCmp",
        symbols: ["expressionCmp", "expressionCmpOp", "expressionAdd"],
        postprocess: ([t, e, n]) => new q.Compare(t.startToken, n.endToken, t, e, n),
      },
      { name: "expressionCmp", symbols: ["expressionAdd"], postprocess: Z },
      { name: "expressionCmpOp", symbols: [{ type: "less" }], postprocess: et },
      { name: "expressionCmpOp", symbols: [{ type: "greater" }], postprocess: et },
      { name: "expressionCmpOp", symbols: [{ type: "doubleequal" }], postprocess: et },
      { name: "expressionCmpOp", symbols: [{ type: "greaterequal" }], postprocess: et },
      { name: "expressionCmpOp", symbols: [{ type: "lessequal" }], postprocess: et },
      { name: "expressionCmpOp", symbols: [{ type: "notequal" }], postprocess: et },
      { name: "expressionCmpOp", symbols: [{ literal: "in" }], postprocess: et },
      {
        name: "expressionCmpOp",
        symbols: [{ literal: "not" }, { literal: "in" }],
        postprocess: ([t]) => {
          const e = Q(t);
          return ((e.lexeme = "not in"), e);
        },
      },
      { name: "expressionCmpOp", symbols: [{ literal: "is" }], postprocess: et },
      {
        name: "expressionCmpOp",
        symbols: [{ literal: "is" }, { literal: "not" }],
        postprocess: ([t]) => {
          const e = Q(t);
          return ((e.lexeme = "is not"), e);
        },
      },
      {
        name: "expressionAdd",
        symbols: ["expressionAdd", "expressionAddOp", "expressionMul"],
        postprocess: X,
      },
      { name: "expressionAdd", symbols: ["expressionMul"], postprocess: Z },
      { name: "expressionAddOp", symbols: [{ type: "plus" }], postprocess: et },
      { name: "expressionAddOp", symbols: [{ type: "minus" }], postprocess: et },
      {
        name: "expressionMul",
        symbols: ["expressionMul", "expressionMulOp", "expressionUnary"],
        postprocess: X,
      },
      { name: "expressionMul", symbols: ["expressionUnary"], postprocess: Z },
      { name: "expressionMulOp", symbols: [{ type: "star" }], postprocess: et },
      { name: "expressionMulOp", symbols: [{ type: "slash" }], postprocess: et },
      { name: "expressionMulOp", symbols: [{ type: "percent" }], postprocess: et },
      { name: "expressionMulOp", symbols: [{ type: "doubleslash" }], postprocess: et },
      { name: "expressionUnary", symbols: [{ type: "plus" }, "expressionUnary"], postprocess: tt },
      { name: "expressionUnary", symbols: [{ type: "minus" }, "expressionUnary"], postprocess: tt },
      { name: "expressionUnary", symbols: ["expressionPow"], postprocess: Z },
      {
        name: "expressionPow",
        symbols: ["expressionPost", { type: "doublestar" }, "expressionUnary"],
        postprocess: ([t, e, n]) => new q.Binary(t.startToken, n.endToken, t, Q(e), n),
      },
      { name: "expressionPow", symbols: ["expressionPost"], postprocess: Z },
      {
        name: "expressionPost",
        symbols: ["expressionPost", { type: "lsqb" }, "expression", { type: "rsqb" }],
        postprocess: ([t, , e, n]) => new q.Subscript(t.startToken, Q(n), t, e),
      },
      {
        name: "expressionPost",
        symbols: ["expressionPost", { literal: "(" }, "spread_expressions", { literal: ")" }],
        postprocess: ([t, , e, n]) => new q.Call(t.startToken, Q(n), t, e),
      },
      {
        name: "expressionPost",
        symbols: ["expressionPost", { literal: "(" }, { literal: ")" }],
        postprocess: ([t, , e]) => new q.Call(t.startToken, Q(e), t, []),
      },
      { name: "expressionPost", symbols: ["atom"], postprocess: Z },
      {
        name: "atom",
        symbols: [{ literal: "(" }, "expression", { literal: ")" }],
        postprocess: ([, t]) => new q.Grouping(t.startToken, t.endToken, t),
      },
      {
        name: "atom",
        symbols: [{ type: "lsqb" }, { type: "rsqb" }],
        postprocess: ([t, e]) => new q.List(Q(t), Q(e), []),
      },
      {
        name: "atom",
        symbols: [{ type: "lsqb" }, "expressions", { type: "rsqb" }],
        postprocess: ([t, e, n]) => new q.List(Q(t), Q(n), e),
      },
      {
        name: "atom",
        symbols: [{ type: "name" }],
        postprocess: ([t]) => {
          const e = Q(t);
          return new q.Variable(e, e, e);
        },
      },
      {
        name: "atom",
        symbols: [{ type: "number_float" }],
        postprocess: ([t]) => {
          const e = Q(t);
          return new q.Literal(e, e, parseFloat(t.value));
        },
      },
      { name: "atom", symbols: [{ type: "number_int" }], postprocess: J },
      { name: "atom", symbols: [{ type: "number_hex" }], postprocess: J },
      { name: "atom", symbols: [{ type: "number_oct" }], postprocess: J },
      { name: "atom", symbols: [{ type: "number_bin" }], postprocess: J },
      {
        name: "atom",
        symbols: [{ type: "number_complex" }],
        postprocess: ([t]) => {
          const e = Q(t);
          return new q.Complex(e, e, t.value);
        },
      },
      { name: "atom", symbols: ["stringLit"], postprocess: Z },
      {
        name: "atom",
        symbols: [{ literal: "None" }],
        postprocess: ([t]) => {
          const e = Q(t);
          return new q.None(e, e);
        },
      },
      {
        name: "atom",
        symbols: [{ literal: "True" }],
        postprocess: ([t]) => {
          const e = Q(t);
          return new q.Literal(e, e, !0);
        },
      },
      {
        name: "atom",
        symbols: [{ literal: "False" }],
        postprocess: ([t]) => {
          const e = Q(t);
          return new q.Literal(e, e, !1);
        },
      },
      {
        name: "lambda_expr",
        symbols: [{ literal: "lambda" }, "rest_names", { literal: ":" }, "expression"],
        postprocess: ([t, e, , n]) => new q.Lambda(Q(t), n.endToken, e, n),
      },
      {
        name: "lambda_expr",
        symbols: [{ literal: "lambda" }, "rest_names", { type: "doublecolon" }, "block"],
        postprocess: ([t, e, , n]) => new q.MultiLambda(Q(t), n[n.length - 1].endToken, e, n, []),
      },
      {
        name: "lambda_expr",
        symbols: [{ literal: "lambda" }, { literal: ":" }, "expression"],
        postprocess: ([t, , e]) => new q.Lambda(Q(t), e.endToken, [], e),
      },
      {
        name: "lambda_expr",
        symbols: [{ literal: "lambda" }, { type: "doublecolon" }, "block"],
        postprocess: ([t, , e]) => new q.MultiLambda(Q(t), e[e.length - 1].endToken, [], e, []),
      },
      { name: "expressions$ebnf$1", symbols: [] },
      { name: "expressions$ebnf$1$subexpression$1", symbols: [{ literal: "," }, "expression"] },
      {
        name: "expressions$ebnf$1",
        symbols: ["expressions$ebnf$1", "expressions$ebnf$1$subexpression$1"],
        postprocess: function (t) {
          return t[0].concat([t[1]]);
        },
      },
      { name: "expressions$ebnf$2$subexpression$1", symbols: [{ type: "comma" }] },
      {
        name: "expressions$ebnf$2",
        symbols: ["expressions$ebnf$2$subexpression$1"],
        postprocess: Z,
      },
      { name: "expressions$ebnf$2", symbols: [], postprocess: () => null },
      {
        name: "expressions",
        symbols: ["expression", "expressions$ebnf$1", "expressions$ebnf$2"],
        postprocess: nt,
      },
      { name: "spread_expressions$ebnf$1", symbols: [] },
      {
        name: "spread_expressions$ebnf$1$subexpression$1",
        symbols: [{ literal: "," }, "spread_expression"],
      },
      {
        name: "spread_expressions$ebnf$1",
        symbols: ["spread_expressions$ebnf$1", "spread_expressions$ebnf$1$subexpression$1"],
        postprocess: function (t) {
          return t[0].concat([t[1]]);
        },
      },
      { name: "spread_expressions$ebnf$2$subexpression$1", symbols: [{ type: "comma" }] },
      {
        name: "spread_expressions$ebnf$2",
        symbols: ["spread_expressions$ebnf$2$subexpression$1"],
        postprocess: Z,
      },
      { name: "spread_expressions$ebnf$2", symbols: [], postprocess: () => null },
      {
        name: "spread_expressions",
        symbols: ["spread_expression", "spread_expressions$ebnf$1", "spread_expressions$ebnf$2"],
        postprocess: nt,
      },
      { name: "spread_expression", symbols: ["expression"], postprocess: Z },
      {
        name: "spread_expression",
        symbols: [{ type: "star" }, "expression"],
        postprocess: ([t, e]) => new q.Starred(Q(t), e.endToken, e),
      },
      { name: "stringLit", symbols: [{ type: "string_triple_double" }], postprocess: Y },
      { name: "stringLit", symbols: [{ type: "string_triple_single" }], postprocess: Y },
      { name: "stringLit", symbols: [{ type: "string_double" }], postprocess: Y },
      { name: "stringLit", symbols: [{ type: "string_single" }], postprocess: Y },
    ];
  var it = { Lexer: C, ParserRules: rt, ParserStart: "program" };
  class st {
    constructor(t, e) {
      this.source = t;
    }
    parse() {
      const t = new f.Parser(f.Grammar.fromCompiled({ ...it, Lexer: C }));
      try {
        if ((t.feed(this.source), 0 === t.results.length))
          throw new Error("Unexpected end of input - no parse results");
        if (t.results.length > 1)
          throw new Error(`Ambiguous grammar: ${t.results.length} possible parses for input`);
        return t.results[0];
      } catch (t) {
        const e = t;
        if (e.token) {
          const t = e.token,
            n = t.line || 0,
            r = t.col || 0;
          throw new ot(
            `Unexpected token: ${t.value || t.type} at line ${n}, column ${r}`,
            n,
            r,
            this.source,
          );
        }
        throw t;
      }
    }
  }
  class ot extends SyntaxError {
    constructor(t, e, n, r) {
      (super(t), (this.name = "ParseError"), (this.line = e), (this.col = n), (this.source = r));
    }
  }
  class ut extends Error {
    constructor(t, e) {
      const n = e.startToken;
      (super(`Feature not supported in this sublanguage: ${t} (line ${n.line}, col ${n.col})`),
        (this.name = "FeatureNotSupportedError"),
        (this.feature = t),
        (this.node = e));
    }
  }
  class at extends Error {
    constructor(t) {
      const e = t.startToken;
      (super(`Break or continue statement not within a loop (line ${e.line}, col ${e.col})`),
        (this.name = "BreakContinueOutsideLoopError"),
        (this.node = t));
    }
  }
  const lt = {
    validate(t) {
      if (!(t instanceof V.For)) return;
      const e = t.iter;
      if (!(
        e instanceof q.Call &&
        e.callee instanceof q.Variable &&
        "range" === e.callee.name.lexeme &&
        e.args.length >= 1 &&
        e.args.length <= 3
      ))
        throw new ut("for loops must use range() — e.g. for i in range(n)", t);
    },
  };
  function ct() {
    const t = new WeakMap();
    return {
      validate(e, n) {
        if (n)
          if (e instanceof V.For || e instanceof V.While)
            n.enclosing ? t.set(n, (t.get(n.enclosing) ?? 0) + 1) : t.set(n, 1);
          else if ((e instanceof V.Break || e instanceof V.Continue) && 0 === (t.get(n) ?? 0))
            throw new at(e);
      },
    };
  }
  const pt = {
      validate(t) {
        if (t instanceof V.AnnAssign) throw new ut("annotated assignment statements", t);
      },
    },
    ht = {
      validate(t) {
        if (t instanceof V.Break) throw new ut("break statements", t);
        if (t instanceof V.Continue) throw new ut("continue statements", t);
      },
    },
    ft = {
      validate(t) {
        if (t instanceof q.Binary && t.operator.type === _.IS) throw new ut("is operator", t);
      },
    },
    mt = {
      validate(t) {
        if (t instanceof q.List) throw new ut("list literals", t);
        if (t instanceof q.Subscript) throw new ut("subscript expressions", t);
      },
    },
    dt = {
      validate(t) {
        if (t instanceof V.While) throw new ut("while loops", t);
        if (t instanceof V.For) throw new ut("for loops", t);
      },
    },
    gt = {
      validate(t) {
        if (t instanceof V.Global) throw new ut("global statements", t);
      },
    },
    Dt = {
      validate(t) {
        if (t instanceof V.NonLocal) throw new ut("nonlocal statements", t);
      },
    };
  var yt;
  function vt() {
    const t = new WeakMap();
    return {
      validate(e, n) {
        if (!n) return;
        let r = null;
        if (e instanceof V.Assign) {
          if (e.target instanceof q.Subscript) return;
          e.target instanceof q.Variable && (r = e.target.name);
        } else if (e instanceof V.AnnAssign) r = e.target.name;
        else {
          if (!(e instanceof V.FunctionDef)) return;
          r = e.name;
        }
        if (!r) return;
        let i = t.get(n);
        i || ((i = new Set()), t.set(n, i));
        const s = r.lexeme;
        if (i.has(s))
          throw new yt.NameReassignmentError(
            r.line,
            r.col,
            n.source,
            r.indexInSource,
            r.indexInSource + s.length,
            n.names.get(s),
          );
        i.add(s);
      },
    };
  }
  !(function (t) {
    class e extends SyntaxError {
      constructor(t, e, n, r) {
        (super(`${t} at line ${n}\n                   ${e}`),
          (this.line = n),
          (this.col = r),
          (this.name = "BaseResolverError"));
      }
    }
    ((t.BaseResolverError = e),
      (t.NameNotFoundError = class extends e {
        constructor(t, e, n, r, i, s) {
          const { lineIndex: o, fullLine: u } = k(n, r);
          let a = " This name is not found in the current or enclosing environment(s).";
          const l = i - r;
          if (
            ((a = a.padStart(a.length + l - 1 + 1, "^")),
            (a = a.padStart(a.length + e - l, " ")),
            null !== s)
          ) {
            let t = ` Perhaps you meant to type '${s}'?`;
            ((t = t.padStart(t.length + e - 1 + 1, " ")), (t = "\n" + t), (a += t));
          }
          (super("NameNotFoundError", "\n" + u + "\n" + a, o, e),
            (this.name = "NameNotFoundError"));
        }
      }),
      (t.NameReassignmentError = class extends e {
        constructor(t, e, n, r, i, s) {
          const { lineIndex: o, fullLine: u } = k(n, r);
          let a = " A name has been declared here.";
          const l = i - r;
          ((a = a.padStart(a.length + l - 1 + 1, "^")), (a = a.padStart(a.length + e - l, " ")));
          const { lineIndex: c, fullLine: p } = k(n, s.indexInSource),
            h = "\n" + p + "\n";
          let f = ` However, it has already been declared in the same environment at line ${c}, here: `;
          ((f = f.padStart(f.length + e - 1 + 1, " ")),
            (f = "\n" + f),
            (a += f),
            h.padStart(h.length + e - 1 + 1, " "),
            (a += h),
            super("NameReassignmentError", "\n" + u + "\n" + a, o, e),
            (this.name = "NameReassignmentError"));
        }
      }),
      (t.BreakContinueError = class extends e {
        constructor(t, e, n, r, i) {
          const { lineIndex: s, fullLine: o } = k(n, r);
          let u = " A 'break' or 'continue' statement must be inside a loop body.";
          const a = i - r;
          ((u = u.padStart(u.length + a - 1 + 1, "^")), (u = u.padStart(u.length + e - a, " ")));
          const l = "BreakContinueError";
          (super(l, "\n" + o + "\n" + u, s, e), (this.name = l));
        }
      }));
  })(yt || (yt = {}));
  const bt = {
      validate(t) {
        if (t instanceof V.FunctionDef || t instanceof q.Lambda || t instanceof q.MultiLambda)
          for (const e of t.parameters) if (e.isStarred) throw new ut("rest parameters (*name)", t);
      },
    },
    wt = {
      validate(t) {
        if (t instanceof q.Starred) throw new ut("spread expressions (*expr)", t);
      },
    };
  var Et = { exports: {} };
  const xt = new Uint32Array(65536),
    At = (t, e) => {
      if (t.length < e.length) {
        const n = e;
        ((e = t), (t = n));
      }
      return 0 === e.length
        ? t.length
        : t.length <= 32
          ? ((t, e) => {
              const n = t.length,
                r = e.length,
                i = 1 << (n - 1);
              let s = -1,
                o = 0,
                u = n,
                a = n;
              for (; a--;) xt[t.charCodeAt(a)] |= 1 << a;
              for (a = 0; a < r; a++) {
                let t = xt[e.charCodeAt(a)];
                const n = t | o;
                ((t |= ((t & s) + s) ^ s),
                  (o |= ~(t | s)),
                  (s &= t),
                  o & i && u++,
                  s & i && u--,
                  (o = (o << 1) | 1),
                  (s = (s << 1) | ~(n | o)),
                  (o &= n));
              }
              for (a = n; a--;) xt[t.charCodeAt(a)] = 0;
              return u;
            })(t, e)
          : ((t, e) => {
              const n = e.length,
                r = t.length,
                i = [],
                s = [],
                o = Math.ceil(n / 32),
                u = Math.ceil(r / 32);
              for (let t = 0; t < o; t++) ((s[t] = -1), (i[t] = 0));
              let a = 0;
              for (; a < u - 1; a++) {
                let o = 0,
                  u = -1;
                const l = 32 * a,
                  c = Math.min(32, r) + l;
                for (let e = l; e < c; e++) xt[t.charCodeAt(e)] |= 1 << e;
                for (let t = 0; t < n; t++) {
                  const n = xt[e.charCodeAt(t)],
                    r = (s[(t / 32) | 0] >>> t) & 1,
                    a = (i[(t / 32) | 0] >>> t) & 1,
                    l = n | o,
                    c = ((((n | a) & u) + u) ^ u) | n | a;
                  let p = o | ~(c | u),
                    h = u & c;
                  ((p >>> 31) ^ r && (s[(t / 32) | 0] ^= 1 << t),
                    (h >>> 31) ^ a && (i[(t / 32) | 0] ^= 1 << t),
                    (p = (p << 1) | r),
                    (h = (h << 1) | a),
                    (u = h | ~(l | p)),
                    (o = p & l));
                }
                for (let e = l; e < c; e++) xt[t.charCodeAt(e)] = 0;
              }
              let l = 0,
                c = -1;
              const p = 32 * a,
                h = Math.min(32, r - p) + p;
              for (let e = p; e < h; e++) xt[t.charCodeAt(e)] |= 1 << e;
              let f = r;
              for (let t = 0; t < n; t++) {
                const n = xt[e.charCodeAt(t)],
                  o = (s[(t / 32) | 0] >>> t) & 1,
                  u = (i[(t / 32) | 0] >>> t) & 1,
                  a = n | l,
                  p = ((((n | u) & c) + c) ^ c) | n | u;
                let h = l | ~(p | c),
                  m = c & p;
                ((f += (h >>> (r - 1)) & 1),
                  (f -= (m >>> (r - 1)) & 1),
                  (h >>> 31) ^ o && (s[(t / 32) | 0] ^= 1 << t),
                  (m >>> 31) ^ u && (i[(t / 32) | 0] ^= 1 << t),
                  (h = (h << 1) | o),
                  (m = (m << 1) | u),
                  (c = m | ~(a | h)),
                  (l = h & a));
              }
              for (let e = p; e < h; e++) xt[t.charCodeAt(e)] = 0;
              return f;
            })(t, e);
    };
  var Ft,
    Ct = u(
      Object.freeze({
        __proto__: null,
        closest: (t, e) => {
          let n = 1 / 0,
            r = 0;
          for (let i = 0; i < e.length; i++) {
            const s = At(t, e[i]);
            s < n && ((n = s), (r = i));
          }
          return e[r];
        },
        distance: At,
      }),
    ),
    _t =
      (Ft ||
        ((Ft = 1),
        (function (t, e) {
          !(function () {
            var n;
            try {
              n =
                "undefined" != typeof Intl && void 0 !== Intl.Collator
                  ? Intl.Collator("generic", { sensitivity: "base" })
                  : null;
            } catch (t) {
              console.log("Collator could not be initialized and wouldn't be used");
            }
            var r = Ct,
              i = [],
              s = [],
              o = {
                get: function (t, e, o) {
                  if (o && n && o.useCollator) {
                    var u,
                      a,
                      l,
                      c,
                      p,
                      h,
                      f = t.length,
                      m = e.length;
                    if (0 === f) return m;
                    if (0 === m) return f;
                    for (l = 0; l < m; ++l) ((i[l] = l), (s[l] = e.charCodeAt(l)));
                    for (i[m] = m, l = 0; l < f; ++l) {
                      for (a = l + 1, c = 0; c < m; ++c)
                        ((u = a),
                          (h = 0 === n.compare(t.charAt(l), String.fromCharCode(s[c]))),
                          (a = i[c] + (h ? 0 : 1)) > (p = u + 1) && (a = p),
                          a > (p = i[c + 1] + 1) && (a = p),
                          (i[c] = u));
                      i[c] = a;
                    }
                    return a;
                  }
                  return r.distance(t, e);
                },
              };
            null !== t && t.exports === e
              ? (t.exports = o)
              : "undefined" != typeof self &&
                  "function" == typeof self.postMessage &&
                  "function" == typeof self.importScripts
                ? (self.Levenshtein = o)
                : "undefined" != typeof window && null !== window && (window.Levenshtein = o);
          })();
        })(Et, Et.exports)),
      Et.exports),
    Nt = o(_t);
  const St = new M(_.AT, "", 0, 0, 0);
  class Bt {
    constructor(t, e, n) {
      ((this.source = t),
        (this.enclosing = e),
        (this.names = n),
        (this.functions = new Set()),
        (this.moduleBindings = new Set()),
        (this.definedNames = new Set()));
    }
    lookupName(t) {
      const e = t.lexeme;
      let n = 0,
        r = this;
      for (; null !== r && !r.names.has(e);) ((n += 1), (r = r.enclosing));
      return null === r ? -1 : n;
    }
    lookupNameEnv(t) {
      if (this.names.has(t.lexeme)) return this;
      for (let e = this.enclosing; null !== e; e = e.enclosing) if (e.names.has(t.lexeme)) return e;
      return null;
    }
    lookupNameCurrentEnv(t) {
      return this.names.get(t.lexeme);
    }
    lookupNameCurrentEnvWithError(t) {
      if (this.lookupName(t) < 0)
        throw new yt.NameNotFoundError(
          t.line,
          t.col,
          this.source,
          t.indexInSource,
          t.indexInSource + t.lexeme.length,
          this.suggestName(t),
        );
    }
    lookupNameParentEnvWithError(t) {
      const e = t.lexeme,
        n = this.enclosing;
      if (null === n || !n.names.has(e))
        throw new yt.NameNotFoundError(
          t.line,
          t.col,
          this.source,
          t.indexInSource,
          t.indexInSource + e.length,
          this.suggestName(t),
        );
    }
    declareName(t) {
      (this.names.set(t.lexeme, t), this.definedNames.add(t.lexeme));
    }
    declarePlaceholderName(t) {
      const e = this.lookupNameCurrentEnv(t);
      if (void 0 !== e)
        throw new yt.NameReassignmentError(
          t.line,
          t.col,
          this.source,
          t.indexInSource,
          t.indexInSource + t.lexeme.length,
          e,
        );
      this.names.set(t.lexeme, St);
    }
    suggestNameCurrentEnv(t) {
      const e = t.lexeme;
      let n = 1 / 0,
        r = null;
      for (const t of this.names.keys()) {
        const i = Nt.get(e, t);
        i < n && ((n = i), (r = t));
      }
      return r;
    }
    suggestName(t) {
      const e = t.lexeme;
      let n = 1 / 0,
        r = null,
        i = this;
      for (; null !== i;) {
        for (const t of i.names.keys()) {
          const i = Nt.get(e, t);
          i < n && ((n = i), (r = t));
        }
        i = i.enclosing;
      }
      return n >= 4 ? null : r;
    }
  }
  class Mt {
    constructor(t, e, n = [], r = [], i = []) {
      ((this.globalNamesInCurrentFunction = new Set()),
        (this.source = t),
        (this.ast = e),
        (this.source = t),
        (this.ast = e),
        (this.validators = n),
        (this.errors = []),
        (this.functionEnvironments = new Map()),
        (this.environment = new Bt(
          t,
          null,
          new Map([
            ["range", new M(_.NAME, "range", 0, 0, 0)],
            ["__program__", new M(_.NAME, "__program__", 0, 0, 0)],
            ...r.flatMap(t =>
              Array.from(t.builtins.entries()).map(([t]) => [t, new M(_.NAME, t, 0, 0, 0)]),
            ),
            ...i.map(t => [t, new M(_.NAME, t, 0, 0, 0)]),
          ]),
        )),
        (this.functionScope = null));
    }
    resolveEnvironments(t) {
      return (this.resolve(t), this.functionEnvironments);
    }
    runValidators(t) {
      try {
        for (const e of this.validators) e.validate(t, this.environment ?? void 0);
      } catch (t) {
        if (t instanceof Error) return void this.errors.push(t);
        throw t;
      }
    }
    resolve(t) {
      if (null === t) return this.errors;
      if (t instanceof Array) {
        for (const e of t)
          (e instanceof V.FunctionDef &&
            (this.globalNamesInCurrentFunction.has(e.name.lexeme) ||
              this.environment?.declareName(e.name)),
            e instanceof V.Assign &&
              e.target instanceof q.Variable &&
              (this.globalNamesInCurrentFunction.has(e.target.name.lexeme) ||
                this.environment?.declareName(e.target.name)));
        for (const e of t) (this.runValidators(e), e.accept(this));
      } else (this.runValidators(t), t.accept(this));
      return this.errors;
    }
    varDeclNames(t) {
      const e = Array.from(t.values()).filter(
        t =>
          !this.environment?.functions.has(t.lexeme) &&
          !this.environment?.moduleBindings.has(t.lexeme),
      );
      return 0 === e.length ? null : e;
    }
    functionVarConstraint(t) {
      if (null == this.functionScope) return;
      let e = this.environment;
      for (; e !== this.functionScope;) {
        if (null !== e && e.names.has(t.lexeme)) {
          const n = e.names.get(t.lexeme);
          return void 0 === n
            ? void this.errors.push(new Error("placeholder error"))
            : void this.errors.push(
                new yt.NameReassignmentError(
                  t.line,
                  t.col,
                  this.source,
                  t.indexInSource,
                  t.indexInSource + t.lexeme.length,
                  n,
                ),
              );
        }
        e = e?.enclosing ?? null;
      }
    }
    visitFileInputStmt(t) {
      const e = this.environment;
      ((this.environment = new Bt(this.source, this.environment, new Map())),
        this.functionEnvironments.set(t, this.environment),
        this.resolve(t.statements),
        (this.environment = e));
    }
    visitFunctionDefStmt(t) {
      this.environment?.functions.add(t.name.lexeme);
      const e = this.environment,
        n = new Map(t.parameters.map(t => [t.lexeme, t]));
      ((this.environment = new Bt(this.source, this.environment, n)),
        this.functionEnvironments.set(t, this.environment),
        (this.functionScope = this.environment));
      const r = this.globalNamesInCurrentFunction;
      if (
        ((this.globalNamesInCurrentFunction = this.scanGlobalDeclarations(t.body)),
        this.globalNamesInCurrentFunction.size > 0)
      ) {
        let t = this.environment;
        for (; null !== t?.enclosing;) t = t?.enclosing ?? null;
        if (t)
          for (const e of this.globalNamesInCurrentFunction)
            t.names.has(e) || t.names.set(e, new M(_.NAME, e, 0, 0, 0));
      }
      (this.resolve(t.body),
        (this.globalNamesInCurrentFunction = r),
        (this.functionScope = null),
        (this.environment = e));
    }
    visitAnnAssignStmt(t) {
      (this.resolve(t.ann), this.resolve(t.value), this.functionVarConstraint(t.target.name));
    }
    visitAssignStmt(t) {
      const e = t.target;
      if (e instanceof q.Subscript) return (this.resolve(e), void this.resolve(t.value));
      (this.resolve(t.value), this.functionVarConstraint(e.name));
    }
    visitAssertStmt(t) {
      this.resolve(t.value);
    }
    visitForStmt(t) {
      (this.globalNamesInCurrentFunction.has(t.target.lexeme) ||
        this.environment?.declareName(t.target),
        this.resolve(t.iter),
        this.resolve(t.body));
    }
    visitIfStmt(t) {
      (this.resolve(t.condition), this.resolve(t.body), this.resolve(t.elseBlock));
    }
    visitGlobalStmt(t) {}
    scanGlobalDeclarations(t) {
      const e = new Set(),
        n = t => {
          for (const r of t)
            r instanceof V.Global
              ? e.add(r.name.lexeme)
              : r instanceof V.If
                ? (n(r.body),
                  Array.isArray(r.elseBlock) ? n(r.elseBlock) : r.elseBlock && n([r.elseBlock]))
                : (r instanceof V.While || r instanceof V.For) && n(r.body);
        };
      return (n(t), e);
    }
    visitNonLocalStmt(t) {
      try {
        this.environment?.lookupNameParentEnvWithError(t.name);
      } catch (t) {
        if (t instanceof Error) return void this.errors.push(t);
        throw t;
      }
    }
    visitReturnStmt(t) {
      null !== t.value && this.resolve(t.value);
    }
    visitWhileStmt(t) {
      (this.resolve(t.condition), this.resolve(t.body));
    }
    visitSimpleExprStmt(t) {
      this.resolve(t.expression);
    }
    visitFromImportStmt(t) {
      for (const e of t.names) {
        const t = e.alias ?? e.name;
        (this.environment?.declareName(t), this.environment?.moduleBindings.add(t.lexeme));
      }
    }
    visitContinueStmt(t) {}
    visitBreakStmt(t) {}
    visitPassStmt(t) {}
    visitVariableExpr(t) {
      try {
        this.environment?.lookupNameCurrentEnvWithError(t.name);
      } catch (t) {
        if (t instanceof Error) return void this.errors.push(t);
        throw t;
      }
    }
    visitLambdaExpr(t) {
      const e = this.environment,
        n = new Map(t.parameters.map(t => [t.lexeme, t]));
      ((this.environment = new Bt(this.source, this.environment, n)),
        this.functionEnvironments.set(t, this.environment),
        this.resolve(t.body),
        (this.environment = e));
    }
    visitMultiLambdaExpr(t) {
      const e = this.environment,
        n = new Map(t.parameters.map(t => [t.lexeme, t]));
      ((this.environment = new Bt(this.source, this.environment, n)),
        this.functionEnvironments.set(t, this.environment),
        this.resolve(t.body),
        (t.varDecls = Array.from(this.environment.names.values())),
        (this.environment = e));
    }
    visitUnaryExpr(t) {
      this.resolve(t.right);
    }
    visitGroupingExpr(t) {
      this.resolve(t.expression);
    }
    visitBinaryExpr(t) {
      (this.resolve(t.left), this.resolve(t.right));
    }
    visitBoolOpExpr(t) {
      (this.resolve(t.left), this.resolve(t.right));
    }
    visitCompareExpr(t) {
      (this.resolve(t.left), this.resolve(t.right));
    }
    visitCallExpr(t) {
      (this.resolve(t.callee), this.resolve(t.args));
    }
    visitStarredExpr(t) {
      this.resolve(t.value);
    }
    visitTernaryExpr(t) {
      (this.resolve(t.predicate), this.resolve(t.consequent), this.resolve(t.alternative));
    }
    visitNoneExpr(t) {}
    visitLiteralExpr(t) {}
    visitBigIntLiteralExpr(t) {}
    visitComplexExpr(t) {}
    visitListExpr(t) {
      this.resolve(t.elements);
    }
    visitSubscriptExpr(t) {
      (this.resolve(t.value), this.resolve(t.index));
    }
  }
  var Tt;
  !(function (t) {
    ((t.MATH = "math"),
      (t.MISC = "misc"),
      (t.LINKED_LISTS = "linked-list"),
      (t.STREAMS = "stream"),
      (t.LIST = "list"),
      (t.PAIRMUTATORS = "pair-mutators"),
      (t.MCE = "mce"),
      (t.EV3 = "ev3"));
  })(Tt || (Tt = {}));
  const Lt = new Map();
  function kt(t, e, n, r) {
    return function (i, s, o) {
      const u = o.value;
      (Lt.set(n, t || 0),
        (o.value = function (i, s, o, a) {
          return (
            null !== t && i.length < t && G(a, new O(s, o, n, t, i, r)),
            null !== e && i.length > e && G(a, new R(s, o, n, e, i, r)),
            u.call(this, i, s, o, a)
          );
        }));
    };
  }
  function It(t, e = !1) {
    let n = "";
    if ("builtin" == t.type) return `<built-in function ${t.name}>`;
    if ("bigint" === t.type || "complex" === t.type) n = t.value.toString();
    else if ("number" === t.type)
      ((r = t.value),
        (n = Object.is(r, -0)
          ? "-0.0"
          : 0 === r
            ? "0.0"
            : r === 1 / 0
              ? "inf"
              : r === -1 / 0
                ? "-inf"
                : Number.isNaN(r)
                  ? "nan"
                  : Math.abs(r) >= 1e16 || (0 !== r && Math.abs(r) < 1e-4)
                    ? r.toExponential().replace(/e([+-])(\d)$/, "e$10$2")
                    : Number.isInteger(r)
                      ? r.toFixed(1).toString()
                      : r.toString()));
    else {
      if ("bool" === t.type) return t.value ? "True" : "False";
      if ("error" === t.type) return t.message;
      if ("closure" === t.type) {
        if (t.closure.node)
          return `<function ${"FunctionDef" === t.closure.node.kind ? t.closure.node.name.lexeme : "(anonymous)"}>`;
      } else
        n =
          "none" === t.type
            ? "None"
            : "string" === t.type
              ? e
                ? (function (t) {
                    let e = JSON.stringify(t);
                    return (
                      (t.includes("'") && !t.includes('"')) ||
                        (e = `'${e.slice(1, -1).replace(/'/g, "\\'").replace(/\\"/g, '"')}'`),
                      e
                    );
                  })(t.value)
                : t.value
              : "function" === t.type
                ? `<function ${t.name || "(anonymous)"}>`
                : "list" === t.type
                  ? (function (t) {
                      return ((t, e = 2, n = 80) => {
                        if ("string" == typeof e)
                          throw new Error("stringify with arbitrary indent string not supported");
                        let r = e;
                        return (
                          e > 10 && (r = 10),
                          (function (t) {
                            let e = "";
                            const n = new Map(),
                              r = new Map();
                            return (
                              (function t(i, s) {
                                const o = r.get(i);
                                if (void 0 !== o) {
                                  const t = o.get(s.length);
                                  if (void 0 !== t) return void (e += e.substring(t[0], t[1]));
                                }
                                const u = e.length;
                                if ("line" === i.type)
                                  (n.has(i.line) ||
                                    n.set(
                                      i.line,
                                      (function t(e, n) {
                                        if ("multiline" === e.type)
                                          throw new Error(
                                            "Tried to format multiline string as single line string",
                                          );
                                        if ("terminal" === e.type) n.push(e.str);
                                        else if ("pair" === e.type)
                                          (n.push("["),
                                            t(e.head, n),
                                            n.push(", "),
                                            t(e.tail, n),
                                            n.push("]"));
                                        else if ("kvpair" === e.type)
                                          (n.push(JSON.stringify(e.key)),
                                            n.push(": "),
                                            t(e.value, n));
                                        else if ("arraylike" === e.type) {
                                          (n.push(e.prefix),
                                            e.elems.length > 0 && t(e.elems[0], n));
                                          for (let r = 1; r < e.elems.length; r++)
                                            (n.push(", "), t(e.elems[r], n));
                                          n.push(e.suffix);
                                        }
                                        return n;
                                      })(i.line, []).join(""),
                                    ),
                                    (e += n.get(i.line)));
                                else if ("block" === i.type) {
                                  e += i.prefixFirst;
                                  const n = s + " ".repeat(i.prefixFirst.length),
                                    r = s + i.prefixRest;
                                  t(i.block[0], n);
                                  for (let n = 1; n < i.block.length; n++)
                                    ((e += i.suffixRest), (e += r), t(i.block[n], r));
                                  e += i.suffixLast;
                                }
                                const a = e.length;
                                if (void 0 === o) {
                                  const t = new Map();
                                  (t.set(s.length, [u, a]), r.set(i, t));
                                } else o.set(s.length, [u, a]);
                              })(t, "\n"),
                              e
                            );
                          })(
                            (function (t, e, n) {
                              const r = "[" + " ".repeat(Math.max(0, e - 1)),
                                i = new Map();
                              return (function t(s) {
                                const o = i.get(s);
                                if (void 0 !== o) return o;
                                let u;
                                if ("terminal" === s.type) u = { type: "line", line: s };
                                else if ("multiline" === s.type)
                                  u = {
                                    type: "block",
                                    prefixFirst: "",
                                    prefixRest: "",
                                    block: s.lines.map(t => ({
                                      type: "line",
                                      line: { type: "terminal", str: t, length: t.length },
                                    })),
                                    suffixRest: "",
                                    suffixLast: "",
                                  };
                                else if ("pair" === s.type) {
                                  const e = t(s.head),
                                    i = t(s.tail);
                                  u =
                                    s.length - 2 > n || "line" !== e.type || "line" !== i.type
                                      ? {
                                          type: "block",
                                          prefixFirst: r,
                                          prefixRest: "",
                                          block: [e, i],
                                          suffixRest: ",",
                                          suffixLast: "]",
                                        }
                                      : { type: "line", line: s };
                                } else if ("arraylike" === s.type) {
                                  const r = s.elems.map(t);
                                  u =
                                    s.length - s.prefix.length - s.suffix.length > n ||
                                    r.some(t => "line" !== t.type)
                                      ? {
                                          type: "block",
                                          prefixFirst:
                                            s.prefix + " ".repeat(Math.max(0, e - s.prefix.length)),
                                          prefixRest: " ".repeat(Math.max(s.prefix.length, e)),
                                          block: r,
                                          suffixRest: ",",
                                          suffixLast: s.suffix,
                                        }
                                      : { type: "line", line: s };
                                } else {
                                  if ("kvpair" !== s.type) throw new Error("Unreachable");
                                  {
                                    const e = t(s.value);
                                    u =
                                      s.length > n || "line" !== e.type
                                        ? {
                                            type: "block",
                                            prefixFirst: "",
                                            prefixRest: "",
                                            block: [
                                              {
                                                type: "line",
                                                line: {
                                                  type: "terminal",
                                                  str: JSON.stringify(s.key),
                                                  length: 0,
                                                },
                                              },
                                              e,
                                            ],
                                            suffixRest: ":",
                                            suffixLast: "",
                                          }
                                        : { type: "line", line: s };
                                  }
                                }
                                return (i.set(s, u), u);
                              })(t);
                            })(
                              (function (t) {
                                const e = new Map(),
                                  n = new Map();
                                return (function t(r) {
                                  if ("none" === r.type)
                                    return [{ type: "terminal", str: "None", length: 4 }, !1];
                                  if (e.has(r))
                                    return [
                                      { type: "terminal", str: "...<circular>", length: 13 },
                                      !0,
                                    ];
                                  if ("bool" === r.type) {
                                    const t = r.value ? "True" : "False";
                                    return [{ type: "terminal", str: t, length: t.length }, !1];
                                  }
                                  if ("number" === r.type) {
                                    const t =
                                      ((i = r.value),
                                      Object.is(i, -0)
                                        ? "-0.0"
                                        : 0 === i
                                          ? "0.0"
                                          : i === 1 / 0
                                            ? "inf"
                                            : i === -1 / 0
                                              ? "-inf"
                                              : Number.isNaN(i)
                                                ? "nan"
                                                : Math.abs(i) >= 1e16 ||
                                                    (0 !== i && Math.abs(i) < 1e-4)
                                                  ? i
                                                      .toExponential()
                                                      .replace(/e([+-])(\d)$/, "e$10$2")
                                                  : Number.isInteger(i)
                                                    ? i.toFixed(1).toString()
                                                    : i.toString());
                                    return [{ type: "terminal", str: t, length: t.length }, !1];
                                  }
                                  if ("bigint" === r.type || "complex" === r.type) {
                                    const t = r.value.toString();
                                    return [{ type: "terminal", str: t, length: t.length }, !1];
                                  }
                                  if ("string" === r.type) {
                                    const t = (function (t) {
                                      let e = JSON.stringify(t);
                                      return (
                                        (t.includes("'") && !t.includes('"')) ||
                                          (e = `'${e.slice(1, -1).replace(/'/g, "\\'").replace(/\\"/g, '"')}'`),
                                        e
                                      );
                                    })(r.value);
                                    return [{ type: "terminal", str: t, length: t.length }, !1];
                                  }
                                  if ("list" === r.type)
                                    return e.size > 100
                                      ? [
                                          { type: "terminal", str: "...<truncated>", length: 14 },
                                          !1,
                                        ]
                                      : 2 === r.value.length
                                        ? (function (r) {
                                            const i = n.get(r);
                                            if (void 0 !== i) return [i, !1];
                                            e.set(r, e.size);
                                            const s = r.value,
                                              [o, u] = t(s[0]),
                                              [a, l] = t(s[1]),
                                              c = u || l;
                                            e.delete(r);
                                            const p = {
                                              type: "pair",
                                              head: o,
                                              tail: a,
                                              length: o.length + a.length + 4,
                                            };
                                            return (c || n.set(r, p), [p, c]);
                                          })(r)
                                        : (function (r, i) {
                                            const s = n.get(r);
                                            if (void 0 !== s) return [s, !1];
                                            e.set(r, e.size);
                                            const o = i.map(t);
                                            let u = 2 + 2 * Math.max(0, o.length - 1),
                                              a = !1;
                                            for (let t = 0; t < o.length; t++)
                                              ((u += o[t][0].length), a || (a = o[t][1]));
                                            e.delete(r);
                                            const l = {
                                              type: "arraylike",
                                              elems: o.map(t => t[0]),
                                              prefix: "[",
                                              suffix: "]",
                                              length: u,
                                            };
                                            return (a || n.set(r, l), [l, a]);
                                          })(r, r.value);
                                  if ("closure" === r.type || "function" === r.type) {
                                    let t = "(anonymous)";
                                    if ("closure" === r.type) {
                                      const e = r.closure.node;
                                      t =
                                        e instanceof V.FunctionDef ? e.name.lexeme : "(anonymous)";
                                    } else t = r.name || "(anonymous)";
                                    const e = `<function ${t}>`;
                                    return [{ type: "terminal", str: e, length: e.length }, !1];
                                  }
                                  if ("builtin" === r.type) {
                                    const t = `<built-in function ${r.name}>`;
                                    return [{ type: "terminal", str: t, length: t.length }, !1];
                                  }
                                  return (function (t) {
                                    const e = t.split("\n");
                                    return 1 === e.length
                                      ? [{ type: "terminal", str: e[0], length: e[0].length }, !1]
                                      : [{ type: "multiline", lines: e, length: 1 / 0 }, !1];
                                  })(`<${r.type} object>`);
                                  var i;
                                })(t)[0];
                              })(t),
                              r,
                              n,
                            ),
                          )
                        );
                      })(t);
                    })(t)
                  : `<${t.type} object>`;
    }
    var r;
    return n;
  }
  const Ot = new Map(),
    Rt = [
      "ev3_pause",
      "ev3_connected",
      "ev3_motorA",
      "ev3_motorB",
      "ev3_motorC",
      "ev3_motorD",
      "ev3_motorGetSpeed",
      "ev3_motorSetSpeed",
      "ev3_motorStart",
      "ev3_motorStop",
      "ev3_motorSetStopAction",
      "ev3_motorGetPosition",
      "ev3_runForTime",
      "ev3_runToAbsolutePosition",
      "ev3_runToRelativePosition",
      "ev3_colorSensor",
      "ev3_colorSensorRed",
      "ev3_colorSensorGreen",
      "ev3_colorSensorBlue",
      "ev3_reflectedLightIntensity",
      "ev3_ambientLightIntensity",
      "ev3_colorSensorGetColor",
      "ev3_ultrasonicSensor",
      "ev3_ultrasonicSensorDistance",
      "ev3_gyroSensor",
      "ev3_gyroSensorAngle",
      "ev3_gyroSensorRate",
      "ev3_touchSensor1",
      "ev3_touchSensor2",
      "ev3_touchSensor3",
      "ev3_touchSensor4",
      "ev3_touchSensorPressed",
      "ev3_hello",
      "ev3_waitForButtonPress",
      "ev3_speak",
      "ev3_playSequence",
      "ev3_ledLeftGreen",
      "ev3_ledLeftRed",
      "ev3_ledRightGreen",
      "ev3_ledRightRed",
      "ev3_ledGetBrightness",
      "ev3_ledSetBrightness",
    ];
  for (const t of Rt)
    Ot.set(t, { type: "builtin", func: () => ({ type: "none" }), name: t, minArgs: 0 });
  var Pt = { name: Tt.EV3, prelude: "", builtins: Ot };
  function $t(t, e, n, r) {
    var i,
      s = arguments.length,
      o = s < 3 ? e : null === r ? (r = Object.getOwnPropertyDescriptor(e, n)) : r;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
      o = Reflect.decorate(t, e, n, r);
    else
      for (var u = t.length - 1; u >= 0; u--)
        (i = t[u]) && (o = (s < 3 ? i(o) : s > 3 ? i(e, n, o) : i(e, n)) || o);
    return (s > 3 && o && Object.defineProperty(e, n, o), o);
  }
  function Ut() {
    return (
      (Ut = Object.assign
        ? Object.assign.bind()
        : function (t) {
            for (var e = 1; e < arguments.length; e++) {
              var n = arguments[e];
              for (var r in n) ({}).hasOwnProperty.call(n, r) && (t[r] = n[r]);
            }
            return t;
          }),
      Ut.apply(null, arguments)
    );
  }
  "function" == typeof SuppressedError && SuppressedError;
  var zt = {
    relTol: 1e-12,
    absTol: 1e-15,
    matrix: "Matrix",
    number: "number",
    numberFallback: "number",
    precision: 64,
    predictable: !1,
    randomSeed: null,
  };
  function Gt(t, e) {
    return !(
      (!(function (t) {
        return "object" == typeof t && t && t.constructor === Object;
      })(t) &&
        !Array.isArray(t)) ||
      (!Oe(jt, e) && (e in Object.prototype || e in Function.prototype))
    );
  }
  var jt = { length: !0, name: !0 },
    qt = { toString: !0, valueOf: !0, toLocaleString: !0 };
  class Vt {
    constructor(t) {
      ((this.wrappedObject = t), (this[Symbol.iterator] = this.entries));
    }
    keys() {
      return Object.keys(this.wrappedObject)
        .filter(t => this.has(t))
        .values();
    }
    get(t) {
      return (function (t, e) {
        if (Gt(t, e)) return t[e];
        if (
          "function" == typeof t[e] &&
          (function (t, e) {
            return !(
              null == t ||
              "function" != typeof t[e] ||
              (Oe(t, e) && Object.getPrototypeOf && e in Object.getPrototypeOf(t)) ||
              (!Oe(qt, e) && (e in Object.prototype || e in Function.prototype))
            );
          })(t, e)
        )
          throw new Error('Cannot access method "' + e + '" as a property');
        throw new Error('No access to property "' + e + '"');
      })(this.wrappedObject, t);
    }
    set(t, e) {
      return (
        (function (t, e, n) {
          if (Gt(t, e)) return ((t[e] = n), n);
          throw new Error('No access to property "' + e + '"');
        })(this.wrappedObject, t, e),
        this
      );
    }
    has(t) {
      return Gt(this.wrappedObject, t) && t in this.wrappedObject;
    }
    entries() {
      return (
        (t = this.keys()),
        (e = t => [t, this.get(t)]),
        {
          next: () => {
            var n = t.next();
            return n.done ? n : { value: e(n.value), done: !1 };
          },
        }
      );
      var t, e;
    }
    forEach(t) {
      for (var e of this.keys()) t(this.get(e), e, this);
    }
    delete(t) {
      Gt(this.wrappedObject, t) && delete this.wrappedObject[t];
    }
    clear() {
      for (var t of this.keys()) this.delete(t);
    }
    get size() {
      return Object.keys(this.wrappedObject).length;
    }
  }
  function Wt(t) {
    return "number" == typeof t;
  }
  function Qt(t) {
    return (
      !(!t || "object" != typeof t || "function" != typeof t.constructor) &&
      ((!0 === t.isBigNumber &&
        "object" == typeof t.constructor.prototype &&
        !0 === t.constructor.prototype.isBigNumber) ||
        ("function" == typeof t.constructor.isDecimal && !0 === t.constructor.isDecimal(t)))
    );
  }
  function Ht(t) {
    return "bigint" == typeof t;
  }
  function Zt(t) {
    return (t && "object" == typeof t && !0 === Object.getPrototypeOf(t).isComplex) || !1;
  }
  function Jt(t) {
    return (t && "object" == typeof t && !0 === Object.getPrototypeOf(t).isFraction) || !1;
  }
  function Yt(t) {
    return (t && !0 === t.constructor.prototype.isUnit) || !1;
  }
  function Xt(t) {
    return "string" == typeof t;
  }
  var Kt = Array.isArray;
  function te(t) {
    return (t && !0 === t.constructor.prototype.isMatrix) || !1;
  }
  function ee(t) {
    return Array.isArray(t) || te(t);
  }
  function ne(t) {
    return (t && t.isDenseMatrix && !0 === t.constructor.prototype.isMatrix) || !1;
  }
  function re(t) {
    return (t && t.isSparseMatrix && !0 === t.constructor.prototype.isMatrix) || !1;
  }
  function ie(t) {
    return (t && !0 === t.constructor.prototype.isRange) || !1;
  }
  function se(t) {
    return (t && !0 === t.constructor.prototype.isIndex) || !1;
  }
  function oe(t) {
    return "boolean" == typeof t;
  }
  function ue(t) {
    return (t && !0 === t.constructor.prototype.isResultSet) || !1;
  }
  function ae(t) {
    return (t && !0 === t.constructor.prototype.isHelp) || !1;
  }
  function le(t) {
    return "function" == typeof t;
  }
  function ce(t) {
    return t instanceof Date;
  }
  function pe(t) {
    return t instanceof RegExp;
  }
  function he(t) {
    return !(!t || "object" != typeof t || t.constructor !== Object || Zt(t) || Jt(t));
  }
  function fe(t) {
    return (
      !!t &&
      (t instanceof Map ||
        t instanceof Vt ||
        ("function" == typeof t.set &&
          "function" == typeof t.get &&
          "function" == typeof t.keys &&
          "function" == typeof t.has))
    );
  }
  function me(t) {
    return null === t;
  }
  function de(t) {
    return void 0 === t;
  }
  function ge(t) {
    return (t && !0 === t.isAccessorNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function De(t) {
    return (t && !0 === t.isArrayNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function ye(t) {
    return (t && !0 === t.isAssignmentNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function ve(t) {
    return (t && !0 === t.isBlockNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function be(t) {
    return (t && !0 === t.isConditionalNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function we(t) {
    return (t && !0 === t.isConstantNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function Ee(t) {
    return (t && !0 === t.isFunctionAssignmentNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function xe(t) {
    return (t && !0 === t.isFunctionNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function Ae(t) {
    return (t && !0 === t.isIndexNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function Fe(t) {
    return (t && !0 === t.isNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function Ce(t) {
    return (t && !0 === t.isObjectNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function _e(t) {
    return (t && !0 === t.isOperatorNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function Ne(t) {
    return (t && !0 === t.isParenthesisNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function Se(t) {
    return (t && !0 === t.isRangeNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function Be(t) {
    return (t && !0 === t.isRelationalNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function Me(t) {
    return (t && !0 === t.isSymbolNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function Te(t) {
    return (t && !0 === t.constructor.prototype.isChain) || !1;
  }
  function Le(t) {
    var e = typeof t;
    return "object" === e
      ? null === t
        ? "null"
        : Qt(t)
          ? "BigNumber"
          : t.constructor && t.constructor.name
            ? t.constructor.name
            : "Object"
      : e;
  }
  function ke(t) {
    var e = typeof t;
    if ("number" === e || "bigint" === e || "string" === e || "boolean" === e || null == t)
      return t;
    if ("function" == typeof t.clone) return t.clone();
    if (Array.isArray(t))
      return t.map(function (t) {
        return ke(t);
      });
    if (t instanceof Date) return new Date(t.valueOf());
    if (Qt(t)) return t;
    if (he(t))
      return (function (t, e) {
        var n = {};
        for (var r in t) Oe(t, r) && (n[r] = e(t[r]));
        return n;
      })(t, ke);
    if ("function" === e) return t;
    throw new TypeError("Cannot clone: unknown type of value (value: ".concat(t, ")"));
  }
  function Ie(t, e) {
    var n, r, i;
    if (Array.isArray(t)) {
      if (!Array.isArray(e)) return !1;
      if (t.length !== e.length) return !1;
      for (r = 0, i = t.length; r < i; r++) if (!Ie(t[r], e[r])) return !1;
      return !0;
    }
    if ("function" == typeof t) return t === e;
    if (t instanceof Object) {
      if (Array.isArray(e) || !(e instanceof Object)) return !1;
      for (n in t) if (!(n in e) || !Ie(t[n], e[n])) return !1;
      for (n in e) if (!(n in t)) return !1;
      return !0;
    }
    return t === e;
  }
  function Oe(t, e) {
    return t && Object.hasOwnProperty.call(t, e);
  }
  var Re = function (t) {
    if (t)
      throw new Error(
        "The global config is readonly. \nPlease create a mathjs instance if you want to change the default configuration. \nExample:\n\n  import { create, all } from 'mathjs';\n  const mathjs = create(all);\n  mathjs.config({ number: 'BigNumber' });\n",
      );
    return Object.freeze(zt);
  };
  function Pe() {
    return !0;
  }
  function $e() {
    return !1;
  }
  function Ue() {}
  Ut(Re, zt, {
    MATRIX_OPTIONS: ["Matrix", "Array"],
    NUMBER_OPTIONS: ["number", "BigNumber", "bigint", "Fraction"],
  });
  const ze = "Argument is not a typed-function.";
  var Ge = (function t() {
    function e(t) {
      return "object" == typeof t && null !== t && t.constructor === Object;
    }
    const n = [
        {
          name: "number",
          test: function (t) {
            return "number" == typeof t;
          },
        },
        {
          name: "string",
          test: function (t) {
            return "string" == typeof t;
          },
        },
        {
          name: "boolean",
          test: function (t) {
            return "boolean" == typeof t;
          },
        },
        {
          name: "Function",
          test: function (t) {
            return "function" == typeof t;
          },
        },
        { name: "Array", test: Array.isArray },
        {
          name: "Date",
          test: function (t) {
            return t instanceof Date;
          },
        },
        {
          name: "RegExp",
          test: function (t) {
            return t instanceof RegExp;
          },
        },
        { name: "Object", test: e },
        {
          name: "null",
          test: function (t) {
            return null === t;
          },
        },
        {
          name: "undefined",
          test: function (t) {
            return void 0 === t;
          },
        },
      ],
      r = { name: "any", test: Pe, isAny: !0 };
    let i,
      s,
      o = 0,
      u = { createCount: 0 };
    function a(t) {
      const e = i.get(t);
      if (e) return e;
      let n = 'Unknown type "' + t + '"';
      const r = t.toLowerCase();
      let o;
      for (o of s)
        if (o.toLowerCase() === r) {
          n += '. Did you mean "' + o + '" ?';
          break;
        }
      throw new TypeError(n);
    }
    function l(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "any";
      const n = e ? a(e).index : s.length,
        r = [];
      for (let e = 0; e < t.length; ++e) {
        if (!t[e] || "string" != typeof t[e].name || "function" != typeof t[e].test)
          throw new TypeError("Object with properties {name: string, test: function} expected");
        const s = t[e].name;
        if (i.has(s)) throw new TypeError('Duplicate type name "' + s + '"');
        (r.push(s),
          i.set(s, {
            name: s,
            test: t[e].test,
            isAny: t[e].isAny,
            index: n + e,
            conversionsTo: [],
          }));
      }
      const o = s.slice(n);
      s = s.slice(0, n).concat(r).concat(o);
      for (let t = n + r.length; t < s.length; ++t) i.get(s[t]).index = t;
    }
    function c() {
      ((i = new Map()), (s = []), (o = 0), l([r], !1));
    }
    function p(t) {
      const e = s.filter(e => {
        const n = i.get(e);
        return !n.isAny && n.test(t);
      });
      return e.length ? e : ["any"];
    }
    function h(t) {
      return t && "function" == typeof t && "_typedFunctionData" in t;
    }
    function f(t, e, n) {
      if (!h(t)) throw new TypeError(ze);
      const r = n && n.exact,
        i = y(Array.isArray(e) ? e.join(",") : e),
        s = m(i);
      if (!r || s in t.signatures) {
        const e = t._typedFunctionData.signatureMap.get(s);
        if (e) return e;
      }
      const o = i.length;
      let u, a;
      if (r) {
        let e;
        for (e in ((u = []), t.signatures)) u.push(t._typedFunctionData.signatureMap.get(e));
      } else u = t._typedFunctionData.signatures;
      for (let t = 0; t < o; ++t) {
        const e = i[t],
          n = [];
        let r;
        for (r of u) {
          const i = E(r.params, t);
          if (i && (!e.restParam || i.restParam)) {
            if (!i.hasAny) {
              const t = D(i);
              if (e.types.some(e => !t.has(e.name))) continue;
            }
            n.push(r);
          }
        }
        if (((u = n), 0 === u.length)) break;
      }
      for (a of u) if (a.params.length <= o) return a;
      throw new TypeError(
        "Signature not found (signature: " + (t.name || "unnamed") + "(" + m(i, ", ") + "))",
      );
    }
    function m(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : ",";
      return t.map(t => t.name).join(e);
    }
    function d(t) {
      const e = 0 === t.indexOf("..."),
        n = (e ? (t.length > 3 ? t.slice(3) : "any") : t).split("|").map(t => a(t.trim()));
      let r = !1,
        i = e ? "..." : "";
      return {
        types: n.map(function (t) {
          return (
            (r = t.isAny || r),
            (i += t.name + "|"),
            {
              name: t.name,
              typeIndex: t.index,
              test: t.test,
              isAny: t.isAny,
              conversion: null,
              conversionIndex: -1,
            }
          );
        }),
        name: i.slice(0, -1),
        hasAny: r,
        hasConversion: !1,
        restParam: e,
      };
    }
    function g(t) {
      const e = (function (t) {
        if (0 === t.length) return [];
        const e = t.map(a);
        if (1 === t.length) return e[0].conversionsTo;
        const n = new Set(t),
          r = new Set();
        for (let t = 0; t < e.length; ++t)
          for (const i of e[t].conversionsTo) n.has(i.from) || r.add(i.from);
        const i = [];
        for (const t of r) {
          let n = o + 1,
            r = null;
          for (let i = 0; i < e.length; ++i)
            for (const s of e[i].conversionsTo)
              s.from === t && s.index < n && ((n = s.index), (r = s));
          i.push(r);
        }
        return i;
      })(t.types.map(t => t.name));
      let n = t.hasAny,
        r = t.name;
      const i = e.map(function (t) {
        const e = a(t.from);
        return (
          (n = e.isAny || n),
          (r += "|" + t.from),
          {
            name: t.from,
            typeIndex: e.index,
            test: e.test,
            isAny: e.isAny,
            conversion: t,
            conversionIndex: t.index,
          }
        );
      });
      return {
        types: t.types.concat(i),
        name: r,
        hasAny: n,
        hasConversion: i.length > 0,
        restParam: t.restParam,
      };
    }
    function D(t) {
      return (
        t.typeSet || ((t.typeSet = new Set()), t.types.forEach(e => t.typeSet.add(e.name))),
        t.typeSet
      );
    }
    function y(t) {
      const e = [];
      if ("string" != typeof t) throw new TypeError("Signatures must be strings");
      const n = t.trim();
      if ("" === n) return e;
      const r = n.split(",");
      for (let t = 0; t < r.length; ++t) {
        const n = d(r[t].trim());
        if (n.restParam && t !== r.length - 1)
          throw new SyntaxError(
            'Unexpected rest parameter "' + r[t] + '": only allowed for the last parameter',
          );
        if (0 === n.types.length) return null;
        e.push(n);
      }
      return e;
    }
    function v(t) {
      const e = P(t);
      return !!e && e.restParam;
    }
    function b(t) {
      if (t && 0 !== t.types.length) {
        if (1 === t.types.length) return a(t.types[0].name).test;
        if (2 === t.types.length) {
          const e = a(t.types[0].name).test,
            n = a(t.types[1].name).test;
          return function (t) {
            return e(t) || n(t);
          };
        }
        {
          const e = t.types.map(function (t) {
            return a(t.name).test;
          });
          return function (t) {
            for (let n = 0; n < e.length; n++) if (e[n](t)) return !0;
            return !1;
          };
        }
      }
      return Pe;
    }
    function w(t) {
      let e, n, r;
      if (v(t)) {
        e = R(t).map(b);
        const n = e.length,
          r = b(P(t)),
          i = function (t) {
            for (let e = n; e < t.length; e++) if (!r(t[e])) return !1;
            return !0;
          };
        return function (t) {
          for (let n = 0; n < e.length; n++) if (!e[n](t[n])) return !1;
          return i(t) && t.length >= n + 1;
        };
      }
      return 0 === t.length
        ? function (t) {
            return 0 === t.length;
          }
        : 1 === t.length
          ? ((n = b(t[0])),
            function (t) {
              return n(t[0]) && 1 === t.length;
            })
          : 2 === t.length
            ? ((n = b(t[0])),
              (r = b(t[1])),
              function (t) {
                return n(t[0]) && r(t[1]) && 2 === t.length;
              })
            : ((e = t.map(b)),
              function (t) {
                for (let n = 0; n < e.length; n++) if (!e[n](t[n])) return !1;
                return t.length === e.length;
              });
    }
    function E(t, e) {
      return e < t.length ? t[e] : v(t) ? P(t) : null;
    }
    function x(t, e) {
      const n = E(t, e);
      return n ? D(n) : new Set();
    }
    function A(t) {
      return null === t.conversion || void 0 === t.conversion;
    }
    function F(t, e) {
      const n = new Set();
      return (
        t.forEach(t => {
          const r = x(t.params, e);
          let i;
          for (i of r) n.add(i);
        }),
        n.has("any") ? ["any"] : Array.from(n)
      );
    }
    function C(t, e, n) {
      let r, i;
      const s = t || "unnamed";
      let o,
        u = n;
      for (o = 0; o < e.length; o++) {
        const t = [];
        if (
          (u.forEach(n => {
            const r = b(E(n.params, o));
            (o < n.params.length || v(n.params)) && r(e[o]) && t.push(n);
          }),
          0 === t.length)
        ) {
          if (((i = F(u, o)), i.length > 0)) {
            const t = p(e[o]);
            return (
              (r = new TypeError(
                "Unexpected type of argument in function " +
                  s +
                  " (expected: " +
                  i.join(" or ") +
                  ", actual: " +
                  t.join(" | ") +
                  ", index: " +
                  o +
                  ")",
              )),
              (r.data = { category: "wrongType", fn: s, index: o, actual: t, expected: i }),
              r
            );
          }
        } else u = t;
      }
      const a = u.map(function (t) {
        return v(t.params) ? 1 / 0 : t.params.length;
      });
      if (e.length < Math.min.apply(null, a))
        return (
          (i = F(u, o)),
          (r = new TypeError(
            "Too few arguments in function " +
              s +
              " (expected: " +
              i.join(" or ") +
              ", index: " +
              e.length +
              ")",
          )),
          (r.data = { category: "tooFewArgs", fn: s, index: e.length, expected: i }),
          r
        );
      const l = Math.max.apply(null, a);
      if (e.length > l)
        return (
          (r = new TypeError(
            "Too many arguments in function " +
              s +
              " (expected: " +
              l +
              ", actual: " +
              e.length +
              ")",
          )),
          (r.data = { category: "tooManyArgs", fn: s, index: e.length, expectedLength: l }),
          r
        );
      const c = [];
      for (let t = 0; t < e.length; ++t) c.push(p(e[t]).join("|"));
      return (
        (r = new TypeError(
          'Arguments of type "' +
            c.join(", ") +
            '" do not match any of the defined signatures of function ' +
            s +
            ".",
        )),
        (r.data = { category: "mismatch", actual: c }),
        r
      );
    }
    function _(t) {
      let e = s.length + 1;
      for (let n = 0; n < t.types.length; n++) e = Math.min(e, t.types[n].typeIndex);
      return e;
    }
    function N(t) {
      let e = o + 1;
      for (let n = 0; n < t.types.length; n++)
        A(t.types[n]) || (e = Math.min(e, t.types[n].conversionIndex));
      return e;
    }
    function S(t, e) {
      if (t.hasAny) {
        if (!e.hasAny) return 0.1;
      } else if (e.hasAny) return -0.1;
      if (t.restParam) {
        if (!e.restParam) return 0.01;
      } else if (e.restParam) return -0.01;
      const n = _(t) - _(e);
      if (n < 0) return -0.001;
      if (n > 0) return 0.001;
      const r = N(t),
        i = N(e);
      if (t.hasConversion) {
        if (!e.hasConversion) return 1e-6 * (1 + r);
      } else if (e.hasConversion) return 1e-6 * -(1 + i);
      const s = r - i;
      return s < 0 ? -1e-7 : s > 0 ? 1e-7 : 0;
    }
    function B(t, e) {
      const n = t.params,
        r = e.params,
        i = P(n),
        s = P(r),
        o = v(n),
        u = v(r);
      if (o && i.hasAny) {
        if (!u || !s.hasAny) return 1e7;
      } else if (u && s.hasAny) return -1e7;
      let a,
        l = 0,
        c = 0;
      for (a of n) (a.hasAny && ++l, a.hasConversion && ++c);
      let p = 0,
        h = 0;
      for (a of r) (a.hasAny && ++p, a.hasConversion && ++h);
      if (l !== p) return 1e6 * (l - p);
      if (o && i.hasConversion) {
        if (!u || !s.hasConversion) return 1e5;
      } else if (u && s.hasConversion) return -1e5;
      if (c !== h) return 1e4 * (c - h);
      if (o) {
        if (!u) return 1e3;
      } else if (u) return -1e3;
      const f = (n.length - r.length) * (o ? -100 : 100);
      if (0 !== f) return f;
      const m = [];
      let d,
        g = 0;
      for (let t = 0; t < n.length; ++t) {
        const e = S(n[t], r[t]);
        (m.push(e), (g += e));
      }
      if (0 !== g) return (g < 0 ? -10 : 10) + g;
      let D = 9;
      const y = D / (m.length + 1);
      for (d of m) {
        if (0 !== d) return (d < 0 ? -D : D) + d;
        D -= y;
      }
      return 0;
    }
    function M(t, e) {
      let n = e,
        r = "";
      if (t.some(t => t.hasConversion)) {
        const i = v(t),
          s = t.map(T);
        ((r = s.map(t => t.name).join(";")),
          (n = function () {
            const t = [],
              n = i ? arguments.length - 1 : arguments.length;
            for (let e = 0; e < n; e++) t[e] = s[e](arguments[e]);
            return (i && (t[n] = arguments[n].map(s[n])), e.apply(this, t));
          }));
      }
      let i = n;
      if (v(t)) {
        const e = t.length - 1;
        i = function () {
          return n.apply(this, $(arguments, 0, e).concat([$(arguments, e)]));
        };
      }
      return (r && Object.defineProperty(i, "name", { value: r }), i);
    }
    function T(t) {
      let e, n, r, i;
      const s = [],
        o = [];
      let u = "";
      (t.types.forEach(function (t) {
        t.conversion &&
          ((u += t.conversion.from + "~>" + t.conversion.to + ","),
          s.push(a(t.conversion.from).test),
          o.push(t.conversion.convert));
      }),
        (u = u ? u.slice(0, -1) : "pass"));
      let l = t => t;
      switch (o.length) {
        case 0:
          break;
        case 1:
          ((e = s[0]),
            (r = o[0]),
            (l = function (t) {
              return e(t) ? r(t) : t;
            }));
          break;
        case 2:
          ((e = s[0]),
            (n = s[1]),
            (r = o[0]),
            (i = o[1]),
            (l = function (t) {
              return e(t) ? r(t) : n(t) ? i(t) : t;
            }));
          break;
        default:
          l = function (t) {
            for (let e = 0; e < o.length; e++) if (s[e](t)) return o[e](t);
            return t;
          };
      }
      return (Object.defineProperty(l, "name", { value: u }), l);
    }
    function L(t) {
      return (function t(e, n, r) {
        if (n < e.length) {
          const o = e[n];
          let u = [];
          if (o.restParam) {
            const t = o.types.filter(A);
            (t.length < o.types.length &&
              u.push({
                types: t,
                name: "..." + t.map(t => t.name).join("|"),
                hasAny: t.some(t => t.isAny),
                hasConversion: !1,
                restParam: !0,
              }),
              u.push(o));
          } else
            u = o.types.map(function (t) {
              return {
                types: [t],
                name: t.name,
                hasAny: t.isAny,
                hasConversion: t.conversion,
                restParam: !1,
              };
            });
          return (
            (i = u),
            (s = function (i) {
              return t(e, n + 1, r.concat([i]));
            }),
            Array.prototype.concat.apply([], i.map(s))
          );
        }
        return [r];
        var i, s;
      })(t, 0, []);
    }
    function k(t, e) {
      const n = Math.max(t.length, e.length);
      for (let r = 0; r < n; r++) {
        const n = x(t, r),
          i = x(e, r);
        let s,
          o = !1;
        for (s of i)
          if (n.has(s)) {
            o = !0;
            break;
          }
        if (!o) return !1;
      }
      const r = t.length,
        i = e.length,
        s = v(t),
        o = v(e);
      return s ? (o ? r === i : i >= r) : o ? r >= i : r === i;
    }
    function I(t, e, n) {
      const r = [];
      let i;
      for (i of t) {
        let t = n[i];
        if ("number" != typeof t)
          throw new TypeError('No definition for referenced signature "' + i + '"');
        if (((t = e[t]), "function" != typeof t)) return !1;
        r.push(t);
      }
      return r;
    }
    function O(t, e, n) {
      throw C(t, e, n);
    }
    function R(t) {
      return $(t, 0, t.length - 1);
    }
    function P(t) {
      return t[t.length - 1];
    }
    function $(t, e, n) {
      return Array.prototype.slice.call(t, e, n);
    }
    function U(t, e) {
      return { referTo: { references: t, callback: e } };
    }
    function z(t) {
      if ("function" != typeof t)
        throw new TypeError("Callback function expected as first argument");
      return { referToSelf: { callback: t } };
    }
    function G(t) {
      return (
        t &&
        "object" == typeof t.referTo &&
        Array.isArray(t.referTo.references) &&
        "function" == typeof t.referTo.callback
      );
    }
    function j(t) {
      return t && "object" == typeof t.referToSelf && "function" == typeof t.referToSelf.callback;
    }
    function q(t, e) {
      if (!t) return e;
      if (e && e !== t) {
        const n = new Error("Function names do not match (expected: " + t + ", actual: " + e + ")");
        throw ((n.data = { actual: e, expected: t }), n);
      }
      return t;
    }
    function V(t) {
      let e;
      for (const n in t)
        Object.prototype.hasOwnProperty.call(t, n) &&
          (h(t[n]) || "string" == typeof t[n].signature) &&
          (e = q(e, t[n].name));
      return e;
    }
    function W(t, e) {
      let n;
      for (n in e)
        if (Object.prototype.hasOwnProperty.call(e, n)) {
          if (n in t && e[n] !== t[n]) {
            const r = new Error('Signature "' + n + '" is defined twice');
            throw ((r.data = { signature: n, sourceFunction: e[n], destFunction: t[n] }), r);
          }
          t[n] = e[n];
        }
    }
    (c(), l(n));
    const Q = u;
    function H(t) {
      if (
        !t ||
        "string" != typeof t.from ||
        "string" != typeof t.to ||
        "function" != typeof t.convert
      )
        throw new TypeError(
          "Object with properties {from: string, to: string, convert: function} expected",
        );
      if (t.to === t.from)
        throw new SyntaxError('Illegal to define conversion from "' + t.from + '" to itself.');
    }
    return (
      (u = function (t) {
        const n = "string" == typeof t;
        let r = n ? t : "";
        const i = {};
        for (let t = n ? 1 : 0; t < arguments.length; ++t) {
          const s = arguments[t];
          let o,
            u = {};
          if (
            ("function" == typeof s
              ? ((o = s.name),
                "string" == typeof s.signature ? (u[s.signature] = s) : h(s) && (u = s.signatures))
              : e(s) && ((u = s), n || (o = V(s))),
            0 === Object.keys(u).length)
          ) {
            const e = new TypeError(
              "Argument to 'typed' at index " +
                t +
                " is not a (typed) function, nor an object with signatures as keys and functions as values.",
            );
            throw ((e.data = { index: t, argument: s }), e);
          }
          (n || (r = q(r, o)), W(i, u));
        }
        return (function (t, e) {
          if ((u.createCount++, 0 === Object.keys(e).length))
            throw new SyntaxError("No signatures provided");
          u.warnAgainstDeprecatedThis &&
            (function (t) {
              const e = /\bthis(\(|\.signatures\b)/;
              Object.keys(t).forEach(n => {
                const r = t[n];
                if (e.test(r.toString()))
                  throw new SyntaxError(
                    "Using `this` to self-reference a function is deprecated since typed-function@3. Use typed.referTo and typed.referToSelf instead.",
                  );
              });
            })(e);
          const n = [],
            r = [],
            i = {},
            s = [];
          let o;
          for (o in e) {
            if (!Object.prototype.hasOwnProperty.call(e, o)) continue;
            const t = y(o);
            if (!t) continue;
            (n.forEach(function (e) {
              if (k(e, t))
                throw new TypeError('Conflicting signatures "' + m(e) + '" and "' + m(t) + '".');
            }),
              n.push(t));
            const u = r.length;
            r.push(e[o]);
            const a = t.map(g);
            let l;
            for (l of L(a)) {
              const t = m(l);
              (s.push({ params: l, name: t, fn: u }), l.every(t => !t.hasConversion) && (i[t] = u));
            }
          }
          s.sort(B);
          const a = (function (t, e, n) {
            const r = (function (t) {
                return t.map(t =>
                  j(t)
                    ? z(t.referToSelf.callback)
                    : G(t)
                      ? U(t.referTo.references, t.referTo.callback)
                      : t,
                );
              })(t),
              i = new Array(r.length).fill(!1);
            let s = !0;
            for (; s;) {
              s = !1;
              let t = !0;
              for (let o = 0; o < r.length; ++o) {
                if (i[o]) continue;
                const u = r[o];
                if (j(u))
                  ((r[o] = u.referToSelf.callback(n)),
                    (r[o].referToSelf = u.referToSelf),
                    (i[o] = !0),
                    (t = !1));
                else if (G(u)) {
                  const n = I(u.referTo.references, r, e);
                  n
                    ? ((r[o] = u.referTo.callback.apply(this, n)),
                      (r[o].referTo = u.referTo),
                      (i[o] = !0),
                      (t = !1))
                    : (s = !0);
                }
              }
              if (t && s)
                throw new SyntaxError("Circular reference detected in resolving typed.referTo");
            }
            return r;
          })(r, i, lt);
          let l;
          for (l in i) Object.prototype.hasOwnProperty.call(i, l) && (i[l] = a[i[l]]);
          const c = [],
            p = new Map();
          for (l of s) p.has(l.name) || ((l.fn = a[l.fn]), c.push(l), p.set(l.name, l));
          const h = c[0] && c[0].params.length <= 2 && !v(c[0].params),
            f = c[1] && c[1].params.length <= 2 && !v(c[1].params),
            d = c[2] && c[2].params.length <= 2 && !v(c[2].params),
            D = c[3] && c[3].params.length <= 2 && !v(c[3].params),
            E = c[4] && c[4].params.length <= 2 && !v(c[4].params),
            x = c[5] && c[5].params.length <= 2 && !v(c[5].params),
            A = h && f && d && D && E && x;
          for (let t = 0; t < c.length; ++t) c[t].test = w(c[t].params);
          const F = h ? b(c[0].params[0]) : $e,
            C = f ? b(c[1].params[0]) : $e,
            _ = d ? b(c[2].params[0]) : $e,
            N = D ? b(c[3].params[0]) : $e,
            S = E ? b(c[4].params[0]) : $e,
            T = x ? b(c[5].params[0]) : $e,
            O = h ? b(c[0].params[1]) : $e,
            R = f ? b(c[1].params[1]) : $e,
            P = d ? b(c[2].params[1]) : $e,
            $ = D ? b(c[3].params[1]) : $e,
            q = E ? b(c[4].params[1]) : $e,
            V = x ? b(c[5].params[1]) : $e;
          for (let t = 0; t < c.length; ++t) c[t].implementation = M(c[t].params, c[t].fn);
          const W = h ? c[0].implementation : Ue,
            Q = f ? c[1].implementation : Ue,
            H = d ? c[2].implementation : Ue,
            Z = D ? c[3].implementation : Ue,
            J = E ? c[4].implementation : Ue,
            Y = x ? c[5].implementation : Ue,
            X = h ? c[0].params.length : -1,
            K = f ? c[1].params.length : -1,
            tt = d ? c[2].params.length : -1,
            et = D ? c[3].params.length : -1,
            nt = E ? c[4].params.length : -1,
            rt = x ? c[5].params.length : -1,
            it = A ? 6 : 0,
            st = c.length,
            ot = c.map(t => t.test),
            ut = c.map(t => t.implementation),
            at = function () {
              for (let t = it; t < st; t++)
                if (ot[t](arguments)) return ut[t].apply(this, arguments);
              return u.onMismatch(t, arguments, c);
            };
          function lt(t, e) {
            return arguments.length === X && F(t) && O(e)
              ? W.apply(this, arguments)
              : arguments.length === K && C(t) && R(e)
                ? Q.apply(this, arguments)
                : arguments.length === tt && _(t) && P(e)
                  ? H.apply(this, arguments)
                  : arguments.length === et && N(t) && $(e)
                    ? Z.apply(this, arguments)
                    : arguments.length === nt && S(t) && q(e)
                      ? J.apply(this, arguments)
                      : arguments.length === rt && T(t) && V(e)
                        ? Y.apply(this, arguments)
                        : at.apply(this, arguments);
          }
          try {
            Object.defineProperty(lt, "name", { value: t });
          } catch (t) {}
          return (
            (lt.signatures = i),
            (lt._typedFunctionData = { signatures: c, signatureMap: p }),
            lt
          );
        })(r || "", i);
      }),
      (u.create = t),
      (u.createCount = Q.createCount),
      (u.onMismatch = O),
      (u.throwMismatchError = O),
      (u.createError = C),
      (u.clear = c),
      (u.clearConversions = function () {
        let t;
        for (t of s) i.get(t).conversionsTo = [];
        o = 0;
      }),
      (u.addTypes = l),
      (u._findType = a),
      (u.referTo = function () {
        const t = R(arguments).map(t => m(y(t))),
          e = P(arguments);
        if ("function" != typeof e)
          throw new TypeError("Callback function expected as last argument");
        return U(t, e);
      }),
      (u.referToSelf = z),
      (u.convert = function (t, e) {
        const n = a(e);
        if (n.test(t)) return t;
        const r = n.conversionsTo;
        if (0 === r.length) throw new Error("There are no conversions to " + e + " defined.");
        for (let e = 0; e < r.length; e++) if (a(r[e].from).test(t)) return r[e].convert(t);
        throw new Error("Cannot convert " + t + " to " + e);
      }),
      (u.findSignature = f),
      (u.find = function (t, e, n) {
        return f(t, e, n).implementation;
      }),
      (u.isTypedFunction = h),
      (u.warnAgainstDeprecatedThis = !0),
      (u.addType = function (t, e) {
        let n = "any";
        (!1 !== e && i.has("Object") && (n = "Object"), u.addTypes([t], n));
      }),
      (u.addConversion = function (t) {
        let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { override: !1 };
        H(t);
        const n = a(t.to),
          r = n.conversionsTo.find(e => e.from === t.from);
        if (r) {
          if (!e || !e.override)
            throw new Error(
              'There is already a conversion from "' + t.from + '" to "' + n.name + '"',
            );
          u.removeConversion({ from: r.from, to: t.to, convert: r.convert });
        }
        n.conversionsTo.push({ from: t.from, to: n.name, convert: t.convert, index: o++ });
      }),
      (u.addConversions = function (t, e) {
        t.forEach(t => u.addConversion(t, e));
      }),
      (u.removeConversion = function (t) {
        H(t);
        const e = a(t.to),
          n = (function (t, e) {
            for (let n = 0; n < t.length; n++) if (e(t[n])) return t[n];
          })(e.conversionsTo, e => e.from === t.from);
        if (!n)
          throw new Error(
            "Attempt to remove nonexistent conversion from " + t.from + " to " + t.to,
          );
        if (n.convert !== t.convert)
          throw new Error("Conversion to remove does not match existing conversion");
        const r = e.conversionsTo.indexOf(n);
        e.conversionsTo.splice(r, 1);
      }),
      (u.resolve = function (t, e) {
        if (!h(t)) throw new TypeError(ze);
        const n = t._typedFunctionData.signatures;
        for (let t = 0; t < n.length; ++t) if (n[t].test(e)) return n[t];
        return null;
      }),
      u
    );
  })();
  function je(t, e, n, r) {
    function i(r) {
      var i = (function (t, e) {
        for (var n = {}, r = 0; r < e.length; r++) {
          var i = e[r],
            s = t[i];
          void 0 !== s && (n[i] = s);
        }
        return n;
      })(r, e.map(qe));
      return (
        (function (t, e, n) {
          if (
            !e
              .filter(
                t =>
                  !(function (t) {
                    return t && "?" === t[0];
                  })(t),
              )
              .every(t => void 0 !== n[t])
          ) {
            var r = e.filter(t => void 0 === n[t]);
            throw new Error(
              'Cannot create function "'.concat(t, '", ') +
                "some dependencies are missing: ".concat(
                  r.map(t => '"'.concat(t, '"')).join(", "),
                  ".",
                ),
            );
          }
        })(t, e, r),
        n(i)
      );
    }
    return (
      (i.isFactory = !0),
      (i.fn = t),
      (i.dependencies = e.slice().sort()),
      r && (i.meta = r),
      i
    );
  }
  function qe(t) {
    return t && "?" === t[0] ? t.slice(1) : t;
  }
  function Ve(t) {
    return "boolean" == typeof t || (!!isFinite(t) && t === Math.round(t));
  }
  var We =
    Math.sign ||
    function (t) {
      return t > 0 ? 1 : t < 0 ? -1 : 0;
    };
  function Qe(t, e, n) {
    var r = { 2: "0b", 8: "0o", 16: "0x" }[e],
      i = "";
    if (n) {
      if (n < 1) throw new Error("size must be in greater than 0");
      if (!Ve(n)) throw new Error("size must be an integer");
      if (t > 2 ** (n - 1) - 1 || t < -(2 ** (n - 1)))
        throw new Error("Value must be in range [-2^".concat(n - 1, ", 2^").concat(n - 1, "-1]"));
      if (!Ve(t)) throw new Error("Value must be an integer");
      (t < 0 && (t += 2 ** n), (i = "i".concat(n)));
    }
    var s = "";
    return (t < 0 && ((t = -t), (s = "-")), "".concat(s).concat(r).concat(t.toString(e)).concat(i));
  }
  function He(t, e) {
    if ("function" == typeof e) return e(t);
    if (t === 1 / 0) return "Infinity";
    if (t === -1 / 0) return "-Infinity";
    if (isNaN(t)) return "NaN";
    var { notation: n, precision: r, wordSize: i } = Ze(e);
    switch (n) {
      case "fixed":
        return (function (t, e) {
          if (isNaN(t) || !isFinite(t)) return String(t);
          var n = Je(t),
            r = "number" == typeof e ? Xe(n, n.exponent + 1 + e) : n,
            i = r.coefficients,
            s = r.exponent + 1,
            o = s + (e || 0);
          return (
            i.length < o && (i = i.concat(Ke(o - i.length))),
            s < 0 && ((i = Ke(1 - s).concat(i)), (s = 1)),
            s < i.length && i.splice(s, 0, 0 === s ? "0." : "."),
            r.sign + i.join("")
          );
        })(t, r);
      case "exponential":
        return Ye(t, r);
      case "engineering":
        return (function (t, e) {
          if (isNaN(t) || !isFinite(t)) return String(t);
          var n = Xe(Je(t), e),
            r = n.exponent,
            i = n.coefficients,
            s = r % 3 == 0 ? r : r < 0 ? r - 3 - (r % 3) : r - (r % 3);
          if (Wt(e)) for (; e > i.length || r - s + 1 > i.length;) i.push(0);
          else for (var o = Math.abs(r - s) - (i.length - 1), u = 0; u < o; u++) i.push(0);
          for (var a = Math.abs(r - s), l = 1; a > 0;) (l++, a--);
          var c = i.slice(l).join(""),
            p = (Wt(e) && c.length) || c.match(/[1-9]/) ? "." + c : "",
            h = i.slice(0, l).join("") + p + "e" + (r >= 0 ? "+" : "") + s.toString();
          return n.sign + h;
        })(t, r);
      case "bin":
        return Qe(t, 2, i);
      case "oct":
        return Qe(t, 8, i);
      case "hex":
        return Qe(t, 16, i);
      case "auto":
        return (function (t, e, n) {
          if (isNaN(t) || !isFinite(t)) return String(t);
          var r = nn(null == n ? void 0 : n.lowerExp, -3),
            i = nn(null == n ? void 0 : n.upperExp, 5),
            s = Je(t),
            o = e ? Xe(s, e) : s;
          if (o.exponent < r || o.exponent >= i) return Ye(t, e);
          var u = o.coefficients,
            a = o.exponent;
          (u.length < e && (u = u.concat(Ke(e - u.length))),
            (u = u.concat(Ke(a - u.length + 1 + (u.length < e ? e - u.length : 0)))));
          var l = a > 0 ? a : 0;
          return (
            l < (u = Ke(-a).concat(u)).length - 1 && u.splice(l + 1, 0, "."),
            o.sign + u.join("")
          );
        })(t, r, e).replace(/((\.\d*?)(0+))($|e)/, function () {
          var t = arguments[2],
            e = arguments[4];
          return "." !== t ? t + e : e;
        });
      default:
        throw new Error(
          'Unknown notation "' +
            n +
            '". Choose "auto", "exponential", "fixed", "bin", "oct", or "hex.',
        );
    }
  }
  function Ze(t) {
    var e,
      n,
      r = "auto";
    if (void 0 !== t)
      if (Wt(t)) e = t;
      else if (Qt(t)) e = t.toNumber();
      else {
        if (!he(t))
          throw new Error("Unsupported type of options, number, BigNumber, or object expected");
        (void 0 !== t.precision &&
          (e = en(t.precision, () => {
            throw new Error('Option "precision" must be a number or BigNumber');
          })),
          void 0 !== t.wordSize &&
            (n = en(t.wordSize, () => {
              throw new Error('Option "wordSize" must be a number or BigNumber');
            })),
          t.notation && (r = t.notation));
      }
    return { notation: r, precision: e, wordSize: n };
  }
  function Je(t) {
    var e = String(t)
      .toLowerCase()
      .match(/^(-?)(\d+\.?\d*)(e([+-]?\d+))?$/);
    if (!e) throw new SyntaxError("Invalid number " + t);
    var n = e[1],
      r = e[2],
      i = parseFloat(e[4] || "0"),
      s = r.indexOf(".");
    i += -1 !== s ? s - 1 : r.length - 1;
    var o = r
      .replace(".", "")
      .replace(/^0*/, function (t) {
        return ((i -= t.length), "");
      })
      .replace(/0*$/, "")
      .split("")
      .map(function (t) {
        return parseInt(t);
      });
    return (0 === o.length && (o.push(0), i++), { sign: n, coefficients: o, exponent: i });
  }
  function Ye(t, e) {
    if (isNaN(t) || !isFinite(t)) return String(t);
    var n = Je(t),
      r = e ? Xe(n, e) : n,
      i = r.coefficients,
      s = r.exponent;
    i.length < e && (i = i.concat(Ke(e - i.length)));
    var o = i.shift();
    return r.sign + o + (i.length > 0 ? "." + i.join("") : "") + "e" + (s >= 0 ? "+" : "") + s;
  }
  function Xe(t, e) {
    for (
      var n = { sign: t.sign, coefficients: t.coefficients, exponent: t.exponent },
        r = n.coefficients;
      e <= 0;
    )
      (r.unshift(0), n.exponent++, e++);
    if (r.length > e && r.splice(e, r.length - e)[0] >= 5) {
      var i = e - 1;
      for (r[i]++; 10 === r[i];) (r.pop(), 0 === i && (r.unshift(0), n.exponent++, i++), r[--i]++);
    }
    return n;
  }
  function Ke(t) {
    for (var e = [], n = 0; n < t; n++) e.push(0);
    return e;
  }
  function tn(t, e) {
    var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1e-8,
      r = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 0;
    if (n <= 0) throw new Error("Relative tolerance must be greater than 0");
    if (r < 0) throw new Error("Absolute tolerance must be at least 0");
    return (
      !isNaN(t) &&
      !isNaN(e) &&
      (isFinite(t) && isFinite(e)
        ? t === e || Math.abs(t - e) <= Math.max(n * Math.max(Math.abs(t), Math.abs(e)), r)
        : t === e)
    );
  }
  function en(t, e) {
    return Wt(t) ? t : Qt(t) ? t.toNumber() : void e();
  }
  function nn(t, e) {
    return Wt(t) ? t : Qt(t) ? t.toNumber() : e;
  }
  var rn = function () {
      return ((rn = Ge.create), Ge);
    },
    sn = je("typed", ["?BigNumber", "?Complex", "?DenseMatrix", "?Fraction"], function (t) {
      var { BigNumber: e, Complex: n, DenseMatrix: r, Fraction: i } = t,
        s = rn();
      return (
        s.clear(),
        s.addTypes([
          { name: "number", test: Wt },
          { name: "Complex", test: Zt },
          { name: "BigNumber", test: Qt },
          { name: "bigint", test: Ht },
          { name: "Fraction", test: Jt },
          { name: "Unit", test: Yt },
          {
            name: "identifier",
            test: t =>
              Xt &&
              /^(?:[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CD\uA7D0\uA7D1\uA7D3\uA7D5-\uA7DC\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC4\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD887][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF39\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD888[\uDC00-\uDFAF])(?:[0-9A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CD\uA7D0\uA7D1\uA7D3\uA7D5-\uA7DC\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC4\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD887][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF39\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD888[\uDC00-\uDFAF])*$/.test(
                t,
              ),
          },
          { name: "string", test: Xt },
          { name: "Chain", test: Te },
          { name: "Array", test: Kt },
          { name: "Matrix", test: te },
          { name: "DenseMatrix", test: ne },
          { name: "SparseMatrix", test: re },
          { name: "Range", test: ie },
          { name: "Index", test: se },
          { name: "boolean", test: oe },
          { name: "ResultSet", test: ue },
          { name: "Help", test: ae },
          { name: "function", test: le },
          { name: "Date", test: ce },
          { name: "RegExp", test: pe },
          { name: "null", test: me },
          { name: "undefined", test: de },
          { name: "AccessorNode", test: ge },
          { name: "ArrayNode", test: De },
          { name: "AssignmentNode", test: ye },
          { name: "BlockNode", test: ve },
          { name: "ConditionalNode", test: be },
          { name: "ConstantNode", test: we },
          { name: "FunctionNode", test: xe },
          { name: "FunctionAssignmentNode", test: Ee },
          { name: "IndexNode", test: Ae },
          { name: "Node", test: Fe },
          { name: "ObjectNode", test: Ce },
          { name: "OperatorNode", test: _e },
          { name: "ParenthesisNode", test: Ne },
          { name: "RangeNode", test: Se },
          { name: "RelationalNode", test: Be },
          { name: "SymbolNode", test: Me },
          { name: "Map", test: fe },
          { name: "Object", test: he },
        ]),
        s.addConversions([
          {
            from: "number",
            to: "BigNumber",
            convert: function (t) {
              if (
                (e || on(t),
                t
                  .toExponential()
                  .replace(/e.*$/, "")
                  .replace(/^0\.?0*|\./, "").length > 15)
              )
                throw new TypeError(
                  "Cannot implicitly convert a number with >15 significant digits to BigNumber (value: " +
                    t +
                    "). Use function bignumber(x) to convert to BigNumber.",
                );
              return new e(t);
            },
          },
          {
            from: "number",
            to: "Complex",
            convert: function (t) {
              return (n || un(t), new n(t, 0));
            },
          },
          {
            from: "BigNumber",
            to: "Complex",
            convert: function (t) {
              return (n || un(t), new n(t.toNumber(), 0));
            },
          },
          {
            from: "bigint",
            to: "number",
            convert: function (t) {
              if (t > Number.MAX_SAFE_INTEGER)
                throw new TypeError(
                  "Cannot implicitly convert bigint to number: value exceeds the max safe integer value (value: " +
                    t +
                    ")",
                );
              return Number(t);
            },
          },
          {
            from: "bigint",
            to: "BigNumber",
            convert: function (t) {
              return (e || on(t), new e(t.toString()));
            },
          },
          {
            from: "bigint",
            to: "Fraction",
            convert: function (t) {
              return (i || an(t), new i(t));
            },
          },
          {
            from: "Fraction",
            to: "BigNumber",
            convert: function (t) {
              throw new TypeError(
                "Cannot implicitly convert a Fraction to BigNumber or vice versa. Use function bignumber(x) to convert to BigNumber or fraction(x) to convert to Fraction.",
              );
            },
          },
          {
            from: "Fraction",
            to: "Complex",
            convert: function (t) {
              return (n || un(t), new n(t.valueOf(), 0));
            },
          },
          {
            from: "number",
            to: "Fraction",
            convert: function (t) {
              i || an(t);
              var e = new i(t);
              if (e.valueOf() !== t)
                throw new TypeError(
                  "Cannot implicitly convert a number to a Fraction when there will be a loss of precision (value: " +
                    t +
                    "). Use function fraction(x) to convert to Fraction.",
                );
              return e;
            },
          },
          {
            from: "string",
            to: "number",
            convert: function (t) {
              var e = Number(t);
              if (isNaN(e)) throw new Error('Cannot convert "' + t + '" to a number');
              return e;
            },
          },
          {
            from: "string",
            to: "BigNumber",
            convert: function (t) {
              e || on(t);
              try {
                return new e(t);
              } catch (e) {
                throw new Error('Cannot convert "' + t + '" to BigNumber');
              }
            },
          },
          {
            from: "string",
            to: "bigint",
            convert: function (t) {
              try {
                return BigInt(t);
              } catch (e) {
                throw new Error('Cannot convert "' + t + '" to BigInt');
              }
            },
          },
          {
            from: "string",
            to: "Fraction",
            convert: function (t) {
              i || an(t);
              try {
                return new i(t);
              } catch (e) {
                throw new Error('Cannot convert "' + t + '" to Fraction');
              }
            },
          },
          {
            from: "string",
            to: "Complex",
            convert: function (t) {
              n || un(t);
              try {
                return new n(t);
              } catch (e) {
                throw new Error('Cannot convert "' + t + '" to Complex');
              }
            },
          },
          {
            from: "boolean",
            to: "number",
            convert: function (t) {
              return +t;
            },
          },
          {
            from: "boolean",
            to: "BigNumber",
            convert: function (t) {
              return (e || on(t), new e(+t));
            },
          },
          {
            from: "boolean",
            to: "bigint",
            convert: function (t) {
              return BigInt(+t);
            },
          },
          {
            from: "boolean",
            to: "Fraction",
            convert: function (t) {
              return (i || an(t), new i(+t));
            },
          },
          {
            from: "boolean",
            to: "string",
            convert: function (t) {
              return String(t);
            },
          },
          {
            from: "Array",
            to: "Matrix",
            convert: function (t) {
              return (
                r ||
                  (function () {
                    throw new Error(
                      "Cannot convert array into a Matrix: no class 'DenseMatrix' provided",
                    );
                  })(),
                new r(t)
              );
            },
          },
          {
            from: "Matrix",
            to: "Array",
            convert: function (t) {
              return t.valueOf();
            },
          },
        ]),
        (s.onMismatch = (t, e, n) => {
          var r = s.createError(t, e, n);
          if (
            ["wrongType", "mismatch"].includes(r.data.category) &&
            1 === e.length &&
            ee(e[0]) &&
            n.some(t => !t.params.includes(","))
          ) {
            var i = new TypeError(
              "Function '".concat(t, "' doesn't apply to matrices. To call it ") +
                "elementwise on a matrix 'M', try 'map(M, ".concat(t, ")'."),
            );
            throw ((i.data = r.data), i);
          }
          throw r;
        }),
        (s.onMismatch = (t, e, n) => {
          var r = s.createError(t, e, n);
          if (
            ["wrongType", "mismatch"].includes(r.data.category) &&
            1 === e.length &&
            ee(e[0]) &&
            n.some(t => !t.params.includes(","))
          ) {
            var i = new TypeError(
              "Function '".concat(t, "' doesn't apply to matrices. To call it ") +
                "elementwise on a matrix 'M', try 'map(M, ".concat(t, ")'."),
            );
            throw ((i.data = r.data), i);
          }
          throw r;
        }),
        s
      );
    });
  function on(t) {
    throw new Error(
      "Cannot convert value ".concat(t, " into a BigNumber: no class 'BigNumber' provided"),
    );
  }
  function un(t) {
    throw new Error(
      "Cannot convert value ".concat(t, " into a Complex number: no class 'Complex' provided"),
    );
  }
  function an(t) {
    throw new Error(
      "Cannot convert value ".concat(t, " into a Fraction, no class 'Fraction' provided."),
    );
  }
  /*!
   *  decimal.js v10.6.0
   *  An arbitrary-precision Decimal type for JavaScript.
   *  https://github.com/MikeMcl/decimal.js
   *  Copyright (c) 2025 Michael Mclaughlin <M8ch88l@gmail.com>
   *  MIT Licence
   */ var ln,
    cn,
    pn = 9e15,
    hn = 1e9,
    fn = "0123456789abcdef",
    mn =
      "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058",
    dn =
      "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789",
    gn = {
      precision: 20,
      rounding: 4,
      modulo: 1,
      toExpNeg: -7,
      toExpPos: 21,
      minE: -pn,
      maxE: pn,
      crypto: !1,
    },
    Dn = !0,
    yn = "[DecimalError] ",
    vn = yn + "Invalid argument: ",
    bn = yn + "Precision limit exceeded",
    wn = yn + "crypto unavailable",
    En = "[object Decimal]",
    xn = Math.floor,
    An = Math.pow,
    Fn = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i,
    Cn = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i,
    _n = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i,
    Nn = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
    Sn = 1e7,
    Bn = mn.length - 1,
    Mn = dn.length - 1,
    Tn = { toStringTag: En };
  function Ln(t) {
    var e,
      n,
      r,
      i = t.length - 1,
      s = "",
      o = t[0];
    if (i > 0) {
      for (s += o, e = 1; e < i; e++) ((n = 7 - (r = t[e] + "").length) && (s += qn(n)), (s += r));
      (n = 7 - (r = (o = t[e]) + "").length) && (s += qn(n));
    } else if (0 === o) return "0";
    for (; o % 10 == 0;) o /= 10;
    return s + o;
  }
  function kn(t, e, n) {
    if (t !== ~~t || t < e || t > n) throw Error(vn + t);
  }
  function In(t, e, n, r) {
    var i, s, o, u;
    for (s = t[0]; s >= 10; s /= 10) --e;
    return (
      --e < 0 ? ((e += 7), (i = 0)) : ((i = Math.ceil((e + 1) / 7)), (e %= 7)),
      (s = An(10, 7 - e)),
      (u = (t[i] % s) | 0),
      null == r
        ? e < 3
          ? (0 == e ? (u = (u / 100) | 0) : 1 == e && (u = (u / 10) | 0),
            (o = (n < 4 && 99999 == u) || (n > 3 && 49999 == u) || 5e4 == u || 0 == u))
          : (o =
              (((n < 4 && u + 1 == s) || (n > 3 && u + 1 == s / 2)) &&
                ((t[i + 1] / s / 100) | 0) == An(10, e - 2) - 1) ||
              ((u == s / 2 || 0 == u) && !((t[i + 1] / s / 100) | 0)))
        : e < 4
          ? (0 == e
              ? (u = (u / 1e3) | 0)
              : 1 == e
                ? (u = (u / 100) | 0)
                : 2 == e && (u = (u / 10) | 0),
            (o = ((r || n < 4) && 9999 == u) || (!r && n > 3 && 4999 == u)))
          : (o =
              (((r || n < 4) && u + 1 == s) || (!r && n > 3 && u + 1 == s / 2)) &&
              ((t[i + 1] / s / 1e3) | 0) == An(10, e - 3) - 1),
      o
    );
  }
  function On(t, e, n) {
    for (var r, i, s = [0], o = 0, u = t.length; o < u;) {
      for (i = s.length; i--;) s[i] *= e;
      for (s[0] += fn.indexOf(t.charAt(o++)), r = 0; r < s.length; r++)
        s[r] > n - 1 &&
          (void 0 === s[r + 1] && (s[r + 1] = 0), (s[r + 1] += (s[r] / n) | 0), (s[r] %= n));
    }
    return s.reverse();
  }
  ((Tn.absoluteValue = Tn.abs =
    function () {
      var t = new this.constructor(this);
      return (t.s < 0 && (t.s = 1), Pn(t));
    }),
    (Tn.ceil = function () {
      return Pn(new this.constructor(this), this.e + 1, 2);
    }),
    (Tn.clampedTo = Tn.clamp =
      function (t, e) {
        var n = this,
          r = n.constructor;
        if (((t = new r(t)), (e = new r(e)), !t.s || !e.s)) return new r(NaN);
        if (t.gt(e)) throw Error(vn + e);
        return n.cmp(t) < 0 ? t : n.cmp(e) > 0 ? e : new r(n);
      }),
    (Tn.comparedTo = Tn.cmp =
      function (t) {
        var e,
          n,
          r,
          i,
          s = this,
          o = s.d,
          u = (t = new s.constructor(t)).d,
          a = s.s,
          l = t.s;
        if (!o || !u) return a && l ? (a !== l ? a : o === u ? 0 : !o ^ (a < 0) ? 1 : -1) : NaN;
        if (!o[0] || !u[0]) return o[0] ? a : u[0] ? -l : 0;
        if (a !== l) return a;
        if (s.e !== t.e) return (s.e > t.e) ^ (a < 0) ? 1 : -1;
        for (e = 0, n = (r = o.length) < (i = u.length) ? r : i; e < n; ++e)
          if (o[e] !== u[e]) return (o[e] > u[e]) ^ (a < 0) ? 1 : -1;
        return r === i ? 0 : (r > i) ^ (a < 0) ? 1 : -1;
      }),
    (Tn.cosine = Tn.cos =
      function () {
        var t,
          e,
          n = this,
          r = n.constructor;
        return n.d
          ? n.d[0]
            ? ((t = r.precision),
              (e = r.rounding),
              (r.precision = t + Math.max(n.e, n.sd()) + 7),
              (r.rounding = 1),
              (n = (function (t, e) {
                var n, r, i;
                if (e.isZero()) return e;
                ((r = e.d.length) < 32
                  ? (i = (1 / tr(4, (n = Math.ceil(r / 3)))).toString())
                  : ((n = 16), (i = "2.3283064365386962890625e-10")),
                  (t.precision += n),
                  (e = Kn(t, 1, e.times(i), new t(1))));
                for (var s = n; s--;) {
                  var o = e.times(e);
                  e = o.times(o).minus(o).times(8).plus(1);
                }
                return ((t.precision -= n), e);
              })(r, er(r, n))),
              (r.precision = t),
              (r.rounding = e),
              Pn(2 == cn || 3 == cn ? n.neg() : n, t, e, !0))
            : new r(1)
          : new r(NaN);
      }),
    (Tn.cubeRoot = Tn.cbrt =
      function () {
        var t,
          e,
          n,
          r,
          i,
          s,
          o,
          u,
          a,
          l,
          c = this,
          p = c.constructor;
        if (!c.isFinite() || c.isZero()) return new p(c);
        for (
          Dn = !1,
            (s = c.s * An(c.s * c, 1 / 3)) && Math.abs(s) != 1 / 0
              ? (r = new p(s.toString()))
              : ((n = Ln(c.d)),
                (s = ((t = c.e) - n.length + 1) % 3) && (n += 1 == s || -2 == s ? "0" : "00"),
                (s = An(n, 1 / 3)),
                (t = xn((t + 1) / 3) - (t % 3 == (t < 0 ? -1 : 2))),
                ((r = new p(
                  (n =
                    s == 1 / 0
                      ? "5e" + t
                      : (n = s.toExponential()).slice(0, n.indexOf("e") + 1) + t),
                )).s = c.s)),
            o = (t = p.precision) + 3;
          ;
        )
          if (
            ((l = (a = (u = r).times(u).times(u)).plus(c)),
            (r = Rn(l.plus(c).times(u), l.plus(a), o + 2, 1)),
            Ln(u.d).slice(0, o) === (n = Ln(r.d)).slice(0, o))
          ) {
            if ("9999" != (n = n.slice(o - 3, o + 1)) && (i || "4999" != n)) {
              (+n && (+n.slice(1) || "5" != n.charAt(0))) ||
                (Pn(r, t + 1, 1), (e = !r.times(r).times(r).eq(c)));
              break;
            }
            if (!i && (Pn(u, t + 1, 0), u.times(u).times(u).eq(c))) {
              r = u;
              break;
            }
            ((o += 4), (i = 1));
          }
        return ((Dn = !0), Pn(r, t, p.rounding, e));
      }),
    (Tn.decimalPlaces = Tn.dp =
      function () {
        var t,
          e = this.d,
          n = NaN;
        if (e) {
          if (((n = 7 * ((t = e.length - 1) - xn(this.e / 7))), (t = e[t])))
            for (; t % 10 == 0; t /= 10) n--;
          n < 0 && (n = 0);
        }
        return n;
      }),
    (Tn.dividedBy = Tn.div =
      function (t) {
        return Rn(this, new this.constructor(t));
      }),
    (Tn.dividedToIntegerBy = Tn.divToInt =
      function (t) {
        var e = this.constructor;
        return Pn(Rn(this, new e(t), 0, 1, 1), e.precision, e.rounding);
      }),
    (Tn.equals = Tn.eq =
      function (t) {
        return 0 === this.cmp(t);
      }),
    (Tn.floor = function () {
      return Pn(new this.constructor(this), this.e + 1, 3);
    }),
    (Tn.greaterThan = Tn.gt =
      function (t) {
        return this.cmp(t) > 0;
      }),
    (Tn.greaterThanOrEqualTo = Tn.gte =
      function (t) {
        var e = this.cmp(t);
        return 1 == e || 0 === e;
      }),
    (Tn.hyperbolicCosine = Tn.cosh =
      function () {
        var t,
          e,
          n,
          r,
          i,
          s = this,
          o = s.constructor,
          u = new o(1);
        if (!s.isFinite()) return new o(s.s ? 1 / 0 : NaN);
        if (s.isZero()) return u;
        ((n = o.precision),
          (r = o.rounding),
          (o.precision = n + Math.max(s.e, s.sd()) + 4),
          (o.rounding = 1),
          (i = s.d.length) < 32
            ? (e = (1 / tr(4, (t = Math.ceil(i / 3)))).toString())
            : ((t = 16), (e = "2.3283064365386962890625e-10")),
          (s = Kn(o, 1, s.times(e), new o(1), !0)));
        for (var a, l = t, c = new o(8); l--;)
          ((a = s.times(s)), (s = u.minus(a.times(c.minus(a.times(c))))));
        return Pn(s, (o.precision = n), (o.rounding = r), !0);
      }),
    (Tn.hyperbolicSine = Tn.sinh =
      function () {
        var t,
          e,
          n,
          r,
          i = this,
          s = i.constructor;
        if (!i.isFinite() || i.isZero()) return new s(i);
        if (
          ((e = s.precision),
          (n = s.rounding),
          (s.precision = e + Math.max(i.e, i.sd()) + 4),
          (s.rounding = 1),
          (r = i.d.length) < 3)
        )
          i = Kn(s, 2, i, i, !0);
        else {
          ((t = (t = 1.4 * Math.sqrt(r)) > 16 ? 16 : 0 | t),
            (i = Kn(s, 2, (i = i.times(1 / tr(5, t))), i, !0)));
          for (var o, u = new s(5), a = new s(16), l = new s(20); t--;)
            ((o = i.times(i)), (i = i.times(u.plus(o.times(a.times(o).plus(l))))));
        }
        return ((s.precision = e), (s.rounding = n), Pn(i, e, n, !0));
      }),
    (Tn.hyperbolicTangent = Tn.tanh =
      function () {
        var t,
          e,
          n = this,
          r = n.constructor;
        return n.isFinite()
          ? n.isZero()
            ? new r(n)
            : ((t = r.precision),
              (e = r.rounding),
              (r.precision = t + 7),
              (r.rounding = 1),
              Rn(n.sinh(), n.cosh(), (r.precision = t), (r.rounding = e)))
          : new r(n.s);
      }),
    (Tn.inverseCosine = Tn.acos =
      function () {
        var t = this,
          e = t.constructor,
          n = t.abs().cmp(1),
          r = e.precision,
          i = e.rounding;
        return -1 !== n
          ? 0 === n
            ? t.isNeg()
              ? Gn(e, r, i)
              : new e(0)
            : new e(NaN)
          : t.isZero()
            ? Gn(e, r + 4, i).times(0.5)
            : ((e.precision = r + 6),
              (e.rounding = 1),
              (t = new e(1).minus(t).div(t.plus(1)).sqrt().atan()),
              (e.precision = r),
              (e.rounding = i),
              t.times(2));
      }),
    (Tn.inverseHyperbolicCosine = Tn.acosh =
      function () {
        var t,
          e,
          n = this,
          r = n.constructor;
        return n.lte(1)
          ? new r(n.eq(1) ? 0 : NaN)
          : n.isFinite()
            ? ((t = r.precision),
              (e = r.rounding),
              (r.precision = t + Math.max(Math.abs(n.e), n.sd()) + 4),
              (r.rounding = 1),
              (Dn = !1),
              (n = n.times(n).minus(1).sqrt().plus(n)),
              (Dn = !0),
              (r.precision = t),
              (r.rounding = e),
              n.ln())
            : new r(n);
      }),
    (Tn.inverseHyperbolicSine = Tn.asinh =
      function () {
        var t,
          e,
          n = this,
          r = n.constructor;
        return !n.isFinite() || n.isZero()
          ? new r(n)
          : ((t = r.precision),
            (e = r.rounding),
            (r.precision = t + 2 * Math.max(Math.abs(n.e), n.sd()) + 6),
            (r.rounding = 1),
            (Dn = !1),
            (n = n.times(n).plus(1).sqrt().plus(n)),
            (Dn = !0),
            (r.precision = t),
            (r.rounding = e),
            n.ln());
      }),
    (Tn.inverseHyperbolicTangent = Tn.atanh =
      function () {
        var t,
          e,
          n,
          r,
          i = this,
          s = i.constructor;
        return i.isFinite()
          ? i.e >= 0
            ? new s(i.abs().eq(1) ? i.s / 0 : i.isZero() ? i : NaN)
            : ((t = s.precision),
              (e = s.rounding),
              (r = i.sd()),
              Math.max(r, t) < 2 * -i.e - 1
                ? Pn(new s(i), t, e, !0)
                : ((s.precision = n = r - i.e),
                  (i = Rn(i.plus(1), new s(1).minus(i), n + t, 1)),
                  (s.precision = t + 4),
                  (s.rounding = 1),
                  (i = i.ln()),
                  (s.precision = t),
                  (s.rounding = e),
                  i.times(0.5)))
          : new s(NaN);
      }),
    (Tn.inverseSine = Tn.asin =
      function () {
        var t,
          e,
          n,
          r,
          i = this,
          s = i.constructor;
        return i.isZero()
          ? new s(i)
          : ((e = i.abs().cmp(1)),
            (n = s.precision),
            (r = s.rounding),
            -1 !== e
              ? 0 === e
                ? (((t = Gn(s, n + 4, r).times(0.5)).s = i.s), t)
                : new s(NaN)
              : ((s.precision = n + 6),
                (s.rounding = 1),
                (i = i.div(new s(1).minus(i.times(i)).sqrt().plus(1)).atan()),
                (s.precision = n),
                (s.rounding = r),
                i.times(2)));
      }),
    (Tn.inverseTangent = Tn.atan =
      function () {
        var t,
          e,
          n,
          r,
          i,
          s,
          o,
          u,
          a,
          l = this,
          c = l.constructor,
          p = c.precision,
          h = c.rounding;
        if (l.isFinite()) {
          if (l.isZero()) return new c(l);
          if (l.abs().eq(1) && p + 4 <= Mn) return (((o = Gn(c, p + 4, h).times(0.25)).s = l.s), o);
        } else {
          if (!l.s) return new c(NaN);
          if (p + 4 <= Mn) return (((o = Gn(c, p + 4, h).times(0.5)).s = l.s), o);
        }
        for (
          c.precision = u = p + 10, c.rounding = 1, t = n = Math.min(28, (u / 7 + 2) | 0);
          t;
          --t
        )
          l = l.div(l.times(l).plus(1).sqrt().plus(1));
        for (Dn = !1, e = Math.ceil(u / 7), r = 1, a = l.times(l), o = new c(l), i = l; -1 !== t;)
          if (
            ((i = i.times(a)),
            (s = o.minus(i.div((r += 2)))),
            (i = i.times(a)),
            void 0 !== (o = s.plus(i.div((r += 2)))).d[e])
          )
            for (t = e; o.d[t] === s.d[t] && t--;);
        return (
          n && (o = o.times(2 << (n - 1))),
          (Dn = !0),
          Pn(o, (c.precision = p), (c.rounding = h), !0)
        );
      }),
    (Tn.isFinite = function () {
      return !!this.d;
    }),
    (Tn.isInteger = Tn.isInt =
      function () {
        return !!this.d && xn(this.e / 7) > this.d.length - 2;
      }),
    (Tn.isNaN = function () {
      return !this.s;
    }),
    (Tn.isNegative = Tn.isNeg =
      function () {
        return this.s < 0;
      }),
    (Tn.isPositive = Tn.isPos =
      function () {
        return this.s > 0;
      }),
    (Tn.isZero = function () {
      return !!this.d && 0 === this.d[0];
    }),
    (Tn.lessThan = Tn.lt =
      function (t) {
        return this.cmp(t) < 0;
      }),
    (Tn.lessThanOrEqualTo = Tn.lte =
      function (t) {
        return this.cmp(t) < 1;
      }),
    (Tn.logarithm = Tn.log =
      function (t) {
        var e,
          n,
          r,
          i,
          s,
          o,
          u,
          a,
          l = this,
          c = l.constructor,
          p = c.precision,
          h = c.rounding;
        if (null == t) ((t = new c(10)), (e = !0));
        else {
          if (((n = (t = new c(t)).d), t.s < 0 || !n || !n[0] || t.eq(1))) return new c(NaN);
          e = t.eq(10);
        }
        if (((n = l.d), l.s < 0 || !n || !n[0] || l.eq(1)))
          return new c(n && !n[0] ? -1 / 0 : 1 != l.s ? NaN : n ? 0 : 1 / 0);
        if (e)
          if (n.length > 1) s = !0;
          else {
            for (i = n[0]; i % 10 == 0;) i /= 10;
            s = 1 !== i;
          }
        if (
          ((Dn = !1),
          (o = Zn(l, (u = p + 5))),
          (r = e ? zn(c, u + 10) : Zn(t, u)),
          In((a = Rn(o, r, u, 1)).d, (i = p), h))
        )
          do {
            if (
              ((o = Zn(l, (u += 10))), (r = e ? zn(c, u + 10) : Zn(t, u)), (a = Rn(o, r, u, 1)), !s)
            ) {
              +Ln(a.d).slice(i + 1, i + 15) + 1 == 1e14 && (a = Pn(a, p + 1, 0));
              break;
            }
          } while (In(a.d, (i += 10), h));
        return ((Dn = !0), Pn(a, p, h));
      }),
    (Tn.minus = Tn.sub =
      function (t) {
        var e,
          n,
          r,
          i,
          s,
          o,
          u,
          a,
          l,
          c,
          p,
          h,
          f = this,
          m = f.constructor;
        if (((t = new m(t)), !f.d || !t.d))
          return (
            f.s && t.s
              ? f.d
                ? (t.s = -t.s)
                : (t = new m(t.d || f.s !== t.s ? f : NaN))
              : (t = new m(NaN)),
            t
          );
        if (f.s != t.s) return ((t.s = -t.s), f.plus(t));
        if (((l = f.d), (h = t.d), (u = m.precision), (a = m.rounding), !l[0] || !h[0])) {
          if (h[0]) t.s = -t.s;
          else {
            if (!l[0]) return new m(3 === a ? -0 : 0);
            t = new m(f);
          }
          return Dn ? Pn(t, u, a) : t;
        }
        if (((n = xn(t.e / 7)), (c = xn(f.e / 7)), (l = l.slice()), (s = c - n))) {
          for (
            (p = s < 0) ? ((e = l), (s = -s), (o = h.length)) : ((e = h), (n = c), (o = l.length)),
              s > (r = Math.max(Math.ceil(u / 7), o) + 2) && ((s = r), (e.length = 1)),
              e.reverse(),
              r = s;
            r--;
          )
            e.push(0);
          e.reverse();
        } else {
          for ((p = (r = l.length) < (o = h.length)) && (o = r), r = 0; r < o; r++)
            if (l[r] != h[r]) {
              p = l[r] < h[r];
              break;
            }
          s = 0;
        }
        for (
          p && ((e = l), (l = h), (h = e), (t.s = -t.s)), o = l.length, r = h.length - o;
          r > 0;
          --r
        )
          l[o++] = 0;
        for (r = h.length; r > s;) {
          if (l[--r] < h[r]) {
            for (i = r; i && 0 === l[--i];) l[i] = Sn - 1;
            (--l[i], (l[r] += Sn));
          }
          l[r] -= h[r];
        }
        for (; 0 === l[--o];) l.pop();
        for (; 0 === l[0]; l.shift()) --n;
        return l[0] ? ((t.d = l), (t.e = Un(l, n)), Dn ? Pn(t, u, a) : t) : new m(3 === a ? -0 : 0);
      }),
    (Tn.modulo = Tn.mod =
      function (t) {
        var e,
          n = this,
          r = n.constructor;
        return (
          (t = new r(t)),
          !n.d || !t.s || (t.d && !t.d[0])
            ? new r(NaN)
            : !t.d || (n.d && !n.d[0])
              ? Pn(new r(n), r.precision, r.rounding)
              : ((Dn = !1),
                9 == r.modulo
                  ? ((e = Rn(n, t.abs(), 0, 3, 1)).s *= t.s)
                  : (e = Rn(n, t, 0, r.modulo, 1)),
                (e = e.times(t)),
                (Dn = !0),
                n.minus(e))
        );
      }),
    (Tn.naturalExponential = Tn.exp =
      function () {
        return Hn(this);
      }),
    (Tn.naturalLogarithm = Tn.ln =
      function () {
        return Zn(this);
      }),
    (Tn.negated = Tn.neg =
      function () {
        var t = new this.constructor(this);
        return ((t.s = -t.s), Pn(t));
      }),
    (Tn.plus = Tn.add =
      function (t) {
        var e,
          n,
          r,
          i,
          s,
          o,
          u,
          a,
          l,
          c,
          p = this,
          h = p.constructor;
        if (((t = new h(t)), !p.d || !t.d))
          return (
            p.s && t.s ? p.d || (t = new h(t.d || p.s === t.s ? p : NaN)) : (t = new h(NaN)),
            t
          );
        if (p.s != t.s) return ((t.s = -t.s), p.minus(t));
        if (((l = p.d), (c = t.d), (u = h.precision), (a = h.rounding), !l[0] || !c[0]))
          return (c[0] || (t = new h(p)), Dn ? Pn(t, u, a) : t);
        if (((s = xn(p.e / 7)), (r = xn(t.e / 7)), (l = l.slice()), (i = s - r))) {
          for (
            i < 0 ? ((n = l), (i = -i), (o = c.length)) : ((n = c), (r = s), (o = l.length)),
              i > (o = (s = Math.ceil(u / 7)) > o ? s + 1 : o + 1) && ((i = o), (n.length = 1)),
              n.reverse();
            i--;
          )
            n.push(0);
          n.reverse();
        }
        for ((o = l.length) - (i = c.length) < 0 && ((i = o), (n = c), (c = l), (l = n)), e = 0; i;)
          ((e = ((l[--i] = l[i] + c[i] + e) / Sn) | 0), (l[i] %= Sn));
        for (e && (l.unshift(e), ++r), o = l.length; 0 == l[--o];) l.pop();
        return ((t.d = l), (t.e = Un(l, r)), Dn ? Pn(t, u, a) : t);
      }),
    (Tn.precision = Tn.sd =
      function (t) {
        var e,
          n = this;
        if (void 0 !== t && t !== !!t && 1 !== t && 0 !== t) throw Error(vn + t);
        return (n.d ? ((e = jn(n.d)), t && n.e + 1 > e && (e = n.e + 1)) : (e = NaN), e);
      }),
    (Tn.round = function () {
      var t = this,
        e = t.constructor;
      return Pn(new e(t), t.e + 1, e.rounding);
    }),
    (Tn.sine = Tn.sin =
      function () {
        var t,
          e,
          n = this,
          r = n.constructor;
        return n.isFinite()
          ? n.isZero()
            ? new r(n)
            : ((t = r.precision),
              (e = r.rounding),
              (r.precision = t + Math.max(n.e, n.sd()) + 7),
              (r.rounding = 1),
              (n = (function (t, e) {
                var n,
                  r = e.d.length;
                if (r < 3) return e.isZero() ? e : Kn(t, 2, e, e);
                ((n = (n = 1.4 * Math.sqrt(r)) > 16 ? 16 : 0 | n),
                  (e = Kn(t, 2, (e = e.times(1 / tr(5, n))), e)));
                for (var i, s = new t(5), o = new t(16), u = new t(20); n--;)
                  ((i = e.times(e)), (e = e.times(s.plus(i.times(o.times(i).minus(u))))));
                return e;
              })(r, er(r, n))),
              (r.precision = t),
              (r.rounding = e),
              Pn(cn > 2 ? n.neg() : n, t, e, !0))
          : new r(NaN);
      }),
    (Tn.squareRoot = Tn.sqrt =
      function () {
        var t,
          e,
          n,
          r,
          i,
          s,
          o = this,
          u = o.d,
          a = o.e,
          l = o.s,
          c = o.constructor;
        if (1 !== l || !u || !u[0])
          return new c(!l || (l < 0 && (!u || u[0])) ? NaN : u ? o : 1 / 0);
        for (
          Dn = !1,
            0 == (l = Math.sqrt(+o)) || l == 1 / 0
              ? (((e = Ln(u)).length + a) % 2 == 0 && (e += "0"),
                (l = Math.sqrt(e)),
                (a = xn((a + 1) / 2) - (a < 0 || a % 2)),
                (r = new c(
                  (e =
                    l == 1 / 0
                      ? "5e" + a
                      : (e = l.toExponential()).slice(0, e.indexOf("e") + 1) + a),
                )))
              : (r = new c(l.toString())),
            n = (a = c.precision) + 3;
          ;
        )
          if (
            ((r = (s = r).plus(Rn(o, s, n + 2, 1)).times(0.5)),
            Ln(s.d).slice(0, n) === (e = Ln(r.d)).slice(0, n))
          ) {
            if ("9999" != (e = e.slice(n - 3, n + 1)) && (i || "4999" != e)) {
              (+e && (+e.slice(1) || "5" != e.charAt(0))) ||
                (Pn(r, a + 1, 1), (t = !r.times(r).eq(o)));
              break;
            }
            if (!i && (Pn(s, a + 1, 0), s.times(s).eq(o))) {
              r = s;
              break;
            }
            ((n += 4), (i = 1));
          }
        return ((Dn = !0), Pn(r, a, c.rounding, t));
      }),
    (Tn.tangent = Tn.tan =
      function () {
        var t,
          e,
          n = this,
          r = n.constructor;
        return n.isFinite()
          ? n.isZero()
            ? new r(n)
            : ((t = r.precision),
              (e = r.rounding),
              (r.precision = t + 10),
              (r.rounding = 1),
              ((n = n.sin()).s = 1),
              (n = Rn(n, new r(1).minus(n.times(n)).sqrt(), t + 10, 0)),
              (r.precision = t),
              (r.rounding = e),
              Pn(2 == cn || 4 == cn ? n.neg() : n, t, e, !0))
          : new r(NaN);
      }),
    (Tn.times = Tn.mul =
      function (t) {
        var e,
          n,
          r,
          i,
          s,
          o,
          u,
          a,
          l,
          c = this,
          p = c.constructor,
          h = c.d,
          f = (t = new p(t)).d;
        if (((t.s *= c.s), !(h && h[0] && f && f[0])))
          return new p(
            !t.s || (h && !h[0] && !f) || (f && !f[0] && !h) ? NaN : h && f ? 0 * t.s : t.s / 0,
          );
        for (
          n = xn(c.e / 7) + xn(t.e / 7),
            (a = h.length) < (l = f.length) &&
              ((s = h), (h = f), (f = s), (o = a), (a = l), (l = o)),
            s = [],
            r = o = a + l;
          r--;
        )
          s.push(0);
        for (r = l; --r >= 0;) {
          for (e = 0, i = a + r; i > r;)
            ((u = s[i] + f[r] * h[i - r - 1] + e), (s[i--] = (u % Sn) | 0), (e = (u / Sn) | 0));
          s[i] = ((s[i] + e) % Sn) | 0;
        }
        for (; !s[--o];) s.pop();
        return (
          e ? ++n : s.shift(),
          (t.d = s),
          (t.e = Un(s, n)),
          Dn ? Pn(t, p.precision, p.rounding) : t
        );
      }),
    (Tn.toBinary = function (t, e) {
      return nr(this, 2, t, e);
    }),
    (Tn.toDecimalPlaces = Tn.toDP =
      function (t, e) {
        var n = this,
          r = n.constructor;
        return (
          (n = new r(n)),
          void 0 === t
            ? n
            : (kn(t, 0, hn), void 0 === e ? (e = r.rounding) : kn(e, 0, 8), Pn(n, t + n.e + 1, e))
        );
      }),
    (Tn.toExponential = function (t, e) {
      var n,
        r = this,
        i = r.constructor;
      return (
        void 0 === t
          ? (n = $n(r, !0))
          : (kn(t, 0, hn),
            void 0 === e ? (e = i.rounding) : kn(e, 0, 8),
            (n = $n((r = Pn(new i(r), t + 1, e)), !0, t + 1))),
        r.isNeg() && !r.isZero() ? "-" + n : n
      );
    }),
    (Tn.toFixed = function (t, e) {
      var n,
        r,
        i = this,
        s = i.constructor;
      return (
        void 0 === t
          ? (n = $n(i))
          : (kn(t, 0, hn),
            void 0 === e ? (e = s.rounding) : kn(e, 0, 8),
            (n = $n((r = Pn(new s(i), t + i.e + 1, e)), !1, t + r.e + 1))),
        i.isNeg() && !i.isZero() ? "-" + n : n
      );
    }),
    (Tn.toFraction = function (t) {
      var e,
        n,
        r,
        i,
        s,
        o,
        u,
        a,
        l,
        c,
        p,
        h,
        f = this,
        m = f.d,
        d = f.constructor;
      if (!m) return new d(f);
      if (
        ((l = n = new d(1)),
        (r = a = new d(0)),
        (o = (s = (e = new d(r)).e = jn(m) - f.e - 1) % 7),
        (e.d[0] = An(10, o < 0 ? 7 + o : o)),
        null == t)
      )
        t = s > 0 ? e : l;
      else {
        if (!(u = new d(t)).isInt() || u.lt(l)) throw Error(vn + u);
        t = u.gt(e) ? (s > 0 ? e : l) : u;
      }
      for (
        Dn = !1, u = new d(Ln(m)), c = d.precision, d.precision = s = 7 * m.length * 2;
        (p = Rn(u, e, 0, 1, 1)), 1 != (i = n.plus(p.times(r))).cmp(t);
      )
        ((n = r),
          (r = i),
          (i = l),
          (l = a.plus(p.times(i))),
          (a = i),
          (i = e),
          (e = u.minus(p.times(i))),
          (u = i));
      return (
        (i = Rn(t.minus(n), r, 0, 1, 1)),
        (a = a.plus(i.times(l))),
        (n = n.plus(i.times(r))),
        (a.s = l.s = f.s),
        (h =
          Rn(l, r, s, 1)
            .minus(f)
            .abs()
            .cmp(Rn(a, n, s, 1).minus(f).abs()) < 1
            ? [l, r]
            : [a, n]),
        (d.precision = c),
        (Dn = !0),
        h
      );
    }),
    (Tn.toHexadecimal = Tn.toHex =
      function (t, e) {
        return nr(this, 16, t, e);
      }),
    (Tn.toNearest = function (t, e) {
      var n = this,
        r = n.constructor;
      if (((n = new r(n)), null == t)) {
        if (!n.d) return n;
        ((t = new r(1)), (e = r.rounding));
      } else {
        if (((t = new r(t)), void 0 === e ? (e = r.rounding) : kn(e, 0, 8), !n.d))
          return t.s ? n : t;
        if (!t.d) return (t.s && (t.s = n.s), t);
      }
      return (
        t.d[0]
          ? ((Dn = !1), (n = Rn(n, t, 0, e, 1).times(t)), (Dn = !0), Pn(n))
          : ((t.s = n.s), (n = t)),
        n
      );
    }),
    (Tn.toNumber = function () {
      return +this;
    }),
    (Tn.toOctal = function (t, e) {
      return nr(this, 8, t, e);
    }),
    (Tn.toPower = Tn.pow =
      function (t) {
        var e,
          n,
          r,
          i,
          s,
          o,
          u = this,
          a = u.constructor,
          l = +(t = new a(t));
        if (!(u.d && t.d && u.d[0] && t.d[0])) return new a(An(+u, l));
        if ((u = new a(u)).eq(1)) return u;
        if (((r = a.precision), (s = a.rounding), t.eq(1))) return Pn(u, r, s);
        if ((e = xn(t.e / 7)) >= t.d.length - 1 && (n = l < 0 ? -l : l) <= 9007199254740991)
          return ((i = Vn(a, u, n, r)), t.s < 0 ? new a(1).div(i) : Pn(i, r, s));
        if ((o = u.s) < 0) {
          if (e < t.d.length - 1) return new a(NaN);
          if ((1 & t.d[e] || (o = 1), 0 == u.e && 1 == u.d[0] && 1 == u.d.length))
            return ((u.s = o), u);
        }
        return (e =
          0 != (n = An(+u, l)) && isFinite(n)
            ? new a(n + "").e
            : xn(l * (Math.log("0." + Ln(u.d)) / Math.LN10 + u.e + 1))) >
          a.maxE + 1 || e < a.minE - 1
          ? new a(e > 0 ? o / 0 : 0)
          : ((Dn = !1),
            (a.rounding = u.s = 1),
            (n = Math.min(12, (e + "").length)),
            (i = Hn(t.times(Zn(u, r + n)), r)).d &&
              In((i = Pn(i, r + 5, 1)).d, r, s) &&
              ((e = r + 10),
              +Ln((i = Pn(Hn(t.times(Zn(u, e + n)), e), e + 5, 1)).d).slice(r + 1, r + 15) + 1 ==
                1e14 && (i = Pn(i, r + 1, 0))),
            (i.s = o),
            (Dn = !0),
            (a.rounding = s),
            Pn(i, r, s));
      }),
    (Tn.toPrecision = function (t, e) {
      var n,
        r = this,
        i = r.constructor;
      return (
        void 0 === t
          ? (n = $n(r, r.e <= i.toExpNeg || r.e >= i.toExpPos))
          : (kn(t, 1, hn),
            void 0 === e ? (e = i.rounding) : kn(e, 0, 8),
            (n = $n((r = Pn(new i(r), t, e)), t <= r.e || r.e <= i.toExpNeg, t))),
        r.isNeg() && !r.isZero() ? "-" + n : n
      );
    }),
    (Tn.toSignificantDigits = Tn.toSD =
      function (t, e) {
        var n = this.constructor;
        return (
          void 0 === t
            ? ((t = n.precision), (e = n.rounding))
            : (kn(t, 1, hn), void 0 === e ? (e = n.rounding) : kn(e, 0, 8)),
          Pn(new n(this), t, e)
        );
      }),
    (Tn.toString = function () {
      var t = this,
        e = t.constructor,
        n = $n(t, t.e <= e.toExpNeg || t.e >= e.toExpPos);
      return t.isNeg() && !t.isZero() ? "-" + n : n;
    }),
    (Tn.truncated = Tn.trunc =
      function () {
        return Pn(new this.constructor(this), this.e + 1, 1);
      }),
    (Tn.valueOf = Tn.toJSON =
      function () {
        var t = this,
          e = t.constructor,
          n = $n(t, t.e <= e.toExpNeg || t.e >= e.toExpPos);
        return t.isNeg() ? "-" + n : n;
      }));
  var Rn = (function () {
    function t(t, e, n) {
      var r,
        i = 0,
        s = t.length;
      for (t = t.slice(); s--;) ((r = t[s] * e + i), (t[s] = (r % n) | 0), (i = (r / n) | 0));
      return (i && t.unshift(i), t);
    }
    function e(t, e, n, r) {
      var i, s;
      if (n != r) s = n > r ? 1 : -1;
      else
        for (i = s = 0; i < n; i++)
          if (t[i] != e[i]) {
            s = t[i] > e[i] ? 1 : -1;
            break;
          }
      return s;
    }
    function n(t, e, n, r) {
      for (var i = 0; n--;) ((t[n] -= i), (i = t[n] < e[n] ? 1 : 0), (t[n] = i * r + t[n] - e[n]));
      for (; !t[0] && t.length > 1;) t.shift();
    }
    return function (r, i, s, o, u, a) {
      var l,
        c,
        p,
        h,
        f,
        m,
        d,
        g,
        D,
        y,
        v,
        b,
        w,
        E,
        x,
        A,
        F,
        C,
        _,
        N,
        S = r.constructor,
        B = r.s == i.s ? 1 : -1,
        M = r.d,
        T = i.d;
      if (!(M && M[0] && T && T[0]))
        return new S(
          r.s && i.s && (M ? !T || M[0] != T[0] : T)
            ? (M && 0 == M[0]) || !T
              ? 0 * B
              : B / 0
            : NaN,
        );
      for (
        a ? ((f = 1), (c = r.e - i.e)) : ((a = Sn), (f = 7), (c = xn(r.e / f) - xn(i.e / f))),
          _ = T.length,
          F = M.length,
          y = (D = new S(B)).d = [],
          p = 0;
        T[p] == (M[p] || 0);
        p++
      );
      if (
        (T[p] > (M[p] || 0) && c--,
        null == s ? ((E = s = S.precision), (o = S.rounding)) : (E = u ? s + (r.e - i.e) + 1 : s),
        E < 0)
      )
        (y.push(1), (m = !0));
      else {
        if (((E = (E / f + 2) | 0), (p = 0), 1 == _)) {
          for (h = 0, T = T[0], E++; (p < F || h) && E--; p++)
            ((x = h * a + (M[p] || 0)), (y[p] = (x / T) | 0), (h = (x % T) | 0));
          m = h || p < F;
        } else {
          for (
            (h = (a / (T[0] + 1)) | 0) > 1 &&
              ((T = t(T, h, a)), (M = t(M, h, a)), (_ = T.length), (F = M.length)),
              A = _,
              b = (v = M.slice(0, _)).length;
            b < _;
          )
            v[b++] = 0;
          ((N = T.slice()).unshift(0), (C = T[0]), T[1] >= a / 2 && ++C);
          do {
            ((h = 0),
              (l = e(T, v, _, b)) < 0
                ? ((w = v[0]),
                  _ != b && (w = w * a + (v[1] || 0)),
                  (h = (w / C) | 0) > 1
                    ? (h >= a && (h = a - 1),
                      1 == (l = e((d = t(T, h, a)), v, (g = d.length), (b = v.length))) &&
                        (h--, n(d, _ < g ? N : T, g, a)))
                    : (0 == h && (l = h = 1), (d = T.slice())),
                  (g = d.length) < b && d.unshift(0),
                  n(v, d, b, a),
                  -1 == l &&
                    (l = e(T, v, _, (b = v.length))) < 1 &&
                    (h++, n(v, _ < b ? N : T, b, a)),
                  (b = v.length))
                : 0 === l && (h++, (v = [0])),
              (y[p++] = h),
              l && v[0] ? (v[b++] = M[A] || 0) : ((v = [M[A]]), (b = 1)));
          } while ((A++ < F || void 0 !== v[0]) && E--);
          m = void 0 !== v[0];
        }
        y[0] || y.shift();
      }
      if (1 == f) ((D.e = c), (ln = m));
      else {
        for (p = 1, h = y[0]; h >= 10; h /= 10) p++;
        ((D.e = p + c * f - 1), Pn(D, u ? s + D.e + 1 : s, o, m));
      }
      return D;
    };
  })();
  function Pn(t, e, n, r) {
    var i,
      s,
      o,
      u,
      a,
      l,
      c,
      p,
      h,
      f = t.constructor;
    t: if (null != e) {
      if (!(p = t.d)) return t;
      for (i = 1, u = p[0]; u >= 10; u /= 10) i++;
      if ((s = e - i) < 0)
        ((s += 7), (o = e), (a = (((c = p[(h = 0)]) / An(10, i - o - 1)) % 10) | 0));
      else if ((h = Math.ceil((s + 1) / 7)) >= (u = p.length)) {
        if (!r) break t;
        for (; u++ <= h;) p.push(0);
        ((c = a = 0), (i = 1), (o = (s %= 7) - 7 + 1));
      } else {
        for (c = u = p[h], i = 1; u >= 10; u /= 10) i++;
        a = (o = (s %= 7) - 7 + i) < 0 ? 0 : ((c / An(10, i - o - 1)) % 10) | 0;
      }
      if (
        ((r = r || e < 0 || void 0 !== p[h + 1] || (o < 0 ? c : c % An(10, i - o - 1))),
        (l =
          n < 4
            ? (a || r) && (0 == n || n == (t.s < 0 ? 3 : 2))
            : a > 5 ||
              (5 == a &&
                (4 == n ||
                  r ||
                  (6 == n && ((s > 0 ? (o > 0 ? c / An(10, i - o) : 0) : p[h - 1]) % 10) & 1) ||
                  n == (t.s < 0 ? 8 : 7)))),
        e < 1 || !p[0])
      )
        return (
          (p.length = 0),
          l
            ? ((e -= t.e + 1), (p[0] = An(10, (7 - (e % 7)) % 7)), (t.e = -e || 0))
            : (p[0] = t.e = 0),
          t
        );
      if (
        (0 == s
          ? ((p.length = h), (u = 1), h--)
          : ((p.length = h + 1),
            (u = An(10, 7 - s)),
            (p[h] = o > 0 ? (((c / An(10, i - o)) % An(10, o)) | 0) * u : 0)),
        l)
      )
        for (;;) {
          if (0 == h) {
            for (s = 1, o = p[0]; o >= 10; o /= 10) s++;
            for (o = p[0] += u, u = 1; o >= 10; o /= 10) u++;
            s != u && (t.e++, p[0] == Sn && (p[0] = 1));
            break;
          }
          if (((p[h] += u), p[h] != Sn)) break;
          ((p[h--] = 0), (u = 1));
        }
      for (s = p.length; 0 === p[--s];) p.pop();
    }
    return (
      Dn && (t.e > f.maxE ? ((t.d = null), (t.e = NaN)) : t.e < f.minE && ((t.e = 0), (t.d = [0]))),
      t
    );
  }
  function $n(t, e, n) {
    if (!t.isFinite()) return Jn(t);
    var r,
      i = t.e,
      s = Ln(t.d),
      o = s.length;
    return (
      e
        ? (n && (r = n - o) > 0
            ? (s = s.charAt(0) + "." + s.slice(1) + qn(r))
            : o > 1 && (s = s.charAt(0) + "." + s.slice(1)),
          (s = s + (t.e < 0 ? "e" : "e+") + t.e))
        : i < 0
          ? ((s = "0." + qn(-i - 1) + s), n && (r = n - o) > 0 && (s += qn(r)))
          : i >= o
            ? ((s += qn(i + 1 - o)), n && (r = n - i - 1) > 0 && (s = s + "." + qn(r)))
            : ((r = i + 1) < o && (s = s.slice(0, r) + "." + s.slice(r)),
              n && (r = n - o) > 0 && (i + 1 === o && (s += "."), (s += qn(r)))),
      s
    );
  }
  function Un(t, e) {
    var n = t[0];
    for (e *= 7; n >= 10; n /= 10) e++;
    return e;
  }
  function zn(t, e, n) {
    if (e > Bn) throw ((Dn = !0), n && (t.precision = n), Error(bn));
    return Pn(new t(mn), e, 1, !0);
  }
  function Gn(t, e, n) {
    if (e > Mn) throw Error(bn);
    return Pn(new t(dn), e, n, !0);
  }
  function jn(t) {
    var e = t.length - 1,
      n = 7 * e + 1;
    if ((e = t[e])) {
      for (; e % 10 == 0; e /= 10) n--;
      for (e = t[0]; e >= 10; e /= 10) n++;
    }
    return n;
  }
  function qn(t) {
    for (var e = ""; t--;) e += "0";
    return e;
  }
  function Vn(t, e, n, r) {
    var i,
      s = new t(1),
      o = Math.ceil(r / 7 + 4);
    for (Dn = !1; ;) {
      if ((n % 2 && rr((s = s.times(e)).d, o) && (i = !0), 0 === (n = xn(n / 2)))) {
        ((n = s.d.length - 1), i && 0 === s.d[n] && ++s.d[n]);
        break;
      }
      rr((e = e.times(e)).d, o);
    }
    return ((Dn = !0), s);
  }
  function Wn(t) {
    return 1 & t.d[t.d.length - 1];
  }
  function Qn(t, e, n) {
    for (var r, i, s = new t(e[0]), o = 0; ++o < e.length;) {
      if (!(i = new t(e[o])).s) {
        s = i;
        break;
      }
      ((r = s.cmp(i)) === n || (0 === r && s.s === n)) && (s = i);
    }
    return s;
  }
  function Hn(t, e) {
    var n,
      r,
      i,
      s,
      o,
      u,
      a,
      l = 0,
      c = 0,
      p = 0,
      h = t.constructor,
      f = h.rounding,
      m = h.precision;
    if (!t.d || !t.d[0] || t.e > 17)
      return new h(t.d ? (t.d[0] ? (t.s < 0 ? 0 : 1 / 0) : 1) : t.s ? (t.s < 0 ? 0 : t) : NaN);
    for (null == e ? ((Dn = !1), (a = m)) : (a = e), u = new h(0.03125); t.e > -2;)
      ((t = t.times(u)), (p += 5));
    for (
      a += r = ((Math.log(An(2, p)) / Math.LN10) * 2 + 5) | 0,
        n = s = o = new h(1),
        h.precision = a;
      ;
    ) {
      if (
        ((s = Pn(s.times(t), a, 1)),
        (n = n.times(++c)),
        Ln((u = o.plus(Rn(s, n, a, 1))).d).slice(0, a) === Ln(o.d).slice(0, a))
      ) {
        for (i = p; i--;) o = Pn(o.times(o), a, 1);
        if (null != e) return ((h.precision = m), o);
        if (!(l < 3 && In(o.d, a - r, f, l))) return Pn(o, (h.precision = m), f, (Dn = !0));
        ((h.precision = a += 10), (n = s = u = new h(1)), (c = 0), l++);
      }
      o = u;
    }
  }
  function Zn(t, e) {
    var n,
      r,
      i,
      s,
      o,
      u,
      a,
      l,
      c,
      p,
      h,
      f = 1,
      m = t,
      d = m.d,
      g = m.constructor,
      D = g.rounding,
      y = g.precision;
    if (m.s < 0 || !d || !d[0] || (!m.e && 1 == d[0] && 1 == d.length))
      return new g(d && !d[0] ? -1 / 0 : 1 != m.s ? NaN : d ? 0 : m);
    if (
      (null == e ? ((Dn = !1), (c = y)) : (c = e),
      (g.precision = c += 10),
      (r = (n = Ln(d)).charAt(0)),
      !(Math.abs((s = m.e)) < 15e14))
    )
      return (
        (l = zn(g, c + 2, y).times(s + "")),
        (m = Zn(new g(r + "." + n.slice(1)), c - 10).plus(l)),
        (g.precision = y),
        null == e ? Pn(m, y, D, (Dn = !0)) : m
      );
    for (; (r < 7 && 1 != r) || (1 == r && n.charAt(1) > 3);)
      ((r = (n = Ln((m = m.times(t)).d)).charAt(0)), f++);
    for (
      s = m.e,
        r > 1 ? ((m = new g("0." + n)), s++) : (m = new g(r + "." + n.slice(1))),
        p = m,
        a = o = m = Rn(m.minus(1), m.plus(1), c, 1),
        h = Pn(m.times(m), c, 1),
        i = 3;
      ;
    ) {
      if (
        ((o = Pn(o.times(h), c, 1)),
        Ln((l = a.plus(Rn(o, new g(i), c, 1))).d).slice(0, c) === Ln(a.d).slice(0, c))
      ) {
        if (
          ((a = a.times(2)),
          0 !== s && (a = a.plus(zn(g, c + 2, y).times(s + ""))),
          (a = Rn(a, new g(f), c, 1)),
          null != e)
        )
          return ((g.precision = y), a);
        if (!In(a.d, c - 10, D, u)) return Pn(a, (g.precision = y), D, (Dn = !0));
        ((g.precision = c += 10),
          (l = o = m = Rn(p.minus(1), p.plus(1), c, 1)),
          (h = Pn(m.times(m), c, 1)),
          (i = u = 1));
      }
      ((a = l), (i += 2));
    }
  }
  function Jn(t) {
    return String((t.s * t.s) / 0);
  }
  function Yn(t, e) {
    var n, r, i;
    for (
      (n = e.indexOf(".")) > -1 && (e = e.replace(".", "")),
        (r = e.search(/e/i)) > 0
          ? (n < 0 && (n = r), (n += +e.slice(r + 1)), (e = e.substring(0, r)))
          : n < 0 && (n = e.length),
        r = 0;
      48 === e.charCodeAt(r);
      r++
    );
    for (i = e.length; 48 === e.charCodeAt(i - 1); --i);
    if ((e = e.slice(r, i))) {
      if (
        ((i -= r), (t.e = n = n - r - 1), (t.d = []), (r = (n + 1) % 7), n < 0 && (r += 7), r < i)
      ) {
        for (r && t.d.push(+e.slice(0, r)), i -= 7; r < i;) t.d.push(+e.slice(r, (r += 7)));
        r = 7 - (e = e.slice(r)).length;
      } else r -= i;
      for (; r--;) e += "0";
      (t.d.push(+e),
        Dn &&
          (t.e > t.constructor.maxE
            ? ((t.d = null), (t.e = NaN))
            : t.e < t.constructor.minE && ((t.e = 0), (t.d = [0]))));
    } else ((t.e = 0), (t.d = [0]));
    return t;
  }
  function Xn(t, e) {
    var n, r, i, s, o, u, a, l, c;
    if (e.indexOf("_") > -1) {
      if (((e = e.replace(/(\d)_(?=\d)/g, "$1")), Nn.test(e))) return Yn(t, e);
    } else if ("Infinity" === e || "NaN" === e)
      return (+e || (t.s = NaN), (t.e = NaN), (t.d = null), t);
    if (Cn.test(e)) ((n = 16), (e = e.toLowerCase()));
    else if (Fn.test(e)) n = 2;
    else {
      if (!_n.test(e)) throw Error(vn + e);
      n = 8;
    }
    for (
      (s = e.search(/p/i)) > 0
        ? ((a = +e.slice(s + 1)), (e = e.substring(2, s)))
        : (e = e.slice(2)),
        o = (s = e.indexOf(".")) >= 0,
        r = t.constructor,
        o && ((s = (u = (e = e.replace(".", "")).length) - s), (i = Vn(r, new r(n), s, 2 * s))),
        s = c = (l = On(e, n, Sn)).length - 1;
      0 === l[s];
      --s
    )
      l.pop();
    return s < 0
      ? new r(0 * t.s)
      : ((t.e = Un(l, c)),
        (t.d = l),
        (Dn = !1),
        o && (t = Rn(t, i, 4 * u)),
        a && (t = t.times(Math.abs(a) < 54 ? An(2, a) : qr.pow(2, a))),
        (Dn = !0),
        t);
  }
  function Kn(t, e, n, r, i) {
    var s,
      o,
      u,
      a,
      l = t.precision,
      c = Math.ceil(l / 7);
    for (Dn = !1, a = n.times(n), u = new t(r); ;) {
      if (
        ((o = Rn(u.times(a), new t(e++ * e++), l, 1)),
        (u = i ? r.plus(o) : r.minus(o)),
        (r = Rn(o.times(a), new t(e++ * e++), l, 1)),
        void 0 !== (o = u.plus(r)).d[c])
      ) {
        for (s = c; o.d[s] === u.d[s] && s--;);
        if (-1 == s) break;
      }
      ((s = u), (u = r), (r = o), (o = s));
    }
    return ((Dn = !0), (o.d.length = c + 1), o);
  }
  function tr(t, e) {
    for (var n = t; --e;) n *= t;
    return n;
  }
  function er(t, e) {
    var n,
      r = e.s < 0,
      i = Gn(t, t.precision, 1),
      s = i.times(0.5);
    if ((e = e.abs()).lte(s)) return ((cn = r ? 4 : 1), e);
    if ((n = e.divToInt(i)).isZero()) cn = r ? 3 : 2;
    else {
      if ((e = e.minus(n.times(i))).lte(s)) return ((cn = Wn(n) ? (r ? 2 : 3) : r ? 4 : 1), e);
      cn = Wn(n) ? (r ? 1 : 4) : r ? 3 : 2;
    }
    return e.minus(i).abs();
  }
  function nr(t, e, n, r) {
    var i,
      s,
      o,
      u,
      a,
      l,
      c,
      p,
      h,
      f = t.constructor,
      m = void 0 !== n;
    if (
      (m
        ? (kn(n, 1, hn), void 0 === r ? (r = f.rounding) : kn(r, 0, 8))
        : ((n = f.precision), (r = f.rounding)),
      t.isFinite())
    ) {
      for (
        m ? ((i = 2), 16 == e ? (n = 4 * n - 3) : 8 == e && (n = 3 * n - 2)) : (i = e),
          (o = (c = $n(t)).indexOf(".")) >= 0 &&
            ((c = c.replace(".", "")),
            ((h = new f(1)).e = c.length - o),
            (h.d = On($n(h), 10, i)),
            (h.e = h.d.length)),
          s = a = (p = On(c, 10, i)).length;
        0 == p[--a];
      )
        p.pop();
      if (p[0]) {
        if (
          (o < 0
            ? s--
            : (((t = new f(t)).d = p),
              (t.e = s),
              (p = (t = Rn(t, h, n, r, 0, i)).d),
              (s = t.e),
              (l = ln)),
          (o = p[n]),
          (u = i / 2),
          (l = l || void 0 !== p[n + 1]),
          (l =
            r < 4
              ? (void 0 !== o || l) && (0 === r || r === (t.s < 0 ? 3 : 2))
              : o > u ||
                (o === u &&
                  (4 === r || l || (6 === r && 1 & p[n - 1]) || r === (t.s < 0 ? 8 : 7)))),
          (p.length = n),
          l)
        )
          for (; ++p[--n] > i - 1;) ((p[n] = 0), n || (++s, p.unshift(1)));
        for (a = p.length; !p[a - 1]; --a);
        for (o = 0, c = ""; o < a; o++) c += fn.charAt(p[o]);
        if (m) {
          if (a > 1)
            if (16 == e || 8 == e) {
              for (o = 16 == e ? 4 : 3, --a; a % o; a++) c += "0";
              for (a = (p = On(c, i, e)).length; !p[a - 1]; --a);
              for (o = 1, c = "1."; o < a; o++) c += fn.charAt(p[o]);
            } else c = c.charAt(0) + "." + c.slice(1);
          c = c + (s < 0 ? "p" : "p+") + s;
        } else if (s < 0) {
          for (; ++s;) c = "0" + c;
          c = "0." + c;
        } else if (++s > a) for (s -= a; s--;) c += "0";
        else s < a && (c = c.slice(0, s) + "." + c.slice(s));
      } else c = m ? "0p+0" : "0";
      c = (16 == e ? "0x" : 2 == e ? "0b" : 8 == e ? "0o" : "") + c;
    } else c = Jn(t);
    return t.s < 0 ? "-" + c : c;
  }
  function rr(t, e) {
    if (t.length > e) return ((t.length = e), !0);
  }
  function ir(t) {
    return new this(t).abs();
  }
  function sr(t) {
    return new this(t).acos();
  }
  function or(t) {
    return new this(t).acosh();
  }
  function ur(t, e) {
    return new this(t).plus(e);
  }
  function ar(t) {
    return new this(t).asin();
  }
  function lr(t) {
    return new this(t).asinh();
  }
  function cr(t) {
    return new this(t).atan();
  }
  function pr(t) {
    return new this(t).atanh();
  }
  function hr(t, e) {
    ((t = new this(t)), (e = new this(e)));
    var n,
      r = this.precision,
      i = this.rounding,
      s = r + 4;
    return (
      t.s && e.s
        ? t.d || e.d
          ? !e.d || t.isZero()
            ? ((n = e.s < 0 ? Gn(this, r, i) : new this(0)).s = t.s)
            : !t.d || e.isZero()
              ? ((n = Gn(this, s, 1).times(0.5)).s = t.s)
              : e.s < 0
                ? ((this.precision = s),
                  (this.rounding = 1),
                  (n = this.atan(Rn(t, e, s, 1))),
                  (e = Gn(this, s, 1)),
                  (this.precision = r),
                  (this.rounding = i),
                  (n = t.s < 0 ? n.minus(e) : n.plus(e)))
                : (n = this.atan(Rn(t, e, s, 1)))
          : ((n = Gn(this, s, 1).times(e.s > 0 ? 0.25 : 0.75)).s = t.s)
        : (n = new this(NaN)),
      n
    );
  }
  function fr(t) {
    return new this(t).cbrt();
  }
  function mr(t) {
    return Pn((t = new this(t)), t.e + 1, 2);
  }
  function dr(t, e, n) {
    return new this(t).clamp(e, n);
  }
  function gr(t) {
    if (!t || "object" != typeof t) throw Error(yn + "Object expected");
    var e,
      n,
      r,
      i = !0 === t.defaults,
      s = [
        "precision",
        1,
        hn,
        "rounding",
        0,
        8,
        "toExpNeg",
        -pn,
        0,
        "toExpPos",
        0,
        pn,
        "maxE",
        0,
        pn,
        "minE",
        -pn,
        0,
        "modulo",
        0,
        9,
      ];
    for (e = 0; e < s.length; e += 3)
      if (((n = s[e]), i && (this[n] = gn[n]), void 0 !== (r = t[n]))) {
        if (!(xn(r) === r && r >= s[e + 1] && r <= s[e + 2])) throw Error(vn + n + ": " + r);
        this[n] = r;
      }
    if (((n = "crypto"), i && (this[n] = gn[n]), void 0 !== (r = t[n]))) {
      if (!0 !== r && !1 !== r && 0 !== r && 1 !== r) throw Error(vn + n + ": " + r);
      if (r) {
        if (
          "undefined" == typeof crypto ||
          !crypto ||
          (!crypto.getRandomValues && !crypto.randomBytes)
        )
          throw Error(wn);
        this[n] = !0;
      } else this[n] = !1;
    }
    return this;
  }
  function Dr(t) {
    return new this(t).cos();
  }
  function yr(t) {
    return new this(t).cosh();
  }
  function vr(t, e) {
    return new this(t).div(e);
  }
  function br(t) {
    return new this(t).exp();
  }
  function wr(t) {
    return Pn((t = new this(t)), t.e + 1, 3);
  }
  function Er() {
    var t,
      e,
      n = new this(0);
    for (Dn = !1, t = 0; t < arguments.length;)
      if ((e = new this(arguments[t++])).d) n.d && (n = n.plus(e.times(e)));
      else {
        if (e.s) return ((Dn = !0), new this(1 / 0));
        n = e;
      }
    return ((Dn = !0), n.sqrt());
  }
  function xr(t) {
    return t instanceof qr || (t && t.toStringTag === En) || !1;
  }
  function Ar(t) {
    return new this(t).ln();
  }
  function Fr(t, e) {
    return new this(t).log(e);
  }
  function Cr(t) {
    return new this(t).log(2);
  }
  function _r(t) {
    return new this(t).log(10);
  }
  function Nr() {
    return Qn(this, arguments, -1);
  }
  function Sr() {
    return Qn(this, arguments, 1);
  }
  function Br(t, e) {
    return new this(t).mod(e);
  }
  function Mr(t, e) {
    return new this(t).mul(e);
  }
  function Tr(t, e) {
    return new this(t).pow(e);
  }
  function Lr(t) {
    var e,
      n,
      r,
      i,
      s = 0,
      o = new this(1),
      u = [];
    if ((void 0 === t ? (t = this.precision) : kn(t, 1, hn), (r = Math.ceil(t / 7)), this.crypto))
      if (crypto.getRandomValues)
        for (e = crypto.getRandomValues(new Uint32Array(r)); s < r;)
          (i = e[s]) >= 429e7
            ? (e[s] = crypto.getRandomValues(new Uint32Array(1))[0])
            : (u[s++] = i % 1e7);
      else {
        if (!crypto.randomBytes) throw Error(wn);
        for (e = crypto.randomBytes((r *= 4)); s < r;)
          (i = e[s] + (e[s + 1] << 8) + (e[s + 2] << 16) + ((127 & e[s + 3]) << 24)) >= 214e7
            ? crypto.randomBytes(4).copy(e, s)
            : (u.push(i % 1e7), (s += 4));
        s = r / 4;
      }
    else for (; s < r;) u[s++] = (1e7 * Math.random()) | 0;
    for (
      t %= 7, (r = u[--s]) && t && ((i = An(10, 7 - t)), (u[s] = ((r / i) | 0) * i));
      0 === u[s];
      s--
    )
      u.pop();
    if (s < 0) ((n = 0), (u = [0]));
    else {
      for (n = -1; 0 === u[0]; n -= 7) u.shift();
      for (r = 1, i = u[0]; i >= 10; i /= 10) r++;
      r < 7 && (n -= 7 - r);
    }
    return ((o.e = n), (o.d = u), o);
  }
  function kr(t) {
    return Pn((t = new this(t)), t.e + 1, this.rounding);
  }
  function Ir(t) {
    return (t = new this(t)).d ? (t.d[0] ? t.s : 0 * t.s) : t.s || NaN;
  }
  function Or(t) {
    return new this(t).sin();
  }
  function Rr(t) {
    return new this(t).sinh();
  }
  function Pr(t) {
    return new this(t).sqrt();
  }
  function $r(t, e) {
    return new this(t).sub(e);
  }
  function Ur() {
    var t = 0,
      e = arguments,
      n = new this(e[t]);
    for (Dn = !1; n.s && ++t < e.length;) n = n.plus(e[t]);
    return ((Dn = !0), Pn(n, this.precision, this.rounding));
  }
  function zr(t) {
    return new this(t).tan();
  }
  function Gr(t) {
    return new this(t).tanh();
  }
  function jr(t) {
    return Pn((t = new this(t)), t.e + 1, 1);
  }
  ((Tn[Symbol.for("nodejs.util.inspect.custom")] = Tn.toString),
    (Tn[Symbol.toStringTag] = "Decimal"));
  var qr = (Tn.constructor = (function t(e) {
    var n, r, i;
    function s(t) {
      var e,
        n,
        r,
        i = this;
      if (!(i instanceof s)) return new s(t);
      if (((i.constructor = s), xr(t)))
        return (
          (i.s = t.s),
          void (Dn
            ? !t.d || t.e > s.maxE
              ? ((i.e = NaN), (i.d = null))
              : t.e < s.minE
                ? ((i.e = 0), (i.d = [0]))
                : ((i.e = t.e), (i.d = t.d.slice()))
            : ((i.e = t.e), (i.d = t.d ? t.d.slice() : t.d)))
        );
      if ("number" == (r = typeof t)) {
        if (0 === t) return ((i.s = 1 / t < 0 ? -1 : 1), (i.e = 0), void (i.d = [0]));
        if ((t < 0 ? ((t = -t), (i.s = -1)) : (i.s = 1), t === ~~t && t < 1e7)) {
          for (e = 0, n = t; n >= 10; n /= 10) e++;
          return void (Dn
            ? e > s.maxE
              ? ((i.e = NaN), (i.d = null))
              : e < s.minE
                ? ((i.e = 0), (i.d = [0]))
                : ((i.e = e), (i.d = [t]))
            : ((i.e = e), (i.d = [t])));
        }
        return 0 * t != 0
          ? (t || (i.s = NaN), (i.e = NaN), void (i.d = null))
          : Yn(i, t.toString());
      }
      if ("string" === r)
        return (
          45 === (n = t.charCodeAt(0))
            ? ((t = t.slice(1)), (i.s = -1))
            : (43 === n && (t = t.slice(1)), (i.s = 1)),
          Nn.test(t) ? Yn(i, t) : Xn(i, t)
        );
      if ("bigint" === r) return (t < 0 ? ((t = -t), (i.s = -1)) : (i.s = 1), Yn(i, t.toString()));
      throw Error(vn + t);
    }
    if (
      ((s.prototype = Tn),
      (s.ROUND_UP = 0),
      (s.ROUND_DOWN = 1),
      (s.ROUND_CEIL = 2),
      (s.ROUND_FLOOR = 3),
      (s.ROUND_HALF_UP = 4),
      (s.ROUND_HALF_DOWN = 5),
      (s.ROUND_HALF_EVEN = 6),
      (s.ROUND_HALF_CEIL = 7),
      (s.ROUND_HALF_FLOOR = 8),
      (s.EUCLID = 9),
      (s.config = s.set = gr),
      (s.clone = t),
      (s.isDecimal = xr),
      (s.abs = ir),
      (s.acos = sr),
      (s.acosh = or),
      (s.add = ur),
      (s.asin = ar),
      (s.asinh = lr),
      (s.atan = cr),
      (s.atanh = pr),
      (s.atan2 = hr),
      (s.cbrt = fr),
      (s.ceil = mr),
      (s.clamp = dr),
      (s.cos = Dr),
      (s.cosh = yr),
      (s.div = vr),
      (s.exp = br),
      (s.floor = wr),
      (s.hypot = Er),
      (s.ln = Ar),
      (s.log = Fr),
      (s.log10 = _r),
      (s.log2 = Cr),
      (s.max = Nr),
      (s.min = Sr),
      (s.mod = Br),
      (s.mul = Mr),
      (s.pow = Tr),
      (s.random = Lr),
      (s.round = kr),
      (s.sign = Ir),
      (s.sin = Or),
      (s.sinh = Rr),
      (s.sqrt = Pr),
      (s.sub = $r),
      (s.sum = Ur),
      (s.tan = zr),
      (s.tanh = Gr),
      (s.trunc = jr),
      void 0 === e && (e = {}),
      e && !0 !== e.defaults)
    )
      for (
        i = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"],
          n = 0;
        n < i.length;
      )
        e.hasOwnProperty((r = i[n++])) || (e[r] = this[r]);
    return (s.config(e), s);
  })(gn));
  ((mn = new qr(mn)), (dn = new qr(dn)));
  var Vr = je(
    "BigNumber",
    ["?on", "config"],
    t => {
      var { on: e, config: n } = t,
        r = qr.clone({ precision: n.precision, modulo: qr.EUCLID });
      return (
        (r.prototype = Object.create(r.prototype)),
        (r.prototype.type = "BigNumber"),
        (r.prototype.isBigNumber = !0),
        (r.prototype.toJSON = function () {
          return { mathjs: "BigNumber", value: this.toString() };
        }),
        (r.fromJSON = function (t) {
          return new r(t.value);
        }),
        e &&
          e("config", function (t, e) {
            t.precision !== e.precision && r.config({ precision: t.precision });
          }),
        r
      );
    },
    { isClass: !0 },
  );
  const Wr =
      Math.cosh ||
      function (t) {
        return Math.abs(t) < 1e-9 ? 1 - t : 0.5 * (Math.exp(t) + Math.exp(-t));
      },
    Qr =
      Math.sinh ||
      function (t) {
        return Math.abs(t) < 1e-9 ? t : 0.5 * (Math.exp(t) - Math.exp(-t));
      },
    Hr = function (t, e) {
      return (
        (t = Math.abs(t)) < (e = Math.abs(e)) && ([t, e] = [e, t]),
        t < 1e8 ? Math.sqrt(t * t + e * e) : ((e /= t), t * Math.sqrt(1 + e * e))
      );
    },
    Zr = function () {
      throw SyntaxError("Invalid Param");
    };
  function Jr(t, e) {
    const n = Math.abs(t),
      r = Math.abs(e);
    return 0 === t
      ? Math.log(r)
      : 0 === e
        ? Math.log(n)
        : n < 3e3 && r < 3e3
          ? 0.5 * Math.log(t * t + e * e)
          : ((t *= 0.5), (e *= 0.5), 0.5 * Math.log(t * t + e * e) + Math.LN2);
  }
  const Yr = { re: 0, im: 0 },
    Xr = function (t, e) {
      const n = Yr;
      if (null == t) n.re = n.im = 0;
      else if (void 0 !== e) ((n.re = t), (n.im = e));
      else
        switch (typeof t) {
          case "object":
            if ("im" in t && "re" in t) ((n.re = t.re), (n.im = t.im));
            else if ("abs" in t && "arg" in t) {
              if (!isFinite(t.abs) && isFinite(t.arg)) return Kr.INFINITY;
              ((n.re = t.abs * Math.cos(t.arg)), (n.im = t.abs * Math.sin(t.arg)));
            } else if ("r" in t && "phi" in t) {
              if (!isFinite(t.r) && isFinite(t.phi)) return Kr.INFINITY;
              ((n.re = t.r * Math.cos(t.phi)), (n.im = t.r * Math.sin(t.phi)));
            } else 2 === t.length ? ((n.re = t[0]), (n.im = t[1])) : Zr();
            break;
          case "string":
            n.im = n.re = 0;
            const e = t.replace(/_/g, "").match(/\d+\.?\d*e[+-]?\d+|\d+\.?\d*|\.\d+|./g);
            let r = 1,
              i = 0;
            null === e && Zr();
            for (let t = 0; t < e.length; t++) {
              const s = e[t];
              " " === s ||
                "\t" === s ||
                "\n" === s ||
                ("+" === s
                  ? r++
                  : "-" === s
                    ? i++
                    : "i" === s || "I" === s
                      ? (r + i === 0 && Zr(),
                        " " === e[t + 1] || isNaN(e[t + 1])
                          ? (n.im += parseFloat((i % 2 ? "-" : "") + "1"))
                          : ((n.im += parseFloat((i % 2 ? "-" : "") + e[t + 1])), t++),
                        (r = i = 0))
                      : ((r + i === 0 || isNaN(s)) && Zr(),
                        "i" === e[t + 1] || "I" === e[t + 1]
                          ? ((n.im += parseFloat((i % 2 ? "-" : "") + s)), t++)
                          : (n.re += parseFloat((i % 2 ? "-" : "") + s)),
                        (r = i = 0)));
            }
            r + i > 0 && Zr();
            break;
          case "number":
            ((n.im = 0), (n.re = t));
            break;
          default:
            Zr();
        }
      return (isNaN(n.re) || isNaN(n.im), n);
    };
  function Kr(t, e) {
    if (!(this instanceof Kr)) return new Kr(t, e);
    const n = Xr(t, e);
    ((this.re = n.re), (this.im = n.im));
  }
  ((Kr.prototype = {
    re: 0,
    im: 0,
    sign: function () {
      const t = Hr(this.re, this.im);
      return new Kr(this.re / t, this.im / t);
    },
    add: function (t, e) {
      const n = Xr(t, e),
        r = this.isInfinite(),
        i = !(isFinite(n.re) && isFinite(n.im));
      return r || i ? (r && i ? Kr.NAN : Kr.INFINITY) : new Kr(this.re + n.re, this.im + n.im);
    },
    sub: function (t, e) {
      const n = Xr(t, e),
        r = this.isInfinite(),
        i = !(isFinite(n.re) && isFinite(n.im));
      return r || i ? (r && i ? Kr.NAN : Kr.INFINITY) : new Kr(this.re - n.re, this.im - n.im);
    },
    mul: function (t, e) {
      const n = Xr(t, e),
        r = this.isInfinite(),
        i = !(isFinite(n.re) && isFinite(n.im)),
        s = 0 === this.re && 0 === this.im,
        o = 0 === n.re && 0 === n.im;
      return (r && o) || (i && s)
        ? Kr.NAN
        : r || i
          ? Kr.INFINITY
          : 0 === n.im && 0 === this.im
            ? new Kr(this.re * n.re, 0)
            : new Kr(this.re * n.re - this.im * n.im, this.re * n.im + this.im * n.re);
    },
    div: function (t, e) {
      const n = Xr(t, e),
        r = this.isInfinite(),
        i = !(isFinite(n.re) && isFinite(n.im)),
        s = 0 === this.re && 0 === this.im,
        o = 0 === n.re && 0 === n.im;
      if ((s && o) || (r && i)) return Kr.NAN;
      if (o || r) return Kr.INFINITY;
      if (s || i) return Kr.ZERO;
      if (0 === n.im) return new Kr(this.re / n.re, this.im / n.re);
      if (Math.abs(n.re) < Math.abs(n.im)) {
        const t = n.re / n.im,
          e = n.re * t + n.im;
        return new Kr((this.re * t + this.im) / e, (this.im * t - this.re) / e);
      }
      {
        const t = n.im / n.re,
          e = n.im * t + n.re;
        return new Kr((this.re + this.im * t) / e, (this.im - this.re * t) / e);
      }
    },
    pow: function (t, e) {
      const n = Xr(t, e),
        r = 0 === this.re && 0 === this.im;
      if (0 === n.re && 0 === n.im) return Kr.ONE;
      if (0 === n.im) {
        if (0 === this.im && this.re > 0) return new Kr(Math.pow(this.re, n.re), 0);
        if (0 === this.re)
          switch (((n.re % 4) + 4) % 4) {
            case 0:
              return new Kr(Math.pow(this.im, n.re), 0);
            case 1:
              return new Kr(0, Math.pow(this.im, n.re));
            case 2:
              return new Kr(-Math.pow(this.im, n.re), 0);
            case 3:
              return new Kr(0, -Math.pow(this.im, n.re));
          }
      }
      if (r && n.re > 0) return Kr.ZERO;
      const i = Math.atan2(this.im, this.re),
        s = Jr(this.re, this.im);
      let o = Math.exp(n.re * s - n.im * i),
        u = n.im * s + n.re * i;
      return new Kr(o * Math.cos(u), o * Math.sin(u));
    },
    sqrt: function () {
      const t = this.re,
        e = this.im;
      if (0 === e) return t >= 0 ? new Kr(Math.sqrt(t), 0) : new Kr(0, Math.sqrt(-t));
      const n = Hr(t, e);
      let r = Math.sqrt(0.5 * (n + Math.abs(t))),
        i = Math.abs(e) / (2 * r);
      return t >= 0 ? new Kr(r, e < 0 ? -i : i) : new Kr(i, e < 0 ? -r : r);
    },
    exp: function () {
      const t = Math.exp(this.re);
      return 0 === this.im ? new Kr(t, 0) : new Kr(t * Math.cos(this.im), t * Math.sin(this.im));
    },
    expm1: function () {
      const t = this.re,
        e = this.im;
      return new Kr(
        Math.expm1(t) * Math.cos(e) +
          (t => {
            const e = Math.sin(0.5 * t);
            return -2 * e * e;
          })(e),
        Math.exp(t) * Math.sin(e),
      );
    },
    log: function () {
      const t = this.re,
        e = this.im;
      return 0 === e && t > 0 ? new Kr(Math.log(t), 0) : new Kr(Jr(t, e), Math.atan2(e, t));
    },
    abs: function () {
      return Hr(this.re, this.im);
    },
    arg: function () {
      return Math.atan2(this.im, this.re);
    },
    sin: function () {
      const t = this.re,
        e = this.im;
      return new Kr(Math.sin(t) * Wr(e), Math.cos(t) * Qr(e));
    },
    cos: function () {
      const t = this.re,
        e = this.im;
      return new Kr(Math.cos(t) * Wr(e), -Math.sin(t) * Qr(e));
    },
    tan: function () {
      const t = 2 * this.re,
        e = 2 * this.im,
        n = Math.cos(t) + Wr(e);
      return new Kr(Math.sin(t) / n, Qr(e) / n);
    },
    cot: function () {
      const t = 2 * this.re,
        e = 2 * this.im,
        n = Math.cos(t) - Wr(e);
      return new Kr(-Math.sin(t) / n, Qr(e) / n);
    },
    sec: function () {
      const t = this.re,
        e = this.im,
        n = 0.5 * Wr(2 * e) + 0.5 * Math.cos(2 * t);
      return new Kr((Math.cos(t) * Wr(e)) / n, (Math.sin(t) * Qr(e)) / n);
    },
    csc: function () {
      const t = this.re,
        e = this.im,
        n = 0.5 * Wr(2 * e) - 0.5 * Math.cos(2 * t);
      return new Kr((Math.sin(t) * Wr(e)) / n, (-Math.cos(t) * Qr(e)) / n);
    },
    asin: function () {
      const t = this.re,
        e = this.im,
        n = new Kr(e * e - t * t + 1, -2 * t * e).sqrt(),
        r = new Kr(n.re - e, n.im + t).log();
      return new Kr(r.im, -r.re);
    },
    acos: function () {
      const t = this.re,
        e = this.im,
        n = new Kr(e * e - t * t + 1, -2 * t * e).sqrt(),
        r = new Kr(n.re - e, n.im + t).log();
      return new Kr(Math.PI / 2 - r.im, r.re);
    },
    atan: function () {
      const t = this.re,
        e = this.im;
      if (0 === t) {
        if (1 === e) return new Kr(0, 1 / 0);
        if (-1 === e) return new Kr(0, -1 / 0);
      }
      const n = t * t + (1 - e) * (1 - e),
        r = new Kr((1 - e * e - t * t) / n, (-2 * t) / n).log();
      return new Kr(-0.5 * r.im, 0.5 * r.re);
    },
    acot: function () {
      const t = this.re,
        e = this.im;
      if (0 === e) return new Kr(Math.atan2(1, t), 0);
      const n = t * t + e * e;
      return 0 !== n
        ? new Kr(t / n, -e / n).atan()
        : new Kr(0 !== t ? t / 0 : 0, 0 !== e ? -e / 0 : 0).atan();
    },
    asec: function () {
      const t = this.re,
        e = this.im;
      if (0 === t && 0 === e) return new Kr(0, 1 / 0);
      const n = t * t + e * e;
      return 0 !== n
        ? new Kr(t / n, -e / n).acos()
        : new Kr(0 !== t ? t / 0 : 0, 0 !== e ? -e / 0 : 0).acos();
    },
    acsc: function () {
      const t = this.re,
        e = this.im;
      if (0 === t && 0 === e) return new Kr(Math.PI / 2, 1 / 0);
      const n = t * t + e * e;
      return 0 !== n
        ? new Kr(t / n, -e / n).asin()
        : new Kr(0 !== t ? t / 0 : 0, 0 !== e ? -e / 0 : 0).asin();
    },
    sinh: function () {
      const t = this.re,
        e = this.im;
      return new Kr(Qr(t) * Math.cos(e), Wr(t) * Math.sin(e));
    },
    cosh: function () {
      const t = this.re,
        e = this.im;
      return new Kr(Wr(t) * Math.cos(e), Qr(t) * Math.sin(e));
    },
    tanh: function () {
      const t = 2 * this.re,
        e = 2 * this.im,
        n = Wr(t) + Math.cos(e);
      return new Kr(Qr(t) / n, Math.sin(e) / n);
    },
    coth: function () {
      const t = 2 * this.re,
        e = 2 * this.im,
        n = Wr(t) - Math.cos(e);
      return new Kr(Qr(t) / n, -Math.sin(e) / n);
    },
    csch: function () {
      const t = this.re,
        e = this.im,
        n = Math.cos(2 * e) - Wr(2 * t);
      return new Kr((-2 * Qr(t) * Math.cos(e)) / n, (2 * Wr(t) * Math.sin(e)) / n);
    },
    sech: function () {
      const t = this.re,
        e = this.im,
        n = Math.cos(2 * e) + Wr(2 * t);
      return new Kr((2 * Wr(t) * Math.cos(e)) / n, (-2 * Qr(t) * Math.sin(e)) / n);
    },
    asinh: function () {
      const t = this.re,
        e = this.im;
      if (0 === e) {
        if (0 === t) return new Kr(0, 0);
        const e = Math.abs(t),
          n = Math.log(e + Math.sqrt(e * e + 1));
        return new Kr(t < 0 ? -n : n, 0);
      }
      const n = new Kr(t * t - e * e + 1, 2 * t * e).sqrt();
      return new Kr(t + n.re, e + n.im).log();
    },
    acosh: function () {
      const t = this.re,
        e = this.im;
      if (0 === e) {
        if (t > 1) return new Kr(Math.log(t + Math.sqrt(t - 1) * Math.sqrt(t + 1)), 0);
        if (t < -1) {
          const e = Math.sqrt(t * t - 1);
          return new Kr(Math.log(-t + e), Math.PI);
        }
        return new Kr(0, Math.acos(t));
      }
      const n = new Kr(t - 1, e).sqrt(),
        r = new Kr(t + 1, e).sqrt();
      return new Kr(t + n.re * r.re - n.im * r.im, e + n.re * r.im + n.im * r.re).log();
    },
    atanh: function () {
      const t = this.re,
        e = this.im;
      if (0 === e) {
        if (0 === t) return new Kr(0, 0);
        if (1 === t) return new Kr(1 / 0, 0);
        if (-1 === t) return new Kr(-1 / 0, 0);
        if (-1 < t && t < 1) return new Kr(0.5 * Math.log((1 + t) / (1 - t)), 0);
        if (t > 1) {
          const e = (t + 1) / (t - 1);
          return new Kr(0.5 * Math.log(e), -Math.PI / 2);
        }
        const e = (1 + t) / (1 - t);
        return new Kr(0.5 * Math.log(-e), Math.PI / 2);
      }
      const n = 1 - t,
        r = 1 + t,
        i = n * n + e * e;
      if (0 === i) return new Kr(-1 !== t ? t / 0 : 0, 0 !== e ? e / 0 : 0);
      const s = (r * n - e * e) / i,
        o = (e * n + r * e) / i;
      return new Kr(Jr(s, o) / 2, Math.atan2(o, s) / 2);
    },
    acoth: function () {
      const t = this.re,
        e = this.im;
      if (0 === t && 0 === e) return new Kr(0, Math.PI / 2);
      const n = t * t + e * e;
      return 0 !== n
        ? new Kr(t / n, -e / n).atanh()
        : new Kr(0 !== t ? t / 0 : 0, 0 !== e ? -e / 0 : 0).atanh();
    },
    acsch: function () {
      const t = this.re,
        e = this.im;
      if (0 === e) {
        if (0 === t) return new Kr(1 / 0, 0);
        const e = 1 / t;
        return new Kr(Math.log(e + Math.sqrt(e * e + 1)), 0);
      }
      const n = t * t + e * e;
      return 0 !== n
        ? new Kr(t / n, -e / n).asinh()
        : new Kr(0 !== t ? t / 0 : 0, 0 !== e ? -e / 0 : 0).asinh();
    },
    asech: function () {
      const t = this.re,
        e = this.im;
      if (this.isZero()) return Kr.INFINITY;
      const n = t * t + e * e;
      return 0 !== n
        ? new Kr(t / n, -e / n).acosh()
        : new Kr(0 !== t ? t / 0 : 0, 0 !== e ? -e / 0 : 0).acosh();
    },
    inverse: function () {
      if (this.isZero()) return Kr.INFINITY;
      if (this.isInfinite()) return Kr.ZERO;
      const t = this.re,
        e = this.im,
        n = t * t + e * e;
      return new Kr(t / n, -e / n);
    },
    conjugate: function () {
      return new Kr(this.re, -this.im);
    },
    neg: function () {
      return new Kr(-this.re, -this.im);
    },
    ceil: function (t) {
      return (
        (t = Math.pow(10, t || 0)),
        new Kr(Math.ceil(this.re * t) / t, Math.ceil(this.im * t) / t)
      );
    },
    floor: function (t) {
      return (
        (t = Math.pow(10, t || 0)),
        new Kr(Math.floor(this.re * t) / t, Math.floor(this.im * t) / t)
      );
    },
    round: function (t) {
      return (
        (t = Math.pow(10, t || 0)),
        new Kr(Math.round(this.re * t) / t, Math.round(this.im * t) / t)
      );
    },
    equals: function (t, e) {
      const n = Xr(t, e);
      return Math.abs(n.re - this.re) <= Kr.EPSILON && Math.abs(n.im - this.im) <= Kr.EPSILON;
    },
    clone: function () {
      return new Kr(this.re, this.im);
    },
    toString: function () {
      let t = this.re,
        e = this.im,
        n = "";
      return this.isNaN()
        ? "NaN"
        : this.isInfinite()
          ? "Infinity"
          : (Math.abs(t) < Kr.EPSILON && (t = 0),
            Math.abs(e) < Kr.EPSILON && (e = 0),
            0 === e
              ? n + t
              : (0 !== t
                  ? ((n += t), (n += " "), e < 0 ? ((e = -e), (n += "-")) : (n += "+"), (n += " "))
                  : e < 0 && ((e = -e), (n += "-")),
                1 !== e && (n += e),
                n + "i"));
    },
    toVector: function () {
      return [this.re, this.im];
    },
    valueOf: function () {
      return 0 === this.im ? this.re : null;
    },
    isNaN: function () {
      return isNaN(this.re) || isNaN(this.im);
    },
    isZero: function () {
      return 0 === this.im && 0 === this.re;
    },
    isFinite: function () {
      return isFinite(this.re) && isFinite(this.im);
    },
    isInfinite: function () {
      return !this.isFinite();
    },
  }),
    (Kr.ZERO = new Kr(0, 0)),
    (Kr.ONE = new Kr(1, 0)),
    (Kr.I = new Kr(0, 1)),
    (Kr.PI = new Kr(Math.PI, 0)),
    (Kr.E = new Kr(Math.E, 0)),
    (Kr.INFINITY = new Kr(1 / 0, 1 / 0)),
    (Kr.NAN = new Kr(NaN, NaN)),
    (Kr.EPSILON = 1e-15));
  var ti = je(
    "Complex",
    [],
    () => (
      Object.defineProperty(Kr, "name", { value: "Complex" }),
      (Kr.prototype.constructor = Kr),
      (Kr.prototype.type = "Complex"),
      (Kr.prototype.isComplex = !0),
      (Kr.prototype.toJSON = function () {
        return { mathjs: "Complex", re: this.re, im: this.im };
      }),
      (Kr.prototype.toPolar = function () {
        return { r: this.abs(), phi: this.arg() };
      }),
      (Kr.prototype.format = function (t) {
        var e = this.im,
          n = this.re,
          r = He(this.re, t),
          i = He(this.im, t),
          s = Wt(t) ? t : t ? t.precision : null;
        if (null !== s) {
          var o = Math.pow(10, -s);
          (Math.abs(n / e) < o && (n = 0), Math.abs(e / n) < o && (e = 0));
        }
        return 0 === e
          ? r
          : 0 === n
            ? 1 === e
              ? "i"
              : -1 === e
                ? "-i"
                : i + "i"
            : e < 0
              ? -1 === e
                ? r + " - i"
                : r + " - " + i.substring(1) + "i"
              : 1 === e
                ? r + " + i"
                : r + " + " + i + "i";
      }),
      (Kr.fromPolar = function (t) {
        switch (arguments.length) {
          case 1:
            var e = arguments[0];
            if ("object" == typeof e) return Kr(e);
            throw new TypeError("Input has to be an object with r and phi keys.");
          case 2:
            var n = arguments[0],
              r = arguments[1];
            if (Wt(n)) {
              if ((Yt(r) && r.hasBase("ANGLE") && (r = r.toNumber("rad")), Wt(r)))
                return new Kr({ r: n, phi: r });
              throw new TypeError("Phi is not a number nor an angle unit.");
            }
            throw new TypeError("Radius r is not a number.");
          default:
            throw new SyntaxError("Wrong number of arguments in function fromPolar");
        }
      }),
      (Kr.prototype.valueOf = Kr.prototype.toString),
      (Kr.fromJSON = function (t) {
        return new Kr(t);
      }),
      (Kr.compare = function (t, e) {
        return t.re > e.re ? 1 : t.re < e.re ? -1 : t.im > e.im ? 1 : t.im < e.im ? -1 : 0;
      }),
      Kr
    ),
    { isClass: !0 },
  );
  "undefined" == typeof BigInt &&
    (BigInt = function (t) {
      if (isNaN(t)) throw new Error("");
      return t;
    });
  const ei = BigInt(0),
    ni = BigInt(1),
    ri = BigInt(2),
    ii = BigInt(3),
    si = BigInt(5),
    oi = BigInt(10);
  BigInt(Number.MAX_SAFE_INTEGER);
  const ui = { s: ni, n: ei, d: ni };
  function ai(t, e) {
    try {
      t = BigInt(t);
    } catch (t) {
      throw Di();
    }
    return t * e;
  }
  function li(t) {
    return "bigint" == typeof t ? t : Math.floor(t);
  }
  function ci(t, e) {
    if (e === ei) throw gi();
    const n = Object.create(di.prototype);
    n.s = t < ei ? -ni : ni;
    const r = mi((t = t < ei ? -t : t), e);
    return ((n.n = t / r), (n.d = e / r), n);
  }
  const pi = [ri * ri, ri, ri * ri, ri, ri * ri, ri * ii, ri, ri * ii];
  function hi(t) {
    const e = Object.create(null);
    if (t <= ni) return ((e[t] = ni), e);
    const n = t => {
      e[t] = (e[t] || ei) + ni;
    };
    for (; t % ri === ei;) (n(ri), (t /= ri));
    for (; t % ii === ei;) (n(ii), (t /= ii));
    for (; t % si === ei;) (n(si), (t /= si));
    for (let e = 0, r = ri + si; r * r <= t;) {
      for (; t % r === ei;) (n(r), (t /= r));
      ((r += pi[e]), (e = (e + 1) & 7));
    }
    return (t > ni && n(t), e);
  }
  const fi = function (t, e) {
    let n = ei,
      r = ni,
      i = ni;
    if (null == t);
    else if (void 0 !== e) {
      if ("bigint" == typeof t) n = t;
      else {
        if (isNaN(t)) throw Di();
        if (t % 1 != 0) throw yi();
        n = BigInt(t);
      }
      if ("bigint" == typeof e) r = e;
      else {
        if (isNaN(e)) throw Di();
        if (e % 1 != 0) throw yi();
        r = BigInt(e);
      }
      i = n * r;
    } else if ("object" == typeof t) {
      if ("d" in t && "n" in t)
        ((n = BigInt(t.n)), (r = BigInt(t.d)), "s" in t && (n *= BigInt(t.s)));
      else if (0 in t) ((n = BigInt(t[0])), 1 in t && (r = BigInt(t[1])));
      else {
        if ("bigint" != typeof t) throw Di();
        n = t;
      }
      i = n * r;
    } else if ("number" == typeof t) {
      if (isNaN(t)) throw Di();
      if ((t < 0 && ((i = -ni), (t = -t)), t % 1 == 0)) n = BigInt(t);
      else {
        let e = 1,
          i = 0,
          s = 1,
          o = 1,
          u = 1,
          a = 1e7;
        for (t >= 1 && ((e = 10 ** Math.floor(1 + Math.log10(t))), (t /= e)); s <= a && u <= a;) {
          let e = (i + o) / (s + u);
          if (t === e) {
            s + u <= a
              ? ((n = i + o), (r = s + u))
              : u > s
                ? ((n = o), (r = u))
                : ((n = i), (r = s));
            break;
          }
          (t > e ? ((i += o), (s += u)) : ((o += i), (u += s)),
            s > a ? ((n = o), (r = u)) : ((n = i), (r = s)));
        }
        ((n = BigInt(n) * BigInt(e)), (r = BigInt(r)));
      }
    } else if ("string" == typeof t) {
      let e = 0,
        s = ei,
        o = ei,
        u = ei,
        a = ni,
        l = ni,
        c = t.replace(/_/g, "").match(/\d+|./g);
      if (null === c) throw Di();
      if (
        ("-" === c[e] ? ((i = -ni), e++) : "+" === c[e] && e++,
        c.length === e + 1
          ? (o = ai(c[e++], i))
          : "." === c[e + 1] || "." === c[e]
            ? ("." !== c[e] && (s = ai(c[e++], i)),
              e++,
              (e + 1 === c.length ||
                ("(" === c[e + 1] && ")" === c[e + 3]) ||
                ("'" === c[e + 1] && "'" === c[e + 3])) &&
                ((o = ai(c[e], i)), (a = oi ** BigInt(c[e].length)), e++),
              (("(" === c[e] && ")" === c[e + 2]) || ("'" === c[e] && "'" === c[e + 2])) &&
                ((u = ai(c[e + 1], i)), (l = oi ** BigInt(c[e + 1].length) - ni), (e += 3)))
            : "/" === c[e + 1] || ":" === c[e + 1]
              ? ((o = ai(c[e], i)), (a = ai(c[e + 2], ni)), (e += 3))
              : "/" === c[e + 3] &&
                " " === c[e + 1] &&
                ((s = ai(c[e], i)), (o = ai(c[e + 2], i)), (a = ai(c[e + 4], ni)), (e += 5)),
        !(c.length <= e))
      )
        throw Di();
      ((r = a * l), (i = n = u + r * s + l * o));
    } else {
      if ("bigint" != typeof t) throw Di();
      ((n = t), (i = t), (r = ni));
    }
    if (r === ei) throw gi();
    ((ui.s = i < ei ? -ni : ni), (ui.n = n < ei ? -n : n), (ui.d = r < ei ? -r : r));
  };
  function mi(t, e) {
    if (!t) return e;
    if (!e) return t;
    for (;;) {
      if (!(t %= e)) return e;
      if (!(e %= t)) return t;
    }
  }
  function di(t, e) {
    if ((fi(t, e), !(this instanceof di))) return ci(ui.s * ui.n, ui.d);
    ((t = mi(ui.d, ui.n)), (this.s = ui.s), (this.n = ui.n / t), (this.d = ui.d / t));
  }
  const gi = function () {
      return new Error("Division by Zero");
    },
    Di = function () {
      return new Error("Invalid argument");
    },
    yi = function () {
      return new Error("Parameters must be integer");
    };
  di.prototype = {
    s: ni,
    n: ei,
    d: ni,
    abs: function () {
      return ci(this.n, this.d);
    },
    neg: function () {
      return ci(-this.s * this.n, this.d);
    },
    add: function (t, e) {
      return (fi(t, e), ci(this.s * this.n * ui.d + ui.s * this.d * ui.n, this.d * ui.d));
    },
    sub: function (t, e) {
      return (fi(t, e), ci(this.s * this.n * ui.d - ui.s * this.d * ui.n, this.d * ui.d));
    },
    mul: function (t, e) {
      return (fi(t, e), ci(this.s * ui.s * this.n * ui.n, this.d * ui.d));
    },
    div: function (t, e) {
      return (fi(t, e), ci(this.s * ui.s * this.n * ui.d, this.d * ui.n));
    },
    clone: function () {
      return ci(this.s * this.n, this.d);
    },
    mod: function (t, e) {
      if (void 0 === t) return ci((this.s * this.n) % this.d, ni);
      if ((fi(t, e), ei === ui.n * this.d)) throw gi();
      return ci((this.s * (ui.d * this.n)) % (ui.n * this.d), ui.d * this.d);
    },
    gcd: function (t, e) {
      return (fi(t, e), ci(mi(ui.n, this.n) * mi(ui.d, this.d), ui.d * this.d));
    },
    lcm: function (t, e) {
      return (
        fi(t, e),
        ui.n === ei && this.n === ei
          ? ci(ei, ni)
          : ci(ui.n * this.n, mi(ui.n, this.n) * mi(ui.d, this.d))
      );
    },
    inverse: function () {
      return ci(this.s * this.d, this.n);
    },
    pow: function (t, e) {
      if ((fi(t, e), ui.d === ni))
        return ui.s < ei
          ? ci((this.s * this.d) ** ui.n, this.n ** ui.n)
          : ci((this.s * this.n) ** ui.n, this.d ** ui.n);
      if (this.s < ei) return null;
      let n = hi(this.n),
        r = hi(this.d),
        i = ni,
        s = ni;
      for (let t in n)
        if ("1" !== t) {
          if ("0" === t) {
            i = ei;
            break;
          }
          if (((n[t] *= ui.n), n[t] % ui.d !== ei)) return null;
          ((n[t] /= ui.d), (i *= BigInt(t) ** n[t]));
        }
      for (let t in r)
        if ("1" !== t) {
          if (((r[t] *= ui.n), r[t] % ui.d !== ei)) return null;
          ((r[t] /= ui.d), (s *= BigInt(t) ** r[t]));
        }
      return ui.s < ei ? ci(s, i) : ci(i, s);
    },
    log: function (t, e) {
      if ((fi(t, e), this.s <= ei || ui.s <= ei)) return null;
      const n = Object.create(null),
        r = hi(ui.n),
        i = hi(ui.d),
        s = hi(this.n),
        o = hi(this.d);
      for (const t in i) r[t] = (r[t] || ei) - i[t];
      for (const t in o) s[t] = (s[t] || ei) - o[t];
      for (const t in r) "1" !== t && (n[t] = !0);
      for (const t in s) "1" !== t && (n[t] = !0);
      let u = null,
        a = null;
      for (const t in n) {
        const e = r[t] || ei,
          n = s[t] || ei;
        if (e === ei) {
          if (n !== ei) return null;
          continue;
        }
        let i = n,
          o = e;
        const l = mi(i, o);
        if (((i /= l), (o /= l), null === u && null === a)) ((u = i), (a = o));
        else if (i * a !== u * o) return null;
      }
      return null !== u && null !== a ? ci(u, a) : null;
    },
    equals: function (t, e) {
      return (fi(t, e), this.s * this.n * ui.d === ui.s * ui.n * this.d);
    },
    lt: function (t, e) {
      return (fi(t, e), this.s * this.n * ui.d < ui.s * ui.n * this.d);
    },
    lte: function (t, e) {
      return (fi(t, e), this.s * this.n * ui.d <= ui.s * ui.n * this.d);
    },
    gt: function (t, e) {
      return (fi(t, e), this.s * this.n * ui.d > ui.s * ui.n * this.d);
    },
    gte: function (t, e) {
      return (fi(t, e), this.s * this.n * ui.d >= ui.s * ui.n * this.d);
    },
    compare: function (t, e) {
      fi(t, e);
      let n = this.s * this.n * ui.d - ui.s * ui.n * this.d;
      return (ei < n) - (n < ei);
    },
    ceil: function (t) {
      return (
        (t = oi ** BigInt(t || 0)),
        ci(
          li((this.s * t * this.n) / this.d) +
            ((t * this.n) % this.d > ei && this.s >= ei ? ni : ei),
          t,
        )
      );
    },
    floor: function (t) {
      return (
        (t = oi ** BigInt(t || 0)),
        ci(
          li((this.s * t * this.n) / this.d) -
            ((t * this.n) % this.d > ei && this.s < ei ? ni : ei),
          t,
        )
      );
    },
    round: function (t) {
      return (
        (t = oi ** BigInt(t || 0)),
        ci(
          li((this.s * t * this.n) / this.d) +
            this.s * ((this.s >= ei ? ni : ei) + ri * ((t * this.n) % this.d) > this.d ? ni : ei),
          t,
        )
      );
    },
    roundTo: function (t, e) {
      fi(t, e);
      const n = this.n * ui.d,
        r = this.d * ui.n,
        i = n % r;
      let s = li(n / r);
      return (i + i >= r && s++, ci(this.s * s * ui.n, ui.d));
    },
    divisible: function (t, e) {
      return (fi(t, e), ui.n !== ei && (this.n * ui.d) % (ui.n * this.d) === ei);
    },
    valueOf: function () {
      return Number(this.s * this.n) / Number(this.d);
    },
    toString: function (t = 15) {
      let e = this.n,
        n = this.d,
        r = (function (t, e) {
          for (; e % ri === ei; e /= ri);
          for (; e % si === ei; e /= si);
          if (e === ni) return ei;
          let n = oi % e,
            r = 1;
          for (; n !== ni; r++) if (((n = (n * oi) % e), r > 2e3)) return ei;
          return BigInt(r);
        })(0, n),
        i = (function (t, e, n) {
          let r = ni,
            i = (function (t, e, n) {
              let r = ni;
              for (; e > ei; t = (t * t) % n, e >>= ni) e & ni && (r = (r * t) % n);
              return r;
            })(oi, n, e);
          for (let t = 0; t < 300; t++) {
            if (r === i) return BigInt(t);
            ((r = (r * oi) % e), (i = (i * oi) % e));
          }
          return 0;
        })(0, n, r),
        s = this.s < ei ? "-" : "";
      if (((s += li(e / n)), (e %= n), (e *= oi), e && (s += "."), r)) {
        for (let t = i; t--;) ((s += li(e / n)), (e %= n), (e *= oi));
        s += "(";
        for (let t = r; t--;) ((s += li(e / n)), (e %= n), (e *= oi));
        s += ")";
      } else for (let r = t; e && r--;) ((s += li(e / n)), (e %= n), (e *= oi));
      return s;
    },
    toFraction: function (t = !1) {
      let e = this.n,
        n = this.d,
        r = this.s < ei ? "-" : "";
      if (n === ni) r += e;
      else {
        const i = li(e / n);
        (t && i > ei && ((r += i), (r += " "), (e %= n)), (r += e), (r += "/"), (r += n));
      }
      return r;
    },
    toLatex: function (t = !1) {
      let e = this.n,
        n = this.d,
        r = this.s < ei ? "-" : "";
      if (n === ni) r += e;
      else {
        const i = li(e / n);
        (t && i > ei && ((r += i), (e %= n)),
          (r += "\\frac{"),
          (r += e),
          (r += "}{"),
          (r += n),
          (r += "}"));
      }
      return r;
    },
    toContinued: function () {
      let t = this.n,
        e = this.d;
      const n = [];
      for (; e;) {
        n.push(li(t / e));
        const r = t % e;
        ((t = e), (e = r));
      }
      return n;
    },
    simplify: function (t = 0.001) {
      const e = BigInt(Math.ceil(1 / t)),
        n = this.abs(),
        r = n.toContinued();
      for (let t = 1; t < r.length; t++) {
        let i = ci(r[t - 1], ni);
        for (let e = t - 2; e >= 0; e--) i = i.inverse().add(r[e]);
        let s = i.sub(n);
        if (s.n * e < s.d) return i.mul(this.s);
      }
      return this;
    },
  };
  var vi = je(
      "Fraction",
      [],
      () => (
        Object.defineProperty(di, "name", { value: "Fraction" }),
        (di.prototype.constructor = di),
        (di.prototype.type = "Fraction"),
        (di.prototype.isFraction = !0),
        (di.prototype.toJSON = function () {
          return { mathjs: "Fraction", n: String(this.s * this.n), d: String(this.d) };
        }),
        (di.fromJSON = function (t) {
          return new di(t);
        }),
        di
      ),
      { isClass: !0 },
    ),
    bi = je(
      "Matrix",
      [],
      () => {
        function t() {
          if (!(this instanceof t))
            throw new SyntaxError("Constructor must be called with the new operator");
        }
        return (
          (t.prototype.type = "Matrix"),
          (t.prototype.isMatrix = !0),
          (t.prototype.storage = function () {
            throw new Error("Cannot invoke storage on a Matrix interface");
          }),
          (t.prototype.datatype = function () {
            throw new Error("Cannot invoke datatype on a Matrix interface");
          }),
          (t.prototype.create = function (t, e) {
            throw new Error("Cannot invoke create on a Matrix interface");
          }),
          (t.prototype.subset = function (t, e, n) {
            throw new Error("Cannot invoke subset on a Matrix interface");
          }),
          (t.prototype.get = function (t) {
            throw new Error("Cannot invoke get on a Matrix interface");
          }),
          (t.prototype.set = function (t, e, n) {
            throw new Error("Cannot invoke set on a Matrix interface");
          }),
          (t.prototype.resize = function (t, e) {
            throw new Error("Cannot invoke resize on a Matrix interface");
          }),
          (t.prototype.reshape = function (t, e) {
            throw new Error("Cannot invoke reshape on a Matrix interface");
          }),
          (t.prototype.clone = function () {
            throw new Error("Cannot invoke clone on a Matrix interface");
          }),
          (t.prototype.size = function () {
            throw new Error("Cannot invoke size on a Matrix interface");
          }),
          (t.prototype.map = function (t, e) {
            throw new Error("Cannot invoke map on a Matrix interface");
          }),
          (t.prototype.forEach = function (t) {
            throw new Error("Cannot invoke forEach on a Matrix interface");
          }),
          (t.prototype[Symbol.iterator] = function () {
            throw new Error("Cannot iterate a Matrix interface");
          }),
          (t.prototype.toArray = function () {
            throw new Error("Cannot invoke toArray on a Matrix interface");
          }),
          (t.prototype.valueOf = function () {
            throw new Error("Cannot invoke valueOf on a Matrix interface");
          }),
          (t.prototype.format = function (t) {
            throw new Error("Cannot invoke format on a Matrix interface");
          }),
          (t.prototype.toString = function () {
            throw new Error("Cannot invoke toString on a Matrix interface");
          }),
          t
        );
      },
      { isClass: !0 },
    );
  function wi(t, e, n) {
    var r = new (0, t.constructor)(2),
      i = "";
    if (n) {
      if (n < 1) throw new Error("size must be in greater than 0");
      if (!Ve(n)) throw new Error("size must be an integer");
      if (t.greaterThan(r.pow(n - 1).sub(1)) || t.lessThan(r.pow(n - 1).mul(-1)))
        throw new Error("Value must be in range [-2^".concat(n - 1, ", 2^").concat(n - 1, "-1]"));
      if (!t.isInteger()) throw new Error("Value must be an integer");
      (t.lessThan(0) && (t = t.add(r.pow(n))), (i = "i".concat(n)));
    }
    switch (e) {
      case 2:
        return "".concat(t.toBinary()).concat(i);
      case 8:
        return "".concat(t.toOctal()).concat(i);
      case 16:
        return "".concat(t.toHexadecimal()).concat(i);
      default:
        throw new Error("Base ".concat(e, " not supported "));
    }
  }
  function Ei(t, e) {
    return void 0 !== e ? t.toExponential(e - 1) : t.toExponential();
  }
  function xi(t, e) {
    return Wt(t) ? t : Qt(t) ? t.toNumber() : e;
  }
  function Ai(t, e) {
    var n = (function (t, e) {
      return "number" == typeof t
        ? He(t, e)
        : Qt(t)
          ? (function (t, e) {
              if ("function" == typeof e) return e(t);
              if (!t.isFinite()) return t.isNaN() ? "NaN" : t.gt(0) ? "Infinity" : "-Infinity";
              var { notation: n, precision: r, wordSize: i } = Ze(e);
              switch (n) {
                case "fixed":
                  return (function (t, e) {
                    return t.toFixed(e);
                  })(t, r);
                case "exponential":
                  return Ei(t, r);
                case "engineering":
                  return (function (t, e) {
                    var n = t.e,
                      r = n % 3 == 0 ? n : n < 0 ? n - 3 - (n % 3) : n - (n % 3),
                      i = t.mul(Math.pow(10, -r)).toPrecision(e);
                    return (
                      i.includes("e") && (i = new (0, t.constructor)(i).toFixed()),
                      i + "e" + (n >= 0 ? "+" : "") + r.toString()
                    );
                  })(t, r);
                case "bin":
                  return wi(t, 2, i);
                case "oct":
                  return wi(t, 8, i);
                case "hex":
                  return wi(t, 16, i);
                case "auto":
                  var s = xi(null == e ? void 0 : e.lowerExp, -3),
                    o = xi(null == e ? void 0 : e.upperExp, 5);
                  if (t.isZero()) return "0";
                  var u = t.toSignificantDigits(r),
                    a = u.e;
                  return (a >= s && a < o ? u.toFixed() : Ei(t, r)).replace(
                    /((\.\d*?)(0+))($|e)/,
                    function () {
                      var t = arguments[2],
                        e = arguments[4];
                      return "." !== t ? t + e : e;
                    },
                  );
                default:
                  throw new Error(
                    'Unknown notation "' +
                      n +
                      '". Choose "auto", "exponential", "fixed", "bin", "oct", or "hex.',
                  );
              }
            })(t, e)
          : (function (t) {
                return (
                  (t &&
                    "object" == typeof t &&
                    "bigint" == typeof t.s &&
                    "bigint" == typeof t.n &&
                    "bigint" == typeof t.d) ||
                  !1
                );
              })(t)
            ? e && "decimal" === e.fraction
              ? t.toString()
              : "".concat(t.s * t.n, "/").concat(t.d)
            : Array.isArray(t)
              ? _i(t, e)
              : Xt(t)
                ? Fi(t)
                : "function" == typeof t
                  ? t.syntax
                    ? String(t.syntax)
                    : "function"
                  : t && "object" == typeof t
                    ? "function" == typeof t.format
                      ? t.format(e)
                      : t && t.toString(e) !== {}.toString()
                        ? t.toString(e)
                        : "{" +
                          Object.keys(t)
                            .map(n => Fi(n) + ": " + Ai(t[n], e))
                            .join(", ") +
                          "}"
                    : String(t);
    })(t, e);
    return e && "object" == typeof e && "truncate" in e && n.length > e.truncate
      ? n.substring(0, e.truncate - 3) + "..."
      : n;
  }
  function Fi(t) {
    for (var e = String(t), n = "", r = 0; r < e.length;) {
      var i = e.charAt(r);
      ((n += i in Ci ? Ci[i] : i), r++);
    }
    return '"' + n + '"';
  }
  var Ci = {
    '"': '\\"',
    "\\": "\\\\",
    "\b": "\\b",
    "\f": "\\f",
    "\n": "\\n",
    "\r": "\\r",
    "\t": "\\t",
  };
  function _i(t, e) {
    if (Array.isArray(t)) {
      for (var n = "[", r = t.length, i = 0; i < r; i++)
        (0 !== i && (n += ", "), (n += _i(t[i], e)));
      return n + "]";
    }
    return Ai(t, e);
  }
  function Ni(t, e, n) {
    if (!(this instanceof Ni))
      throw new SyntaxError("Constructor must be called with the new operator");
    ((this.actual = t),
      (this.expected = e),
      (this.relation = n),
      (this.message =
        "Dimension mismatch (" +
        (Array.isArray(t) ? "[" + t.join(", ") + "]" : t) +
        " " +
        (this.relation || "!=") +
        " " +
        (Array.isArray(e) ? "[" + e.join(", ") + "]" : e) +
        ")"),
      (this.stack = new Error().stack));
  }
  function Si(t, e, n) {
    if (!(this instanceof Si))
      throw new SyntaxError("Constructor must be called with the new operator");
    ((this.index = t),
      arguments.length < 3 ? ((this.min = 0), (this.max = e)) : ((this.min = e), (this.max = n)),
      void 0 !== this.min && this.index < this.min
        ? (this.message = "Index out of range (" + this.index + " < " + this.min + ")")
        : void 0 !== this.max && this.index >= this.max
          ? (this.message = "Index out of range (" + this.index + " > " + (this.max - 1) + ")")
          : (this.message = "Index out of range (" + this.index + ")"),
      (this.stack = new Error().stack));
  }
  function Bi(t) {
    for (var e = []; Array.isArray(t);) (e.push(t.length), (t = t[0]));
    return e;
  }
  function Mi(t, e, n) {
    var r,
      i = t.length;
    if (i !== e[n]) throw new Ni(i, e[n]);
    if (n < e.length - 1) {
      var s = n + 1;
      for (r = 0; r < i; r++) {
        var o = t[r];
        if (!Array.isArray(o)) throw new Ni(e.length - 1, e.length, "<");
        Mi(t[r], e, s);
      }
    } else
      for (r = 0; r < i; r++) if (Array.isArray(t[r])) throw new Ni(e.length + 1, e.length, ">");
  }
  function Ti(t, e) {
    if (0 === e.length) {
      if (Array.isArray(t)) throw new Ni(t.length, 0);
    } else Mi(t, e, 0);
  }
  function Li(t, e) {
    if (void 0 !== t) {
      if (!Wt(t) || !Ve(t)) throw new TypeError("Index must be an integer (value: " + t + ")");
      if (t < 0 || ("number" == typeof e && t >= e)) throw new Si(t, e);
    }
  }
  function ki(t, e, n) {
    if (!Array.isArray(e)) throw new TypeError("Array expected");
    if (0 === e.length) throw new Error("Resizing to scalar is not supported");
    return (
      e.forEach(function (t) {
        if (!Wt(t) || !Ve(t) || t < 0)
          throw new TypeError("Invalid size, must contain positive integers (size: " + Ai(e) + ")");
      }),
      (Wt(t) || Qt(t)) && (t = [t]),
      Ii(t, e, 0, void 0 !== n ? n : 0),
      t
    );
  }
  function Ii(t, e, n, r) {
    var i,
      s,
      o = t.length,
      u = e[n],
      a = Math.min(o, u);
    if (((t.length = u), n < e.length - 1)) {
      var l = n + 1;
      for (i = 0; i < a; i++)
        ((s = t[i]), Array.isArray(s) || ((s = [s]), (t[i] = s)), Ii(s, e, l, r));
      for (i = a; i < u; i++) ((s = []), (t[i] = s), Ii(s, e, l, r));
    } else {
      for (i = 0; i < a; i++) for (; Array.isArray(t[i]);) t[i] = t[i][0];
      for (i = a; i < u; i++) t[i] = r;
    }
  }
  function Oi(t, e) {
    var n = (function (t) {
        var e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
        if (!Array.isArray(t)) return t;
        if ("boolean" != typeof e)
          throw new TypeError("Boolean expected for second argument of flatten");
        var n = [];
        return (
          e
            ? (function t(e) {
                if (Array.isArray(e[0])) for (var r = 0; r < e.length; r++) t(e[r]);
                else for (var i = 0; i < e.length; i++) n.push(e[i]);
              })(t)
            : (function t(e) {
                for (var r = 0; r < e.length; r++) {
                  var i = e[r];
                  Array.isArray(i) ? t(i) : n.push(i);
                }
              })(t),
          n
        );
      })(t, !0),
      r = n.length;
    if (!Array.isArray(t) || !Array.isArray(e)) throw new TypeError("Array expected");
    if (0 === e.length) throw new Ni(0, r, "!=");
    var i = Pi((e = Ri(e, r)));
    if (r !== i) throw new Ni(i, r, "!=");
    try {
      return (function (t, e) {
        for (var n, r = t, i = e.length - 1; i > 0; i--) {
          var s = e[i];
          n = [];
          for (var o = r.length / s, u = 0; u < o; u++) n.push(r.slice(u * s, (u + 1) * s));
          r = n;
        }
        return r;
      })(n, e);
    } catch (t) {
      if (t instanceof Ni) throw new Ni(i, r, "!=");
      throw t;
    }
  }
  function Ri(t, e) {
    var n = Pi(t),
      r = t.slice(),
      i = t.indexOf(-1);
    if (t.indexOf(-1, i + 1) >= 0) throw new Error("More than one wildcard in sizes");
    if (i >= 0) {
      if (e % n !== 0)
        throw new Error("Could not replace wildcard, since " + e + " is no multiple of " + -n);
      r[i] = -e / n;
    }
    return r;
  }
  function Pi(t) {
    return t.reduce((t, e) => t * e, 1);
  }
  function $i(t, e, n, r) {
    var i = r || Bi(t);
    if (n) for (var s = 0; s < n; s++) ((t = [t]), i.unshift(1));
    for (t = Ui(t, e, 0); i.length < e;) i.push(1);
    return t;
  }
  function Ui(t, e, n) {
    var r, i;
    if (Array.isArray(t)) {
      var s = n + 1;
      for (r = 0, i = t.length; r < i; r++) t[r] = Ui(t[r], e, s);
    } else for (var o = n; o < e; o++) t = [t];
    return t;
  }
  function zi(t, e) {
    for (var n, r = 0, i = 0; i < t.length; i++) {
      var s = t[i],
        o = Array.isArray(s);
      if ((0 === i && o && (r = s.length), o && s.length !== r)) return;
      var u = o ? zi(s, e) : e(s);
      if (void 0 === n) n = u;
      else if (n !== u) return "mixed";
    }
    return n;
  }
  function Gi(t, e, n, r) {
    if (r < n) {
      if (t.length !== e.length) throw new Ni(t.length, e.length);
      for (var i = [], s = 0; s < t.length; s++) i[s] = Gi(t[s], e[s], n, r + 1);
      return i;
    }
    return t.concat(e);
  }
  function ji() {
    var t = Array.prototype.slice.call(arguments, 0, -1),
      e = Array.prototype.slice.call(arguments, -1);
    if (1 === t.length) return t[0];
    if (t.length > 1)
      return t.slice(1).reduce(function (t, n) {
        return Gi(t, n, e, 0);
      }, t[0]);
    throw new Error("Wrong number of arguments in function concat");
  }
  function qi(t, e) {
    for (var n = e.length, r = t.length, i = 0; i < r; i++) {
      var s = n - r + i;
      if ((t[i] < e[s] && t[i] > 1) || t[i] > e[s])
        throw new Error(
          "shape mismatch: mismatch is found in arg with shape ("
            .concat(t, ") not possible to broadcast dimension ")
            .concat(r, " with size ")
            .concat(t[i], " to size ")
            .concat(e[s]),
        );
    }
  }
  function Vi(t, e) {
    var n = Bi(t);
    if (Ie(n, e)) return t;
    qi(n, e);
    var r = (function () {
        for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) e[n] = arguments[n];
        for (
          var r = e.map(t => t.length), i = Math.max(...r), s = new Array(i).fill(null), o = 0;
          o < e.length;
          o++
        )
          for (var u = e[o], a = r[o], l = 0; l < a; l++) {
            var c = i - a + l;
            u[l] > s[c] && (s[c] = u[l]);
          }
        for (var p = 0; p < e.length; p++) qi(e[p], s);
        return s;
      })(n, e),
      i = r.length,
      s = [...Array(i - n.length).fill(1), ...n],
      o = (function (t) {
        return Ut([], t);
      })(t);
    n.length < i && (n = Bi((o = Oi(o, s))));
    for (var u = 0; u < i; u++) n[u] < r[u] && (n = Bi((o = Wi(o, r[u], u))));
    return o;
  }
  function Wi(t, e, n) {
    return ji(...Array(e).fill(t), n);
  }
  function Qi(t, e) {
    if (!Array.isArray(t)) throw new Error("Array expected");
    var n = Bi(t);
    if (e.length !== n.length) throw new Ni(e.length, n.length);
    for (var r = 0; r < e.length; r++) Li(e[r], n[r]);
    return e.reduce((t, e) => t[e], t);
  }
  function Hi(t, e) {
    var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
    if (0 === t.length) return [];
    if (n)
      return (function t(n) {
        if (Array.isArray(n)) {
          for (var r = n.length, i = Array(r), s = 0; s < r; s++) i[s] = t(n[s]);
          return i;
        }
        return e(n);
      })(t);
    var r = [];
    return (function n(i, s) {
      if (Array.isArray(i)) {
        for (var o = i.length, u = Array(o), a = 0; a < o; a++)
          ((r[s] = a), (u[a] = n(i[a], s + 1)));
        return u;
      }
      return e(i, r.slice(0, s), t);
    })(t, 0);
  }
  function Zi(t, e, n, r) {
    if (Ge.isTypedFunction(t)) {
      var i, s;
      if (r) i = 1;
      else {
        var o = (e.isMatrix ? e.size() : Bi(e)).map(() => 0),
          u = e.isMatrix ? e.get(o) : Qi(e, o);
        i = (function (t, e, n, r) {
          for (var i = [e, n, r], s = 3; s > 0; s--) {
            var o = i.slice(0, s);
            if (null !== Ge.resolve(t, o)) return s;
          }
        })(t, u, o, e);
      }
      if (e.isMatrix && "mixed" !== e.dataType && void 0 !== e.dataType) {
        var a = (function (t, e) {
          var n = [];
          if (
            (Object.entries(t.signatures).forEach(t => {
              var [r, i] = t;
              r.split(",").length === e && n.push(i);
            }),
            1 === n.length)
          )
            return n[0];
        })(t, i);
        s = void 0 !== a ? a : t;
      } else s = t;
      return i >= 1 && i <= 3
        ? {
            isUnary: 1 === i,
            fn: function () {
              for (var e = arguments.length, r = new Array(e), o = 0; o < e; o++)
                r[o] = arguments[o];
              return Yi(s, r.slice(0, i), n, t.name);
            },
          }
        : {
            isUnary: !1,
            fn: function () {
              for (var e = arguments.length, r = new Array(e), i = 0; i < e; i++)
                r[i] = arguments[i];
              return Yi(s, r, n, t.name);
            },
          };
    }
    return void 0 === r ? { isUnary: Ji(t), fn: t } : { isUnary: r, fn: t };
  }
  function Ji(t) {
    if (1 !== t.length) return !1;
    var e = t.toString();
    if (/arguments/.test(e)) return !1;
    var n = e.match(/\(.*?\)/);
    return !/\.\.\./.test(n);
  }
  function Yi(t, e, n, r) {
    try {
      return t(...e);
    } catch (t) {
      !(function (t, e, n, r) {
        var i;
        if (
          t instanceof TypeError &&
          "wrongType" === (null === (i = t.data) || void 0 === i ? void 0 : i.category)
        ) {
          var s = [];
          throw (
            s.push("value: ".concat(Le(e[0]))),
            e.length >= 2 && s.push("index: ".concat(Le(e[1]))),
            e.length >= 3 && s.push("array: ".concat(Le(e[2]))),
            new TypeError(
              "Function ".concat(n, " cannot apply callback arguments ") +
                "".concat(r, "(").concat(s.join(", "), ") at index ").concat(JSON.stringify(e[1])),
            )
          );
        }
        throw new TypeError(
          "Function ".concat(n, " cannot apply callback arguments ") +
            "to function ".concat(r, ": ").concat(t.message),
        );
      })(t, e, n, r);
    }
  }
  ((Ni.prototype = new RangeError()),
    (Ni.prototype.constructor = RangeError),
    (Ni.prototype.name = "DimensionError"),
    (Ni.prototype.isDimensionError = !0),
    (Si.prototype = new RangeError()),
    (Si.prototype.constructor = RangeError),
    (Si.prototype.name = "IndexError"),
    (Si.prototype.isIndexError = !0));
  var Xi = je(
    "DenseMatrix",
    ["Matrix"],
    t => {
      var { Matrix: e } = t;
      function n(t, e) {
        if (!(this instanceof n))
          throw new SyntaxError("Constructor must be called with the new operator");
        if (e && !Xt(e)) throw new Error("Invalid datatype: " + e);
        if (te(t))
          "DenseMatrix" === t.type
            ? ((this._data = ke(t._data)),
              (this._size = ke(t._size)),
              (this._datatype = e || t._datatype))
            : ((this._data = t.toArray()),
              (this._size = t.size()),
              (this._datatype = e || t._datatype));
        else if (t && Kt(t.data) && Kt(t.size))
          ((this._data = t.data),
            (this._size = t.size),
            Ti(this._data, this._size),
            (this._datatype = e || t.datatype));
        else if (Kt(t))
          ((this._data = s(t)),
            (this._size = Bi(this._data)),
            Ti(this._data, this._size),
            (this._datatype = e));
        else {
          if (t) throw new TypeError("Unsupported type of data (" + Le(t) + ")");
          ((this._data = []), (this._size = [0]), (this._datatype = e));
        }
      }
      function r(t, e, n) {
        if (0 === e.length) {
          for (var r = t._data; Kt(r);) r = r[0];
          return r;
        }
        return ((t._size = e.slice(0)), (t._data = ki(t._data, t._size, n)), t);
      }
      function i(t, e, n) {
        for (var i = t._size.slice(0), s = !1; i.length < e.length;) (i.push(0), (s = !0));
        for (var o = 0, u = e.length; o < u; o++) e[o] > i[o] && ((i[o] = e[o]), (s = !0));
        s && r(t, i, n);
      }
      function s(t) {
        return te(t) ? s(t.valueOf()) : Kt(t) ? t.map(s) : t;
      }
      return (
        (n.prototype = new e()),
        (n.prototype.createDenseMatrix = function (t, e) {
          return new n(t, e);
        }),
        Object.defineProperty(n, "name", { value: "DenseMatrix" }),
        (n.prototype.constructor = n),
        (n.prototype.type = "DenseMatrix"),
        (n.prototype.isDenseMatrix = !0),
        (n.prototype.getDataType = function () {
          return zi(this._data, Le);
        }),
        (n.prototype.storage = function () {
          return "dense";
        }),
        (n.prototype.datatype = function () {
          return this._datatype;
        }),
        (n.prototype.create = function (t, e) {
          return new n(t, e);
        }),
        (n.prototype.subset = function (t, e, r) {
          switch (arguments.length) {
            case 1:
              return (function (t, e) {
                if (!se(e)) throw new TypeError("Invalid index");
                if (e.isScalar()) return t.get(e.min());
                var r = e.size();
                if (r.length !== t._size.length) throw new Ni(r.length, t._size.length);
                for (var i = e.min(), s = e.max(), o = 0, u = t._size.length; o < u; o++)
                  (Li(i[o], t._size[o]), Li(s[o], t._size[o]));
                var a = new n([]),
                  l = (function (t, e) {
                    var n = e.size().length - 1,
                      r = Array(n);
                    return {
                      data: (function t(i) {
                        var s = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
                          o = e.dimension(s);
                        return (
                          (r[s] = o.size()[0]),
                          s < n
                            ? o.map(e => (Li(e, i.length), t(i[e], s + 1))).valueOf()
                            : o.map(t => (Li(t, i.length), i[t])).valueOf()
                        );
                      })(t),
                      size: r,
                    };
                  })(t._data, e);
                return ((a._size = l.size), (a._datatype = t._datatype), (a._data = l.data), a);
              })(this, t);
            case 2:
            case 3:
              return (function (t, e, n, r) {
                if (!e || !0 !== e.isIndex) throw new TypeError("Invalid index");
                var s,
                  o = e.size(),
                  u = e.isScalar();
                if ((te(n) ? ((s = n.size()), (n = n.valueOf())) : (s = Bi(n)), u)) {
                  if (0 !== s.length) throw new TypeError("Scalar expected");
                  t.set(e.min(), n, r);
                } else {
                  if (!Ie(s, o))
                    try {
                      s = Bi((n = 0 === s.length ? Vi([n], o) : Vi(n, o)));
                    } catch (t) {}
                  if (o.length < t._size.length) throw new Ni(o.length, t._size.length, "<");
                  if (s.length < o.length) {
                    for (var a = 0, l = 0; 1 === o[a] && 1 === s[a];) a++;
                    for (; 1 === o[a];) (l++, a++);
                    n = $i(n, o.length, l, s);
                  }
                  if (!Ie(o, s)) throw new Ni(o, s, ">");
                  var c = e.max().map(function (t) {
                    return t + 1;
                  });
                  (i(t, c, r),
                    (function (t, e, n) {
                      var r = e.size().length - 1;
                      !(function t(n, i) {
                        var s = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0,
                          o = e.dimension(s);
                        s < r
                          ? o.forEach((e, r) => {
                              (Li(e, n.length), t(n[e], i[r[0]], s + 1));
                            })
                          : o.forEach((t, e) => {
                              (Li(t, n.length), (n[t] = i[e[0]]));
                            });
                      })(t, n);
                    })(t._data, e, n));
                }
                return t;
              })(this, t, e, r);
            default:
              throw new SyntaxError("Wrong number of arguments");
          }
        }),
        (n.prototype.get = function (t) {
          return Qi(this._data, t);
        }),
        (n.prototype.set = function (t, e, n) {
          if (!Kt(t)) throw new TypeError("Array expected");
          if (t.length < this._size.length) throw new Ni(t.length, this._size.length, "<");
          var r,
            s,
            o,
            u = t.map(function (t) {
              return t + 1;
            });
          i(this, u, n);
          var a = this._data;
          for (r = 0, s = t.length - 1; r < s; r++) (Li((o = t[r]), a.length), (a = a[o]));
          return (Li((o = t[t.length - 1]), a.length), (a[o] = e), this);
        }),
        (n.prototype.resize = function (t, e, n) {
          if (!ee(t)) throw new TypeError("Array or Matrix expected");
          var i = t.valueOf().map(t => (Array.isArray(t) && 1 === t.length ? t[0] : t));
          return r(n ? this.clone() : this, i, e);
        }),
        (n.prototype.reshape = function (t, e) {
          var n = e ? this.clone() : this;
          n._data = Oi(n._data, t);
          var r = n._size.reduce((t, e) => t * e);
          return ((n._size = Ri(t, r)), n);
        }),
        (n.prototype.clone = function () {
          return new n({ data: ke(this._data), size: ke(this._size), datatype: this._datatype });
        }),
        (n.prototype.size = function () {
          return this._size.slice(0);
        }),
        (n.prototype.map = function (t) {
          var e = arguments.length > 2 && void 0 !== arguments[2] && arguments[2],
            n = this,
            r = n._size.length - 1;
          if (r < 0) return n.clone();
          var i = Zi(t, n, "map", e),
            s = i.fn,
            o = n.create(void 0, n._datatype);
          if (((o._size = n._size), e || i.isUnary))
            return (
              (o._data = (function t(e) {
                var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
                  i = Array(e.length);
                if (n < r) for (var o = 0; o < e.length; o++) i[o] = t(e[o], n + 1);
                else for (var u = 0; u < e.length; u++) i[u] = s(e[u]);
                return i;
              })(n._data)),
              o
            );
          if (0 === r) {
            for (var u = n.valueOf(), a = Array(u.length), l = 0; l < u.length; l++)
              a[l] = s(u[l], [l], n);
            return ((o._data = a), o);
          }
          var c = [];
          return (
            (o._data = (function t(e) {
              var i = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
                o = Array(e.length);
              if (i < r) for (var u = 0; u < e.length; u++) ((c[i] = u), (o[u] = t(e[u], i + 1)));
              else for (var a = 0; a < e.length; a++) ((c[i] = a), (o[a] = s(e[a], c.slice(), n)));
              return o;
            })(n._data)),
            o
          );
        }),
        (n.prototype.forEach = function (t) {
          var e = arguments.length > 2 && void 0 !== arguments[2] && arguments[2],
            n = this,
            r = n._size.length - 1;
          if (!(r < 0)) {
            var i = Zi(t, n, "map", e),
              s = i.fn;
            if (e || i.isUnary)
              !(function t(e) {
                var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
                if (n < r) for (var i = 0; i < e.length; i++) t(e[i], n + 1);
                else for (var o = 0; o < e.length; o++) s(e[o]);
              })(n._data);
            else if (0 !== r) {
              var o = [];
              !(function t(e) {
                var i = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
                if (i < r) for (var u = 0; u < e.length; u++) ((o[i] = u), t(e[u], i + 1));
                else for (var a = 0; a < e.length; a++) ((o[i] = a), s(e[a], o.slice(), n));
              })(n._data);
            } else for (var u = 0; u < n._data.length; u++) s(n._data[u], [u], n);
          }
        }),
        (n.prototype[Symbol.iterator] = function* () {
          var t = this._size.length - 1;
          if (!(t < 0))
            if (0 !== t)
              for (
                var e = Array(t + 1).fill(0), n = this._size.reduce((t, e) => t * e, 1), r = 0;
                r < n;
                r++
              ) {
                for (var i = this._data, s = 0; s < t; s++) i = i[e[s]];
                yield { value: i[e[t]], index: e.slice() };
                for (var o = t; o >= 0 && (e[o]++, !(e[o] < this._size[o])); o--) e[o] = 0;
              }
            else
              for (var u = 0; u < this._data.length; u++)
                yield { value: this._data[u], index: [u] };
        }),
        (n.prototype.rows = function () {
          var t = [];
          if (2 !== this.size().length)
            throw new TypeError("Rows can only be returned for a 2D matrix.");
          var e = this._data;
          for (var r of e) t.push(new n([r], this._datatype));
          return t;
        }),
        (n.prototype.columns = function () {
          var t = this,
            e = [],
            r = this.size();
          if (2 !== r.length) throw new TypeError("Rows can only be returned for a 2D matrix.");
          for (
            var i = this._data,
              s = function (r) {
                var s = i.map(t => [t[r]]);
                e.push(new n(s, t._datatype));
              },
              o = 0;
            o < r[1];
            o++
          )
            s(o);
          return e;
        }),
        (n.prototype.toArray = function () {
          return ke(this._data);
        }),
        (n.prototype.valueOf = function () {
          return this._data;
        }),
        (n.prototype.format = function (t) {
          return Ai(this._data, t);
        }),
        (n.prototype.toString = function () {
          return Ai(this._data);
        }),
        (n.prototype.toJSON = function () {
          return {
            mathjs: "DenseMatrix",
            data: this._data,
            size: this._size,
            datatype: this._datatype,
          };
        }),
        (n.prototype.diagonal = function (t) {
          if (t) {
            if ((Qt(t) && (t = t.toNumber()), !Wt(t) || !Ve(t)))
              throw new TypeError("The parameter k must be an integer number");
          } else t = 0;
          for (
            var e = t > 0 ? t : 0,
              r = t < 0 ? -t : 0,
              i = this._size[0],
              s = this._size[1],
              o = Math.min(i - r, s - e),
              u = [],
              a = 0;
            a < o;
            a++
          )
            u[a] = this._data[a + r][a + e];
          return new n({ data: u, size: [o], datatype: this._datatype });
        }),
        (n.diagonal = function (t, e, r, i) {
          if (!Kt(t)) throw new TypeError("Array expected, size parameter");
          if (2 !== t.length) throw new Error("Only two dimensions matrix are supported");
          if (
            ((t = t.map(function (t) {
              if ((Qt(t) && (t = t.toNumber()), !Wt(t) || !Ve(t) || t < 1))
                throw new Error("Size values must be positive integers");
              return t;
            })),
            r)
          ) {
            if ((Qt(r) && (r = r.toNumber()), !Wt(r) || !Ve(r)))
              throw new TypeError("The parameter k must be an integer number");
          } else r = 0;
          var s,
            o = r > 0 ? r : 0,
            u = r < 0 ? -r : 0,
            a = t[0],
            l = t[1],
            c = Math.min(a - u, l - o);
          if (Kt(e)) {
            if (e.length !== c) throw new Error("Invalid value array length");
            s = function (t) {
              return e[t];
            };
          } else if (te(e)) {
            var p = e.size();
            if (1 !== p.length || p[0] !== c) throw new Error("Invalid matrix length");
            s = function (t) {
              return e.get([t]);
            };
          } else
            s = function () {
              return e;
            };
          i || (i = Qt(s(0)) ? s(0).mul(0) : 0);
          var h = [];
          if (t.length > 0) {
            h = ki(h, t, i);
            for (var f = 0; f < c; f++) h[f + u][f + o] = s(f);
          }
          return new n({ data: h, size: [a, l] });
        }),
        (n.fromJSON = function (t) {
          return new n(t);
        }),
        (n.prototype.swapRows = function (t, e) {
          if (!(Wt(t) && Ve(t) && Wt(e) && Ve(e)))
            throw new Error("Row index must be positive integers");
          if (2 !== this._size.length) throw new Error("Only two dimensional matrix is supported");
          return (Li(t, this._size[0]), Li(e, this._size[0]), n._swapRows(t, e, this._data), this);
        }),
        (n._swapRows = function (t, e, n) {
          var r = n[t];
          ((n[t] = n[e]), (n[e] = r));
        }),
        n
      );
    },
    { isClass: !0 },
  );
  function Ki(t, e, n) {
    if (!n) return te(t) ? t.map(t => e(t), !1, !0) : Hi(t, e, !0);
    var r = t => (0 === t ? t : e(t));
    return te(t) ? t.map(t => r(t), !1, !0) : Hi(t, r, !0);
  }
  var ts = "number",
    es = "number, number";
  function ns(t) {
    return Math.abs(t);
  }
  function rs(t, e) {
    return t + e;
  }
  function is(t, e) {
    return t - e;
  }
  function ss(t, e) {
    return t * e;
  }
  function os(t) {
    return -t;
  }
  function us(t, e) {
    return (t * t < 1 && e === 1 / 0) || (t * t > 1 && e === -1 / 0) ? 0 : Math.pow(t, e);
  }
  function as(t, e) {
    if (e < t) return 1;
    if (e === t) return e;
    var n = (e + t) >> 1;
    return as(t, n) * as(n + 1, e);
  }
  function ls(t) {
    var e;
    if (Ve(t)) return t <= 0 ? (isFinite(t) ? 1 / 0 : NaN) : t > 171 ? 1 / 0 : as(1, t - 1);
    if (t < 0.5) return Math.PI / (Math.sin(Math.PI * t) * ls(1 - t));
    if (t >= 171.35) return 1 / 0;
    if (t > 85) {
      var n = t * t,
        r = n * t,
        i = r * t,
        s = i * t;
      return (
        Math.sqrt((2 * Math.PI) / t) *
        Math.pow(t / Math.E, t) *
        (1 +
          1 / (12 * t) +
          1 / (288 * n) -
          139 / (51840 * r) -
          571 / (2488320 * i) +
          163879 / (209018880 * s) +
          5246819 / (75246796800 * s * t))
      );
    }
    (--t, (e = ps[0]));
    for (var o = 1; o < ps.length; ++o) e += ps[o] / (t + o);
    var u = t + cs + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(u, t + 0.5) * Math.exp(-u) * e;
  }
  ((ns.signature = ts),
    (rs.signature = es),
    (is.signature = es),
    (ss.signature = es),
    (os.signature = ts),
    (us.signature = es),
    (ls.signature = "number"));
  var cs = 4.7421875,
    ps = [
      0.9999999999999971, 57.15623566586292, -59.59796035547549, 14.136097974741746,
      -0.4919138160976202, 3399464998481189e-20, 4652362892704858e-20, -9837447530487956e-20,
      0.0001580887032249125, -0.00021026444172410488, 0.00021743961811521265,
      -0.0001643181065367639, 8441822398385275e-20, -26190838401581408e-21, 36899182659531625e-22,
    ],
    hs = 0.9189385332046728,
    fs = [
      1.000000000190015, 76.18009172947146, -86.50532032941678, 24.01409824083091,
      -1.231739572450155, 0.001208650973866179, -5395239384953e-18,
    ];
  function ms(t) {
    if (t < 0) return NaN;
    if (0 === t) return 1 / 0;
    if (!isFinite(t)) return t;
    if (t < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * t)) - ms(1 - t);
    for (var e = 5 + (t -= 1) + 0.5, n = fs[0], r = 6; r >= 1; r--) n += fs[r] / (t + r);
    return hs + (t + 0.5) * Math.log(e) - e + Math.log(n);
  }
  ms.signature = "number";
  var ds = "isZero",
    gs = je(ds, ["typed", "equalScalar"], t => {
      var { typed: e, equalScalar: n } = t;
      return e(ds, {
        "number | BigNumber | Complex | Fraction": t => n(t, 0),
        bigint: t => 0n === t,
        Unit: e.referToSelf(t => n => e.find(t, n.valueType())(n.value)),
        "Array | Matrix": e.referToSelf(t => e => Ki(e, t)),
      });
    }),
    Ds = je("compareUnits", ["typed"], t => {
      var { typed: e } = t;
      return {
        "Unit, Unit": e.referToSelf(t => (n, r) => {
          if (!n.equalBase(r)) throw new Error("Cannot compare units with different base");
          return e.find(t, [n.valueType(), r.valueType()])(n.value, r.value);
        }),
      };
    }),
    ys = "equalScalar",
    vs = je(ys, ["typed", "config"], t => {
      var { typed: e, config: n } = t,
        r = Ds({ typed: e });
      return e(
        ys,
        {
          "boolean, boolean": function (t, e) {
            return t === e;
          },
          "number, number": function (t, e) {
            return tn(t, e, n.relTol, n.absTol);
          },
          "BigNumber, BigNumber": function (t, e) {
            return (
              t.eq(e) ||
              (function (t, e) {
                var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1e-9,
                  r = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 0;
                if (n <= 0) throw new Error("Relative tolerance must be greater than 0");
                if (r < 0) throw new Error("Absolute tolerance must be at least 0");
                return (
                  !t.isNaN() &&
                  !e.isNaN() &&
                  (t.isFinite() && e.isFinite()
                    ? !!t.eq(e) ||
                      t
                        .minus(e)
                        .abs()
                        .lte(t.constructor.max(t.constructor.max(t.abs(), e.abs()).mul(n), r))
                    : t.eq(e))
                );
              })(t, e, n.relTol, n.absTol)
            );
          },
          "bigint, bigint": function (t, e) {
            return t === e;
          },
          "Fraction, Fraction": function (t, e) {
            return t.equals(e);
          },
          "Complex, Complex": function (t, e) {
            return (function (t, e, n, r) {
              return tn(t.re, e.re, n, r) && tn(t.im, e.im, n, r);
            })(t, e, n.relTol, n.absTol);
          },
        },
        r,
      );
    });
  je(ys, ["typed", "config"], t => {
    var { typed: e, config: n } = t;
    return e(ys, {
      "number, number": function (t, e) {
        return tn(t, e, n.relTol, n.absTol);
      },
    });
  });
  var bs = je(
      "SparseMatrix",
      ["typed", "equalScalar", "Matrix"],
      t => {
        var { typed: e, equalScalar: n, Matrix: r } = t;
        function i(t, e) {
          if (!(this instanceof i))
            throw new SyntaxError("Constructor must be called with the new operator");
          if (e && !Xt(e)) throw new Error("Invalid datatype: " + e);
          if (te(t))
            !(function (t, e, n) {
              "SparseMatrix" === e.type
                ? ((t._values = e._values ? ke(e._values) : void 0),
                  (t._index = ke(e._index)),
                  (t._ptr = ke(e._ptr)),
                  (t._size = ke(e._size)),
                  (t._datatype = n || e._datatype))
                : s(t, e.valueOf(), n || e._datatype);
            })(this, t, e);
          else if (t && Kt(t.index) && Kt(t.ptr) && Kt(t.size))
            ((this._values = t.values),
              (this._index = t.index),
              (this._ptr = t.ptr),
              (this._size = t.size),
              (this._datatype = e || t.datatype));
          else if (Kt(t)) s(this, t, e);
          else {
            if (t) throw new TypeError("Unsupported type of data (" + Le(t) + ")");
            ((this._values = []),
              (this._index = []),
              (this._ptr = [0]),
              (this._size = [0, 0]),
              (this._datatype = e));
          }
        }
        function s(t, r, i) {
          ((t._values = []), (t._index = []), (t._ptr = []), (t._datatype = i));
          var s = r.length,
            o = 0,
            u = n,
            a = 0;
          if ((Xt(i) && ((u = e.find(n, [i, i]) || n), (a = e.convert(0, i))), s > 0)) {
            var l = 0;
            do {
              t._ptr.push(t._index.length);
              for (var c = 0; c < s; c++) {
                var p = r[c];
                if (Kt(p)) {
                  if ((0 === l && o < p.length && (o = p.length), l < p.length)) {
                    var h = p[l];
                    u(h, a) || (t._values.push(h), t._index.push(c));
                  }
                } else
                  (0 === l && o < 1 && (o = 1), u(p, a) || (t._values.push(p), t._index.push(c)));
              }
              l++;
            } while (l < o);
          }
          (t._ptr.push(t._index.length), (t._size = [s, o]));
        }
        function o(t, e, n, r) {
          if (n - e === 0) return n;
          for (var i = e; i < n; i++) if (r[i] === t) return i;
          return e;
        }
        function u(t, e, n, r, i, s, o) {
          (i.splice(t, 0, r), s.splice(t, 0, e));
          for (var u = n + 1; u < o.length; u++) o[u]++;
        }
        function a(t, r, i, s) {
          var o = s || 0,
            u = n,
            a = 0;
          Xt(t._datatype) &&
            ((u = e.find(n, [t._datatype, t._datatype]) || n),
            (a = e.convert(0, t._datatype)),
            (o = e.convert(o, t._datatype)));
          var l,
            c,
            p,
            h = !u(o, a),
            f = t._size[0],
            m = t._size[1];
          if (i > m) {
            for (c = m; c < i; c++)
              if (((t._ptr[c] = t._values.length), h))
                for (l = 0; l < f; l++) (t._values.push(o), t._index.push(l));
            t._ptr[i] = t._values.length;
          } else
            i < m &&
              (t._ptr.splice(i + 1, m - i),
              t._values.splice(t._ptr[i], t._values.length),
              t._index.splice(t._ptr[i], t._index.length));
          if (((m = i), r > f)) {
            if (h) {
              var d = 0;
              for (c = 0; c < m; c++) {
                ((t._ptr[c] = t._ptr[c] + d), (p = t._ptr[c + 1] + d));
                var g = 0;
                for (l = f; l < r; l++, g++)
                  (t._values.splice(p + g, 0, o), t._index.splice(p + g, 0, l), d++);
              }
              t._ptr[m] = t._values.length;
            }
          } else if (r < f) {
            var D = 0;
            for (c = 0; c < m; c++) {
              t._ptr[c] = t._ptr[c] - D;
              var y = t._ptr[c],
                v = t._ptr[c + 1] - D;
              for (p = y; p < v; p++)
                (l = t._index[p]) > r - 1 && (t._values.splice(p, 1), t._index.splice(p, 1), D++);
            }
            t._ptr[c] = t._values.length;
          }
          return ((t._size[0] = r), (t._size[1] = i), t);
        }
        function l(t, e, n, r, i) {
          var s,
            o,
            u = r[0],
            a = r[1],
            l = [];
          for (s = 0; s < u; s++) for (l[s] = [], o = 0; o < a; o++) l[s][o] = 0;
          for (o = 0; o < a; o++)
            for (var c = n[o], p = n[o + 1], h = c; h < p; h++)
              l[(s = e[h])][o] = t ? (i ? ke(t[h]) : t[h]) : 1;
          return l;
        }
        return (
          (i.prototype = new r()),
          (i.prototype.createSparseMatrix = function (t, e) {
            return new i(t, e);
          }),
          Object.defineProperty(i, "name", { value: "SparseMatrix" }),
          (i.prototype.constructor = i),
          (i.prototype.type = "SparseMatrix"),
          (i.prototype.isSparseMatrix = !0),
          (i.prototype.getDataType = function () {
            return zi(this._values, Le);
          }),
          (i.prototype.storage = function () {
            return "sparse";
          }),
          (i.prototype.datatype = function () {
            return this._datatype;
          }),
          (i.prototype.create = function (t, e) {
            return new i(t, e);
          }),
          (i.prototype.density = function () {
            var t = this._size[0],
              e = this._size[1];
            return 0 !== t && 0 !== e ? this._index.length / (t * e) : 0;
          }),
          (i.prototype.subset = function (t, e, n) {
            if (!this._values) throw new Error("Cannot invoke subset on a Pattern only matrix");
            switch (arguments.length) {
              case 1:
                return (function (t, e) {
                  if (!se(e)) throw new TypeError("Invalid index");
                  if (e.isScalar()) return t.get(e.min());
                  var n,
                    r,
                    s,
                    o,
                    u = e.size();
                  if (u.length !== t._size.length) throw new Ni(u.length, t._size.length);
                  var a = e.min(),
                    l = e.max();
                  for (n = 0, r = t._size.length; n < r; n++)
                    (Li(a[n], t._size[n]), Li(l[n], t._size[n]));
                  var c = t._values,
                    p = t._index,
                    h = t._ptr,
                    f = e.dimension(0),
                    m = e.dimension(1),
                    d = [],
                    g = [];
                  f.forEach(function (t, e) {
                    ((g[t] = e[0]), (d[t] = !0));
                  });
                  var D = c ? [] : void 0,
                    y = [],
                    v = [];
                  return (
                    m.forEach(function (t) {
                      for (v.push(y.length), s = h[t], o = h[t + 1]; s < o; s++)
                        ((n = p[s]), !0 === d[n] && (y.push(g[n]), D && D.push(c[s])));
                    }),
                    v.push(y.length),
                    new i({ values: D, index: y, ptr: v, size: u, datatype: t._datatype })
                  );
                })(this, t);
              case 2:
              case 3:
                return (function (t, e, n, r) {
                  if (!e || !0 !== e.isIndex) throw new TypeError("Invalid index");
                  var i,
                    s = e.size(),
                    o = e.isScalar();
                  if ((te(n) ? ((i = n.size()), (n = n.toArray())) : (i = Bi(n)), o)) {
                    if (0 !== i.length) throw new TypeError("Scalar expected");
                    t.set(e.min(), n, r);
                  } else {
                    if (1 !== s.length && 2 !== s.length)
                      throw new Ni(s.length, t._size.length, "<");
                    if (i.length < s.length) {
                      for (var u = 0, a = 0; 1 === s[u] && 1 === i[u];) u++;
                      for (; 1 === s[u];) (a++, u++);
                      n = $i(n, s.length, a, i);
                    }
                    if (!Ie(s, i)) throw new Ni(s, i, ">");
                    if (1 === s.length)
                      e.dimension(0).forEach(function (e, i) {
                        (Li(e), t.set([e, 0], n[i[0]], r));
                      });
                    else {
                      var l = e.dimension(0),
                        c = e.dimension(1);
                      l.forEach(function (e, i) {
                        (Li(e),
                          c.forEach(function (s, o) {
                            (Li(s), t.set([e, s], n[i[0]][o[0]], r));
                          }));
                      });
                    }
                  }
                  return t;
                })(this, t, e, n);
              default:
                throw new SyntaxError("Wrong number of arguments");
            }
          }),
          (i.prototype.get = function (t) {
            if (!Kt(t)) throw new TypeError("Array expected");
            if (t.length !== this._size.length) throw new Ni(t.length, this._size.length);
            if (!this._values) throw new Error("Cannot invoke get on a Pattern only matrix");
            var e = t[0],
              n = t[1];
            (Li(e, this._size[0]), Li(n, this._size[1]));
            var r = o(e, this._ptr[n], this._ptr[n + 1], this._index);
            return r < this._ptr[n + 1] && this._index[r] === e ? this._values[r] : 0;
          }),
          (i.prototype.set = function (t, r, i) {
            if (!Kt(t)) throw new TypeError("Array expected");
            if (t.length !== this._size.length) throw new Ni(t.length, this._size.length);
            if (!this._values) throw new Error("Cannot invoke set on a Pattern only matrix");
            var s = t[0],
              l = t[1],
              c = this._size[0],
              p = this._size[1],
              h = n,
              f = 0;
            (Xt(this._datatype) &&
              ((h = e.find(n, [this._datatype, this._datatype]) || n),
              (f = e.convert(0, this._datatype))),
              (s > c - 1 || l > p - 1) &&
                (a(this, Math.max(s + 1, c), Math.max(l + 1, p), i),
                (c = this._size[0]),
                (p = this._size[1])),
              Li(s, c),
              Li(l, p));
            var m = o(s, this._ptr[l], this._ptr[l + 1], this._index);
            return (
              m < this._ptr[l + 1] && this._index[m] === s
                ? h(r, f)
                  ? (function (t, e, n, r, i) {
                      (n.splice(t, 1), r.splice(t, 1));
                      for (var s = e + 1; s < i.length; s++) i[s]--;
                    })(m, l, this._values, this._index, this._ptr)
                  : (this._values[m] = r)
                : h(r, f) || u(m, s, l, r, this._values, this._index, this._ptr),
              this
            );
          }),
          (i.prototype.resize = function (t, e, n) {
            if (!ee(t)) throw new TypeError("Array or Matrix expected");
            var r = t.valueOf().map(t => (Array.isArray(t) && 1 === t.length ? t[0] : t));
            if (2 !== r.length) throw new Error("Only two dimensions matrix are supported");
            return (
              r.forEach(function (t) {
                if (!Wt(t) || !Ve(t) || t < 0)
                  throw new TypeError(
                    "Invalid size, must contain positive integers (size: " + Ai(r) + ")",
                  );
              }),
              a(n ? this.clone() : this, r[0], r[1], e)
            );
          }),
          (i.prototype.reshape = function (t, e) {
            if (!Kt(t)) throw new TypeError("Array expected");
            if (2 !== t.length)
              throw new Error("Sparse matrices can only be reshaped in two dimensions");
            t.forEach(function (e) {
              if (!Wt(e) || !Ve(e) || e <= -2 || 0 === e)
                throw new TypeError(
                  "Invalid size, must contain positive integers or -1 (size: " + Ai(t) + ")",
                );
            });
            var n = this._size[0] * this._size[1];
            if (n !== (t = Ri(t, n))[0] * t[1])
              throw new Error(
                "Reshaping sparse matrix will result in the wrong number of elements",
              );
            var r = e ? this.clone() : this;
            if (this._size[0] === t[0] && this._size[1] === t[1]) return r;
            for (var i = [], s = 0; s < r._ptr.length; s++)
              for (var a = 0; a < r._ptr[s + 1] - r._ptr[s]; a++) i.push(s);
            for (var l = r._values.slice(), c = r._index.slice(), p = 0; p < r._index.length; p++) {
              var h = c[p],
                f = i[p],
                m = h * r._size[1] + f;
              ((i[p] = m % t[1]), (c[p] = Math.floor(m / t[1])));
            }
            ((r._values.length = 0),
              (r._index.length = 0),
              (r._ptr.length = t[1] + 1),
              (r._size = t.slice()));
            for (var d = 0; d < r._ptr.length; d++) r._ptr[d] = 0;
            for (var g = 0; g < l.length; g++) {
              var D = c[g],
                y = i[g],
                v = l[g];
              u(o(D, r._ptr[y], r._ptr[y + 1], r._index), D, y, v, r._values, r._index, r._ptr);
            }
            return r;
          }),
          (i.prototype.clone = function () {
            return new i({
              values: this._values ? ke(this._values) : void 0,
              index: ke(this._index),
              ptr: ke(this._ptr),
              size: ke(this._size),
              datatype: this._datatype,
            });
          }),
          (i.prototype.size = function () {
            return this._size.slice(0);
          }),
          (i.prototype.map = function (t, r) {
            if (!this._values) throw new Error("Cannot invoke map on a Pattern only matrix");
            var s = this,
              o = this._size[0],
              u = this._size[1],
              a = Zi(t, s, "map");
            return (function (t, r, o, u, l, c, p) {
              var h = [],
                f = [],
                m = [],
                d = n,
                g = 0;
              Xt(t._datatype) &&
                ((d = e.find(n, [t._datatype, t._datatype]) || n), (g = e.convert(0, t._datatype)));
              for (
                var D = function (t, e, n) {
                    var r = (function (t, e, n) {
                      return a.fn(t, [e, n], s);
                    })(t, e, n);
                    d(r, g) || (h.push(r), f.push(e));
                  },
                  y = 0;
                y <= l;
                y++
              ) {
                m.push(h.length);
                var v = t._ptr[y],
                  b = t._ptr[y + 1];
                if (p)
                  for (var w = v; w < b; w++) {
                    var E = t._index[w];
                    E >= 0 && E <= o && D(t._values[w], E - 0, y - 0);
                  }
                else {
                  for (var x = {}, A = v; A < b; A++) x[t._index[A]] = t._values[A];
                  for (var F = 0; F <= o; F++) D(F in x ? x[F] : 0, F - 0, y - 0);
                }
              }
              return (
                m.push(h.length),
                new i({ values: h, index: f, ptr: m, size: [o - 0 + 1, l - 0 + 1] })
              );
            })(this, 0, o - 1, 0, u - 1, 0, r);
          }),
          (i.prototype.forEach = function (t, e) {
            if (!this._values) throw new Error("Cannot invoke forEach on a Pattern only matrix");
            for (
              var n = this, r = this._size[0], i = this._size[1], s = Zi(t, n, "forEach"), o = 0;
              o < i;
              o++
            ) {
              var u = this._ptr[o],
                a = this._ptr[o + 1];
              if (e)
                for (var l = u; l < a; l++) {
                  var c = this._index[l];
                  s.fn(this._values[l], [c, o], n);
                }
              else {
                for (var p = {}, h = u; h < a; h++) p[this._index[h]] = this._values[h];
                for (var f = 0; f < r; f++) {
                  var m = f in p ? p[f] : 0;
                  s.fn(m, [f, o], n);
                }
              }
            }
          }),
          (i.prototype[Symbol.iterator] = function* () {
            if (!this._values) throw new Error("Cannot iterate a Pattern only matrix");
            for (var t = this._size[1], e = 0; e < t; e++)
              for (var n = this._ptr[e], r = this._ptr[e + 1], i = n; i < r; i++) {
                var s = this._index[i];
                yield { value: this._values[i], index: [s, e] };
              }
          }),
          (i.prototype.toArray = function () {
            return l(this._values, this._index, this._ptr, this._size, !0);
          }),
          (i.prototype.valueOf = function () {
            return l(this._values, this._index, this._ptr, this._size, !1);
          }),
          (i.prototype.format = function (t) {
            for (
              var e = this._size[0],
                n = this._size[1],
                r = this.density(),
                i =
                  "Sparse Matrix [" + Ai(e, t) + " x " + Ai(n, t) + "] density: " + Ai(r, t) + "\n",
                s = 0;
              s < n;
              s++
            )
              for (var o = this._ptr[s], u = this._ptr[s + 1], a = o; a < u; a++)
                i +=
                  "\n    (" +
                  Ai(this._index[a], t) +
                  ", " +
                  Ai(s, t) +
                  ") ==> " +
                  (this._values ? Ai(this._values[a], t) : "X");
            return i;
          }),
          (i.prototype.toString = function () {
            return Ai(this.toArray());
          }),
          (i.prototype.toJSON = function () {
            return {
              mathjs: "SparseMatrix",
              values: this._values,
              index: this._index,
              ptr: this._ptr,
              size: this._size,
              datatype: this._datatype,
            };
          }),
          (i.prototype.diagonal = function (t) {
            if (t) {
              if ((Qt(t) && (t = t.toNumber()), !Wt(t) || !Ve(t)))
                throw new TypeError("The parameter k must be an integer number");
            } else t = 0;
            var e = t > 0 ? t : 0,
              n = t < 0 ? -t : 0,
              r = this._size[0],
              s = this._size[1],
              o = Math.min(r - n, s - e),
              u = [],
              a = [],
              l = [];
            l[0] = 0;
            for (var c = e; c < s && u.length < o; c++)
              for (var p = this._ptr[c], h = this._ptr[c + 1], f = p; f < h; f++) {
                var m = this._index[f];
                if (m === c - e + n) {
                  (u.push(this._values[f]), (a[u.length - 1] = m - n));
                  break;
                }
              }
            return (l.push(u.length), new i({ values: u, index: a, ptr: l, size: [o, 1] }));
          }),
          (i.fromJSON = function (t) {
            return new i(t);
          }),
          (i.diagonal = function (t, r, s, o, u) {
            if (!Kt(t)) throw new TypeError("Array expected, size parameter");
            if (2 !== t.length) throw new Error("Only two dimensions matrix are supported");
            if (
              ((t = t.map(function (t) {
                if ((Qt(t) && (t = t.toNumber()), !Wt(t) || !Ve(t) || t < 1))
                  throw new Error("Size values must be positive integers");
                return t;
              })),
              s)
            ) {
              if ((Qt(s) && (s = s.toNumber()), !Wt(s) || !Ve(s)))
                throw new TypeError("The parameter k must be an integer number");
            } else s = 0;
            var a = n,
              l = 0;
            Xt(u) && ((a = e.find(n, [u, u]) || n), (l = e.convert(0, u)));
            var c,
              p = s > 0 ? s : 0,
              h = s < 0 ? -s : 0,
              f = t[0],
              m = t[1],
              d = Math.min(f - h, m - p);
            if (Kt(r)) {
              if (r.length !== d) throw new Error("Invalid value array length");
              c = function (t) {
                return r[t];
              };
            } else if (te(r)) {
              var g = r.size();
              if (1 !== g.length || g[0] !== d) throw new Error("Invalid matrix length");
              c = function (t) {
                return r.get([t]);
              };
            } else
              c = function () {
                return r;
              };
            for (var D = [], y = [], v = [], b = 0; b < m; b++) {
              v.push(D.length);
              var w = b - p;
              if (w >= 0 && w < d) {
                var E = c(w);
                a(E, l) || (y.push(w + h), D.push(E));
              }
            }
            return (v.push(D.length), new i({ values: D, index: y, ptr: v, size: [f, m] }));
          }),
          (i.prototype.swapRows = function (t, e) {
            if (!(Wt(t) && Ve(t) && Wt(e) && Ve(e)))
              throw new Error("Row index must be positive integers");
            if (2 !== this._size.length)
              throw new Error("Only two dimensional matrix is supported");
            return (
              Li(t, this._size[0]),
              Li(e, this._size[0]),
              i._swapRows(t, e, this._size[1], this._values, this._index, this._ptr),
              this
            );
          }),
          (i._forEachRow = function (t, e, n, r, i) {
            for (var s = r[t], o = r[t + 1], u = s; u < o; u++) i(n[u], e[u]);
          }),
          (i._swapRows = function (t, e, n, r, i, s) {
            for (var u = 0; u < n; u++) {
              var a = s[u],
                l = s[u + 1],
                c = o(t, a, l, i),
                p = o(e, a, l, i);
              if (c < l && p < l && i[c] === t && i[p] === e) {
                if (r) {
                  var h = r[c];
                  ((r[c] = r[p]), (r[p] = h));
                }
              } else if (c < l && i[c] === t && (p >= l || i[p] !== e)) {
                var f = r ? r[c] : void 0;
                (i.splice(p, 0, e),
                  r && r.splice(p, 0, f),
                  i.splice(p <= c ? c + 1 : c, 1),
                  r && r.splice(p <= c ? c + 1 : c, 1));
              } else if (p < l && i[p] === e && (c >= l || i[c] !== t)) {
                var m = r ? r[p] : void 0;
                (i.splice(c, 0, t),
                  r && r.splice(c, 0, m),
                  i.splice(c <= p ? p + 1 : p, 1),
                  r && r.splice(c <= p ? p + 1 : p, 1));
              }
            }
          }),
          i
        );
      },
      { isClass: !0 },
    ),
    ws = je("number", ["typed"], t => {
      var { typed: e } = t,
        n = e("number", {
          "": function () {
            return 0;
          },
          number: function (t) {
            return t;
          },
          string: function (t) {
            if ("NaN" === t) return NaN;
            var e,
              n,
              r = (n = (e = t).match(/(0[box])([0-9a-fA-F]*)\.([0-9a-fA-F]*)/))
                ? {
                    input: e,
                    radix: { "0b": 2, "0o": 8, "0x": 16 }[n[1]],
                    integerPart: n[2],
                    fractionalPart: n[3],
                  }
                : null;
            if (r)
              return (function (t) {
                for (
                  var e = parseInt(t.integerPart, t.radix), n = 0, r = 0;
                  r < t.fractionalPart.length;
                  r++
                )
                  n += parseInt(t.fractionalPart[r], t.radix) / Math.pow(t.radix, r + 1);
                var i = e + n;
                if (isNaN(i))
                  throw new SyntaxError('String "' + t.input + '" is not a valid number');
                return i;
              })(r);
            var i = 0,
              s = t.match(/(0[box][0-9a-fA-F]*)i([0-9]*)/);
            s && ((i = Number(s[2])), (t = s[1]));
            var o = Number(t);
            if (isNaN(o)) throw new SyntaxError('String "' + t + '" is not a valid number');
            if (s) {
              if (o > 2 ** i - 1) throw new SyntaxError('String "'.concat(t, '" is out of range'));
              o >= 2 ** (i - 1) && (o -= 2 ** i);
            }
            return o;
          },
          BigNumber: function (t) {
            return t.toNumber();
          },
          bigint: function (t) {
            return Number(t);
          },
          Fraction: function (t) {
            return t.valueOf();
          },
          Unit: e.referToSelf(t => e => {
            var n = e.clone();
            return ((n.value = t(e.value)), n);
          }),
          null: function (t) {
            return 0;
          },
          "Unit, string | Unit": function (t, e) {
            return t.toNumber(e);
          },
          "Array | Matrix": e.referToSelf(t => e => Ki(e, t)),
        });
      return (
        (n.fromJSON = function (t) {
          return parseFloat(t.value);
        }),
        n
      );
    }),
    Es = je("bignumber", ["typed", "BigNumber"], t => {
      var { typed: e, BigNumber: n } = t;
      return e("bignumber", {
        "": function () {
          return new n(0);
        },
        number: function (t) {
          return new n(t + "");
        },
        string: function (t) {
          var e = t.match(/(0[box][0-9a-fA-F]*)i([0-9]*)/);
          if (e) {
            var r = e[2],
              i = n(e[1]),
              s = new n(2).pow(Number(r));
            if (i.gt(s.sub(1))) throw new SyntaxError('String "'.concat(t, '" is out of range'));
            var o = new n(2).pow(Number(r) - 1);
            return i.gte(o) ? i.sub(s) : i;
          }
          return new n(t);
        },
        BigNumber: function (t) {
          return t;
        },
        bigint: function (t) {
          return new n(t.toString());
        },
        Unit: e.referToSelf(t => e => {
          var n = e.clone();
          return ((n.value = t(e.value)), n);
        }),
        Fraction: function (t) {
          return new n(String(t.n)).div(String(t.d)).times(String(t.s));
        },
        null: function (t) {
          return new n(0);
        },
        "Array | Matrix": e.referToSelf(t => e => Ki(e, t)),
      });
    }),
    xs = je("fraction", ["typed", "Fraction"], t => {
      var { typed: e, Fraction: n } = t;
      return e("fraction", {
        number: function (t) {
          if (!isFinite(t) || isNaN(t)) throw new Error(t + " cannot be represented as a fraction");
          return new n(t);
        },
        string: function (t) {
          return new n(t);
        },
        "number, number": function (t, e) {
          return new n(t, e);
        },
        "bigint, bigint": function (t, e) {
          return new n(t, e);
        },
        null: function (t) {
          return new n(0);
        },
        BigNumber: function (t) {
          return new n(t.toString());
        },
        bigint: function (t) {
          return new n(t.toString());
        },
        Fraction: function (t) {
          return t;
        },
        Unit: e.referToSelf(t => e => {
          var n = e.clone();
          return ((n.value = t(e.value)), n);
        }),
        Object: function (t) {
          return new n(t);
        },
        "Array | Matrix": e.referToSelf(t => e => Ki(e, t)),
      });
    }),
    As = "matrix",
    Fs = je(As, ["typed", "Matrix", "DenseMatrix", "SparseMatrix"], t => {
      var { typed: e, Matrix: n, DenseMatrix: r, SparseMatrix: i } = t;
      return e(As, {
        "": function () {
          return s([]);
        },
        string: function (t) {
          return s([], t);
        },
        "string, string": function (t, e) {
          return s([], t, e);
        },
        Array: function (t) {
          return s(t);
        },
        Matrix: function (t) {
          return s(t, t.storage());
        },
        "Array | Matrix, string": s,
        "Array | Matrix, string, string": s,
      });
      function s(t, e, n) {
        if ("dense" === e || "default" === e || void 0 === e) return new r(t, n);
        if ("sparse" === e) return new i(t, n);
        throw new TypeError("Unknown matrix type " + JSON.stringify(e) + ".");
      }
    }),
    Cs = "unaryMinus",
    _s = je(Cs, ["typed"], t => {
      var { typed: e } = t;
      return e(Cs, {
        number: os,
        "Complex | BigNumber | Fraction": t => t.neg(),
        bigint: t => -t,
        Unit: e.referToSelf(t => n => {
          var r = n.clone();
          return ((r.value = e.find(t, r.valueType())(n.value)), r);
        }),
        "Array | Matrix": e.referToSelf(t => e => Ki(e, t, !0)),
      });
    }),
    Ns = je("abs", ["typed"], t => {
      var { typed: e } = t;
      return e("abs", {
        number: ns,
        "Complex | BigNumber | Fraction | Unit": t => t.abs(),
        bigint: t => (t < 0n ? -t : t),
        "Array | Matrix": e.referToSelf(t => e => Ki(e, t, !0)),
      });
    }),
    Ss = "addScalar",
    Bs = je(Ss, ["typed"], t => {
      var { typed: e } = t;
      return e(Ss, {
        "number, number": rs,
        "Complex, Complex": function (t, e) {
          return t.add(e);
        },
        "BigNumber, BigNumber": function (t, e) {
          return t.plus(e);
        },
        "bigint, bigint": function (t, e) {
          return t + e;
        },
        "Fraction, Fraction": function (t, e) {
          return t.add(e);
        },
        "Unit, Unit": e.referToSelf(t => (n, r) => {
          if (null === n.value || void 0 === n.value)
            throw new Error("Parameter x contains a unit with undefined value");
          if (null === r.value || void 0 === r.value)
            throw new Error("Parameter y contains a unit with undefined value");
          if (!n.equalBase(r)) throw new Error("Units do not match");
          var i = n.clone();
          return (
            (i.value = e.find(t, [i.valueType(), r.valueType()])(i.value, r.value)),
            (i.fixPrefix = !1),
            i
          );
        }),
      });
    }),
    Ms = "subtractScalar",
    Ts = je(Ms, ["typed"], t => {
      var { typed: e } = t;
      return e(Ms, {
        "number, number": is,
        "Complex, Complex": function (t, e) {
          return t.sub(e);
        },
        "BigNumber, BigNumber": function (t, e) {
          return t.minus(e);
        },
        "bigint, bigint": function (t, e) {
          return t - e;
        },
        "Fraction, Fraction": function (t, e) {
          return t.sub(e);
        },
        "Unit, Unit": e.referToSelf(t => (n, r) => {
          if (null === n.value || void 0 === n.value)
            throw new Error("Parameter x contains a unit with undefined value");
          if (null === r.value || void 0 === r.value)
            throw new Error("Parameter y contains a unit with undefined value");
          if (!n.equalBase(r)) throw new Error("Units do not match");
          var i = n.clone();
          return (
            (i.value = e.find(t, [i.valueType(), r.valueType()])(i.value, r.value)),
            (i.fixPrefix = !1),
            i
          );
        }),
      });
    }),
    Ls = je("matAlgo11xS0s", ["typed", "equalScalar"], t => {
      var { typed: e, equalScalar: n } = t;
      return function (t, r, i, s) {
        var o = t._values,
          u = t._index,
          a = t._ptr,
          l = t._size,
          c = t._datatype;
        if (!o)
          throw new Error("Cannot perform operation on Pattern Sparse Matrix and Scalar value");
        var p,
          h = l[0],
          f = l[1],
          m = n,
          d = 0,
          g = i;
        "string" == typeof c &&
          ((p = c),
          (m = e.find(n, [p, p])),
          (d = e.convert(0, p)),
          (r = e.convert(r, p)),
          (g = e.find(i, [p, p])));
        for (var D = [], y = [], v = [], b = 0; b < f; b++) {
          v[b] = y.length;
          for (var w = a[b], E = a[b + 1], x = w; x < E; x++) {
            var A = u[x],
              F = s ? g(r, o[x]) : g(o[x], r);
            m(F, d) || (y.push(A), D.push(F));
          }
        }
        return (
          (v[f] = y.length),
          t.createSparseMatrix({ values: D, index: y, ptr: v, size: [h, f], datatype: p })
        );
      };
    }),
    ks = je("matAlgo14xDs", ["typed"], t => {
      var { typed: e } = t;
      return function (t, r, i, s) {
        var o,
          u = t._data,
          a = t._size,
          l = t._datatype,
          c = i;
        "string" == typeof l && ((o = l), (r = e.convert(r, o)), (c = e.find(i, [o, o])));
        var p = a.length > 0 ? n(c, 0, a, a[0], u, r, s) : [];
        return t.createDenseMatrix({ data: p, size: ke(a), datatype: o });
      };
      function n(t, e, r, i, s, o, u) {
        var a = [];
        if (e === r.length - 1) for (var l = 0; l < i; l++) a[l] = u ? t(o, s[l]) : t(s[l], o);
        else for (var c = 0; c < i; c++) a[c] = n(t, e + 1, r, r[e + 1], s[c], o, u);
        return a;
      }
    }),
    Is = je("multiplyScalar", ["typed"], t => {
      var { typed: e } = t;
      return e("multiplyScalar", {
        "number, number": ss,
        "Complex, Complex": function (t, e) {
          return t.mul(e);
        },
        "BigNumber, BigNumber": function (t, e) {
          return t.times(e);
        },
        "bigint, bigint": function (t, e) {
          return t * e;
        },
        "Fraction, Fraction": function (t, e) {
          return t.mul(e);
        },
        "number | Fraction | BigNumber | Complex, Unit": (t, e) => e.multiply(t),
        "Unit, number | Fraction | BigNumber | Complex | Unit": (t, e) => t.multiply(e),
      });
    }),
    Os = "multiply",
    Rs = je(Os, ["typed", "matrix", "addScalar", "multiplyScalar", "equalScalar", "dot"], t => {
      var { typed: e, matrix: n, addScalar: r, multiplyScalar: i, equalScalar: s, dot: o } = t,
        u = Ls({ typed: e, equalScalar: s }),
        a = ks({ typed: e });
      function l(t, e) {
        switch (t.length) {
          case 1:
            switch (e.length) {
              case 1:
                if (t[0] !== e[0])
                  throw new RangeError(
                    "Dimension mismatch in multiplication. Vectors must have the same length",
                  );
                break;
              case 2:
                if (t[0] !== e[0])
                  throw new RangeError(
                    "Dimension mismatch in multiplication. Vector length (" +
                      t[0] +
                      ") must match Matrix rows (" +
                      e[0] +
                      ")",
                  );
                break;
              default:
                throw new Error(
                  "Can only multiply a 1 or 2 dimensional matrix (Matrix B has " +
                    e.length +
                    " dimensions)",
                );
            }
            break;
          case 2:
            switch (e.length) {
              case 1:
                if (t[1] !== e[0])
                  throw new RangeError(
                    "Dimension mismatch in multiplication. Matrix columns (" +
                      t[1] +
                      ") must match Vector length (" +
                      e[0] +
                      ")",
                  );
                break;
              case 2:
                if (t[1] !== e[0])
                  throw new RangeError(
                    "Dimension mismatch in multiplication. Matrix A columns (" +
                      t[1] +
                      ") must match Matrix B rows (" +
                      e[0] +
                      ")",
                  );
                break;
              default:
                throw new Error(
                  "Can only multiply a 1 or 2 dimensional matrix (Matrix B has " +
                    e.length +
                    " dimensions)",
                );
            }
            break;
          default:
            throw new Error(
              "Can only multiply a 1 or 2 dimensional matrix (Matrix A has " +
                t.length +
                " dimensions)",
            );
        }
      }
      var c = e("_multiplyMatrixVector", {
          "DenseMatrix, any": function (t, n) {
            var s,
              o = t._data,
              u = t._size,
              a = t._datatype || t.getDataType(),
              l = n._data,
              c = n._datatype || n.getDataType(),
              p = u[0],
              h = u[1],
              f = r,
              m = i;
            a &&
              c &&
              a === c &&
              "string" == typeof a &&
              "mixed" !== a &&
              ((s = a), (f = e.find(r, [s, s])), (m = e.find(i, [s, s])));
            for (var d = [], g = 0; g < p; g++) {
              for (var D = o[g], y = m(D[0], l[0]), v = 1; v < h; v++) y = f(y, m(D[v], l[v]));
              d[g] = y;
            }
            return t.createDenseMatrix({
              data: d,
              size: [p],
              datatype: a === t._datatype && c === n._datatype ? s : void 0,
            });
          },
          "SparseMatrix, any": function (t, n) {
            var o = t._values,
              u = t._index,
              a = t._ptr,
              l = t._datatype || void 0 === t._data ? t._datatype : t.getDataType();
            if (!o) throw new Error("Cannot multiply Pattern only Matrix times Dense Matrix");
            var c,
              p = n._data,
              h = n._datatype || n.getDataType(),
              f = t._size[0],
              m = n._size[0],
              d = [],
              g = [],
              D = [],
              y = r,
              v = i,
              b = s,
              w = 0;
            l &&
              h &&
              l === h &&
              "string" == typeof l &&
              "mixed" !== l &&
              ((c = l),
              (y = e.find(r, [c, c])),
              (v = e.find(i, [c, c])),
              (b = e.find(s, [c, c])),
              (w = e.convert(0, c)));
            var E = [],
              x = [];
            D[0] = 0;
            for (var A = 0; A < m; A++) {
              var F = p[A];
              if (!b(F, w))
                for (var C = a[A], _ = a[A + 1], N = C; N < _; N++) {
                  var S = u[N];
                  x[S]
                    ? (E[S] = y(E[S], v(F, o[N])))
                    : ((x[S] = !0), g.push(S), (E[S] = v(F, o[N])));
                }
            }
            for (var B = g.length, M = 0; M < B; M++) {
              var T = g[M];
              d[M] = E[T];
            }
            return (
              (D[1] = g.length),
              t.createSparseMatrix({
                values: d,
                index: g,
                ptr: D,
                size: [f, 1],
                datatype: l === t._datatype && h === n._datatype ? c : void 0,
              })
            );
          },
        }),
        p = e("_multiplyMatrixMatrix", {
          "DenseMatrix, DenseMatrix": function (t, n) {
            var s,
              o = t._data,
              u = t._size,
              a = t._datatype || t.getDataType(),
              l = n._data,
              c = n._size,
              p = n._datatype || n.getDataType(),
              h = u[0],
              f = u[1],
              m = c[1],
              d = r,
              g = i;
            a &&
              p &&
              a === p &&
              "string" == typeof a &&
              "mixed" !== a &&
              "mixed" !== a &&
              ((s = a), (d = e.find(r, [s, s])), (g = e.find(i, [s, s])));
            for (var D = [], y = 0; y < h; y++) {
              var v = o[y];
              D[y] = [];
              for (var b = 0; b < m; b++) {
                for (var w = g(v[0], l[0][b]), E = 1; E < f; E++) w = d(w, g(v[E], l[E][b]));
                D[y][b] = w;
              }
            }
            return t.createDenseMatrix({
              data: D,
              size: [h, m],
              datatype: a === t._datatype && p === n._datatype ? s : void 0,
            });
          },
          "DenseMatrix, SparseMatrix": function (t, n) {
            var o = t._data,
              u = t._size,
              a = t._datatype || t.getDataType(),
              l = n._values,
              c = n._index,
              p = n._ptr,
              h = n._size,
              f = n._datatype || void 0 === n._data ? n._datatype : n.getDataType();
            if (!l) throw new Error("Cannot multiply Dense Matrix times Pattern only Matrix");
            var m,
              d = u[0],
              g = h[1],
              D = r,
              y = i,
              v = s,
              b = 0;
            a &&
              f &&
              a === f &&
              "string" == typeof a &&
              "mixed" !== a &&
              ((m = a),
              (D = e.find(r, [m, m])),
              (y = e.find(i, [m, m])),
              (v = e.find(s, [m, m])),
              (b = e.convert(0, m)));
            for (
              var w = [],
                E = [],
                x = [],
                A = n.createSparseMatrix({
                  values: w,
                  index: E,
                  ptr: x,
                  size: [d, g],
                  datatype: a === t._datatype && f === n._datatype ? m : void 0,
                }),
                F = 0;
              F < g;
              F++
            ) {
              x[F] = E.length;
              var C = p[F],
                _ = p[F + 1];
              if (_ > C)
                for (var N = 0, S = 0; S < d; S++) {
                  for (var B = S + 1, M = void 0, T = C; T < _; T++) {
                    var L = c[T];
                    N !== B ? ((M = y(o[S][L], l[T])), (N = B)) : (M = D(M, y(o[S][L], l[T])));
                  }
                  N !== B || v(M, b) || (E.push(S), w.push(M));
                }
            }
            return ((x[g] = E.length), A);
          },
          "SparseMatrix, DenseMatrix": function (t, n) {
            var o = t._values,
              u = t._index,
              a = t._ptr,
              l = t._datatype || void 0 === t._data ? t._datatype : t.getDataType();
            if (!o) throw new Error("Cannot multiply Pattern only Matrix times Dense Matrix");
            var c,
              p = n._data,
              h = n._datatype || n.getDataType(),
              f = t._size[0],
              m = n._size[0],
              d = n._size[1],
              g = r,
              D = i,
              y = s,
              v = 0;
            l &&
              h &&
              l === h &&
              "string" == typeof l &&
              "mixed" !== l &&
              ((c = l),
              (g = e.find(r, [c, c])),
              (D = e.find(i, [c, c])),
              (y = e.find(s, [c, c])),
              (v = e.convert(0, c)));
            for (
              var b = [],
                w = [],
                E = [],
                x = t.createSparseMatrix({
                  values: b,
                  index: w,
                  ptr: E,
                  size: [f, d],
                  datatype: l === t._datatype && h === n._datatype ? c : void 0,
                }),
                A = [],
                F = [],
                C = 0;
              C < d;
              C++
            ) {
              E[C] = w.length;
              for (var _ = C + 1, N = 0; N < m; N++) {
                var S = p[N][C];
                if (!y(S, v))
                  for (var B = a[N], M = a[N + 1], T = B; T < M; T++) {
                    var L = u[T];
                    F[L] !== _
                      ? ((F[L] = _), w.push(L), (A[L] = D(S, o[T])))
                      : (A[L] = g(A[L], D(S, o[T])));
                  }
              }
              for (var k = E[C], I = w.length, O = k; O < I; O++) {
                var R = w[O];
                b[O] = A[R];
              }
            }
            return ((E[d] = w.length), x);
          },
          "SparseMatrix, SparseMatrix": function (t, n) {
            var s,
              o = t._values,
              u = t._index,
              a = t._ptr,
              l = t._datatype || void 0 === t._data ? t._datatype : t.getDataType(),
              c = n._values,
              p = n._index,
              h = n._ptr,
              f = n._datatype || void 0 === n._data ? n._datatype : n.getDataType(),
              m = t._size[0],
              d = n._size[1],
              g = o && c,
              D = r,
              y = i;
            l &&
              f &&
              l === f &&
              "string" == typeof l &&
              "mixed" !== l &&
              ((s = l), (D = e.find(r, [s, s])), (y = e.find(i, [s, s])));
            for (
              var v,
                b,
                w,
                E,
                x,
                A,
                F,
                C,
                _ = g ? [] : void 0,
                N = [],
                S = [],
                B = t.createSparseMatrix({
                  values: _,
                  index: N,
                  ptr: S,
                  size: [m, d],
                  datatype: l === t._datatype && f === n._datatype ? s : void 0,
                }),
                M = g ? [] : void 0,
                T = [],
                L = 0;
              L < d;
              L++
            ) {
              S[L] = N.length;
              var k = L + 1;
              for (x = h[L], A = h[L + 1], E = x; E < A; E++)
                if (((C = p[E]), g))
                  for (b = a[C], w = a[C + 1], v = b; v < w; v++)
                    T[(F = u[v])] !== k
                      ? ((T[F] = k), N.push(F), (M[F] = y(c[E], o[v])))
                      : (M[F] = D(M[F], y(c[E], o[v])));
                else
                  for (b = a[C], w = a[C + 1], v = b; v < w; v++)
                    T[(F = u[v])] !== k && ((T[F] = k), N.push(F));
              if (g)
                for (var I = S[L], O = N.length, R = I; R < O; R++) {
                  var P = N[R];
                  _[R] = M[P];
                }
            }
            return ((S[d] = N.length), B);
          },
        });
      return e(Os, i, {
        "Array, Array": e.referTo("Matrix, Matrix", t => (e, r) => {
          l(Bi(e), Bi(r));
          var i = t(n(e), n(r));
          return te(i) ? i.valueOf() : i;
        }),
        "Matrix, Matrix": function (t, n) {
          var s = t.size(),
            u = n.size();
          return (
            l(s, u),
            1 === s.length
              ? 1 === u.length
                ? (function (t, e, n) {
                    if (0 === n) throw new Error("Cannot multiply two empty vectors");
                    return o(t, e);
                  })(t, n, s[0])
                : (function (t, n) {
                    if ("dense" !== n.storage())
                      throw new Error("Support for SparseMatrix not implemented");
                    return (function (t, n) {
                      var s,
                        o = t._data,
                        u = t._size,
                        a = t._datatype || t.getDataType(),
                        l = n._data,
                        c = n._size,
                        p = n._datatype || n.getDataType(),
                        h = u[0],
                        f = c[1],
                        m = r,
                        d = i;
                      a &&
                        p &&
                        a === p &&
                        "string" == typeof a &&
                        "mixed" !== a &&
                        ((s = a), (m = e.find(r, [s, s])), (d = e.find(i, [s, s])));
                      for (var g = [], D = 0; D < f; D++) {
                        for (var y = d(o[0], l[0][D]), v = 1; v < h; v++)
                          y = m(y, d(o[v], l[v][D]));
                        g[D] = y;
                      }
                      return t.createDenseMatrix({
                        data: g,
                        size: [f],
                        datatype: a === t._datatype && p === n._datatype ? s : void 0,
                      });
                    })(t, n);
                  })(t, n)
              : 1 === u.length
                ? c(t, n)
                : p(t, n)
          );
        },
        "Matrix, Array": e.referTo("Matrix,Matrix", t => (e, r) => t(e, n(r))),
        "Array, Matrix": e.referToSelf(t => (e, r) => t(n(e, r.storage()), r)),
        "SparseMatrix, any": function (t, e) {
          return u(t, e, i, !1);
        },
        "DenseMatrix, any": function (t, e) {
          return a(t, e, i, !1);
        },
        "any, SparseMatrix": function (t, e) {
          return u(e, t, i, !0);
        },
        "any, DenseMatrix": function (t, e) {
          return a(e, t, i, !0);
        },
        "Array, any": function (t, e) {
          return a(n(t), e, i, !1).valueOf();
        },
        "any, Array": function (t, e) {
          return a(n(e), t, i, !0).valueOf();
        },
        "any, any": i,
        "any, any, ...any": e.referToSelf(t => (e, n, r) => {
          for (var i = t(e, n), s = 0; s < r.length; s++) i = t(i, r[s]);
          return i;
        }),
      });
    }),
    Ps = "conj",
    $s = je(Ps, ["typed"], t => {
      var { typed: e } = t;
      return e(Ps, {
        "number | BigNumber | Fraction": t => t,
        Complex: t => t.conjugate(),
        Unit: e.referToSelf(t => e => new e.constructor(t(e.toNumeric()), e.formatUnits())),
        "Array | Matrix": e.referToSelf(t => e => Ki(e, t)),
      });
    }),
    Us = "identity",
    zs = je(Us, ["typed", "config", "matrix", "BigNumber", "DenseMatrix", "SparseMatrix"], t => {
      var { typed: e, config: n, matrix: r, BigNumber: i, DenseMatrix: s, SparseMatrix: o } = t;
      return e(Us, {
        "": function () {
          return "Matrix" === n.matrix ? r([]) : [];
        },
        string: function (t) {
          return r(t);
        },
        "number | BigNumber": function (t) {
          return a(t, t, "Matrix" === n.matrix ? "dense" : void 0);
        },
        "number | BigNumber, string": function (t, e) {
          return a(t, t, e);
        },
        "number | BigNumber, number | BigNumber": function (t, e) {
          return a(t, e, "Matrix" === n.matrix ? "dense" : void 0);
        },
        "number | BigNumber, number | BigNumber, string": function (t, e, n) {
          return a(t, e, n);
        },
        Array: function (t) {
          return u(t);
        },
        "Array, string": function (t, e) {
          return u(t, e);
        },
        Matrix: function (t) {
          return u(t.valueOf(), t.storage());
        },
        "Matrix, string": function (t, e) {
          return u(t.valueOf(), e);
        },
      });
      function u(t, e) {
        switch (t.length) {
          case 0:
            return e ? r(e) : [];
          case 1:
            return a(t[0], t[0], e);
          case 2:
            return a(t[0], t[1], e);
          default:
            throw new Error("Vector containing two values expected");
        }
      }
      function a(t, e, n) {
        var r = Qt(t) || Qt(e) ? i : null;
        if ((Qt(t) && (t = t.toNumber()), Qt(e) && (e = e.toNumber()), !Ve(t) || t < 1))
          throw new Error("Parameters in function identity must be positive integers");
        if (!Ve(e) || e < 1)
          throw new Error("Parameters in function identity must be positive integers");
        var u = r ? new i(1) : 1,
          a = r ? new r(0) : 0,
          l = [t, e];
        if (n) {
          if ("sparse" === n) return o.diagonal(l, u, 0, a);
          if ("dense" === n) return s.diagonal(l, u, 0, a);
          throw new TypeError('Unknown matrix type "'.concat(n, '"'));
        }
        for (var c = ki([], l, a), p = t < e ? t : e, h = 0; h < p; h++) c[h][h] = u;
        return c;
      }
    });
  function Gs() {
    throw new Error('No "bignumber" implementation available');
  }
  function js() {
    throw new Error('No "fraction" implementation available');
  }
  var qs = "size",
    Vs = je(qs, ["typed", "config", "?matrix"], t => {
      var { typed: e, config: n, matrix: r } = t;
      return e(qs, {
        Matrix: function (t) {
          return t.create(t.size(), "number");
        },
        Array: Bi,
        string: function (t) {
          return "Array" === n.matrix ? [t.length] : r([t.length], "dense", "number");
        },
        "number | Complex | BigNumber | Unit | boolean | null": function (t) {
          return "Array" === n.matrix
            ? []
            : r
              ? r([], "dense", "number")
              : (function () {
                  throw new Error('No "matrix" implementation available');
                })();
        },
      });
    }),
    Ws = je("erf", ["typed"], t => {
      var { typed: e } = t;
      return e("name", {
        number: function (t) {
          var e = Math.abs(t);
          return e >= Ys
            ? We(t)
            : e <= Qs
              ? We(t) *
                (function (t) {
                  var e,
                    n = t * t,
                    r = Zs[0][4] * n,
                    i = n;
                  for (e = 0; e < 3; e += 1) ((r = (r + Zs[0][e]) * n), (i = (i + Js[0][e]) * n));
                  return (t * (r + Zs[0][3])) / (i + Js[0][3]);
                })(e)
              : e <= 4
                ? We(t) *
                  (1 -
                    (function (t) {
                      var e,
                        n = Zs[1][8] * t,
                        r = t;
                      for (e = 0; e < 7; e += 1)
                        ((n = (n + Zs[1][e]) * t), (r = (r + Js[1][e]) * t));
                      var i = (n + Zs[1][7]) / (r + Js[1][7]),
                        s = parseInt(16 * t) / 16,
                        o = (t - s) * (t + s);
                      return Math.exp(-s * s) * Math.exp(-o) * i;
                    })(e))
                : We(t) *
                  (1 -
                    (function (t) {
                      var e,
                        n = 1 / (t * t),
                        r = Zs[2][5] * n,
                        i = n;
                      for (e = 0; e < 4; e += 1)
                        ((r = (r + Zs[2][e]) * n), (i = (i + Js[2][e]) * n));
                      var s = (n * (r + Zs[2][4])) / (i + Js[2][4]);
                      s = (Hs - s) / t;
                      var o = (t - (n = parseInt(16 * t) / 16)) * (t + n);
                      return Math.exp(-n * n) * Math.exp(-o) * s;
                    })(e));
        },
        "Array | Matrix": e.referToSelf(t => e => Ki(e, t)),
      });
    }),
    Qs = 0.46875,
    Hs = 0.5641895835477563,
    Zs = [
      [
        3.1611237438705655, 113.86415415105016, 377.485237685302, 3209.3775891384694,
        0.18577770618460315,
      ],
      [
        0.5641884969886701, 8.883149794388377, 66.11919063714163, 298.6351381974001,
        881.952221241769, 1712.0476126340707, 2051.0783778260716, 1230.3393547979972,
        2.1531153547440383e-8,
      ],
      [
        0.30532663496123236, 0.36034489994980445, 0.12578172611122926, 0.016083785148742275,
        0.0006587491615298378, 0.016315387137302097,
      ],
    ],
    Js = [
      [23.601290952344122, 244.02463793444417, 1282.6165260773723, 2844.236833439171],
      [
        15.744926110709835, 117.6939508913125, 537.1811018620099, 1621.3895745666903,
        3290.7992357334597, 4362.619090143247, 3439.3676741437216, 1230.3393548037495,
      ],
      [
        2.568520192289822, 1.8729528499234604, 0.5279051029514285, 0.06051834131244132,
        0.0023352049762686918,
      ],
    ],
    Ys = Math.pow(2, 53),
    Xs = je("numeric", ["number", "?bignumber", "?fraction"], t => {
      var { number: e, bignumber: n, fraction: r } = t,
        i = { string: !0, number: !0, BigNumber: !0, Fraction: !0 },
        s = {
          number: t => e(t),
          BigNumber: n ? t => n(t) : Gs,
          bigint: t => BigInt(t),
          Fraction: r ? t => r(t) : js,
        };
      return function (t) {
        var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "number";
        if (void 0 !== (arguments.length > 2 ? arguments[2] : void 0))
          throw new SyntaxError("numeric() takes one or two arguments");
        var n = Le(t);
        if (!(n in i))
          throw new TypeError(
            "Cannot convert " +
              t +
              ' of type "' +
              n +
              '"; valid input types are ' +
              Object.keys(i).join(", "),
          );
        if (!(e in s))
          throw new TypeError(
            "Cannot convert " +
              t +
              ' to type "' +
              e +
              '"; valid output types are ' +
              Object.keys(s).join(", "),
          );
        return e === n ? t : s[e](t);
      };
    }),
    Ks = "divideScalar",
    to = je(Ks, ["typed", "numeric"], t => {
      var { typed: e, numeric: n } = t;
      return e(Ks, {
        "number, number": function (t, e) {
          return t / e;
        },
        "Complex, Complex": function (t, e) {
          return t.div(e);
        },
        "BigNumber, BigNumber": function (t, e) {
          return t.div(e);
        },
        "bigint, bigint": function (t, e) {
          return t / e;
        },
        "Fraction, Fraction": function (t, e) {
          return t.div(e);
        },
        "Unit, number | Complex | Fraction | BigNumber | Unit": (t, e) => t.divide(e),
        "number | Fraction | Complex | BigNumber, Unit": (t, e) => e.divideInto(t),
      });
    }),
    eo = je(
      "pow",
      ["typed", "config", "identity", "multiply", "matrix", "inv", "fraction", "number", "Complex"],
      t => {
        var {
          typed: e,
          config: n,
          identity: r,
          multiply: i,
          matrix: s,
          inv: o,
          number: u,
          fraction: a,
          Complex: l,
        } = t;
        return e("pow", {
          "number, number": c,
          "Complex, Complex": function (t, e) {
            return t.pow(e);
          },
          "BigNumber, BigNumber": function (t, e) {
            return e.isInteger() || t >= 0 || n.predictable
              ? t.pow(e)
              : new l(t.toNumber(), 0).pow(e.toNumber(), 0);
          },
          "bigint, bigint": (t, e) => t ** e,
          "Fraction, Fraction": function (t, e) {
            var r = t.pow(e);
            if (null != r) return r;
            if (n.predictable)
              throw new Error(
                "Result of pow is non-rational and cannot be expressed as a fraction",
              );
            return c(t.valueOf(), e.valueOf());
          },
          "Array, number": p,
          "Array, BigNumber": function (t, e) {
            return p(t, e.toNumber());
          },
          "Matrix, number": h,
          "Matrix, BigNumber": function (t, e) {
            return h(t, e.toNumber());
          },
          "Unit, number | BigNumber": function (t, e) {
            return t.pow(e);
          },
        });
        function c(t, e) {
          if (n.predictable && !Ve(e) && t < 0)
            try {
              var r = a(e),
                i = u(r);
              if ((e === i || Math.abs((e - i) / e) < 1e-14) && r.d % 2n == 1n)
                return (r.n % 2n == 0n ? 1 : -1) * Math.pow(-t, e);
            } catch (t) {}
          return n.predictable && ((t < -1 && e === 1 / 0) || (t > -1 && t < 0 && e === -1 / 0))
            ? NaN
            : Ve(e) || t >= 0 || n.predictable
              ? us(t, e)
              : (t * t < 1 && e === 1 / 0) || (t * t > 1 && e === -1 / 0)
                ? 0
                : new l(t, 0).pow(e, 0);
        }
        function p(t, e) {
          if (!Ve(e)) throw new TypeError("For A^b, b must be an integer (value is " + e + ")");
          var n = Bi(t);
          if (2 !== n.length)
            throw new Error("For A^b, A must be 2 dimensional (A has " + n.length + " dimensions)");
          if (n[0] !== n[1])
            throw new Error("For A^b, A must be square (size is " + n[0] + "x" + n[1] + ")");
          if (e < 0)
            try {
              return p(o(t), -e);
            } catch (t) {
              if ("Cannot calculate inverse, determinant is zero" === t.message)
                throw new TypeError(
                  "For A^b, when A is not invertible, b must be a positive integer (value is " +
                    e +
                    ")",
                );
              throw t;
            }
          for (var s = r(n[0]).valueOf(), u = t; e >= 1;)
            (1 & ~e || (s = i(u, s)), (e >>= 1), (u = i(u, u)));
          return s;
        }
        function h(t, e) {
          return s(p(t.valueOf(), e));
        }
      },
    ),
    no = je("dot", ["typed", "addScalar", "multiplyScalar", "conj", "size"], t => {
      var { typed: e, addScalar: n, multiplyScalar: r, conj: i, size: s } = t;
      return e("dot", {
        "Array | DenseMatrix, Array | DenseMatrix": function (t, s) {
          var a = o(t, s),
            l = te(t) ? t._data : t,
            c = te(t) ? t._datatype || t.getDataType() : void 0,
            p = te(s) ? s._data : s,
            h = te(s) ? s._datatype || s.getDataType() : void 0,
            f = 2 === u(t).length,
            m = 2 === u(s).length,
            d = n,
            g = r;
          if (c && h && c === h && "string" == typeof c && "mixed" !== c) {
            var D = c;
            ((d = e.find(n, [D, D])), (g = e.find(r, [D, D])));
          }
          if (!f && !m) {
            for (var y = g(i(l[0]), p[0]), v = 1; v < a; v++) y = d(y, g(i(l[v]), p[v]));
            return y;
          }
          if (!f && m) {
            for (var b = g(i(l[0]), p[0][0]), w = 1; w < a; w++) b = d(b, g(i(l[w]), p[w][0]));
            return b;
          }
          if (f && !m) {
            for (var E = g(i(l[0][0]), p[0]), x = 1; x < a; x++) E = d(E, g(i(l[x][0]), p[x]));
            return E;
          }
          if (f && m) {
            for (var A = g(i(l[0][0]), p[0][0]), F = 1; F < a; F++)
              A = d(A, g(i(l[F][0]), p[F][0]));
            return A;
          }
        },
        "SparseMatrix, SparseMatrix": function (t, e) {
          o(t, e);
          for (
            var i = t._index,
              s = t._values,
              u = e._index,
              a = e._values,
              l = 0,
              c = n,
              p = r,
              h = 0,
              f = 0;
            h < i.length && f < u.length;
          ) {
            var m = i[h],
              d = u[f];
            m < d ? h++ : m > d ? f++ : m === d && ((l = c(l, p(s[h], a[f]))), h++, f++);
          }
          return l;
        },
      });
      function o(t, e) {
        var n,
          r,
          i = u(t),
          s = u(e);
        if (1 === i.length) n = i[0];
        else {
          if (2 !== i.length || 1 !== i[1])
            throw new RangeError(
              "Expected a column vector, instead got a matrix of size (" + i.join(", ") + ")",
            );
          n = i[0];
        }
        if (1 === s.length) r = s[0];
        else {
          if (2 !== s.length || 1 !== s[1])
            throw new RangeError(
              "Expected a column vector, instead got a matrix of size (" + s.join(", ") + ")",
            );
          r = s[0];
        }
        if (n !== r)
          throw new RangeError("Vectors must have equal length (" + n + " != " + r + ")");
        if (0 === n) throw new RangeError("Cannot calculate the dot product of empty vectors");
        return n;
      }
      function u(t) {
        return te(t) ? t.size() : s(t);
      }
    }),
    ro = je(
      "det",
      ["typed", "matrix", "subtractScalar", "multiply", "divideScalar", "isZero", "unaryMinus"],
      t => {
        var {
          typed: e,
          matrix: n,
          subtractScalar: r,
          multiply: i,
          divideScalar: s,
          isZero: o,
          unaryMinus: u,
        } = t;
        return e("det", {
          any: function (t) {
            return ke(t);
          },
          "Array | Matrix": function (t) {
            var e;
            switch ((e = te(t) ? t.size() : Array.isArray(t) ? (t = n(t)).size() : []).length) {
              case 0:
                return ke(t);
              case 1:
                if (1 === e[0]) return ke(t.valueOf()[0]);
                if (0 === e[0]) return 1;
                throw new RangeError("Matrix must be square (size: " + Ai(e) + ")");
              case 2:
                var a = e[0],
                  l = e[1];
                if (a === l)
                  return (function (t, e) {
                    if (1 === e) return ke(t[0][0]);
                    if (2 === e) return r(i(t[0][0], t[1][1]), i(t[1][0], t[0][1]));
                    for (var n = !1, a = new Array(e).fill(0).map((t, e) => e), l = 0; l < e; l++) {
                      var c = a[l];
                      if (o(t[c][l])) {
                        var p = void 0;
                        for (p = l + 1; p < e; p++)
                          if (!o(t[a[p]][l])) {
                            ((c = a[p]), (a[p] = a[l]), (a[l] = c), (n = !n));
                            break;
                          }
                        if (p === e) return t[c][l];
                      }
                      for (
                        var h = t[c][l], f = 0 === l ? 1 : t[a[l - 1]][l - 1], m = l + 1;
                        m < e;
                        m++
                      )
                        for (var d = a[m], g = l + 1; g < e; g++)
                          t[d][g] = s(r(i(t[d][g], h), i(t[d][l], t[c][g])), f);
                    }
                    var D = t[a[e - 1]][e - 1];
                    return n ? u(D) : D;
                  })(t.clone().valueOf(), a);
                if (0 === l) return 1;
                throw new RangeError("Matrix must be square (size: " + Ai(e) + ")");
              default:
                throw new RangeError("Matrix must be two dimensional (size: " + Ai(e) + ")");
            }
          },
        });
      },
    ),
    io = je(
      "inv",
      [
        "typed",
        "matrix",
        "divideScalar",
        "addScalar",
        "multiply",
        "unaryMinus",
        "det",
        "identity",
        "abs",
      ],
      t => {
        var {
          typed: e,
          matrix: n,
          divideScalar: r,
          addScalar: i,
          multiply: s,
          unaryMinus: o,
          det: u,
          identity: a,
          abs: l,
        } = t;
        return e("inv", {
          "Array | Matrix": function (t) {
            var e = te(t) ? t.size() : Bi(t);
            switch (e.length) {
              case 1:
                if (1 === e[0]) return te(t) ? n([r(1, t.valueOf()[0])]) : [r(1, t[0])];
                throw new RangeError("Matrix must be square (size: " + Ai(e) + ")");
              case 2:
                var i = e[0],
                  s = e[1];
                if (i === s) return te(t) ? n(c(t.valueOf(), i, s), t.storage()) : c(t, i, s);
                throw new RangeError("Matrix must be square (size: " + Ai(e) + ")");
              default:
                throw new RangeError("Matrix must be two dimensional (size: " + Ai(e) + ")");
            }
          },
          any: function (t) {
            return r(1, t);
          },
        });
        function c(t, e, n) {
          var c, p, h, f, m;
          if (1 === e) {
            if (0 === (f = t[0][0])) throw Error("Cannot calculate inverse, determinant is zero");
            return [[r(1, f)]];
          }
          if (2 === e) {
            var d = u(t);
            if (0 === d) throw Error("Cannot calculate inverse, determinant is zero");
            return [
              [r(t[1][1], d), r(o(t[0][1]), d)],
              [r(o(t[1][0]), d), r(t[0][0], d)],
            ];
          }
          var g = t.concat();
          for (c = 0; c < e; c++) g[c] = g[c].concat();
          for (var D = a(e).valueOf(), y = 0; y < n; y++) {
            var v = l(g[y][y]),
              b = y;
            for (c = y + 1; c < e;) (l(g[c][y]) > v && ((v = l(g[c][y])), (b = c)), c++);
            if (0 === v) throw Error("Cannot calculate inverse, determinant is zero");
            (c = b) !== y &&
              ((m = g[y]), (g[y] = g[c]), (g[c] = m), (m = D[y]), (D[y] = D[c]), (D[c] = m));
            var w = g[y],
              E = D[y];
            for (c = 0; c < e; c++) {
              var x = g[c],
                A = D[c];
              if (c !== y) {
                if (0 !== x[y]) {
                  for (h = r(o(x[y]), w[y]), p = y; p < n; p++) x[p] = i(x[p], s(h, w[p]));
                  for (p = 0; p < n; p++) A[p] = i(A[p], s(h, E[p]));
                }
              } else {
                for (h = w[y], p = y; p < n; p++) x[p] = r(x[p], h);
                for (p = 0; p < n; p++) A[p] = r(A[p], h);
              }
            }
          }
          return D;
        }
      },
    ),
    so = "gamma",
    oo = je(so, ["typed", "config", "multiplyScalar", "pow", "BigNumber", "Complex"], t => {
      var { typed: e, config: n, multiplyScalar: r, pow: i, BigNumber: s, Complex: o } = t;
      return e(so, {
        number: ls,
        Complex: function t(e) {
          if (0 === e.im) return ls(e.re);
          if (e.re < 0.5) {
            var n = new o(1 - e.re, -e.im),
              r = new o(Math.PI * e.re, Math.PI * e.im);
            return new o(Math.PI).div(r.sin()).div(t(n));
          }
          e = new o(e.re - 1, e.im);
          for (var i = new o(ps[0], 0), s = 1; s < ps.length; ++s) {
            var u = new o(ps[s], 0);
            i = i.add(u.div(e.add(s)));
          }
          var a = new o(e.re + cs + 0.5, e.im),
            l = Math.sqrt(2 * Math.PI),
            c = a.pow(e.add(0.5)),
            p = a.neg().exp();
          return i.mul(l).mul(c).mul(p);
        },
        BigNumber: function (t) {
          if (t.isInteger()) return t.isNegative() || t.isZero() ? new s(1 / 0) : u(t.minus(1));
          if (!t.isFinite()) return new s(t.isNegative() ? NaN : 1 / 0);
          throw new Error("Integer BigNumber expected");
        },
      });
      function u(t) {
        if (t < 8) return new s([1, 1, 2, 6, 24, 120, 720, 5040][t]);
        var e = n.precision + (0 | Math.log(t.toNumber())),
          r = s.clone({ precision: e });
        if (t % 2 == 1) return t.times(u(new s(t - 1)));
        for (var i = t, o = new r(t), a = t.toNumber(); i > 2;) ((a += i -= 2), (o = o.times(a)));
        return new s(o.toPrecision(s.precision));
      }
    }),
    uo = "lgamma",
    ao = je(uo, ["Complex", "typed"], t => {
      var { Complex: e, typed: n } = t,
        r = [
          -0.029550653594771242, 0.00641025641025641, -0.0019175269175269176, 0.0008417508417508417,
          -0.0005952380952380953, 0.0007936507936507937, -0.002777777777777778, 0.08333333333333333,
        ];
      return n(uo, {
        number: ms,
        Complex: function t(n) {
          if (n.isNaN()) return new e(NaN, NaN);
          if (0 === n.im) return new e(ms(n.re), 0);
          if (n.re >= 7 || Math.abs(n.im) >= 7) return i(n);
          if (n.re <= 0.1) {
            var r =
                ((a = 6.283185307179586),
                (!0 ^ ((l = n.im) > 0 || (!(l < 0) && 1 / l == 1 / 0)) ? -a : a) *
                  Math.floor(0.5 * n.re + 0.25)),
              o = n.mul(Math.PI).sin().log(),
              u = t(new e(1 - n.re, -n.im));
            return new e(1.1447298858494002, r).sub(o).sub(u);
          }
          return n.im >= 0 ? s(n) : s(n.conjugate()).conjugate();
          var a, l;
        },
        BigNumber: function () {
          throw new Error(
            "mathjs doesn't yet provide an implementation of the algorithm lgamma for BigNumber",
          );
        },
      });
      function i(t) {
        for (
          var n = t.sub(0.5).mul(t.log()).sub(t).add(hs),
            i = new e(1, 0).div(t),
            s = i.div(t),
            o = r[0],
            u = r[1],
            a = 2 * s.re,
            l = s.re * s.re + s.im * s.im,
            c = 2;
          c < 8;
          c++
        ) {
          var p = u;
          ((u = -l * o + r[c]), (o = a * o + p));
        }
        var h = i.mul(s.mul(o).add(u));
        return n.add(h);
      }
      function s(t) {
        var n = 0,
          r = 0,
          s = t;
        for (t = t.add(1); t.re <= 7;) {
          var o = (s = s.mul(t)).im < 0 ? 1 : 0;
          (0 !== o && 0 === r && n++, (r = o), (t = t.add(1)));
        }
        return i(t)
          .sub(s.log())
          .sub(new e(0, 2 * n * Math.PI * 1));
      }
    }),
    lo = Vr({ config: Re }),
    co = ti({}),
    po = vi({}),
    ho = bi({}),
    fo = Xi({ Matrix: ho }),
    mo = sn({ BigNumber: lo, Complex: co, DenseMatrix: fo, Fraction: po }),
    go = Ns({ typed: mo }),
    Do = Bs({ typed: mo }),
    yo = $s({ typed: mo }),
    vo = vs({ config: Re, typed: mo }),
    bo = Ws({ typed: mo }),
    wo = gs({ equalScalar: vo, typed: mo }),
    Eo = ao({ Complex: co, typed: mo }),
    xo = Is({ typed: mo }),
    Ao = ws({ typed: mo }),
    Fo = bs({ Matrix: ho, equalScalar: vo, typed: mo }),
    Co = Ts({ typed: mo }),
    _o = Es({ BigNumber: lo, typed: mo }),
    No = Fs({ DenseMatrix: fo, Matrix: ho, SparseMatrix: Fo, typed: mo }),
    So = xs({ Fraction: po, typed: mo }),
    Bo = zs({
      BigNumber: lo,
      DenseMatrix: fo,
      SparseMatrix: Fo,
      config: Re,
      matrix: No,
      typed: mo,
    }),
    Mo = Xs({ bignumber: _o, fraction: So, number: Ao }),
    To = Vs({ matrix: No, config: Re, typed: mo }),
    Lo = _s({ typed: mo }),
    ko = to({ numeric: Mo, typed: mo }),
    Io = Rs({
      addScalar: Do,
      dot: no({ addScalar: Do, conj: yo, multiplyScalar: xo, size: To, typed: mo }),
      equalScalar: vo,
      matrix: No,
      multiplyScalar: xo,
      typed: mo,
    }),
    Oo = oo({
      BigNumber: lo,
      Complex: co,
      config: Re,
      multiplyScalar: xo,
      pow: eo({
        Complex: co,
        config: Re,
        fraction: So,
        identity: Bo,
        inv: io({
          abs: go,
          addScalar: Do,
          det: ro({
            divideScalar: ko,
            isZero: wo,
            matrix: No,
            multiply: Io,
            subtractScalar: Co,
            typed: mo,
            unaryMinus: Lo,
          }),
          divideScalar: ko,
          identity: Bo,
          matrix: No,
          multiply: Io,
          typed: mo,
          unaryMinus: Lo,
        }),
        matrix: No,
        multiply: Io,
        number: Ao,
        typed: mo,
      }),
      typed: mo,
    });
  const Ro = t => ((t.isEnvDependent = !0), t),
    Po = t => ((t.isEnvDependent = !1), t),
    $o = new Map([
      [
        "FileInput",
        t => {
          const e = t;
          return ((t.isEnvDependent = e.statements.some(t => Uo(t))), t);
        },
      ],
      ["FunctionDef", Ro],
      ["Lambda", Po],
      ["Assign", Ro],
      [
        "Return",
        t => {
          const e = t;
          return ((t.isEnvDependent = !!e.value && Uo(e.value)), t);
        },
      ],
      [
        "SimpleExpr",
        t => {
          const e = t;
          return ((t.isEnvDependent = Uo(e.expression)), t);
        },
      ],
      [
        "If",
        t => {
          const e = t,
            n = !!e.elseBlock && e.elseBlock.some(Uo);
          return ((t.isEnvDependent = Uo(e.condition) || e.body.some(t => Uo(t)) || n), t);
        },
      ],
      ["FromImport", Ro],
      ["Global", Po],
      ["Pass", Po],
      ["Break", Po],
      ["Continue", Po],
      ["Variable", Po],
      [
        "Call",
        t => {
          const e = t;
          return ((t.isEnvDependent = Uo(e.callee) || e.args.some(t => Uo(t))), t);
        },
      ],
      [
        "Starred",
        t => {
          const e = t;
          return ((t.isEnvDependent = Uo(e.value)), t);
        },
      ],
      ["Literal", Po],
      ["BigIntLiteral", Po],
      ["None", Po],
      ["Complex", Po],
      [
        "Call",
        t => {
          const e = t;
          return ((t.isEnvDependent = Uo(e.expression)), t);
        },
      ],
      [
        "Binary",
        t => {
          const e = t;
          return ((t.isEnvDependent = Uo(e.left) || Uo(e.right)), t);
        },
      ],
      [
        "Unary",
        t => {
          const e = t;
          return ((t.isEnvDependent = Uo(e.right)), t);
        },
      ],
      [
        "Compare",
        t => {
          const e = t;
          return ((t.isEnvDependent = Uo(e.left) || Uo(e.right)), t);
        },
      ],
      [
        "Ternary",
        t => {
          const e = t;
          return ((t.isEnvDependent = Uo(e.predicate) || Uo(e.consequent) || Uo(e.alternative)), t);
        },
      ],
      [
        "List",
        t => {
          const e = t;
          return ((t.isEnvDependent = e.elements.some(t => Uo(t))), t);
        },
      ],
      [
        "Subscript",
        t => {
          const e = t;
          return ((t.isEnvDependent = Uo(e.value) || Uo(e.index)), t);
        },
      ],
      [
        "StatementSequence",
        t => {
          const e = t;
          return ((t.isEnvDependent = e.body.some(t => Uo(t))), t);
        },
      ],
      [N.RESET, Po],
      [N.END_OF_FUNCTION_BODY, Po],
      [N.UNARY_OP, Po],
      [N.BINARY_OP, Po],
      [N.BOOL_OP, Po],
      [N.POP, Po],
      [N.CONTINUE_MARKER, Po],
      [N.ASSIGNMENT, Po],
      [N.ENVIRONMENT, Po],
      [N.APPLICATION, Po],
      [
        N.BRANCH,
        t => {
          const e = t;
          return ((t.isEnvDependent = Uo(e.consequent) || Uo(e.alternate)), t);
        },
      ],
      [
        "InstrType.FOR",
        t => {
          const e = t;
          return ((t.isEnvDependent = Uo({ kind: "StatementSequence", body: e.body })), t);
        },
      ],
      [
        "InstrType.WHILE",
        t => {
          const e = t;
          return ((t.isEnvDependent = Uo(e.body) || Uo(e.test)), t);
        },
      ],
    ]);
  function Uo(t) {
    if (null == t) return !1;
    if (void 0 !== t.isEnvDependent) return t.isEnvDependent;
    let e;
    if (zo(t)) zo(t) && (e = $o.get(t.instrType));
    else {
      const n = t.kind;
      e = $o.get(n);
    }
    return !!e && (e(t)?.isEnvDependent ?? !1);
  }
  const zo = t => "instrType" in t;
  function Go(t) {
    return "number" === t.type || "bigint" === t.type;
  }
  const jo = new Map(),
    qo = {
      math_e: { type: "number", value: Math.E },
      math_inf: { type: "number", value: 1 / 0 },
      math_nan: { type: "number", value: NaN },
      math_pi: { type: "number", value: Math.PI },
      math_tau: { type: "number", value: 2 * Math.PI },
    };
  class Vo {
    static math_acos(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        (s < -1 || s > 1) && G(r, new $(e, n, r, "math_acos")),
        { type: "number", value: Math.acos(s) }
      );
    }
    static math_acosh(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        s < 1 && G(r, new $(e, n, r, "math_acosh")),
        { type: "number", value: Math.acosh(s) }
      );
    }
    static math_asin(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        (s < -1 || s > 1) && G(r, new $(e, n, r, "math_asin")),
        { type: "number", value: Math.asin(s) }
      );
    }
    static math_asinh(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        { type: "number", value: Math.asinh(s) }
      );
    }
    static math_atan(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        { type: "number", value: Math.atan(s) }
      );
    }
    static math_atan2(t, e, n, r) {
      const i = t[0],
        s = t[1];
      let o, u;
      return (
        Go(s)
          ? Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int"))
          : G(r, new U(e, n, r, s.type, "float' or 'int")),
        (o = "number" === i.type ? i.value : Number(i.value)),
        (u = "number" === s.type ? s.value : Number(s.value)),
        { type: "number", value: Math.atan2(o, u) }
      );
    }
    static math_atanh(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        (s <= -1 || s >= 1) && G(r, new $(e, n, r, "math_atanh")),
        { type: "number", value: Math.atanh(s) }
      );
    }
    static math_cos(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        { type: "number", value: Math.cos(s) }
      );
    }
    static math_cosh(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        { type: "number", value: Math.cosh(s) }
      );
    }
    static math_degrees(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        { type: "number", value: (180 * s) / Math.PI }
      );
    }
    static math_erf(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        { type: "number", value: bo(s) }
      );
    }
    static math_erfc(t, e, n, r) {
      const i = t[0];
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        { type: "number", value: 1 - Vo.math_erf([t[0]], e, n, r).value }
      );
    }
    static math_comb(t, e, n, r) {
      const i = t[0],
        s = t[1];
      "bigint" !== i.type
        ? G(r, new U(e, n, r, i.type, "int"))
        : "bigint" !== s.type && G(r, new U(e, n, r, s.type, "int"));
      const o = BigInt(i.value),
        u = BigInt(s.value);
      if (((o < 0 || u < 0) && G(r, new $(e, n, r, "math_comb")), u > o))
        return { type: "bigint", value: BigInt(0) };
      let a = BigInt(1);
      const l = u > o - u ? o - u : u;
      for (let t = BigInt(0); t < l; t++) a = (a * (o - t)) / (t + BigInt(1));
      return { type: "bigint", value: a };
    }
    static math_factorial(t, e, n, r) {
      const i = t[0];
      "bigint" !== i.type && G(r, new U(e, n, r, i.type, "int"));
      const s = BigInt(i.value);
      if ((s < 0 && G(r, new $(e, n, r, "math_factorial")), s === BigInt(0)))
        return { type: "bigint", value: BigInt(1) };
      let o = BigInt(1);
      for (let t = BigInt(1); t <= s; t++) o *= t;
      return { type: "bigint", value: o };
    }
    static math_gcd(t, e, n, r) {
      if (0 === t.length) return { type: "bigint", value: BigInt(0) };
      const i = t.map(
        t => ("bigint" !== t.type && G(r, new U(e, n, r, t.type, "int")), BigInt(t.value)),
      );
      if (i.every(t => t === BigInt(0))) return { type: "bigint", value: BigInt(0) };
      let s = i[0] < 0 ? -i[0] : i[0];
      for (
        let t = 1;
        t < i.length && ((s = Vo._gcdOfTwo(s, i[t] < 0 ? -i[t] : i[t])), s !== BigInt(1));
        t++
      );
      return { type: "bigint", value: s };
    }
    static _gcdOfTwo(t, e) {
      let n = t,
        r = e;
      for (; r !== BigInt(0);) {
        const t = n % r;
        ((n = r), (r = t));
      }
      return n < 0 ? -n : n;
    }
    static math_isqrt(t, e, n, r) {
      const i = t[0];
      "bigint" !== i.type && G(r, new U(e, n, r, i.type, "int"));
      const s = i.value;
      if ((s < 0 && G(r, new $(e, n, r, "math_isqrt")), s < 2)) return { type: "bigint", value: s };
      let o = BigInt(1),
        u = s;
      for (; o < u;) {
        const t = (o + u + BigInt(1)) >> BigInt(1);
        t * t <= s ? (o = t) : (u = t - BigInt(1));
      }
      return { type: "bigint", value: o };
    }
    static math_lcm(t, e, n, r) {
      if (0 === t.length) return { type: "bigint", value: BigInt(1) };
      const i = t.map(
        t => ("bigint" !== t.type && G(r, new U(e, n, r, t.type, "int")), BigInt(t.value)),
      );
      if (i.some(t => t === BigInt(0))) return { type: "bigint", value: BigInt(0) };
      let s = Vo._absBigInt(i[0]);
      for (
        let t = 1;
        t < i.length && ((s = Vo._lcmOfTwo(s, Vo._absBigInt(i[t]))), s !== BigInt(0));
        t++
      );
      return { type: "bigint", value: s };
    }
    static _lcmOfTwo(t, e) {
      const n = Vo._gcdOfTwo(t, e);
      return BigInt((t / n) * e);
    }
    static _absBigInt(t) {
      return t < 0 ? -t : t;
    }
    static math_perm(t, e, n, r) {
      const i = t[0];
      "bigint" !== i.type && G(r, new U(e, n, r, i.type, "int"));
      const s = BigInt(i.value);
      let o = s;
      if (2 === t.length) {
        const i = t[1];
        "none" === i.type
          ? (o = s)
          : "bigint" === i.type
            ? (o = BigInt(i.value))
            : G(r, new U(e, n, r, i.type, "int' or 'None"));
      }
      if (((s < 0 || o < 0) && G(r, new $(e, n, r, "math_perm")), o > s))
        return { type: "bigint", value: BigInt(0) };
      let u = BigInt(1);
      for (let t = BigInt(0); t < o; t++) u *= s - t;
      return { type: "bigint", value: u };
    }
    static math_ceil(t, e, n, r) {
      const i = t[0];
      if ("bigint" === i.type) return i;
      if ("number" === i.type) {
        const t = i.value;
        return { type: "bigint", value: BigInt(Math.ceil(t)) };
      }
      G(r, new U(e, n, r, i.type, "float' or 'int"));
    }
    static math_fabs(t, e, n, r) {
      const i = t[0];
      if ("bigint" === i.type) {
        const t = BigInt(i.value);
        return { type: "number", value: t < 0 ? -Number(t) : Number(t) };
      }
      if ("number" === i.type) {
        const t = i.value;
        return (
          "number" != typeof t && G(r, new U(e, n, r, i.type, "float' or 'int")),
          { type: "number", value: Math.abs(t) }
        );
      }
      G(r, new U(e, n, r, i.type, "float' or 'int"));
    }
    static math_floor(t, e, n, r) {
      const i = t[0];
      if ("bigint" === i.type) return i;
      if ("number" === i.type) {
        const t = i.value;
        return (
          "number" != typeof t && G(r, new U(e, n, r, i.type, "float' or 'int")),
          { type: "bigint", value: BigInt(Math.floor(t)) }
        );
      }
      G(r, new U(e, n, r, i.type, "float' or 'int"));
    }
    static _twoProd(t, e) {
      const n = t * e,
        r = 134217729,
        i = t * r - (t * r - t),
        s = t - i,
        o = e * r - (e * r - e),
        u = e - o;
      return { prod: n, err: s * u - (n - i * o - s * o - i * u) };
    }
    static _twoSum(t, e) {
      const n = t + e,
        r = n - t;
      return { sum: n, err: t - (n - r) + (e - r) };
    }
    static _fusedMultiplyAdd(t, e, n) {
      const { prod: r, err: i } = Vo._twoProd(t, e),
        { sum: s, err: o } = Vo._twoSum(r, n);
      return s + (i + o);
    }
    static _toNumber(t, e, n, r) {
      return "bigint" === t.type
        ? Number(t.value)
        : "number" === t.type
          ? t.value
          : void G(r, new U(e, n, r, t.type, "float' or 'int"));
    }
    static math_fma(t, e, n, r) {
      const i = Vo._toNumber(t[0], e, n, r),
        s = Vo._toNumber(t[1], e, n, r),
        o = Vo._toNumber(t[2], e, n, r);
      return isNaN(i) ||
        isNaN(s) ||
        isNaN(o) ||
        (0 === i && !isFinite(s) && isNaN(o)) ||
        (0 === s && !isFinite(i) && isNaN(o))
        ? { type: "number", value: NaN }
        : { type: "number", value: Vo._fusedMultiplyAdd(i, s, o) };
    }
    static math_fmod(t, e, n, r) {
      const i = Vo._toNumber(t[0], e, n, r),
        s = Vo._toNumber(t[1], e, n, r);
      return (0 === s && G(r, new $(e, n, r, "math_fmod")), { type: "number", value: i % s });
    }
    static _roundToEven(t) {
      const e = Math.floor(t),
        n = Math.ceil(t),
        r = t - e,
        i = n - t;
      return r < i ? e : i < r ? n : e % 2 == 0 ? e : n;
    }
    static math_remainder(t, e, n, r) {
      const i = t[0],
        s = t[1];
      let o, u;
      ("bigint" === i.type
        ? (o = Number(i.value))
        : "number" === i.type
          ? (o = i.value)
          : G(r, new U(e, n, r, i.type, "float' or 'int")),
        "bigint" === s.type
          ? (u = Number(s.value))
          : "number" === s.type
            ? (u = s.value)
            : G(r, new U(e, n, r, s.type, "float' or 'int")),
        0 === u && G(r, new $(e, n, r, "math_remainder")));
      const a = o / u;
      return { type: "number", value: o - Vo._roundToEven(a) * u };
    }
    static math_trunc(t, e, n, r) {
      const i = t[0];
      if ("bigint" === i.type) return i;
      if ("number" === i.type) {
        const t = i.value;
        let s;
        return (
          "number" != typeof t && G(r, new U(e, n, r, i.type, "float' or 'int")),
          (s = 0 === t ? 0 : t < 0 ? Math.ceil(t) : Math.floor(t)),
          { type: "bigint", value: BigInt(s) }
        );
      }
      G(r, new U(e, n, r, i.type, "float' or 'int"));
    }
    static math_copysign(t, e, n, r) {
      const [i, s] = t;
      Go(i)
        ? Go(s) || G(r, new U(e, n, r, s.type, "float' or 'int"))
        : G(r, new U(e, n, r, i.type, "float' or 'int"));
      const o = Number(i.value),
        u = Number(s.value),
        a = Math.abs(o),
        l = u < 0 || Object.is(u, -0);
      return { type: "number", value: Number(l ? -a : a) };
    }
    static math_isfinite(t, e, n, r) {
      const i = t[0];
      Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int"));
      const s = Number(i.value);
      return { type: "bool", value: Number.isFinite(s) };
    }
    static math_isinf(t, e, n, r) {
      const i = t[0];
      Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int"));
      const s = Number(i.value);
      return { type: "bool", value: s === 1 / 0 || s === -1 / 0 };
    }
    static math_isnan(t, e, n, r) {
      const i = t[0];
      Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int"));
      const s = Number(i.value);
      return { type: "bool", value: Number.isNaN(s) };
    }
    static math_ldexp(t, e, n, r) {
      const i = Vo._toNumber(t[0], e, n, r);
      "bigint" !== t[1].type && G(r, new U(e, n, r, t[1].type, "int"));
      const s = t[1].value;
      return { type: "number", value: i * Math.pow(2, Number(s)) };
    }
    static math_nextafter(t, e, n, r) {
      throw new Error("math_nextafter not implemented");
    }
    static math_ulp(t, e, n, r) {
      throw new Error("math_ulp not implemented");
    }
    static math_cbrt(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        "number" !== i.type
          ? "bigint" === i.type
            ? (s = Number(i.value))
            : G(r, new U(e, n, r, i.type, "float' or 'int"))
          : (s = i.value),
        { type: "number", value: Math.cbrt(s) }
      );
    }
    static math_exp(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        "number" !== i.type
          ? "bigint" === i.type
            ? (s = Number(i.value))
            : G(r, new U(e, n, r, i.type, "float' or 'int"))
          : (s = i.value),
        { type: "number", value: Math.exp(s) }
      );
    }
    static math_exp2(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        "number" !== i.type
          ? "bigint" === i.type
            ? (s = Number(i.value))
            : G(r, new U(e, n, r, i.type, "float' or 'int"))
          : (s = i.value),
        { type: "number", value: Math.pow(2, s) }
      );
    }
    static math_expm1(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        { type: "number", value: Math.expm1(s) }
      );
    }
    static math_gamma(t, e, n, r) {
      const i = t[0];
      Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int"));
      const s = Vo._toNumber(i, e, n, r);
      return { type: "number", value: Oo(s) };
    }
    static math_lgamma(t, e, n, r) {
      const i = t[0];
      Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int"));
      const s = Vo._toNumber(i, e, n, r);
      return { type: "number", value: Eo(s) };
    }
    static math_log(t, e, n, r) {
      const i = t[0];
      let s;
      if (
        (Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        s <= 0 && G(r, new $(e, n, r, "math_log")),
        1 === t.length)
      )
        return { type: "number", value: Math.log(s) };
      const o = t[1];
      let u;
      return (
        Go(o) || G(r, new U(e, n, r, o.type, "float' or 'int")),
        (u = "number" === o.type ? o.value : Number(o.value)),
        u <= 0 && G(r, new $(e, n, r, "math_log")),
        { type: "number", value: Math.log(s) / Math.log(u) }
      );
    }
    static math_log10(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, t[0].type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        s <= 0 && G(r, new $(e, n, r, "math_log10")),
        { type: "number", value: Math.log10(s) }
      );
    }
    static math_log1p(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, t[0].type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        1 + s <= 0 && G(r, new $(e, n, r, "math_log1p")),
        { type: "number", value: Math.log1p(s) }
      );
    }
    static math_log2(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, t[0].type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        s <= 0 && G(r, new $(e, n, r, "math_log2")),
        { type: "number", value: Math.log2(s) }
      );
    }
    static math_pow(t, e, n, r) {
      const i = t[0],
        s = t[1];
      let o, u;
      return (
        Go(i)
          ? Go(s) || G(r, new U(e, n, r, s.type, "float' or 'int"))
          : G(r, new U(e, n, r, i.type, "float' or 'int")),
        (o = "number" === i.type ? i.value : Number(i.value)),
        (u = "number" === s.type ? s.value : Number(s.value)),
        { type: "number", value: Math.pow(o, u) }
      );
    }
    static math_radians(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        { type: "number", value: (s * Math.PI) / 180 }
      );
    }
    static math_sin(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        { type: "number", value: Math.sin(s) }
      );
    }
    static math_sinh(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        { type: "number", value: Math.sinh(s) }
      );
    }
    static math_tan(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        { type: "number", value: Math.tan(s) }
      );
    }
    static math_tanh(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        { type: "number", value: Math.tanh(s) }
      );
    }
    static math_sqrt(t, e, n, r) {
      const i = t[0];
      let s;
      return (
        Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int")),
        (s = "number" === i.type ? i.value : Number(i.value)),
        s < 0 && G(r, new $(e, n, r, "math_sqrt")),
        { type: "number", value: Math.sqrt(s) }
      );
    }
  }
  ($t([kt(1, 1, "math_acos", !1)], Vo, "math_acos", null),
    $t([kt(1, 1, "math_acosh", !1)], Vo, "math_acosh", null),
    $t([kt(1, 1, "math_asin", !1)], Vo, "math_asin", null),
    $t([kt(1, 1, "math_asinh", !1)], Vo, "math_asinh", null),
    $t([kt(1, 1, "math_atan", !1)], Vo, "math_atan", null),
    $t([kt(2, 2, "math_atan2", !1)], Vo, "math_atan2", null),
    $t([kt(1, 1, "math_atanh", !1)], Vo, "math_atanh", null),
    $t([kt(1, 1, "math_cos", !1)], Vo, "math_cos", null),
    $t([kt(1, 1, "math_cosh", !1)], Vo, "math_cosh", null),
    $t([kt(1, 1, "math_degrees", !1)], Vo, "math_degrees", null),
    $t([kt(1, 1, "math_erf", !1)], Vo, "math_erf", null),
    $t([kt(1, 1, "math_erfc", !1)], Vo, "math_erfc", null),
    $t([kt(2, 2, "math_comb", !1)], Vo, "math_comb", null),
    $t([kt(1, 1, "math_factorial", !1)], Vo, "math_factorial", null),
    $t([kt(1, 1, "math_isqrt", !1)], Vo, "math_isqrt", null),
    $t([kt(1, 2, "math_perm", !0)], Vo, "math_perm", null),
    $t([kt(1, 1, "math_ceil", !1)], Vo, "math_ceil", null),
    $t([kt(1, 1, "math_fabs", !1)], Vo, "math_fabs", null),
    $t([kt(1, 1, "math_floor", !1)], Vo, "math_floor", null),
    $t([kt(3, 3, "math_fma", !1)], Vo, "math_fma", null),
    $t([kt(2, 2, "math_fmod", !1)], Vo, "math_fmod", null),
    $t([kt(2, 2, "math_remainder", !1)], Vo, "math_remainder", null),
    $t([kt(1, 1, "math_trunc", !1)], Vo, "math_trunc", null),
    $t([kt(2, 2, "math_copysign", !1)], Vo, "math_copysign", null),
    $t([kt(1, 1, "math_isfinite", !1)], Vo, "math_isfinite", null),
    $t([kt(1, 1, "math_isinf", !1)], Vo, "math_isinf", null),
    $t([kt(1, 1, "math_isnan", !1)], Vo, "math_isnan", null),
    $t([kt(2, 2, "math_ldexp", !1)], Vo, "math_ldexp", null),
    $t([kt(2, 2, "math_nextafter", !1)], Vo, "math_nextafter", null),
    $t([kt(1, 1, "math_ulp", !1)], Vo, "math_ulp", null),
    $t([kt(1, 1, "math_cbrt", !1)], Vo, "math_cbrt", null),
    $t([kt(1, 1, "math_exp", !1)], Vo, "math_exp", null),
    $t([kt(1, 1, "math_exp2", !1)], Vo, "math_exp2", null),
    $t([kt(1, 1, "math_expm1", !1)], Vo, "math_expm1", null),
    $t([kt(1, 1, "math_gamma", !1)], Vo, "math_gamma", null),
    $t([kt(1, 1, "math_lgamma", !1)], Vo, "math_lgamma", null),
    $t([kt(1, 2, "math_log", !0)], Vo, "math_log", null),
    $t([kt(1, 1, "math_log10", !1)], Vo, "math_log10", null),
    $t([kt(1, 1, "math_log1p", !1)], Vo, "math_log1p", null),
    $t([kt(1, 1, "math_log2", !1)], Vo, "math_log2", null),
    $t([kt(2, 2, "math_pow", !1)], Vo, "math_pow", null),
    $t([kt(1, 1, "math_radians", !1)], Vo, "math_radians", null),
    $t([kt(1, 1, "math_sin", !1)], Vo, "math_sin", null),
    $t([kt(1, 1, "math_sinh", !1)], Vo, "math_sinh", null),
    $t([kt(1, 1, "math_tan", !1)], Vo, "math_tan", null),
    $t([kt(1, 1, "math_tanh", !1)], Vo, "math_tanh", null),
    $t([kt(1, 1, "math_sqrt", !1)], Vo, "math_sqrt", null));
  for (const t of Object.getOwnPropertyNames(Vo))
    "function" != typeof Vo[t] ||
      t.startsWith("_") ||
      jo.set(t, { type: "builtin", func: Vo[t], name: t, minArgs: Lt.get(t) || 0 });
  for (const [t, e] of Object.entries(qo)) jo.set(t, e);
  var Wo = { name: Tt.MATH, prelude: "", builtins: jo };
  function Qo(t) {
    switch (t.type) {
      case "bigint":
        return 0n === t.value;
      case "number":
        return 0 === t.value;
      case "bool":
        return !t.value;
      case "string":
        return "" === t.value;
      case "complex":
        return 0 === t.value.real && 0 == t.value.imag;
      case "none":
        return !0;
      default:
        return !1;
    }
  }
  const Ho = new Map();
  class Zo {
    static arity(t, e, n, r) {
      const i = t[0];
      if (
        ("builtin" !== i.type && "closure" !== i.type && G(r, new U(e, n, r, i.type, "function")),
        "closure" === i.type)
      ) {
        const t = i.closure.node.parameters.findIndex(t => t.isStarred);
        return -1 !== t
          ? { type: "bigint", value: BigInt(t) }
          : { type: "bigint", value: BigInt(i.closure.node.parameters.length) };
      }
      return { type: "bigint", value: BigInt(i.minArgs) };
    }
    static int(t, e, n, r) {
      if (0 === t.length) return { type: "bigint", value: BigInt(0) };
      const i = t[0];
      if (
        (Go(i) ||
          "string" === i.type ||
          "bool" === i.type ||
          G(r, new U(e, n, r, i.type, "str, int, float or bool")),
        1 === t.length)
      ) {
        if ("number" === i.type) {
          const t = Math.trunc(i.value);
          return { type: "bigint", value: BigInt(t) };
        }
        if ("bigint" === i.type) return { type: "bigint", value: i.value };
        if ("string" === i.type) {
          const t = i.value.trim().replace(/_/g, "");
          return (
            /^[+-]?\d+$/.test(t) || G(r, new $(e, n, r, "int")),
            { type: "bigint", value: BigInt(t) }
          );
        }
        return { type: "bigint", value: i.value ? BigInt(1) : BigInt(0) };
      }
      const s = t[1];
      ("string" !== i.type && G(r, new U(e, n, r, i.type, "string")),
        "bigint" !== s.type && G(r, new U(e, n, r, s.type, "int")));
      let o = Number(s.value),
        u = i.value.trim().replace(/_/g, "");
      const a = u.startsWith("-") ? -1 : 1;
      ((u.startsWith("+") || u.startsWith("-")) && (u = u.substring(1)),
        0 === o &&
          (u.startsWith("0x") || u.startsWith("0X")
            ? ((o = 16), (u = u.substring(2)))
            : u.startsWith("0o") || u.startsWith("0O")
              ? ((o = 8), (u = u.substring(2)))
              : u.startsWith("0b") || u.startsWith("0B")
                ? ((o = 2), (u = u.substring(2)))
                : (o = 10)),
        (o < 2 || o > 36) && G(r, new $(e, n, r, "int")));
      const l = "0123456789abcdefghijklmnopqrstuvwxyz".substring(0, o);
      new RegExp(`^[${l}]+$`, "i").test(u) || G(r, new $(e, n, r, "int"));
      let c = BigInt(0);
      for (const t of u) c = c * BigInt(o) + BigInt(l.indexOf(t.toLowerCase()));
      return { type: "bigint", value: BigInt(a) * c };
    }
    static float(t, e, n, r) {
      if (0 === t.length) return { type: "number", value: 0 };
      const i = t[0];
      if ("bigint" === i.type) return { type: "number", value: Number(i.value) };
      if ("number" === i.type) return { type: "number", value: i.value };
      if ("bool" === i.type) return { type: "number", value: i.value ? 1 : 0 };
      if ("string" === i.type) {
        const t = i.value.trim().replace(/_/g, "").toLowerCase(),
          s = {
            inf: 1 / 0,
            "+inf": 1 / 0,
            "-inf": -1 / 0,
            infinity: 1 / 0,
            "+infinity": 1 / 0,
            "-infinity": -1 / 0,
            nan: NaN,
            "+nan": NaN,
            "-nan": NaN,
          };
        if (t in s) return { type: "number", value: s[t] };
        const o = Number(t);
        return (isNaN(o) && G(r, new $(e, n, r, "float")), { type: "number", value: o });
      }
      G(r, new U(e, n, r, i.type, "float', 'int', 'bool' or 'str"));
    }
    static complex(t, e, n, r) {
      if (0 === t.length) return { type: "complex", value: new j(0, 0) };
      if (1 == t.length) {
        const i = t[0];
        return (
          "bigint" !== i.type &&
            "number" !== i.type &&
            "bool" !== i.type &&
            "string" !== i.type &&
            "complex" !== i.type &&
            G(r, new U(e, n, r, i.type, "complex")),
          { type: "complex", value: j.fromValue(r, e, n, i.value) }
        );
      }
      const i = t.filter(
        t =>
          "bigint" !== t.type && "number" !== t.type && "bool" !== t.type && "complex" !== t.type,
      );
      i.length > 0 && G(r, new U(e, n, r, i[0].type, "'int', 'float', 'bool' or 'complex'"));
      const [s, o] = t,
        u = j.fromValue(r, e, n, s.value),
        a = j.fromValue(r, e, n, o.value);
      return { type: "complex", value: u.add(a.mul(new j(0, 1))) };
    }
    static real(t, e, n, r) {
      const i = t[0];
      return (
        "complex" !== i.type && G(r, new U(e, n, r, i.type, "complex")),
        { type: "number", value: i.value.real }
      );
    }
    static imag(t, e, n, r) {
      const i = t[0];
      return (
        "complex" !== i.type && G(r, new U(e, n, r, i.type, "complex")),
        { type: "number", value: i.value.imag }
      );
    }
    static bool(t, e, n, r) {
      return 0 === t.length ? { type: "bool", value: !1 } : { type: "bool", value: !Qo(t[0]) };
    }
    static abs(t, e, n, r) {
      const i = t[0];
      switch (i.type) {
        case "bigint": {
          const t = i.value;
          return { type: "bigint", value: t < 0 ? -t : t };
        }
        case "number":
          return { type: "number", value: Math.abs(i.value) };
        case "complex": {
          const t = i.value.real,
            e = i.value.imag;
          return { type: "number", value: Math.sqrt(t * t + e * e) };
        }
        default:
          G(r, new U(e, n, r, t[0].type, "float', 'int' or 'complex"));
      }
    }
    static len(t, e, n, r) {
      const i = t[0];
      if ("string" === i.type || "list" === i.type)
        return { type: "bigint", value: BigInt([...i.value].length) };
      G(r, new U(e, n, r, i.type, "object with length"));
    }
    static error(t, e, n, r) {
      const i = "Error: " + t.map(t => It(t)).join(" ") + "\n";
      G(r, new z(i, n));
    }
    static max(t, e, n, r) {
      if (t.every(Go) || t.every(t => "string" === t.type)) {
        let e = 0;
        for (let n = 1; n < t.length; n++) t[n].value > t[e].value && (e = n);
        return t[e];
      }
      if (Go(t[0])) {
        const i = t.find(t => !Go(t));
        G(r, new U(e, n, r, i.type, "int' or 'float"));
      } else if ("string" === t[0].type) {
        const i = t.find(t => "string" !== t.type);
        G(r, new U(e, n, r, i.type, "str"));
      } else G(r, new U(e, n, r, t[0].type, "int', 'float' or 'str'"));
    }
    static min(t, e, n, r) {
      if (t.every(Go) || t.every(t => "string" === t.type)) {
        let e = 0;
        for (let n = 1; n < t.length; n++) t[n].value < t[e].value && (e = n);
        return t[e];
      }
      if (Go(t[0])) {
        const i = t.find(t => !Go(t));
        G(r, new U(e, n, r, i.type, "int' or 'float"));
      } else if ("string" === t[0].type) {
        const i = t.find(t => "string" !== t.type);
        G(r, new U(e, n, r, i.type, "str"));
      } else G(r, new U(e, n, r, t[0].type, "int', 'float' or 'str'"));
    }
    static random_random(t, e, n, r) {
      return { type: "number", value: Math.random() };
    }
    static round(t, e, n, r) {
      const i = t[0];
      Go(i) || G(r, new U(e, n, r, i.type, "float' or 'int"));
      let s = { value: BigInt(0) };
      if (2 !== t.length || "none" === t[1].type) {
        const t = Intl.NumberFormat("en-US", {
          roundingMode: "halfEven",
          useGrouping: !1,
          maximumFractionDigits: 0,
        }).format(i.value);
        return { type: "bigint", value: BigInt(t) };
      }
      if (
        ("bigint" !== t[1].type && G(r, new U(e, n, r, t[1].type, "int")),
        (s = t[1]),
        "number" === i.type)
      ) {
        const t = i.value;
        if (s.value >= 0) {
          const e = Intl.NumberFormat("en-US", {
            roundingMode: "halfEven",
            useGrouping: !1,
            maximumFractionDigits: Number(s.value),
          }).format(t);
          return { type: "number", value: Number(e) };
        }
        {
          const t = Intl.NumberFormat("en-US", {
            roundingMode: "halfEven",
            useGrouping: !1,
            maximumFractionDigits: 0,
          }).format(i.value / 10 ** -Number(s.value));
          return { type: "number", value: Number(t) * 10 ** -Number(s.value) };
        }
      }
      if (s.value >= 0) return i;
      {
        const t = Intl.NumberFormat("en-US", {
          roundingMode: "halfEven",
          useGrouping: !1,
          maximumFractionDigits: 0,
        }).format(Number(i.value) / 10 ** -Number(s.value));
        return { type: "bigint", value: BigInt(t) * 10n ** -s.value };
      }
    }
    static time_time(t, e, n, r) {
      return { type: "number", value: Date.now() };
    }
    static is_none(t, e, n, r) {
      return { type: "bool", value: "none" === t[0].type };
    }
    static is_float(t, e, n, r) {
      return { type: "bool", value: "number" === t[0].type };
    }
    static is_string(t, e, n, r) {
      return { type: "bool", value: "string" === t[0].type };
    }
    static is_boolean(t, e, n, r) {
      return { type: "bool", value: "bool" === t[0].type };
    }
    static is_complex(t, e, n, r) {
      return { type: "bool", value: "complex" === t[0].type };
    }
    static is_int(t, e, n, r) {
      return { type: "bool", value: "bigint" === t[0].type };
    }
    static is_function(t, e, n, r) {
      const i = t[0];
      return {
        type: "bool",
        value: "function" === i.type || "closure" === i.type || "builtin" === i.type,
      };
    }
    static async input(t, e, n, r) {
      const i = await (async t => {
        if (t.streams.initialised) {
          const e = t.streams.stdin.reader,
            { value: n } = await e.read();
          return n ?? "";
        }
        return "";
      })(r);
      return { type: "string", value: i };
    }
    static async print(t, e, n, r) {
      const i = t.map(t => It(t)).join(" ") + "\n";
      return (
        await (async (t, e) => {
          t.streams.initialised && (await t.streams.stdout.writer.write(e));
        })(r, i),
        { type: "none" }
      );
    }
    static str(t, e, n, r) {
      return 0 === t.length ? { type: "string", value: "" } : { type: "string", value: It(t[0]) };
    }
    static repr(t, e, n, r) {
      return { type: "string", value: It(t[0], !0) };
    }
  }
  ($t([kt(1, 1, "arity", !0)], Zo, "arity", null),
    $t([kt(null, 2, "int", !0)], Zo, "int", null),
    $t([kt(null, 1, "float", !0)], Zo, "float", null),
    $t([kt(null, 2, "complex", !0)], Zo, "complex", null),
    $t([kt(1, 1, "real", !0)], Zo, "real", null),
    $t([kt(1, 1, "imag", !0)], Zo, "imag", null),
    $t([kt(null, 1, "bool", !0)], Zo, "bool", null),
    $t([kt(1, 1, "abs", !1)], Zo, "abs", null),
    $t([kt(1, 1, "len", !0)], Zo, "len", null),
    $t([kt(2, null, "max", !0)], Zo, "max", null),
    $t([kt(2, null, "min", !0)], Zo, "min", null),
    $t([kt(null, 0, "random_random", !0)], Zo, "random_random", null),
    $t([kt(1, 2, "round", !0)], Zo, "round", null),
    $t([kt(null, 0, "time_time", !0)], Zo, "time_time", null),
    $t([kt(1, 1, "is_none", !0)], Zo, "is_none", null),
    $t([kt(1, 1, "is_float", !0)], Zo, "is_float", null),
    $t([kt(1, 1, "is_string", !0)], Zo, "is_string", null),
    $t([kt(1, 1, "is_boolean", !0)], Zo, "is_boolean", null),
    $t([kt(1, 1, "is_complex", !0)], Zo, "is_complex", null),
    $t([kt(1, 1, "is_int", !0)], Zo, "is_int", null),
    $t([kt(1, 1, "is_function", !0)], Zo, "is_function", null),
    $t([kt(1, 1, "repr", !0)], Zo, "repr", null));
  for (const t of Object.getOwnPropertyNames(Zo))
    "function" != typeof Zo[t] ||
      t.startsWith("_") ||
      Ho.set(t, { type: "builtin", func: Zo[t], name: t, minArgs: Lt.get(t) || 0 });
  var Jo,
    Yo = { name: Tt.MISC, prelude: "", builtins: Ho };
  !(function (t) {
    ((t[(t.NOP = 0)] = "NOP"),
      (t[(t.LDCI = 1)] = "LDCI"),
      (t[(t.LGCI = 2)] = "LGCI"),
      (t[(t.LDCF32 = 3)] = "LDCF32"),
      (t[(t.LGCF32 = 4)] = "LGCF32"),
      (t[(t.LDCF64 = 5)] = "LDCF64"),
      (t[(t.LGCF64 = 6)] = "LGCF64"),
      (t[(t.LDCB0 = 7)] = "LDCB0"),
      (t[(t.LDCB1 = 8)] = "LDCB1"),
      (t[(t.LGCB0 = 9)] = "LGCB0"),
      (t[(t.LGCB1 = 10)] = "LGCB1"),
      (t[(t.LGCU = 11)] = "LGCU"),
      (t[(t.LGCN = 12)] = "LGCN"),
      (t[(t.LGCS = 13)] = "LGCS"),
      (t[(t.POPG = 14)] = "POPG"),
      (t[(t.POPB = 15)] = "POPB"),
      (t[(t.POPF = 16)] = "POPF"),
      (t[(t.ADDG = 17)] = "ADDG"),
      (t[(t.ADDF = 18)] = "ADDF"),
      (t[(t.SUBG = 19)] = "SUBG"),
      (t[(t.SUBF = 20)] = "SUBF"),
      (t[(t.MULG = 21)] = "MULG"),
      (t[(t.MULF = 22)] = "MULF"),
      (t[(t.DIVG = 23)] = "DIVG"),
      (t[(t.DIVF = 24)] = "DIVF"),
      (t[(t.MODG = 25)] = "MODG"),
      (t[(t.MODF = 26)] = "MODF"),
      (t[(t.NOTG = 27)] = "NOTG"),
      (t[(t.NOTB = 28)] = "NOTB"),
      (t[(t.LTG = 29)] = "LTG"),
      (t[(t.LTF = 30)] = "LTF"),
      (t[(t.GTG = 31)] = "GTG"),
      (t[(t.GTF = 32)] = "GTF"),
      (t[(t.LEG = 33)] = "LEG"),
      (t[(t.LEF = 34)] = "LEF"),
      (t[(t.GEG = 35)] = "GEG"),
      (t[(t.GEF = 36)] = "GEF"),
      (t[(t.EQG = 37)] = "EQG"),
      (t[(t.EQF = 38)] = "EQF"),
      (t[(t.EQB = 39)] = "EQB"),
      (t[(t.NEWC = 40)] = "NEWC"),
      (t[(t.NEWA = 41)] = "NEWA"),
      (t[(t.LDLG = 42)] = "LDLG"),
      (t[(t.LDLF = 43)] = "LDLF"),
      (t[(t.LDLB = 44)] = "LDLB"),
      (t[(t.STLG = 45)] = "STLG"),
      (t[(t.STLB = 46)] = "STLB"),
      (t[(t.STLF = 47)] = "STLF"),
      (t[(t.LDPG = 48)] = "LDPG"),
      (t[(t.LDPF = 49)] = "LDPF"),
      (t[(t.LDPB = 50)] = "LDPB"),
      (t[(t.STPG = 51)] = "STPG"),
      (t[(t.STPB = 52)] = "STPB"),
      (t[(t.STPF = 53)] = "STPF"),
      (t[(t.LDAG = 54)] = "LDAG"),
      (t[(t.LDAB = 55)] = "LDAB"),
      (t[(t.LDAF = 56)] = "LDAF"),
      (t[(t.STAG = 57)] = "STAG"),
      (t[(t.STAB = 58)] = "STAB"),
      (t[(t.STAF = 59)] = "STAF"),
      (t[(t.BRT = 60)] = "BRT"),
      (t[(t.BRF = 61)] = "BRF"),
      (t[(t.BR = 62)] = "BR"),
      (t[(t.JMP = 63)] = "JMP"),
      (t[(t.CALL = 64)] = "CALL"),
      (t[(t.CALLT = 65)] = "CALLT"),
      (t[(t.CALLP = 66)] = "CALLP"),
      (t[(t.CALLTP = 67)] = "CALLTP"),
      (t[(t.CALLV = 68)] = "CALLV"),
      (t[(t.CALLTV = 69)] = "CALLTV"),
      (t[(t.RETG = 70)] = "RETG"),
      (t[(t.RETF = 71)] = "RETF"),
      (t[(t.RETB = 72)] = "RETB"),
      (t[(t.RETU = 73)] = "RETU"),
      (t[(t.RETN = 74)] = "RETN"),
      (t[(t.DUP = 75)] = "DUP"),
      (t[(t.NEWENV = 76)] = "NEWENV"),
      (t[(t.POPENV = 77)] = "POPENV"),
      (t[(t.NEWCP = 78)] = "NEWCP"),
      (t[(t.NEWCV = 79)] = "NEWCV"),
      (t[(t.NEGG = 80)] = "NEGG"),
      (t[(t.NEGF = 81)] = "NEGF"),
      (t[(t.NEQG = 82)] = "NEQG"),
      (t[(t.NEQF = 83)] = "NEQF"),
      (t[(t.NEQB = 84)] = "NEQB"),
      (t[(t.FLOORDIVG = 85)] = "FLOORDIVG"),
      (t[(t.FLOORDIVF = 86)] = "FLOORDIVF"),
      (t[(t.NEWITER = 87)] = "NEWITER"),
      (t[(t.FOR_ITER = 88)] = "FOR_ITER"));
  })(Jo || (Jo = {}));
  const Xo = {
    [Jo.FLOORDIVG]: "floor division (//)",
    [Jo.FLOORDIVF]: "floor division (//)",
    [Jo.NEWITER]: "for loops",
    [Jo.FOR_ITER]: "for loops",
  };
  function Ko(t) {
    const e = Xo[t],
      n = Jo[t] ?? `opcode ${t}`;
    return e
      ? `${n}: ${e} is not supported by the sinter backend`
      : `${n} (opcode ${t}) is not supported by the sinter backend`;
  }
  var tu,
    eu = Jo;
  ArrayBuffer.transfer ||
    (ArrayBuffer.transfer = (t, e) => {
      if (!(t instanceof ArrayBuffer))
        throw new TypeError("Source must be an instance of ArrayBuffer");
      if (e <= t.byteLength) return t.slice(0, e);
      const n = new Uint8Array(t),
        r = new Uint8Array(new ArrayBuffer(e));
      return (r.set(n), r.buffer);
    });
  class nu {
    constructor() {
      ((this._capacity = 32),
        (this.cursor = 0),
        (this._written = 0),
        (this._buffer = new ArrayBuffer(this._capacity)),
        (this._view = new DataView(this._buffer)));
    }
    maybeExpand(t) {
      if (!(this.cursor + t <= this._capacity)) {
        for (; this.cursor + t > this._capacity;) this._capacity *= 2;
        ((this._buffer = ArrayBuffer.transfer(this._buffer, this._capacity)),
          (this._view = new DataView(this._buffer)));
      }
    }
    updateWritten() {
      this._written = Math.max(this._written, this.cursor);
    }
    get(t, e) {
      const n = this._view[`get${t ? "I" : "Ui"}nt${e}`](this.cursor, !0);
      return ((this.cursor += e / 8), n);
    }
    getI(t) {
      return this.get(!0, t);
    }
    getU(t) {
      return this.get(!1, t);
    }
    getF(t) {
      const e = this._view[`getFloat${t}`](this.cursor, !0);
      return ((this.cursor += t / 8), e);
    }
    put(t, e, n) {
      (this.maybeExpand(n / 8),
        this._view[`set${e ? "I" : "Ui"}nt${n}`](this.cursor, t, !0),
        (this.cursor += n / 8),
        this.updateWritten());
    }
    putI(t, e) {
      this.put(e, !0, t);
    }
    putU(t, e) {
      this.put(e, !1, t);
    }
    putF(t, e) {
      (this.maybeExpand(t / 8),
        this._view[`setFloat${t}`](this.cursor, e, !0),
        (this.cursor += t / 8),
        this.updateWritten());
    }
    putA(t) {
      (this.maybeExpand(t.byteLength),
        new Uint8Array(this._buffer, this.cursor, t.byteLength).set(t),
        (this.cursor += t.byteLength),
        this.updateWritten());
    }
    align(t) {
      const e = this.cursor % t;
      0 !== e && (this.cursor += t - e);
    }
    asArray() {
      return new Uint8Array(this._buffer.slice(0, this._written));
    }
    get written() {
      return this._written;
    }
  }
  !(function (t) {
    ((t.UNDEFINED = "undefined"),
      (t.NULL = "null"),
      (t.BOOLEAN = "boolean"),
      (t.NUMBER = "number"),
      (t.STRING = "string"),
      (t.ARRAY = "array"),
      (t.CLOSURE = "closure"),
      (t.ITERATOR = "iterator"));
  })(tu || (tu = {}));
  class ru {
    constructor(t, e, n, r, i, s, o) {
      ((this.opcodes = t),
        (this.arg1s = e),
        (this.arg2s = n),
        (this.strings = r),
        (this.count = t.length),
        (this.stackSize = i),
        (this.envSize = s + o),
        (this.numArgs = o));
    }
    toInstructions() {
      const t = [];
      for (let e = 0; e < this.count; e++) {
        const n = this.opcodes[e];
        n === eu.LGCS
          ? t.push({ opcode: n, arg1: this.strings[this.arg1s[e]] })
          : t.push({ opcode: n, arg1: this.arg1s[e], arg2: this.arg2s[e] });
      }
      return t;
    }
  }
  class iu {
    constructor(t, e) {
      ((this.entryPoint = t), (this.functions = Object.freeze([...e])), Object.freeze(this));
    }
    withSpecializedFunction(t, e) {
      const n = [...this.functions];
      return ((n[t] = e), new iu(this.entryPoint, n));
    }
  }
  let su;
  function ou(t, e) {
    void 0 === su && (su = new TextEncoder());
    const n = su.encode(e);
    (t.align(4), t.putU(16, 1), t.putU(32, n.byteLength + 1), t.putA(n), t.putU(8, 0));
  }
  class uu extends Error {
    constructor(t) {
      (super(t), (this.name = "SVMLCompilerError"));
    }
  }
  class au {
    constructor(t) {
      ((this.children = []),
        (this.ops = []),
        (this.a1s = []),
        (this.a2s = []),
        (this.strings = []),
        (this.labelPositions = []),
        (this.fixups = []),
        (this.maxStackDepth = 0),
        (this.currentStackDepth = 0),
        (this.symbolCount = 0),
        (this.numArgs = 0),
        (this.lastLabelId = 0),
        (this.numArgs = t),
        (this.functionIndex = au._functionIndex++));
    }
    static resetIndex() {
      au._functionIndex = 0;
    }
    getFunctionIndex() {
      return this.functionIndex;
    }
    createChildBuilder(t) {
      const e = new au(t);
      return (this.children.push(e), e);
    }
    getAllBuilders(t = !1) {
      const e = [this, ...this.children.flatMap(t => t.getAllBuilders())];
      return t ? e.sort((t, e) => t.getFunctionIndex() - e.getFunctionIndex()) : e;
    }
    emitNullary(t) {
      (this.ops.push(t), this.a1s.push(0), this.a2s.push(0), this.updateStackDepth(t));
    }
    emitUnary(t, e) {
      (this.ops.push(t),
        "string" == typeof e
          ? (this.a1s.push(this.strings.length), this.strings.push(e))
          : this.a1s.push(e),
        this.a2s.push(0),
        this.updateStackDepth(t));
    }
    emitBinary(t, e, n) {
      (this.ops.push(t), this.a1s.push(e), this.a2s.push(n), this.updateStackDepth(t));
    }
    getNextLabel() {
      return this.lastLabelId++;
    }
    emitJump(t, e) {
      void 0 === e && (e = this.getNextLabel());
      const n = this.ops.length;
      return (
        this.fixups.push({ instrIndex: n, labelId: e }),
        this.ops.push(t),
        this.a1s.push(0),
        this.a2s.push(0),
        this.updateStackDepth(t),
        e
      );
    }
    markLabel(t) {
      return (
        void 0 === t && (t = this.getNextLabel()),
        (this.labelPositions[t] = this.ops.length),
        t
      );
    }
    emitPrimitiveCall(t, e, n) {
      (this.ops.push(t),
        this.a1s.push(e),
        this.a2s.push(n),
        (this.currentStackDepth = this.currentStackDepth - n + 1),
        this.currentStackDepth > this.maxStackDepth &&
          (this.maxStackDepth = this.currentStackDepth));
    }
    emitCall(t, e) {
      (this.ops.push(t),
        this.a1s.push(e),
        this.a2s.push(0),
        (this.currentStackDepth = this.currentStackDepth - e),
        this.currentStackDepth > this.maxStackDepth &&
          (this.maxStackDepth = this.currentStackDepth));
    }
    updateStackDepth(t) {
      ((this.currentStackDepth += lu[t]),
        this.currentStackDepth > this.maxStackDepth &&
          (this.maxStackDepth = this.currentStackDepth));
    }
    noteSymbolUsed() {
      this.symbolCount++;
    }
    build(t) {
      const e = this.ops.length,
        n = new Int32Array(e),
        r = new Float64Array(e),
        i = new Int32Array(e);
      for (let t = 0; t < e; t++)
        ((n[t] = this.ops[t]), (r[t] = this.a1s[t]), (i[t] = this.a2s[t]));
      for (const { instrIndex: t, labelId: e } of this.fixups) {
        const n = this.labelPositions[e];
        if (void 0 === n) throw new uu(`Undefined label ID: ${e}`);
        r[t] = n - t;
      }
      if (t)
        for (let i = 0; i < e; i++)
          if (n[i] === eu.NEWC || n[i] === eu.NEWCP || n[i] === eu.NEWCV) {
            const e = r[i];
            r[i] = t.get(e) ?? e;
          }
      return new ru(
        n,
        r,
        i,
        this.strings.slice(),
        this.maxStackDepth,
        this.symbolCount,
        this.numArgs,
      );
    }
  }
  au._functionIndex = 0;
  const lu = new Int16Array(89);
  ((lu[eu.LDCI] = 1),
    (lu[eu.LGCI] = 1),
    (lu[eu.LDCF32] = 1),
    (lu[eu.LGCF32] = 1),
    (lu[eu.LDCF64] = 1),
    (lu[eu.LGCF64] = 1),
    (lu[eu.LDCB0] = 1),
    (lu[eu.LDCB1] = 1),
    (lu[eu.LGCB0] = 1),
    (lu[eu.LGCB1] = 1),
    (lu[eu.LGCU] = 1),
    (lu[eu.LGCN] = 1),
    (lu[eu.LGCS] = 1),
    (lu[eu.POPG] = -1),
    (lu[eu.POPB] = -1),
    (lu[eu.POPF] = -1),
    (lu[eu.ADDG] = -1),
    (lu[eu.ADDF] = -1),
    (lu[eu.SUBG] = -1),
    (lu[eu.SUBF] = -1),
    (lu[eu.MULG] = -1),
    (lu[eu.MULF] = -1),
    (lu[eu.DIVG] = -1),
    (lu[eu.DIVF] = -1),
    (lu[eu.MODG] = -1),
    (lu[eu.MODF] = -1),
    (lu[eu.FLOORDIVG] = -1),
    (lu[eu.FLOORDIVF] = -1),
    (lu[eu.LTG] = -1),
    (lu[eu.LTF] = -1),
    (lu[eu.GTG] = -1),
    (lu[eu.GTF] = -1),
    (lu[eu.LEG] = -1),
    (lu[eu.LEF] = -1),
    (lu[eu.GEG] = -1),
    (lu[eu.GEF] = -1),
    (lu[eu.EQG] = -1),
    (lu[eu.EQF] = -1),
    (lu[eu.EQB] = -1),
    (lu[eu.NEQG] = -1),
    (lu[eu.NEQF] = -1),
    (lu[eu.NEQB] = -1),
    (lu[eu.NOTG] = 0),
    (lu[eu.NOTB] = 0),
    (lu[eu.NEGG] = 0),
    (lu[eu.NEGF] = 0),
    (lu[eu.LDLG] = 1),
    (lu[eu.LDLF] = 1),
    (lu[eu.LDLB] = 1),
    (lu[eu.LDPG] = 1),
    (lu[eu.LDPF] = 1),
    (lu[eu.LDPB] = 1),
    (lu[eu.STLG] = -1),
    (lu[eu.STLF] = -1),
    (lu[eu.STLB] = -1),
    (lu[eu.STPG] = -1),
    (lu[eu.STPF] = -1),
    (lu[eu.STPB] = -1),
    (lu[eu.NEWA] = 0),
    (lu[eu.LDAG] = -1),
    (lu[eu.LDAB] = -1),
    (lu[eu.LDAF] = -1),
    (lu[eu.STAG] = -3),
    (lu[eu.STAB] = -3),
    (lu[eu.STAF] = -3),
    (lu[eu.NEWC] = 1),
    (lu[eu.NEWCP] = 1),
    (lu[eu.NEWCV] = 1),
    (lu[eu.BRT] = -1),
    (lu[eu.BRF] = -1),
    (lu[eu.BR] = 0),
    (lu[eu.JMP] = 0),
    (lu[eu.RETG] = -1),
    (lu[eu.RETF] = -1),
    (lu[eu.RETB] = -1),
    (lu[eu.RETU] = 0),
    (lu[eu.RETN] = 0),
    (lu[eu.DUP] = 1),
    (lu[eu.NEWENV] = 0),
    (lu[eu.POPENV] = 0),
    (lu[eu.NOP] = 0),
    (lu[eu.NEWITER] = 0),
    (lu[eu.FOR_ITER] = 1));
  const cu = new Map([
      ["print", 5],
      ["display", 5],
      ["abs", 10],
      ["min", 20],
      ["max", 21],
      ["pow", 22],
      ["sqrt", 23],
      ["floor", 24],
      ["ceil", 25],
      ["round", 26],
      ["range", 30],
      ["len", 31],
    ]),
    pu = -2147483648,
    hu = 2147483647;
  class fu {
    constructor(t, e, n, r) {
      ((this.tokenAnnotations = new WeakMap()),
        (this.envSlotCounters = new WeakMap()),
        (this.envSlotMaps = new WeakMap()),
        (this.tmpCounter = 0),
        (this.loopStack = []),
        (this.builder = n),
        (this.currentEnvironment = t),
        (this.functionEnvironments = e),
        (this.isTailCall = !1),
        (this.internalFunctions = r));
    }
    static fromProgram(t, e, n) {
      e || (e = new Mt("", t, [], [Yo, Wo]).resolveEnvironments(t));
      const r = e.get(t);
      if (!r) throw new Error("Main program environment not found");
      au.resetIndex();
      const i = new au(0);
      return new fu(r, e, i, n);
    }
    fromFunctionNode(t) {
      const e = this.functionEnvironments.get(t);
      if (!e) throw new Error("Function environment not found");
      for (const n of t.parameters) e.lookupNameCurrentEnvWithError(n);
      const n = t.parameters.length,
        r = this.builder.createChildBuilder(n),
        i = new fu(e, this.functionEnvironments, r, this.internalFunctions),
        s = new Map();
      i.envSlotMaps.set(e, s);
      for (let e = 0; e < t.parameters.length; e++) {
        const n = t.parameters[e].lexeme;
        s.set(n, e);
      }
      return (i.envSlotCounters.set(e, n), i);
    }
    compileProgram(t) {
      this.compile(t);
      const e = this.builder.getAllBuilders(!0).map(t => t.build());
      return new iu(0, e);
    }
    compile(t) {
      return t.accept(this);
    }
    getTokenAnnotation(t) {
      let e = this.tokenAnnotations.get(t);
      if (e) return e;
      const n = t.lexeme,
        r = this.currentEnvironment.lookupNameEnv(t);
      if (null !== r && null === r.enclosing) {
        const t = this.internalFunctions?.get(n);
        if (void 0 !== t)
          e = { slot: t, envLevel: 0, isPrimitive: !1, isInternal: !0, internalIndex: t };
        else {
          const t = cu.get(n);
          if (void 0 === t) throw new Error(`Primitive function ${n} not implemented`);
          e = { slot: t, envLevel: 0, isPrimitive: !0, primitiveIndex: t };
        }
      } else {
        if (null == r) throw new Error(`Variable ${n} not found in environment`);
        {
          const i = this.currentEnvironment.lookupName(t);
          e = { slot: this.getOrAssignSlot(r, n), envLevel: i, isPrimitive: !1 };
        }
      }
      return (this.tokenAnnotations.set(t, e), e);
    }
    getOrAssignSlot(t, e) {
      let n = this.envSlotMaps.get(t);
      n || ((n = new Map()), this.envSlotMaps.set(t, n), this.envSlotCounters.set(t, 0));
      let r = n.get(e);
      return (
        void 0 === r &&
          ((r = this.envSlotCounters.get(t)),
          n.set(e, r),
          this.envSlotCounters.set(t, r + 1),
          this.builder.noteSymbolUsed()),
        r
      );
    }
    emitLoadSymbol(t) {
      const e = this.getTokenAnnotation(t);
      return e.isPrimitive || e.isInternal
        ? { maxStackSize: 0 }
        : (0 === e.envLevel
            ? this.builder.emitUnary(eu.LDLG, e.slot)
            : this.builder.emitBinary(eu.LDPG, e.slot, e.envLevel),
          { maxStackSize: 1 });
    }
    emitStoreSymbol(t) {
      const e = this.getTokenAnnotation(t);
      if (e.isPrimitive || e.isInternal)
        throw new Error(`Cannot assign to primitive symbol: ${t.lexeme}`);
      0 === e.envLevel
        ? this.builder.emitUnary(eu.STLG, e.slot)
        : this.builder.emitBinary(eu.STPG, e.slot, e.envLevel);
    }
    emitFunctionCall(t, e) {
      const n = this.getTokenAnnotation(t);
      if (n.isInternal) {
        const t = this.isTailCall ? eu.CALLTV : eu.CALLV;
        this.builder.emitPrimitiveCall(t, n.internalIndex, e);
      } else if (n.isPrimitive) {
        const t = this.isTailCall ? eu.CALLTP : eu.CALLP;
        this.builder.emitPrimitiveCall(t, n.primitiveIndex, e);
      } else {
        const t = this.isTailCall ? eu.CALLT : eu.CALL;
        this.builder.emitCall(t, e);
      }
    }
    visitLiteralExpr(t) {
      const e = t.value;
      if (null === e) this.builder.emitNullary(eu.LGCN);
      else
        switch (typeof e) {
          case "boolean":
            this.builder.emitNullary(e ? eu.LGCB1 : eu.LGCB0);
            break;
          case "number":
            Number.isInteger(e) && pu <= e && e <= hu
              ? this.builder.emitUnary(eu.LGCI, e)
              : this.builder.emitUnary(eu.LGCF64, e);
            break;
          case "string":
            this.builder.emitUnary(eu.LGCS, e);
            break;
          default:
            throw new Error("Unsupported literal type");
        }
      return { maxStackSize: 1 };
    }
    visitStarredExpr(t) {
      throw new Error("Starred expressions not yet supported in SVML compiler");
    }
    visitBigIntLiteralExpr(t) {
      const e = Number(t.value);
      return (
        Number.isInteger(e) && pu <= e && e <= hu
          ? this.builder.emitUnary(eu.LGCI, e)
          : this.builder.emitUnary(eu.LGCF64, e),
        { maxStackSize: 1 }
      );
    }
    visitComplexExpr(t) {
      throw new Error("Complex numbers not yet supported in SVML compiler");
    }
    visitListExpr(t) {
      const e = t.elements.length,
        n = this.getOrAssignSlot(this.currentEnvironment, "__list_tmp_" + this.tmpCounter++);
      (this.builder.emitUnary(eu.LGCI, e),
        this.builder.emitNullary(eu.NEWA),
        this.builder.emitUnary(eu.STLG, n));
      for (let r = 0; r < e; r++)
        (this.builder.emitUnary(eu.LDLG, n),
          this.builder.emitUnary(eu.LGCI, r),
          this.compile(t.elements[r]),
          this.builder.emitNullary(eu.STAG));
      return (this.builder.emitUnary(eu.LDLG, n), { maxStackSize: 4 });
    }
    visitSubscriptExpr(t) {
      return (
        this.compile(t.value),
        this.compile(t.index),
        this.builder.emitNullary(eu.LDAG),
        { maxStackSize: 2 }
      );
    }
    visitVariableExpr(t) {
      return (this.emitLoadSymbol(t.name), { maxStackSize: 1 });
    }
    getBinaryOpCode(t) {
      switch (t.type) {
        case _.PLUS:
          return eu.ADDG;
        case _.MINUS:
          return eu.SUBG;
        case _.STAR:
          return eu.MULG;
        case _.SLASH:
          return eu.DIVG;
        case _.PERCENT:
          return eu.MODG;
        case _.DOUBLESLASH:
          return eu.FLOORDIVG;
        default:
          throw new Error(`Unsupported binary operator: ${t.lexeme}`);
      }
    }
    getCompareOpCode(t) {
      switch (t.type) {
        case _.LESS:
          return eu.LTG;
        case _.GREATER:
          return eu.GTG;
        case _.LESSEQUAL:
          return eu.LEG;
        case _.GREATEREQUAL:
          return eu.GEG;
        case _.DOUBLEEQUAL:
          return eu.EQG;
        case _.NOTEQUAL:
          return eu.NEQG;
        default:
          throw new Error(`Unsupported comparison operator: ${t.lexeme}`);
      }
    }
    compileBinOp(t, e, n) {
      const r = this.compile(t),
        i = this.compile(e);
      return (
        this.builder.emitNullary(n),
        { maxStackSize: Math.max(r.maxStackSize, 1 + i.maxStackSize) }
      );
    }
    visitBinaryExpr(t) {
      return this.compileBinOp(t.left, t.right, this.getBinaryOpCode(t.operator));
    }
    visitCompareExpr(t) {
      return this.compileBinOp(t.left, t.right, this.getCompareOpCode(t.operator));
    }
    visitBoolOpExpr(t) {
      if (t.operator.type === _.AND) {
        const e = this.compile(t.left),
          n = this.builder.emitJump(eu.BRF),
          r = this.compile(t.right),
          i = this.builder.emitJump(eu.BR);
        (this.builder.markLabel(n), this.builder.emitNullary(eu.LGCB0));
        const s = { maxStackSize: 1 };
        return (
          this.builder.markLabel(i),
          { maxStackSize: Math.max(e.maxStackSize, r.maxStackSize, s.maxStackSize) }
        );
      }
      if (t.operator.type === _.OR) {
        const e = this.compile(t.left),
          n = this.builder.emitJump(eu.BRF);
        this.builder.emitNullary(eu.LGCB1);
        const r = { maxStackSize: 1 },
          i = this.builder.emitJump(eu.BR);
        this.builder.markLabel(n);
        const s = this.compile(t.right);
        return (
          this.builder.markLabel(i),
          { maxStackSize: Math.max(e.maxStackSize, r.maxStackSize, s.maxStackSize) }
        );
      }
      throw new Error(`Unsupported boolean operator: ${t.operator.lexeme}`);
    }
    visitUnaryExpr(t) {
      let e;
      switch (t.operator.type) {
        case _.NOT:
          e = eu.NOTG;
          break;
        case _.MINUS:
          e = eu.NEGG;
          break;
        case _.PLUS:
          return this.compile(t.right);
        default:
          throw new Error(`Unsupported unary operator: ${t.operator.lexeme}`);
      }
      const n = this.compile(t.right);
      return (this.builder.emitNullary(e), { maxStackSize: n.maxStackSize });
    }
    visitCallExpr(t) {
      if (!(t.callee instanceof q.Variable))
        throw new Error("Unsupported call expression: callee must be an identifier");
      const e = t.callee,
        { maxStackSize: n } = this.emitLoadSymbol(e.name);
      let r = 0;
      for (let e = 0; e < t.args.length; e++) {
        const n = this.compile(t.args[e]);
        r = Math.max(r, e + n.maxStackSize);
      }
      const i = t.args.length;
      return (this.emitFunctionCall(e.name, i), { maxStackSize: n + r });
    }
    visitTernaryExpr(t) {
      const e = this.compile(t.predicate),
        n = this.builder.emitJump(eu.BRF),
        r = this.compile(t.consequent),
        i = this.builder.emitJump(eu.BR);
      this.builder.markLabel(n);
      const s = this.compile(t.alternative);
      return (
        this.builder.markLabel(i),
        { maxStackSize: Math.max(e.maxStackSize, r.maxStackSize, s.maxStackSize) }
      );
    }
    visitNoneExpr(t) {
      return (this.builder.emitNullary(eu.LGCN), { maxStackSize: 1 });
    }
    compileClosure(t, e) {
      const n = this.fromFunctionNode(t),
        { maxStackSize: r } = e(n);
      return (
        n.builder.emitNullary(eu.RETG),
        this.builder.emitUnary(eu.NEWC, n.builder.getFunctionIndex()),
        { maxStackSize: Math.max(r, 1) }
      );
    }
    visitLambdaExpr(t) {
      const e = new V.Return(t.startToken, t.endToken, t.body);
      return this.compileClosure(t, t => t.compile(e));
    }
    visitMultiLambdaExpr(t) {
      return this.compileClosure(t, e => e.compileStatements(t.body));
    }
    visitGroupingExpr(t) {
      return this.compile(t.expression);
    }
    visitSimpleExprStmt(t) {
      return this.compile(t.expression);
    }
    visitReturnStmt(t) {
      if (!t.value)
        return (
          this.builder.emitNullary(eu.LGCU),
          this.builder.emitNullary(eu.RETG),
          { maxStackSize: 1 }
        );
      const e = this.compile(t.value);
      return (this.builder.emitNullary(eu.RETG), e);
    }
    visitAssignStmt(t) {
      const e = this.compile(t.value);
      return (this.emitStoreSymbol(t.target.name), this.builder.emitNullary(eu.LGCU), e);
    }
    visitFunctionDefStmt(t) {
      const e = this.compileClosure(t, e => e.compileStatements(t.body));
      return (this.emitStoreSymbol(t.name), this.builder.emitNullary(eu.LGCU), e);
    }
    visitIfStmt(t) {
      const e = this.compile(t.condition),
        n = this.builder.emitJump(eu.BRF),
        r = this.compileStatements(t.body),
        i = this.builder.emitJump(eu.BR);
      this.builder.markLabel(n);
      const s = t.elseBlock
        ? this.compileStatements(t.elseBlock)
        : (() => (this.builder.emitNullary(eu.LGCU), { maxStackSize: 1 }))();
      return (
        this.builder.markLabel(i),
        { maxStackSize: Math.max(e.maxStackSize, r.maxStackSize, s.maxStackSize) }
      );
    }
    visitWhileStmt(t) {
      const e = this.builder.markLabel(),
        n = this.builder.getNextLabel();
      this.loopStack.push({ breakLabel: n, continueLabel: e, iteratorOnStack: !1 });
      const r = this.compile(t.condition);
      this.builder.emitJump(eu.BRF, n);
      const i = this.compileStatements(t.body);
      return (
        this.builder.emitNullary(eu.POPG),
        this.builder.emitJump(eu.BR, e),
        this.loopStack.pop(),
        this.builder.markLabel(n),
        this.builder.emitNullary(eu.LGCU),
        { maxStackSize: Math.max(r.maxStackSize, i.maxStackSize, 1) }
      );
    }
    visitPassStmt(t) {
      return (this.builder.emitNullary(eu.LGCU), { maxStackSize: 1 });
    }
    visitAnnAssignStmt(t) {
      throw new Error("AnnAssign not yet implemented in SVML compiler");
    }
    visitBreakStmt(t) {
      if (0 === this.loopStack.length) throw new Error("Break statement outside loop");
      const { breakLabel: e, iteratorOnStack: n } = this.loopStack[this.loopStack.length - 1];
      return (
        n && this.builder.emitNullary(eu.POPG),
        this.builder.emitJump(eu.BR, e),
        { maxStackSize: 0 }
      );
    }
    visitContinueStmt(t) {
      if (0 === this.loopStack.length) throw new Error("Continue statement outside loop");
      const { continueLabel: e } = this.loopStack[this.loopStack.length - 1];
      return (this.builder.emitJump(eu.BR, e), { maxStackSize: 0 });
    }
    visitFromImportStmt(t) {
      throw new Error("FromImport not yet implemented in SVML compiler");
    }
    visitGlobalStmt(t) {
      return (this.builder.emitNullary(eu.LGCU), { maxStackSize: 1 });
    }
    visitNonLocalStmt(t) {
      return (this.builder.emitNullary(eu.LGCU), { maxStackSize: 1 });
    }
    visitAssertStmt(t) {
      throw new Error("Assert not yet implemented in SVML compiler");
    }
    visitForStmt(t) {
      (this.compile(t.iter), this.builder.emitNullary(eu.NEWITER));
      const e = this.builder.markLabel(),
        n = this.builder.getNextLabel();
      (this.loopStack.push({ breakLabel: n, continueLabel: e, iteratorOnStack: !0 }),
        this.builder.emitJump(eu.FOR_ITER, n));
      const r = this.getOrAssignSlot(this.currentEnvironment, t.target.lexeme);
      this.builder.emitUnary(eu.STLG, r);
      const i = this.compileStatements(t.body);
      return (
        this.builder.emitNullary(eu.POPG),
        this.builder.emitJump(eu.BR, e),
        this.loopStack.pop(),
        this.builder.markLabel(n),
        this.builder.emitNullary(eu.LGCU),
        { maxStackSize: Math.max(i.maxStackSize + 2, 2) }
      );
    }
    visitFileInputStmt(t) {
      const { maxStackSize: e } = this.compileStatements(t.statements);
      return (this.builder.emitNullary(eu.RETG), { maxStackSize: Math.max(e, 1) });
    }
    compileStatements(t) {
      if (0 === t.length) return (this.builder.emitNullary(eu.LGCU), { maxStackSize: 1 });
      let e = 0;
      for (let n = 0; n < t.length; n++) {
        const r = this.compile(t[n]);
        ((e = Math.max(e, r.maxStackSize)), n < t.length - 1 && this.builder.emitNullary(eu.POPG));
      }
      return { maxStackSize: e };
    }
  }
  function mu(t) {
    let e = "";
    for (let n = 0; n < t.length; n++) e += String.fromCharCode(t[n]);
    return btoa(e);
  }
  const du = new Map(Rt.map((t, e) => [t, e]));
  class gu {
    async execute(t) {
      try {
        const e = t + "\n",
          n = new st(e).parse(),
          { errors: r, environments: i } = (function (t, e, n = 4, r = [], i = []) {
            const s = new Mt(
              e,
              t,
              (function (t) {
                switch (t) {
                  case 1:
                  case 2:
                    return [mt, dt, vt(), ht, gt, Dt, bt, wt, pt, ft];
                  case 3:
                    return [lt, ct(), pt];
                  default:
                    return [ct(), pt];
                }
              })(n),
              r,
              i,
            );
            return { errors: s.resolve(t), environments: s.functionEnvironments };
          })(n, e, 4, [Yo, Wo, Pt]);
        if (r.length > 0) throw r[0];
        return {
          status: "finished",
          output: mu(
            (function (t) {
              const e = t.entryPoint,
                n = t.functions.map(t =>
                  (function (t) {
                    const e = t.toInstructions(),
                      { stackSize: n, envSize: r, numArgs: i } = t,
                      s = [],
                      o = new nu();
                    (o.putU(8, n), o.putU(8, r), o.putU(8, i), o.putU(8, 0));
                    const u = e
                      .map(t =>
                        (function (t) {
                          switch (t) {
                            case Jo.LDLG:
                            case Jo.LDLF:
                            case Jo.LDLB:
                            case Jo.STLG:
                            case Jo.STLF:
                            case Jo.STLB:
                            case Jo.CALL:
                            case Jo.CALLT:
                            case Jo.NEWENV:
                            case Jo.NEWCP:
                            case Jo.NEWCV:
                              return 2;
                            case Jo.LDPG:
                            case Jo.LDPF:
                            case Jo.LDPB:
                            case Jo.STPG:
                            case Jo.STPF:
                            case Jo.STPB:
                            case Jo.CALLP:
                            case Jo.CALLTP:
                            case Jo.CALLV:
                            case Jo.CALLTV:
                              return 3;
                            case Jo.LDCI:
                            case Jo.LGCI:
                            case Jo.LDCF32:
                            case Jo.LGCF32:
                            case Jo.LGCS:
                            case Jo.NEWC:
                            case Jo.BRF:
                            case Jo.BRT:
                            case Jo.BR:
                            case Jo.JMP:
                            case Jo.FOR_ITER:
                              return 5;
                            case Jo.LDCF64:
                            case Jo.LGCF64:
                              return 9;
                            default:
                              return 1;
                          }
                        })(t.opcode),
                      )
                      .reduce((t, e) => (t.push(t[t.length - 1] + e), t), [0]);
                    for (const [t, n] of e.map((t, e) => [t, e])) {
                      if (t.opcode < 0 || t.opcode > 88)
                        throw new Error(`Invalid opcode ${t.opcode.toString()}`);
                      if (t.opcode > 84) throw new Error(Ko(t.opcode));
                      const e = t.opcode;
                      switch ((o.putU(8, e), e)) {
                        case eu.LDCI:
                        case eu.LGCI:
                          if (!Number.isInteger(t.arg1))
                            throw new Error(
                              `Non-integral operand to LDCI/LDGI: ${t.arg1} (this is a compiler bug)`,
                            );
                          o.putI(32, t.arg1);
                          break;
                        case eu.LDCF32:
                        case eu.LGCF32:
                          o.putF(32, t.arg1);
                          break;
                        case eu.LDCF64:
                        case eu.LGCF64:
                          o.putF(64, t.arg1);
                          break;
                        case eu.LGCS:
                          (s.push({ offset: o.cursor, referent: ["string", t.arg1] }),
                            o.putU(32, 0));
                          break;
                        case eu.NEWC:
                          (s.push({ offset: o.cursor, referent: ["function", t.arg1] }),
                            o.putU(32, 0));
                          break;
                        case eu.LDLG:
                        case eu.LDLF:
                        case eu.LDLB:
                        case eu.STLG:
                        case eu.STLF:
                        case eu.STLB:
                        case eu.CALL:
                        case eu.CALLT:
                        case eu.NEWENV:
                        case eu.NEWCP:
                        case eu.NEWCV:
                          o.putU(8, t.arg1);
                          break;
                        case eu.LDPG:
                        case eu.LDPF:
                        case eu.LDPB:
                        case eu.STPG:
                        case eu.STPF:
                        case eu.STPB:
                        case eu.CALLP:
                        case eu.CALLTP:
                        case eu.CALLV:
                        case eu.CALLTV:
                          (o.putU(8, t.arg1), o.putU(8, t.arg2));
                          break;
                        case eu.BRF:
                        case eu.BRT:
                        case eu.BR:
                        case eu.FOR_ITER:
                          const e = u[n + t.arg1] - u[n + 1];
                          o.putI(32, e);
                          break;
                        case eu.JMP:
                          throw new Error("JMP assembling not implemented");
                      }
                    }
                    const a = o.asArray();
                    if (a.byteLength - 4 !== u[u.length - 1])
                      throw new Error(
                        `Assembler bug: calculated function length ${u[u.length - 1]} is different from actual length ${a.byteLength - 4}`,
                      );
                    return { binary: o.asArray(), holes: s, finalOffset: null };
                  })(t),
                ),
                r = [
                  ...new Set(
                    [].concat(
                      ...n.map(t =>
                        t.holes.filter(t => "string" === t.referent[0]).map(t => t.referent[1]),
                      ),
                    ),
                  ),
                ],
                i = new nu();
              i.cursor = 16;
              const s = new Map();
              for (const t of r) (i.align(4), s.set(t, i.cursor), ou(i, t));
              const o = i.cursor;
              for (const t of n)
                (i.align(4), (t.finalOffset = i.cursor), (i.cursor += t.binary.byteLength));
              for (const t of n) {
                const e = new DataView(t.binary.buffer);
                for (const r of t.holes) {
                  let t;
                  if (
                    ((t =
                      "string" === r.referent[0]
                        ? s.get(r.referent[1])
                        : n[r.referent[1]].finalOffset),
                    null == t)
                  )
                    throw new Error(`Assembler bug: missing string/function: ${JSON.stringify(r)}`);
                  e.setUint32(r.offset, t, !0);
                }
              }
              i.cursor = o;
              for (const t of n) {
                if ((i.align(4), i.cursor !== t.finalOffset))
                  throw new Error("Assembler bug: function offset changed");
                i.putA(t.binary);
              }
              var u, a, l;
              return (
                (i.cursor = 0),
                (u = i),
                (a = n[e].finalOffset),
                (l = r.length),
                (u.cursor = 0),
                u.putU(32, 1342549165),
                u.putU(16, 0),
                u.putU(16, 0),
                u.putU(32, a),
                u.putU(32, l),
                i.asArray()
              );
            })(fu.fromProgram(n, i, du).compileProgram(n)),
          ),
        };
      } catch (t) {
        return { status: "error", error: t instanceof Error ? t.message : String(t) };
      }
    }
  }
  class Du {
    constructor(t, [e]) {
      ((this.id = "__ev3_execution"),
        (this.__channel = e),
        (this.engine = new gu()),
        this.__channel.subscribe(async t => {
          if ("run" === t.type) {
            const e = await this.engine.execute(t.code);
            "finished" === e.status
              ? this.__channel.send({ type: "result", output: e.output })
              : this.__channel.send({ type: "error", message: e.error });
          }
        }));
    }
  }
  ((Du.channelAttach = ["test"]),
    new (class {
      m = !0;
      C;
      v;
      P = new Map();
      M = new Map();
      j = [];
      A(t) {
        const { port1: e, port2: n } = new MessageChannel(),
          r = new s(t, e);
        (this.C.postMessage([t, n], [n]), this.P.set(t, r));
      }
      l() {
        if (!this.m) throw new i("Conduit already terminated");
      }
      registerPlugin(t, ...e) {
        this.l();
        const n = [];
        for (const e of t.channelAttach) (this.P.has(e) || this.A(e), n.push(this.P.get(e)));
        const r = new t(this, n, ...e);
        if (void 0 !== r.id) {
          if (this.M.has(r.id)) throw new i(`Plugin ${r.id} already registered`);
          this.M.set(r.id, r);
        }
        return (this.j.push(r), r);
      }
      unregisterPlugin(t) {
        this.l();
        let e = 0;
        for (let n = 0; n < this.j.length; ++n)
          (this.j[e] === t && ++e, (this.j[n] = this.j[n + e]));
        for (let t = this.j.length - 1, n = this.j.length - e; t >= n; --t) delete this.j[t];
        (t.id && this.M.delete(t.id), t.destroy?.());
      }
      lookupPlugin(t) {
        if ((this.l(), !this.M.has(t))) throw new i(`Plugin ${t} not registered`);
        return this.M.get(t);
      }
      terminate() {
        this.l();
        for (const t of this.j) t.destroy?.();
        (this.C.terminate?.(), (this.m = !1));
      }
      $(t) {
        const [e, n] = t;
        if (this.P.has(e)) {
          const t = this.P.get(e);
          this.v ? t.listenToPort(n) : t.replacePort(n);
        } else {
          const t = new s(e, n);
          this.P.set(e, t);
        }
      }
      constructor(t, e = !1) {
        ((this.C = t), t.addEventListener("message", t => this.$(t.data)), (this.v = e));
      }
    })(self, !1).registerPlugin(Du));
})();
//# sourceMappingURL=ev3-remote-runner.js.map
