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
  let o = class {
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
  };
  function s(t) {
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
        } catch (t) {}
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
    l = { exports: {} };
  var c,
    p,
    h =
      (a ||
        ((a = 1),
        (c = l),
        (function (t, e) {
          c.exports ? (c.exports = e()) : (t.nearley = e());
        })(l.exports, function () {
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
          function o(t, e, o) {
            if (t instanceof r) {
              var s = t;
              o = e;
            } else s = r.fromCompiled(t, e);
            for (var u in ((this.grammar = s),
            (this.options = { keepHistory: !1, lexer: s.lexer || new i() }),
            o || {}))
              this.options[u] = o[u];
            ((this.lexer = this.options.lexer), (this.lexerState = void 0));
            var a = new n(s, 0);
            ((this.table = [a]),
              (a.wants[s.start] = []),
              a.predict(s.start),
              a.process(),
              (this.current = 0));
          }
          function s(t) {
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
                  ? this.symbols.map(s).join(" ")
                  : this.symbols.slice(0, t).map(s).join(" ") +
                    " ● " +
                    this.symbols.slice(t).map(s).join(" ");
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
                (this.data = this.rule.postprocess(this.data, this.reference, o.fail));
            }),
            (n.prototype.process = function (t) {
              for (
                var e = this.states, n = this.wants, r = this.completed, i = 0;
                i < e.length;
                i++
              ) {
                var s = e[i];
                if (s.isComplete) {
                  if ((s.finish(), s.data !== o.fail)) {
                    for (var u = s.wantedBy, a = u.length; a--; ) {
                      var l = u[a];
                      this.complete(l, s);
                    }
                    if (s.reference === this.index) {
                      var c = s.rule.name;
                      (this.completed[c] = this.completed[c] || []).push(s);
                    }
                  }
                } else {
                  if ("string" != typeof (c = s.rule.symbols[s.dot])) {
                    this.scannable.push(s);
                    continue;
                  }
                  if (n[c]) {
                    if ((n[c].push(s), r.hasOwnProperty(c))) {
                      var p = r[c];
                      for (a = 0; a < p.length; a++) {
                        var h = p[a];
                        this.complete(s, h);
                      }
                    }
                  } else ((n[c] = [s]), this.predict(c));
                }
              }
            }),
            (n.prototype.predict = function (t) {
              for (var n = this.grammar.byName[t] || [], r = 0; r < n.length; r++) {
                var i = n[r],
                  o = this.wants[t],
                  s = new e(i, 0, this.index, o);
                this.states.push(s);
              }
            }),
            (n.prototype.complete = function (t, e) {
              var n = t.nextState(e);
              this.states.push(n);
            }),
            (r.fromCompiled = function (e, n) {
              var i = e.Lexer;
              e.ParserStart && ((n = e.ParserStart), (e = e.ParserRules));
              var o = new r(
                (e = e.map(function (e) {
                  return new t(e.name, e.symbols, e.postprocess);
                })),
                n,
              );
              return ((o.lexer = i), o);
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
                var o = this.index - this.lastLineBreak,
                  s = String(this.line).length;
                return (
                  (e += " at line " + this.line + " col " + o + ":\n\n"),
                  (e += r
                    .map(function (t, e) {
                      return u(this.line - r.length + e + 1, s) + " " + t;
                    }, this)
                    .join("\n")),
                  (e += "\n" + u("", s + o) + "^\n")
                );
              }
              return e + " at index " + (this.index - 1);
              function u(t, e) {
                var n = String(t);
                return Array(e - n.length + 1).join(" ") + n;
              }
            }),
            (o.fail = {}),
            (o.prototype.feed = function (t) {
              var e,
                r = this.lexer;
              for (r.reset(t, this.lexerState); ; ) {
                try {
                  if (!(e = r.next())) break;
                } catch (t) {
                  var o = new n(this.grammar, this.current + 1);
                  throw (
                    this.table.push(o),
                    ((a = new Error(this.reportLexerError(t))).offset = this.current),
                    (a.token = t.token),
                    a
                  );
                }
                var s = this.table[this.current];
                this.options.keepHistory || delete this.table[this.current - 1];
                var u = this.current + 1;
                ((o = new n(this.grammar, u)), this.table.push(o));
                for (
                  var a,
                    l = void 0 !== e.text ? e.text : e.value,
                    c = r.constructor === i ? e.value : e,
                    p = s.scannable,
                    h = p.length;
                  h--;
                ) {
                  var f = p[h],
                    m = f.rule.symbols[f.dot];
                  if (m.test ? m.test(c) : m.type ? m.type === e.type : m.literal === l) {
                    var d = f.nextState({ data: c, token: e, isToken: !0, reference: u - 1 });
                    o.states.push(d);
                  }
                }
                if ((o.process(), 0 === o.states.length))
                  throw (
                    ((a = new Error(this.reportError(e))).offset = this.current),
                    (a.token = e),
                    a
                  );
                (this.options.keepHistory && (s.lexerState = r.save()), this.current++);
              }
              return (s && (this.lexerState = r.save()), (this.results = this.finish()), this);
            }),
            (o.prototype.reportLexerError = function (t) {
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
            (o.prototype.reportError = function (t) {
              var e =
                  (t.type ? t.type + " token: " : "") +
                  JSON.stringify(void 0 !== t.value ? t.value : t),
                n = this.lexer.formatError(t, "Syntax error");
              return this.reportErrorCommon(n, e);
            }),
            (o.prototype.reportErrorCommon = function (t, e) {
              var n = [];
              n.push(t);
              var r = this.table.length - 2,
                i = this.table[r],
                o = i.states.filter(function (t) {
                  var e = t.rule.symbols[t.dot];
                  return e && "string" != typeof e;
                });
              return (
                0 === o.length
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
                    o
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
            (o.prototype.displayStateStack = function (t, e) {
              for (var n, r = 0, i = 0; i < t.length; i++) {
                var o = t[i],
                  s = o.rule.toString(o.dot);
                (s === n
                  ? r++
                  : (r > 0 && e.push("    ^ " + r + " more lines identical to this"),
                    (r = 0),
                    e.push("    " + s)),
                  (n = s));
              }
            }),
            (o.prototype.getSymbolDisplay = function (t) {
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
            (o.prototype.buildFirstStateStack = function (t, e) {
              if (-1 !== e.indexOf(t)) return null;
              if (0 === t.wantedBy.length) return [t];
              var n = t.wantedBy[0],
                r = [t].concat(e),
                i = this.buildFirstStateStack(n, r);
              return null === i ? null : [t].concat(i);
            }),
            (o.prototype.save = function () {
              var t = this.table[this.current];
              return ((t.lexerState = this.lexerState), t);
            }),
            (o.prototype.restore = function (t) {
              var e = t.index;
              ((this.current = e),
                (this.table[e] = t),
                this.table.splice(e + 1),
                (this.lexerState = t.lexerState),
                (this.results = this.finish()));
            }),
            (o.prototype.rewind = function (t) {
              if (!this.options.keepHistory)
                throw new Error("set option `keepHistory` to enable rewinding");
              this.restore(this.table[t]);
            }),
            (o.prototype.finish = function () {
              var t = [],
                e = this.grammar.start;
              return (
                this.table[this.table.length - 1].states.forEach(function (n) {
                  n.rule.name === e &&
                    n.dot === n.rule.symbols.length &&
                    0 === n.reference &&
                    n.data !== o.fail &&
                    t.push(n);
                }),
                t.map(function (t) {
                  return t.data;
                })
              );
            }),
            { Parser: o, Grammar: r, Rule: t }
          );
        })),
      l.exports),
    f = s(h),
    m = { exports: {} },
    d = m.exports;
  var g =
      (p ||
        ((p = 1),
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
            function o(t) {
              return new RegExp("|" + t).exec("").length - 1;
            }
            function s(t) {
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
              var o = {
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
              for (var s in n) t.call(n, s) && (o[s] = n[s]);
              if ("string" == typeof o.type && e !== o.type)
                throw new Error(
                  "Type transform cannot be a string (type '" + o.type + "' for token '" + e + "')",
                );
              var u = o.match;
              return (
                (o.match = Array.isArray(u) ? u : u ? [u] : []),
                o.match.sort(function (t, e) {
                  return r(t) && r(e) ? 0 : r(e) ? -1 : r(t) ? 1 : e.length - t.length;
                }),
                o
              );
            }
            function p(t) {
              return Array.isArray(t)
                ? (function (t) {
                    for (var e = [], n = 0; n < t.length; n++) {
                      var r = t[n];
                      if (r.include)
                        for (var i = [].concat(r.include), o = 0; o < i.length; o++)
                          e.push({ include: i[o] });
                      else {
                        if (!r.type) throw new Error("Rule has no type: " + JSON.stringify(r));
                        e.push(c(r.type, r));
                      }
                    }
                    return e;
                  })(t)
                : (function (t) {
                    for (var e = Object.getOwnPropertyNames(t), n = [], r = 0; r < e.length; r++) {
                      var o = e[r],
                        s = t[o],
                        u = [].concat(s);
                      if ("include" !== o) {
                        var a = [];
                        (u.forEach(function (t) {
                          i(t)
                            ? (a.length && n.push(c(o, a)), n.push(c(o, t)), (a = []))
                            : a.push(t);
                        }),
                          a.length && n.push(c(o, a)));
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
                var y = g.match.slice();
                if (c)
                  for (; y.length && "string" == typeof y[0] && 1 === y[0].length; )
                    l[y.shift().charCodeAt(0)] = g;
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
                if (0 !== y.length) {
                  ((c = !1), f.push(g));
                  for (var D = 0; D < y.length; D++) {
                    var v = y[D];
                    if (r(v))
                      if (null === p) p = v.unicode;
                      else if (p !== v.unicode && !1 === g.fallback)
                        throw new Error("If one rule is /u then all must be");
                  }
                  var b = u(y.map(a)),
                    w = new RegExp(b);
                  if (w.test("")) throw new Error("RegExp matches empty string: " + w);
                  if (o(b) > 0)
                    throw new Error("RegExp has capture groups: " + w + "\nUse (?: … ) instead");
                  if (!g.lineBreaks && w.test("\n"))
                    throw new Error("Rule should declare lineBreaks: " + w);
                  m.push(s(b));
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
            function y() {
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
                  if ((s = this.fast[n.charCodeAt(t)])) return this._token(s, n.charAt(t), t);
                  var r = this.re;
                  r.lastIndex = t;
                  var i = g(r, n),
                    o = this.error;
                  if (null == i) return this._token(o, n.slice(t, n.length), t);
                  var s = this._getGroup(i),
                    u = i[0];
                  return o.fallback && i.index !== t
                    ? ((this.queuedGroup = s),
                      (this.queuedText = u),
                      this._token(o, n.slice(t, i.index), t))
                    : this._token(s, u, t);
                }
              }),
              (d.prototype._token = function (t, e, n) {
                var r = 0;
                if (t.lineBreaks) {
                  var i = /\n/g,
                    o = 1;
                  if ("\n" === e) r = 1;
                  else for (; i.exec(e); ) (r++, (o = i.lastIndex));
                }
                var s = {
                    type: ("function" == typeof t.type && t.type(e)) || t.defaultType,
                    value: "function" == typeof t.value ? t.value(e) : e,
                    text: e,
                    toString: y,
                    offset: n,
                    lineBreaks: r,
                    line: this.line,
                    col: this.col,
                  },
                  u = e.length;
                if (
                  ((this.index += u),
                  (this.line += r),
                  0 !== r ? (this.col = u - o + 1) : (this.col += u),
                  t.shouldThrow)
                )
                  throw new Error(this.formatError(s, "invalid syntax"));
                return (
                  t.pop
                    ? this.popState()
                    : t.push
                      ? this.pushState(t.push)
                      : t.next && this.setState(t.next),
                  s
                );
              }),
              "undefined" != typeof Symbol && Symbol.iterator)
            ) {
              var D = function (t) {
                this.lexer = t;
              };
              ((D.prototype.next = function () {
                var t = this.lexer.next();
                return { value: t, done: !t };
              }),
                (D.prototype[Symbol.iterator] = function () {
                  return this;
                }),
                (d.prototype[Symbol.iterator] = function () {
                  return new D(this);
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
                  o = String(i).length,
                  s = (function (t, e) {
                    for (var n = t.length, r = 0; ; ) {
                      var i = t.lastIndexOf("\n", n - 1);
                      if (-1 === i) break;
                      if (((n = i), ++r === e)) break;
                      if (0 === n) break;
                    }
                    var o = r < e ? 0 : n + 1;
                    return t.substring(o).split("\n");
                  })(this.buffer, this.line - t.line + 2 + 1).slice(0, 5),
                  u = [];
                (u.push(e + " at line " + t.line + " col " + t.col + ":"), u.push(""));
                for (var a = 0; a < s.length; a++) {
                  var c = s[a],
                    p = r + a;
                  (u.push(l(String(p), o) + "  " + c),
                    p === t.line && u.push(l("", o + t.col + 1) + "^"));
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
                  for (var i = Object.create(null), o = 0; o < r.length; o++)
                    i[(v = r[o])] = p(t[v]).concat(n);
                  for (o = 0; o < r.length; o++)
                    for (var s = i[(v = r[o])], u = Object.create(null), a = 0; a < s.length; a++) {
                      var l = s[a];
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
                            var y = h[g];
                            -1 === s.indexOf(y) && c.push(y);
                          }
                        }
                        (s.splice.apply(s, c), a--);
                      }
                    }
                  var D = Object.create(null);
                  for (o = 0; o < r.length; o++) {
                    var v;
                    D[(v = r[o])] = f(i[v], !0);
                  }
                  for (o = 0; o < r.length; o++) {
                    var b = r[o],
                      w = D[b],
                      E = w.groups;
                    for (a = 0; a < E.length; a++) m(E[a], b, D);
                    var x = Object.getOwnPropertyNames(w.fast);
                    for (a = 0; a < x.length; a++) m(w.fast[x[a]], b, D);
                  }
                  return new d(D, e);
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
                    var o = r[i],
                      s = t[o];
                    (Array.isArray(s) ? s : [s]).forEach(function (t) {
                      if ("string" != typeof t)
                        throw new Error("keyword must be string (in keyword '" + o + "')");
                      e ? n.set(t, o) : (n[t] = o);
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
    y = s(g);
  class D extends SyntaxError {
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
  const b = y.keywords({
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
    w = y.compile({
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
        for (; (n = w.next()); ) e.push(n);
        ((this.tokens = (function (t) {
          const e = [],
            n = [""];
          let r = 0,
            i = 0;
          {
            let e = 0;
            for (; e < t.length && ("comment" === t[e].type || "newline" === t[e].type); ) e++;
            if (e < t.length && "ws" === t[e].type) throw new D(t[e].line, t[e].col);
          }
          for (; i < t.length; ) {
            const o = t[i];
            if ("ws" !== o.type && "comment" !== o.type)
              if (E.has(o.text)) (r++, e.push(o), i++);
              else if (x.has(o.text)) (r--, e.push(o), i++);
              else if ("newline" === o.type && r > 0) i++;
              else {
                if ("newline" === o.type) {
                  (e.push(o), i++);
                  let r = "";
                  for (; i < t.length; ) {
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
                    for (; n.length > 1; ) (n.pop(), e.push(A("dedent", r)));
                    continue;
                  }
                  const s = n[n.length - 1];
                  if (r === s);
                  else if (r.startsWith(s) && r.length > s.length)
                    (n.push(r), e.push(A("indent", t[i])));
                  else {
                    for (; n.length > 1 && n[n.length - 1] !== r; )
                      (n.pop(), e.push(A("dedent", t[i])));
                    if (n[n.length - 1] !== r) throw new v(t[i].line, t[i].col);
                  }
                  continue;
                }
                (e.push(o), i++);
              }
            else i++;
          }
          if (n.length > 1) {
            const r =
              t.length > 0 ? t[t.length - 1] : { toString: () => "", offset: 0, line: 1, col: 1 };
            for (; n.length > 1; ) (n.pop(), e.push(A("dedent", r)));
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
  var _ = (t => (
    (t[(t.ENDMARKER = 0)] = "ENDMARKER"),
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
    (t[(t.RAISE = 95)] = "RAISE"),
    t
  ))(_ || {});
  class N {
    constructor(t, e, n, r, i) {
      ((this.type = t),
        (this.lexeme = e),
        (this.line = n),
        (this.col = r),
        (this.indexInSource = i));
    }
  }
  var S = (t => (
    (t.RESET = "Reset"),
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
    (t.LIST_ACCESS = "ListAccess"),
    t
  ))(S || {});
  const B = { start: { line: -1, column: -1 }, end: { line: -1, column: -1 } };
  class M {
    constructor(t) {
      ((this.type = "Runtime"),
        (this.severity = "Error"),
        (this.message = "Error"),
        (this.location = t
          ? {
              start: { line: t.startToken.line, column: t.startToken.col },
              end: { line: t.startToken.line, column: t.startToken.col },
            }
          : B));
    }
    explain() {
      return "";
    }
    elaborate() {
      return this.explain();
    }
  }
  function T(t, e) {
    let n = e,
      r = e;
    for (; n > 0 && "\n" != t[n]; ) n--;
    for ("\n" === t[n] && n++; r < t.length && "\n" != t[r]; ) r++;
    return { lineIndex: t.slice(0, n).split("\n").length, fullLine: t.slice(n, r) };
  }
  function k(t, e) {
    let n = "";
    for (let r = 0; r < t.length; r++) n += r === e ? "^" : "~";
    return n;
  }
  class I extends M {
    constructor(t, e, n, r, i, o) {
      (super(e), (this.type = "Type"), (this.functionName = n));
      let s = "exactly";
      o && (s = "at least");
      const u = e.startToken.indexInSource,
        { lineIndex: a, fullLine: l } = T(t, u);
      if (
        ((this.message = "TypeError at line " + a + "\n\n    " + l + "\n"), "number" == typeof r)
      ) {
        ((this.missingParamCnt = r), (this.missingParamName = ""));
        const t = i.length;
        1 === this.missingParamCnt || this.missingParamCnt;
        const e = `TypeError: ${this.functionName}() takes ${s} ${this.missingParamCnt} argument (${t} given)\nCheck the function definition of '${this.functionName}' and make sure to provide all required positional arguments in the correct order.`;
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
  class L extends M {
    constructor(t, e, n, r, i, o) {
      (super(e), (this.type = "Type"), (this.functionName = n));
      let s = "exactly";
      o && (s = "at most");
      const u = e.startToken.indexInSource,
        { lineIndex: a, fullLine: l } = T(t, u);
      ((this.message = "TypeError at line " + a + "\n\n    " + l + "\n"),
        "number" == typeof r
          ? ((this.expectedCount = r),
            (this.givenCount = i.length),
            1 === this.expectedCount || 0 === this.expectedCount
              ? (this.message += `TypeError: ${this.functionName}() takes ${s} ${this.expectedCount} argument (${this.givenCount} given)`)
              : (this.message += `TypeError: ${this.functionName}() takes ${s} ${this.expectedCount} arguments (${this.givenCount} given)`))
          : ((this.expectedCount = r.length),
            (this.givenCount = i.length),
            1 === this.expectedCount || 0 === this.expectedCount
              ? (this.message += `TypeError: ${this.functionName}() takes ${this.expectedCount} positional argument but ${this.givenCount} were given`)
              : (this.message += `TypeError: ${this.functionName}() takes ${this.expectedCount} positional arguments but ${this.givenCount} were given`)),
        (this.message += `\nRemove the extra argument(s) when calling '${this.functionName}', or check if the function definition accepts more arguments.`));
    }
  }
  class O extends M {
    constructor(t, e) {
      (super(e), (this.type = "Type"));
      const n = e.startToken.indexInSource,
        { lineIndex: r, fullLine: i } = T(t, n),
        o = t.substring(
          e.startToken.indexInSource,
          e.endToken.indexInSource + e.endToken.lexeme.length,
        );
      let s = "ZeroDivisionError: division by zero.";
      const u = i.indexOf(o),
        a = u >= 0 ? u : 0,
        l = k(o, e.operator.indexInSource - e.startToken.indexInSource);
      switch (e.operator.lexeme) {
        case "/":
        default:
          s = "ZeroDivisionError: division by zero.";
          break;
        case "//":
          s = "ZeroDivisionError: integer division or modulo by zero.";
          break;
        case "%":
          s = "ZeroDivisionError: integer modulo by zero.";
          break;
        case "**":
          s = "ZeroDivisionError: 0.0 cannot be raised to a negative power.";
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
        s +
        "\nYou attempted to divide by zero. Division or modulo operations cannot be performed with a divisor of zero. Please ensure that the divisor is non-zero before performing the operation.";
      this.message = c;
    }
  }
  class P extends M {
    constructor(t, e, n, r) {
      (super(e), (this.type = "Type"));
      const i = e.startToken.indexInSource,
        { lineIndex: o, fullLine: s } = T(t, i),
        u = t.substring(
          e.startToken.indexInSource,
          e.endToken.indexInSource + e.endToken.lexeme.length,
        ),
        a = s.indexOf(u),
        l = k(u, 0),
        c = `Ensure that the input value(s) passed to '${r}' satisfy the mathematical requirements`,
        p =
          "ValueError at line " +
          o +
          "\n\n    " +
          s +
          "\n    " +
          " ".repeat(a) +
          l +
          "\nValueError: math domain error. " +
          c;
      this.message = p;
    }
  }
  let R = class extends M {
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
        (this.type = "Type"));
      const o = e.startToken.indexInSource,
        { lineIndex: s, fullLine: u } = T(t, o),
        a = t.substring(
          e.startToken.indexInSource,
          e.endToken.indexInSource + e.endToken.lexeme.length,
        ),
        l = "TypeError: '" + r + "' cannot be interpreted as an '" + i + "'.",
        c = u.indexOf(a),
        p = c >= 0 ? c : 0,
        h = k(a, 0),
        f =
          "TypeError at line " +
          s +
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
  class $ extends M {
    constructor(t, e) {
      (super(e), (this.type = "Runtime"), (this.message = t));
    }
  }
  function z(t, e) {
    throw (t.errors.push(e), e);
  }
  class U {
    constructor(t, e) {
      ((this.real = t), (this.imag = e));
    }
    static fromNumber(t) {
      return new U(t, 0);
    }
    static fromBigInt(t) {
      return new U(Number(t), 0);
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
          return new U(0, "-" === t ? -1 : 1);
        if (t in r) {
          const e = r[t];
          return new U(n ? 0 : e, n ? e : 0);
        }
        const i = Number(t);
        if (isNaN(i)) throw new Error(`Invalid complex string: ${e}`);
        return new U(n ? 0 : i, n ? i : 0);
      }
      const [i, o] = n,
        s = o.slice(0, -1);
      if (!o.endsWith("j")) throw new Error(`Invalid complex string: ${e}`);
      if (!(i in r) && isNaN(Number(i))) throw new Error(`Invalid complex string: ${e}`);
      if (!(s in r) && !["+", "-", ""].includes(s) && isNaN(Number(s)))
        throw new Error(`Invalid complex string: ${e}`);
      const u = i in r ? r[i] : Number(i),
        a = s in r ? r[s] : "+" === s || "" === s ? 1 : "-" === s ? -1 : Number(s);
      return new U(u, a);
    }
    static fromValue(t, e, n, r) {
      if (r instanceof U) return new U(r.real, r.imag);
      if ("boolean" == typeof r) return new U(r ? 1 : 0, 0);
      if ("number" == typeof r) return U.fromNumber(r);
      if ("bigint" == typeof r) return U.fromBigInt(r);
      try {
        return U.fromString(r);
      } catch {
        z(t, new P(e, n, t, "complex"));
      }
    }
    add(t) {
      return new U(this.real + t.real, this.imag + t.imag);
    }
    sub(t) {
      return new U(this.real - t.real, this.imag - t.imag);
    }
    mul(t) {
      const e = this.real * t.real - this.imag * t.imag,
        n = this.real * t.imag + this.imag * t.real;
      return new U(e, n);
    }
    div(t, e, n, r) {
      0 === r.real * r.real + r.imag * r.imag && z(n, new O(t, e));
      const i = this.real,
        o = this.imag,
        s = r.real,
        u = r.imag,
        a = Math.abs(s);
      let l, c;
      if (Math.abs(u) < a) {
        const t = u / s,
          e = s + u * t;
        ((l = (i + o * t) / e), (c = (o - i * t) / e));
      } else {
        const t = s / u,
          e = u + s * t;
        ((l = (i * t + o) / e), (c = (o * t - i) / e));
      }
      return new U(l, c);
    }
    pow(t) {
      const e = this.real,
        n = this.imag,
        r = t.real,
        i = t.imag,
        o = Math.sqrt(e * e + n * n),
        s = Math.atan2(n, e);
      if (0 === o) {
        if (r < 0 || 0 !== i) throw new Error("0 cannot be raised to a negative or complex power");
        return new U(0, 0);
      }
      const u = Math.log(o),
        a = r * u - i * s,
        l = i * u + r * s,
        c = Math.exp(a),
        p = c * Math.cos(l),
        h = c * Math.sin(l);
      return new U(p, h);
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
  var G, j;
  ((t => {
    class e {
      constructor(t, e) {
        ((this.startToken = t), (this.endToken = e));
      }
    }
    t.Expr = e;
    t.BigIntLiteral = class extends e {
      constructor(t, e, n) {
        (super(t, e), (this.kind = "BigIntLiteral"), (this.value = n));
      }
      accept(t) {
        return t.visitBigIntLiteralExpr(this);
      }
    };
    t.Binary = class extends e {
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
    };
    t.Compare = class extends e {
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
    };
    t.BoolOp = class extends e {
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
    };
    t.Grouping = class extends e {
      constructor(t, e, n) {
        (super(t, e), (this.kind = "Grouping"), (this.expression = n));
      }
      accept(t) {
        return t.visitGroupingExpr(this);
      }
    };
    t.Literal = class extends e {
      constructor(t, e, n) {
        (super(t, e), (this.kind = "Literal"), (this.value = n));
      }
      accept(t) {
        return t.visitLiteralExpr(this);
      }
    };
    t.Unary = class extends e {
      constructor(t, e, n, r) {
        (super(t, e), (this.kind = "Unary"), (this.operator = n), (this.right = r));
      }
      accept(t) {
        return t.visitUnaryExpr(this);
      }
    };
    t.Ternary = class extends e {
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
    };
    t.Lambda = class extends e {
      constructor(t, e, n, r) {
        (super(t, e), (this.kind = "Lambda"), (this.parameters = n), (this.body = r));
      }
      accept(t) {
        return t.visitLambdaExpr(this);
      }
    };
    t.MultiLambda = class extends e {
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
    };
    t.Variable = class extends e {
      constructor(t, e, n) {
        (super(t, e), (this.kind = "Variable"), (this.name = n));
      }
      accept(t) {
        return t.visitVariableExpr(this);
      }
    };
    t.Call = class extends e {
      constructor(t, e, n, r) {
        (super(t, e), (this.kind = "Call"), (this.callee = n), (this.args = r));
      }
      accept(t) {
        return t.visitCallExpr(this);
      }
    };
    t.List = class extends e {
      constructor(t, e, n) {
        (super(t, e), (this.kind = "List"), (this.elements = n));
      }
      accept(t) {
        return t.visitListExpr(this);
      }
    };
    t.Subscript = class extends e {
      constructor(t, e, n, r) {
        (super(t, e), (this.kind = "Subscript"), (this.value = n), (this.index = r));
      }
      accept(t) {
        return t.visitSubscriptExpr(this);
      }
    };
    t.Starred = class extends e {
      constructor(t, e, n) {
        (super(t, e), (this.kind = "Starred"), (this.value = n));
      }
      accept(t) {
        return t.visitStarredExpr(this);
      }
    };
    t.None = class extends e {
      constructor(t, e) {
        (super(t, e), (this.kind = "None"));
      }
      accept(t) {
        return t.visitNoneExpr(this);
      }
    };
    t.Complex = class extends e {
      constructor(t, e, n) {
        (super(t, e), (this.kind = "Complex"), (this.value = U.fromString(n)));
      }
      accept(t) {
        return t.visitComplexExpr(this);
      }
    };
  })(G || (G = {})),
    (t => {
      class e {
        constructor(t, e) {
          ((this.startToken = t), (this.endToken = e));
        }
      }
      t.Stmt = e;
      t.Pass = class extends e {
        constructor(t, e) {
          (super(t, e), (this.kind = "Pass"));
        }
        accept(t) {
          return t.visitPassStmt(this);
        }
      };
      t.Assign = class extends e {
        constructor(t, e, n, r) {
          (super(t, e), (this.kind = "Assign"), (this.target = n), (this.value = r));
        }
        accept(t) {
          return t.visitAssignStmt(this);
        }
      };
      t.AnnAssign = class extends e {
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
      };
      t.Break = class extends e {
        constructor(t, e) {
          (super(t, e), (this.kind = "Break"));
        }
        accept(t) {
          return t.visitBreakStmt(this);
        }
      };
      t.Continue = class extends e {
        constructor(t, e) {
          (super(t, e), (this.kind = "Continue"));
        }
        accept(t) {
          return t.visitContinueStmt(this);
        }
      };
      t.Return = class extends e {
        constructor(t, e, n) {
          (super(t, e), (this.kind = "Return"), (this.value = n));
        }
        accept(t) {
          return t.visitReturnStmt(this);
        }
      };
      t.FromImport = class extends e {
        constructor(t, e, n, r) {
          (super(t, e), (this.kind = "FromImport"), (this.module = n), (this.names = r));
        }
        accept(t) {
          return t.visitFromImportStmt(this);
        }
      };
      t.Global = class extends e {
        constructor(t, e, n) {
          (super(t, e), (this.kind = "Global"), (this.name = n));
        }
        accept(t) {
          return t.visitGlobalStmt(this);
        }
      };
      t.NonLocal = class extends e {
        constructor(t, e, n) {
          (super(t, e), (this.kind = "NonLocal"), (this.name = n));
        }
        accept(t) {
          return t.visitNonLocalStmt(this);
        }
      };
      t.Assert = class extends e {
        constructor(t, e, n) {
          (super(t, e), (this.kind = "Assert"), (this.value = n));
        }
        accept(t) {
          return t.visitAssertStmt(this);
        }
      };
      t.If = class extends e {
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
      };
      t.While = class extends e {
        constructor(t, e, n, r) {
          (super(t, e), (this.kind = "While"), (this.condition = n), (this.body = r));
        }
        accept(t) {
          return t.visitWhileStmt(this);
        }
      };
      t.For = class extends e {
        constructor(t, e, n, r, i) {
          (super(t, e), (this.kind = "For"), (this.target = n), (this.iter = r), (this.body = i));
        }
        accept(t) {
          return t.visitForStmt(this);
        }
      };
      t.FunctionDef = class extends e {
        constructor(t, e, n, r, i, o) {
          (super(t, e),
            (this.kind = "FunctionDef"),
            (this.name = n),
            (this.parameters = r),
            (this.body = i),
            (this.varDecls = o));
        }
        accept(t) {
          return t.visitFunctionDefStmt(this);
        }
      };
      t.SimpleExpr = class extends e {
        constructor(t, e, n) {
          (super(t, e), (this.kind = "SimpleExpr"), (this.expression = n));
        }
        accept(t) {
          return t.visitSimpleExprStmt(this);
        }
      };
      t.FileInput = class extends e {
        constructor(t, e, n, r) {
          (super(t, e), (this.kind = "FileInput"), (this.statements = n), (this.varDecls = r));
        }
        accept(t) {
          return t.visitFileInputStmt(this);
        }
      };
    })(j || (j = {})));
  const q = {
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
  function V(t) {
    const e = void 0 !== t.type ? (q[t.type] ?? _.NAME) : _.NAME,
      n = t.value ?? "",
      r = (t.col ?? 1) + n.length;
    return new N(e, n, t.line ?? 0, r, t.offset ?? 0);
  }
  function W(t, e) {
    return Object.assign(V(t), { isStarred: e });
  }
  function Q(t) {
    return t[0];
  }
  const H = ([t]) => {
      const e = V(t);
      return new G.BigIntLiteral(e, e, t.value);
    },
    Z = ([t]) => {
      const e = V(t);
      return new G.Literal(
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
    J = ([t, e, n]) => new G.Binary(t.startToken, n.endToken, t, e, n),
    Y = ([t, e, n]) => new G.BoolOp(t.startToken, n.endToken, t, V(e), n),
    X = ([t, e]) => new G.Unary(V(t), e.endToken, V(t), e),
    K = ([t]) => V(t),
    tt = ([t, e]) => [t, ...e.map(t => t[1])],
    et = [
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
            o = i[0]
              ? i[0].startToken
              : V({ type: "newline", value: "", line: 1, col: 1, offset: 0 }),
            s = i.length > 0 ? i[i.length - 1].endToken : o;
          return new j.FileInput(o, s, i, []);
        },
      },
      {
        name: "import_stmt",
        symbols: [{ literal: "from" }, "dotted_name", { literal: "import" }, "import_clause"],
        postprocess: ([t, e, , n]) => {
          const r = n[n.length - 1],
            i = r.alias || r.name;
          return new j.FromImport(V(t), i, e, n);
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
          const n = V(t);
          for (const [, t] of e) {
            const e = V(t);
            n.lexeme = n.lexeme + "." + e.lexeme;
          }
          return n;
        },
      },
      { name: "import_clause", symbols: ["import_as_names"], postprocess: Q },
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
        postprocess: tt,
      },
      {
        name: "import_as_name",
        symbols: [{ type: "name" }],
        postprocess: ([t]) => ({ name: V(t), alias: null }),
      },
      {
        name: "import_as_name",
        symbols: [{ type: "name" }, { literal: "as" }, { type: "name" }],
        postprocess: ([t, , e]) => ({ name: V(t), alias: V(e) }),
      },
      { name: "statement", symbols: ["statementAssign", { type: "newline" }], postprocess: Q },
      { name: "statement", symbols: ["statementAnnAssign", { type: "newline" }], postprocess: Q },
      {
        name: "statement",
        symbols: ["statementSubscriptAssign", { type: "newline" }],
        postprocess: Q,
      },
      { name: "statement", symbols: ["statementReturn", { type: "newline" }], postprocess: Q },
      { name: "statement", symbols: ["statementPass", { type: "newline" }], postprocess: Q },
      { name: "statement", symbols: ["statementBreak", { type: "newline" }], postprocess: Q },
      { name: "statement", symbols: ["statementContinue", { type: "newline" }], postprocess: Q },
      { name: "statement", symbols: ["statementGlobal", { type: "newline" }], postprocess: Q },
      { name: "statement", symbols: ["statementNonlocal", { type: "newline" }], postprocess: Q },
      { name: "statement", symbols: ["statementAssert", { type: "newline" }], postprocess: Q },
      { name: "statement", symbols: ["statementExpr", { type: "newline" }], postprocess: Q },
      { name: "statement", symbols: ["if_statement"], postprocess: Q },
      { name: "statement", symbols: ["statementWhile"], postprocess: Q },
      { name: "statement", symbols: ["statementFor"], postprocess: Q },
      { name: "statement", symbols: ["statementDef"], postprocess: Q },
      {
        name: "statementAssign",
        symbols: [{ type: "name" }, { literal: "=" }, "expression"],
        postprocess: ([t, , e]) => {
          const n = V(t);
          return new j.Assign(n, e.endToken, new G.Variable(n, n, n), e);
        },
      },
      {
        name: "statementAnnAssign",
        symbols: [{ type: "name" }, { literal: ":" }, "expression", { literal: "=" }, "expression"],
        postprocess: ([t, , e, , n]) => {
          const r = V(t);
          return new j.AnnAssign(r, n.endToken, new G.Variable(r, r, r), n, e);
        },
      },
      {
        name: "statementAnnAssign",
        symbols: [{ type: "name" }, { literal: ":" }, "expression"],
        postprocess: ([t, , e]) => {
          const n = V(t),
            r = new G.None(e.endToken, e.endToken);
          return new j.AnnAssign(n, e.endToken, new G.Variable(n, n, n), r, e);
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
            o = new G.Subscript(e.startToken, V(r), e, n);
          return new j.Assign(e.startToken, i.endToken, o, i);
        },
      },
      {
        name: "statementReturn",
        symbols: [{ literal: "return" }, "expression"],
        postprocess: ([t, e]) => new j.Return(V(t), e.endToken, e),
      },
      {
        name: "statementReturn",
        symbols: [{ literal: "return" }],
        postprocess: ([t]) => {
          const e = V(t);
          return new j.Return(e, e, null);
        },
      },
      {
        name: "statementPass",
        symbols: [{ literal: "pass" }],
        postprocess: ([t]) => {
          const e = V(t);
          return new j.Pass(e, e);
        },
      },
      {
        name: "statementBreak",
        symbols: [{ literal: "break" }],
        postprocess: ([t]) => {
          const e = V(t);
          return new j.Break(e, e);
        },
      },
      {
        name: "statementContinue",
        symbols: [{ literal: "continue" }],
        postprocess: ([t]) => {
          const e = V(t);
          return new j.Continue(e, e);
        },
      },
      {
        name: "statementGlobal",
        symbols: [{ literal: "global" }, { type: "name" }],
        postprocess: ([t, e]) => new j.Global(V(t), V(e), V(e)),
      },
      {
        name: "statementNonlocal",
        symbols: [{ literal: "nonlocal" }, { type: "name" }],
        postprocess: ([t, e]) => new j.NonLocal(V(t), V(e), V(e)),
      },
      {
        name: "statementAssert",
        symbols: [{ literal: "assert" }, "expression"],
        postprocess: ([t, e]) => new j.Assert(V(t), e.endToken, e),
      },
      {
        name: "statementExpr",
        symbols: ["expression"],
        postprocess: ([t]) => new j.SimpleExpr(t.startToken, t.endToken, t),
      },
      {
        name: "statementWhile",
        symbols: [{ literal: "while" }, "expression", { literal: ":" }, "block"],
        postprocess: ([t, e, , n]) => new j.While(V(t), n[n.length - 1].endToken, e, n),
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
        postprocess: ([t, e, , n, , r]) => new j.For(V(t), r[r.length - 1].endToken, V(e), n, r),
      },
      {
        name: "statementDef",
        symbols: [{ literal: "def" }, { type: "name" }, "params", { literal: ":" }, "block"],
        postprocess: ([t, e, n, , r]) =>
          new j.FunctionDef(V(t), r[r.length - 1].endToken, V(e), n, r, []),
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
        postprocess: Q,
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
          let o = i ? i[2] : null;
          for (let t = r.length - 1; t >= 0; t--) {
            const [e, n, , i] = r[t],
              s = o && o.length > 0 ? o[o.length - 1].endToken : i[i.length - 1].endToken;
            o = [new j.If(V(e), s, n, i, o)];
          }
          const s = o && o.length > 0 ? o[o.length - 1].endToken : n[n.length - 1].endToken;
          return new j.If(V(t), s, e, n, o);
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
        postprocess: ([t, e]) => [V(t), ...e.map(t => V(t[1]))],
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
      { name: "blockInline", symbols: ["statementAssign"], postprocess: Q },
      { name: "blockInline", symbols: ["statementAnnAssign"], postprocess: Q },
      { name: "blockInline", symbols: ["statementSubscriptAssign"], postprocess: Q },
      { name: "blockInline", symbols: ["statementReturn"], postprocess: Q },
      { name: "blockInline", symbols: ["statementPass"], postprocess: Q },
      { name: "blockInline", symbols: ["statementBreak"], postprocess: Q },
      { name: "blockInline", symbols: ["statementContinue"], postprocess: Q },
      { name: "blockInline", symbols: ["statementGlobal"], postprocess: Q },
      { name: "blockInline", symbols: ["statementNonlocal"], postprocess: Q },
      { name: "blockInline", symbols: ["statementAssert"], postprocess: Q },
      { name: "blockInline", symbols: ["statementExpr"], postprocess: Q },
      { name: "rest_names", symbols: [{ type: "name" }], postprocess: ([t]) => [W(t, !1)] },
      {
        name: "rest_names",
        symbols: [{ literal: "*" }, { type: "name" }],
        postprocess: ([, t]) => [W(t, !0)],
      },
      {
        name: "rest_names",
        symbols: ["rest_names", { literal: "," }, { type: "name" }],
        postprocess: ([t, , e]) => [...t, W(e, !1)],
      },
      {
        name: "rest_names",
        symbols: ["rest_names", { literal: "," }, { literal: "*" }, { type: "name" }],
        postprocess: ([t, , , e]) => [...t, W(e, !0)],
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
        postprocess: ([t, , e, , n]) => new G.Ternary(t.startToken, n.endToken, e, t, n),
      },
      { name: "expression", symbols: ["expressionOr"], postprocess: Q },
      { name: "expression", symbols: ["lambda_expr"], postprocess: Q },
      {
        name: "expressionOr",
        symbols: ["expressionOr", { literal: "or" }, "expressionAnd"],
        postprocess: Y,
      },
      { name: "expressionOr", symbols: ["expressionAnd"], postprocess: Q },
      {
        name: "expressionAnd",
        symbols: ["expressionAnd", { literal: "and" }, "expressionNot"],
        postprocess: Y,
      },
      { name: "expressionAnd", symbols: ["expressionNot"], postprocess: Q },
      { name: "expressionNot", symbols: [{ literal: "not" }, "expressionNot"], postprocess: X },
      { name: "expressionNot", symbols: ["expressionCmp"], postprocess: Q },
      {
        name: "expressionCmp",
        symbols: ["expressionCmp", "expressionCmpOp", "expressionAdd"],
        postprocess: ([t, e, n]) => new G.Compare(t.startToken, n.endToken, t, e, n),
      },
      { name: "expressionCmp", symbols: ["expressionAdd"], postprocess: Q },
      { name: "expressionCmpOp", symbols: [{ type: "less" }], postprocess: K },
      { name: "expressionCmpOp", symbols: [{ type: "greater" }], postprocess: K },
      { name: "expressionCmpOp", symbols: [{ type: "doubleequal" }], postprocess: K },
      { name: "expressionCmpOp", symbols: [{ type: "greaterequal" }], postprocess: K },
      { name: "expressionCmpOp", symbols: [{ type: "lessequal" }], postprocess: K },
      { name: "expressionCmpOp", symbols: [{ type: "notequal" }], postprocess: K },
      { name: "expressionCmpOp", symbols: [{ literal: "in" }], postprocess: K },
      {
        name: "expressionCmpOp",
        symbols: [{ literal: "not" }, { literal: "in" }],
        postprocess: ([t]) => {
          const e = V(t);
          return ((e.lexeme = "not in"), e);
        },
      },
      { name: "expressionCmpOp", symbols: [{ literal: "is" }], postprocess: K },
      {
        name: "expressionCmpOp",
        symbols: [{ literal: "is" }, { literal: "not" }],
        postprocess: ([t]) => {
          const e = V(t);
          return ((e.lexeme = "is not"), e);
        },
      },
      {
        name: "expressionAdd",
        symbols: ["expressionAdd", "expressionAddOp", "expressionMul"],
        postprocess: J,
      },
      { name: "expressionAdd", symbols: ["expressionMul"], postprocess: Q },
      { name: "expressionAddOp", symbols: [{ type: "plus" }], postprocess: K },
      { name: "expressionAddOp", symbols: [{ type: "minus" }], postprocess: K },
      {
        name: "expressionMul",
        symbols: ["expressionMul", "expressionMulOp", "expressionUnary"],
        postprocess: J,
      },
      { name: "expressionMul", symbols: ["expressionUnary"], postprocess: Q },
      { name: "expressionMulOp", symbols: [{ type: "star" }], postprocess: K },
      { name: "expressionMulOp", symbols: [{ type: "slash" }], postprocess: K },
      { name: "expressionMulOp", symbols: [{ type: "percent" }], postprocess: K },
      { name: "expressionMulOp", symbols: [{ type: "doubleslash" }], postprocess: K },
      { name: "expressionUnary", symbols: [{ type: "plus" }, "expressionUnary"], postprocess: X },
      { name: "expressionUnary", symbols: [{ type: "minus" }, "expressionUnary"], postprocess: X },
      { name: "expressionUnary", symbols: ["expressionPow"], postprocess: Q },
      {
        name: "expressionPow",
        symbols: ["expressionPost", { type: "doublestar" }, "expressionUnary"],
        postprocess: ([t, e, n]) => new G.Binary(t.startToken, n.endToken, t, V(e), n),
      },
      { name: "expressionPow", symbols: ["expressionPost"], postprocess: Q },
      {
        name: "expressionPost",
        symbols: ["expressionPost", { type: "lsqb" }, "expression", { type: "rsqb" }],
        postprocess: ([t, , e, n]) => new G.Subscript(t.startToken, V(n), t, e),
      },
      {
        name: "expressionPost",
        symbols: ["expressionPost", { literal: "(" }, "spread_expressions", { literal: ")" }],
        postprocess: ([t, , e, n]) => new G.Call(t.startToken, V(n), t, e),
      },
      {
        name: "expressionPost",
        symbols: ["expressionPost", { literal: "(" }, { literal: ")" }],
        postprocess: ([t, , e]) => new G.Call(t.startToken, V(e), t, []),
      },
      { name: "expressionPost", symbols: ["atom"], postprocess: Q },
      {
        name: "atom",
        symbols: [{ literal: "(" }, "expression", { literal: ")" }],
        postprocess: ([, t]) => new G.Grouping(t.startToken, t.endToken, t),
      },
      {
        name: "atom",
        symbols: [{ type: "lsqb" }, { type: "rsqb" }],
        postprocess: ([t, e]) => new G.List(V(t), V(e), []),
      },
      {
        name: "atom",
        symbols: [{ type: "lsqb" }, "expressions", { type: "rsqb" }],
        postprocess: ([t, e, n]) => new G.List(V(t), V(n), e),
      },
      {
        name: "atom",
        symbols: [{ type: "name" }],
        postprocess: ([t]) => {
          const e = V(t);
          return new G.Variable(e, e, e);
        },
      },
      {
        name: "atom",
        symbols: [{ type: "number_float" }],
        postprocess: ([t]) => {
          const e = V(t);
          return new G.Literal(e, e, parseFloat(t.value));
        },
      },
      { name: "atom", symbols: [{ type: "number_int" }], postprocess: H },
      { name: "atom", symbols: [{ type: "number_hex" }], postprocess: H },
      { name: "atom", symbols: [{ type: "number_oct" }], postprocess: H },
      { name: "atom", symbols: [{ type: "number_bin" }], postprocess: H },
      {
        name: "atom",
        symbols: [{ type: "number_complex" }],
        postprocess: ([t]) => {
          const e = V(t);
          return new G.Complex(e, e, t.value);
        },
      },
      { name: "atom", symbols: ["stringLit"], postprocess: Q },
      {
        name: "atom",
        symbols: [{ literal: "None" }],
        postprocess: ([t]) => {
          const e = V(t);
          return new G.None(e, e);
        },
      },
      {
        name: "atom",
        symbols: [{ literal: "True" }],
        postprocess: ([t]) => {
          const e = V(t);
          return new G.Literal(e, e, !0);
        },
      },
      {
        name: "atom",
        symbols: [{ literal: "False" }],
        postprocess: ([t]) => {
          const e = V(t);
          return new G.Literal(e, e, !1);
        },
      },
      {
        name: "lambda_expr",
        symbols: [{ literal: "lambda" }, "rest_names", { literal: ":" }, "expression"],
        postprocess: ([t, e, , n]) => new G.Lambda(V(t), n.endToken, e, n),
      },
      {
        name: "lambda_expr",
        symbols: [{ literal: "lambda" }, "rest_names", { type: "doublecolon" }, "block"],
        postprocess: ([t, e, , n]) => new G.MultiLambda(V(t), n[n.length - 1].endToken, e, n, []),
      },
      {
        name: "lambda_expr",
        symbols: [{ literal: "lambda" }, { literal: ":" }, "expression"],
        postprocess: ([t, , e]) => new G.Lambda(V(t), e.endToken, [], e),
      },
      {
        name: "lambda_expr",
        symbols: [{ literal: "lambda" }, { type: "doublecolon" }, "block"],
        postprocess: ([t, , e]) => new G.MultiLambda(V(t), e[e.length - 1].endToken, [], e, []),
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
        postprocess: Q,
      },
      { name: "expressions$ebnf$2", symbols: [], postprocess: () => null },
      {
        name: "expressions",
        symbols: ["expression", "expressions$ebnf$1", "expressions$ebnf$2"],
        postprocess: tt,
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
        postprocess: Q,
      },
      { name: "spread_expressions$ebnf$2", symbols: [], postprocess: () => null },
      {
        name: "spread_expressions",
        symbols: ["spread_expression", "spread_expressions$ebnf$1", "spread_expressions$ebnf$2"],
        postprocess: tt,
      },
      { name: "spread_expression", symbols: ["expression"], postprocess: Q },
      {
        name: "spread_expression",
        symbols: [{ type: "star" }, "expression"],
        postprocess: ([t, e]) => new G.Starred(V(t), e.endToken, e),
      },
      { name: "stringLit", symbols: [{ type: "string_triple_double" }], postprocess: Z },
      { name: "stringLit", symbols: [{ type: "string_triple_single" }], postprocess: Z },
      { name: "stringLit", symbols: [{ type: "string_double" }], postprocess: Z },
      { name: "stringLit", symbols: [{ type: "string_single" }], postprocess: Z },
    ];
  var nt,
    rt = { Lexer: C, ParserRules: et, ParserStart: "program" };
  class it {
    constructor(t, e) {
      this.source = t;
    }
    parse() {
      const t = new f.Parser(f.Grammar.fromCompiled({ ...rt, Lexer: C }));
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
  (t => {
    class e extends SyntaxError {
      constructor(t, e, n, r) {
        (super(`${t} at line ${n}\n                   ${e}`),
          (this.line = n),
          (this.col = r),
          (this.name = "BaseResolverError"));
      }
    }
    t.BaseResolverError = e;
    t.NameNotFoundError = class extends e {
      constructor(t, e, n, r, i, o) {
        const { lineIndex: s, fullLine: u } = T(n, r);
        let a = " This name is not found in the current or enclosing environment(s).";
        const l = i - r;
        if (
          ((a = a.padStart(a.length + l - 1 + 1, "^")),
          (a = a.padStart(a.length + e - l, " ")),
          null !== o)
        ) {
          let t = ` Perhaps you meant to type '${o}'?`;
          ((t = t.padStart(t.length + e - 1 + 1, " ")), (t = "\n" + t), (a += t));
        }
        (super("NameNotFoundError", "\n" + u + "\n" + a, s, e), (this.name = "NameNotFoundError"));
      }
    };
    t.NameReassignmentError = class extends e {
      constructor(t, e, n, r, i, o) {
        const { lineIndex: s, fullLine: u } = T(n, r);
        let a = " A name has been declared here.";
        const l = i - r;
        ((a = a.padStart(a.length + l - 1 + 1, "^")), (a = a.padStart(a.length + e - l, " ")));
        const { lineIndex: c, fullLine: p } = T(n, o.indexInSource),
          h = "\n" + p + "\n";
        let f = ` However, it has already been declared in the same environment at line ${c}, here: `;
        ((f = f.padStart(f.length + e - 1 + 1, " ")),
          (f = "\n" + f),
          (a += f),
          h.padStart(h.length + e - 1 + 1, " "),
          (a += h));
        (super("NameReassignmentError", "\n" + u + "\n" + a, s, e),
          (this.name = "NameReassignmentError"));
      }
    };
    t.BreakContinueError = class extends e {
      constructor(t, e, n, r, i) {
        const { lineIndex: o, fullLine: s } = T(n, r);
        let u = " A 'break' or 'continue' statement must be inside a loop body.";
        const a = i - r;
        ((u = u.padStart(u.length + a - 1 + 1, "^")), (u = u.padStart(u.length + e - a, " ")));
        const l = "BreakContinueError";
        (super(l, "\n" + s + "\n" + u, o, e), (this.name = l));
      }
    };
  })(nt || (nt = {}));
  var st = { exports: {} };
  const ut = new Uint32Array(65536),
    at = (t, e) => {
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
              let o = -1,
                s = 0,
                u = n,
                a = n;
              for (; a--; ) ut[t.charCodeAt(a)] |= 1 << a;
              for (a = 0; a < r; a++) {
                let t = ut[e.charCodeAt(a)];
                const n = t | s;
                ((t |= ((t & o) + o) ^ o),
                  (s |= ~(t | o)),
                  (o &= t),
                  s & i && u++,
                  o & i && u--,
                  (s = (s << 1) | 1),
                  (o = (o << 1) | ~(n | s)),
                  (s &= n));
              }
              for (a = n; a--; ) ut[t.charCodeAt(a)] = 0;
              return u;
            })(t, e)
          : ((t, e) => {
              const n = e.length,
                r = t.length,
                i = [],
                o = [],
                s = Math.ceil(n / 32),
                u = Math.ceil(r / 32);
              for (let t = 0; t < s; t++) ((o[t] = -1), (i[t] = 0));
              let a = 0;
              for (; a < u - 1; a++) {
                let s = 0,
                  u = -1;
                const l = 32 * a,
                  c = Math.min(32, r) + l;
                for (let e = l; e < c; e++) ut[t.charCodeAt(e)] |= 1 << e;
                for (let t = 0; t < n; t++) {
                  const n = ut[e.charCodeAt(t)],
                    r = (o[(t / 32) | 0] >>> t) & 1,
                    a = (i[(t / 32) | 0] >>> t) & 1,
                    l = n | s,
                    c = ((((n | a) & u) + u) ^ u) | n | a;
                  let p = s | ~(c | u),
                    h = u & c;
                  ((p >>> 31) ^ r && (o[(t / 32) | 0] ^= 1 << t),
                    (h >>> 31) ^ a && (i[(t / 32) | 0] ^= 1 << t),
                    (p = (p << 1) | r),
                    (h = (h << 1) | a),
                    (u = h | ~(l | p)),
                    (s = p & l));
                }
                for (let e = l; e < c; e++) ut[t.charCodeAt(e)] = 0;
              }
              let l = 0,
                c = -1;
              const p = 32 * a,
                h = Math.min(32, r - p) + p;
              for (let e = p; e < h; e++) ut[t.charCodeAt(e)] |= 1 << e;
              let f = r;
              for (let t = 0; t < n; t++) {
                const n = ut[e.charCodeAt(t)],
                  s = (o[(t / 32) | 0] >>> t) & 1,
                  u = (i[(t / 32) | 0] >>> t) & 1,
                  a = n | l,
                  p = ((((n | u) & c) + c) ^ c) | n | u;
                let h = l | ~(p | c),
                  m = c & p;
                ((f += (h >>> (r - 1)) & 1),
                  (f -= (m >>> (r - 1)) & 1),
                  (h >>> 31) ^ s && (o[(t / 32) | 0] ^= 1 << t),
                  (m >>> 31) ^ u && (i[(t / 32) | 0] ^= 1 << t),
                  (h = (h << 1) | s),
                  (m = (m << 1) | u),
                  (c = m | ~(a | h)),
                  (l = h & a));
              }
              for (let e = p; e < h; e++) ut[t.charCodeAt(e)] = 0;
              return f;
            })(t, e);
    };
  var lt,
    ct = u(
      Object.freeze({
        __proto__: null,
        closest: (t, e) => {
          let n = 1 / 0,
            r = 0;
          for (let i = 0; i < e.length; i++) {
            const o = at(t, e[i]);
            o < n && ((n = o), (r = i));
          }
          return e[r];
        },
        distance: at,
      }),
    );
  var pt =
      (lt ||
        ((lt = 1),
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
            var r = ct,
              i = [],
              o = [],
              s = {
                get: function (t, e, s) {
                  if (s && n && s.useCollator) {
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
                    for (l = 0; l < m; ++l) ((i[l] = l), (o[l] = e.charCodeAt(l)));
                    for (i[m] = m, l = 0; l < f; ++l) {
                      for (a = l + 1, c = 0; c < m; ++c)
                        ((u = a),
                          (h = 0 === n.compare(t.charAt(l), String.fromCharCode(o[c]))),
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
              ? (t.exports = s)
              : "undefined" != typeof self &&
                  "function" == typeof self.postMessage &&
                  "function" == typeof self.importScripts
                ? (self.Levenshtein = s)
                : "undefined" != typeof window && null !== window && (window.Levenshtein = s);
          })();
        })(st, st.exports)),
      st.exports),
    ht = s(pt);
  const ft = new N(_.AT, "", 0, 0, 0);
  class mt {
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
      for (; null !== r && !r.names.has(e); ) ((n += 1), (r = r.enclosing));
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
        throw new nt.NameNotFoundError(
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
        throw new nt.NameNotFoundError(
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
        throw new nt.NameReassignmentError(
          t.line,
          t.col,
          this.source,
          t.indexInSource,
          t.indexInSource + t.lexeme.length,
          e,
        );
      this.names.set(t.lexeme, ft);
    }
    suggestNameCurrentEnv(t) {
      const e = t.lexeme;
      let n = 1 / 0,
        r = null;
      for (const t of this.names.keys()) {
        const i = ht.get(e, t);
        i < n && ((n = i), (r = t));
      }
      return r;
    }
    suggestName(t) {
      const e = t.lexeme;
      let n = 1 / 0,
        r = null,
        i = this;
      for (; null !== i; ) {
        for (const t of i.names.keys()) {
          const i = ht.get(e, t);
          i < n && ((n = i), (r = t));
        }
        i = i.enclosing;
      }
      return n >= 4 ? null : r;
    }
  }
  class dt {
    constructor(t, e, n = [], r = [], i = []) {
      ((this.globalNamesInCurrentFunction = new Set()),
        (this.source = t),
        (this.ast = e),
        (this.source = t),
        (this.ast = e),
        (this.validators = n),
        (this.errors = []),
        (this.functionEnvironments = new Map()),
        (this.environment = new mt(
          t,
          null,
          new Map([
            ["range", new N(_.NAME, "range", 0, 0, 0)],
            ["__program__", new N(_.NAME, "__program__", 0, 0, 0)],
            ...r.flatMap(t =>
              Array.from(t.builtins.entries()).map(([t]) => [t, new N(_.NAME, t, 0, 0, 0)]),
            ),
            ...i.map(t => [t, new N(_.NAME, t, 0, 0, 0)]),
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
          (e instanceof j.FunctionDef &&
            (this.globalNamesInCurrentFunction.has(e.name.lexeme) ||
              this.environment?.declareName(e.name)),
            e instanceof j.Assign &&
              e.target instanceof G.Variable &&
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
      for (; e !== this.functionScope; ) {
        if (null !== e && e.names.has(t.lexeme)) {
          const n = e.names.get(t.lexeme);
          return void 0 === n
            ? void this.errors.push(new Error("placeholder error"))
            : void this.errors.push(
                new nt.NameReassignmentError(
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
      ((this.environment = new mt(this.source, this.environment, new Map())),
        this.functionEnvironments.set(t, this.environment),
        this.resolve(t.statements),
        (this.environment = e));
    }
    visitFunctionDefStmt(t) {
      this.environment?.functions.add(t.name.lexeme);
      const e = this.environment,
        n = new Map(t.parameters.map(t => [t.lexeme, t]));
      ((this.environment = new mt(this.source, this.environment, n)),
        this.functionEnvironments.set(t, this.environment),
        (this.functionScope = this.environment));
      const r = this.globalNamesInCurrentFunction;
      if (
        ((this.globalNamesInCurrentFunction = this.scanGlobalDeclarations(t.body)),
        this.globalNamesInCurrentFunction.size > 0)
      ) {
        let t = this.environment;
        for (; null !== t?.enclosing; ) t = t?.enclosing ?? null;
        if (t)
          for (const e of this.globalNamesInCurrentFunction)
            t.names.has(e) || t.names.set(e, new N(_.NAME, e, 0, 0, 0));
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
      if (e instanceof G.Subscript) return (this.resolve(e), void this.resolve(t.value));
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
            r instanceof j.Global
              ? e.add(r.name.lexeme)
              : r instanceof j.If
                ? (n(r.body),
                  Array.isArray(r.elseBlock) ? n(r.elseBlock) : r.elseBlock && n([r.elseBlock]))
                : (r instanceof j.While || r instanceof j.For) && n(r.body);
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
      ((this.environment = new mt(this.source, this.environment, n)),
        this.functionEnvironments.set(t, this.environment),
        this.resolve(t.body),
        (this.environment = e));
    }
    visitMultiLambdaExpr(t) {
      const e = this.environment,
        n = new Map(t.parameters.map(t => [t.lexeme, t]));
      ((this.environment = new mt(this.source, this.environment, n)),
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
  function gt() {
    return (
      (gt = Object.assign
        ? Object.assign.bind()
        : function (t) {
            for (var e = 1; e < arguments.length; e++) {
              var n = arguments[e];
              for (var r in n) ({}).hasOwnProperty.call(n, r) && (t[r] = n[r]);
            }
            return t;
          }),
      gt.apply(null, arguments)
    );
  }
  var yt = {
    relTol: 1e-12,
    absTol: 1e-15,
    matrix: "Matrix",
    number: "number",
    numberFallback: "number",
    precision: 64,
    predictable: !1,
    randomSeed: null,
  };
  function Dt(t, e) {
    if (vt(t, e)) return t[e];
    if (
      "function" == typeof t[e] &&
      (function (t, e) {
        if (null == t || "function" != typeof t[e]) return !1;
        if (fe(t, e) && Object.getPrototypeOf && e in Object.getPrototypeOf(t)) return !1;
        if (fe(wt, e)) return !0;
        if (e in Object.prototype) return !1;
        if (e in Function.prototype) return !1;
        return !0;
      })(t, e)
    )
      throw new Error('Cannot access method "' + e + '" as a property');
    throw new Error('No access to property "' + e + '"');
  }
  function vt(t, e) {
    return (
      !(
        !(function (t) {
          return "object" == typeof t && t && t.constructor === Object;
        })(t) && !Array.isArray(t)
      ) &&
      (!!fe(bt, e) || (!(e in Object.prototype) && !(e in Function.prototype)))
    );
  }
  var bt = { length: !0, name: !0 },
    wt = { toString: !0, valueOf: !0, toLocaleString: !0 };
  class Et {
    constructor(t) {
      ((this.wrappedObject = t), (this[Symbol.iterator] = this.entries));
    }
    keys() {
      return Object.keys(this.wrappedObject)
        .filter(t => this.has(t))
        .values();
    }
    get(t) {
      return Dt(this.wrappedObject, t);
    }
    set(t, e) {
      return (
        (function (t, e, n) {
          if (vt(t, e)) return ((t[e] = n), n);
          throw new Error('No access to property "' + e + '"');
        })(this.wrappedObject, t, e),
        this
      );
    }
    has(t) {
      return vt(this.wrappedObject, t) && t in this.wrappedObject;
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
      vt(this.wrappedObject, t) && delete this.wrappedObject[t];
    }
    clear() {
      for (var t of this.keys()) this.delete(t);
    }
    get size() {
      return Object.keys(this.wrappedObject).length;
    }
  }
  function xt(t) {
    return "number" == typeof t;
  }
  function At(t) {
    return (
      !(!t || "object" != typeof t || "function" != typeof t.constructor) &&
      ((!0 === t.isBigNumber &&
        "object" == typeof t.constructor.prototype &&
        !0 === t.constructor.prototype.isBigNumber) ||
        ("function" == typeof t.constructor.isDecimal && !0 === t.constructor.isDecimal(t)))
    );
  }
  function Ft(t) {
    return "bigint" == typeof t;
  }
  function Ct(t) {
    return (t && "object" == typeof t && !0 === Object.getPrototypeOf(t).isComplex) || !1;
  }
  function _t(t) {
    return (t && "object" == typeof t && !0 === Object.getPrototypeOf(t).isFraction) || !1;
  }
  function Nt(t) {
    return (t && !0 === t.constructor.prototype.isUnit) || !1;
  }
  function St(t) {
    return "string" == typeof t;
  }
  var Bt = Array.isArray;
  function Mt(t) {
    return (t && !0 === t.constructor.prototype.isMatrix) || !1;
  }
  function Tt(t) {
    return Array.isArray(t) || Mt(t);
  }
  function kt(t) {
    return (t && t.isDenseMatrix && !0 === t.constructor.prototype.isMatrix) || !1;
  }
  function It(t) {
    return (t && t.isSparseMatrix && !0 === t.constructor.prototype.isMatrix) || !1;
  }
  function Lt(t) {
    return (t && !0 === t.constructor.prototype.isRange) || !1;
  }
  function Ot(t) {
    return (t && !0 === t.constructor.prototype.isIndex) || !1;
  }
  function Pt(t) {
    return "boolean" == typeof t;
  }
  function Rt(t) {
    return (t && !0 === t.constructor.prototype.isResultSet) || !1;
  }
  function $t(t) {
    return (t && !0 === t.constructor.prototype.isHelp) || !1;
  }
  function zt(t) {
    return "function" == typeof t;
  }
  function Ut(t) {
    return t instanceof Date;
  }
  function Gt(t) {
    return t instanceof RegExp;
  }
  function jt(t) {
    return !(!t || "object" != typeof t || t.constructor !== Object || Ct(t) || _t(t));
  }
  function qt(t) {
    return (
      !!t &&
      (t instanceof Map ||
        t instanceof Et ||
        ("function" == typeof t.set &&
          "function" == typeof t.get &&
          "function" == typeof t.keys &&
          "function" == typeof t.has))
    );
  }
  function Vt(t) {
    return null === t;
  }
  function Wt(t) {
    return void 0 === t;
  }
  function Qt(t) {
    return (t && !0 === t.isAccessorNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function Ht(t) {
    return (t && !0 === t.isArrayNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function Zt(t) {
    return (t && !0 === t.isAssignmentNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function Jt(t) {
    return (t && !0 === t.isBlockNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function Yt(t) {
    return (t && !0 === t.isConditionalNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function Xt(t) {
    return (t && !0 === t.isConstantNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function Kt(t) {
    return (t && !0 === t.isFunctionAssignmentNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function te(t) {
    return (t && !0 === t.isFunctionNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function ee(t) {
    return (t && !0 === t.isIndexNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function ne(t) {
    return (t && !0 === t.isNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function re(t) {
    return (t && !0 === t.isObjectNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function ie(t) {
    return (t && !0 === t.isOperatorNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function oe(t) {
    return (t && !0 === t.isParenthesisNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function se(t) {
    return (t && !0 === t.isRangeNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function ue(t) {
    return (t && !0 === t.isRelationalNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function ae(t) {
    return (t && !0 === t.isSymbolNode && !0 === t.constructor.prototype.isNode) || !1;
  }
  function le(t) {
    return (t && !0 === t.constructor.prototype.isChain) || !1;
  }
  function ce(t) {
    var e = typeof t;
    return "object" === e
      ? null === t
        ? "null"
        : At(t)
          ? "BigNumber"
          : t.constructor && t.constructor.name
            ? t.constructor.name
            : "Object"
      : e;
  }
  function pe(t) {
    var e = typeof t;
    if ("number" === e || "bigint" === e || "string" === e || "boolean" === e || null == t)
      return t;
    if ("function" == typeof t.clone) return t.clone();
    if (Array.isArray(t))
      return t.map(function (t) {
        return pe(t);
      });
    if (t instanceof Date) return new Date(t.valueOf());
    if (At(t)) return t;
    if (jt(t))
      return (function (t, e) {
        var n = {};
        for (var r in t) fe(t, r) && (n[r] = e(t[r]));
        return n;
      })(t, pe);
    if ("function" === e) return t;
    throw new TypeError("Cannot clone: unknown type of value (value: ".concat(t, ")"));
  }
  function he(t, e) {
    var n, r, i;
    if (Array.isArray(t)) {
      if (!Array.isArray(e)) return !1;
      if (t.length !== e.length) return !1;
      for (r = 0, i = t.length; r < i; r++) if (!he(t[r], e[r])) return !1;
      return !0;
    }
    if ("function" == typeof t) return t === e;
    if (t instanceof Object) {
      if (Array.isArray(e) || !(e instanceof Object)) return !1;
      for (n in t) if (!(n in e) || !he(t[n], e[n])) return !1;
      for (n in e) if (!(n in t)) return !1;
      return !0;
    }
    return t === e;
  }
  function fe(t, e) {
    return t && Object.hasOwnProperty.call(t, e);
  }
  var me = function (t) {
    if (t)
      throw new Error(
        "The global config is readonly. \nPlease create a mathjs instance if you want to change the default configuration. \nExample:\n\n  import { create, all } from 'mathjs';\n  const mathjs = create(all);\n  mathjs.config({ number: 'BigNumber' });\n",
      );
    return Object.freeze(yt);
  };
  function de() {
    return !0;
  }
  function ge() {
    return !1;
  }
  function ye() {}
  gt(me, yt, {
    MATRIX_OPTIONS: ["Matrix", "Array"],
    NUMBER_OPTIONS: ["number", "BigNumber", "bigint", "Fraction"],
  });
  const De = "Argument is not a typed-function.";
  var ve = (function t() {
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
      r = { name: "any", test: de, isAny: !0 };
    let i,
      o,
      s = 0,
      u = { createCount: 0 };
    function a(t) {
      const e = i.get(t);
      if (e) return e;
      let n = 'Unknown type "' + t + '"';
      const r = t.toLowerCase();
      let s;
      for (s of o)
        if (s.toLowerCase() === r) {
          n += '. Did you mean "' + s + '" ?';
          break;
        }
      throw new TypeError(n);
    }
    function l(t) {
      let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "any";
      const n = e ? a(e).index : o.length,
        r = [];
      for (let e = 0; e < t.length; ++e) {
        if (!t[e] || "string" != typeof t[e].name || "function" != typeof t[e].test)
          throw new TypeError("Object with properties {name: string, test: function} expected");
        const o = t[e].name;
        if (i.has(o)) throw new TypeError('Duplicate type name "' + o + '"');
        (r.push(o),
          i.set(o, {
            name: o,
            test: t[e].test,
            isAny: t[e].isAny,
            index: n + e,
            conversionsTo: [],
          }));
      }
      const s = o.slice(n);
      o = o.slice(0, n).concat(r).concat(s);
      for (let t = n + r.length; t < o.length; ++t) i.get(o[t]).index = t;
    }
    function c() {
      ((i = new Map()), (o = []), (s = 0), l([r], !1));
    }
    function p(t) {
      const e = o.filter(e => {
        const n = i.get(e);
        return !n.isAny && n.test(t);
      });
      return e.length ? e : ["any"];
    }
    function h(t) {
      return t && "function" == typeof t && "_typedFunctionData" in t;
    }
    function f(t, e, n) {
      if (!h(t)) throw new TypeError(De);
      const r = n && n.exact,
        i = D(Array.isArray(e) ? e.join(",") : e),
        o = m(i);
      if (!r || o in t.signatures) {
        const e = t._typedFunctionData.signatureMap.get(o);
        if (e) return e;
      }
      const s = i.length;
      let u, a;
      if (r) {
        let e;
        for (e in ((u = []), t.signatures)) u.push(t._typedFunctionData.signatureMap.get(e));
      } else u = t._typedFunctionData.signatures;
      for (let t = 0; t < s; ++t) {
        const e = i[t],
          n = [];
        let r;
        for (r of u) {
          const i = E(r.params, t);
          if (i && (!e.restParam || i.restParam)) {
            if (!i.hasAny) {
              const t = y(i);
              if (e.types.some(e => !t.has(e.name))) continue;
            }
            n.push(r);
          }
        }
        if (((u = n), 0 === u.length)) break;
      }
      for (a of u) if (a.params.length <= s) return a;
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
          let n = s + 1,
            r = null;
          for (let i = 0; i < e.length; ++i)
            for (const o of e[i].conversionsTo)
              o.from === t && o.index < n && ((n = o.index), (r = o));
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
    function y(t) {
      return (
        t.typeSet || ((t.typeSet = new Set()), t.types.forEach(e => t.typeSet.add(e.name))),
        t.typeSet
      );
    }
    function D(t) {
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
      const e = z(t);
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
      return de;
    }
    function w(t) {
      let e, n, r;
      if (v(t)) {
        e = $(t).map(b);
        const n = e.length,
          r = b(z(t)),
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
      return e < t.length ? t[e] : v(t) ? z(t) : null;
    }
    function x(t, e) {
      const n = E(t, e);
      return n ? y(n) : new Set();
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
      const o = t || "unnamed";
      let s,
        u = n;
      for (s = 0; s < e.length; s++) {
        const t = [];
        if (
          (u.forEach(n => {
            const r = b(E(n.params, s));
            (s < n.params.length || v(n.params)) && r(e[s]) && t.push(n);
          }),
          0 === t.length)
        ) {
          if (((i = F(u, s)), i.length > 0)) {
            const t = p(e[s]);
            return (
              (r = new TypeError(
                "Unexpected type of argument in function " +
                  o +
                  " (expected: " +
                  i.join(" or ") +
                  ", actual: " +
                  t.join(" | ") +
                  ", index: " +
                  s +
                  ")",
              )),
              (r.data = { category: "wrongType", fn: o, index: s, actual: t, expected: i }),
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
          (i = F(u, s)),
          (r = new TypeError(
            "Too few arguments in function " +
              o +
              " (expected: " +
              i.join(" or ") +
              ", index: " +
              e.length +
              ")",
          )),
          (r.data = { category: "tooFewArgs", fn: o, index: e.length, expected: i }),
          r
        );
      const l = Math.max.apply(null, a);
      if (e.length > l)
        return (
          (r = new TypeError(
            "Too many arguments in function " +
              o +
              " (expected: " +
              l +
              ", actual: " +
              e.length +
              ")",
          )),
          (r.data = { category: "tooManyArgs", fn: o, index: e.length, expectedLength: l }),
          r
        );
      const c = [];
      for (let t = 0; t < e.length; ++t) c.push(p(e[t]).join("|"));
      return (
        (r = new TypeError(
          'Arguments of type "' +
            c.join(", ") +
            '" do not match any of the defined signatures of function ' +
            o +
            ".",
        )),
        (r.data = { category: "mismatch", actual: c }),
        r
      );
    }
    function _(t) {
      let e = o.length + 1;
      for (let n = 0; n < t.types.length; n++) e = Math.min(e, t.types[n].typeIndex);
      return e;
    }
    function N(t) {
      let e = s + 1;
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
      const o = r - i;
      return o < 0 ? -1e-7 : o > 0 ? 1e-7 : 0;
    }
    function B(t, e) {
      const n = t.params,
        r = e.params,
        i = z(n),
        o = z(r),
        s = v(n),
        u = v(r);
      if (s && i.hasAny) {
        if (!u || !o.hasAny) return 1e7;
      } else if (u && o.hasAny) return -1e7;
      let a,
        l = 0,
        c = 0;
      for (a of n) (a.hasAny && ++l, a.hasConversion && ++c);
      let p = 0,
        h = 0;
      for (a of r) (a.hasAny && ++p, a.hasConversion && ++h);
      if (l !== p) return 1e6 * (l - p);
      if (s && i.hasConversion) {
        if (!u || !o.hasConversion) return 1e5;
      } else if (u && o.hasConversion) return -1e5;
      if (c !== h) return 1e4 * (c - h);
      if (s) {
        if (!u) return 1e3;
      } else if (u) return -1e3;
      const f = (n.length - r.length) * (s ? -100 : 100);
      if (0 !== f) return f;
      const m = [];
      let d,
        g = 0;
      for (let t = 0; t < n.length; ++t) {
        const e = S(n[t], r[t]);
        (m.push(e), (g += e));
      }
      if (0 !== g) return (g < 0 ? -10 : 10) + g;
      let y = 9;
      const D = y / (m.length + 1);
      for (d of m) {
        if (0 !== d) return (d < 0 ? -y : y) + d;
        y -= D;
      }
      return 0;
    }
    function M(t, e) {
      let n = e,
        r = "";
      if (t.some(t => t.hasConversion)) {
        const i = v(t),
          o = t.map(T);
        ((r = o.map(t => t.name).join(";")),
          (n = function () {
            const t = [],
              n = i ? arguments.length - 1 : arguments.length;
            for (let e = 0; e < n; e++) t[e] = o[e](arguments[e]);
            return (i && (t[n] = arguments[n].map(o[n])), e.apply(this, t));
          }));
      }
      let i = n;
      if (v(t)) {
        const e = t.length - 1;
        i = function () {
          return n.apply(this, U(arguments, 0, e).concat([U(arguments, e)]));
        };
      }
      return (r && Object.defineProperty(i, "name", { value: r }), i);
    }
    function T(t) {
      let e, n, r, i;
      const o = [],
        s = [];
      let u = "";
      (t.types.forEach(function (t) {
        t.conversion &&
          ((u += t.conversion.from + "~>" + t.conversion.to + ","),
          o.push(a(t.conversion.from).test),
          s.push(t.conversion.convert));
      }),
        (u = u ? u.slice(0, -1) : "pass"));
      let l = t => t;
      switch (s.length) {
        case 0:
          break;
        case 1:
          ((e = o[0]),
            (r = s[0]),
            (l = function (t) {
              return e(t) ? r(t) : t;
            }));
          break;
        case 2:
          ((e = o[0]),
            (n = o[1]),
            (r = s[0]),
            (i = s[1]),
            (l = function (t) {
              return e(t) ? r(t) : n(t) ? i(t) : t;
            }));
          break;
        default:
          l = function (t) {
            for (let e = 0; e < s.length; e++) if (o[e](t)) return s[e](t);
            return t;
          };
      }
      return (Object.defineProperty(l, "name", { value: u }), l);
    }
    function k(t) {
      return (function t(e, n, r) {
        if (n < e.length) {
          const s = e[n];
          let u = [];
          if (s.restParam) {
            const t = s.types.filter(A);
            (t.length < s.types.length &&
              u.push({
                types: t,
                name: "..." + t.map(t => t.name).join("|"),
                hasAny: t.some(t => t.isAny),
                hasConversion: !1,
                restParam: !0,
              }),
              u.push(s));
          } else
            u = s.types.map(function (t) {
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
            (o = function (i) {
              return t(e, n + 1, r.concat([i]));
            }),
            Array.prototype.concat.apply([], i.map(o))
          );
        }
        return [r];
        var i, o;
      })(t, 0, []);
    }
    function I(t, e) {
      const n = Math.max(t.length, e.length);
      for (let r = 0; r < n; r++) {
        const n = x(t, r),
          i = x(e, r);
        let o,
          s = !1;
        for (o of i)
          if (n.has(o)) {
            s = !0;
            break;
          }
        if (!s) return !1;
      }
      const r = t.length,
        i = e.length,
        o = v(t),
        s = v(e);
      return o ? (s ? r === i : i >= r) : s ? r >= i : r === i;
    }
    function L(t, e, n) {
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
      const r = (function (t) {
          return t.map(t =>
            V(t)
              ? j(t.referToSelf.callback)
              : q(t)
                ? G(t.referTo.references, t.referTo.callback)
                : t,
          );
        })(t),
        i = new Array(r.length).fill(!1);
      let o = !0;
      for (; o; ) {
        o = !1;
        let t = !0;
        for (let s = 0; s < r.length; ++s) {
          if (i[s]) continue;
          const u = r[s];
          if (V(u))
            ((r[s] = u.referToSelf.callback(n)),
              (r[s].referToSelf = u.referToSelf),
              (i[s] = !0),
              (t = !1));
          else if (q(u)) {
            const n = L(u.referTo.references, r, e);
            n
              ? ((r[s] = u.referTo.callback.apply(this, n)),
                (r[s].referTo = u.referTo),
                (i[s] = !0),
                (t = !1))
              : (o = !0);
          }
        }
        if (t && o) throw new SyntaxError("Circular reference detected in resolving typed.referTo");
      }
      return r;
    }
    function P(t, e) {
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
        o = [];
      let s;
      for (s in e) {
        if (!Object.prototype.hasOwnProperty.call(e, s)) continue;
        const t = D(s);
        if (!t) continue;
        (n.forEach(function (e) {
          if (I(e, t))
            throw new TypeError('Conflicting signatures "' + m(e) + '" and "' + m(t) + '".');
        }),
          n.push(t));
        const u = r.length;
        r.push(e[s]);
        const a = t.map(g);
        let l;
        for (l of k(a)) {
          const t = m(l);
          (o.push({ params: l, name: t, fn: u }), l.every(t => !t.hasConversion) && (i[t] = u));
        }
      }
      o.sort(B);
      const a = O(r, i, ot);
      let l;
      for (l in i) Object.prototype.hasOwnProperty.call(i, l) && (i[l] = a[i[l]]);
      const c = [],
        p = new Map();
      for (l of o) p.has(l.name) || ((l.fn = a[l.fn]), c.push(l), p.set(l.name, l));
      const h = c[0] && c[0].params.length <= 2 && !v(c[0].params),
        f = c[1] && c[1].params.length <= 2 && !v(c[1].params),
        d = c[2] && c[2].params.length <= 2 && !v(c[2].params),
        y = c[3] && c[3].params.length <= 2 && !v(c[3].params),
        E = c[4] && c[4].params.length <= 2 && !v(c[4].params),
        x = c[5] && c[5].params.length <= 2 && !v(c[5].params),
        A = h && f && d && y && E && x;
      for (let t = 0; t < c.length; ++t) c[t].test = w(c[t].params);
      const F = h ? b(c[0].params[0]) : ge,
        C = f ? b(c[1].params[0]) : ge,
        _ = d ? b(c[2].params[0]) : ge,
        N = y ? b(c[3].params[0]) : ge,
        S = E ? b(c[4].params[0]) : ge,
        T = x ? b(c[5].params[0]) : ge,
        L = h ? b(c[0].params[1]) : ge,
        P = f ? b(c[1].params[1]) : ge,
        R = d ? b(c[2].params[1]) : ge,
        $ = y ? b(c[3].params[1]) : ge,
        z = E ? b(c[4].params[1]) : ge,
        U = x ? b(c[5].params[1]) : ge;
      for (let t = 0; t < c.length; ++t) c[t].implementation = M(c[t].params, c[t].fn);
      const G = h ? c[0].implementation : ye,
        j = f ? c[1].implementation : ye,
        q = d ? c[2].implementation : ye,
        V = y ? c[3].implementation : ye,
        W = E ? c[4].implementation : ye,
        Q = x ? c[5].implementation : ye,
        H = h ? c[0].params.length : -1,
        Z = f ? c[1].params.length : -1,
        J = d ? c[2].params.length : -1,
        Y = y ? c[3].params.length : -1,
        X = E ? c[4].params.length : -1,
        K = x ? c[5].params.length : -1,
        tt = A ? 6 : 0,
        et = c.length,
        nt = c.map(t => t.test),
        rt = c.map(t => t.implementation),
        it = function () {
          for (let t = tt; t < et; t++) if (nt[t](arguments)) return rt[t].apply(this, arguments);
          return u.onMismatch(t, arguments, c);
        };
      function ot(t, e) {
        return arguments.length === H && F(t) && L(e)
          ? G.apply(this, arguments)
          : arguments.length === Z && C(t) && P(e)
            ? j.apply(this, arguments)
            : arguments.length === J && _(t) && R(e)
              ? q.apply(this, arguments)
              : arguments.length === Y && N(t) && $(e)
                ? V.apply(this, arguments)
                : arguments.length === X && S(t) && z(e)
                  ? W.apply(this, arguments)
                  : arguments.length === K && T(t) && U(e)
                    ? Q.apply(this, arguments)
                    : it.apply(this, arguments);
      }
      try {
        Object.defineProperty(ot, "name", { value: t });
      } catch (t) {}
      return (
        (ot.signatures = i),
        (ot._typedFunctionData = { signatures: c, signatureMap: p }),
        ot
      );
    }
    function R(t, e, n) {
      throw C(t, e, n);
    }
    function $(t) {
      return U(t, 0, t.length - 1);
    }
    function z(t) {
      return t[t.length - 1];
    }
    function U(t, e, n) {
      return Array.prototype.slice.call(t, e, n);
    }
    function G(t, e) {
      return { referTo: { references: t, callback: e } };
    }
    function j(t) {
      if ("function" != typeof t)
        throw new TypeError("Callback function expected as first argument");
      return { referToSelf: { callback: t } };
    }
    function q(t) {
      return (
        t &&
        "object" == typeof t.referTo &&
        Array.isArray(t.referTo.references) &&
        "function" == typeof t.referTo.callback
      );
    }
    function V(t) {
      return t && "object" == typeof t.referToSelf && "function" == typeof t.referToSelf.callback;
    }
    function W(t, e) {
      if (!t) return e;
      if (e && e !== t) {
        const n = new Error("Function names do not match (expected: " + t + ", actual: " + e + ")");
        throw ((n.data = { actual: e, expected: t }), n);
      }
      return t;
    }
    function Q(t) {
      let e;
      for (const n in t)
        Object.prototype.hasOwnProperty.call(t, n) &&
          (h(t[n]) || "string" == typeof t[n].signature) &&
          (e = W(e, t[n].name));
      return e;
    }
    function H(t, e) {
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
    const Z = u;
    function J(t) {
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
          const o = arguments[t];
          let s,
            u = {};
          if (
            ("function" == typeof o
              ? ((s = o.name),
                "string" == typeof o.signature ? (u[o.signature] = o) : h(o) && (u = o.signatures))
              : e(o) && ((u = o), n || (s = Q(o))),
            0 === Object.keys(u).length)
          ) {
            const e = new TypeError(
              "Argument to 'typed' at index " +
                t +
                " is not a (typed) function, nor an object with signatures as keys and functions as values.",
            );
            throw ((e.data = { index: t, argument: o }), e);
          }
          (n || (r = W(r, s)), H(i, u));
        }
        return P(r || "", i);
      }),
      (u.create = t),
      (u.createCount = Z.createCount),
      (u.onMismatch = R),
      (u.throwMismatchError = R),
      (u.createError = C),
      (u.clear = c),
      (u.clearConversions = function () {
        let t;
        for (t of o) i.get(t).conversionsTo = [];
        s = 0;
      }),
      (u.addTypes = l),
      (u._findType = a),
      (u.referTo = function () {
        const t = $(arguments).map(t => m(D(t))),
          e = z(arguments);
        if ("function" != typeof e)
          throw new TypeError("Callback function expected as last argument");
        return G(t, e);
      }),
      (u.referToSelf = j),
      (u.convert = function (t, e) {
        const n = a(e);
        if (n.test(t)) return t;
        const r = n.conversionsTo;
        if (0 === r.length) throw new Error("There are no conversions to " + e + " defined.");
        for (let e = 0; e < r.length; e++) {
          if (a(r[e].from).test(t)) return r[e].convert(t);
        }
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
        J(t);
        const n = a(t.to),
          r = n.conversionsTo.find(e => e.from === t.from);
        if (r) {
          if (!e || !e.override)
            throw new Error(
              'There is already a conversion from "' + t.from + '" to "' + n.name + '"',
            );
          u.removeConversion({ from: r.from, to: t.to, convert: r.convert });
        }
        n.conversionsTo.push({ from: t.from, to: n.name, convert: t.convert, index: s++ });
      }),
      (u.addConversions = function (t, e) {
        t.forEach(t => u.addConversion(t, e));
      }),
      (u.removeConversion = function (t) {
        J(t);
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
        if (!h(t)) throw new TypeError(De);
        const n = t._typedFunctionData.signatures;
        for (let t = 0; t < n.length; ++t) if (n[t].test(e)) return n[t];
        return null;
      }),
      u
    );
  })();
  function be(t, e, n, r) {
    function i(r) {
      var i = (function (t, e) {
        for (var n = {}, r = 0; r < e.length; r++) {
          var i = e[r],
            o = t[i];
          void 0 !== o && (n[i] = o);
        }
        return n;
      })(r, e.map(we));
      return (
        (function (t, e, n) {
          var r = e
            .filter(
              t =>
                !(function (t) {
                  return t && "?" === t[0];
                })(t),
            )
            .every(t => void 0 !== n[t]);
          if (!r) {
            var i = e.filter(t => void 0 === n[t]);
            throw new Error(
              'Cannot create function "'.concat(t, '", ') +
                "some dependencies are missing: ".concat(
                  i.map(t => '"'.concat(t, '"')).join(", "),
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
  function we(t) {
    return t && "?" === t[0] ? t.slice(1) : t;
  }
  function Ee(t) {
    return "boolean" == typeof t || (!!isFinite(t) && t === Math.round(t));
  }
  var xe =
    Math.sign ||
    function (t) {
      return t > 0 ? 1 : t < 0 ? -1 : 0;
    };
  function Ae(t, e, n) {
    var r = { 2: "0b", 8: "0o", 16: "0x" }[e],
      i = "";
    if (n) {
      if (n < 1) throw new Error("size must be in greater than 0");
      if (!Ee(n)) throw new Error("size must be an integer");
      if (t > 2 ** (n - 1) - 1 || t < -(2 ** (n - 1)))
        throw new Error("Value must be in range [-2^".concat(n - 1, ", 2^").concat(n - 1, "-1]"));
      if (!Ee(t)) throw new Error("Value must be an integer");
      (t < 0 && (t += 2 ** n), (i = "i".concat(n)));
    }
    var o = "";
    return (t < 0 && ((t = -t), (o = "-")), "".concat(o).concat(r).concat(t.toString(e)).concat(i));
  }
  function Fe(t, e) {
    if ("function" == typeof e) return e(t);
    if (t === 1 / 0) return "Infinity";
    if (t === -1 / 0) return "-Infinity";
    if (isNaN(t)) return "NaN";
    var { notation: n, precision: r, wordSize: i } = Ce(e);
    switch (n) {
      case "fixed":
        return (function (t, e) {
          if (isNaN(t) || !isFinite(t)) return String(t);
          var n = _e(t),
            r = "number" == typeof e ? Se(n, n.exponent + 1 + e) : n,
            i = r.coefficients,
            o = r.exponent + 1,
            s = o + (e || 0);
          i.length < s && (i = i.concat(Be(s - i.length)));
          o < 0 && ((i = Be(1 - o).concat(i)), (o = 1));
          o < i.length && i.splice(o, 0, 0 === o ? "0." : ".");
          return r.sign + i.join("");
        })(t, r);
      case "exponential":
        return Ne(t, r);
      case "engineering":
        return (function (t, e) {
          if (isNaN(t) || !isFinite(t)) return String(t);
          var n = _e(t),
            r = Se(n, e),
            i = r.exponent,
            o = r.coefficients,
            s = i % 3 == 0 ? i : i < 0 ? i - 3 - (i % 3) : i - (i % 3);
          if (xt(e)) for (; e > o.length || i - s + 1 > o.length; ) o.push(0);
          else for (var u = Math.abs(i - s) - (o.length - 1), a = 0; a < u; a++) o.push(0);
          var l = Math.abs(i - s),
            c = 1;
          for (; l > 0; ) (c++, l--);
          var p = o.slice(c).join(""),
            h = (xt(e) && p.length) || p.match(/[1-9]/) ? "." + p : "",
            f = o.slice(0, c).join("") + h + "e" + (i >= 0 ? "+" : "") + s.toString();
          return r.sign + f;
        })(t, r);
      case "bin":
        return Ae(t, 2, i);
      case "oct":
        return Ae(t, 8, i);
      case "hex":
        return Ae(t, 16, i);
      case "auto":
        return (function (t, e, n) {
          if (isNaN(t) || !isFinite(t)) return String(t);
          var r = ke(null == n ? void 0 : n.lowerExp, -3),
            i = ke(null == n ? void 0 : n.upperExp, 5),
            o = _e(t),
            s = e ? Se(o, e) : o;
          if (s.exponent < r || s.exponent >= i) return Ne(t, e);
          var u = s.coefficients,
            a = s.exponent;
          (u.length < e && (u = u.concat(Be(e - u.length))),
            (u = u.concat(Be(a - u.length + 1 + (u.length < e ? e - u.length : 0)))));
          var l = a > 0 ? a : 0;
          return (
            l < (u = Be(-a).concat(u)).length - 1 && u.splice(l + 1, 0, "."),
            s.sign + u.join("")
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
  function Ce(t) {
    var e,
      n,
      r = "auto";
    if (void 0 !== t)
      if (xt(t)) e = t;
      else if (At(t)) e = t.toNumber();
      else {
        if (!jt(t))
          throw new Error("Unsupported type of options, number, BigNumber, or object expected");
        (void 0 !== t.precision &&
          (e = Te(t.precision, () => {
            throw new Error('Option "precision" must be a number or BigNumber');
          })),
          void 0 !== t.wordSize &&
            (n = Te(t.wordSize, () => {
              throw new Error('Option "wordSize" must be a number or BigNumber');
            })),
          t.notation && (r = t.notation));
      }
    return { notation: r, precision: e, wordSize: n };
  }
  function _e(t) {
    var e = String(t)
      .toLowerCase()
      .match(/^(-?)(\d+\.?\d*)(e([+-]?\d+))?$/);
    if (!e) throw new SyntaxError("Invalid number " + t);
    var n = e[1],
      r = e[2],
      i = parseFloat(e[4] || "0"),
      o = r.indexOf(".");
    i += -1 !== o ? o - 1 : r.length - 1;
    var s = r
      .replace(".", "")
      .replace(/^0*/, function (t) {
        return ((i -= t.length), "");
      })
      .replace(/0*$/, "")
      .split("")
      .map(function (t) {
        return parseInt(t);
      });
    return (0 === s.length && (s.push(0), i++), { sign: n, coefficients: s, exponent: i });
  }
  function Ne(t, e) {
    if (isNaN(t) || !isFinite(t)) return String(t);
    var n = _e(t),
      r = e ? Se(n, e) : n,
      i = r.coefficients,
      o = r.exponent;
    i.length < e && (i = i.concat(Be(e - i.length)));
    var s = i.shift();
    return r.sign + s + (i.length > 0 ? "." + i.join("") : "") + "e" + (o >= 0 ? "+" : "") + o;
  }
  function Se(t, e) {
    for (
      var n = { sign: t.sign, coefficients: t.coefficients, exponent: t.exponent },
        r = n.coefficients;
      e <= 0;
    )
      (r.unshift(0), n.exponent++, e++);
    if (r.length > e && r.splice(e, r.length - e)[0] >= 5) {
      var i = e - 1;
      for (r[i]++; 10 === r[i]; ) (r.pop(), 0 === i && (r.unshift(0), n.exponent++, i++), r[--i]++);
    }
    return n;
  }
  function Be(t) {
    for (var e = [], n = 0; n < t; n++) e.push(0);
    return e;
  }
  function Me(t, e) {
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
  function Te(t, e) {
    return xt(t) ? t : At(t) ? t.toNumber() : void e();
  }
  function ke(t, e) {
    return xt(t) ? t : At(t) ? t.toNumber() : e;
  }
  var Ie = function () {
      return ((Ie = ve.create), ve);
    },
    Le = be("typed", ["?BigNumber", "?Complex", "?DenseMatrix", "?Fraction"], function (t) {
      var { BigNumber: e, Complex: n, DenseMatrix: r, Fraction: i } = t,
        o = Ie();
      return (
        o.clear(),
        o.addTypes([
          { name: "number", test: xt },
          { name: "Complex", test: Ct },
          { name: "BigNumber", test: At },
          { name: "bigint", test: Ft },
          { name: "Fraction", test: _t },
          { name: "Unit", test: Nt },
          {
            name: "identifier",
            test: t =>
              St &&
              /^(?:[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CD\uA7D0\uA7D1\uA7D3\uA7D5-\uA7DC\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC4\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD887][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF39\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD888[\uDC00-\uDFAF])(?:[0-9A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088E\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7CD\uA7D0\uA7D1\uA7D3\uA7D5-\uA7DC\uA7F2-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDD70-\uDD7A\uDD7C-\uDD8A\uDD8C-\uDD92\uDD94\uDD95\uDD97-\uDDA1\uDDA3-\uDDB1\uDDB3-\uDDB9\uDDBB\uDDBC\uDDC0-\uDDF3\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67\uDF80-\uDF85\uDF87-\uDFB0\uDFB2-\uDFBA]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDD4A-\uDD65\uDD6F-\uDD85\uDE80-\uDEA9\uDEB0\uDEB1\uDEC2-\uDEC4\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDF70-\uDF81\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC71\uDC72\uDC75\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE3F\uDE40\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61\uDF80-\uDF89\uDF8B\uDF8E\uDF90-\uDFB5\uDFB7\uDFD1\uDFD3]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A\uDF40-\uDF46]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEB0-\uDEF8\uDFC0-\uDFE0]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDF02\uDF04-\uDF10\uDF12-\uDF33\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|\uD80B[\uDF90-\uDFF0]|[\uD80C\uD80E\uD80F\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883\uD885-\uD887][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2F\uDC41-\uDC46\uDC60-\uDFFF]|\uD810[\uDC00-\uDFFA]|\uD811[\uDC00-\uDE46]|\uD818[\uDD00-\uDD1D]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE70-\uDEBE\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDD40-\uDD6C\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDCFF-\uDD08]|\uD82B[\uDFF0-\uDFF3\uDFF5-\uDFFB\uDFFD\uDFFE]|\uD82C[\uDC00-\uDD22\uDD32\uDD50-\uDD52\uDD55\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD837[\uDF00-\uDF1E\uDF25-\uDF2A]|\uD838[\uDC30-\uDC6D\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDE90-\uDEAD\uDEC0-\uDEEB]|\uD839[\uDCD0-\uDCEB\uDDD0-\uDDED\uDDF0\uDFE0-\uDFE6\uDFE8-\uDFEB\uDFED\uDFEE\uDFF0-\uDFFE]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF39\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0\uDFF0-\uDFFF]|\uD87B[\uDC00-\uDE5D]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A\uDF50-\uDFFF]|\uD888[\uDC00-\uDFAF])*$/.test(
                t,
              ),
          },
          { name: "string", test: St },
          { name: "Chain", test: le },
          { name: "Array", test: Bt },
          { name: "Matrix", test: Mt },
          { name: "DenseMatrix", test: kt },
          { name: "SparseMatrix", test: It },
          { name: "Range", test: Lt },
          { name: "Index", test: Ot },
          { name: "boolean", test: Pt },
          { name: "ResultSet", test: Rt },
          { name: "Help", test: $t },
          { name: "function", test: zt },
          { name: "Date", test: Ut },
          { name: "RegExp", test: Gt },
          { name: "null", test: Vt },
          { name: "undefined", test: Wt },
          { name: "AccessorNode", test: Qt },
          { name: "ArrayNode", test: Ht },
          { name: "AssignmentNode", test: Zt },
          { name: "BlockNode", test: Jt },
          { name: "ConditionalNode", test: Yt },
          { name: "ConstantNode", test: Xt },
          { name: "FunctionNode", test: te },
          { name: "FunctionAssignmentNode", test: Kt },
          { name: "IndexNode", test: ee },
          { name: "Node", test: ne },
          { name: "ObjectNode", test: re },
          { name: "OperatorNode", test: ie },
          { name: "ParenthesisNode", test: oe },
          { name: "RangeNode", test: se },
          { name: "RelationalNode", test: ue },
          { name: "SymbolNode", test: ae },
          { name: "Map", test: qt },
          { name: "Object", test: jt },
        ]),
        o.addConversions([
          {
            from: "number",
            to: "BigNumber",
            convert: function (t) {
              if (
                (e || Oe(t),
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
              return (n || Pe(t), new n(t, 0));
            },
          },
          {
            from: "BigNumber",
            to: "Complex",
            convert: function (t) {
              return (n || Pe(t), new n(t.toNumber(), 0));
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
              return (e || Oe(t), new e(t.toString()));
            },
          },
          {
            from: "bigint",
            to: "Fraction",
            convert: function (t) {
              return (i || Re(t), new i(t));
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
              return (n || Pe(t), new n(t.valueOf(), 0));
            },
          },
          {
            from: "number",
            to: "Fraction",
            convert: function (t) {
              i || Re(t);
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
              e || Oe(t);
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
              i || Re(t);
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
              n || Pe(t);
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
              return (e || Oe(t), new e(+t));
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
              return (i || Re(t), new i(+t));
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
        (o.onMismatch = (t, e, n) => {
          var r = o.createError(t, e, n);
          if (
            ["wrongType", "mismatch"].includes(r.data.category) &&
            1 === e.length &&
            Tt(e[0]) &&
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
        (o.onMismatch = (t, e, n) => {
          var r = o.createError(t, e, n);
          if (
            ["wrongType", "mismatch"].includes(r.data.category) &&
            1 === e.length &&
            Tt(e[0]) &&
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
        o
      );
    });
  function Oe(t) {
    throw new Error(
      "Cannot convert value ".concat(t, " into a BigNumber: no class 'BigNumber' provided"),
    );
  }
  function Pe(t) {
    throw new Error(
      "Cannot convert value ".concat(t, " into a Complex number: no class 'Complex' provided"),
    );
  }
  function Re(t) {
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
   */ var $e,
    ze,
    Ue = 9e15,
    Ge = 1e9,
    je = "0123456789abcdef",
    qe =
      "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058",
    Ve =
      "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789",
    We = {
      precision: 20,
      rounding: 4,
      modulo: 1,
      toExpNeg: -7,
      toExpPos: 21,
      minE: -Ue,
      maxE: Ue,
      crypto: !1,
    },
    Qe = !0,
    He = "[DecimalError] ",
    Ze = He + "Invalid argument: ",
    Je = He + "Precision limit exceeded",
    Ye = He + "crypto unavailable",
    Xe = "[object Decimal]",
    Ke = Math.floor,
    tn = Math.pow,
    en = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i,
    nn = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i,
    rn = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i,
    on = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
    sn = 1e7,
    un = qe.length - 1,
    an = Ve.length - 1,
    ln = { toStringTag: Xe };
  function cn(t) {
    var e,
      n,
      r,
      i = t.length - 1,
      o = "",
      s = t[0];
    if (i > 0) {
      for (o += s, e = 1; e < i; e++) ((n = 7 - (r = t[e] + "").length) && (o += wn(n)), (o += r));
      (n = 7 - (r = (s = t[e]) + "").length) && (o += wn(n));
    } else if (0 === s) return "0";
    for (; s % 10 == 0; ) s /= 10;
    return o + s;
  }
  function pn(t, e, n) {
    if (t !== ~~t || t < e || t > n) throw Error(Ze + t);
  }
  function hn(t, e, n, r) {
    var i, o, s, u;
    for (o = t[0]; o >= 10; o /= 10) --e;
    return (
      --e < 0 ? ((e += 7), (i = 0)) : ((i = Math.ceil((e + 1) / 7)), (e %= 7)),
      (o = tn(10, 7 - e)),
      (u = (t[i] % o) | 0),
      null == r
        ? e < 3
          ? (0 == e ? (u = (u / 100) | 0) : 1 == e && (u = (u / 10) | 0),
            (s = (n < 4 && 99999 == u) || (n > 3 && 49999 == u) || 5e4 == u || 0 == u))
          : (s =
              (((n < 4 && u + 1 == o) || (n > 3 && u + 1 == o / 2)) &&
                ((t[i + 1] / o / 100) | 0) == tn(10, e - 2) - 1) ||
              ((u == o / 2 || 0 == u) && !((t[i + 1] / o / 100) | 0)))
        : e < 4
          ? (0 == e
              ? (u = (u / 1e3) | 0)
              : 1 == e
                ? (u = (u / 100) | 0)
                : 2 == e && (u = (u / 10) | 0),
            (s = ((r || n < 4) && 9999 == u) || (!r && n > 3 && 4999 == u)))
          : (s =
              (((r || n < 4) && u + 1 == o) || (!r && n > 3 && u + 1 == o / 2)) &&
              ((t[i + 1] / o / 1e3) | 0) == tn(10, e - 3) - 1),
      s
    );
  }
  function fn(t, e, n) {
    for (var r, i, o = [0], s = 0, u = t.length; s < u; ) {
      for (i = o.length; i--; ) o[i] *= e;
      for (o[0] += je.indexOf(t.charAt(s++)), r = 0; r < o.length; r++)
        o[r] > n - 1 &&
          (void 0 === o[r + 1] && (o[r + 1] = 0), (o[r + 1] += (o[r] / n) | 0), (o[r] %= n));
    }
    return o.reverse();
  }
  ((ln.absoluteValue = ln.abs =
    function () {
      var t = new this.constructor(this);
      return (t.s < 0 && (t.s = 1), dn(t));
    }),
    (ln.ceil = function () {
      return dn(new this.constructor(this), this.e + 1, 2);
    }),
    (ln.clampedTo = ln.clamp =
      function (t, e) {
        var n = this,
          r = n.constructor;
        if (((t = new r(t)), (e = new r(e)), !t.s || !e.s)) return new r(NaN);
        if (t.gt(e)) throw Error(Ze + e);
        return n.cmp(t) < 0 ? t : n.cmp(e) > 0 ? e : new r(n);
      }),
    (ln.comparedTo = ln.cmp =
      function (t) {
        var e,
          n,
          r,
          i,
          o = this,
          s = o.d,
          u = (t = new o.constructor(t)).d,
          a = o.s,
          l = t.s;
        if (!s || !u) return a && l ? (a !== l ? a : s === u ? 0 : !s ^ (a < 0) ? 1 : -1) : NaN;
        if (!s[0] || !u[0]) return s[0] ? a : u[0] ? -l : 0;
        if (a !== l) return a;
        if (o.e !== t.e) return (o.e > t.e) ^ (a < 0) ? 1 : -1;
        for (e = 0, n = (r = s.length) < (i = u.length) ? r : i; e < n; ++e)
          if (s[e] !== u[e]) return (s[e] > u[e]) ^ (a < 0) ? 1 : -1;
        return r === i ? 0 : (r > i) ^ (a < 0) ? 1 : -1;
      }),
    (ln.cosine = ln.cos =
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
                ((r = e.d.length),
                  r < 32
                    ? (i = (1 / Mn(4, (n = Math.ceil(r / 3)))).toString())
                    : ((n = 16), (i = "2.3283064365386962890625e-10")));
                ((t.precision += n), (e = Bn(t, 1, e.times(i), new t(1))));
                for (var o = n; o--; ) {
                  var s = e.times(e);
                  e = s.times(s).minus(s).times(8).plus(1);
                }
                return ((t.precision -= n), e);
              })(r, Tn(r, n))),
              (r.precision = t),
              (r.rounding = e),
              dn(2 == ze || 3 == ze ? n.neg() : n, t, e, !0))
            : new r(1)
          : new r(NaN);
      }),
    (ln.cubeRoot = ln.cbrt =
      function () {
        var t,
          e,
          n,
          r,
          i,
          o,
          s,
          u,
          a,
          l,
          c = this,
          p = c.constructor;
        if (!c.isFinite() || c.isZero()) return new p(c);
        for (
          Qe = !1,
            (o = c.s * tn(c.s * c, 1 / 3)) && Math.abs(o) != 1 / 0
              ? (r = new p(o.toString()))
              : ((n = cn(c.d)),
                (o = ((t = c.e) - n.length + 1) % 3) && (n += 1 == o || -2 == o ? "0" : "00"),
                (o = tn(n, 1 / 3)),
                (t = Ke((t + 1) / 3) - (t % 3 == (t < 0 ? -1 : 2))),
                ((r = new p(
                  (n =
                    o == 1 / 0
                      ? "5e" + t
                      : (n = o.toExponential()).slice(0, n.indexOf("e") + 1) + t),
                )).s = c.s)),
            s = (t = p.precision) + 3;
          ;
        )
          if (
            ((l = (a = (u = r).times(u).times(u)).plus(c)),
            (r = mn(l.plus(c).times(u), l.plus(a), s + 2, 1)),
            cn(u.d).slice(0, s) === (n = cn(r.d)).slice(0, s))
          ) {
            if ("9999" != (n = n.slice(s - 3, s + 1)) && (i || "4999" != n)) {
              (+n && (+n.slice(1) || "5" != n.charAt(0))) ||
                (dn(r, t + 1, 1), (e = !r.times(r).times(r).eq(c)));
              break;
            }
            if (!i && (dn(u, t + 1, 0), u.times(u).times(u).eq(c))) {
              r = u;
              break;
            }
            ((s += 4), (i = 1));
          }
        return ((Qe = !0), dn(r, t, p.rounding, e));
      }),
    (ln.decimalPlaces = ln.dp =
      function () {
        var t,
          e = this.d,
          n = NaN;
        if (e) {
          if (((n = 7 * ((t = e.length - 1) - Ke(this.e / 7))), (t = e[t])))
            for (; t % 10 == 0; t /= 10) n--;
          n < 0 && (n = 0);
        }
        return n;
      }),
    (ln.dividedBy = ln.div =
      function (t) {
        return mn(this, new this.constructor(t));
      }),
    (ln.dividedToIntegerBy = ln.divToInt =
      function (t) {
        var e = this.constructor;
        return dn(mn(this, new e(t), 0, 1, 1), e.precision, e.rounding);
      }),
    (ln.equals = ln.eq =
      function (t) {
        return 0 === this.cmp(t);
      }),
    (ln.floor = function () {
      return dn(new this.constructor(this), this.e + 1, 3);
    }),
    (ln.greaterThan = ln.gt =
      function (t) {
        return this.cmp(t) > 0;
      }),
    (ln.greaterThanOrEqualTo = ln.gte =
      function (t) {
        var e = this.cmp(t);
        return 1 == e || 0 === e;
      }),
    (ln.hyperbolicCosine = ln.cosh =
      function () {
        var t,
          e,
          n,
          r,
          i,
          o = this,
          s = o.constructor,
          u = new s(1);
        if (!o.isFinite()) return new s(o.s ? 1 / 0 : NaN);
        if (o.isZero()) return u;
        ((n = s.precision),
          (r = s.rounding),
          (s.precision = n + Math.max(o.e, o.sd()) + 4),
          (s.rounding = 1),
          (i = o.d.length) < 32
            ? (e = (1 / Mn(4, (t = Math.ceil(i / 3)))).toString())
            : ((t = 16), (e = "2.3283064365386962890625e-10")),
          (o = Bn(s, 1, o.times(e), new s(1), !0)));
        for (var a, l = t, c = new s(8); l--; )
          ((a = o.times(o)), (o = u.minus(a.times(c.minus(a.times(c))))));
        return dn(o, (s.precision = n), (s.rounding = r), !0);
      }),
    (ln.hyperbolicSine = ln.sinh =
      function () {
        var t,
          e,
          n,
          r,
          i = this,
          o = i.constructor;
        if (!i.isFinite() || i.isZero()) return new o(i);
        if (
          ((e = o.precision),
          (n = o.rounding),
          (o.precision = e + Math.max(i.e, i.sd()) + 4),
          (o.rounding = 1),
          (r = i.d.length) < 3)
        )
          i = Bn(o, 2, i, i, !0);
        else {
          ((t = (t = 1.4 * Math.sqrt(r)) > 16 ? 16 : 0 | t),
            (i = Bn(o, 2, (i = i.times(1 / Mn(5, t))), i, !0)));
          for (var s, u = new o(5), a = new o(16), l = new o(20); t--; )
            ((s = i.times(i)), (i = i.times(u.plus(s.times(a.times(s).plus(l))))));
        }
        return ((o.precision = e), (o.rounding = n), dn(i, e, n, !0));
      }),
    (ln.hyperbolicTangent = ln.tanh =
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
              mn(n.sinh(), n.cosh(), (r.precision = t), (r.rounding = e)))
          : new r(n.s);
      }),
    (ln.inverseCosine = ln.acos =
      function () {
        var t = this,
          e = t.constructor,
          n = t.abs().cmp(1),
          r = e.precision,
          i = e.rounding;
        return -1 !== n
          ? 0 === n
            ? t.isNeg()
              ? vn(e, r, i)
              : new e(0)
            : new e(NaN)
          : t.isZero()
            ? vn(e, r + 4, i).times(0.5)
            : ((e.precision = r + 6),
              (e.rounding = 1),
              (t = new e(1).minus(t).div(t.plus(1)).sqrt().atan()),
              (e.precision = r),
              (e.rounding = i),
              t.times(2));
      }),
    (ln.inverseHyperbolicCosine = ln.acosh =
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
              (Qe = !1),
              (n = n.times(n).minus(1).sqrt().plus(n)),
              (Qe = !0),
              (r.precision = t),
              (r.rounding = e),
              n.ln())
            : new r(n);
      }),
    (ln.inverseHyperbolicSine = ln.asinh =
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
            (Qe = !1),
            (n = n.times(n).plus(1).sqrt().plus(n)),
            (Qe = !0),
            (r.precision = t),
            (r.rounding = e),
            n.ln());
      }),
    (ln.inverseHyperbolicTangent = ln.atanh =
      function () {
        var t,
          e,
          n,
          r,
          i = this,
          o = i.constructor;
        return i.isFinite()
          ? i.e >= 0
            ? new o(i.abs().eq(1) ? i.s / 0 : i.isZero() ? i : NaN)
            : ((t = o.precision),
              (e = o.rounding),
              (r = i.sd()),
              Math.max(r, t) < 2 * -i.e - 1
                ? dn(new o(i), t, e, !0)
                : ((o.precision = n = r - i.e),
                  (i = mn(i.plus(1), new o(1).minus(i), n + t, 1)),
                  (o.precision = t + 4),
                  (o.rounding = 1),
                  (i = i.ln()),
                  (o.precision = t),
                  (o.rounding = e),
                  i.times(0.5)))
          : new o(NaN);
      }),
    (ln.inverseSine = ln.asin =
      function () {
        var t,
          e,
          n,
          r,
          i = this,
          o = i.constructor;
        return i.isZero()
          ? new o(i)
          : ((e = i.abs().cmp(1)),
            (n = o.precision),
            (r = o.rounding),
            -1 !== e
              ? 0 === e
                ? (((t = vn(o, n + 4, r).times(0.5)).s = i.s), t)
                : new o(NaN)
              : ((o.precision = n + 6),
                (o.rounding = 1),
                (i = i.div(new o(1).minus(i.times(i)).sqrt().plus(1)).atan()),
                (o.precision = n),
                (o.rounding = r),
                i.times(2)));
      }),
    (ln.inverseTangent = ln.atan =
      function () {
        var t,
          e,
          n,
          r,
          i,
          o,
          s,
          u,
          a,
          l = this,
          c = l.constructor,
          p = c.precision,
          h = c.rounding;
        if (l.isFinite()) {
          if (l.isZero()) return new c(l);
          if (l.abs().eq(1) && p + 4 <= an) return (((s = vn(c, p + 4, h).times(0.25)).s = l.s), s);
        } else {
          if (!l.s) return new c(NaN);
          if (p + 4 <= an) return (((s = vn(c, p + 4, h).times(0.5)).s = l.s), s);
        }
        for (
          c.precision = u = p + 10, c.rounding = 1, t = n = Math.min(28, (u / 7 + 2) | 0);
          t;
          --t
        )
          l = l.div(l.times(l).plus(1).sqrt().plus(1));
        for (Qe = !1, e = Math.ceil(u / 7), r = 1, a = l.times(l), s = new c(l), i = l; -1 !== t; )
          if (
            ((i = i.times(a)),
            (o = s.minus(i.div((r += 2)))),
            (i = i.times(a)),
            void 0 !== (s = o.plus(i.div((r += 2)))).d[e])
          )
            for (t = e; s.d[t] === o.d[t] && t--; );
        return (
          n && (s = s.times(2 << (n - 1))),
          (Qe = !0),
          dn(s, (c.precision = p), (c.rounding = h), !0)
        );
      }),
    (ln.isFinite = function () {
      return !!this.d;
    }),
    (ln.isInteger = ln.isInt =
      function () {
        return !!this.d && Ke(this.e / 7) > this.d.length - 2;
      }),
    (ln.isNaN = function () {
      return !this.s;
    }),
    (ln.isNegative = ln.isNeg =
      function () {
        return this.s < 0;
      }),
    (ln.isPositive = ln.isPos =
      function () {
        return this.s > 0;
      }),
    (ln.isZero = function () {
      return !!this.d && 0 === this.d[0];
    }),
    (ln.lessThan = ln.lt =
      function (t) {
        return this.cmp(t) < 0;
      }),
    (ln.lessThanOrEqualTo = ln.lte =
      function (t) {
        return this.cmp(t) < 1;
      }),
    (ln.logarithm = ln.log =
      function (t) {
        var e,
          n,
          r,
          i,
          o,
          s,
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
          if (n.length > 1) o = !0;
          else {
            for (i = n[0]; i % 10 == 0; ) i /= 10;
            o = 1 !== i;
          }
        if (
          ((Qe = !1),
          (s = Cn(l, (u = p + 5))),
          (r = e ? Dn(c, u + 10) : Cn(t, u)),
          hn((a = mn(s, r, u, 1)).d, (i = p), h))
        )
          do {
            if (
              ((s = Cn(l, (u += 10))), (r = e ? Dn(c, u + 10) : Cn(t, u)), (a = mn(s, r, u, 1)), !o)
            ) {
              +cn(a.d).slice(i + 1, i + 15) + 1 == 1e14 && (a = dn(a, p + 1, 0));
              break;
            }
          } while (hn(a.d, (i += 10), h));
        return ((Qe = !0), dn(a, p, h));
      }),
    (ln.minus = ln.sub =
      function (t) {
        var e,
          n,
          r,
          i,
          o,
          s,
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
          return Qe ? dn(t, u, a) : t;
        }
        if (((n = Ke(t.e / 7)), (c = Ke(f.e / 7)), (l = l.slice()), (o = c - n))) {
          for (
            (p = o < 0) ? ((e = l), (o = -o), (s = h.length)) : ((e = h), (n = c), (s = l.length)),
              o > (r = Math.max(Math.ceil(u / 7), s) + 2) && ((o = r), (e.length = 1)),
              e.reverse(),
              r = o;
            r--;
          )
            e.push(0);
          e.reverse();
        } else {
          for ((p = (r = l.length) < (s = h.length)) && (s = r), r = 0; r < s; r++)
            if (l[r] != h[r]) {
              p = l[r] < h[r];
              break;
            }
          o = 0;
        }
        for (
          p && ((e = l), (l = h), (h = e), (t.s = -t.s)), s = l.length, r = h.length - s;
          r > 0;
          --r
        )
          l[s++] = 0;
        for (r = h.length; r > o; ) {
          if (l[--r] < h[r]) {
            for (i = r; i && 0 === l[--i]; ) l[i] = sn - 1;
            (--l[i], (l[r] += sn));
          }
          l[r] -= h[r];
        }
        for (; 0 === l[--s]; ) l.pop();
        for (; 0 === l[0]; l.shift()) --n;
        return l[0] ? ((t.d = l), (t.e = yn(l, n)), Qe ? dn(t, u, a) : t) : new m(3 === a ? -0 : 0);
      }),
    (ln.modulo = ln.mod =
      function (t) {
        var e,
          n = this,
          r = n.constructor;
        return (
          (t = new r(t)),
          !n.d || !t.s || (t.d && !t.d[0])
            ? new r(NaN)
            : !t.d || (n.d && !n.d[0])
              ? dn(new r(n), r.precision, r.rounding)
              : ((Qe = !1),
                9 == r.modulo
                  ? ((e = mn(n, t.abs(), 0, 3, 1)).s *= t.s)
                  : (e = mn(n, t, 0, r.modulo, 1)),
                (e = e.times(t)),
                (Qe = !0),
                n.minus(e))
        );
      }),
    (ln.naturalExponential = ln.exp =
      function () {
        return Fn(this);
      }),
    (ln.naturalLogarithm = ln.ln =
      function () {
        return Cn(this);
      }),
    (ln.negated = ln.neg =
      function () {
        var t = new this.constructor(this);
        return ((t.s = -t.s), dn(t));
      }),
    (ln.plus = ln.add =
      function (t) {
        var e,
          n,
          r,
          i,
          o,
          s,
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
          return (c[0] || (t = new h(p)), Qe ? dn(t, u, a) : t);
        if (((o = Ke(p.e / 7)), (r = Ke(t.e / 7)), (l = l.slice()), (i = o - r))) {
          for (
            i < 0 ? ((n = l), (i = -i), (s = c.length)) : ((n = c), (r = o), (s = l.length)),
              i > (s = (o = Math.ceil(u / 7)) > s ? o + 1 : s + 1) && ((i = s), (n.length = 1)),
              n.reverse();
            i--;
          )
            n.push(0);
          n.reverse();
        }
        for (
          (s = l.length) - (i = c.length) < 0 && ((i = s), (n = c), (c = l), (l = n)), e = 0;
          i;
        )
          ((e = ((l[--i] = l[i] + c[i] + e) / sn) | 0), (l[i] %= sn));
        for (e && (l.unshift(e), ++r), s = l.length; 0 == l[--s]; ) l.pop();
        return ((t.d = l), (t.e = yn(l, r)), Qe ? dn(t, u, a) : t);
      }),
    (ln.precision = ln.sd =
      function (t) {
        var e,
          n = this;
        if (void 0 !== t && t !== !!t && 1 !== t && 0 !== t) throw Error(Ze + t);
        return (n.d ? ((e = bn(n.d)), t && n.e + 1 > e && (e = n.e + 1)) : (e = NaN), e);
      }),
    (ln.round = function () {
      var t = this,
        e = t.constructor;
      return dn(new e(t), t.e + 1, e.rounding);
    }),
    (ln.sine = ln.sin =
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
                if (r < 3) return e.isZero() ? e : Bn(t, 2, e, e);
                ((n = (n = 1.4 * Math.sqrt(r)) > 16 ? 16 : 0 | n),
                  (e = e.times(1 / Mn(5, n))),
                  (e = Bn(t, 2, e, e)));
                for (var i, o = new t(5), s = new t(16), u = new t(20); n--; )
                  ((i = e.times(e)), (e = e.times(o.plus(i.times(s.times(i).minus(u))))));
                return e;
              })(r, Tn(r, n))),
              (r.precision = t),
              (r.rounding = e),
              dn(ze > 2 ? n.neg() : n, t, e, !0))
          : new r(NaN);
      }),
    (ln.squareRoot = ln.sqrt =
      function () {
        var t,
          e,
          n,
          r,
          i,
          o,
          s = this,
          u = s.d,
          a = s.e,
          l = s.s,
          c = s.constructor;
        if (1 !== l || !u || !u[0])
          return new c(!l || (l < 0 && (!u || u[0])) ? NaN : u ? s : 1 / 0);
        for (
          Qe = !1,
            0 == (l = Math.sqrt(+s)) || l == 1 / 0
              ? (((e = cn(u)).length + a) % 2 == 0 && (e += "0"),
                (l = Math.sqrt(e)),
                (a = Ke((a + 1) / 2) - (a < 0 || a % 2)),
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
            ((r = (o = r).plus(mn(s, o, n + 2, 1)).times(0.5)),
            cn(o.d).slice(0, n) === (e = cn(r.d)).slice(0, n))
          ) {
            if ("9999" != (e = e.slice(n - 3, n + 1)) && (i || "4999" != e)) {
              (+e && (+e.slice(1) || "5" != e.charAt(0))) ||
                (dn(r, a + 1, 1), (t = !r.times(r).eq(s)));
              break;
            }
            if (!i && (dn(o, a + 1, 0), o.times(o).eq(s))) {
              r = o;
              break;
            }
            ((n += 4), (i = 1));
          }
        return ((Qe = !0), dn(r, a, c.rounding, t));
      }),
    (ln.tangent = ln.tan =
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
              (n = mn(n, new r(1).minus(n.times(n)).sqrt(), t + 10, 0)),
              (r.precision = t),
              (r.rounding = e),
              dn(2 == ze || 4 == ze ? n.neg() : n, t, e, !0))
          : new r(NaN);
      }),
    (ln.times = ln.mul =
      function (t) {
        var e,
          n,
          r,
          i,
          o,
          s,
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
          n = Ke(c.e / 7) + Ke(t.e / 7),
            (a = h.length) < (l = f.length) &&
              ((o = h), (h = f), (f = o), (s = a), (a = l), (l = s)),
            o = [],
            r = s = a + l;
          r--;
        )
          o.push(0);
        for (r = l; --r >= 0; ) {
          for (e = 0, i = a + r; i > r; )
            ((u = o[i] + f[r] * h[i - r - 1] + e), (o[i--] = (u % sn) | 0), (e = (u / sn) | 0));
          o[i] = ((o[i] + e) % sn) | 0;
        }
        for (; !o[--s]; ) o.pop();
        return (
          e ? ++n : o.shift(),
          (t.d = o),
          (t.e = yn(o, n)),
          Qe ? dn(t, p.precision, p.rounding) : t
        );
      }),
    (ln.toBinary = function (t, e) {
      return kn(this, 2, t, e);
    }),
    (ln.toDecimalPlaces = ln.toDP =
      function (t, e) {
        var n = this,
          r = n.constructor;
        return (
          (n = new r(n)),
          void 0 === t
            ? n
            : (pn(t, 0, Ge), void 0 === e ? (e = r.rounding) : pn(e, 0, 8), dn(n, t + n.e + 1, e))
        );
      }),
    (ln.toExponential = function (t, e) {
      var n,
        r = this,
        i = r.constructor;
      return (
        void 0 === t
          ? (n = gn(r, !0))
          : (pn(t, 0, Ge),
            void 0 === e ? (e = i.rounding) : pn(e, 0, 8),
            (n = gn((r = dn(new i(r), t + 1, e)), !0, t + 1))),
        r.isNeg() && !r.isZero() ? "-" + n : n
      );
    }),
    (ln.toFixed = function (t, e) {
      var n,
        r,
        i = this,
        o = i.constructor;
      return (
        void 0 === t
          ? (n = gn(i))
          : (pn(t, 0, Ge),
            void 0 === e ? (e = o.rounding) : pn(e, 0, 8),
            (n = gn((r = dn(new o(i), t + i.e + 1, e)), !1, t + r.e + 1))),
        i.isNeg() && !i.isZero() ? "-" + n : n
      );
    }),
    (ln.toFraction = function (t) {
      var e,
        n,
        r,
        i,
        o,
        s,
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
        (s = (o = (e = new d(r)).e = bn(m) - f.e - 1) % 7),
        (e.d[0] = tn(10, s < 0 ? 7 + s : s)),
        null == t)
      )
        t = o > 0 ? e : l;
      else {
        if (!(u = new d(t)).isInt() || u.lt(l)) throw Error(Ze + u);
        t = u.gt(e) ? (o > 0 ? e : l) : u;
      }
      for (
        Qe = !1, u = new d(cn(m)), c = d.precision, d.precision = o = 7 * m.length * 2;
        (p = mn(u, e, 0, 1, 1)), 1 != (i = n.plus(p.times(r))).cmp(t);
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
        (i = mn(t.minus(n), r, 0, 1, 1)),
        (a = a.plus(i.times(l))),
        (n = n.plus(i.times(r))),
        (a.s = l.s = f.s),
        (h =
          mn(l, r, o, 1)
            .minus(f)
            .abs()
            .cmp(mn(a, n, o, 1).minus(f).abs()) < 1
            ? [l, r]
            : [a, n]),
        (d.precision = c),
        (Qe = !0),
        h
      );
    }),
    (ln.toHexadecimal = ln.toHex =
      function (t, e) {
        return kn(this, 16, t, e);
      }),
    (ln.toNearest = function (t, e) {
      var n = this,
        r = n.constructor;
      if (((n = new r(n)), null == t)) {
        if (!n.d) return n;
        ((t = new r(1)), (e = r.rounding));
      } else {
        if (((t = new r(t)), void 0 === e ? (e = r.rounding) : pn(e, 0, 8), !n.d))
          return t.s ? n : t;
        if (!t.d) return (t.s && (t.s = n.s), t);
      }
      return (
        t.d[0]
          ? ((Qe = !1), (n = mn(n, t, 0, e, 1).times(t)), (Qe = !0), dn(n))
          : ((t.s = n.s), (n = t)),
        n
      );
    }),
    (ln.toNumber = function () {
      return +this;
    }),
    (ln.toOctal = function (t, e) {
      return kn(this, 8, t, e);
    }),
    (ln.toPower = ln.pow =
      function (t) {
        var e,
          n,
          r,
          i,
          o,
          s,
          u = this,
          a = u.constructor,
          l = +(t = new a(t));
        if (!(u.d && t.d && u.d[0] && t.d[0])) return new a(tn(+u, l));
        if ((u = new a(u)).eq(1)) return u;
        if (((r = a.precision), (o = a.rounding), t.eq(1))) return dn(u, r, o);
        if ((e = Ke(t.e / 7)) >= t.d.length - 1 && (n = l < 0 ? -l : l) <= 9007199254740991)
          return ((i = En(a, u, n, r)), t.s < 0 ? new a(1).div(i) : dn(i, r, o));
        if ((s = u.s) < 0) {
          if (e < t.d.length - 1) return new a(NaN);
          if ((1 & t.d[e] || (s = 1), 0 == u.e && 1 == u.d[0] && 1 == u.d.length))
            return ((u.s = s), u);
        }
        return (e =
          0 != (n = tn(+u, l)) && isFinite(n)
            ? new a(n + "").e
            : Ke(l * (Math.log("0." + cn(u.d)) / Math.LN10 + u.e + 1))) >
          a.maxE + 1 || e < a.minE - 1
          ? new a(e > 0 ? s / 0 : 0)
          : ((Qe = !1),
            (a.rounding = u.s = 1),
            (n = Math.min(12, (e + "").length)),
            (i = Fn(t.times(Cn(u, r + n)), r)).d &&
              hn((i = dn(i, r + 5, 1)).d, r, o) &&
              ((e = r + 10),
              +cn((i = dn(Fn(t.times(Cn(u, e + n)), e), e + 5, 1)).d).slice(r + 1, r + 15) + 1 ==
                1e14 && (i = dn(i, r + 1, 0))),
            (i.s = s),
            (Qe = !0),
            (a.rounding = o),
            dn(i, r, o));
      }),
    (ln.toPrecision = function (t, e) {
      var n,
        r = this,
        i = r.constructor;
      return (
        void 0 === t
          ? (n = gn(r, r.e <= i.toExpNeg || r.e >= i.toExpPos))
          : (pn(t, 1, Ge),
            void 0 === e ? (e = i.rounding) : pn(e, 0, 8),
            (n = gn((r = dn(new i(r), t, e)), t <= r.e || r.e <= i.toExpNeg, t))),
        r.isNeg() && !r.isZero() ? "-" + n : n
      );
    }),
    (ln.toSignificantDigits = ln.toSD =
      function (t, e) {
        var n = this.constructor;
        return (
          void 0 === t
            ? ((t = n.precision), (e = n.rounding))
            : (pn(t, 1, Ge), void 0 === e ? (e = n.rounding) : pn(e, 0, 8)),
          dn(new n(this), t, e)
        );
      }),
    (ln.toString = function () {
      var t = this,
        e = t.constructor,
        n = gn(t, t.e <= e.toExpNeg || t.e >= e.toExpPos);
      return t.isNeg() && !t.isZero() ? "-" + n : n;
    }),
    (ln.truncated = ln.trunc =
      function () {
        return dn(new this.constructor(this), this.e + 1, 1);
      }),
    (ln.valueOf = ln.toJSON =
      function () {
        var t = this,
          e = t.constructor,
          n = gn(t, t.e <= e.toExpNeg || t.e >= e.toExpPos);
        return t.isNeg() ? "-" + n : n;
      }));
  var mn = (function () {
    function t(t, e, n) {
      var r,
        i = 0,
        o = t.length;
      for (t = t.slice(); o--; ) ((r = t[o] * e + i), (t[o] = (r % n) | 0), (i = (r / n) | 0));
      return (i && t.unshift(i), t);
    }
    function e(t, e, n, r) {
      var i, o;
      if (n != r) o = n > r ? 1 : -1;
      else
        for (i = o = 0; i < n; i++)
          if (t[i] != e[i]) {
            o = t[i] > e[i] ? 1 : -1;
            break;
          }
      return o;
    }
    function n(t, e, n, r) {
      for (var i = 0; n--; ) ((t[n] -= i), (i = t[n] < e[n] ? 1 : 0), (t[n] = i * r + t[n] - e[n]));
      for (; !t[0] && t.length > 1; ) t.shift();
    }
    return function (r, i, o, s, u, a) {
      var l,
        c,
        p,
        h,
        f,
        m,
        d,
        g,
        y,
        D,
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
        a ? ((f = 1), (c = r.e - i.e)) : ((a = sn), (f = 7), (c = Ke(r.e / f) - Ke(i.e / f))),
          _ = T.length,
          F = M.length,
          D = (y = new S(B)).d = [],
          p = 0;
        T[p] == (M[p] || 0);
        p++
      );
      if (
        (T[p] > (M[p] || 0) && c--,
        null == o ? ((E = o = S.precision), (s = S.rounding)) : (E = u ? o + (r.e - i.e) + 1 : o),
        E < 0)
      )
        (D.push(1), (m = !0));
      else {
        if (((E = (E / f + 2) | 0), (p = 0), 1 == _)) {
          for (h = 0, T = T[0], E++; (p < F || h) && E--; p++)
            ((x = h * a + (M[p] || 0)), (D[p] = (x / T) | 0), (h = (x % T) | 0));
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
              (D[p++] = h),
              l && v[0] ? (v[b++] = M[A] || 0) : ((v = [M[A]]), (b = 1)));
          } while ((A++ < F || void 0 !== v[0]) && E--);
          m = void 0 !== v[0];
        }
        D[0] || D.shift();
      }
      if (1 == f) ((y.e = c), ($e = m));
      else {
        for (p = 1, h = D[0]; h >= 10; h /= 10) p++;
        ((y.e = p + c * f - 1), dn(y, u ? o + y.e + 1 : o, s, m));
      }
      return y;
    };
  })();
  function dn(t, e, n, r) {
    var i,
      o,
      s,
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
      if ((o = e - i) < 0)
        ((o += 7), (s = e), (a = (((c = p[(h = 0)]) / tn(10, i - s - 1)) % 10) | 0));
      else if ((h = Math.ceil((o + 1) / 7)) >= (u = p.length)) {
        if (!r) break t;
        for (; u++ <= h; ) p.push(0);
        ((c = a = 0), (i = 1), (s = (o %= 7) - 7 + 1));
      } else {
        for (c = u = p[h], i = 1; u >= 10; u /= 10) i++;
        a = (s = (o %= 7) - 7 + i) < 0 ? 0 : ((c / tn(10, i - s - 1)) % 10) | 0;
      }
      if (
        ((r = r || e < 0 || void 0 !== p[h + 1] || (s < 0 ? c : c % tn(10, i - s - 1))),
        (l =
          n < 4
            ? (a || r) && (0 == n || n == (t.s < 0 ? 3 : 2))
            : a > 5 ||
              (5 == a &&
                (4 == n ||
                  r ||
                  (6 == n && ((o > 0 ? (s > 0 ? c / tn(10, i - s) : 0) : p[h - 1]) % 10) & 1) ||
                  n == (t.s < 0 ? 8 : 7)))),
        e < 1 || !p[0])
      )
        return (
          (p.length = 0),
          l
            ? ((e -= t.e + 1), (p[0] = tn(10, (7 - (e % 7)) % 7)), (t.e = -e || 0))
            : (p[0] = t.e = 0),
          t
        );
      if (
        (0 == o
          ? ((p.length = h), (u = 1), h--)
          : ((p.length = h + 1),
            (u = tn(10, 7 - o)),
            (p[h] = s > 0 ? (((c / tn(10, i - s)) % tn(10, s)) | 0) * u : 0)),
        l)
      )
        for (;;) {
          if (0 == h) {
            for (o = 1, s = p[0]; s >= 10; s /= 10) o++;
            for (s = p[0] += u, u = 1; s >= 10; s /= 10) u++;
            o != u && (t.e++, p[0] == sn && (p[0] = 1));
            break;
          }
          if (((p[h] += u), p[h] != sn)) break;
          ((p[h--] = 0), (u = 1));
        }
      for (o = p.length; 0 === p[--o]; ) p.pop();
    }
    return (
      Qe && (t.e > f.maxE ? ((t.d = null), (t.e = NaN)) : t.e < f.minE && ((t.e = 0), (t.d = [0]))),
      t
    );
  }
  function gn(t, e, n) {
    if (!t.isFinite()) return _n(t);
    var r,
      i = t.e,
      o = cn(t.d),
      s = o.length;
    return (
      e
        ? (n && (r = n - s) > 0
            ? (o = o.charAt(0) + "." + o.slice(1) + wn(r))
            : s > 1 && (o = o.charAt(0) + "." + o.slice(1)),
          (o = o + (t.e < 0 ? "e" : "e+") + t.e))
        : i < 0
          ? ((o = "0." + wn(-i - 1) + o), n && (r = n - s) > 0 && (o += wn(r)))
          : i >= s
            ? ((o += wn(i + 1 - s)), n && (r = n - i - 1) > 0 && (o = o + "." + wn(r)))
            : ((r = i + 1) < s && (o = o.slice(0, r) + "." + o.slice(r)),
              n && (r = n - s) > 0 && (i + 1 === s && (o += "."), (o += wn(r)))),
      o
    );
  }
  function yn(t, e) {
    var n = t[0];
    for (e *= 7; n >= 10; n /= 10) e++;
    return e;
  }
  function Dn(t, e, n) {
    if (e > un) throw ((Qe = !0), n && (t.precision = n), Error(Je));
    return dn(new t(qe), e, 1, !0);
  }
  function vn(t, e, n) {
    if (e > an) throw Error(Je);
    return dn(new t(Ve), e, n, !0);
  }
  function bn(t) {
    var e = t.length - 1,
      n = 7 * e + 1;
    if ((e = t[e])) {
      for (; e % 10 == 0; e /= 10) n--;
      for (e = t[0]; e >= 10; e /= 10) n++;
    }
    return n;
  }
  function wn(t) {
    for (var e = ""; t--; ) e += "0";
    return e;
  }
  function En(t, e, n, r) {
    var i,
      o = new t(1),
      s = Math.ceil(r / 7 + 4);
    for (Qe = !1; ; ) {
      if ((n % 2 && In((o = o.times(e)).d, s) && (i = !0), 0 === (n = Ke(n / 2)))) {
        ((n = o.d.length - 1), i && 0 === o.d[n] && ++o.d[n]);
        break;
      }
      In((e = e.times(e)).d, s);
    }
    return ((Qe = !0), o);
  }
  function xn(t) {
    return 1 & t.d[t.d.length - 1];
  }
  function An(t, e, n) {
    for (var r, i, o = new t(e[0]), s = 0; ++s < e.length; ) {
      if (!(i = new t(e[s])).s) {
        o = i;
        break;
      }
      ((r = o.cmp(i)) === n || (0 === r && o.s === n)) && (o = i);
    }
    return o;
  }
  function Fn(t, e) {
    var n,
      r,
      i,
      o,
      s,
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
    for (null == e ? ((Qe = !1), (a = m)) : (a = e), u = new h(0.03125); t.e > -2; )
      ((t = t.times(u)), (p += 5));
    for (
      a += r = ((Math.log(tn(2, p)) / Math.LN10) * 2 + 5) | 0,
        n = o = s = new h(1),
        h.precision = a;
      ;
    ) {
      if (
        ((o = dn(o.times(t), a, 1)),
        (n = n.times(++c)),
        cn((u = s.plus(mn(o, n, a, 1))).d).slice(0, a) === cn(s.d).slice(0, a))
      ) {
        for (i = p; i--; ) s = dn(s.times(s), a, 1);
        if (null != e) return ((h.precision = m), s);
        if (!(l < 3 && hn(s.d, a - r, f, l))) return dn(s, (h.precision = m), f, (Qe = !0));
        ((h.precision = a += 10), (n = o = u = new h(1)), (c = 0), l++);
      }
      s = u;
    }
  }
  function Cn(t, e) {
    var n,
      r,
      i,
      o,
      s,
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
      y = g.rounding,
      D = g.precision;
    if (m.s < 0 || !d || !d[0] || (!m.e && 1 == d[0] && 1 == d.length))
      return new g(d && !d[0] ? -1 / 0 : 1 != m.s ? NaN : d ? 0 : m);
    if (
      (null == e ? ((Qe = !1), (c = D)) : (c = e),
      (g.precision = c += 10),
      (r = (n = cn(d)).charAt(0)),
      !(Math.abs((o = m.e)) < 15e14))
    )
      return (
        (l = Dn(g, c + 2, D).times(o + "")),
        (m = Cn(new g(r + "." + n.slice(1)), c - 10).plus(l)),
        (g.precision = D),
        null == e ? dn(m, D, y, (Qe = !0)) : m
      );
    for (; (r < 7 && 1 != r) || (1 == r && n.charAt(1) > 3); )
      ((r = (n = cn((m = m.times(t)).d)).charAt(0)), f++);
    for (
      o = m.e,
        r > 1 ? ((m = new g("0." + n)), o++) : (m = new g(r + "." + n.slice(1))),
        p = m,
        a = s = m = mn(m.minus(1), m.plus(1), c, 1),
        h = dn(m.times(m), c, 1),
        i = 3;
      ;
    ) {
      if (
        ((s = dn(s.times(h), c, 1)),
        cn((l = a.plus(mn(s, new g(i), c, 1))).d).slice(0, c) === cn(a.d).slice(0, c))
      ) {
        if (
          ((a = a.times(2)),
          0 !== o && (a = a.plus(Dn(g, c + 2, D).times(o + ""))),
          (a = mn(a, new g(f), c, 1)),
          null != e)
        )
          return ((g.precision = D), a);
        if (!hn(a.d, c - 10, y, u)) return dn(a, (g.precision = D), y, (Qe = !0));
        ((g.precision = c += 10),
          (l = s = m = mn(p.minus(1), p.plus(1), c, 1)),
          (h = dn(m.times(m), c, 1)),
          (i = u = 1));
      }
      ((a = l), (i += 2));
    }
  }
  function _n(t) {
    return String((t.s * t.s) / 0);
  }
  function Nn(t, e) {
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
        for (r && t.d.push(+e.slice(0, r)), i -= 7; r < i; ) t.d.push(+e.slice(r, (r += 7)));
        r = 7 - (e = e.slice(r)).length;
      } else r -= i;
      for (; r--; ) e += "0";
      (t.d.push(+e),
        Qe &&
          (t.e > t.constructor.maxE
            ? ((t.d = null), (t.e = NaN))
            : t.e < t.constructor.minE && ((t.e = 0), (t.d = [0]))));
    } else ((t.e = 0), (t.d = [0]));
    return t;
  }
  function Sn(t, e) {
    var n, r, i, o, s, u, a, l, c;
    if (e.indexOf("_") > -1) {
      if (((e = e.replace(/(\d)_(?=\d)/g, "$1")), on.test(e))) return Nn(t, e);
    } else if ("Infinity" === e || "NaN" === e)
      return (+e || (t.s = NaN), (t.e = NaN), (t.d = null), t);
    if (nn.test(e)) ((n = 16), (e = e.toLowerCase()));
    else if (en.test(e)) n = 2;
    else {
      if (!rn.test(e)) throw Error(Ze + e);
      n = 8;
    }
    for (
      (o = e.search(/p/i)) > 0
        ? ((a = +e.slice(o + 1)), (e = e.substring(2, o)))
        : (e = e.slice(2)),
        s = (o = e.indexOf(".")) >= 0,
        r = t.constructor,
        s && ((o = (u = (e = e.replace(".", "")).length) - o), (i = En(r, new r(n), o, 2 * o))),
        o = c = (l = fn(e, n, sn)).length - 1;
      0 === l[o];
      --o
    )
      l.pop();
    return o < 0
      ? new r(0 * t.s)
      : ((t.e = yn(l, c)),
        (t.d = l),
        (Qe = !1),
        s && (t = mn(t, i, 4 * u)),
        a && (t = t.times(Math.abs(a) < 54 ? tn(2, a) : wr.pow(2, a))),
        (Qe = !0),
        t);
  }
  function Bn(t, e, n, r, i) {
    var o,
      s,
      u,
      a,
      l = t.precision,
      c = Math.ceil(l / 7);
    for (Qe = !1, a = n.times(n), u = new t(r); ; ) {
      if (
        ((s = mn(u.times(a), new t(e++ * e++), l, 1)),
        (u = i ? r.plus(s) : r.minus(s)),
        (r = mn(s.times(a), new t(e++ * e++), l, 1)),
        void 0 !== (s = u.plus(r)).d[c])
      ) {
        for (o = c; s.d[o] === u.d[o] && o--; );
        if (-1 == o) break;
      }
      ((o = u), (u = r), (r = s), (s = o));
    }
    return ((Qe = !0), (s.d.length = c + 1), s);
  }
  function Mn(t, e) {
    for (var n = t; --e; ) n *= t;
    return n;
  }
  function Tn(t, e) {
    var n,
      r = e.s < 0,
      i = vn(t, t.precision, 1),
      o = i.times(0.5);
    if ((e = e.abs()).lte(o)) return ((ze = r ? 4 : 1), e);
    if ((n = e.divToInt(i)).isZero()) ze = r ? 3 : 2;
    else {
      if ((e = e.minus(n.times(i))).lte(o)) return ((ze = xn(n) ? (r ? 2 : 3) : r ? 4 : 1), e);
      ze = xn(n) ? (r ? 1 : 4) : r ? 3 : 2;
    }
    return e.minus(i).abs();
  }
  function kn(t, e, n, r) {
    var i,
      o,
      s,
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
        ? (pn(n, 1, Ge), void 0 === r ? (r = f.rounding) : pn(r, 0, 8))
        : ((n = f.precision), (r = f.rounding)),
      t.isFinite())
    ) {
      for (
        m ? ((i = 2), 16 == e ? (n = 4 * n - 3) : 8 == e && (n = 3 * n - 2)) : (i = e),
          (s = (c = gn(t)).indexOf(".")) >= 0 &&
            ((c = c.replace(".", "")),
            ((h = new f(1)).e = c.length - s),
            (h.d = fn(gn(h), 10, i)),
            (h.e = h.d.length)),
          o = a = (p = fn(c, 10, i)).length;
        0 == p[--a];
      )
        p.pop();
      if (p[0]) {
        if (
          (s < 0
            ? o--
            : (((t = new f(t)).d = p),
              (t.e = o),
              (p = (t = mn(t, h, n, r, 0, i)).d),
              (o = t.e),
              (l = $e)),
          (s = p[n]),
          (u = i / 2),
          (l = l || void 0 !== p[n + 1]),
          (l =
            r < 4
              ? (void 0 !== s || l) && (0 === r || r === (t.s < 0 ? 3 : 2))
              : s > u ||
                (s === u &&
                  (4 === r || l || (6 === r && 1 & p[n - 1]) || r === (t.s < 0 ? 8 : 7)))),
          (p.length = n),
          l)
        )
          for (; ++p[--n] > i - 1; ) ((p[n] = 0), n || (++o, p.unshift(1)));
        for (a = p.length; !p[a - 1]; --a);
        for (s = 0, c = ""; s < a; s++) c += je.charAt(p[s]);
        if (m) {
          if (a > 1)
            if (16 == e || 8 == e) {
              for (s = 16 == e ? 4 : 3, --a; a % s; a++) c += "0";
              for (a = (p = fn(c, i, e)).length; !p[a - 1]; --a);
              for (s = 1, c = "1."; s < a; s++) c += je.charAt(p[s]);
            } else c = c.charAt(0) + "." + c.slice(1);
          c = c + (o < 0 ? "p" : "p+") + o;
        } else if (o < 0) {
          for (; ++o; ) c = "0" + c;
          c = "0." + c;
        } else if (++o > a) for (o -= a; o--; ) c += "0";
        else o < a && (c = c.slice(0, o) + "." + c.slice(o));
      } else c = m ? "0p+0" : "0";
      c = (16 == e ? "0x" : 2 == e ? "0b" : 8 == e ? "0o" : "") + c;
    } else c = _n(t);
    return t.s < 0 ? "-" + c : c;
  }
  function In(t, e) {
    if (t.length > e) return ((t.length = e), !0);
  }
  function Ln(t) {
    return new this(t).abs();
  }
  function On(t) {
    return new this(t).acos();
  }
  function Pn(t) {
    return new this(t).acosh();
  }
  function Rn(t, e) {
    return new this(t).plus(e);
  }
  function $n(t) {
    return new this(t).asin();
  }
  function zn(t) {
    return new this(t).asinh();
  }
  function Un(t) {
    return new this(t).atan();
  }
  function Gn(t) {
    return new this(t).atanh();
  }
  function jn(t, e) {
    ((t = new this(t)), (e = new this(e)));
    var n,
      r = this.precision,
      i = this.rounding,
      o = r + 4;
    return (
      t.s && e.s
        ? t.d || e.d
          ? !e.d || t.isZero()
            ? ((n = e.s < 0 ? vn(this, r, i) : new this(0)).s = t.s)
            : !t.d || e.isZero()
              ? ((n = vn(this, o, 1).times(0.5)).s = t.s)
              : e.s < 0
                ? ((this.precision = o),
                  (this.rounding = 1),
                  (n = this.atan(mn(t, e, o, 1))),
                  (e = vn(this, o, 1)),
                  (this.precision = r),
                  (this.rounding = i),
                  (n = t.s < 0 ? n.minus(e) : n.plus(e)))
                : (n = this.atan(mn(t, e, o, 1)))
          : ((n = vn(this, o, 1).times(e.s > 0 ? 0.25 : 0.75)).s = t.s)
        : (n = new this(NaN)),
      n
    );
  }
  function qn(t) {
    return new this(t).cbrt();
  }
  function Vn(t) {
    return dn((t = new this(t)), t.e + 1, 2);
  }
  function Wn(t, e, n) {
    return new this(t).clamp(e, n);
  }
  function Qn(t) {
    if (!t || "object" != typeof t) throw Error(He + "Object expected");
    var e,
      n,
      r,
      i = !0 === t.defaults,
      o = [
        "precision",
        1,
        Ge,
        "rounding",
        0,
        8,
        "toExpNeg",
        -Ue,
        0,
        "toExpPos",
        0,
        Ue,
        "maxE",
        0,
        Ue,
        "minE",
        -Ue,
        0,
        "modulo",
        0,
        9,
      ];
    for (e = 0; e < o.length; e += 3)
      if (((n = o[e]), i && (this[n] = We[n]), void 0 !== (r = t[n]))) {
        if (!(Ke(r) === r && r >= o[e + 1] && r <= o[e + 2])) throw Error(Ze + n + ": " + r);
        this[n] = r;
      }
    if (((n = "crypto"), i && (this[n] = We[n]), void 0 !== (r = t[n]))) {
      if (!0 !== r && !1 !== r && 0 !== r && 1 !== r) throw Error(Ze + n + ": " + r);
      if (r) {
        if (
          "undefined" == typeof crypto ||
          !crypto ||
          (!crypto.getRandomValues && !crypto.randomBytes)
        )
          throw Error(Ye);
        this[n] = !0;
      } else this[n] = !1;
    }
    return this;
  }
  function Hn(t) {
    return new this(t).cos();
  }
  function Zn(t) {
    return new this(t).cosh();
  }
  function Jn(t, e) {
    return new this(t).div(e);
  }
  function Yn(t) {
    return new this(t).exp();
  }
  function Xn(t) {
    return dn((t = new this(t)), t.e + 1, 3);
  }
  function Kn() {
    var t,
      e,
      n = new this(0);
    for (Qe = !1, t = 0; t < arguments.length; )
      if ((e = new this(arguments[t++])).d) n.d && (n = n.plus(e.times(e)));
      else {
        if (e.s) return ((Qe = !0), new this(1 / 0));
        n = e;
      }
    return ((Qe = !0), n.sqrt());
  }
  function tr(t) {
    return t instanceof wr || (t && t.toStringTag === Xe) || !1;
  }
  function er(t) {
    return new this(t).ln();
  }
  function nr(t, e) {
    return new this(t).log(e);
  }
  function rr(t) {
    return new this(t).log(2);
  }
  function ir(t) {
    return new this(t).log(10);
  }
  function or() {
    return An(this, arguments, -1);
  }
  function sr() {
    return An(this, arguments, 1);
  }
  function ur(t, e) {
    return new this(t).mod(e);
  }
  function ar(t, e) {
    return new this(t).mul(e);
  }
  function lr(t, e) {
    return new this(t).pow(e);
  }
  function cr(t) {
    var e,
      n,
      r,
      i,
      o = 0,
      s = new this(1),
      u = [];
    if ((void 0 === t ? (t = this.precision) : pn(t, 1, Ge), (r = Math.ceil(t / 7)), this.crypto))
      if (crypto.getRandomValues)
        for (e = crypto.getRandomValues(new Uint32Array(r)); o < r; )
          (i = e[o]) >= 429e7
            ? (e[o] = crypto.getRandomValues(new Uint32Array(1))[0])
            : (u[o++] = i % 1e7);
      else {
        if (!crypto.randomBytes) throw Error(Ye);
        for (e = crypto.randomBytes((r *= 4)); o < r; )
          (i = e[o] + (e[o + 1] << 8) + (e[o + 2] << 16) + ((127 & e[o + 3]) << 24)) >= 214e7
            ? crypto.randomBytes(4).copy(e, o)
            : (u.push(i % 1e7), (o += 4));
        o = r / 4;
      }
    else for (; o < r; ) u[o++] = (1e7 * Math.random()) | 0;
    for (
      t %= 7, (r = u[--o]) && t && ((i = tn(10, 7 - t)), (u[o] = ((r / i) | 0) * i));
      0 === u[o];
      o--
    )
      u.pop();
    if (o < 0) ((n = 0), (u = [0]));
    else {
      for (n = -1; 0 === u[0]; n -= 7) u.shift();
      for (r = 1, i = u[0]; i >= 10; i /= 10) r++;
      r < 7 && (n -= 7 - r);
    }
    return ((s.e = n), (s.d = u), s);
  }
  function pr(t) {
    return dn((t = new this(t)), t.e + 1, this.rounding);
  }
  function hr(t) {
    return (t = new this(t)).d ? (t.d[0] ? t.s : 0 * t.s) : t.s || NaN;
  }
  function fr(t) {
    return new this(t).sin();
  }
  function mr(t) {
    return new this(t).sinh();
  }
  function dr(t) {
    return new this(t).sqrt();
  }
  function gr(t, e) {
    return new this(t).sub(e);
  }
  function yr() {
    var t = 0,
      e = arguments,
      n = new this(e[t]);
    for (Qe = !1; n.s && ++t < e.length; ) n = n.plus(e[t]);
    return ((Qe = !0), dn(n, this.precision, this.rounding));
  }
  function Dr(t) {
    return new this(t).tan();
  }
  function vr(t) {
    return new this(t).tanh();
  }
  function br(t) {
    return dn((t = new this(t)), t.e + 1, 1);
  }
  ((ln[Symbol.for("nodejs.util.inspect.custom")] = ln.toString),
    (ln[Symbol.toStringTag] = "Decimal"));
  var wr = (ln.constructor = (function t(e) {
    var n, r, i;
    function o(t) {
      var e,
        n,
        r,
        i = this;
      if (!(i instanceof o)) return new o(t);
      if (((i.constructor = o), tr(t)))
        return (
          (i.s = t.s),
          void (Qe
            ? !t.d || t.e > o.maxE
              ? ((i.e = NaN), (i.d = null))
              : t.e < o.minE
                ? ((i.e = 0), (i.d = [0]))
                : ((i.e = t.e), (i.d = t.d.slice()))
            : ((i.e = t.e), (i.d = t.d ? t.d.slice() : t.d)))
        );
      if ("number" === (r = typeof t)) {
        if (0 === t) return ((i.s = 1 / t < 0 ? -1 : 1), (i.e = 0), void (i.d = [0]));
        if ((t < 0 ? ((t = -t), (i.s = -1)) : (i.s = 1), t === ~~t && t < 1e7)) {
          for (e = 0, n = t; n >= 10; n /= 10) e++;
          return void (Qe
            ? e > o.maxE
              ? ((i.e = NaN), (i.d = null))
              : e < o.minE
                ? ((i.e = 0), (i.d = [0]))
                : ((i.e = e), (i.d = [t]))
            : ((i.e = e), (i.d = [t])));
        }
        return 0 * t != 0
          ? (t || (i.s = NaN), (i.e = NaN), void (i.d = null))
          : Nn(i, t.toString());
      }
      if ("string" === r)
        return (
          45 === (n = t.charCodeAt(0))
            ? ((t = t.slice(1)), (i.s = -1))
            : (43 === n && (t = t.slice(1)), (i.s = 1)),
          on.test(t) ? Nn(i, t) : Sn(i, t)
        );
      if ("bigint" === r) return (t < 0 ? ((t = -t), (i.s = -1)) : (i.s = 1), Nn(i, t.toString()));
      throw Error(Ze + t);
    }
    if (
      ((o.prototype = ln),
      (o.ROUND_UP = 0),
      (o.ROUND_DOWN = 1),
      (o.ROUND_CEIL = 2),
      (o.ROUND_FLOOR = 3),
      (o.ROUND_HALF_UP = 4),
      (o.ROUND_HALF_DOWN = 5),
      (o.ROUND_HALF_EVEN = 6),
      (o.ROUND_HALF_CEIL = 7),
      (o.ROUND_HALF_FLOOR = 8),
      (o.EUCLID = 9),
      (o.config = o.set = Qn),
      (o.clone = t),
      (o.isDecimal = tr),
      (o.abs = Ln),
      (o.acos = On),
      (o.acosh = Pn),
      (o.add = Rn),
      (o.asin = $n),
      (o.asinh = zn),
      (o.atan = Un),
      (o.atanh = Gn),
      (o.atan2 = jn),
      (o.cbrt = qn),
      (o.ceil = Vn),
      (o.clamp = Wn),
      (o.cos = Hn),
      (o.cosh = Zn),
      (o.div = Jn),
      (o.exp = Yn),
      (o.floor = Xn),
      (o.hypot = Kn),
      (o.ln = er),
      (o.log = nr),
      (o.log10 = ir),
      (o.log2 = rr),
      (o.max = or),
      (o.min = sr),
      (o.mod = ur),
      (o.mul = ar),
      (o.pow = lr),
      (o.random = cr),
      (o.round = pr),
      (o.sign = hr),
      (o.sin = fr),
      (o.sinh = mr),
      (o.sqrt = dr),
      (o.sub = gr),
      (o.sum = yr),
      (o.tan = Dr),
      (o.tanh = vr),
      (o.trunc = br),
      void 0 === e && (e = {}),
      e && !0 !== e.defaults)
    )
      for (
        i = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"],
          n = 0;
        n < i.length;
      )
        e.hasOwnProperty((r = i[n++])) || (e[r] = this[r]);
    return (o.config(e), o);
  })(We));
  ((qe = new wr(qe)), (Ve = new wr(Ve)));
  var Er,
    xr = be(
      "BigNumber",
      ["?on", "config"],
      t => {
        var { on: e, config: n } = t,
          r = wr.clone({ precision: n.precision, modulo: wr.EUCLID });
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
    ),
    Ar = { exports: {} };
  var Fr =
      (Er ||
        ((Er = 1),
        (function (t) {
          const e =
              Math.cosh ||
              function (t) {
                return Math.abs(t) < 1e-9 ? 1 - t : 0.5 * (Math.exp(t) + Math.exp(-t));
              },
            n =
              Math.sinh ||
              function (t) {
                return Math.abs(t) < 1e-9 ? t : 0.5 * (Math.exp(t) - Math.exp(-t));
              },
            r = function (t, e) {
              return (
                (t = Math.abs(t)) < (e = Math.abs(e)) && ([t, e] = [e, t]),
                t < 1e8 ? Math.sqrt(t * t + e * e) : ((e /= t), t * Math.sqrt(1 + e * e))
              );
            },
            i = function () {
              throw SyntaxError("Invalid Param");
            };
          function o(t, e) {
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
          const s = { re: 0, im: 0 },
            u = function (t, e) {
              const n = s;
              if (null == t) n.re = n.im = 0;
              else if (void 0 !== e) ((n.re = t), (n.im = e));
              else
                switch (typeof t) {
                  case "object":
                    if ("im" in t && "re" in t) ((n.re = t.re), (n.im = t.im));
                    else if ("abs" in t && "arg" in t) {
                      if (!isFinite(t.abs) && isFinite(t.arg)) return a.INFINITY;
                      ((n.re = t.abs * Math.cos(t.arg)), (n.im = t.abs * Math.sin(t.arg)));
                    } else if ("r" in t && "phi" in t) {
                      if (!isFinite(t.r) && isFinite(t.phi)) return a.INFINITY;
                      ((n.re = t.r * Math.cos(t.phi)), (n.im = t.r * Math.sin(t.phi)));
                    } else 2 === t.length ? ((n.re = t[0]), (n.im = t[1])) : i();
                    break;
                  case "string":
                    n.im = n.re = 0;
                    const e = t.replace(/_/g, "").match(/\d+\.?\d*e[+-]?\d+|\d+\.?\d*|\.\d+|./g);
                    let r = 1,
                      o = 0;
                    null === e && i();
                    for (let t = 0; t < e.length; t++) {
                      const s = e[t];
                      " " === s ||
                        "\t" === s ||
                        "\n" === s ||
                        ("+" === s
                          ? r++
                          : "-" === s
                            ? o++
                            : "i" === s || "I" === s
                              ? (r + o === 0 && i(),
                                " " === e[t + 1] || isNaN(e[t + 1])
                                  ? (n.im += parseFloat((o % 2 ? "-" : "") + "1"))
                                  : ((n.im += parseFloat((o % 2 ? "-" : "") + e[t + 1])), t++),
                                (r = o = 0))
                              : ((r + o === 0 || isNaN(s)) && i(),
                                "i" === e[t + 1] || "I" === e[t + 1]
                                  ? ((n.im += parseFloat((o % 2 ? "-" : "") + s)), t++)
                                  : (n.re += parseFloat((o % 2 ? "-" : "") + s)),
                                (r = o = 0)));
                    }
                    r + o > 0 && i();
                    break;
                  case "number":
                    ((n.im = 0), (n.re = t));
                    break;
                  default:
                    i();
                }
              return (isNaN(n.re) || isNaN(n.im), n);
            };
          function a(t, e) {
            if (!(this instanceof a)) return new a(t, e);
            const n = u(t, e);
            ((this.re = n.re), (this.im = n.im));
          }
          ((a.prototype = {
            re: 0,
            im: 0,
            sign: function () {
              const t = r(this.re, this.im);
              return new a(this.re / t, this.im / t);
            },
            add: function (t, e) {
              const n = u(t, e),
                r = this.isInfinite(),
                i = !(isFinite(n.re) && isFinite(n.im));
              return r || i ? (r && i ? a.NAN : a.INFINITY) : new a(this.re + n.re, this.im + n.im);
            },
            sub: function (t, e) {
              const n = u(t, e),
                r = this.isInfinite(),
                i = !(isFinite(n.re) && isFinite(n.im));
              return r || i ? (r && i ? a.NAN : a.INFINITY) : new a(this.re - n.re, this.im - n.im);
            },
            mul: function (t, e) {
              const n = u(t, e),
                r = this.isInfinite(),
                i = !(isFinite(n.re) && isFinite(n.im)),
                o = 0 === this.re && 0 === this.im,
                s = 0 === n.re && 0 === n.im;
              return (r && s) || (i && o)
                ? a.NAN
                : r || i
                  ? a.INFINITY
                  : 0 === n.im && 0 === this.im
                    ? new a(this.re * n.re, 0)
                    : new a(this.re * n.re - this.im * n.im, this.re * n.im + this.im * n.re);
            },
            div: function (t, e) {
              const n = u(t, e),
                r = this.isInfinite(),
                i = !(isFinite(n.re) && isFinite(n.im)),
                o = 0 === this.re && 0 === this.im,
                s = 0 === n.re && 0 === n.im;
              if ((o && s) || (r && i)) return a.NAN;
              if (s || r) return a.INFINITY;
              if (o || i) return a.ZERO;
              if (0 === n.im) return new a(this.re / n.re, this.im / n.re);
              if (Math.abs(n.re) < Math.abs(n.im)) {
                const t = n.re / n.im,
                  e = n.re * t + n.im;
                return new a((this.re * t + this.im) / e, (this.im * t - this.re) / e);
              }
              {
                const t = n.im / n.re,
                  e = n.im * t + n.re;
                return new a((this.re + this.im * t) / e, (this.im - this.re * t) / e);
              }
            },
            pow: function (t, e) {
              const n = u(t, e),
                r = 0 === this.re && 0 === this.im;
              if (0 === n.re && 0 === n.im) return a.ONE;
              if (0 === n.im) {
                if (0 === this.im && this.re > 0) return new a(Math.pow(this.re, n.re), 0);
                if (0 === this.re)
                  switch (((n.re % 4) + 4) % 4) {
                    case 0:
                      return new a(Math.pow(this.im, n.re), 0);
                    case 1:
                      return new a(0, Math.pow(this.im, n.re));
                    case 2:
                      return new a(-Math.pow(this.im, n.re), 0);
                    case 3:
                      return new a(0, -Math.pow(this.im, n.re));
                  }
              }
              if (r && n.re > 0) return a.ZERO;
              const i = Math.atan2(this.im, this.re),
                s = o(this.re, this.im);
              let l = Math.exp(n.re * s - n.im * i),
                c = n.im * s + n.re * i;
              return new a(l * Math.cos(c), l * Math.sin(c));
            },
            sqrt: function () {
              const t = this.re,
                e = this.im;
              if (0 === e) return t >= 0 ? new a(Math.sqrt(t), 0) : new a(0, Math.sqrt(-t));
              const n = r(t, e);
              let i = Math.sqrt(0.5 * (n + Math.abs(t))),
                o = Math.abs(e) / (2 * i);
              return t >= 0 ? new a(i, e < 0 ? -o : o) : new a(o, e < 0 ? -i : i);
            },
            exp: function () {
              const t = Math.exp(this.re);
              return 0 === this.im
                ? new a(t, 0)
                : new a(t * Math.cos(this.im), t * Math.sin(this.im));
            },
            expm1: function () {
              const t = this.re,
                e = this.im;
              return new a(
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
              return 0 === e && t > 0 ? new a(Math.log(t), 0) : new a(o(t, e), Math.atan2(e, t));
            },
            abs: function () {
              return r(this.re, this.im);
            },
            arg: function () {
              return Math.atan2(this.im, this.re);
            },
            sin: function () {
              const t = this.re,
                r = this.im;
              return new a(Math.sin(t) * e(r), Math.cos(t) * n(r));
            },
            cos: function () {
              const t = this.re,
                r = this.im;
              return new a(Math.cos(t) * e(r), -Math.sin(t) * n(r));
            },
            tan: function () {
              const t = 2 * this.re,
                r = 2 * this.im,
                i = Math.cos(t) + e(r);
              return new a(Math.sin(t) / i, n(r) / i);
            },
            cot: function () {
              const t = 2 * this.re,
                r = 2 * this.im,
                i = Math.cos(t) - e(r);
              return new a(-Math.sin(t) / i, n(r) / i);
            },
            sec: function () {
              const t = this.re,
                r = this.im,
                i = 0.5 * e(2 * r) + 0.5 * Math.cos(2 * t);
              return new a((Math.cos(t) * e(r)) / i, (Math.sin(t) * n(r)) / i);
            },
            csc: function () {
              const t = this.re,
                r = this.im,
                i = 0.5 * e(2 * r) - 0.5 * Math.cos(2 * t);
              return new a((Math.sin(t) * e(r)) / i, (-Math.cos(t) * n(r)) / i);
            },
            asin: function () {
              const t = this.re,
                e = this.im,
                n = new a(e * e - t * t + 1, -2 * t * e).sqrt(),
                r = new a(n.re - e, n.im + t).log();
              return new a(r.im, -r.re);
            },
            acos: function () {
              const t = this.re,
                e = this.im,
                n = new a(e * e - t * t + 1, -2 * t * e).sqrt(),
                r = new a(n.re - e, n.im + t).log();
              return new a(Math.PI / 2 - r.im, r.re);
            },
            atan: function () {
              const t = this.re,
                e = this.im;
              if (0 === t) {
                if (1 === e) return new a(0, 1 / 0);
                if (-1 === e) return new a(0, -1 / 0);
              }
              const n = t * t + (1 - e) * (1 - e),
                r = new a((1 - e * e - t * t) / n, (-2 * t) / n).log();
              return new a(-0.5 * r.im, 0.5 * r.re);
            },
            acot: function () {
              const t = this.re,
                e = this.im;
              if (0 === e) return new a(Math.atan2(1, t), 0);
              const n = t * t + e * e;
              return 0 !== n
                ? new a(t / n, -e / n).atan()
                : new a(0 !== t ? t / 0 : 0, 0 !== e ? -e / 0 : 0).atan();
            },
            asec: function () {
              const t = this.re,
                e = this.im;
              if (0 === t && 0 === e) return new a(0, 1 / 0);
              const n = t * t + e * e;
              return 0 !== n
                ? new a(t / n, -e / n).acos()
                : new a(0 !== t ? t / 0 : 0, 0 !== e ? -e / 0 : 0).acos();
            },
            acsc: function () {
              const t = this.re,
                e = this.im;
              if (0 === t && 0 === e) return new a(Math.PI / 2, 1 / 0);
              const n = t * t + e * e;
              return 0 !== n
                ? new a(t / n, -e / n).asin()
                : new a(0 !== t ? t / 0 : 0, 0 !== e ? -e / 0 : 0).asin();
            },
            sinh: function () {
              const t = this.re,
                r = this.im;
              return new a(n(t) * Math.cos(r), e(t) * Math.sin(r));
            },
            cosh: function () {
              const t = this.re,
                r = this.im;
              return new a(e(t) * Math.cos(r), n(t) * Math.sin(r));
            },
            tanh: function () {
              const t = 2 * this.re,
                r = 2 * this.im,
                i = e(t) + Math.cos(r);
              return new a(n(t) / i, Math.sin(r) / i);
            },
            coth: function () {
              const t = 2 * this.re,
                r = 2 * this.im,
                i = e(t) - Math.cos(r);
              return new a(n(t) / i, -Math.sin(r) / i);
            },
            csch: function () {
              const t = this.re,
                r = this.im,
                i = Math.cos(2 * r) - e(2 * t);
              return new a((-2 * n(t) * Math.cos(r)) / i, (2 * e(t) * Math.sin(r)) / i);
            },
            sech: function () {
              const t = this.re,
                r = this.im,
                i = Math.cos(2 * r) + e(2 * t);
              return new a((2 * e(t) * Math.cos(r)) / i, (-2 * n(t) * Math.sin(r)) / i);
            },
            asinh: function () {
              const t = this.re,
                e = this.im;
              if (0 === e) {
                if (0 === t) return new a(0, 0);
                const e = Math.abs(t),
                  n = Math.log(e + Math.sqrt(e * e + 1));
                return new a(t < 0 ? -n : n, 0);
              }
              const n = new a(t * t - e * e + 1, 2 * t * e).sqrt();
              return new a(t + n.re, e + n.im).log();
            },
            acosh: function () {
              const t = this.re,
                e = this.im;
              if (0 === e) {
                if (t > 1) return new a(Math.log(t + Math.sqrt(t - 1) * Math.sqrt(t + 1)), 0);
                if (t < -1) {
                  const e = Math.sqrt(t * t - 1);
                  return new a(Math.log(-t + e), Math.PI);
                }
                return new a(0, Math.acos(t));
              }
              const n = new a(t - 1, e).sqrt(),
                r = new a(t + 1, e).sqrt();
              return new a(t + n.re * r.re - n.im * r.im, e + n.re * r.im + n.im * r.re).log();
            },
            atanh: function () {
              const t = this.re,
                e = this.im;
              if (0 === e) {
                if (0 === t) return new a(0, 0);
                if (1 === t) return new a(1 / 0, 0);
                if (-1 === t) return new a(-1 / 0, 0);
                if (-1 < t && t < 1) return new a(0.5 * Math.log((1 + t) / (1 - t)), 0);
                if (t > 1) {
                  const e = (t + 1) / (t - 1);
                  return new a(0.5 * Math.log(e), -Math.PI / 2);
                }
                const e = (1 + t) / (1 - t);
                return new a(0.5 * Math.log(-e), Math.PI / 2);
              }
              const n = 1 - t,
                r = 1 + t,
                i = n * n + e * e;
              if (0 === i) return new a(-1 !== t ? t / 0 : 0, 0 !== e ? e / 0 : 0);
              const s = (r * n - e * e) / i,
                u = (e * n + r * e) / i;
              return new a(o(s, u) / 2, Math.atan2(u, s) / 2);
            },
            acoth: function () {
              const t = this.re,
                e = this.im;
              if (0 === t && 0 === e) return new a(0, Math.PI / 2);
              const n = t * t + e * e;
              return 0 !== n
                ? new a(t / n, -e / n).atanh()
                : new a(0 !== t ? t / 0 : 0, 0 !== e ? -e / 0 : 0).atanh();
            },
            acsch: function () {
              const t = this.re,
                e = this.im;
              if (0 === e) {
                if (0 === t) return new a(1 / 0, 0);
                const e = 1 / t;
                return new a(Math.log(e + Math.sqrt(e * e + 1)), 0);
              }
              const n = t * t + e * e;
              return 0 !== n
                ? new a(t / n, -e / n).asinh()
                : new a(0 !== t ? t / 0 : 0, 0 !== e ? -e / 0 : 0).asinh();
            },
            asech: function () {
              const t = this.re,
                e = this.im;
              if (this.isZero()) return a.INFINITY;
              const n = t * t + e * e;
              return 0 !== n
                ? new a(t / n, -e / n).acosh()
                : new a(0 !== t ? t / 0 : 0, 0 !== e ? -e / 0 : 0).acosh();
            },
            inverse: function () {
              if (this.isZero()) return a.INFINITY;
              if (this.isInfinite()) return a.ZERO;
              const t = this.re,
                e = this.im,
                n = t * t + e * e;
              return new a(t / n, -e / n);
            },
            conjugate: function () {
              return new a(this.re, -this.im);
            },
            neg: function () {
              return new a(-this.re, -this.im);
            },
            ceil: function (t) {
              return (
                (t = Math.pow(10, t || 0)),
                new a(Math.ceil(this.re * t) / t, Math.ceil(this.im * t) / t)
              );
            },
            floor: function (t) {
              return (
                (t = Math.pow(10, t || 0)),
                new a(Math.floor(this.re * t) / t, Math.floor(this.im * t) / t)
              );
            },
            round: function (t) {
              return (
                (t = Math.pow(10, t || 0)),
                new a(Math.round(this.re * t) / t, Math.round(this.im * t) / t)
              );
            },
            equals: function (t, e) {
              const n = u(t, e);
              return Math.abs(n.re - this.re) <= a.EPSILON && Math.abs(n.im - this.im) <= a.EPSILON;
            },
            clone: function () {
              return new a(this.re, this.im);
            },
            toString: function () {
              let t = this.re,
                e = this.im,
                n = "";
              return this.isNaN()
                ? "NaN"
                : this.isInfinite()
                  ? "Infinity"
                  : (Math.abs(t) < a.EPSILON && (t = 0),
                    Math.abs(e) < a.EPSILON && (e = 0),
                    0 === e
                      ? n + t
                      : (0 !== t
                          ? ((n += t),
                            (n += " "),
                            e < 0 ? ((e = -e), (n += "-")) : (n += "+"),
                            (n += " "))
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
            (a.ZERO = new a(0, 0)),
            (a.ONE = new a(1, 0)),
            (a.I = new a(0, 1)),
            (a.PI = new a(Math.PI, 0)),
            (a.E = new a(Math.E, 0)),
            (a.INFINITY = new a(1 / 0, 1 / 0)),
            (a.NAN = new a(NaN, NaN)),
            (a.EPSILON = 1e-15),
            Object.defineProperty(a, "__esModule", { value: !0 }),
            (a.default = a),
            (a.Complex = a),
            (t.exports = a));
        })(Ar)),
      Ar.exports),
    Cr = s(Fr),
    _r = be(
      "Complex",
      [],
      () => (
        Object.defineProperty(Cr, "name", { value: "Complex" }),
        (Cr.prototype.constructor = Cr),
        (Cr.prototype.type = "Complex"),
        (Cr.prototype.isComplex = !0),
        (Cr.prototype.toJSON = function () {
          return { mathjs: "Complex", re: this.re, im: this.im };
        }),
        (Cr.prototype.toPolar = function () {
          return { r: this.abs(), phi: this.arg() };
        }),
        (Cr.prototype.format = function (t) {
          var e = this.im,
            n = this.re,
            r = Fe(this.re, t),
            i = Fe(this.im, t),
            o = xt(t) ? t : t ? t.precision : null;
          if (null !== o) {
            var s = Math.pow(10, -o);
            (Math.abs(n / e) < s && (n = 0), Math.abs(e / n) < s && (e = 0));
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
        (Cr.fromPolar = function (t) {
          switch (arguments.length) {
            case 1:
              var e = arguments[0];
              if ("object" == typeof e) return Cr(e);
              throw new TypeError("Input has to be an object with r and phi keys.");
            case 2:
              var n = arguments[0],
                r = arguments[1];
              if (xt(n)) {
                if ((Nt(r) && r.hasBase("ANGLE") && (r = r.toNumber("rad")), xt(r)))
                  return new Cr({ r: n, phi: r });
                throw new TypeError("Phi is not a number nor an angle unit.");
              }
              throw new TypeError("Radius r is not a number.");
            default:
              throw new SyntaxError("Wrong number of arguments in function fromPolar");
          }
        }),
        (Cr.prototype.valueOf = Cr.prototype.toString),
        (Cr.fromJSON = function (t) {
          return new Cr(t);
        }),
        (Cr.compare = function (t, e) {
          return t.re > e.re ? 1 : t.re < e.re ? -1 : t.im > e.im ? 1 : t.im < e.im ? -1 : 0;
        }),
        Cr
      ),
      { isClass: !0 },
    );
  "undefined" == typeof BigInt &&
    (BigInt = function (t) {
      if (isNaN(t)) throw new Error("");
      return t;
    });
  const Nr = BigInt(0),
    Sr = BigInt(1),
    Br = BigInt(2),
    Mr = BigInt(3),
    Tr = BigInt(5),
    kr = BigInt(10);
  BigInt(Number.MAX_SAFE_INTEGER);
  const Ir = { s: Sr, n: Nr, d: Sr };
  function Lr(t, e) {
    try {
      t = BigInt(t);
    } catch (t) {
      throw Vr();
    }
    return t * e;
  }
  function Or(t) {
    return "bigint" == typeof t ? t : Math.floor(t);
  }
  function Pr(t, e) {
    if (e === Nr) throw qr();
    const n = Object.create(jr.prototype);
    n.s = t < Nr ? -Sr : Sr;
    const r = Gr((t = t < Nr ? -t : t), e);
    return ((n.n = t / r), (n.d = e / r), n);
  }
  const Rr = [Br * Br, Br, Br * Br, Br, Br * Br, Br * Mr, Br, Br * Mr];
  function $r(t) {
    const e = Object.create(null);
    if (t <= Sr) return ((e[t] = Sr), e);
    const n = t => {
      e[t] = (e[t] || Nr) + Sr;
    };
    for (; t % Br === Nr; ) (n(Br), (t /= Br));
    for (; t % Mr === Nr; ) (n(Mr), (t /= Mr));
    for (; t % Tr === Nr; ) (n(Tr), (t /= Tr));
    for (let e = 0, r = Br + Tr; r * r <= t; ) {
      for (; t % r === Nr; ) (n(r), (t /= r));
      ((r += Rr[e]), (e = (e + 1) & 7));
    }
    return (t > Sr && n(t), e);
  }
  const zr = function (t, e) {
    let n = Nr,
      r = Sr,
      i = Sr;
    if (null == t);
    else if (void 0 !== e) {
      if ("bigint" == typeof t) n = t;
      else {
        if (isNaN(t)) throw Vr();
        if (t % 1 != 0) throw Wr();
        n = BigInt(t);
      }
      if ("bigint" == typeof e) r = e;
      else {
        if (isNaN(e)) throw Vr();
        if (e % 1 != 0) throw Wr();
        r = BigInt(e);
      }
      i = n * r;
    } else if ("object" == typeof t) {
      if ("d" in t && "n" in t)
        ((n = BigInt(t.n)), (r = BigInt(t.d)), "s" in t && (n *= BigInt(t.s)));
      else if (0 in t) ((n = BigInt(t[0])), 1 in t && (r = BigInt(t[1])));
      else {
        if ("bigint" != typeof t) throw Vr();
        n = t;
      }
      i = n * r;
    } else if ("number" == typeof t) {
      if (isNaN(t)) throw Vr();
      if ((t < 0 && ((i = -Sr), (t = -t)), t % 1 == 0)) n = BigInt(t);
      else {
        let e = 1,
          i = 0,
          o = 1,
          s = 1,
          u = 1,
          a = 1e7;
        for (t >= 1 && ((e = 10 ** Math.floor(1 + Math.log10(t))), (t /= e)); o <= a && u <= a; ) {
          let e = (i + s) / (o + u);
          if (t === e) {
            o + u <= a
              ? ((n = i + s), (r = o + u))
              : u > o
                ? ((n = s), (r = u))
                : ((n = i), (r = o));
            break;
          }
          (t > e ? ((i += s), (o += u)) : ((s += i), (u += o)),
            o > a ? ((n = s), (r = u)) : ((n = i), (r = o)));
        }
        ((n = BigInt(n) * BigInt(e)), (r = BigInt(r)));
      }
    } else if ("string" == typeof t) {
      let e = 0,
        o = Nr,
        s = Nr,
        u = Nr,
        a = Sr,
        l = Sr,
        c = t.replace(/_/g, "").match(/\d+|./g);
      if (null === c) throw Vr();
      if (
        ("-" === c[e] ? ((i = -Sr), e++) : "+" === c[e] && e++,
        c.length === e + 1
          ? (s = Lr(c[e++], i))
          : "." === c[e + 1] || "." === c[e]
            ? ("." !== c[e] && (o = Lr(c[e++], i)),
              e++,
              (e + 1 === c.length ||
                ("(" === c[e + 1] && ")" === c[e + 3]) ||
                ("'" === c[e + 1] && "'" === c[e + 3])) &&
                ((s = Lr(c[e], i)), (a = kr ** BigInt(c[e].length)), e++),
              (("(" === c[e] && ")" === c[e + 2]) || ("'" === c[e] && "'" === c[e + 2])) &&
                ((u = Lr(c[e + 1], i)), (l = kr ** BigInt(c[e + 1].length) - Sr), (e += 3)))
            : "/" === c[e + 1] || ":" === c[e + 1]
              ? ((s = Lr(c[e], i)), (a = Lr(c[e + 2], Sr)), (e += 3))
              : "/" === c[e + 3] &&
                " " === c[e + 1] &&
                ((o = Lr(c[e], i)), (s = Lr(c[e + 2], i)), (a = Lr(c[e + 4], Sr)), (e += 5)),
        !(c.length <= e))
      )
        throw Vr();
      ((r = a * l), (i = n = u + r * o + l * s));
    } else {
      if ("bigint" != typeof t) throw Vr();
      ((n = t), (i = t), (r = Sr));
    }
    if (r === Nr) throw qr();
    ((Ir.s = i < Nr ? -Sr : Sr), (Ir.n = n < Nr ? -n : n), (Ir.d = r < Nr ? -r : r));
  };
  function Ur(t, e, n) {
    let r = Sr,
      i = (function (t, e, n) {
        let r = Sr;
        for (; e > Nr; t = (t * t) % n, e >>= Sr) e & Sr && (r = (r * t) % n);
        return r;
      })(kr, n, e);
    for (let t = 0; t < 300; t++) {
      if (r === i) return BigInt(t);
      ((r = (r * kr) % e), (i = (i * kr) % e));
    }
    return 0;
  }
  function Gr(t, e) {
    if (!t) return e;
    if (!e) return t;
    for (;;) {
      if (!(t %= e)) return e;
      if (!(e %= t)) return t;
    }
  }
  function jr(t, e) {
    if ((zr(t, e), !(this instanceof jr))) return Pr(Ir.s * Ir.n, Ir.d);
    ((t = Gr(Ir.d, Ir.n)), (this.s = Ir.s), (this.n = Ir.n / t), (this.d = Ir.d / t));
  }
  const qr = function () {
      return new Error("Division by Zero");
    },
    Vr = function () {
      return new Error("Invalid argument");
    },
    Wr = function () {
      return new Error("Parameters must be integer");
    };
  jr.prototype = {
    s: Sr,
    n: Nr,
    d: Sr,
    abs: function () {
      return Pr(this.n, this.d);
    },
    neg: function () {
      return Pr(-this.s * this.n, this.d);
    },
    add: function (t, e) {
      return (zr(t, e), Pr(this.s * this.n * Ir.d + Ir.s * this.d * Ir.n, this.d * Ir.d));
    },
    sub: function (t, e) {
      return (zr(t, e), Pr(this.s * this.n * Ir.d - Ir.s * this.d * Ir.n, this.d * Ir.d));
    },
    mul: function (t, e) {
      return (zr(t, e), Pr(this.s * Ir.s * this.n * Ir.n, this.d * Ir.d));
    },
    div: function (t, e) {
      return (zr(t, e), Pr(this.s * Ir.s * this.n * Ir.d, this.d * Ir.n));
    },
    clone: function () {
      return Pr(this.s * this.n, this.d);
    },
    mod: function (t, e) {
      if (void 0 === t) return Pr((this.s * this.n) % this.d, Sr);
      if ((zr(t, e), Nr === Ir.n * this.d)) throw qr();
      return Pr((this.s * (Ir.d * this.n)) % (Ir.n * this.d), Ir.d * this.d);
    },
    gcd: function (t, e) {
      return (zr(t, e), Pr(Gr(Ir.n, this.n) * Gr(Ir.d, this.d), Ir.d * this.d));
    },
    lcm: function (t, e) {
      return (
        zr(t, e),
        Ir.n === Nr && this.n === Nr
          ? Pr(Nr, Sr)
          : Pr(Ir.n * this.n, Gr(Ir.n, this.n) * Gr(Ir.d, this.d))
      );
    },
    inverse: function () {
      return Pr(this.s * this.d, this.n);
    },
    pow: function (t, e) {
      if ((zr(t, e), Ir.d === Sr))
        return Ir.s < Nr
          ? Pr((this.s * this.d) ** Ir.n, this.n ** Ir.n)
          : Pr((this.s * this.n) ** Ir.n, this.d ** Ir.n);
      if (this.s < Nr) return null;
      let n = $r(this.n),
        r = $r(this.d),
        i = Sr,
        o = Sr;
      for (let t in n)
        if ("1" !== t) {
          if ("0" === t) {
            i = Nr;
            break;
          }
          if (((n[t] *= Ir.n), n[t] % Ir.d !== Nr)) return null;
          ((n[t] /= Ir.d), (i *= BigInt(t) ** n[t]));
        }
      for (let t in r)
        if ("1" !== t) {
          if (((r[t] *= Ir.n), r[t] % Ir.d !== Nr)) return null;
          ((r[t] /= Ir.d), (o *= BigInt(t) ** r[t]));
        }
      return Ir.s < Nr ? Pr(o, i) : Pr(i, o);
    },
    log: function (t, e) {
      if ((zr(t, e), this.s <= Nr || Ir.s <= Nr)) return null;
      const n = Object.create(null),
        r = $r(Ir.n),
        i = $r(Ir.d),
        o = $r(this.n),
        s = $r(this.d);
      for (const t in i) r[t] = (r[t] || Nr) - i[t];
      for (const t in s) o[t] = (o[t] || Nr) - s[t];
      for (const t in r) "1" !== t && (n[t] = !0);
      for (const t in o) "1" !== t && (n[t] = !0);
      let u = null,
        a = null;
      for (const t in n) {
        const e = r[t] || Nr,
          n = o[t] || Nr;
        if (e === Nr) {
          if (n !== Nr) return null;
          continue;
        }
        let i = n,
          s = e;
        const l = Gr(i, s);
        if (((i /= l), (s /= l), null === u && null === a)) ((u = i), (a = s));
        else if (i * a !== u * s) return null;
      }
      return null !== u && null !== a ? Pr(u, a) : null;
    },
    equals: function (t, e) {
      return (zr(t, e), this.s * this.n * Ir.d === Ir.s * Ir.n * this.d);
    },
    lt: function (t, e) {
      return (zr(t, e), this.s * this.n * Ir.d < Ir.s * Ir.n * this.d);
    },
    lte: function (t, e) {
      return (zr(t, e), this.s * this.n * Ir.d <= Ir.s * Ir.n * this.d);
    },
    gt: function (t, e) {
      return (zr(t, e), this.s * this.n * Ir.d > Ir.s * Ir.n * this.d);
    },
    gte: function (t, e) {
      return (zr(t, e), this.s * this.n * Ir.d >= Ir.s * Ir.n * this.d);
    },
    compare: function (t, e) {
      zr(t, e);
      let n = this.s * this.n * Ir.d - Ir.s * Ir.n * this.d;
      return (Nr < n) - (n < Nr);
    },
    ceil: function (t) {
      return (
        (t = kr ** BigInt(t || 0)),
        Pr(
          Or((this.s * t * this.n) / this.d) +
            ((t * this.n) % this.d > Nr && this.s >= Nr ? Sr : Nr),
          t,
        )
      );
    },
    floor: function (t) {
      return (
        (t = kr ** BigInt(t || 0)),
        Pr(
          Or((this.s * t * this.n) / this.d) -
            ((t * this.n) % this.d > Nr && this.s < Nr ? Sr : Nr),
          t,
        )
      );
    },
    round: function (t) {
      return (
        (t = kr ** BigInt(t || 0)),
        Pr(
          Or((this.s * t * this.n) / this.d) +
            this.s * ((this.s >= Nr ? Sr : Nr) + Br * ((t * this.n) % this.d) > this.d ? Sr : Nr),
          t,
        )
      );
    },
    roundTo: function (t, e) {
      zr(t, e);
      const n = this.n * Ir.d,
        r = this.d * Ir.n,
        i = n % r;
      let o = Or(n / r);
      return (i + i >= r && o++, Pr(this.s * o * Ir.n, Ir.d));
    },
    divisible: function (t, e) {
      return (zr(t, e), Ir.n !== Nr && (this.n * Ir.d) % (Ir.n * this.d) === Nr);
    },
    valueOf: function () {
      return Number(this.s * this.n) / Number(this.d);
    },
    toString: function (t = 15) {
      let e = this.n,
        n = this.d,
        r = (function (t, e) {
          for (; e % Br === Nr; e /= Br);
          for (; e % Tr === Nr; e /= Tr);
          if (e === Sr) return Nr;
          let n = kr % e,
            r = 1;
          for (; n !== Sr; r++) if (((n = (n * kr) % e), r > 2e3)) return Nr;
          return BigInt(r);
        })(0, n),
        i = Ur(0, n, r),
        o = this.s < Nr ? "-" : "";
      if (((o += Or(e / n)), (e %= n), (e *= kr), e && (o += "."), r)) {
        for (let t = i; t--; ) ((o += Or(e / n)), (e %= n), (e *= kr));
        o += "(";
        for (let t = r; t--; ) ((o += Or(e / n)), (e %= n), (e *= kr));
        o += ")";
      } else for (let r = t; e && r--; ) ((o += Or(e / n)), (e %= n), (e *= kr));
      return o;
    },
    toFraction: function (t = !1) {
      let e = this.n,
        n = this.d,
        r = this.s < Nr ? "-" : "";
      if (n === Sr) r += e;
      else {
        const i = Or(e / n);
        (t && i > Nr && ((r += i), (r += " "), (e %= n)), (r += e), (r += "/"), (r += n));
      }
      return r;
    },
    toLatex: function (t = !1) {
      let e = this.n,
        n = this.d,
        r = this.s < Nr ? "-" : "";
      if (n === Sr) r += e;
      else {
        const i = Or(e / n);
        (t && i > Nr && ((r += i), (e %= n)),
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
      for (; e; ) {
        n.push(Or(t / e));
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
        let i = Pr(r[t - 1], Sr);
        for (let e = t - 2; e >= 0; e--) i = i.inverse().add(r[e]);
        let o = i.sub(n);
        if (o.n * e < o.d) return i.mul(this.s);
      }
      return this;
    },
  };
  var Qr = be(
      "Fraction",
      [],
      () => (
        Object.defineProperty(jr, "name", { value: "Fraction" }),
        (jr.prototype.constructor = jr),
        (jr.prototype.type = "Fraction"),
        (jr.prototype.isFraction = !0),
        (jr.prototype.toJSON = function () {
          return { mathjs: "Fraction", n: String(this.s * this.n), d: String(this.d) };
        }),
        (jr.fromJSON = function (t) {
          return new jr(t);
        }),
        jr
      ),
      { isClass: !0 },
    ),
    Hr = be(
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
  function Zr(t, e, n) {
    var r = new (0, t.constructor)(2),
      i = "";
    if (n) {
      if (n < 1) throw new Error("size must be in greater than 0");
      if (!Ee(n)) throw new Error("size must be an integer");
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
  function Jr(t, e) {
    if ("function" == typeof e) return e(t);
    if (!t.isFinite()) return t.isNaN() ? "NaN" : t.gt(0) ? "Infinity" : "-Infinity";
    var { notation: n, precision: r, wordSize: i } = Ce(e);
    switch (n) {
      case "fixed":
        return (function (t, e) {
          return t.toFixed(e);
        })(t, r);
      case "exponential":
        return Yr(t, r);
      case "engineering":
        return (function (t, e) {
          var n = t.e,
            r = n % 3 == 0 ? n : n < 0 ? n - 3 - (n % 3) : n - (n % 3),
            i = t.mul(Math.pow(10, -r)),
            o = i.toPrecision(e);
          if (o.includes("e")) {
            o = new (0, t.constructor)(o).toFixed();
          }
          return o + "e" + (n >= 0 ? "+" : "") + r.toString();
        })(t, r);
      case "bin":
        return Zr(t, 2, i);
      case "oct":
        return Zr(t, 8, i);
      case "hex":
        return Zr(t, 16, i);
      case "auto":
        var o = Xr(null == e ? void 0 : e.lowerExp, -3),
          s = Xr(null == e ? void 0 : e.upperExp, 5);
        if (t.isZero()) return "0";
        var u = t.toSignificantDigits(r),
          a = u.e;
        return (a >= o && a < s ? u.toFixed() : Yr(t, r)).replace(
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
  }
  function Yr(t, e) {
    return void 0 !== e ? t.toExponential(e - 1) : t.toExponential();
  }
  function Xr(t, e) {
    return xt(t) ? t : At(t) ? t.toNumber() : e;
  }
  function Kr(t, e) {
    var n = (function (t, e) {
      if ("number" == typeof t) return Fe(t, e);
      if (At(t)) return Jr(t, e);
      if (
        (function (t) {
          return (
            (t &&
              "object" == typeof t &&
              "bigint" == typeof t.s &&
              "bigint" == typeof t.n &&
              "bigint" == typeof t.d) ||
            !1
          );
        })(t)
      )
        return e && "decimal" === e.fraction ? t.toString() : "".concat(t.s * t.n, "/").concat(t.d);
      if (Array.isArray(t)) return ni(t, e);
      if (St(t)) return ti(t);
      if ("function" == typeof t) return t.syntax ? String(t.syntax) : "function";
      if (t && "object" == typeof t) {
        return "function" == typeof t.format
          ? t.format(e)
          : t && t.toString(e) !== {}.toString()
            ? t.toString(e)
            : "{" +
              Object.keys(t)
                .map(n => ti(n) + ": " + Kr(t[n], e))
                .join(", ") +
              "}";
      }
      return String(t);
    })(t, e);
    return e && "object" == typeof e && "truncate" in e && n.length > e.truncate
      ? n.substring(0, e.truncate - 3) + "..."
      : n;
  }
  function ti(t) {
    for (var e = String(t), n = "", r = 0; r < e.length; ) {
      var i = e.charAt(r);
      ((n += i in ei ? ei[i] : i), r++);
    }
    return '"' + n + '"';
  }
  var ei = {
    '"': '\\"',
    "\\": "\\\\",
    "\b": "\\b",
    "\f": "\\f",
    "\n": "\\n",
    "\r": "\\r",
    "\t": "\\t",
  };
  function ni(t, e) {
    if (Array.isArray(t)) {
      for (var n = "[", r = t.length, i = 0; i < r; i++)
        (0 !== i && (n += ", "), (n += ni(t[i], e)));
      return (n += "]");
    }
    return Kr(t, e);
  }
  function ri(t, e, n) {
    if (!(this instanceof ri))
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
  function ii(t, e, n) {
    if (!(this instanceof ii))
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
  function oi(t) {
    for (var e = []; Array.isArray(t); ) (e.push(t.length), (t = t[0]));
    return e;
  }
  function si(t, e, n) {
    var r,
      i = t.length;
    if (i !== e[n]) throw new ri(i, e[n]);
    if (n < e.length - 1) {
      var o = n + 1;
      for (r = 0; r < i; r++) {
        var s = t[r];
        if (!Array.isArray(s)) throw new ri(e.length - 1, e.length, "<");
        si(t[r], e, o);
      }
    } else
      for (r = 0; r < i; r++) if (Array.isArray(t[r])) throw new ri(e.length + 1, e.length, ">");
  }
  function ui(t, e) {
    if (0 === e.length) {
      if (Array.isArray(t)) throw new ri(t.length, 0);
    } else si(t, e, 0);
  }
  function ai(t, e) {
    if (void 0 !== t) {
      if (!xt(t) || !Ee(t)) throw new TypeError("Index must be an integer (value: " + t + ")");
      if (t < 0 || ("number" == typeof e && t >= e)) throw new ii(t, e);
    }
  }
  function li(t, e, n) {
    if (!Array.isArray(e)) throw new TypeError("Array expected");
    if (0 === e.length) throw new Error("Resizing to scalar is not supported");
    return (
      e.forEach(function (t) {
        if (!xt(t) || !Ee(t) || t < 0)
          throw new TypeError("Invalid size, must contain positive integers (size: " + Kr(e) + ")");
      }),
      (xt(t) || At(t)) && (t = [t]),
      ci(t, e, 0, void 0 !== n ? n : 0),
      t
    );
  }
  function ci(t, e, n, r) {
    var i,
      o,
      s = t.length,
      u = e[n],
      a = Math.min(s, u);
    if (((t.length = u), n < e.length - 1)) {
      var l = n + 1;
      for (i = 0; i < a; i++)
        ((o = t[i]), Array.isArray(o) || ((o = [o]), (t[i] = o)), ci(o, e, l, r));
      for (i = a; i < u; i++) ((o = []), (t[i] = o), ci(o, e, l, r));
    } else {
      for (i = 0; i < a; i++) for (; Array.isArray(t[i]); ) t[i] = t[i][0];
      for (i = a; i < u; i++) t[i] = r;
    }
  }
  function pi(t, e) {
    var n = (function (t) {
        var e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
        if (!Array.isArray(t)) return t;
        if ("boolean" != typeof e)
          throw new TypeError("Boolean expected for second argument of flatten");
        var n = [];
        e ? i(t) : r(t);
        return n;
        function r(t) {
          for (var e = 0; e < t.length; e++) {
            var i = t[e];
            Array.isArray(i) ? r(i) : n.push(i);
          }
        }
        function i(t) {
          if (Array.isArray(t[0])) for (var e = 0; e < t.length; e++) i(t[e]);
          else for (var r = 0; r < t.length; r++) n.push(t[r]);
        }
      })(t, !0),
      r = n.length;
    if (!Array.isArray(t) || !Array.isArray(e)) throw new TypeError("Array expected");
    if (0 === e.length) throw new ri(0, r, "!=");
    var i = fi((e = hi(e, r)));
    if (r !== i) throw new ri(i, r, "!=");
    try {
      return (function (t, e) {
        for (var n, r = t, i = e.length - 1; i > 0; i--) {
          var o = e[i];
          n = [];
          for (var s = r.length / o, u = 0; u < s; u++) n.push(r.slice(u * o, (u + 1) * o));
          r = n;
        }
        return r;
      })(n, e);
    } catch (t) {
      if (t instanceof ri) throw new ri(i, r, "!=");
      throw t;
    }
  }
  function hi(t, e) {
    var n = fi(t),
      r = t.slice(),
      i = t.indexOf(-1);
    if (t.indexOf(-1, i + 1) >= 0) throw new Error("More than one wildcard in sizes");
    if (i >= 0) {
      if (!(e % n === 0))
        throw new Error("Could not replace wildcard, since " + e + " is no multiple of " + -n);
      r[i] = -e / n;
    }
    return r;
  }
  function fi(t) {
    return t.reduce((t, e) => t * e, 1);
  }
  function mi(t, e, n, r) {
    var i = r || oi(t);
    if (n) for (var o = 0; o < n; o++) ((t = [t]), i.unshift(1));
    for (t = di(t, e, 0); i.length < e; ) i.push(1);
    return t;
  }
  function di(t, e, n) {
    var r, i;
    if (Array.isArray(t)) {
      var o = n + 1;
      for (r = 0, i = t.length; r < i; r++) t[r] = di(t[r], e, o);
    } else for (var s = n; s < e; s++) t = [t];
    return t;
  }
  function gi(t, e) {
    for (var n, r = 0, i = 0; i < t.length; i++) {
      var o = t[i],
        s = Array.isArray(o);
      if ((0 === i && s && (r = o.length), s && o.length !== r)) return;
      var u = s ? gi(o, e) : e(o);
      if (void 0 === n) n = u;
      else if (n !== u) return "mixed";
    }
    return n;
  }
  function yi(t, e, n, r) {
    if (r < n) {
      if (t.length !== e.length) throw new ri(t.length, e.length);
      for (var i = [], o = 0; o < t.length; o++) i[o] = yi(t[o], e[o], n, r + 1);
      return i;
    }
    return t.concat(e);
  }
  function Di() {
    var t = Array.prototype.slice.call(arguments, 0, -1),
      e = Array.prototype.slice.call(arguments, -1);
    if (1 === t.length) return t[0];
    if (t.length > 1)
      return t.slice(1).reduce(function (t, n) {
        return yi(t, n, e, 0);
      }, t[0]);
    throw new Error("Wrong number of arguments in function concat");
  }
  function vi(t, e) {
    for (var n = e.length, r = t.length, i = 0; i < r; i++) {
      var o = n - r + i;
      if ((t[i] < e[o] && t[i] > 1) || t[i] > e[o])
        throw new Error(
          "shape mismatch: mismatch is found in arg with shape ("
            .concat(t, ") not possible to broadcast dimension ")
            .concat(r, " with size ")
            .concat(t[i], " to size ")
            .concat(e[o]),
        );
    }
  }
  function bi(t, e) {
    var n = oi(t);
    if (he(n, e)) return t;
    vi(n, e);
    var r = (function () {
        for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) e[n] = arguments[n];
        for (
          var r = e.map(t => t.length), i = Math.max(...r), o = new Array(i).fill(null), s = 0;
          s < e.length;
          s++
        )
          for (var u = e[s], a = r[s], l = 0; l < a; l++) {
            var c = i - a + l;
            u[l] > o[c] && (o[c] = u[l]);
          }
        for (var p = 0; p < e.length; p++) vi(e[p], o);
        return o;
      })(n, e),
      i = r.length,
      o = [...Array(i - n.length).fill(1), ...n],
      s = (function (t) {
        return gt([], t);
      })(t);
    n.length < i && (n = oi((s = pi(s, o))));
    for (var u = 0; u < i; u++) n[u] < r[u] && (n = oi((s = wi(s, r[u], u))));
    return s;
  }
  function wi(t, e, n) {
    return Di(...Array(e).fill(t), n);
  }
  function Ei(t, e) {
    if (!Array.isArray(t)) throw new Error("Array expected");
    var n = oi(t);
    if (e.length !== n.length) throw new ri(e.length, n.length);
    for (var r = 0; r < e.length; r++) ai(e[r], n[r]);
    return e.reduce((t, e) => t[e], t);
  }
  function xi(t, e) {
    var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
    if (0 === t.length) return [];
    if (n)
      return (function t(n) {
        if (Array.isArray(n)) {
          for (var r = n.length, i = Array(r), o = 0; o < r; o++) i[o] = t(n[o]);
          return i;
        }
        return e(n);
      })(t);
    var r = [];
    return (function n(i, o) {
      if (Array.isArray(i)) {
        for (var s = i.length, u = Array(s), a = 0; a < s; a++)
          ((r[o] = a), (u[a] = n(i[a], o + 1)));
        return u;
      }
      return e(i, r.slice(0, o), t);
    })(t, 0);
  }
  function Ai(t, e, n, r) {
    if (ve.isTypedFunction(t)) {
      var i, o;
      if (r) i = 1;
      else {
        var s = (e.isMatrix ? e.size() : oi(e)).map(() => 0),
          u = e.isMatrix ? e.get(s) : Ei(e, s);
        i = (function (t, e, n, r) {
          for (var i = [e, n, r], o = 3; o > 0; o--) {
            var s = i.slice(0, o);
            if (null !== ve.resolve(t, s)) return o;
          }
        })(t, u, s, e);
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
        o = void 0 !== a ? a : t;
      } else o = t;
      return i >= 1 && i <= 3
        ? {
            isUnary: 1 === i,
            fn: function () {
              for (var e = arguments.length, r = new Array(e), s = 0; s < e; s++)
                r[s] = arguments[s];
              return Ci(o, r.slice(0, i), n, t.name);
            },
          }
        : {
            isUnary: !1,
            fn: function () {
              for (var e = arguments.length, r = new Array(e), i = 0; i < e; i++)
                r[i] = arguments[i];
              return Ci(o, r, n, t.name);
            },
          };
    }
    return void 0 === r ? { isUnary: Fi(t), fn: t } : { isUnary: r, fn: t };
  }
  function Fi(t) {
    if (1 !== t.length) return !1;
    var e = t.toString();
    if (/arguments/.test(e)) return !1;
    var n = e.match(/\(.*?\)/);
    return !/\.\.\./.test(n);
  }
  function Ci(t, e, n, r) {
    try {
      return t(...e);
    } catch (t) {
      !(function (t, e, n, r) {
        var i;
        if (
          t instanceof TypeError &&
          "wrongType" === (null === (i = t.data) || void 0 === i ? void 0 : i.category)
        ) {
          var o = [];
          throw (
            o.push("value: ".concat(ce(e[0]))),
            e.length >= 2 && o.push("index: ".concat(ce(e[1]))),
            e.length >= 3 && o.push("array: ".concat(ce(e[2]))),
            new TypeError(
              "Function ".concat(n, " cannot apply callback arguments ") +
                "".concat(r, "(").concat(o.join(", "), ") at index ").concat(JSON.stringify(e[1])),
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
  ((ri.prototype = new RangeError()),
    (ri.prototype.constructor = RangeError),
    (ri.prototype.name = "DimensionError"),
    (ri.prototype.isDimensionError = !0),
    (ii.prototype = new RangeError()),
    (ii.prototype.constructor = RangeError),
    (ii.prototype.name = "IndexError"),
    (ii.prototype.isIndexError = !0));
  var _i = be(
    "DenseMatrix",
    ["Matrix"],
    t => {
      var { Matrix: e } = t;
      function n(t, e) {
        if (!(this instanceof n))
          throw new SyntaxError("Constructor must be called with the new operator");
        if (e && !St(e)) throw new Error("Invalid datatype: " + e);
        if (Mt(t))
          "DenseMatrix" === t.type
            ? ((this._data = pe(t._data)),
              (this._size = pe(t._size)),
              (this._datatype = e || t._datatype))
            : ((this._data = t.toArray()),
              (this._size = t.size()),
              (this._datatype = e || t._datatype));
        else if (t && Bt(t.data) && Bt(t.size))
          ((this._data = t.data),
            (this._size = t.size),
            ui(this._data, this._size),
            (this._datatype = e || t.datatype));
        else if (Bt(t))
          ((this._data = o(t)),
            (this._size = oi(this._data)),
            ui(this._data, this._size),
            (this._datatype = e));
        else {
          if (t) throw new TypeError("Unsupported type of data (" + ce(t) + ")");
          ((this._data = []), (this._size = [0]), (this._datatype = e));
        }
      }
      function r(t, e, n) {
        if (0 === e.length) {
          for (var r = t._data; Bt(r); ) r = r[0];
          return r;
        }
        return ((t._size = e.slice(0)), (t._data = li(t._data, t._size, n)), t);
      }
      function i(t, e, n) {
        for (var i = t._size.slice(0), o = !1; i.length < e.length; ) (i.push(0), (o = !0));
        for (var s = 0, u = e.length; s < u; s++) e[s] > i[s] && ((i[s] = e[s]), (o = !0));
        o && r(t, i, n);
      }
      function o(t) {
        return Mt(t) ? o(t.valueOf()) : Bt(t) ? t.map(o) : t;
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
          return gi(this._data, ce);
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
                if (!Ot(e)) throw new TypeError("Invalid index");
                var r = e.isScalar();
                if (r) return t.get(e.min());
                var i = e.size();
                if (i.length !== t._size.length) throw new ri(i.length, t._size.length);
                for (var o = e.min(), s = e.max(), u = 0, a = t._size.length; u < a; u++)
                  (ai(o[u], t._size[u]), ai(s[u], t._size[u]));
                var l = new n([]),
                  c = (function (t, e) {
                    var n = e.size().length - 1,
                      r = Array(n);
                    return { data: i(t), size: r };
                    function i(t) {
                      var o = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
                        s = e.dimension(o);
                      return (
                        (r[o] = s.size()[0]),
                        o < n
                          ? s.map(e => (ai(e, t.length), i(t[e], o + 1))).valueOf()
                          : s.map(e => (ai(e, t.length), t[e])).valueOf()
                      );
                    }
                  })(t._data, e);
                return ((l._size = c.size), (l._datatype = t._datatype), (l._data = c.data), l);
              })(this, t);
            case 2:
            case 3:
              return (function (t, e, n, r) {
                if (!e || !0 !== e.isIndex) throw new TypeError("Invalid index");
                var o,
                  s = e.size(),
                  u = e.isScalar();
                Mt(n) ? ((o = n.size()), (n = n.valueOf())) : (o = oi(n));
                if (u) {
                  if (0 !== o.length) throw new TypeError("Scalar expected");
                  t.set(e.min(), n, r);
                } else {
                  if (!he(o, s))
                    try {
                      o = oi((n = 0 === o.length ? bi([n], s) : bi(n, s)));
                    } catch (t) {}
                  if (s.length < t._size.length) throw new ri(s.length, t._size.length, "<");
                  if (o.length < s.length) {
                    for (var a = 0, l = 0; 1 === s[a] && 1 === o[a]; ) a++;
                    for (; 1 === s[a]; ) (l++, a++);
                    n = mi(n, s.length, l, o);
                  }
                  if (!he(s, o)) throw new ri(s, o, ">");
                  var c = e.max().map(function (t) {
                    return t + 1;
                  });
                  (i(t, c, r),
                    (function (t, e, n) {
                      var r = e.size().length - 1;
                      function i(t, n) {
                        var o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0,
                          s = e.dimension(o);
                        o < r
                          ? s.forEach((e, r) => {
                              (ai(e, t.length), i(t[e], n[r[0]], o + 1));
                            })
                          : s.forEach((e, r) => {
                              (ai(e, t.length), (t[e] = n[r[0]]));
                            });
                      }
                      i(t, n);
                    })(t._data, e, n));
                }
                return t;
              })(this, t, e, r);
            default:
              throw new SyntaxError("Wrong number of arguments");
          }
        }),
        (n.prototype.get = function (t) {
          return Ei(this._data, t);
        }),
        (n.prototype.set = function (t, e, n) {
          if (!Bt(t)) throw new TypeError("Array expected");
          if (t.length < this._size.length) throw new ri(t.length, this._size.length, "<");
          var r,
            o,
            s,
            u = t.map(function (t) {
              return t + 1;
            });
          i(this, u, n);
          var a = this._data;
          for (r = 0, o = t.length - 1; r < o; r++) (ai((s = t[r]), a.length), (a = a[s]));
          return (ai((s = t[t.length - 1]), a.length), (a[s] = e), this);
        }),
        (n.prototype.resize = function (t, e, n) {
          if (!Tt(t)) throw new TypeError("Array or Matrix expected");
          var i = t.valueOf().map(t => (Array.isArray(t) && 1 === t.length ? t[0] : t));
          return r(n ? this.clone() : this, i, e);
        }),
        (n.prototype.reshape = function (t, e) {
          var n = e ? this.clone() : this;
          n._data = pi(n._data, t);
          var r = n._size.reduce((t, e) => t * e);
          return ((n._size = hi(t, r)), n);
        }),
        (n.prototype.clone = function () {
          return new n({ data: pe(this._data), size: pe(this._size), datatype: this._datatype });
        }),
        (n.prototype.size = function () {
          return this._size.slice(0);
        }),
        (n.prototype.map = function (t) {
          var e = arguments.length > 2 && void 0 !== arguments[2] && arguments[2],
            n = this,
            r = n._size.length - 1;
          if (r < 0) return n.clone();
          var i = Ai(t, n, "map", e),
            o = i.fn,
            s = n.create(void 0, n._datatype);
          if (((s._size = n._size), e || i.isUnary))
            return (
              (s._data = (function t(e) {
                var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
                  i = Array(e.length);
                if (n < r) for (var s = 0; s < e.length; s++) i[s] = t(e[s], n + 1);
                else for (var u = 0; u < e.length; u++) i[u] = o(e[u]);
                return i;
              })(n._data)),
              s
            );
          if (0 === r) {
            for (var u = n.valueOf(), a = Array(u.length), l = 0; l < u.length; l++)
              a[l] = o(u[l], [l], n);
            return ((s._data = a), s);
          }
          var c = [];
          return (
            (s._data = (function t(e) {
              var i = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
                s = Array(e.length);
              if (i < r) for (var u = 0; u < e.length; u++) ((c[i] = u), (s[u] = t(e[u], i + 1)));
              else for (var a = 0; a < e.length; a++) ((c[i] = a), (s[a] = o(e[a], c.slice(), n)));
              return s;
            })(n._data)),
            s
          );
        }),
        (n.prototype.forEach = function (t) {
          var e = arguments.length > 2 && void 0 !== arguments[2] && arguments[2],
            n = this,
            r = n._size.length - 1;
          if (!(r < 0)) {
            var i = Ai(t, n, "map", e),
              o = i.fn;
            if (e || i.isUnary)
              (function t(e) {
                var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
                if (n < r) for (var i = 0; i < e.length; i++) t(e[i], n + 1);
                else for (var s = 0; s < e.length; s++) o(e[s]);
              })(n._data);
            else if (0 !== r) {
              var s = [];
              !(function t(e) {
                var i = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
                if (i < r) for (var u = 0; u < e.length; u++) ((s[i] = u), t(e[u], i + 1));
                else for (var a = 0; a < e.length; a++) ((s[i] = a), o(e[a], s.slice(), n));
              })(n._data);
            } else for (var u = 0; u < n._data.length; u++) o(n._data[u], [u], n);
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
                for (var i = this._data, o = 0; o < t; o++) i = i[e[o]];
                yield { value: i[e[t]], index: e.slice() };
                for (var s = t; s >= 0 && (e[s]++, !(e[s] < this._size[s])); s--) e[s] = 0;
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
              o = function (r) {
                var o = i.map(t => [t[r]]);
                e.push(new n(o, t._datatype));
              },
              s = 0;
            s < r[1];
            s++
          )
            o(s);
          return e;
        }),
        (n.prototype.toArray = function () {
          return pe(this._data);
        }),
        (n.prototype.valueOf = function () {
          return this._data;
        }),
        (n.prototype.format = function (t) {
          return Kr(this._data, t);
        }),
        (n.prototype.toString = function () {
          return Kr(this._data);
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
            if ((At(t) && (t = t.toNumber()), !xt(t) || !Ee(t)))
              throw new TypeError("The parameter k must be an integer number");
          } else t = 0;
          for (
            var e = t > 0 ? t : 0,
              r = t < 0 ? -t : 0,
              i = this._size[0],
              o = this._size[1],
              s = Math.min(i - r, o - e),
              u = [],
              a = 0;
            a < s;
            a++
          )
            u[a] = this._data[a + r][a + e];
          return new n({ data: u, size: [s], datatype: this._datatype });
        }),
        (n.diagonal = function (t, e, r, i) {
          if (!Bt(t)) throw new TypeError("Array expected, size parameter");
          if (2 !== t.length) throw new Error("Only two dimensions matrix are supported");
          if (
            ((t = t.map(function (t) {
              if ((At(t) && (t = t.toNumber()), !xt(t) || !Ee(t) || t < 1))
                throw new Error("Size values must be positive integers");
              return t;
            })),
            r)
          ) {
            if ((At(r) && (r = r.toNumber()), !xt(r) || !Ee(r)))
              throw new TypeError("The parameter k must be an integer number");
          } else r = 0;
          var o,
            s = r > 0 ? r : 0,
            u = r < 0 ? -r : 0,
            a = t[0],
            l = t[1],
            c = Math.min(a - u, l - s);
          if (Bt(e)) {
            if (e.length !== c) throw new Error("Invalid value array length");
            o = function (t) {
              return e[t];
            };
          } else if (Mt(e)) {
            var p = e.size();
            if (1 !== p.length || p[0] !== c) throw new Error("Invalid matrix length");
            o = function (t) {
              return e.get([t]);
            };
          } else
            o = function () {
              return e;
            };
          i || (i = At(o(0)) ? o(0).mul(0) : 0);
          var h = [];
          if (t.length > 0) {
            h = li(h, t, i);
            for (var f = 0; f < c; f++) h[f + u][f + s] = o(f);
          }
          return new n({ data: h, size: [a, l] });
        }),
        (n.fromJSON = function (t) {
          return new n(t);
        }),
        (n.prototype.swapRows = function (t, e) {
          if (!(xt(t) && Ee(t) && xt(e) && Ee(e)))
            throw new Error("Row index must be positive integers");
          if (2 !== this._size.length) throw new Error("Only two dimensional matrix is supported");
          return (ai(t, this._size[0]), ai(e, this._size[0]), n._swapRows(t, e, this._data), this);
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
  function Ni(t, e, n) {
    if (!n) return Mt(t) ? t.map(t => e(t), !1, !0) : xi(t, e, !0);
    var r = t => (0 === t ? t : e(t));
    return Mt(t) ? t.map(t => r(t), !1, !0) : xi(t, r, !0);
  }
  var Si = "number",
    Bi = "number, number";
  function Mi(t) {
    return Math.abs(t);
  }
  function Ti(t, e) {
    return t + e;
  }
  function ki(t, e) {
    return t - e;
  }
  function Ii(t, e) {
    return t * e;
  }
  function Li(t) {
    return -t;
  }
  function Oi(t, e) {
    return (t * t < 1 && e === 1 / 0) || (t * t > 1 && e === -1 / 0) ? 0 : Math.pow(t, e);
  }
  function Pi(t, e) {
    if (e < t) return 1;
    if (e === t) return e;
    var n = (e + t) >> 1;
    return Pi(t, n) * Pi(n + 1, e);
  }
  function Ri(t) {
    var e;
    if (Ee(t)) return t <= 0 ? (isFinite(t) ? 1 / 0 : NaN) : t > 171 ? 1 / 0 : Pi(1, t - 1);
    if (t < 0.5) return Math.PI / (Math.sin(Math.PI * t) * Ri(1 - t));
    if (t >= 171.35) return 1 / 0;
    if (t > 85) {
      var n = t * t,
        r = n * t,
        i = r * t,
        o = i * t;
      return (
        Math.sqrt((2 * Math.PI) / t) *
        Math.pow(t / Math.E, t) *
        (1 +
          1 / (12 * t) +
          1 / (288 * n) -
          139 / (51840 * r) -
          571 / (2488320 * i) +
          163879 / (209018880 * o) +
          5246819 / (75246796800 * o * t))
      );
    }
    (--t, (e = zi[0]));
    for (var s = 1; s < zi.length; ++s) e += zi[s] / (t + s);
    var u = t + $i + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(u, t + 0.5) * Math.exp(-u) * e;
  }
  ((Mi.signature = Si),
    (Ti.signature = Bi),
    (ki.signature = Bi),
    (Ii.signature = Bi),
    (Li.signature = Si),
    (Oi.signature = Bi),
    (Ri.signature = "number"));
  var $i = 4.7421875,
    zi = [
      0.9999999999999971, 57.15623566586292, -59.59796035547549, 14.136097974741746,
      -0.4919138160976202, 3399464998481189e-20, 4652362892704858e-20, -9837447530487956e-20,
      0.0001580887032249125, -0.00021026444172410488, 0.00021743961811521265,
      -0.0001643181065367639, 8441822398385275e-20, -26190838401581408e-21, 36899182659531625e-22,
    ],
    Ui = 0.9189385332046728,
    Gi = [
      1.000000000190015, 76.18009172947146, -86.50532032941678, 24.01409824083091,
      -1.231739572450155, 0.001208650973866179, -5395239384953e-18,
    ];
  function ji(t) {
    if (t < 0) return NaN;
    if (0 === t) return 1 / 0;
    if (!isFinite(t)) return t;
    if (t < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * t)) - ji(1 - t);
    for (var e = (t -= 1) + 5 + 0.5, n = Gi[0], r = 6; r >= 1; r--) n += Gi[r] / (t + r);
    return Ui + (t + 0.5) * Math.log(e) - e + Math.log(n);
  }
  ji.signature = "number";
  var qi = "isZero",
    Vi = be(qi, ["typed", "equalScalar"], t => {
      var { typed: e, equalScalar: n } = t;
      return e(qi, {
        "number | BigNumber | Complex | Fraction": t => n(t, 0),
        bigint: t => 0n === t,
        Unit: e.referToSelf(t => n => e.find(t, n.valueType())(n.value)),
        "Array | Matrix": e.referToSelf(t => e => Ni(e, t)),
      });
    });
  var Wi = be("compareUnits", ["typed"], t => {
      var { typed: e } = t;
      return {
        "Unit, Unit": e.referToSelf(t => (n, r) => {
          if (!n.equalBase(r)) throw new Error("Cannot compare units with different base");
          return e.find(t, [n.valueType(), r.valueType()])(n.value, r.value);
        }),
      };
    }),
    Qi = "equalScalar",
    Hi = be(Qi, ["typed", "config"], t => {
      var { typed: e, config: n } = t,
        r = Wi({ typed: e });
      return e(
        Qi,
        {
          "boolean, boolean": function (t, e) {
            return t === e;
          },
          "number, number": function (t, e) {
            return Me(t, e, n.relTol, n.absTol);
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
              return Me(t.re, e.re, n, r) && Me(t.im, e.im, n, r);
            })(t, e, n.relTol, n.absTol);
          },
        },
        r,
      );
    });
  be(Qi, ["typed", "config"], t => {
    var { typed: e, config: n } = t;
    return e(Qi, {
      "number, number": function (t, e) {
        return Me(t, e, n.relTol, n.absTol);
      },
    });
  });
  var Zi = be(
    "SparseMatrix",
    ["typed", "equalScalar", "Matrix"],
    t => {
      var { typed: e, equalScalar: n, Matrix: r } = t;
      function i(t, e) {
        if (!(this instanceof i))
          throw new SyntaxError("Constructor must be called with the new operator");
        if (e && !St(e)) throw new Error("Invalid datatype: " + e);
        if (Mt(t))
          !(function (t, e, n) {
            "SparseMatrix" === e.type
              ? ((t._values = e._values ? pe(e._values) : void 0),
                (t._index = pe(e._index)),
                (t._ptr = pe(e._ptr)),
                (t._size = pe(e._size)),
                (t._datatype = n || e._datatype))
              : o(t, e.valueOf(), n || e._datatype);
          })(this, t, e);
        else if (t && Bt(t.index) && Bt(t.ptr) && Bt(t.size))
          ((this._values = t.values),
            (this._index = t.index),
            (this._ptr = t.ptr),
            (this._size = t.size),
            (this._datatype = e || t.datatype));
        else if (Bt(t)) o(this, t, e);
        else {
          if (t) throw new TypeError("Unsupported type of data (" + ce(t) + ")");
          ((this._values = []),
            (this._index = []),
            (this._ptr = [0]),
            (this._size = [0, 0]),
            (this._datatype = e));
        }
      }
      function o(t, r, i) {
        ((t._values = []), (t._index = []), (t._ptr = []), (t._datatype = i));
        var o = r.length,
          s = 0,
          u = n,
          a = 0;
        if ((St(i) && ((u = e.find(n, [i, i]) || n), (a = e.convert(0, i))), o > 0)) {
          var l = 0;
          do {
            t._ptr.push(t._index.length);
            for (var c = 0; c < o; c++) {
              var p = r[c];
              if (Bt(p)) {
                if ((0 === l && s < p.length && (s = p.length), l < p.length)) {
                  var h = p[l];
                  u(h, a) || (t._values.push(h), t._index.push(c));
                }
              } else
                (0 === l && s < 1 && (s = 1), u(p, a) || (t._values.push(p), t._index.push(c)));
            }
            l++;
          } while (l < s);
        }
        (t._ptr.push(t._index.length), (t._size = [o, s]));
      }
      function s(t, e, n, r) {
        if (n - e === 0) return n;
        for (var i = e; i < n; i++) if (r[i] === t) return i;
        return e;
      }
      function u(t, e, n, r, i, o, s) {
        (i.splice(t, 0, r), o.splice(t, 0, e));
        for (var u = n + 1; u < s.length; u++) s[u]++;
      }
      function a(t, r, i, o) {
        var s = o || 0,
          u = n,
          a = 0;
        St(t._datatype) &&
          ((u = e.find(n, [t._datatype, t._datatype]) || n),
          (a = e.convert(0, t._datatype)),
          (s = e.convert(s, t._datatype)));
        var l,
          c,
          p,
          h = !u(s, a),
          f = t._size[0],
          m = t._size[1];
        if (i > m) {
          for (c = m; c < i; c++)
            if (((t._ptr[c] = t._values.length), h))
              for (l = 0; l < f; l++) (t._values.push(s), t._index.push(l));
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
                (t._values.splice(p + g, 0, s), t._index.splice(p + g, 0, l), d++);
            }
            t._ptr[m] = t._values.length;
          }
        } else if (r < f) {
          var y = 0;
          for (c = 0; c < m; c++) {
            t._ptr[c] = t._ptr[c] - y;
            var D = t._ptr[c],
              v = t._ptr[c + 1] - y;
            for (p = D; p < v; p++)
              (l = t._index[p]) > r - 1 && (t._values.splice(p, 1), t._index.splice(p, 1), y++);
          }
          t._ptr[c] = t._values.length;
        }
        return ((t._size[0] = r), (t._size[1] = i), t);
      }
      function l(t, e, n, r, i) {
        var o,
          s,
          u = r[0],
          a = r[1],
          l = [];
        for (o = 0; o < u; o++) for (l[o] = [], s = 0; s < a; s++) l[o][s] = 0;
        for (s = 0; s < a; s++)
          for (var c = n[s], p = n[s + 1], h = c; h < p; h++)
            l[(o = e[h])][s] = t ? (i ? pe(t[h]) : t[h]) : 1;
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
          return gi(this._values, ce);
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
                if (!Ot(e)) throw new TypeError("Invalid index");
                if (e.isScalar()) return t.get(e.min());
                var n,
                  r,
                  o,
                  s,
                  u = e.size();
                if (u.length !== t._size.length) throw new ri(u.length, t._size.length);
                var a = e.min(),
                  l = e.max();
                for (n = 0, r = t._size.length; n < r; n++)
                  (ai(a[n], t._size[n]), ai(l[n], t._size[n]));
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
                var y = c ? [] : void 0,
                  D = [],
                  v = [];
                return (
                  m.forEach(function (t) {
                    for (v.push(D.length), o = h[t], s = h[t + 1]; o < s; o++)
                      ((n = p[o]), !0 === d[n] && (D.push(g[n]), y && y.push(c[o])));
                  }),
                  v.push(D.length),
                  new i({ values: y, index: D, ptr: v, size: u, datatype: t._datatype })
                );
              })(this, t);
            case 2:
            case 3:
              return (function (t, e, n, r) {
                if (!e || !0 !== e.isIndex) throw new TypeError("Invalid index");
                var i,
                  o = e.size(),
                  s = e.isScalar();
                Mt(n) ? ((i = n.size()), (n = n.toArray())) : (i = oi(n));
                if (s) {
                  if (0 !== i.length) throw new TypeError("Scalar expected");
                  t.set(e.min(), n, r);
                } else {
                  if (1 !== o.length && 2 !== o.length) throw new ri(o.length, t._size.length, "<");
                  if (i.length < o.length) {
                    for (var u = 0, a = 0; 1 === o[u] && 1 === i[u]; ) u++;
                    for (; 1 === o[u]; ) (a++, u++);
                    n = mi(n, o.length, a, i);
                  }
                  if (!he(o, i)) throw new ri(o, i, ">");
                  if (1 === o.length) {
                    e.dimension(0).forEach(function (e, i) {
                      (ai(e), t.set([e, 0], n[i[0]], r));
                    });
                  } else {
                    var l = e.dimension(0),
                      c = e.dimension(1);
                    l.forEach(function (e, i) {
                      (ai(e),
                        c.forEach(function (o, s) {
                          (ai(o), t.set([e, o], n[i[0]][s[0]], r));
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
          if (!Bt(t)) throw new TypeError("Array expected");
          if (t.length !== this._size.length) throw new ri(t.length, this._size.length);
          if (!this._values) throw new Error("Cannot invoke get on a Pattern only matrix");
          var e = t[0],
            n = t[1];
          (ai(e, this._size[0]), ai(n, this._size[1]));
          var r = s(e, this._ptr[n], this._ptr[n + 1], this._index);
          return r < this._ptr[n + 1] && this._index[r] === e ? this._values[r] : 0;
        }),
        (i.prototype.set = function (t, r, i) {
          if (!Bt(t)) throw new TypeError("Array expected");
          if (t.length !== this._size.length) throw new ri(t.length, this._size.length);
          if (!this._values) throw new Error("Cannot invoke set on a Pattern only matrix");
          var o = t[0],
            l = t[1],
            c = this._size[0],
            p = this._size[1],
            h = n,
            f = 0;
          (St(this._datatype) &&
            ((h = e.find(n, [this._datatype, this._datatype]) || n),
            (f = e.convert(0, this._datatype))),
            (o > c - 1 || l > p - 1) &&
              (a(this, Math.max(o + 1, c), Math.max(l + 1, p), i),
              (c = this._size[0]),
              (p = this._size[1])),
            ai(o, c),
            ai(l, p));
          var m = s(o, this._ptr[l], this._ptr[l + 1], this._index);
          return (
            m < this._ptr[l + 1] && this._index[m] === o
              ? h(r, f)
                ? (function (t, e, n, r, i) {
                    (n.splice(t, 1), r.splice(t, 1));
                    for (var o = e + 1; o < i.length; o++) i[o]--;
                  })(m, l, this._values, this._index, this._ptr)
                : (this._values[m] = r)
              : h(r, f) || u(m, o, l, r, this._values, this._index, this._ptr),
            this
          );
        }),
        (i.prototype.resize = function (t, e, n) {
          if (!Tt(t)) throw new TypeError("Array or Matrix expected");
          var r = t.valueOf().map(t => (Array.isArray(t) && 1 === t.length ? t[0] : t));
          if (2 !== r.length) throw new Error("Only two dimensions matrix are supported");
          return (
            r.forEach(function (t) {
              if (!xt(t) || !Ee(t) || t < 0)
                throw new TypeError(
                  "Invalid size, must contain positive integers (size: " + Kr(r) + ")",
                );
            }),
            a(n ? this.clone() : this, r[0], r[1], e)
          );
        }),
        (i.prototype.reshape = function (t, e) {
          if (!Bt(t)) throw new TypeError("Array expected");
          if (2 !== t.length)
            throw new Error("Sparse matrices can only be reshaped in two dimensions");
          t.forEach(function (e) {
            if (!xt(e) || !Ee(e) || e <= -2 || 0 === e)
              throw new TypeError(
                "Invalid size, must contain positive integers or -1 (size: " + Kr(t) + ")",
              );
          });
          var n = this._size[0] * this._size[1];
          if (n !== (t = hi(t, n))[0] * t[1])
            throw new Error("Reshaping sparse matrix will result in the wrong number of elements");
          var r = e ? this.clone() : this;
          if (this._size[0] === t[0] && this._size[1] === t[1]) return r;
          for (var i = [], o = 0; o < r._ptr.length; o++)
            for (var a = 0; a < r._ptr[o + 1] - r._ptr[o]; a++) i.push(o);
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
            var y = c[g],
              D = i[g],
              v = l[g];
            u(s(y, r._ptr[D], r._ptr[D + 1], r._index), y, D, v, r._values, r._index, r._ptr);
          }
          return r;
        }),
        (i.prototype.clone = function () {
          return new i({
            values: this._values ? pe(this._values) : void 0,
            index: pe(this._index),
            ptr: pe(this._ptr),
            size: pe(this._size),
            datatype: this._datatype,
          });
        }),
        (i.prototype.size = function () {
          return this._size.slice(0);
        }),
        (i.prototype.map = function (t, r) {
          if (!this._values) throw new Error("Cannot invoke map on a Pattern only matrix");
          var o = this,
            s = this._size[0],
            u = this._size[1],
            a = Ai(t, o, "map");
          return (function (t, r, o, s, u, a, l) {
            var c = [],
              p = [],
              h = [],
              f = n,
              m = 0;
            St(t._datatype) &&
              ((f = e.find(n, [t._datatype, t._datatype]) || n), (m = e.convert(0, t._datatype)));
            for (
              var d = function (t, e, n) {
                  var r = a(t, e, n);
                  f(r, m) || (c.push(r), p.push(e));
                },
                g = s;
              g <= u;
              g++
            ) {
              h.push(c.length);
              var y = t._ptr[g],
                D = t._ptr[g + 1];
              if (l)
                for (var v = y; v < D; v++) {
                  var b = t._index[v];
                  b >= r && b <= o && d(t._values[v], b - r, g - s);
                }
              else {
                for (var w = {}, E = y; E < D; E++) {
                  w[t._index[E]] = t._values[E];
                }
                for (var x = r; x <= o; x++) {
                  d(x in w ? w[x] : 0, x - r, g - s);
                }
              }
            }
            return (
              h.push(c.length),
              new i({ values: c, index: p, ptr: h, size: [o - r + 1, u - s + 1] })
            );
          })(
            this,
            0,
            s - 1,
            0,
            u - 1,
            function (t, e, n) {
              return a.fn(t, [e, n], o);
            },
            r,
          );
        }),
        (i.prototype.forEach = function (t, e) {
          if (!this._values) throw new Error("Cannot invoke forEach on a Pattern only matrix");
          for (
            var n = this, r = this._size[0], i = this._size[1], o = Ai(t, n, "forEach"), s = 0;
            s < i;
            s++
          ) {
            var u = this._ptr[s],
              a = this._ptr[s + 1];
            if (e)
              for (var l = u; l < a; l++) {
                var c = this._index[l];
                o.fn(this._values[l], [c, s], n);
              }
            else {
              for (var p = {}, h = u; h < a; h++) {
                p[this._index[h]] = this._values[h];
              }
              for (var f = 0; f < r; f++) {
                var m = f in p ? p[f] : 0;
                o.fn(m, [f, s], n);
              }
            }
          }
        }),
        (i.prototype[Symbol.iterator] = function* () {
          if (!this._values) throw new Error("Cannot iterate a Pattern only matrix");
          for (var t = this._size[1], e = 0; e < t; e++)
            for (var n = this._ptr[e], r = this._ptr[e + 1], i = n; i < r; i++) {
              var o = this._index[i];
              yield { value: this._values[i], index: [o, e] };
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
              i = "Sparse Matrix [" + Kr(e, t) + " x " + Kr(n, t) + "] density: " + Kr(r, t) + "\n",
              o = 0;
            o < n;
            o++
          )
            for (var s = this._ptr[o], u = this._ptr[o + 1], a = s; a < u; a++) {
              i +=
                "\n    (" +
                Kr(this._index[a], t) +
                ", " +
                Kr(o, t) +
                ") ==> " +
                (this._values ? Kr(this._values[a], t) : "X");
            }
          return i;
        }),
        (i.prototype.toString = function () {
          return Kr(this.toArray());
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
            if ((At(t) && (t = t.toNumber()), !xt(t) || !Ee(t)))
              throw new TypeError("The parameter k must be an integer number");
          } else t = 0;
          var e = t > 0 ? t : 0,
            n = t < 0 ? -t : 0,
            r = this._size[0],
            o = this._size[1],
            s = Math.min(r - n, o - e),
            u = [],
            a = [],
            l = [];
          l[0] = 0;
          for (var c = e; c < o && u.length < s; c++)
            for (var p = this._ptr[c], h = this._ptr[c + 1], f = p; f < h; f++) {
              var m = this._index[f];
              if (m === c - e + n) {
                (u.push(this._values[f]), (a[u.length - 1] = m - n));
                break;
              }
            }
          return (l.push(u.length), new i({ values: u, index: a, ptr: l, size: [s, 1] }));
        }),
        (i.fromJSON = function (t) {
          return new i(t);
        }),
        (i.diagonal = function (t, r, o, s, u) {
          if (!Bt(t)) throw new TypeError("Array expected, size parameter");
          if (2 !== t.length) throw new Error("Only two dimensions matrix are supported");
          if (
            ((t = t.map(function (t) {
              if ((At(t) && (t = t.toNumber()), !xt(t) || !Ee(t) || t < 1))
                throw new Error("Size values must be positive integers");
              return t;
            })),
            o)
          ) {
            if ((At(o) && (o = o.toNumber()), !xt(o) || !Ee(o)))
              throw new TypeError("The parameter k must be an integer number");
          } else o = 0;
          var a = n,
            l = 0;
          St(u) && ((a = e.find(n, [u, u]) || n), (l = e.convert(0, u)));
          var c,
            p = o > 0 ? o : 0,
            h = o < 0 ? -o : 0,
            f = t[0],
            m = t[1],
            d = Math.min(f - h, m - p);
          if (Bt(r)) {
            if (r.length !== d) throw new Error("Invalid value array length");
            c = function (t) {
              return r[t];
            };
          } else if (Mt(r)) {
            var g = r.size();
            if (1 !== g.length || g[0] !== d) throw new Error("Invalid matrix length");
            c = function (t) {
              return r.get([t]);
            };
          } else
            c = function () {
              return r;
            };
          for (var y = [], D = [], v = [], b = 0; b < m; b++) {
            v.push(y.length);
            var w = b - p;
            if (w >= 0 && w < d) {
              var E = c(w);
              a(E, l) || (D.push(w + h), y.push(E));
            }
          }
          return (v.push(y.length), new i({ values: y, index: D, ptr: v, size: [f, m] }));
        }),
        (i.prototype.swapRows = function (t, e) {
          if (!(xt(t) && Ee(t) && xt(e) && Ee(e)))
            throw new Error("Row index must be positive integers");
          if (2 !== this._size.length) throw new Error("Only two dimensional matrix is supported");
          return (
            ai(t, this._size[0]),
            ai(e, this._size[0]),
            i._swapRows(t, e, this._size[1], this._values, this._index, this._ptr),
            this
          );
        }),
        (i._forEachRow = function (t, e, n, r, i) {
          for (var o = r[t], s = r[t + 1], u = o; u < s; u++) i(n[u], e[u]);
        }),
        (i._swapRows = function (t, e, n, r, i, o) {
          for (var u = 0; u < n; u++) {
            var a = o[u],
              l = o[u + 1],
              c = s(t, a, l, i),
              p = s(e, a, l, i);
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
  );
  var Ji = be("number", ["typed"], t => {
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
              o = t.match(/(0[box][0-9a-fA-F]*)i([0-9]*)/);
            o && ((i = Number(o[2])), (t = o[1]));
            var s = Number(t);
            if (isNaN(s)) throw new SyntaxError('String "' + t + '" is not a valid number');
            if (o) {
              if (s > 2 ** i - 1) throw new SyntaxError('String "'.concat(t, '" is out of range'));
              s >= 2 ** (i - 1) && (s -= 2 ** i);
            }
            return s;
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
          "Array | Matrix": e.referToSelf(t => e => Ni(e, t)),
        });
      return (
        (n.fromJSON = function (t) {
          return parseFloat(t.value);
        }),
        n
      );
    }),
    Yi = be("bignumber", ["typed", "BigNumber"], t => {
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
              o = new n(2).pow(Number(r));
            if (i.gt(o.sub(1))) throw new SyntaxError('String "'.concat(t, '" is out of range'));
            var s = new n(2).pow(Number(r) - 1);
            return i.gte(s) ? i.sub(o) : i;
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
        "Array | Matrix": e.referToSelf(t => e => Ni(e, t)),
      });
    }),
    Xi = be("fraction", ["typed", "Fraction"], t => {
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
        "Array | Matrix": e.referToSelf(t => e => Ni(e, t)),
      });
    }),
    Ki = "matrix",
    to = be(Ki, ["typed", "Matrix", "DenseMatrix", "SparseMatrix"], t => {
      var { typed: e, Matrix: n, DenseMatrix: r, SparseMatrix: i } = t;
      return e(Ki, {
        "": function () {
          return o([]);
        },
        string: function (t) {
          return o([], t);
        },
        "string, string": function (t, e) {
          return o([], t, e);
        },
        Array: function (t) {
          return o(t);
        },
        Matrix: function (t) {
          return o(t, t.storage());
        },
        "Array | Matrix, string": o,
        "Array | Matrix, string, string": o,
      });
      function o(t, e, n) {
        if ("dense" === e || "default" === e || void 0 === e) return new r(t, n);
        if ("sparse" === e) return new i(t, n);
        throw new TypeError("Unknown matrix type " + JSON.stringify(e) + ".");
      }
    }),
    eo = "unaryMinus",
    no = be(eo, ["typed"], t => {
      var { typed: e } = t;
      return e(eo, {
        number: Li,
        "Complex | BigNumber | Fraction": t => t.neg(),
        bigint: t => -t,
        Unit: e.referToSelf(t => n => {
          var r = n.clone();
          return ((r.value = e.find(t, r.valueType())(n.value)), r);
        }),
        "Array | Matrix": e.referToSelf(t => e => Ni(e, t, !0)),
      });
    }),
    ro = be("abs", ["typed"], t => {
      var { typed: e } = t;
      return e("abs", {
        number: Mi,
        "Complex | BigNumber | Fraction | Unit": t => t.abs(),
        bigint: t => (t < 0n ? -t : t),
        "Array | Matrix": e.referToSelf(t => e => Ni(e, t, !0)),
      });
    }),
    io = "mapSlices",
    oo = be(
      io,
      ["typed", "isInteger"],
      t => {
        var { typed: e, isInteger: n } = t;
        return e(io, {
          "Array | Matrix, number | BigNumber, function": function (t, e, r) {
            if (!n(e)) throw new TypeError("Integer number expected for dimension");
            var i = Array.isArray(t) ? oi(t) : t.size();
            if (e < 0 || e >= i.length) throw new ii(e, i.length);
            return Mt(t) ? t.create(so(t.valueOf(), e, r), t.datatype()) : so(t, e, r);
          },
        });
      },
      { formerly: "apply" },
    );
  function so(t, e, n) {
    var r, i, o;
    if (e <= 0) {
      if (Array.isArray(t[0])) {
        for (
          o = (function (t) {
            var e,
              n,
              r = t.length,
              i = t[0].length,
              o = [];
            for (n = 0; n < i; n++) {
              var s = [];
              for (e = 0; e < r; e++) s.push(t[e][n]);
              o.push(s);
            }
            return o;
          })(t),
            i = [],
            r = 0;
          r < o.length;
          r++
        )
          i[r] = so(o[r], e - 1, n);
        return i;
      }
      return n(t);
    }
    for (i = [], r = 0; r < t.length; r++) i[r] = so(t[r], e - 1, n);
    return i;
  }
  var uo = "addScalar",
    ao = be(uo, ["typed"], t => {
      var { typed: e } = t;
      return e(uo, {
        "number, number": Ti,
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
    lo = "subtractScalar",
    co = be(lo, ["typed"], t => {
      var { typed: e } = t;
      return e(lo, {
        "number, number": ki,
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
    po = be("matAlgo11xS0s", ["typed", "equalScalar"], t => {
      var { typed: e, equalScalar: n } = t;
      return function (t, r, i, o) {
        var s = t._values,
          u = t._index,
          a = t._ptr,
          l = t._size,
          c = t._datatype;
        if (!s)
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
        for (var y = [], D = [], v = [], b = 0; b < f; b++) {
          v[b] = D.length;
          for (var w = a[b], E = a[b + 1], x = w; x < E; x++) {
            var A = u[x],
              F = o ? g(r, s[x]) : g(s[x], r);
            m(F, d) || (D.push(A), y.push(F));
          }
        }
        return (
          (v[f] = D.length),
          t.createSparseMatrix({ values: y, index: D, ptr: v, size: [h, f], datatype: p })
        );
      };
    }),
    ho = be("matAlgo14xDs", ["typed"], t => {
      var { typed: e } = t;
      return function (t, r, i, o) {
        var s,
          u = t._data,
          a = t._size,
          l = t._datatype,
          c = i;
        "string" == typeof l && ((s = l), (r = e.convert(r, s)), (c = e.find(i, [s, s])));
        var p = a.length > 0 ? n(c, 0, a, a[0], u, r, o) : [];
        return t.createDenseMatrix({ data: p, size: pe(a), datatype: s });
      };
      function n(t, e, r, i, o, s, u) {
        var a = [];
        if (e === r.length - 1) for (var l = 0; l < i; l++) a[l] = u ? t(s, o[l]) : t(o[l], s);
        else for (var c = 0; c < i; c++) a[c] = n(t, e + 1, r, r[e + 1], o[c], s, u);
        return a;
      }
    });
  function fo(t, e, n, r) {
    if (!(this instanceof fo))
      throw new SyntaxError("Constructor must be called with the new operator");
    ((this.fn = t),
      (this.count = e),
      (this.min = n),
      (this.max = r),
      (this.message =
        "Wrong number of arguments in function " +
        t +
        " (" +
        e +
        " provided, " +
        n +
        (null != r ? "-" + r : "") +
        " expected)"),
      (this.stack = new Error().stack));
  }
  (new wr(10),
    new wr(10),
    (fo.prototype = new Error()),
    (fo.prototype.constructor = Error),
    (fo.prototype.name = "ArgumentsError"),
    (fo.prototype.isArgumentsError = !0));
  var mo = be("multiplyScalar", ["typed"], t => {
      var { typed: e } = t;
      return e("multiplyScalar", {
        "number, number": Ii,
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
    go = "multiply",
    yo = be(go, ["typed", "matrix", "addScalar", "multiplyScalar", "equalScalar", "dot"], t => {
      var { typed: e, matrix: n, addScalar: r, multiplyScalar: i, equalScalar: o, dot: s } = t,
        u = po({ typed: e, equalScalar: o }),
        a = ho({ typed: e });
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
      function c(t, n) {
        if ("dense" !== n.storage()) throw new Error("Support for SparseMatrix not implemented");
        return (function (t, n) {
          var o,
            s = t._data,
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
            ((o = a), (m = e.find(r, [o, o])), (d = e.find(i, [o, o])));
          for (var g = [], y = 0; y < f; y++) {
            for (var D = d(s[0], l[0][y]), v = 1; v < h; v++) D = m(D, d(s[v], l[v][y]));
            g[y] = D;
          }
          return t.createDenseMatrix({
            data: g,
            size: [f],
            datatype: a === t._datatype && p === n._datatype ? o : void 0,
          });
        })(t, n);
      }
      var p = e("_multiplyMatrixVector", {
          "DenseMatrix, any": function (t, n) {
            var o,
              s = t._data,
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
              ((o = a), (f = e.find(r, [o, o])), (m = e.find(i, [o, o])));
            for (var d = [], g = 0; g < p; g++) {
              for (var y = s[g], D = m(y[0], l[0]), v = 1; v < h; v++) D = f(D, m(y[v], l[v]));
              d[g] = D;
            }
            return t.createDenseMatrix({
              data: d,
              size: [p],
              datatype: a === t._datatype && c === n._datatype ? o : void 0,
            });
          },
          "SparseMatrix, any": function (t, n) {
            var s = t._values,
              u = t._index,
              a = t._ptr,
              l = t._datatype || void 0 === t._data ? t._datatype : t.getDataType();
            if (!s) throw new Error("Cannot multiply Pattern only Matrix times Dense Matrix");
            var c,
              p = n._data,
              h = n._datatype || n.getDataType(),
              f = t._size[0],
              m = n._size[0],
              d = [],
              g = [],
              y = [],
              D = r,
              v = i,
              b = o,
              w = 0;
            l &&
              h &&
              l === h &&
              "string" == typeof l &&
              "mixed" !== l &&
              ((c = l),
              (D = e.find(r, [c, c])),
              (v = e.find(i, [c, c])),
              (b = e.find(o, [c, c])),
              (w = e.convert(0, c)));
            var E = [],
              x = [];
            y[0] = 0;
            for (var A = 0; A < m; A++) {
              var F = p[A];
              if (!b(F, w))
                for (var C = a[A], _ = a[A + 1], N = C; N < _; N++) {
                  var S = u[N];
                  x[S]
                    ? (E[S] = D(E[S], v(F, s[N])))
                    : ((x[S] = !0), g.push(S), (E[S] = v(F, s[N])));
                }
            }
            for (var B = g.length, M = 0; M < B; M++) {
              var T = g[M];
              d[M] = E[T];
            }
            return (
              (y[1] = g.length),
              t.createSparseMatrix({
                values: d,
                index: g,
                ptr: y,
                size: [f, 1],
                datatype: l === t._datatype && h === n._datatype ? c : void 0,
              })
            );
          },
        }),
        h = e("_multiplyMatrixMatrix", {
          "DenseMatrix, DenseMatrix": function (t, n) {
            var o,
              s = t._data,
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
              ((o = a), (d = e.find(r, [o, o])), (g = e.find(i, [o, o])));
            for (var y = [], D = 0; D < h; D++) {
              var v = s[D];
              y[D] = [];
              for (var b = 0; b < m; b++) {
                for (var w = g(v[0], l[0][b]), E = 1; E < f; E++) w = d(w, g(v[E], l[E][b]));
                y[D][b] = w;
              }
            }
            return t.createDenseMatrix({
              data: y,
              size: [h, m],
              datatype: a === t._datatype && p === n._datatype ? o : void 0,
            });
          },
          "DenseMatrix, SparseMatrix": function (t, n) {
            var s = t._data,
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
              y = r,
              D = i,
              v = o,
              b = 0;
            a &&
              f &&
              a === f &&
              "string" == typeof a &&
              "mixed" !== a &&
              ((m = a),
              (y = e.find(r, [m, m])),
              (D = e.find(i, [m, m])),
              (v = e.find(o, [m, m])),
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
                    var k = c[T];
                    N !== B ? ((M = D(s[S][k], l[T])), (N = B)) : (M = y(M, D(s[S][k], l[T])));
                  }
                  N !== B || v(M, b) || (E.push(S), w.push(M));
                }
            }
            return ((x[g] = E.length), A);
          },
          "SparseMatrix, DenseMatrix": function (t, n) {
            var s = t._values,
              u = t._index,
              a = t._ptr,
              l = t._datatype || void 0 === t._data ? t._datatype : t.getDataType();
            if (!s) throw new Error("Cannot multiply Pattern only Matrix times Dense Matrix");
            var c,
              p = n._data,
              h = n._datatype || n.getDataType(),
              f = t._size[0],
              m = n._size[0],
              d = n._size[1],
              g = r,
              y = i,
              D = o,
              v = 0;
            l &&
              h &&
              l === h &&
              "string" == typeof l &&
              "mixed" !== l &&
              ((c = l),
              (g = e.find(r, [c, c])),
              (y = e.find(i, [c, c])),
              (D = e.find(o, [c, c])),
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
                if (!D(S, v))
                  for (var B = a[N], M = a[N + 1], T = B; T < M; T++) {
                    var k = u[T];
                    F[k] !== _
                      ? ((F[k] = _), w.push(k), (A[k] = y(S, s[T])))
                      : (A[k] = g(A[k], y(S, s[T])));
                  }
              }
              for (var I = E[C], L = w.length, O = I; O < L; O++) {
                var P = w[O];
                b[O] = A[P];
              }
            }
            return ((E[d] = w.length), x);
          },
          "SparseMatrix, SparseMatrix": function (t, n) {
            var o,
              s = t._values,
              u = t._index,
              a = t._ptr,
              l = t._datatype || void 0 === t._data ? t._datatype : t.getDataType(),
              c = n._values,
              p = n._index,
              h = n._ptr,
              f = n._datatype || void 0 === n._data ? n._datatype : n.getDataType(),
              m = t._size[0],
              d = n._size[1],
              g = s && c,
              y = r,
              D = i;
            l &&
              f &&
              l === f &&
              "string" == typeof l &&
              "mixed" !== l &&
              ((o = l), (y = e.find(r, [o, o])), (D = e.find(i, [o, o])));
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
                  datatype: l === t._datatype && f === n._datatype ? o : void 0,
                }),
                M = g ? [] : void 0,
                T = [],
                k = 0;
              k < d;
              k++
            ) {
              S[k] = N.length;
              var I = k + 1;
              for (x = h[k], A = h[k + 1], E = x; E < A; E++)
                if (((C = p[E]), g))
                  for (b = a[C], w = a[C + 1], v = b; v < w; v++)
                    T[(F = u[v])] !== I
                      ? ((T[F] = I), N.push(F), (M[F] = D(c[E], s[v])))
                      : (M[F] = y(M[F], D(c[E], s[v])));
                else
                  for (b = a[C], w = a[C + 1], v = b; v < w; v++)
                    T[(F = u[v])] !== I && ((T[F] = I), N.push(F));
              if (g)
                for (var L = S[k], O = N.length, P = L; P < O; P++) {
                  var R = N[P];
                  _[P] = M[R];
                }
            }
            return ((S[d] = N.length), B);
          },
        });
      return e(go, i, {
        "Array, Array": e.referTo("Matrix, Matrix", t => (e, r) => {
          l(oi(e), oi(r));
          var i = t(n(e), n(r));
          return Mt(i) ? i.valueOf() : i;
        }),
        "Matrix, Matrix": function (t, e) {
          var n = t.size(),
            r = e.size();
          return (
            l(n, r),
            1 === n.length
              ? 1 === r.length
                ? (function (t, e, n) {
                    if (0 === n) throw new Error("Cannot multiply two empty vectors");
                    return s(t, e);
                  })(t, e, n[0])
                : c(t, e)
              : 1 === r.length
                ? p(t, e)
                : h(t, e)
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
          for (var i = t(e, n), o = 0; o < r.length; o++) i = t(i, r[o]);
          return i;
        }),
      });
    }),
    Do = "conj",
    vo = be(Do, ["typed"], t => {
      var { typed: e } = t;
      return e(Do, {
        "number | BigNumber | Fraction": t => t,
        Complex: t => t.conjugate(),
        Unit: e.referToSelf(t => e => new e.constructor(t(e.toNumeric()), e.formatUnits())),
        "Array | Matrix": e.referToSelf(t => e => Ni(e, t)),
      });
    }),
    bo = "identity",
    wo = be(bo, ["typed", "config", "matrix", "BigNumber", "DenseMatrix", "SparseMatrix"], t => {
      var { typed: e, config: n, matrix: r, BigNumber: i, DenseMatrix: o, SparseMatrix: s } = t;
      return e(bo, {
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
        var r = At(t) || At(e) ? i : null;
        if ((At(t) && (t = t.toNumber()), At(e) && (e = e.toNumber()), !Ee(t) || t < 1))
          throw new Error("Parameters in function identity must be positive integers");
        if (!Ee(e) || e < 1)
          throw new Error("Parameters in function identity must be positive integers");
        var u = r ? new i(1) : 1,
          a = r ? new r(0) : 0,
          l = [t, e];
        if (n) {
          if ("sparse" === n) return s.diagonal(l, u, 0, a);
          if ("dense" === n) return o.diagonal(l, u, 0, a);
          throw new TypeError('Unknown matrix type "'.concat(n, '"'));
        }
        for (var c = li([], l, a), p = t < e ? t : e, h = 0; h < p; h++) c[h][h] = u;
        return c;
      }
    });
  function Eo() {
    throw new Error('No "bignumber" implementation available');
  }
  function xo() {
    throw new Error('No "fraction" implementation available');
  }
  var Ao = "size",
    Fo = be(Ao, ["typed", "config", "?matrix"], t => {
      var { typed: e, config: n, matrix: r } = t;
      return e(Ao, {
        Matrix: function (t) {
          return t.create(t.size(), "number");
        },
        Array: oi,
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
    });
  function Co(t) {
    return (
      (Co =
        "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
          ? function (t) {
              return typeof t;
            }
          : function (t) {
              return t &&
                "function" == typeof Symbol &&
                t.constructor === Symbol &&
                t !== Symbol.prototype
                ? "symbol"
                : typeof t;
            }),
      Co(t)
    );
  }
  function _o(t) {
    var e = (function (t, e) {
      if ("object" != Co(t) || !t) return t;
      var n = t[Symbol.toPrimitive];
      if (void 0 !== n) {
        var r = n.call(t, e);
        if ("object" != Co(r)) return r;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === e ? String : Number)(t);
    })(t, "string");
    return "symbol" == Co(e) ? e : e + "";
  }
  function No(t, e, n) {
    return (
      (e = _o(e)) in t
        ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 })
        : (t[e] = n),
      t
    );
  }
  var So = be("erf", ["typed"], t => {
      var { typed: e } = t;
      return e("name", {
        number: function (t) {
          var e = Math.abs(t);
          return e >= Io
            ? xe(t)
            : e <= Bo
              ? xe(t) *
                (function (t) {
                  var e,
                    n = t * t,
                    r = To[0][4] * n,
                    i = n;
                  for (e = 0; e < 3; e += 1) ((r = (r + To[0][e]) * n), (i = (i + ko[0][e]) * n));
                  return (t * (r + To[0][3])) / (i + ko[0][3]);
                })(e)
              : e <= 4
                ? xe(t) *
                  (1 -
                    (function (t) {
                      var e,
                        n = To[1][8] * t,
                        r = t;
                      for (e = 0; e < 7; e += 1)
                        ((n = (n + To[1][e]) * t), (r = (r + ko[1][e]) * t));
                      var i = (n + To[1][7]) / (r + ko[1][7]),
                        o = parseInt(16 * t) / 16,
                        s = (t - o) * (t + o);
                      return Math.exp(-o * o) * Math.exp(-s) * i;
                    })(e))
                : xe(t) *
                  (1 -
                    (function (t) {
                      var e,
                        n = 1 / (t * t),
                        r = To[2][5] * n,
                        i = n;
                      for (e = 0; e < 4; e += 1)
                        ((r = (r + To[2][e]) * n), (i = (i + ko[2][e]) * n));
                      var o = (n * (r + To[2][4])) / (i + ko[2][4]);
                      ((o = (Mo - o) / t), (n = parseInt(16 * t) / 16));
                      var s = (t - n) * (t + n);
                      return Math.exp(-n * n) * Math.exp(-s) * o;
                    })(e));
        },
        "Array | Matrix": e.referToSelf(t => e => Ni(e, t)),
      });
    }),
    Bo = 0.46875,
    Mo = 0.5641895835477563,
    To = [
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
    ko = [
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
    Io = Math.pow(2, 53);
  be("bin", ["typed", "format"], t => {
    var { typed: e, format: n } = t;
    return e("bin", {
      "number | BigNumber": function (t) {
        return n(t, { notation: "bin" });
      },
      "number | BigNumber, number | BigNumber": function (t, e) {
        return n(t, { notation: "bin", wordSize: e });
      },
    });
  });
  be("oct", ["typed", "format"], t => {
    var { typed: e, format: n } = t;
    return e("oct", {
      "number | BigNumber": function (t) {
        return n(t, { notation: "oct" });
      },
      "number | BigNumber, number | BigNumber": function (t, e) {
        return n(t, { notation: "oct", wordSize: e });
      },
    });
  });
  be("hex", ["typed", "format"], t => {
    var { typed: e, format: n } = t;
    return e("hex", {
      "number | BigNumber": function (t) {
        return n(t, { notation: "hex" });
      },
      "number | BigNumber, number | BigNumber": function (t, e) {
        return n(t, { notation: "hex", wordSize: e });
      },
    });
  });
  var Lo = be("numeric", ["number", "?bignumber", "?fraction"], t => {
      var { number: e, bignumber: n, fraction: r } = t,
        i = { string: !0, number: !0, BigNumber: !0, Fraction: !0 },
        o = {
          number: t => e(t),
          BigNumber: n ? t => n(t) : Eo,
          bigint: t => BigInt(t),
          Fraction: r ? t => r(t) : xo,
        };
      return function (t) {
        var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "number";
        if (void 0 !== (arguments.length > 2 ? arguments[2] : void 0))
          throw new SyntaxError("numeric() takes one or two arguments");
        var n = ce(t);
        if (!(n in i))
          throw new TypeError(
            "Cannot convert " +
              t +
              ' of type "' +
              n +
              '"; valid input types are ' +
              Object.keys(i).join(", "),
          );
        if (!(e in o))
          throw new TypeError(
            "Cannot convert " +
              t +
              ' to type "' +
              e +
              '"; valid output types are ' +
              Object.keys(o).join(", "),
          );
        return e === n ? t : o[e](t);
      };
    }),
    Oo = "divideScalar",
    Po = be(Oo, ["typed", "numeric"], t => {
      var { typed: e, numeric: n } = t;
      return e(Oo, {
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
    Ro = be(
      "pow",
      ["typed", "config", "identity", "multiply", "matrix", "inv", "fraction", "number", "Complex"],
      t => {
        var {
          typed: e,
          config: n,
          identity: r,
          multiply: i,
          matrix: o,
          inv: s,
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
          if (n.predictable && !Ee(e) && t < 0)
            try {
              var r = a(e),
                i = u(r);
              if ((e === i || Math.abs((e - i) / e) < 1e-14) && r.d % 2n == 1n)
                return (r.n % 2n == 0n ? 1 : -1) * Math.pow(-t, e);
            } catch (t) {}
          return n.predictable && ((t < -1 && e === 1 / 0) || (t > -1 && t < 0 && e === -1 / 0))
            ? NaN
            : Ee(e) || t >= 0 || n.predictable
              ? Oi(t, e)
              : (t * t < 1 && e === 1 / 0) || (t * t > 1 && e === -1 / 0)
                ? 0
                : new l(t, 0).pow(e, 0);
        }
        function p(t, e) {
          if (!Ee(e)) throw new TypeError("For A^b, b must be an integer (value is " + e + ")");
          var n = oi(t);
          if (2 !== n.length)
            throw new Error("For A^b, A must be 2 dimensional (A has " + n.length + " dimensions)");
          if (n[0] !== n[1])
            throw new Error("For A^b, A must be square (size is " + n[0] + "x" + n[1] + ")");
          if (e < 0)
            try {
              return p(s(t), -e);
            } catch (t) {
              if ("Cannot calculate inverse, determinant is zero" === t.message)
                throw new TypeError(
                  "For A^b, when A is not invertible, b must be a positive integer (value is " +
                    e +
                    ")",
                );
              throw t;
            }
          for (var o = r(n[0]).valueOf(), u = t; e >= 1; )
            (1 & ~e || (o = i(u, o)), (e >>= 1), (u = i(u, u)));
          return o;
        }
        function h(t, e) {
          return o(p(t.valueOf(), e));
        }
      },
    ),
    $o = "equal";
  be($o, ["typed", "equalScalar"], t => {
    var { typed: e, equalScalar: n } = t;
    return e($o, {
      "any, any": function (t, e) {
        return null === t
          ? null === e
          : null === e
            ? null === t
            : void 0 === t
              ? void 0 === e
              : void 0 === e
                ? void 0 === t
                : n(t, e);
      },
    });
  });
  var zo = "unequal";
  function Uo(t) {
    var e = 0,
      n = 1,
      r = Object.create(null),
      i = Object.create(null),
      o = 0,
      s = function (t) {
        var s = i[t];
        if (s && (delete r[s], delete i[t], --e, n === s)) {
          if (!e) return ((o = 0), void (n = 1));
          for (; !Object.prototype.hasOwnProperty.call(r, ++n); );
        }
      };
    return (
      (t = Math.abs(t)),
      {
        hit: function (u) {
          var a = i[u],
            l = ++o;
          if (((r[l] = u), (i[u] = l), !a)) {
            if (++e <= t) return;
            return ((u = r[n]), s(u), u);
          }
          if ((delete r[a], n === a)) for (; !Object.prototype.hasOwnProperty.call(r, ++n); );
        },
        delete: s,
        clear: function () {
          ((e = o = 0), (n = 1), (r = Object.create(null)), (i = Object.create(null)));
        },
      }
    );
  }
  function Go(t) {
    var { hasher: e, limit: n } =
      arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    return (
      (n = null == n ? Number.POSITIVE_INFINITY : n),
      (e = null == e ? JSON.stringify : e),
      function r() {
        "object" != typeof r.cache &&
          (r.cache = { values: new Map(), lru: Uo(n || Number.POSITIVE_INFINITY) });
        for (var i = [], o = 0; o < arguments.length; o++) i[o] = arguments[o];
        var s = e(i);
        if (r.cache.values.has(s)) return (r.cache.lru.hit(s), r.cache.values.get(s));
        var u = t.apply(t, i);
        return (r.cache.values.set(s, u), r.cache.values.delete(r.cache.lru.hit(s)), u);
      }
    );
  }
  (be(zo, ["typed", "equalScalar"], t => {
    var { typed: e, equalScalar: n } = t;
    return e(zo, {
      "any, any": function (t, e) {
        return null === t
          ? null !== e
          : null === e
            ? null !== t
            : void 0 === t
              ? void 0 !== e
              : void 0 === e
                ? void 0 !== t
                : !n(t, e);
      },
    });
  }),
    Go(
      function (t) {
        return new t(1).exp();
      },
      { hasher: qo },
    ),
    Go(
      function (t) {
        return new t(1).plus(new t(5).sqrt()).div(2);
      },
      { hasher: qo },
    ));
  var jo = Go(
    function (t) {
      return t.acos(-1);
    },
    { hasher: qo },
  );
  function qo(t) {
    return t[0].precision;
  }
  Go(
    function (t) {
      return jo(t).times(2);
    },
    { hasher: qo },
  );
  var Vo = be("dot", ["typed", "addScalar", "multiplyScalar", "conj", "size"], t => {
    var { typed: e, addScalar: n, multiplyScalar: r, conj: i, size: o } = t;
    return e("dot", {
      "Array | DenseMatrix, Array | DenseMatrix": function (t, o) {
        var a = s(t, o),
          l = Mt(t) ? t._data : t,
          c = Mt(t) ? t._datatype || t.getDataType() : void 0,
          p = Mt(o) ? o._data : o,
          h = Mt(o) ? o._datatype || o.getDataType() : void 0,
          f = 2 === u(t).length,
          m = 2 === u(o).length,
          d = n,
          g = r;
        if (c && h && c === h && "string" == typeof c && "mixed" !== c) {
          var y = c;
          ((d = e.find(n, [y, y])), (g = e.find(r, [y, y])));
        }
        if (!f && !m) {
          for (var D = g(i(l[0]), p[0]), v = 1; v < a; v++) D = d(D, g(i(l[v]), p[v]));
          return D;
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
          for (var A = g(i(l[0][0]), p[0][0]), F = 1; F < a; F++) A = d(A, g(i(l[F][0]), p[F][0]));
          return A;
        }
      },
      "SparseMatrix, SparseMatrix": function (t, e) {
        s(t, e);
        var i = t._index,
          o = t._values,
          u = e._index,
          a = e._values,
          l = 0,
          c = n,
          p = r,
          h = 0,
          f = 0;
        for (; h < i.length && f < u.length; ) {
          var m = i[h],
            d = u[f];
          m < d ? h++ : m > d ? f++ : m === d && ((l = c(l, p(o[h], a[f]))), h++, f++);
        }
        return l;
      },
    });
    function s(t, e) {
      var n,
        r,
        i = u(t),
        o = u(e);
      if (1 === i.length) n = i[0];
      else {
        if (2 !== i.length || 1 !== i[1])
          throw new RangeError(
            "Expected a column vector, instead got a matrix of size (" + i.join(", ") + ")",
          );
        n = i[0];
      }
      if (1 === o.length) r = o[0];
      else {
        if (2 !== o.length || 1 !== o[1])
          throw new RangeError(
            "Expected a column vector, instead got a matrix of size (" + o.join(", ") + ")",
          );
        r = o[0];
      }
      if (n !== r) throw new RangeError("Vectors must have equal length (" + n + " != " + r + ")");
      if (0 === n) throw new RangeError("Cannot calculate the dot product of empty vectors");
      return n;
    }
    function u(t) {
      return Mt(t) ? t.size() : o(t);
    }
  });
  var Wo,
    Qo = be(
      "det",
      ["typed", "matrix", "subtractScalar", "multiply", "divideScalar", "isZero", "unaryMinus"],
      t => {
        var {
          typed: e,
          matrix: n,
          subtractScalar: r,
          multiply: i,
          divideScalar: o,
          isZero: s,
          unaryMinus: u,
        } = t;
        return e("det", {
          any: function (t) {
            return pe(t);
          },
          "Array | Matrix": function (t) {
            var e;
            switch ((e = Mt(t) ? t.size() : Array.isArray(t) ? (t = n(t)).size() : []).length) {
              case 0:
                return pe(t);
              case 1:
                if (1 === e[0]) return pe(t.valueOf()[0]);
                if (0 === e[0]) return 1;
                throw new RangeError("Matrix must be square (size: " + Kr(e) + ")");
              case 2:
                var a = e[0],
                  l = e[1];
                if (a === l)
                  return (function (t, e) {
                    if (1 === e) return pe(t[0][0]);
                    if (2 === e) return r(i(t[0][0], t[1][1]), i(t[1][0], t[0][1]));
                    for (var n = !1, a = new Array(e).fill(0).map((t, e) => e), l = 0; l < e; l++) {
                      var c = a[l];
                      if (s(t[c][l])) {
                        var p = void 0;
                        for (p = l + 1; p < e; p++)
                          if (!s(t[a[p]][l])) {
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
                          t[d][g] = o(r(i(t[d][g], h), i(t[d][l], t[c][g])), f);
                    }
                    var y = t[a[e - 1]][e - 1];
                    return n ? u(y) : y;
                  })(t.clone().valueOf(), a);
                if (0 === l) return 1;
                throw new RangeError("Matrix must be square (size: " + Kr(e) + ")");
              default:
                throw new RangeError("Matrix must be two dimensional (size: " + Kr(e) + ")");
            }
          },
        });
      },
    ),
    Ho = be(
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
          multiply: o,
          unaryMinus: s,
          det: u,
          identity: a,
          abs: l,
        } = t;
        return e("inv", {
          "Array | Matrix": function (t) {
            var e = Mt(t) ? t.size() : oi(t);
            switch (e.length) {
              case 1:
                if (1 === e[0]) return Mt(t) ? n([r(1, t.valueOf()[0])]) : [r(1, t[0])];
                throw new RangeError("Matrix must be square (size: " + Kr(e) + ")");
              case 2:
                var i = e[0],
                  o = e[1];
                if (i === o) return Mt(t) ? n(c(t.valueOf(), i, o), t.storage()) : c(t, i, o);
                throw new RangeError("Matrix must be square (size: " + Kr(e) + ")");
              default:
                throw new RangeError("Matrix must be two dimensional (size: " + Kr(e) + ")");
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
              [r(t[1][1], d), r(s(t[0][1]), d)],
              [r(s(t[1][0]), d), r(t[0][0], d)],
            ];
          }
          var g = t.concat();
          for (c = 0; c < e; c++) g[c] = g[c].concat();
          for (var y = a(e).valueOf(), D = 0; D < n; D++) {
            var v = l(g[D][D]),
              b = D;
            for (c = D + 1; c < e; ) (l(g[c][D]) > v && ((v = l(g[c][D])), (b = c)), c++);
            if (0 === v) throw Error("Cannot calculate inverse, determinant is zero");
            (c = b) !== D &&
              ((m = g[D]), (g[D] = g[c]), (g[c] = m), (m = y[D]), (y[D] = y[c]), (y[c] = m));
            var w = g[D],
              E = y[D];
            for (c = 0; c < e; c++) {
              var x = g[c],
                A = y[c];
              if (c !== D) {
                if (0 !== x[D]) {
                  for (h = r(s(x[D]), w[D]), p = D; p < n; p++) x[p] = i(x[p], o(h, w[p]));
                  for (p = 0; p < n; p++) A[p] = i(A[p], o(h, E[p]));
                }
              } else {
                for (h = w[D], p = D; p < n; p++) x[p] = r(x[p], h);
                for (p = 0; p < n; p++) A[p] = r(A[p], h);
              }
            }
          }
          return y;
        }
      },
    ),
    Zo = "gamma",
    Jo = be(Zo, ["typed", "config", "multiplyScalar", "pow", "BigNumber", "Complex"], t => {
      var { typed: e, config: n, multiplyScalar: r, pow: i, BigNumber: o, Complex: s } = t;
      return e(Zo, {
        number: Ri,
        Complex: function t(e) {
          if (0 === e.im) return Ri(e.re);
          if (e.re < 0.5) {
            var n = new s(1 - e.re, -e.im),
              r = new s(Math.PI * e.re, Math.PI * e.im);
            return new s(Math.PI).div(r.sin()).div(t(n));
          }
          e = new s(e.re - 1, e.im);
          for (var i = new s(zi[0], 0), o = 1; o < zi.length; ++o) {
            var u = new s(zi[o], 0);
            i = i.add(u.div(e.add(o)));
          }
          var a = new s(e.re + $i + 0.5, e.im),
            l = Math.sqrt(2 * Math.PI),
            c = a.pow(e.add(0.5)),
            p = a.neg().exp();
          return i.mul(l).mul(c).mul(p);
        },
        BigNumber: function (t) {
          if (t.isInteger()) return t.isNegative() || t.isZero() ? new o(1 / 0) : u(t.minus(1));
          if (!t.isFinite()) return new o(t.isNegative() ? NaN : 1 / 0);
          throw new Error("Integer BigNumber expected");
        },
      });
      function u(t) {
        if (t < 8) return new o([1, 1, 2, 6, 24, 120, 720, 5040][t]);
        var e = n.precision + (0 | Math.log(t.toNumber())),
          r = o.clone({ precision: e });
        if (t % 2 == 1) return t.times(u(new o(t - 1)));
        for (var i = t, s = new r(t), a = t.toNumber(); i > 2; ) ((a += i -= 2), (s = s.times(a)));
        return new o(s.toPrecision(o.precision));
      }
    }),
    Yo = "lgamma",
    Xo = be(Yo, ["Complex", "typed"], t => {
      var { Complex: e, typed: n } = t,
        r = [
          -0.029550653594771242, 0.00641025641025641, -0.0019175269175269176, 0.0008417508417508417,
          -0.0005952380952380953, 0.0007936507936507937, -0.002777777777777778, 0.08333333333333333,
        ];
      return n(Yo, {
        number: ji,
        Complex: function t(n) {
          if (n.isNaN()) return new e(NaN, NaN);
          if (0 === n.im) return new e(ji(n.re), 0);
          if (n.re >= 7 || Math.abs(n.im) >= 7) return i(n);
          if (n.re <= 0.1) {
            var r =
                ((a = 6.283185307179586),
                (!0 ^ ((l = n.im) > 0 || (!(l < 0) && 1 / l == 1 / 0)) ? -a : a) *
                  Math.floor(0.5 * n.re + 0.25)),
              s = n.mul(Math.PI).sin().log(),
              u = t(new e(1 - n.re, -n.im));
            return new e(1.1447298858494002, r).sub(s).sub(u);
          }
          return n.im >= 0 ? o(n) : o(n.conjugate()).conjugate();
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
          var n = t.sub(0.5).mul(t.log()).sub(t).add(Ui),
            i = new e(1, 0).div(t),
            o = i.div(t),
            s = r[0],
            u = r[1],
            a = 2 * o.re,
            l = o.re * o.re + o.im * o.im,
            c = 2;
          c < 8;
          c++
        ) {
          var p = u;
          ((u = -l * s + r[c]), (s = a * s + p));
        }
        var h = i.mul(o.mul(s).add(u));
        return n.add(h);
      }
      function o(t) {
        var n = 0,
          r = 0,
          o = t;
        for (t = t.add(1); t.re <= 7; ) {
          var s = (o = o.mul(t)).im < 0 ? 1 : 0;
          (0 !== s && 0 === r && n++, (r = s), (t = t.add(1)));
        }
        return i(t)
          .sub(o.log())
          .sub(new e(0, 2 * n * Math.PI * 1));
      }
    }),
    Ko = { exports: {} };
  function ts() {
    return (
      Wo ||
        ((Wo = 1),
        (function (t) {
          !(function (t, e) {
            function n(t) {
              var e = this,
                n = (function () {
                  var t = 4022871197,
                    e = function (e) {
                      e = String(e);
                      for (var n = 0; n < e.length; n++) {
                        var r = 0.02519603282416938 * (t += e.charCodeAt(n));
                        ((r -= t = r >>> 0), (t = (r *= t) >>> 0), (t += 4294967296 * (r -= t)));
                      }
                      return 2.3283064365386963e-10 * (t >>> 0);
                    };
                  return e;
                })();
              ((e.next = function () {
                var t = 2091639 * e.s0 + 2.3283064365386963e-10 * e.c;
                return ((e.s0 = e.s1), (e.s1 = e.s2), (e.s2 = t - (e.c = 0 | t)));
              }),
                (e.c = 1),
                (e.s0 = n(" ")),
                (e.s1 = n(" ")),
                (e.s2 = n(" ")),
                (e.s0 -= n(t)),
                e.s0 < 0 && (e.s0 += 1),
                (e.s1 -= n(t)),
                e.s1 < 0 && (e.s1 += 1),
                (e.s2 -= n(t)),
                e.s2 < 0 && (e.s2 += 1),
                (n = null));
            }
            function r(t, e) {
              return ((e.c = t.c), (e.s0 = t.s0), (e.s1 = t.s1), (e.s2 = t.s2), e);
            }
            function i(t, e) {
              var i = new n(t),
                o = e && e.state,
                s = i.next;
              return (
                (s.int32 = function () {
                  return (4294967296 * i.next()) | 0;
                }),
                (s.double = function () {
                  return s() + 11102230246251565e-32 * ((2097152 * s()) | 0);
                }),
                (s.quick = s),
                o &&
                  ("object" == typeof o && r(o, i),
                  (s.state = function () {
                    return r(i, {});
                  })),
                s
              );
            }
            e && e.exports ? (e.exports = i) : (this.alea = i);
          })(0, t);
        })(Ko)),
      Ko.exports
    );
  }
  var es,
    ns = { exports: {} };
  function rs() {
    return (
      es ||
        ((es = 1),
        (function (t) {
          !(function (t, e) {
            function n(t) {
              var e = this,
                n = "";
              ((e.x = 0),
                (e.y = 0),
                (e.z = 0),
                (e.w = 0),
                (e.next = function () {
                  var t = e.x ^ (e.x << 11);
                  return (
                    (e.x = e.y),
                    (e.y = e.z),
                    (e.z = e.w),
                    (e.w ^= (e.w >>> 19) ^ t ^ (t >>> 8))
                  );
                }),
                t === (0 | t) ? (e.x = t) : (n += t));
              for (var r = 0; r < n.length + 64; r++) ((e.x ^= 0 | n.charCodeAt(r)), e.next());
            }
            function r(t, e) {
              return ((e.x = t.x), (e.y = t.y), (e.z = t.z), (e.w = t.w), e);
            }
            function i(t, e) {
              var i = new n(t),
                o = e && e.state,
                s = function () {
                  return (i.next() >>> 0) / 4294967296;
                };
              return (
                (s.double = function () {
                  do {
                    var t = ((i.next() >>> 11) + (i.next() >>> 0) / 4294967296) / (1 << 21);
                  } while (0 === t);
                  return t;
                }),
                (s.int32 = i.next),
                (s.quick = s),
                o &&
                  ("object" == typeof o && r(o, i),
                  (s.state = function () {
                    return r(i, {});
                  })),
                s
              );
            }
            e && e.exports ? (e.exports = i) : (this.xor128 = i);
          })(0, t);
        })(ns)),
      ns.exports
    );
  }
  var is,
    os = { exports: {} };
  function ss() {
    return (
      is ||
        ((is = 1),
        (function (t) {
          !(function (t, e) {
            function n(t) {
              var e = this,
                n = "";
              ((e.next = function () {
                var t = e.x ^ (e.x >>> 2);
                return (
                  (e.x = e.y),
                  (e.y = e.z),
                  (e.z = e.w),
                  (e.w = e.v),
                  ((e.d = (e.d + 362437) | 0) + (e.v = e.v ^ (e.v << 4) ^ t ^ (t << 1))) | 0
                );
              }),
                (e.x = 0),
                (e.y = 0),
                (e.z = 0),
                (e.w = 0),
                (e.v = 0),
                t === (0 | t) ? (e.x = t) : (n += t));
              for (var r = 0; r < n.length + 64; r++)
                ((e.x ^= 0 | n.charCodeAt(r)),
                  r == n.length && (e.d = (e.x << 10) ^ (e.x >>> 4)),
                  e.next());
            }
            function r(t, e) {
              return (
                (e.x = t.x),
                (e.y = t.y),
                (e.z = t.z),
                (e.w = t.w),
                (e.v = t.v),
                (e.d = t.d),
                e
              );
            }
            function i(t, e) {
              var i = new n(t),
                o = e && e.state,
                s = function () {
                  return (i.next() >>> 0) / 4294967296;
                };
              return (
                (s.double = function () {
                  do {
                    var t = ((i.next() >>> 11) + (i.next() >>> 0) / 4294967296) / (1 << 21);
                  } while (0 === t);
                  return t;
                }),
                (s.int32 = i.next),
                (s.quick = s),
                o &&
                  ("object" == typeof o && r(o, i),
                  (s.state = function () {
                    return r(i, {});
                  })),
                s
              );
            }
            e && e.exports ? (e.exports = i) : (this.xorwow = i);
          })(0, t);
        })(os)),
      os.exports
    );
  }
  var us,
    as = { exports: {} };
  function ls() {
    return (
      us ||
        ((us = 1),
        (function (t) {
          !(function (t, e) {
            function n(t) {
              var e = this;
              ((e.next = function () {
                var t,
                  n,
                  r = e.x,
                  i = e.i;
                return (
                  (t = r[i]),
                  (n = (t ^= t >>> 7) ^ (t << 24)),
                  (n ^= (t = r[(i + 1) & 7]) ^ (t >>> 10)),
                  (n ^= (t = r[(i + 3) & 7]) ^ (t >>> 3)),
                  (n ^= (t = r[(i + 4) & 7]) ^ (t << 7)),
                  (t = r[(i + 7) & 7]),
                  (n ^= (t ^= t << 13) ^ (t << 9)),
                  (r[i] = n),
                  (e.i = (i + 1) & 7),
                  n
                );
              }),
                (function (t, e) {
                  var n,
                    r = [];
                  if (e === (0 | e)) r[0] = e;
                  else
                    for (e = "" + e, n = 0; n < e.length; ++n)
                      r[7 & n] = (r[7 & n] << 15) ^ ((e.charCodeAt(n) + r[(n + 1) & 7]) << 13);
                  for (; r.length < 8; ) r.push(0);
                  for (n = 0; n < 8 && 0 === r[n]; ++n);
                  for (8 == n ? (r[7] = -1) : r[n], t.x = r, t.i = 0, n = 256; n > 0; --n) t.next();
                })(e, t));
            }
            function r(t, e) {
              return ((e.x = t.x.slice()), (e.i = t.i), e);
            }
            function i(t, e) {
              null == t && (t = +new Date());
              var i = new n(t),
                o = e && e.state,
                s = function () {
                  return (i.next() >>> 0) / 4294967296;
                };
              return (
                (s.double = function () {
                  do {
                    var t = ((i.next() >>> 11) + (i.next() >>> 0) / 4294967296) / (1 << 21);
                  } while (0 === t);
                  return t;
                }),
                (s.int32 = i.next),
                (s.quick = s),
                o &&
                  (o.x && r(o, i),
                  (s.state = function () {
                    return r(i, {});
                  })),
                s
              );
            }
            e && e.exports ? (e.exports = i) : (this.xorshift7 = i);
          })(0, t);
        })(as)),
      as.exports
    );
  }
  var cs,
    ps = { exports: {} };
  function hs() {
    return (
      cs ||
        ((cs = 1),
        (function (t) {
          !(function (t, e) {
            function n(t) {
              var e = this;
              ((e.next = function () {
                var t,
                  n,
                  r = e.w,
                  i = e.X,
                  o = e.i;
                return (
                  (e.w = r = (r + 1640531527) | 0),
                  (n = i[(o + 34) & 127]),
                  (t = i[(o = (o + 1) & 127)]),
                  (n ^= n << 13),
                  (t ^= t << 17),
                  (n ^= n >>> 15),
                  (t ^= t >>> 12),
                  (n = i[o] = n ^ t),
                  (e.i = o),
                  (n + (r ^ (r >>> 16))) | 0
                );
              }),
                (function (t, e) {
                  var n,
                    r,
                    i,
                    o,
                    s,
                    u = [],
                    a = 128;
                  for (
                    e === (0 | e)
                      ? ((r = e), (e = null))
                      : ((e += "\0"), (r = 0), (a = Math.max(a, e.length))),
                      i = 0,
                      o = -32;
                    o < a;
                    ++o
                  )
                    (e && (r ^= e.charCodeAt((o + 32) % e.length)),
                      0 === o && (s = r),
                      (r ^= r << 10),
                      (r ^= r >>> 15),
                      (r ^= r << 4),
                      (r ^= r >>> 13),
                      o >= 0 &&
                        ((s = (s + 1640531527) | 0),
                        (i = 0 == (n = u[127 & o] ^= r + s) ? i + 1 : 0)));
                  for (
                    i >= 128 && (u[127 & ((e && e.length) || 0)] = -1), i = 127, o = 512;
                    o > 0;
                    --o
                  )
                    ((r = u[(i + 34) & 127]),
                      (n = u[(i = (i + 1) & 127)]),
                      (r ^= r << 13),
                      (n ^= n << 17),
                      (r ^= r >>> 15),
                      (n ^= n >>> 12),
                      (u[i] = r ^ n));
                  ((t.w = s), (t.X = u), (t.i = i));
                })(e, t));
            }
            function r(t, e) {
              return ((e.i = t.i), (e.w = t.w), (e.X = t.X.slice()), e);
            }
            function i(t, e) {
              null == t && (t = +new Date());
              var i = new n(t),
                o = e && e.state,
                s = function () {
                  return (i.next() >>> 0) / 4294967296;
                };
              return (
                (s.double = function () {
                  do {
                    var t = ((i.next() >>> 11) + (i.next() >>> 0) / 4294967296) / (1 << 21);
                  } while (0 === t);
                  return t;
                }),
                (s.int32 = i.next),
                (s.quick = s),
                o &&
                  (o.X && r(o, i),
                  (s.state = function () {
                    return r(i, {});
                  })),
                s
              );
            }
            e && e.exports ? (e.exports = i) : (this.xor4096 = i);
          })(0, t);
        })(ps)),
      ps.exports
    );
  }
  var fs,
    ms = { exports: {} };
  function ds() {
    return (
      fs ||
        ((fs = 1),
        (function (t) {
          !(function (t, e) {
            function n(t) {
              var e = this,
                n = "";
              ((e.next = function () {
                var t = e.b,
                  n = e.c,
                  r = e.d,
                  i = e.a;
                return (
                  (t = (t << 25) ^ (t >>> 7) ^ n),
                  (n = (n - r) | 0),
                  (r = (r << 24) ^ (r >>> 8) ^ i),
                  (i = (i - t) | 0),
                  (e.b = t = (t << 20) ^ (t >>> 12) ^ n),
                  (e.c = n = (n - r) | 0),
                  (e.d = (r << 16) ^ (n >>> 16) ^ i),
                  (e.a = (i - t) | 0)
                );
              }),
                (e.a = 0),
                (e.b = 0),
                (e.c = -1640531527),
                (e.d = 1367130551),
                t === Math.floor(t) ? ((e.a = (t / 4294967296) | 0), (e.b = 0 | t)) : (n += t));
              for (var r = 0; r < n.length + 20; r++) ((e.b ^= 0 | n.charCodeAt(r)), e.next());
            }
            function r(t, e) {
              return ((e.a = t.a), (e.b = t.b), (e.c = t.c), (e.d = t.d), e);
            }
            function i(t, e) {
              var i = new n(t),
                o = e && e.state,
                s = function () {
                  return (i.next() >>> 0) / 4294967296;
                };
              return (
                (s.double = function () {
                  do {
                    var t = ((i.next() >>> 11) + (i.next() >>> 0) / 4294967296) / (1 << 21);
                  } while (0 === t);
                  return t;
                }),
                (s.int32 = i.next),
                (s.quick = s),
                o &&
                  ("object" == typeof o && r(o, i),
                  (s.state = function () {
                    return r(i, {});
                  })),
                s
              );
            }
            e && e.exports ? (e.exports = i) : (this.tychei = i);
          })(0, t);
        })(ms)),
      ms.exports
    );
  }
  var gs,
    ys,
    Ds,
    vs = { exports: {} },
    bs = vs.exports;
  function ws() {
    return (
      gs ||
        ((gs = 1),
        (function (t) {
          !(function (e, n, r) {
            var i,
              o = 256,
              s = "random",
              u = r.pow(o, 6),
              a = r.pow(2, 52),
              l = 2 * a,
              c = 255;
            function p(t, c, p) {
              var y = [],
                D = d(
                  m(
                    (c = 1 == c ? { entropy: !0 } : c || {}).entropy
                      ? [t, g(n)]
                      : null == t
                        ? (function () {
                            try {
                              var t;
                              return (
                                i && (t = i.randomBytes)
                                  ? (t = t(o))
                                  : ((t = new Uint8Array(o)),
                                    (e.crypto || e.msCrypto).getRandomValues(t)),
                                g(t)
                              );
                            } catch (t) {
                              var r = e.navigator,
                                s = r && r.plugins;
                              return [+new Date(), e, s, e.screen, g(n)];
                            }
                          })()
                        : t,
                    3,
                  ),
                  y,
                ),
                v = new h(y),
                b = function () {
                  for (var t = v.g(6), e = u, n = 0; t < a; )
                    ((t = (t + n) * o), (e *= o), (n = v.g(1)));
                  for (; t >= l; ) ((t /= 2), (e /= 2), (n >>>= 1));
                  return (t + n) / e;
                };
              return (
                (b.int32 = function () {
                  return 0 | v.g(4);
                }),
                (b.quick = function () {
                  return v.g(4) / 4294967296;
                }),
                (b.double = b),
                d(g(v.S), n),
                (
                  c.pass ||
                  p ||
                  function (t, e, n, i) {
                    return (
                      i &&
                        (i.S && f(i, v),
                        (t.state = function () {
                          return f(v, {});
                        })),
                      n ? ((r[s] = t), e) : t
                    );
                  }
                )(b, D, "global" in c ? c.global : this == r, c.state)
              );
            }
            function h(t) {
              var e,
                n = t.length,
                r = this,
                i = 0,
                s = (r.i = r.j = 0),
                u = (r.S = []);
              for (n || (t = [n++]); i < o; ) u[i] = i++;
              for (i = 0; i < o; i++)
                ((u[i] = u[(s = c & (s + t[i % n] + (e = u[i])))]), (u[s] = e));
              (r.g = function (t) {
                for (var e, n = 0, i = r.i, s = r.j, u = r.S; t--; )
                  ((e = u[(i = c & (i + 1))]),
                    (n = n * o + u[c & ((u[i] = u[(s = c & (s + e))]) + (u[s] = e))]));
                return ((r.i = i), (r.j = s), n);
              })(o);
            }
            function f(t, e) {
              return ((e.i = t.i), (e.j = t.j), (e.S = t.S.slice()), e);
            }
            function m(t, e) {
              var n,
                r = [],
                i = typeof t;
              if (e && "object" == i)
                for (n in t)
                  try {
                    r.push(m(t[n], e - 1));
                  } catch (t) {}
              return r.length ? r : "string" == i ? t : t + "\0";
            }
            function d(t, e) {
              for (var n, r = t + "", i = 0; i < r.length; )
                e[c & i] = c & ((n ^= 19 * e[c & i]) + r.charCodeAt(i++));
              return g(e);
            }
            function g(t) {
              return String.fromCharCode.apply(0, t);
            }
            if ((d(r.random(), n), t.exports)) {
              t.exports = p;
              try {
                i = require("crypto");
              } catch (t) {}
            } else r["seed" + s] = p;
          })("undefined" != typeof self ? self : bs, [], Math);
        })(vs)),
      vs.exports
    );
  }
  function Es(t, e) {
    return be(t, ["config", "BigNumber"], t => {
      var { config: n, BigNumber: r } = t;
      return "BigNumber" === n.number ? new r(e) : e;
    });
  }
  function xs(t, e) {
    var n = Object.keys(t);
    if (Object.getOwnPropertySymbols) {
      var r = Object.getOwnPropertySymbols(t);
      (e &&
        (r = r.filter(function (e) {
          return Object.getOwnPropertyDescriptor(t, e).enumerable;
        })),
        n.push.apply(n, r));
    }
    return n;
  }
  (!(function () {
    if (Ds) return ys;
    Ds = 1;
    var t = ts(),
      e = rs(),
      n = ss(),
      r = ls(),
      i = hs(),
      o = ds(),
      s = ws();
    ((s.alea = t),
      (s.xor128 = e),
      (s.xorwow = n),
      (s.xorshift7 = r),
      (s.xor4096 = i),
      (s.tychei = o),
      (ys = s));
  })(),
    Es("fineStructure", 0.0072973525693),
    Es("weakMixingAngle", 0.2229),
    Es("efimovFactor", 22.7),
    Es("sackurTetrode", -1.16487052358));
  !(function (t) {
    for (var e = 1; e < arguments.length; e++) {
      var n = null != arguments[e] ? arguments[e] : {};
      e % 2
        ? xs(Object(n), !0).forEach(function (e) {
            No(t, e, n[e]);
          })
        : Object.getOwnPropertyDescriptors
          ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n))
          : xs(Object(n)).forEach(function (e) {
              Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(n, e));
            });
    }
  })({ isTransformFunction: !0 }, oo.meta);
  var As = xr({ config: me }),
    Fs = _r({}),
    Cs = Qr({}),
    _s = Hr({}),
    Ns = _i({ Matrix: _s }),
    Ss = Le({ BigNumber: As, Complex: Fs, DenseMatrix: Ns, Fraction: Cs }),
    Bs = ro({ typed: Ss }),
    Ms = ao({ typed: Ss }),
    Ts = vo({ typed: Ss }),
    ks = Hi({ config: me, typed: Ss }),
    Is = So({ typed: Ss }),
    Ls = Vi({ equalScalar: ks, typed: Ss }),
    Os = Xo({ Complex: Fs, typed: Ss }),
    Ps = mo({ typed: Ss }),
    Rs = Ji({ typed: Ss }),
    $s = Zi({ Matrix: _s, equalScalar: ks, typed: Ss }),
    zs = co({ typed: Ss }),
    Us = Yi({ BigNumber: As, typed: Ss }),
    Gs = to({ DenseMatrix: Ns, Matrix: _s, SparseMatrix: $s, typed: Ss }),
    js = Xi({ Fraction: Cs, typed: Ss }),
    qs = wo({
      BigNumber: As,
      DenseMatrix: Ns,
      SparseMatrix: $s,
      config: me,
      matrix: Gs,
      typed: Ss,
    }),
    Vs = Lo({ bignumber: Us, fraction: js, number: Rs }),
    Ws = Fo({ matrix: Gs, config: me, typed: Ss }),
    Qs = no({ typed: Ss }),
    Hs = Po({ numeric: Vs, typed: Ss }),
    Zs = yo({
      addScalar: Ms,
      dot: Vo({ addScalar: Ms, conj: Ts, multiplyScalar: Ps, size: Ws, typed: Ss }),
      equalScalar: ks,
      matrix: Gs,
      multiplyScalar: Ps,
      typed: Ss,
    }),
    Js = Jo({
      BigNumber: As,
      Complex: Fs,
      config: me,
      multiplyScalar: Ps,
      pow: Ro({
        Complex: Fs,
        config: me,
        fraction: js,
        identity: qs,
        inv: Ho({
          abs: Bs,
          addScalar: Ms,
          det: Qo({
            divideScalar: Hs,
            isZero: Ls,
            matrix: Gs,
            multiply: Zs,
            subtractScalar: zs,
            typed: Ss,
            unaryMinus: Qs,
          }),
          divideScalar: Hs,
          identity: qs,
          matrix: Gs,
          multiply: Zs,
          typed: Ss,
          unaryMinus: Qs,
        }),
        matrix: Gs,
        multiply: Zs,
        number: Rs,
        typed: Ss,
      }),
      typed: Ss,
    });
  const Ys = t => ((t.isEnvDependent = !0), t),
    Xs = t => ((t.isEnvDependent = !1), t),
    Ks = new Map([
      [
        "FileInput",
        t => {
          const e = t;
          return ((t.isEnvDependent = e.statements.some(t => tu(t))), t);
        },
      ],
      ["FunctionDef", Ys],
      ["Lambda", Xs],
      ["Assign", Ys],
      [
        "Return",
        t => {
          const e = t;
          return ((t.isEnvDependent = !!e.value && tu(e.value)), t);
        },
      ],
      [
        "SimpleExpr",
        t => {
          const e = t;
          return ((t.isEnvDependent = tu(e.expression)), t);
        },
      ],
      [
        "If",
        t => {
          const e = t,
            n = !!e.elseBlock && e.elseBlock.some(tu);
          return ((t.isEnvDependent = tu(e.condition) || e.body.some(t => tu(t)) || n), t);
        },
      ],
      ["FromImport", Ys],
      ["Global", Xs],
      ["Pass", Xs],
      ["Break", Xs],
      ["Continue", Xs],
      ["Variable", Xs],
      [
        "Call",
        t => {
          const e = t;
          return ((t.isEnvDependent = tu(e.callee) || e.args.some(t => tu(t))), t);
        },
      ],
      [
        "Starred",
        t => {
          const e = t;
          return ((t.isEnvDependent = tu(e.value)), t);
        },
      ],
      ["Literal", Xs],
      ["BigIntLiteral", Xs],
      ["None", Xs],
      ["Complex", Xs],
      [
        "Call",
        t => {
          const e = t;
          return ((t.isEnvDependent = tu(e.expression)), t);
        },
      ],
      [
        "Binary",
        t => {
          const e = t;
          return ((t.isEnvDependent = tu(e.left) || tu(e.right)), t);
        },
      ],
      [
        "Unary",
        t => {
          const e = t;
          return ((t.isEnvDependent = tu(e.right)), t);
        },
      ],
      [
        "Compare",
        t => {
          const e = t;
          return ((t.isEnvDependent = tu(e.left) || tu(e.right)), t);
        },
      ],
      [
        "Ternary",
        t => {
          const e = t;
          return ((t.isEnvDependent = tu(e.predicate) || tu(e.consequent) || tu(e.alternative)), t);
        },
      ],
      [
        "List",
        t => {
          const e = t;
          return ((t.isEnvDependent = e.elements.some(t => tu(t))), t);
        },
      ],
      [
        "Subscript",
        t => {
          const e = t;
          return ((t.isEnvDependent = tu(e.value) || tu(e.index)), t);
        },
      ],
      [
        "StatementSequence",
        t => {
          const e = t;
          return ((t.isEnvDependent = e.body.some(t => tu(t))), t);
        },
      ],
      [S.RESET, Xs],
      [S.END_OF_FUNCTION_BODY, Xs],
      [S.UNARY_OP, Xs],
      [S.BINARY_OP, Xs],
      [S.BOOL_OP, Xs],
      [S.POP, Xs],
      [S.CONTINUE_MARKER, Xs],
      [S.ASSIGNMENT, Xs],
      [S.ENVIRONMENT, Xs],
      [S.APPLICATION, Xs],
      [
        S.BRANCH,
        t => {
          const e = t;
          return ((t.isEnvDependent = tu(e.consequent) || tu(e.alternate)), t);
        },
      ],
      [
        "InstrType.FOR",
        t => {
          const e = t;
          return ((t.isEnvDependent = tu({ kind: "StatementSequence", body: e.body })), t);
        },
      ],
      [
        "InstrType.WHILE",
        t => {
          const e = t;
          return ((t.isEnvDependent = tu(e.body) || tu(e.test)), t);
        },
      ],
    ]);
  function tu(t) {
    if (null == t) return !1;
    if (void 0 !== t.isEnvDependent) return t.isEnvDependent;
    let e;
    if (eu(t)) eu(t) && (e = Ks.get(t.instrType));
    else {
      const n = t.kind;
      e = Ks.get(n);
    }
    return !!e && (e(t)?.isEnvDependent ?? !1);
  }
  const eu = t => "instrType" in t;
  function nu(t) {
    return "number" === t.type || "bigint" === t.type;
  }
  const ru = (t, e = 2, n = 80) => {
    if ("string" == typeof e)
      throw new Error("stringify with arbitrary indent string not supported");
    let r = e;
    return (
      e > 10 && (r = 10),
      (function (t) {
        let e = "";
        const n = new Map(),
          r = new Map();
        function i(t, o) {
          const s = r.get(t);
          if (void 0 !== s) {
            const t = s.get(o.length);
            if (void 0 !== t) return void (e += e.substring(t[0], t[1]));
          }
          const u = e.length;
          if ("line" === t.type)
            (n.has(t.line) ||
              n.set(
                t.line,
                (function (t) {
                  function e(t, n) {
                    if ("multiline" === t.type)
                      throw new Error("Tried to format multiline string as single line string");
                    if ("terminal" === t.type) n.push(t.str);
                    else if ("pair" === t.type)
                      (n.push("["), e(t.head, n), n.push(", "), e(t.tail, n), n.push("]"));
                    else if ("kvpair" === t.type)
                      (n.push(JSON.stringify(t.key)), n.push(": "), e(t.value, n));
                    else if ("arraylike" === t.type) {
                      (n.push(t.prefix), t.elems.length > 0 && e(t.elems[0], n));
                      for (let r = 1; r < t.elems.length; r++) (n.push(", "), e(t.elems[r], n));
                      n.push(t.suffix);
                    }
                    return n;
                  }
                  return e(t, []).join("");
                })(t.line),
              ),
              (e += n.get(t.line)));
          else if ("block" === t.type) {
            e += t.prefixFirst;
            const n = o + " ".repeat(t.prefixFirst.length),
              r = o + t.prefixRest;
            i(t.block[0], n);
            for (let n = 1; n < t.block.length; n++)
              ((e += t.suffixRest), (e += r), i(t.block[n], r));
            e += t.suffixLast;
          }
          const a = e.length;
          if (void 0 === s) {
            const e = new Map();
            (e.set(o.length, [u, a]), r.set(t, e));
          } else s.set(o.length, [u, a]);
        }
        return (i(t, "\n"), e);
      })(
        (function (t, e, n) {
          const r = " ".repeat(Math.max(0, e - 1)),
            i = "[" + r,
            o = new Map();
          function s(t) {
            const r = o.get(t);
            if (void 0 !== r) return r;
            let u;
            if ("terminal" === t.type) u = { type: "line", line: t };
            else if ("multiline" === t.type)
              u = {
                type: "block",
                prefixFirst: "",
                prefixRest: "",
                block: t.lines.map(t => ({
                  type: "line",
                  line: { type: "terminal", str: t, length: t.length },
                })),
                suffixRest: "",
                suffixLast: "",
              };
            else if ("pair" === t.type) {
              const e = s(t.head),
                r = s(t.tail);
              u =
                t.length - 2 > n || "line" !== e.type || "line" !== r.type
                  ? {
                      type: "block",
                      prefixFirst: i,
                      prefixRest: "",
                      block: [e, r],
                      suffixRest: ",",
                      suffixLast: "]",
                    }
                  : { type: "line", line: t };
            } else if ("arraylike" === t.type) {
              const r = t.elems.map(s);
              u =
                t.length - t.prefix.length - t.suffix.length > n || r.some(t => "line" !== t.type)
                  ? {
                      type: "block",
                      prefixFirst: t.prefix + " ".repeat(Math.max(0, e - t.prefix.length)),
                      prefixRest: " ".repeat(Math.max(t.prefix.length, e)),
                      block: r,
                      suffixRest: ",",
                      suffixLast: t.suffix,
                    }
                  : { type: "line", line: t };
            } else {
              if ("kvpair" !== t.type) throw new Error("Unreachable");
              {
                const e = s(t.value);
                u =
                  t.length > n || "line" !== e.type
                    ? {
                        type: "block",
                        prefixFirst: "",
                        prefixRest: "",
                        block: [
                          {
                            type: "line",
                            line: { type: "terminal", str: JSON.stringify(t.key), length: 0 },
                          },
                          e,
                        ],
                        suffixRest: ":",
                        suffixLast: "",
                      }
                    : { type: "line", line: t };
              }
            }
            return (o.set(t, u), u);
          }
          return s(t);
        })(
          (function (t) {
            const e = new Map(),
              n = new Map();
            function r(t) {
              const r = n.get(t);
              if (void 0 !== r) return [r, !1];
              e.set(t, e.size);
              const i = t.value,
                [o, u] = s(i[0]),
                [a, l] = s(i[1]),
                c = u || l;
              e.delete(t);
              const p = { type: "pair", head: o, tail: a, length: o.length + a.length + 4 };
              return (c || n.set(t, p), [p, c]);
            }
            function i(t, r, i, o) {
              const u = n.get(t);
              if (void 0 !== u) return [u, !1];
              e.set(t, e.size);
              const a = r.map(s);
              let l = i.length + o.length + 2 * Math.max(0, a.length - 1),
                c = !1;
              for (let t = 0; t < a.length; t++) ((l += a[t][0].length), c || (c = a[t][1]));
              e.delete(t);
              const p = {
                type: "arraylike",
                elems: a.map(t => t[0]),
                prefix: i,
                suffix: o,
                length: l,
              };
              return (c || n.set(t, p), [p, c]);
            }
            function o(t) {
              const e = t.split("\n");
              return 1 === e.length
                ? [{ type: "terminal", str: e[0], length: e[0].length }, !1]
                : [{ type: "multiline", lines: e, length: 1 / 0 }, !1];
            }
            function s(t) {
              if ("none" === t.type) return [{ type: "terminal", str: "None", length: 4 }, !1];
              if (e.has(t)) return [{ type: "terminal", str: "...<circular>", length: 13 }, !0];
              if ("bool" === t.type) {
                const e = t.value ? "True" : "False";
                return [{ type: "terminal", str: e, length: e.length }, !1];
              }
              if ("number" === t.type) {
                const e =
                  ((n = t.value),
                  Object.is(n, -0)
                    ? "-0.0"
                    : 0 === n
                      ? "0.0"
                      : n === 1 / 0
                        ? "inf"
                        : n === -1 / 0
                          ? "-inf"
                          : Number.isNaN(n)
                            ? "nan"
                            : Math.abs(n) >= 1e16 || (0 !== n && Math.abs(n) < 1e-4)
                              ? n.toExponential().replace(/e([+-])(\d)$/, "e$10$2")
                              : Number.isInteger(n)
                                ? n.toFixed(1).toString()
                                : n.toString());
                return [{ type: "terminal", str: e, length: e.length }, !1];
              }
              if ("bigint" === t.type || "complex" === t.type) {
                const e = t.value.toString();
                return [{ type: "terminal", str: e, length: e.length }, !1];
              }
              if ("string" === t.type) {
                const e = (function (t) {
                  let e = JSON.stringify(t);
                  return (
                    (t.includes("'") && !t.includes('"')) ||
                      (e = `'${e.slice(1, -1).replace(/'/g, "\\'").replace(/\\"/g, '"')}'`),
                    e
                  );
                })(t.value);
                return [{ type: "terminal", str: e, length: e.length }, !1];
              }
              if ("list" === t.type)
                return e.size > 100
                  ? [{ type: "terminal", str: "...<truncated>", length: 14 }, !1]
                  : 2 === t.value.length
                    ? r(t)
                    : i(t, t.value, "[", "]");
              if ("closure" === t.type || "function" === t.type) {
                let e = "(anonymous)";
                if ("closure" === t.type) {
                  const n = t.closure.node;
                  e = n instanceof j.FunctionDef ? n.name.lexeme : "(anonymous)";
                } else e = t.name || "(anonymous)";
                const n = `<function ${e}>`;
                return [{ type: "terminal", str: n, length: n.length }, !1];
              }
              if ("builtin" === t.type) {
                const e = `<built-in function ${t.name}>`;
                return [{ type: "terminal", str: e, length: e.length }, !1];
              }
              return o(`<${t.type} object>`);
              var n;
            }
            return s(t)[0];
          })(t),
          r,
          n,
        ),
      )
    );
  };
  var iu = (t => (
    (t.MATH = "math"),
    (t.MISC = "misc"),
    (t.LINKED_LISTS = "linked-list"),
    (t.STREAMS = "stream"),
    (t.LIST = "list"),
    (t.PAIRMUTATORS = "pair-mutators"),
    (t.MCE = "mce"),
    t
  ))(iu || {});
  const ou = new Map();
  function su(t, e, n, r) {
    return function (i, o, s) {
      const u = s.value;
      (ou.set(n, t || 0),
        (s.value = function (i, o, s, a) {
          return (
            null !== t && i.length < t && z(a, new I(o, s, n, t, i, r)),
            null !== e && i.length > e && z(a, new L(o, s, n, e, i, r)),
            u.call(this, i, o, s, a)
          );
        }));
    };
  }
  function uu(t, e = !1) {
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
        if (t.closure.node) {
          return `<function ${"FunctionDef" === t.closure.node.kind ? t.closure.node.name.lexeme : "(anonymous)"}>`;
        }
      } else if ("none" === t.type) n = "None";
      else if ("string" === t.type)
        n = e
          ? (function (t) {
              let e = JSON.stringify(t);
              return (
                (t.includes("'") && !t.includes('"')) ||
                  (e = `'${e.slice(1, -1).replace(/'/g, "\\'").replace(/\\"/g, '"')}'`),
                e
              );
            })(t.value)
          : t.value;
      else if ("function" === t.type) {
        n = `<function ${t.name || "(anonymous)"}>`;
      } else
        n =
          "list" === t.type
            ? (function (t) {
                return ru(t);
              })(t)
            : `<${t.type} object>`;
    }
    var r;
    return n;
  }
  var au = Object.defineProperty,
    lu = Object.getOwnPropertyDescriptor,
    cu = (t, e, n, r) => {
      for (var i, o = lu(e, n), s = t.length - 1; s >= 0; s--) (i = t[s]) && (o = i(e, n, o) || o);
      return (o && au(e, n, o), o);
    };
  const pu = new Map(),
    hu = {
      math_e: { type: "number", value: Math.E },
      math_inf: { type: "number", value: 1 / 0 },
      math_nan: { type: "number", value: NaN },
      math_pi: { type: "number", value: Math.PI },
      math_tau: { type: "number", value: 2 * Math.PI },
    },
    fu = class t {
      static math_acos(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)),
          (o < -1 || o > 1) && z(r, new P(e, n, r, "math_acos")));
        return { type: "number", value: Math.acos(o) };
      }
      static math_acosh(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)),
          o < 1 && z(r, new P(e, n, r, "math_acosh")));
        return { type: "number", value: Math.acosh(o) };
      }
      static math_asin(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)),
          (o < -1 || o > 1) && z(r, new P(e, n, r, "math_asin")));
        return { type: "number", value: Math.asin(o) };
      }
      static math_asinh(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)));
        return { type: "number", value: Math.asinh(o) };
      }
      static math_atan(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)));
        return { type: "number", value: Math.atan(o) };
      }
      static math_atan2(t, e, n, r) {
        const i = t[0],
          o = t[1];
        let s, u;
        (nu(o)
          ? nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int"))
          : z(r, new R(e, n, r, o.type, "float' or 'int")),
          (s = "number" === i.type ? i.value : Number(i.value)),
          (u = "number" === o.type ? o.value : Number(o.value)));
        return { type: "number", value: Math.atan2(s, u) };
      }
      static math_atanh(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)),
          (o <= -1 || o >= 1) && z(r, new P(e, n, r, "math_atanh")));
        return { type: "number", value: Math.atanh(o) };
      }
      static math_cos(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)));
        return { type: "number", value: Math.cos(o) };
      }
      static math_cosh(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)));
        return { type: "number", value: Math.cosh(o) };
      }
      static math_degrees(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)));
        return { type: "number", value: (180 * o) / Math.PI };
      }
      static math_erf(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)));
        return { type: "number", value: Is(o) };
      }
      static math_erfc(e, n, r, i) {
        const o = e[0];
        nu(o) || z(i, new R(n, r, i, o.type, "float' or 'int"));
        return { type: "number", value: 1 - t.math_erf([e[0]], n, r, i).value };
      }
      static math_comb(t, e, n, r) {
        const i = t[0],
          o = t[1];
        "bigint" !== i.type
          ? z(r, new R(e, n, r, i.type, "int"))
          : "bigint" !== o.type && z(r, new R(e, n, r, o.type, "int"));
        const s = BigInt(i.value),
          u = BigInt(o.value);
        if (((s < 0 || u < 0) && z(r, new P(e, n, r, "math_comb")), u > s))
          return { type: "bigint", value: BigInt(0) };
        let a = BigInt(1);
        const l = u > s - u ? s - u : u;
        for (let t = BigInt(0); t < l; t++) a = (a * (s - t)) / (t + BigInt(1));
        return { type: "bigint", value: a };
      }
      static math_factorial(t, e, n, r) {
        const i = t[0];
        "bigint" !== i.type && z(r, new R(e, n, r, i.type, "int"));
        const o = BigInt(i.value);
        if ((o < 0 && z(r, new P(e, n, r, "math_factorial")), o === BigInt(0)))
          return { type: "bigint", value: BigInt(1) };
        let s = BigInt(1);
        for (let t = BigInt(1); t <= o; t++) s *= t;
        return { type: "bigint", value: s };
      }
      static math_gcd(e, n, r, i) {
        if (0 === e.length) return { type: "bigint", value: BigInt(0) };
        const o = e.map(
          t => ("bigint" !== t.type && z(i, new R(n, r, i, t.type, "int")), BigInt(t.value)),
        );
        if (o.every(t => t === BigInt(0))) return { type: "bigint", value: BigInt(0) };
        let s = o[0] < 0 ? -o[0] : o[0];
        for (
          let e = 1;
          e < o.length && ((s = t._gcdOfTwo(s, o[e] < 0 ? -o[e] : o[e])), s !== BigInt(1));
          e++
        );
        return { type: "bigint", value: s };
      }
      static _gcdOfTwo(t, e) {
        let n = t,
          r = e;
        for (; r !== BigInt(0); ) {
          const t = n % r;
          ((n = r), (r = t));
        }
        return n < 0 ? -n : n;
      }
      static math_isqrt(t, e, n, r) {
        const i = t[0];
        "bigint" !== i.type && z(r, new R(e, n, r, i.type, "int"));
        const o = i.value;
        if ((o < 0 && z(r, new P(e, n, r, "math_isqrt")), o < 2))
          return { type: "bigint", value: o };
        let s = BigInt(1),
          u = o;
        for (; s < u; ) {
          const t = (s + u + BigInt(1)) >> BigInt(1);
          t * t <= o ? (s = t) : (u = t - BigInt(1));
        }
        return { type: "bigint", value: s };
      }
      static math_lcm(e, n, r, i) {
        if (0 === e.length) return { type: "bigint", value: BigInt(1) };
        const o = e.map(
          t => ("bigint" !== t.type && z(i, new R(n, r, i, t.type, "int")), BigInt(t.value)),
        );
        if (o.some(t => t === BigInt(0))) return { type: "bigint", value: BigInt(0) };
        let s = t._absBigInt(o[0]);
        for (
          let e = 1;
          e < o.length && ((s = t._lcmOfTwo(s, t._absBigInt(o[e]))), s !== BigInt(0));
          e++
        );
        return { type: "bigint", value: s };
      }
      static _lcmOfTwo(e, n) {
        const r = t._gcdOfTwo(e, n);
        return BigInt((e / r) * n);
      }
      static _absBigInt(t) {
        return t < 0 ? -t : t;
      }
      static math_perm(t, e, n, r) {
        const i = t[0];
        "bigint" !== i.type && z(r, new R(e, n, r, i.type, "int"));
        const o = BigInt(i.value);
        let s = o;
        if (2 === t.length) {
          const i = t[1];
          "none" === i.type
            ? (s = o)
            : "bigint" === i.type
              ? (s = BigInt(i.value))
              : z(r, new R(e, n, r, i.type, "int' or 'None"));
        }
        if (((o < 0 || s < 0) && z(r, new P(e, n, r, "math_perm")), s > o))
          return { type: "bigint", value: BigInt(0) };
        let u = BigInt(1);
        for (let t = BigInt(0); t < s; t++) u *= o - t;
        return { type: "bigint", value: u };
      }
      static math_ceil(t, e, n, r) {
        const i = t[0];
        if ("bigint" === i.type) return i;
        if ("number" === i.type) {
          const t = i.value;
          return { type: "bigint", value: BigInt(Math.ceil(t)) };
        }
        z(r, new R(e, n, r, i.type, "float' or 'int"));
      }
      static math_fabs(t, e, n, r) {
        const i = t[0];
        if ("bigint" === i.type) {
          const t = BigInt(i.value);
          return { type: "number", value: t < 0 ? -Number(t) : Number(t) };
        }
        if ("number" === i.type) {
          const t = i.value;
          "number" != typeof t && z(r, new R(e, n, r, i.type, "float' or 'int"));
          return { type: "number", value: Math.abs(t) };
        }
        z(r, new R(e, n, r, i.type, "float' or 'int"));
      }
      static math_floor(t, e, n, r) {
        const i = t[0];
        if ("bigint" === i.type) return i;
        if ("number" === i.type) {
          const t = i.value;
          "number" != typeof t && z(r, new R(e, n, r, i.type, "float' or 'int"));
          return { type: "bigint", value: BigInt(Math.floor(t)) };
        }
        z(r, new R(e, n, r, i.type, "float' or 'int"));
      }
      static _twoProd(t, e) {
        const n = t * e,
          r = 134217729,
          i = t * r - (t * r - t),
          o = t - i,
          s = e * r - (e * r - e),
          u = e - s;
        return { prod: n, err: o * u - (n - i * s - o * s - i * u) };
      }
      static _twoSum(t, e) {
        const n = t + e,
          r = n - t;
        return { sum: n, err: t - (n - r) + (e - r) };
      }
      static _fusedMultiplyAdd(e, n, r) {
        const { prod: i, err: o } = t._twoProd(e, n),
          { sum: s, err: u } = t._twoSum(i, r);
        return s + (o + u);
      }
      static _toNumber(t, e, n, r) {
        return "bigint" === t.type
          ? Number(t.value)
          : "number" === t.type
            ? t.value
            : void z(r, new R(e, n, r, t.type, "float' or 'int"));
      }
      static math_fma(e, n, r, i) {
        const o = t._toNumber(e[0], n, r, i),
          s = t._toNumber(e[1], n, r, i),
          u = t._toNumber(e[2], n, r, i);
        if (isNaN(o) || isNaN(s) || isNaN(u)) return { type: "number", value: NaN };
        if (0 === o && !isFinite(s) && isNaN(u)) return { type: "number", value: NaN };
        if (0 === s && !isFinite(o) && isNaN(u)) return { type: "number", value: NaN };
        return { type: "number", value: t._fusedMultiplyAdd(o, s, u) };
      }
      static math_fmod(e, n, r, i) {
        const o = t._toNumber(e[0], n, r, i),
          s = t._toNumber(e[1], n, r, i);
        0 === s && z(i, new P(n, r, i, "math_fmod"));
        return { type: "number", value: o % s };
      }
      static _roundToEven(t) {
        const e = Math.floor(t),
          n = Math.ceil(t),
          r = t - e,
          i = n - t;
        return r < i ? e : i < r ? n : e % 2 == 0 ? e : n;
      }
      static math_remainder(e, n, r, i) {
        const o = e[0],
          s = e[1];
        let u, a;
        ("bigint" === o.type
          ? (u = Number(o.value))
          : "number" === o.type
            ? (u = o.value)
            : z(i, new R(n, r, i, o.type, "float' or 'int")),
          "bigint" === s.type
            ? (a = Number(s.value))
            : "number" === s.type
              ? (a = s.value)
              : z(i, new R(n, r, i, s.type, "float' or 'int")),
          0 === a && z(i, new P(n, r, i, "math_remainder")));
        const l = u / a;
        return { type: "number", value: u - t._roundToEven(l) * a };
      }
      static math_trunc(t, e, n, r) {
        const i = t[0];
        if ("bigint" === i.type) return i;
        if ("number" === i.type) {
          const t = i.value;
          let o;
          return (
            "number" != typeof t && z(r, new R(e, n, r, i.type, "float' or 'int")),
            (o = 0 === t ? 0 : t < 0 ? Math.ceil(t) : Math.floor(t)),
            { type: "bigint", value: BigInt(o) }
          );
        }
        z(r, new R(e, n, r, i.type, "float' or 'int"));
      }
      static math_copysign(t, e, n, r) {
        const [i, o] = t;
        nu(i)
          ? nu(o) || z(r, new R(e, n, r, o.type, "float' or 'int"))
          : z(r, new R(e, n, r, i.type, "float' or 'int"));
        const s = Number(i.value),
          u = Number(o.value),
          a = Math.abs(s),
          l = u < 0 || Object.is(u, -0);
        return { type: "number", value: Number(l ? -a : a) };
      }
      static math_isfinite(t, e, n, r) {
        const i = t[0];
        nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int"));
        const o = Number(i.value);
        return { type: "bool", value: Number.isFinite(o) };
      }
      static math_isinf(t, e, n, r) {
        const i = t[0];
        nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int"));
        const o = Number(i.value);
        return { type: "bool", value: o === 1 / 0 || o === -1 / 0 };
      }
      static math_isnan(t, e, n, r) {
        const i = t[0];
        nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int"));
        const o = Number(i.value);
        return { type: "bool", value: Number.isNaN(o) };
      }
      static math_ldexp(e, n, r, i) {
        const o = t._toNumber(e[0], n, r, i);
        "bigint" !== e[1].type && z(i, new R(n, r, i, e[1].type, "int"));
        const s = e[1].value;
        return { type: "number", value: o * Math.pow(2, Number(s)) };
      }
      static math_nextafter(t, e, n, r) {
        throw new Error("math_nextafter not implemented");
      }
      static math_ulp(t, e, n, r) {
        throw new Error("math_ulp not implemented");
      }
      static math_cbrt(t, e, n, r) {
        const i = t[0];
        let o;
        "number" !== i.type
          ? "bigint" === i.type
            ? (o = Number(i.value))
            : z(r, new R(e, n, r, i.type, "float' or 'int"))
          : (o = i.value);
        return { type: "number", value: Math.cbrt(o) };
      }
      static math_exp(t, e, n, r) {
        const i = t[0];
        let o;
        "number" !== i.type
          ? "bigint" === i.type
            ? (o = Number(i.value))
            : z(r, new R(e, n, r, i.type, "float' or 'int"))
          : (o = i.value);
        return { type: "number", value: Math.exp(o) };
      }
      static math_exp2(t, e, n, r) {
        const i = t[0];
        let o;
        "number" !== i.type
          ? "bigint" === i.type
            ? (o = Number(i.value))
            : z(r, new R(e, n, r, i.type, "float' or 'int"))
          : (o = i.value);
        return { type: "number", value: Math.pow(2, o) };
      }
      static math_expm1(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)));
        return { type: "number", value: Math.expm1(o) };
      }
      static math_gamma(e, n, r, i) {
        const o = e[0];
        nu(o) || z(i, new R(n, r, i, o.type, "float' or 'int"));
        const s = t._toNumber(o, n, r, i);
        return { type: "number", value: Js(s) };
      }
      static math_lgamma(e, n, r, i) {
        const o = e[0];
        nu(o) || z(i, new R(n, r, i, o.type, "float' or 'int"));
        const s = t._toNumber(o, n, r, i);
        return { type: "number", value: Os(s) };
      }
      static math_log(t, e, n, r) {
        const i = t[0];
        let o;
        if (
          (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)),
          o <= 0 && z(r, new P(e, n, r, "math_log")),
          1 === t.length)
        )
          return { type: "number", value: Math.log(o) };
        const s = t[1];
        let u;
        (nu(s) || z(r, new R(e, n, r, s.type, "float' or 'int")),
          (u = "number" === s.type ? s.value : Number(s.value)),
          u <= 0 && z(r, new P(e, n, r, "math_log")));
        return { type: "number", value: Math.log(o) / Math.log(u) };
      }
      static math_log10(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, t[0].type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)),
          o <= 0 && z(r, new P(e, n, r, "math_log10")));
        return { type: "number", value: Math.log10(o) };
      }
      static math_log1p(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, t[0].type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)),
          1 + o <= 0 && z(r, new P(e, n, r, "math_log1p")));
        return { type: "number", value: Math.log1p(o) };
      }
      static math_log2(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, t[0].type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)),
          o <= 0 && z(r, new P(e, n, r, "math_log2")));
        return { type: "number", value: Math.log2(o) };
      }
      static math_pow(t, e, n, r) {
        const i = t[0],
          o = t[1];
        let s, u;
        (nu(i)
          ? nu(o) || z(r, new R(e, n, r, o.type, "float' or 'int"))
          : z(r, new R(e, n, r, i.type, "float' or 'int")),
          (s = "number" === i.type ? i.value : Number(i.value)),
          (u = "number" === o.type ? o.value : Number(o.value)));
        return { type: "number", value: Math.pow(s, u) };
      }
      static math_radians(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)));
        return { type: "number", value: (o * Math.PI) / 180 };
      }
      static math_sin(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)));
        return { type: "number", value: Math.sin(o) };
      }
      static math_sinh(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)));
        return { type: "number", value: Math.sinh(o) };
      }
      static math_tan(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)));
        return { type: "number", value: Math.tan(o) };
      }
      static math_tanh(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)));
        return { type: "number", value: Math.tanh(o) };
      }
      static math_sqrt(t, e, n, r) {
        const i = t[0];
        let o;
        (nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int")),
          (o = "number" === i.type ? i.value : Number(i.value)),
          o < 0 && z(r, new P(e, n, r, "math_sqrt")));
        return { type: "number", value: Math.sqrt(o) };
      }
    };
  (cu([su(1, 1, "math_acos", !1)], fu, "math_acos"),
    cu([su(1, 1, "math_acosh", !1)], fu, "math_acosh"),
    cu([su(1, 1, "math_asin", !1)], fu, "math_asin"),
    cu([su(1, 1, "math_asinh", !1)], fu, "math_asinh"),
    cu([su(1, 1, "math_atan", !1)], fu, "math_atan"),
    cu([su(2, 2, "math_atan2", !1)], fu, "math_atan2"),
    cu([su(1, 1, "math_atanh", !1)], fu, "math_atanh"),
    cu([su(1, 1, "math_cos", !1)], fu, "math_cos"),
    cu([su(1, 1, "math_cosh", !1)], fu, "math_cosh"),
    cu([su(1, 1, "math_degrees", !1)], fu, "math_degrees"),
    cu([su(1, 1, "math_erf", !1)], fu, "math_erf"),
    cu([su(1, 1, "math_erfc", !1)], fu, "math_erfc"),
    cu([su(2, 2, "math_comb", !1)], fu, "math_comb"),
    cu([su(1, 1, "math_factorial", !1)], fu, "math_factorial"),
    cu([su(1, 1, "math_isqrt", !1)], fu, "math_isqrt"),
    cu([su(1, 2, "math_perm", !0)], fu, "math_perm"),
    cu([su(1, 1, "math_ceil", !1)], fu, "math_ceil"),
    cu([su(1, 1, "math_fabs", !1)], fu, "math_fabs"),
    cu([su(1, 1, "math_floor", !1)], fu, "math_floor"),
    cu([su(3, 3, "math_fma", !1)], fu, "math_fma"),
    cu([su(2, 2, "math_fmod", !1)], fu, "math_fmod"),
    cu([su(2, 2, "math_remainder", !1)], fu, "math_remainder"),
    cu([su(1, 1, "math_trunc", !1)], fu, "math_trunc"),
    cu([su(2, 2, "math_copysign", !1)], fu, "math_copysign"),
    cu([su(1, 1, "math_isfinite", !1)], fu, "math_isfinite"),
    cu([su(1, 1, "math_isinf", !1)], fu, "math_isinf"),
    cu([su(1, 1, "math_isnan", !1)], fu, "math_isnan"),
    cu([su(2, 2, "math_ldexp", !1)], fu, "math_ldexp"),
    cu([su(2, 2, "math_nextafter", !1)], fu, "math_nextafter"),
    cu([su(1, 1, "math_ulp", !1)], fu, "math_ulp"),
    cu([su(1, 1, "math_cbrt", !1)], fu, "math_cbrt"),
    cu([su(1, 1, "math_exp", !1)], fu, "math_exp"),
    cu([su(1, 1, "math_exp2", !1)], fu, "math_exp2"),
    cu([su(1, 1, "math_expm1", !1)], fu, "math_expm1"),
    cu([su(1, 1, "math_gamma", !1)], fu, "math_gamma"),
    cu([su(1, 1, "math_lgamma", !1)], fu, "math_lgamma"),
    cu([su(1, 2, "math_log", !0)], fu, "math_log"),
    cu([su(1, 1, "math_log10", !1)], fu, "math_log10"),
    cu([su(1, 1, "math_log1p", !1)], fu, "math_log1p"),
    cu([su(1, 1, "math_log2", !1)], fu, "math_log2"),
    cu([su(2, 2, "math_pow", !1)], fu, "math_pow"),
    cu([su(1, 1, "math_radians", !1)], fu, "math_radians"),
    cu([su(1, 1, "math_sin", !1)], fu, "math_sin"),
    cu([su(1, 1, "math_sinh", !1)], fu, "math_sinh"),
    cu([su(1, 1, "math_tan", !1)], fu, "math_tan"),
    cu([su(1, 1, "math_tanh", !1)], fu, "math_tanh"),
    cu([su(1, 1, "math_sqrt", !1)], fu, "math_sqrt"));
  let mu = fu;
  for (const t of Object.getOwnPropertyNames(mu))
    "function" != typeof mu[t] ||
      t.startsWith("_") ||
      pu.set(t, { type: "builtin", func: mu[t], name: t, minArgs: ou.get(t) || 0 });
  for (const [t, e] of Object.entries(hu)) pu.set(t, e);
  var du = { name: iu.MATH, prelude: "", builtins: pu };
  function gu(t) {
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
  var yu = Object.defineProperty,
    Du = Object.getOwnPropertyDescriptor,
    vu = (t, e, n, r) => {
      for (var i, o = Du(e, n), s = t.length - 1; s >= 0; s--) (i = t[s]) && (o = i(e, n, o) || o);
      return (o && yu(e, n, o), o);
    };
  const bu = new Map();
  class wu {
    static arity(t, e, n, r) {
      const i = t[0];
      if (
        ("builtin" !== i.type && "closure" !== i.type && z(r, new R(e, n, r, i.type, "function")),
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
        (nu(i) ||
          "string" === i.type ||
          "bool" === i.type ||
          z(r, new R(e, n, r, i.type, "str, int, float or bool")),
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
            /^[+-]?\d+$/.test(t) || z(r, new P(e, n, r, "int")),
            { type: "bigint", value: BigInt(t) }
          );
        }
        return { type: "bigint", value: i.value ? BigInt(1) : BigInt(0) };
      }
      const o = t[1];
      ("string" !== i.type && z(r, new R(e, n, r, i.type, "string")),
        "bigint" !== o.type && z(r, new R(e, n, r, o.type, "int")));
      let s = Number(o.value),
        u = i.value.trim().replace(/_/g, "");
      const a = u.startsWith("-") ? -1 : 1;
      ((u.startsWith("+") || u.startsWith("-")) && (u = u.substring(1)),
        0 === s &&
          (u.startsWith("0x") || u.startsWith("0X")
            ? ((s = 16), (u = u.substring(2)))
            : u.startsWith("0o") || u.startsWith("0O")
              ? ((s = 8), (u = u.substring(2)))
              : u.startsWith("0b") || u.startsWith("0B")
                ? ((s = 2), (u = u.substring(2)))
                : (s = 10)),
        (s < 2 || s > 36) && z(r, new P(e, n, r, "int")));
      const l = "0123456789abcdefghijklmnopqrstuvwxyz".substring(0, s);
      new RegExp(`^[${l}]+$`, "i").test(u) || z(r, new P(e, n, r, "int"));
      let c = BigInt(0);
      for (const t of u) c = c * BigInt(s) + BigInt(l.indexOf(t.toLowerCase()));
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
          o = {
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
        if (t in o) return { type: "number", value: o[t] };
        const s = Number(t);
        return (isNaN(s) && z(r, new P(e, n, r, "float")), { type: "number", value: s });
      }
      z(r, new R(e, n, r, i.type, "float', 'int', 'bool' or 'str"));
    }
    static complex(t, e, n, r) {
      if (0 === t.length) return { type: "complex", value: new U(0, 0) };
      if (1 == t.length) {
        const i = t[0];
        return (
          "bigint" !== i.type &&
            "number" !== i.type &&
            "bool" !== i.type &&
            "string" !== i.type &&
            "complex" !== i.type &&
            z(r, new R(e, n, r, i.type, "complex")),
          { type: "complex", value: U.fromValue(r, e, n, i.value) }
        );
      }
      const i = t.filter(
        t =>
          "bigint" !== t.type && "number" !== t.type && "bool" !== t.type && "complex" !== t.type,
      );
      i.length > 0 && z(r, new R(e, n, r, i[0].type, "'int', 'float', 'bool' or 'complex'"));
      const [o, s] = t,
        u = U.fromValue(r, e, n, o.value),
        a = U.fromValue(r, e, n, s.value);
      return { type: "complex", value: u.add(a.mul(new U(0, 1))) };
    }
    static real(t, e, n, r) {
      const i = t[0];
      return (
        "complex" !== i.type && z(r, new R(e, n, r, i.type, "complex")),
        { type: "number", value: i.value.real }
      );
    }
    static imag(t, e, n, r) {
      const i = t[0];
      return (
        "complex" !== i.type && z(r, new R(e, n, r, i.type, "complex")),
        { type: "number", value: i.value.imag }
      );
    }
    static bool(t, e, n, r) {
      if (0 === t.length) return { type: "bool", value: !1 };
      return { type: "bool", value: !gu(t[0]) };
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
          z(r, new R(e, n, r, t[0].type, "float', 'int' or 'complex"));
      }
    }
    static len(t, e, n, r) {
      const i = t[0];
      if ("string" === i.type || "list" === i.type)
        return { type: "bigint", value: BigInt([...i.value].length) };
      z(r, new R(e, n, r, i.type, "object with length"));
    }
    static error(t, e, n, r) {
      const i = "Error: " + t.map(t => uu(t)).join(" ") + "\n";
      z(r, new $(i, n));
    }
    static max(t, e, n, r) {
      if (t.every(nu) || t.every(t => "string" === t.type)) {
        let e = 0;
        for (let n = 1; n < t.length; n++) t[n].value > t[e].value && (e = n);
        return t[e];
      }
      if (nu(t[0])) {
        const i = t.find(t => !nu(t));
        z(r, new R(e, n, r, i.type, "int' or 'float"));
      } else if ("string" === t[0].type) {
        const i = t.find(t => "string" !== t.type);
        z(r, new R(e, n, r, i.type, "str"));
      } else z(r, new R(e, n, r, t[0].type, "int', 'float' or 'str'"));
    }
    static min(t, e, n, r) {
      if (t.every(nu) || t.every(t => "string" === t.type)) {
        let e = 0;
        for (let n = 1; n < t.length; n++) t[n].value < t[e].value && (e = n);
        return t[e];
      }
      if (nu(t[0])) {
        const i = t.find(t => !nu(t));
        z(r, new R(e, n, r, i.type, "int' or 'float"));
      } else if ("string" === t[0].type) {
        const i = t.find(t => "string" !== t.type);
        z(r, new R(e, n, r, i.type, "str"));
      } else z(r, new R(e, n, r, t[0].type, "int', 'float' or 'str'"));
    }
    static random_random(t, e, n, r) {
      return { type: "number", value: Math.random() };
    }
    static round(t, e, n, r) {
      const i = t[0];
      nu(i) || z(r, new R(e, n, r, i.type, "float' or 'int"));
      let o = { value: BigInt(0) };
      if (2 !== t.length || "none" === t[1].type) {
        const t = Intl.NumberFormat("en-US", {
          roundingMode: "halfEven",
          useGrouping: !1,
          maximumFractionDigits: 0,
        }).format(i.value);
        return { type: "bigint", value: BigInt(t) };
      }
      if (
        ("bigint" !== t[1].type && z(r, new R(e, n, r, t[1].type, "int")),
        (o = t[1]),
        "number" === i.type)
      ) {
        const t = i.value;
        if (o.value >= 0) {
          const e = Intl.NumberFormat("en-US", {
            roundingMode: "halfEven",
            useGrouping: !1,
            maximumFractionDigits: Number(o.value),
          }).format(t);
          return { type: "number", value: Number(e) };
        }
        {
          const t = Intl.NumberFormat("en-US", {
            roundingMode: "halfEven",
            useGrouping: !1,
            maximumFractionDigits: 0,
          }).format(i.value / 10 ** -Number(o.value));
          return { type: "number", value: Number(t) * 10 ** -Number(o.value) };
        }
      }
      if (o.value >= 0) return i;
      {
        const t = Intl.NumberFormat("en-US", {
          roundingMode: "halfEven",
          useGrouping: !1,
          maximumFractionDigits: 0,
        }).format(Number(i.value) / 10 ** -Number(o.value));
        return { type: "bigint", value: BigInt(t) * 10n ** -o.value };
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
      const i = t.map(t => uu(t)).join(" ") + "\n";
      return (
        await (async (t, e) => {
          t.streams.initialised && (await t.streams.stdout.writer.write(e));
        })(r, i),
        { type: "none" }
      );
    }
    static str(t, e, n, r) {
      if (0 === t.length) return { type: "string", value: "" };
      return { type: "string", value: uu(t[0]) };
    }
    static repr(t, e, n, r) {
      return { type: "string", value: uu(t[0], !0) };
    }
  }
  (vu([su(1, 1, "arity", !0)], wu, "arity"),
    vu([su(null, 2, "int", !0)], wu, "int"),
    vu([su(null, 1, "float", !0)], wu, "float"),
    vu([su(null, 2, "complex", !0)], wu, "complex"),
    vu([su(1, 1, "real", !0)], wu, "real"),
    vu([su(1, 1, "imag", !0)], wu, "imag"),
    vu([su(null, 1, "bool", !0)], wu, "bool"),
    vu([su(1, 1, "abs", !1)], wu, "abs"),
    vu([su(1, 1, "len", !0)], wu, "len"),
    vu([su(2, null, "max", !0)], wu, "max"),
    vu([su(2, null, "min", !0)], wu, "min"),
    vu([su(null, 0, "random_random", !0)], wu, "random_random"),
    vu([su(1, 2, "round", !0)], wu, "round"),
    vu([su(null, 0, "time_time", !0)], wu, "time_time"),
    vu([su(1, 1, "is_none", !0)], wu, "is_none"),
    vu([su(1, 1, "is_float", !0)], wu, "is_float"),
    vu([su(1, 1, "is_string", !0)], wu, "is_string"),
    vu([su(1, 1, "is_boolean", !0)], wu, "is_boolean"),
    vu([su(1, 1, "is_complex", !0)], wu, "is_complex"),
    vu([su(1, 1, "is_int", !0)], wu, "is_int"),
    vu([su(1, 1, "is_function", !0)], wu, "is_function"),
    vu([su(1, 1, "repr", !0)], wu, "repr"));
  for (const t of Object.getOwnPropertyNames(wu))
    "function" != typeof wu[t] ||
      t.startsWith("_") ||
      bu.set(t, { type: "builtin", func: wu[t], name: t, minArgs: ou.get(t) || 0 });
  var Eu = { name: iu.MISC, prelude: "", builtins: bu },
    xu = (t => (
      (t[(t.NOP = 0)] = "NOP"),
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
      (t[(t.FOR_ITER = 88)] = "FOR_ITER"),
      t
    ))(xu || {});
  class Au {
    constructor(t, e, n, r, i, o, s) {
      ((this.opcodes = t),
        (this.arg1s = e),
        (this.arg2s = n),
        (this.strings = r),
        (this.count = t.length),
        (this.stackSize = i),
        (this.envSize = o + s),
        (this.numArgs = s));
    }
    toInstructions() {
      const t = [];
      for (let e = 0; e < this.count; e++) {
        const n = this.opcodes[e];
        n === xu.LGCS
          ? t.push({ opcode: n, arg1: this.strings[this.arg1s[e]] })
          : t.push({ opcode: n, arg1: this.arg1s[e], arg2: this.arg2s[e] });
      }
      return t;
    }
  }
  class Fu {
    constructor(t, e) {
      ((this.entryPoint = t), (this.functions = Object.freeze([...e])), Object.freeze(this));
    }
    withSpecializedFunction(t, e) {
      const n = [...this.functions];
      return ((n[t] = e), new Fu(this.entryPoint, n));
    }
  }
  class Cu extends Error {
    constructor(t) {
      (super(t), (this.name = "SVMLCompilerError"));
    }
  }
  const _u = class t {
    constructor(e) {
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
        (this.numArgs = e),
        (this.functionIndex = t._functionIndex++));
    }
    static resetIndex() {
      t._functionIndex = 0;
    }
    getFunctionIndex() {
      return this.functionIndex;
    }
    createChildBuilder(e) {
      const n = new t(e);
      return (this.children.push(n), n);
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
      ((this.currentStackDepth += Su[t]),
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
        if (void 0 === n) throw new Cu(`Undefined label ID: ${e}`);
        r[t] = n - t;
      }
      if (t)
        for (let i = 0; i < e; i++)
          if (n[i] === xu.NEWC || n[i] === xu.NEWCP || n[i] === xu.NEWCV) {
            const e = r[i];
            r[i] = t.get(e) ?? e;
          }
      return new Au(
        n,
        r,
        i,
        this.strings.slice(),
        this.maxStackDepth,
        this.symbolCount,
        this.numArgs,
      );
    }
  };
  _u._functionIndex = 0;
  let Nu = _u;
  const Su = new Int16Array(89);
  ((Su[xu.LDCI] = 1),
    (Su[xu.LGCI] = 1),
    (Su[xu.LDCF32] = 1),
    (Su[xu.LGCF32] = 1),
    (Su[xu.LDCF64] = 1),
    (Su[xu.LGCF64] = 1),
    (Su[xu.LDCB0] = 1),
    (Su[xu.LDCB1] = 1),
    (Su[xu.LGCB0] = 1),
    (Su[xu.LGCB1] = 1),
    (Su[xu.LGCU] = 1),
    (Su[xu.LGCN] = 1),
    (Su[xu.LGCS] = 1),
    (Su[xu.POPG] = -1),
    (Su[xu.POPB] = -1),
    (Su[xu.POPF] = -1),
    (Su[xu.ADDG] = -1),
    (Su[xu.ADDF] = -1),
    (Su[xu.SUBG] = -1),
    (Su[xu.SUBF] = -1),
    (Su[xu.MULG] = -1),
    (Su[xu.MULF] = -1),
    (Su[xu.DIVG] = -1),
    (Su[xu.DIVF] = -1),
    (Su[xu.MODG] = -1),
    (Su[xu.MODF] = -1),
    (Su[xu.FLOORDIVG] = -1),
    (Su[xu.FLOORDIVF] = -1),
    (Su[xu.LTG] = -1),
    (Su[xu.LTF] = -1),
    (Su[xu.GTG] = -1),
    (Su[xu.GTF] = -1),
    (Su[xu.LEG] = -1),
    (Su[xu.LEF] = -1),
    (Su[xu.GEG] = -1),
    (Su[xu.GEF] = -1),
    (Su[xu.EQG] = -1),
    (Su[xu.EQF] = -1),
    (Su[xu.EQB] = -1),
    (Su[xu.NEQG] = -1),
    (Su[xu.NEQF] = -1),
    (Su[xu.NEQB] = -1),
    (Su[xu.NOTG] = 0),
    (Su[xu.NOTB] = 0),
    (Su[xu.NEGG] = 0),
    (Su[xu.NEGF] = 0),
    (Su[xu.LDLG] = 1),
    (Su[xu.LDLF] = 1),
    (Su[xu.LDLB] = 1),
    (Su[xu.LDPG] = 1),
    (Su[xu.LDPF] = 1),
    (Su[xu.LDPB] = 1),
    (Su[xu.STLG] = -1),
    (Su[xu.STLF] = -1),
    (Su[xu.STLB] = -1),
    (Su[xu.STPG] = -1),
    (Su[xu.STPF] = -1),
    (Su[xu.STPB] = -1),
    (Su[xu.NEWA] = 0),
    (Su[xu.LDAG] = -1),
    (Su[xu.LDAB] = -1),
    (Su[xu.LDAF] = -1),
    (Su[xu.STAG] = -3),
    (Su[xu.STAB] = -3),
    (Su[xu.STAF] = -3),
    (Su[xu.NEWC] = 1),
    (Su[xu.NEWCP] = 1),
    (Su[xu.NEWCV] = 1),
    (Su[xu.BRT] = -1),
    (Su[xu.BRF] = -1),
    (Su[xu.BR] = 0),
    (Su[xu.JMP] = 0),
    (Su[xu.RETG] = -1),
    (Su[xu.RETF] = -1),
    (Su[xu.RETB] = -1),
    (Su[xu.RETU] = 0),
    (Su[xu.RETN] = 0),
    (Su[xu.DUP] = 1),
    (Su[xu.NEWENV] = 0),
    (Su[xu.POPENV] = 0),
    (Su[xu.NOP] = 0),
    (Su[xu.NEWITER] = 0),
    (Su[xu.FOR_ITER] = 1));
  const Bu = new Map([
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
    Mu = -2147483648,
    Tu = 2147483647;
  class ku {
    constructor(t, e, n) {
      ((this.tokenAnnotations = new WeakMap()),
        (this.envSlotCounters = new WeakMap()),
        (this.envSlotMaps = new WeakMap()),
        (this.tmpCounter = 0),
        (this.loopStack = []),
        (this.builder = n),
        (this.currentEnvironment = t),
        (this.functionEnvironments = e),
        (this.isTailCall = !1));
    }
    static fromProgram(t, e) {
      if (!e) {
        e = new dt("", t, [], [Eu, du]).resolveEnvironments(t);
      }
      const n = e.get(t);
      if (!n) throw new Error("Main program environment not found");
      Nu.resetIndex();
      const r = new Nu(0);
      return new ku(n, e, r);
    }
    fromFunctionNode(t) {
      const e = this.functionEnvironments.get(t);
      if (!e) throw new Error("Function environment not found");
      for (const n of t.parameters) e.lookupNameCurrentEnvWithError(n);
      const n = t.parameters.length,
        r = this.builder.createChildBuilder(n),
        i = new ku(e, this.functionEnvironments, r),
        o = new Map();
      i.envSlotMaps.set(e, o);
      for (let e = 0; e < t.parameters.length; e++) {
        const n = t.parameters[e].lexeme;
        o.set(n, e);
      }
      return (i.envSlotCounters.set(e, n), i);
    }
    compileProgram(t) {
      this.compile(t);
      const e = this.builder.getAllBuilders(!0).map(t => t.build());
      return new Fu(0, e);
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
        const t = Bu.get(n);
        if (void 0 === t) throw new Error(`Primitive function ${n} not implemented`);
        e = { slot: t, envLevel: 0, isPrimitive: !0, primitiveIndex: t };
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
      return e.isPrimitive
        ? { maxStackSize: 0 }
        : (0 === e.envLevel
            ? this.builder.emitUnary(xu.LDLG, e.slot)
            : this.builder.emitBinary(xu.LDPG, e.slot, e.envLevel),
          { maxStackSize: 1 });
    }
    emitStoreSymbol(t) {
      const e = this.getTokenAnnotation(t);
      if (e.isPrimitive) throw new Error(`Cannot assign to primitive symbol: ${t.lexeme}`);
      0 === e.envLevel
        ? this.builder.emitUnary(xu.STLG, e.slot)
        : this.builder.emitBinary(xu.STPG, e.slot, e.envLevel);
    }
    emitFunctionCall(t, e) {
      const n = this.getTokenAnnotation(t);
      if (n.isPrimitive) {
        const t = this.isTailCall ? xu.CALLTP : xu.CALLP;
        this.builder.emitPrimitiveCall(t, n.primitiveIndex, e);
      } else {
        const t = this.isTailCall ? xu.CALLT : xu.CALL;
        this.builder.emitCall(t, e);
      }
    }
    visitLiteralExpr(t) {
      const e = t.value;
      if (null === e) this.builder.emitNullary(xu.LGCN);
      else
        switch (typeof e) {
          case "boolean":
            this.builder.emitNullary(e ? xu.LGCB1 : xu.LGCB0);
            break;
          case "number":
            Number.isInteger(e) && Mu <= e && e <= Tu
              ? this.builder.emitUnary(xu.LGCI, e)
              : this.builder.emitUnary(xu.LGCF64, e);
            break;
          case "string":
            this.builder.emitUnary(xu.LGCS, e);
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
        Number.isInteger(e) && Mu <= e && e <= Tu
          ? this.builder.emitUnary(xu.LGCI, e)
          : this.builder.emitUnary(xu.LGCF64, e),
        { maxStackSize: 1 }
      );
    }
    visitComplexExpr(t) {
      throw new Error("Complex numbers not yet supported in SVML compiler");
    }
    visitListExpr(t) {
      const e = t.elements.length,
        n = this.getOrAssignSlot(this.currentEnvironment, "__list_tmp_" + this.tmpCounter++);
      (this.builder.emitUnary(xu.LGCI, e),
        this.builder.emitNullary(xu.NEWA),
        this.builder.emitUnary(xu.STLG, n));
      for (let r = 0; r < e; r++)
        (this.builder.emitUnary(xu.LDLG, n),
          this.builder.emitUnary(xu.LGCI, r),
          this.compile(t.elements[r]),
          this.builder.emitNullary(xu.STAG));
      return (this.builder.emitUnary(xu.LDLG, n), { maxStackSize: 4 });
    }
    visitSubscriptExpr(t) {
      return (
        this.compile(t.value),
        this.compile(t.index),
        this.builder.emitNullary(xu.LDAG),
        { maxStackSize: 2 }
      );
    }
    visitVariableExpr(t) {
      return (this.emitLoadSymbol(t.name), { maxStackSize: 1 });
    }
    getBinaryOpCode(t) {
      switch (t.type) {
        case _.PLUS:
          return xu.ADDG;
        case _.MINUS:
          return xu.SUBG;
        case _.STAR:
          return xu.MULG;
        case _.SLASH:
          return xu.DIVG;
        case _.PERCENT:
          return xu.MODG;
        case _.DOUBLESLASH:
          return xu.FLOORDIVG;
        default:
          throw new Error(`Unsupported binary operator: ${t.lexeme}`);
      }
    }
    getCompareOpCode(t) {
      switch (t.type) {
        case _.LESS:
          return xu.LTG;
        case _.GREATER:
          return xu.GTG;
        case _.LESSEQUAL:
          return xu.LEG;
        case _.GREATEREQUAL:
          return xu.GEG;
        case _.DOUBLEEQUAL:
          return xu.EQG;
        case _.NOTEQUAL:
          return xu.NEQG;
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
          n = this.builder.emitJump(xu.BRF),
          r = this.compile(t.right),
          i = this.builder.emitJump(xu.BR);
        (this.builder.markLabel(n), this.builder.emitNullary(xu.LGCB0));
        const o = { maxStackSize: 1 };
        return (
          this.builder.markLabel(i),
          { maxStackSize: Math.max(e.maxStackSize, r.maxStackSize, o.maxStackSize) }
        );
      }
      if (t.operator.type === _.OR) {
        const e = this.compile(t.left),
          n = this.builder.emitJump(xu.BRF);
        this.builder.emitNullary(xu.LGCB1);
        const r = { maxStackSize: 1 },
          i = this.builder.emitJump(xu.BR);
        this.builder.markLabel(n);
        const o = this.compile(t.right);
        return (
          this.builder.markLabel(i),
          { maxStackSize: Math.max(e.maxStackSize, r.maxStackSize, o.maxStackSize) }
        );
      }
      throw new Error(`Unsupported boolean operator: ${t.operator.lexeme}`);
    }
    visitUnaryExpr(t) {
      let e;
      switch (t.operator.type) {
        case _.NOT:
          e = xu.NOTG;
          break;
        case _.MINUS:
          e = xu.NEGG;
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
      if (!(t.callee instanceof G.Variable))
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
        n = this.builder.emitJump(xu.BRF),
        r = this.compile(t.consequent),
        i = this.builder.emitJump(xu.BR);
      this.builder.markLabel(n);
      const o = this.compile(t.alternative);
      return (
        this.builder.markLabel(i),
        { maxStackSize: Math.max(e.maxStackSize, r.maxStackSize, o.maxStackSize) }
      );
    }
    visitNoneExpr(t) {
      return (this.builder.emitNullary(xu.LGCN), { maxStackSize: 1 });
    }
    compileClosure(t, e) {
      const n = this.fromFunctionNode(t),
        { maxStackSize: r } = e(n);
      return (
        n.builder.emitNullary(xu.RETG),
        this.builder.emitUnary(xu.NEWC, n.builder.getFunctionIndex()),
        { maxStackSize: Math.max(r, 1) }
      );
    }
    visitLambdaExpr(t) {
      const e = new j.Return(t.startToken, t.endToken, t.body);
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
          this.builder.emitNullary(xu.LGCU),
          this.builder.emitNullary(xu.RETG),
          { maxStackSize: 1 }
        );
      const e = this.compile(t.value);
      return (this.builder.emitNullary(xu.RETG), e);
    }
    visitAssignStmt(t) {
      const e = this.compile(t.value);
      return (this.emitStoreSymbol(t.target.name), this.builder.emitNullary(xu.LGCU), e);
    }
    visitFunctionDefStmt(t) {
      const e = this.compileClosure(t, e => e.compileStatements(t.body));
      return (this.emitStoreSymbol(t.name), this.builder.emitNullary(xu.LGCU), e);
    }
    visitIfStmt(t) {
      const e = this.compile(t.condition),
        n = this.builder.emitJump(xu.BRF),
        r = this.compileStatements(t.body),
        i = this.builder.emitJump(xu.BR);
      this.builder.markLabel(n);
      const o = t.elseBlock
        ? this.compileStatements(t.elseBlock)
        : (() => (this.builder.emitNullary(xu.LGCU), { maxStackSize: 1 }))();
      return (
        this.builder.markLabel(i),
        { maxStackSize: Math.max(e.maxStackSize, r.maxStackSize, o.maxStackSize) }
      );
    }
    visitWhileStmt(t) {
      const e = this.builder.markLabel(),
        n = this.builder.getNextLabel();
      this.loopStack.push({ breakLabel: n, continueLabel: e, iteratorOnStack: !1 });
      const r = this.compile(t.condition);
      this.builder.emitJump(xu.BRF, n);
      const i = this.compileStatements(t.body);
      return (
        this.builder.emitNullary(xu.POPG),
        this.builder.emitJump(xu.BR, e),
        this.loopStack.pop(),
        this.builder.markLabel(n),
        this.builder.emitNullary(xu.LGCU),
        { maxStackSize: Math.max(r.maxStackSize, i.maxStackSize, 1) }
      );
    }
    visitPassStmt(t) {
      return (this.builder.emitNullary(xu.LGCU), { maxStackSize: 1 });
    }
    visitAnnAssignStmt(t) {
      throw new Error("AnnAssign not yet implemented in SVML compiler");
    }
    visitBreakStmt(t) {
      if (0 === this.loopStack.length) throw new Error("Break statement outside loop");
      const { breakLabel: e, iteratorOnStack: n } = this.loopStack[this.loopStack.length - 1];
      return (
        n && this.builder.emitNullary(xu.POPG),
        this.builder.emitJump(xu.BR, e),
        { maxStackSize: 0 }
      );
    }
    visitContinueStmt(t) {
      if (0 === this.loopStack.length) throw new Error("Continue statement outside loop");
      const { continueLabel: e } = this.loopStack[this.loopStack.length - 1];
      return (this.builder.emitJump(xu.BR, e), { maxStackSize: 0 });
    }
    visitFromImportStmt(t) {
      throw new Error("FromImport not yet implemented in SVML compiler");
    }
    visitGlobalStmt(t) {
      return (this.builder.emitNullary(xu.LGCU), { maxStackSize: 1 });
    }
    visitNonLocalStmt(t) {
      return (this.builder.emitNullary(xu.LGCU), { maxStackSize: 1 });
    }
    visitAssertStmt(t) {
      throw new Error("Assert not yet implemented in SVML compiler");
    }
    visitForStmt(t) {
      (this.compile(t.iter), this.builder.emitNullary(xu.NEWITER));
      const e = this.builder.markLabel(),
        n = this.builder.getNextLabel();
      (this.loopStack.push({ breakLabel: n, continueLabel: e, iteratorOnStack: !0 }),
        this.builder.emitJump(xu.FOR_ITER, n));
      const r = this.getOrAssignSlot(this.currentEnvironment, t.target.lexeme);
      this.builder.emitUnary(xu.STLG, r);
      const i = this.compileStatements(t.body);
      return (
        this.builder.emitNullary(xu.POPG),
        this.builder.emitJump(xu.BR, e),
        this.loopStack.pop(),
        this.builder.markLabel(n),
        this.builder.emitNullary(xu.LGCU),
        { maxStackSize: Math.max(i.maxStackSize + 2, 2) }
      );
    }
    visitFileInputStmt(t) {
      const { maxStackSize: e } = this.compileStatements(t.statements);
      return (this.builder.emitNullary(xu.RETG), { maxStackSize: Math.max(e, 1) });
    }
    compileStatements(t) {
      if (0 === t.length) return (this.builder.emitNullary(xu.LGCU), { maxStackSize: 1 });
      let e = 0;
      for (let n = 0; n < t.length; n++) {
        const r = this.compile(t[n]);
        ((e = Math.max(e, r.maxStackSize)), n < t.length - 1 && this.builder.emitNullary(xu.POPG));
      }
      return { maxStackSize: e };
    }
  }
  class Iu {
    async execute(t) {
      try {
        const e = new it(t + "\n").parse(),
          n = ku.fromProgram(e).compileProgram(e);
        return { status: "finished", output: JSON.stringify(n) };
      } catch (t) {
        return { status: "error", error: t instanceof Error ? t.message : String(t) };
      }
    }
  }
  class Lu {
    constructor(t, [e]) {
      ((this.id = "__runner_test"),
        (this.__channel = e),
        (this.engine = new Iu()),
        this.__channel.subscribe(async t => {
          if ("run" === t.type) {
            const e = await this.engine.execute(t.code);
            (console.log("Engine response:", e),
              this.__channel.send({ type: "result", output: JSON.stringify(e) }));
          }
        }));
    }
  }
  Lu.channelAttach = ["test"];
  const Ou = new (class {
    m = !0;
    C;
    v;
    P = new Map();
    M = new Map();
    j = [];
    A(t) {
      const { port1: e, port2: n } = new MessageChannel(),
        r = new o(t, e);
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
      for (let n = 0; n < this.j.length; ++n) (this.j[e] === t && ++e, (this.j[n] = this.j[n + e]));
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
        const t = new o(e, n);
        this.P.set(e, t);
      }
    }
    constructor(t, e = !1) {
      ((this.C = t), t.addEventListener("message", t => this.$(t.data)), (this.v = e));
    }
  })(self, !1);
  Ou.registerPlugin(Lu);
})();
