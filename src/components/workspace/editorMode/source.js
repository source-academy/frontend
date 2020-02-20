/**
 * Source Mode for Ace Editor
 * (Modified from javascript mode in default brace package)
 * The link to the original JavaScript mode can be found here:
 * https://github.com/ajaxorg/ace-builds/blob/master/src/mode-javascript.js
 * 
 * This is by now only a base line for future modifications
 * 
 * Changes includes:
 * 1) change code styles so that it passes tslint test
 * 2) refactor some code to ES2015 class syntax
 */

//ace/mode/doc_comment_highlight_rules
function _DocCommentHighlightRules(acequire, exports, module) {
    "use strict";
    
    const oop = acequire("../lib/oop");
    const TextHighlightRules = acequire("./text_highlight_rules").TextHighlightRules;
    
    class DocCommentHighlightRules {
        constructor() {
            this.$rules = {
                "start": [{
                    regex: "@[\\w\\d_]+",
                    token: "comment.doc.tag",
                },
                DocCommentHighlightRules.getTagRule(),
                {
                    caseInsensitive: true,
                    defaultToken: "comment.doc",
                }]
            };
        }
        static getTagRule(start) {
            return {
                regex: "\\b(?:TODO|FIXME|XXX|HACK)\\b",
                token: "comment.doc.tag.storage.type",
            };
        }
        static getStartRule(start) {
            return {
                next: start,
                regex: "\\/\\*(?=\\*)",
                token: "comment.doc",
            };
        }
        static getEndRule(start) {
            return {
                next: start,
                regex: "\\*\\/",
                token: "comment.doc",
            };
        }
    }
    
    oop.inherits(DocCommentHighlightRules, TextHighlightRules);
    exports.DocCommentHighlightRules = DocCommentHighlightRules;
}


//ace/mode/source_highlight_rules
function _SourceHighlightRules(acequire, exports, module) {
    "use strict";
    
    const oop = acequire("../lib/oop");
    const DocCommentHighlightRules = acequire("./doc_comment_highlight_rules").DocCommentHighlightRules;
    const TextHighlightRules = acequire("./text_highlight_rules").TextHighlightRules;
    const identifierRegex = "[a-zA-Z\\$_\u00a1-\uffff]-[a-zA-Z\\d\\$_\u00a1-\uffff]*";

    class SourceHighlightRules {
        constructor(options) {
            const keywordMapper = this.createKeywordMapper({
                constant: {
                    language: "null|Infinity|NaN|undefined",
                },

                constant: {
                    language: {
                        boolean: "true|false"
                    }
                },


                keyword: "const|yield|import|get|set|async|await|" +
                    "break|case|catch|continue|default|delete|do|else|finally|for|function|" +
                    "if|in|of|instanceof|new|return|switch|throw|try|typeof|let|var|while|with|debugger|" +
                    "__parent__|__count__|escape|unescape|with|__proto__|" +
                    "class|enum|extends|super|export|implements|private|public|interface|package|protected|static",

                storage: {
                    type : "const|let|var|function"
                },

                support: {
                    function : "alert"
                },

                variable: {
                    language : "Array|Boolean|Date|Function|Iterator|Number|Object|RegExp|String|Proxy|" + // Constructors
                    "Namespace|QName|XML|XMLList|" + // E4X
                    "ArrayBuffer|Float32Array|Float64Array|Int16Array|Int32Array|Int8Array|" +
                    "Uint16Array|Uint32Array|Uint8Array|Uint8ClampedArray|" +
                    "Error|EvalError|InternalError|RangeError|ReferenceError|StopIteration|" + // Errors
                    "SyntaxError|TypeError|URIError|" +
                    "decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|eval|isFinite|" + // Non-constructor functions
                    "isNaN|parseFloat|parseInt|" +
                    "JSON|Math|" + // Other
                    "this|arguments|prototype|window|document"
                },

            }, "identifier");

            const keywordBeforeRegex = "case|do|else|finally|in|instanceof|return|throw|try|typeof|yield|void";

            const escapedRegex = "\\\\(?:x[0-9a-fA-F]{2}|" + // hex
                "u[0-9a-fA-F]{4}|" + // unicode
                "u{[0-9a-fA-F]{1,6}}|" + // es6 unicode
                "[0-2][0-7]{0,2}|" + // oct
                "3[0-7][0-7]?|" + // oct
                "[4-7][0-7]?|" + //oct
                ".)";

            this.$rules = {
                function_arguments: [
                    {
                        regex: identifierRegex,
                        token: "variable.parameter",
                    }, {
                        regex: "[, ]+",
                        token: "punctuation.operator",
                    }, {
                        regex: "$",
                        token: "punctuation.operator",
                    }, {
                        next: "no_regex",
                        regex: "",
                        token: "empty",
                    }
                ],
                no_regex: [
                    DocCommentHighlightRules.getStartRule("doc-start"),
                    comments("no_regex"),
                    {
                        next: "qstring",
                        regex: "'(?=.)",
                        token: "string",
                    }, {
                        next: "qqstring",
                        regex: '"(?=.)',
                        token: "string",
                    }, {
                        regex: /0(?:[xX][0-9a-fA-F]+|[oO][0-7]+|[bB][01]+)\b/,
                        token: "constant.numeric",
                    }, {
                        regex: /(?:\d\d*(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+\b)?/,
                        token: "constant.numeric",
                    }, {
                        next: "function_arguments",
                        regex: "(" + identifierRegex + ")(\\.)(prototype)(\\.)(" + identifierRegex + ")(\\s*)(=)",
                        token: [
                            "storage.type", "punctuation.operator", "support.function",
                            "punctuation.operator", "entity.name.function", "text", "keyword.operator"
                        ],
                    }, {
                        next: "function_arguments",
                        regex: "(" + identifierRegex + ")(\\.)(" + identifierRegex + ")(\\s*)(=)(\\s*)(function)(\\s*)(\\()",
                        token: [
                            "storage.type", "punctuation.operator", "entity.name.function", "text",
                            "keyword.operator", "text", "storage.type", "text", "paren.lparen"
                        ],
                    }, {
                        next: "function_arguments",
                        regex: "(" + identifierRegex + ")(\\s*)(=)(\\s*)(function)(\\s*)(\\()",
                        token: [
                            "entity.name.function", "text", "keyword.operator", "text", "storage.type",
                            "text", "paren.lparen"
                        ],
                    }, {
                        next: "function_arguments",
                        regex: "(" + identifierRegex + ")(\\.)(" + identifierRegex + ")(\\s*)(=)(\\s*)(function)(\\s+)(\\w+)(\\s*)(\\()",
                        token: [
                            "storage.type", "punctuation.operator", "entity.name.function", "text",
                            "keyword.operator", "text",
                            "storage.type", "text", "entity.name.function", "text", "paren.lparen"
                        ],
                    }, {
                        next: "function_arguments",
                        regex: "(function)(\\s+)(" + identifierRegex + ")(\\s*)(\\()",
                        token: [
                            "storage.type", "text", "entity.name.function", "text", "paren.lparen"
                        ],
                    }, {
                        next: "function_arguments",
                        regex: "(" + identifierRegex + ")(\\s*)(:)(\\s*)(function)(\\s*)(\\()",
                        token: [
                            "entity.name.function", "text", "punctuation.operator",
                            "text", "storage.type", "text", "paren.lparen"
                        ],
                    }, {
                        next: "function_arguments",
                        regex: "(:)(\\s*)(function)(\\s*)(\\()",
                        token: [
                            "text", "text", "storage.type", "text", "paren.lparen"
                        ],
                    }, {
                        regex: "from(?=\\s*('|\"))",
                        token: "keyword",
                    }, {
                        next: "start",
                        regex: "(?:" + keywordBeforeRegex + ")\\b",
                        token: "keyword",
                    }, {
                        regex: /that\b/,
                        token: ["support.constant"],
                    }, {
                        regex: /(console)(\.)(warn|info|log|error|time|trace|timeEnd|assert)\b/,
                        token: ["storage.type", "punctuation.operator", "support.function.firebug"],
                    }, {
                        regex: identifierRegex,
                        token: keywordMapper,
                    }, {
                        next: "property",
                        regex: /[.](?![.])/,
                        token: "punctuation.operator",
                    }, {
                        regex: /=>/,
                        token: "storage.type",
                    }, {
                        next: "start",
                        regex: /--|\+\+|\.{3}|===|==|=|!==|!===|<+=?|>+=?|!|&&|\|\||\?:|[!$%&*+\-~\/^]=?/,
                        token: "keyword.operator",
                    }, {
                        next: "start",
                        regex: /[?:,;.]/,
                        token: "punctuation.operator",
                    }, {
                        next: "start",
                        regex: /[\[({]/,
                        token: "paren.lparen",
                    }, {
                        regex: /[\])}]/,
                        token: "paren.rparen",
                    }, {
                        regex: /^#!.*$/,
                        token: "comment",
                    }
                ],
                property: [{
                    regex: "\\s+",
                    token: "text",
                }, {
                    next: "function_arguments",
                    regex: "(" + identifierRegex + ")(\\.)(" + identifierRegex + ")(\\s*)(=)(\\s*)(function)(?:(\\s+)(\\w+))?(\\s*)(\\()",
                    token: [
                        "storage.type", "punctuation.operator", "entity.name.function", "text",
                        "keyword.operator", "text",
                        "storage.type", "text", "entity.name.function", "text", "paren.lparen"
                    ],
                }, {
                    regex: /[.](?![.])/,
                    token: "punctuation.operator",
                }, {
                    regex: /(s(?:h(?:ift|ow(?:Mod(?:elessDialog|alDialog)|Help))|croll(?:X|By(?:Pages|Lines)?|Y|To)?|t(?:op|rike)|i(?:n|zeToContent|debar|gnText)|ort|u(?:p|b(?:str(?:ing)?)?)|pli(?:ce|t)|e(?:nd|t(?:Re(?:sizable|questHeader)|M(?:i(?:nutes|lliseconds)|onth)|Seconds|Ho(?:tKeys|urs)|Year|Cursor|Time(?:out)?|Interval|ZOptions|Date|UTC(?:M(?:i(?:nutes|lliseconds)|onth)|Seconds|Hours|Date|FullYear)|FullYear|Active)|arch)|qrt|lice|avePreferences|mall)|h(?:ome|andleEvent)|navigate|c(?:har(?:CodeAt|At)|o(?:s|n(?:cat|textual|firm)|mpile)|eil|lear(?:Timeout|Interval)?|a(?:ptureEvents|ll)|reate(?:StyleSheet|Popup|EventObject))|t(?:o(?:GMTString|S(?:tring|ource)|U(?:TCString|pperCase)|Lo(?:caleString|werCase))|est|a(?:n|int(?:Enabled)?))|i(?:s(?:NaN|Finite)|ndexOf|talics)|d(?:isableExternalCapture|ump|etachEvent)|u(?:n(?:shift|taint|escape|watch)|pdateCommands)|j(?:oin|avaEnabled)|p(?:o(?:p|w)|ush|lugins.refresh|a(?:ddings|rse(?:Int|Float)?)|r(?:int|ompt|eference))|e(?:scape|nableExternalCapture|val|lementFromPoint|x(?:p|ec(?:Script|Command)?))|valueOf|UTC|queryCommand(?:State|Indeterm|Enabled|Value)|f(?:i(?:nd|le(?:ModifiedDate|Size|CreatedDate|UpdatedDate)|xed)|o(?:nt(?:size|color)|rward)|loor|romCharCode)|watch|l(?:ink|o(?:ad|g)|astIndexOf)|a(?:sin|nchor|cos|t(?:tachEvent|ob|an(?:2)?)|pply|lert|b(?:s|ort))|r(?:ou(?:nd|teEvents)|e(?:size(?:By|To)|calc|turnValue|place|verse|l(?:oad|ease(?:Capture|Events)))|andom)|g(?:o|et(?:ResponseHeader|M(?:i(?:nutes|lliseconds)|onth)|Se(?:conds|lection)|Hours|Year|Time(?:zoneOffset)?|Da(?:y|te)|UTC(?:M(?:i(?:nutes|lliseconds)|onth)|Seconds|Hours|Da(?:y|te)|FullYear)|FullYear|A(?:ttention|llResponseHeaders)))|m(?:in|ove(?:B(?:y|elow)|To(?:Absolute)?|Above)|ergeAttributes|a(?:tch|rgins|x))|b(?:toa|ig|o(?:ld|rderWidths)|link|ack))\b(?=\()/,
                    token: "support.function",
                }, {
                    regex: /(s(?:ub(?:stringData|mit)|plitText|e(?:t(?:NamedItem|Attribute(?:Node)?)|lect))|has(?:ChildNodes|Feature)|namedItem|c(?:l(?:ick|o(?:se|neNode))|reate(?:C(?:omment|DATASection|aption)|T(?:Head|extNode|Foot)|DocumentFragment|ProcessingInstruction|E(?:ntityReference|lement)|Attribute))|tabIndex|i(?:nsert(?:Row|Before|Cell|Data)|tem)|open|delete(?:Row|C(?:ell|aption)|T(?:Head|Foot)|Data)|focus|write(?:ln)?|a(?:dd|ppend(?:Child|Data))|re(?:set|place(?:Child|Data)|move(?:NamedItem|Child|Attribute(?:Node)?)?)|get(?:NamedItem|Element(?:sBy(?:Name|TagName|ClassName)|ById)|Attribute(?:Node)?)|blur)\b(?=\()/,
                    token: "support.function.dom",
                }, {
                    regex: /(s(?:ystemLanguage|cr(?:ipts|ollbars|een(?:X|Y|Top|Left))|t(?:yle(?:Sheets)?|atus(?:Text|bar)?)|ibling(?:Below|Above)|ource|uffixes|e(?:curity(?:Policy)?|l(?:ection|f)))|h(?:istory|ost(?:name)?|as(?:h|Focus))|y|X(?:MLDocument|SLDocument)|n(?:ext|ame(?:space(?:s|URI)|Prop))|M(?:IN_VALUE|AX_VALUE)|c(?:haracterSet|o(?:n(?:structor|trollers)|okieEnabled|lorDepth|mp(?:onents|lete))|urrent|puClass|l(?:i(?:p(?:boardData)?|entInformation)|osed|asses)|alle(?:e|r)|rypto)|t(?:o(?:olbar|p)|ext(?:Transform|Indent|Decoration|Align)|ags)|SQRT(?:1_2|2)|i(?:n(?:ner(?:Height|Width)|put)|ds|gnoreCase)|zIndex|o(?:scpu|n(?:readystatechange|Line)|uter(?:Height|Width)|p(?:sProfile|ener)|ffscreenBuffering)|NEGATIVE_INFINITY|d(?:i(?:splay|alog(?:Height|Top|Width|Left|Arguments)|rectories)|e(?:scription|fault(?:Status|Ch(?:ecked|arset)|View)))|u(?:ser(?:Profile|Language|Agent)|n(?:iqueID|defined)|pdateInterval)|_content|p(?:ixelDepth|ort|ersonalbar|kcs11|l(?:ugins|atform)|a(?:thname|dding(?:Right|Bottom|Top|Left)|rent(?:Window|Layer)?|ge(?:X(?:Offset)?|Y(?:Offset)?))|r(?:o(?:to(?:col|type)|duct(?:Sub)?|mpter)|e(?:vious|fix)))|e(?:n(?:coding|abledPlugin)|x(?:ternal|pando)|mbeds)|v(?:isibility|endor(?:Sub)?|Linkcolor)|URLUnencoded|P(?:I|OSITIVE_INFINITY)|f(?:ilename|o(?:nt(?:Size|Family|Weight)|rmName)|rame(?:s|Element)|gColor)|E|whiteSpace|l(?:i(?:stStyleType|n(?:eHeight|kColor))|o(?:ca(?:tion(?:bar)?|lName)|wsrc)|e(?:ngth|ft(?:Context)?)|a(?:st(?:M(?:odified|atch)|Index|Paren)|yer(?:s|X)|nguage))|a(?:pp(?:MinorVersion|Name|Co(?:deName|re)|Version)|vail(?:Height|Top|Width|Left)|ll|r(?:ity|guments)|Linkcolor|bove)|r(?:ight(?:Context)?|e(?:sponse(?:XML|Text)|adyState))|global|x|m(?:imeTypes|ultiline|enubar|argin(?:Right|Bottom|Top|Left))|L(?:N(?:10|2)|OG(?:10E|2E))|b(?:o(?:ttom|rder(?:Width|RightWidth|BottomWidth|Style|Color|TopWidth|LeftWidth))|ufferDepth|elow|ackground(?:Color|Image)))\b/,
                    token: "support.constant",
                }, {
                    regex: identifierRegex,
                    token: "identifier",
                }, {
                    next: "no_regex",
                    regex: "",
                    token: "empty",
                }
                ],
                qqstring: [
                    {
                        regex: escapedRegex,
                        token: "constant.language.escape",
                    }, {
                        consumeLineEnd: true,
                        regex: "\\\\$",
                        token: "string",
                    }, {
                        next: "no_regex",
                        regex: '"|$',
                        token: "string",
                    }, {
                        defaultToken: "string"
                    }
                ],
                qstring: [
                    {
                        regex: escapedRegex,
                        token: "constant.language.escape",
                    }, {
                        consumeLineEnd: true,
                        regex: "\\\\$",
                        token: "string",
                    }, {
                        next: "no_regex",
                        regex: "'|$",
                        token: "string",
                    }, {
                        defaultToken: "string"
                    }
                ],
                regex: [
                    {
                        regex: "\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)",
                        token: "regexp.keyword.operator",
                    }, {
                        next: "no_regex",
                        regex: "/[sxngimy]*",
                        token: "string.regexp",
                    }, {
                        regex: /\{\d+\b,?\d*\}[+*]|[+*$^?][+*]|[$^][?]|\?{3,}/,
                        token: "invalid",
                    }, {
                        regex: /\(\?[:=!]|\)|\{\d+\b,?\d*\}|[+*]\?|[()$^+*?.]/,
                        token: "constant.language.escape",
                    }, {
                        regex: /\|/,
                        token: "constant.language.delimiter",
                    }, {
                        next: "regex_character_class",
                        regex: /\[\^?/,
                        token: "constant.language.escape",
                    }, {
                        next: "no_regex",
                        regex: "$",
                        token: "empty",
                    }, {
                        defaultToken: "string.regexp"
                    }
                ],
                regex_character_class: [
                    {
                        regex: "\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)",
                        token: "regexp.charclass.keyword.operator",
                    }, {
                        next: "regex",
                        regex: "]",
                        token: "constant.language.escape",
                    }, {
                        regex: "-",
                        token: "constant.language.escape",
                    }, {
                        next: "no_regex",
                        regex: "$",
                        token: "empty",
                    }, {
                        defaultToken: "string.regexp.charachterclass"
                    }
                ],
                start: [
                    DocCommentHighlightRules.getStartRule("doc-start"),
                    comments("start"),
                    {
                        next: "regex",
                        regex: "\\/",
                        token: "string.regexp",
                    }, {
                        next: "start",
                        regex: "\\s+|^$",
                        token: "text",
                    }, {
                        next: "no_regex",
                        regex: "",
                        token: "empty",
                    }
                ],
            };
            if (!options || !options.noES6) {
                this.$rules.no_regex.unshift({
                    nextState: "start",
                    onMatch: (val, state, stack) => {
                        this.next = val === "{" ? this.nextState : "";
                        if (val === "{" && stack.length) {
                            stack.unshift("start", state);
                        }
                        else if (val === "}" && stack.length) {
                            stack.shift();
                            this.next = stack.shift();
                            if (this.next.indexOf("string") !== -1 || this.next.indexOf("jsx") !== -1) {
                                return "paren.quasi.end";
                            }
                        }
                        return val === "{" ? "paren.lparen" : "paren.rparen";
                    },
                    regex: "[{}]",
                }, {
                    push: [{
                        regex: escapedRegex,
                        token: "constant.language.escape",
                    }, {
                        push: "start",
                        regex: /\${/,
                        token: "paren.quasi.start",
                    }, {
                        next: "pop",
                        regex: /`/,
                        token: "string.quasi.end",
                    }, {
                        defaultToken: "string.quasi"
                    }],
                    regex: /`/,
                    token: "string.quasi.start",
                });
                if (!options || options.jsx !== false) {
                    JSX.call(this);
                }
            }
            this.embedRules(DocCommentHighlightRules, "doc-", [DocCommentHighlightRules.getEndRule("no_regex")]);
            this.normalizeRules();
        }
    }
    
    oop.inherits(SourceHighlightRules, TextHighlightRules);
    
    function JSX() {
        const tagRegex = identifierRegex.replace("\\d", "\\d\\-");
        const jsxTag = {
            next: "jsxAttributes",
            nextState: "jsx",
            onMatch : (val, state, stack) => {
                let offset = val.charAt(1) === "/" ? 2 : 1;
                if (offset === 1) {
                    if (state !== this.nextState) {
                        stack.unshift(this.next, this.nextState, 0);
                    }
                    else {
                        stack.unshift(this.next);
                    }
                    stack[2]++;
                } else if (offset === 2) {
                    if (state === this.nextState) {
                        stack[1]--;
                        if (!stack[1] || stack[1] < 0) {
                            stack.shift();
                            stack.shift();
                        }
                    }
                }
                return [{
                    type: "meta.tag.punctuation." + (offset === 1 ? "" : "end-") + "tag-open.xml",
                    value: val.slice(0, offset)
                }, {
                    type: "meta.tag.tag-name.xml",
                    value: val.substr(offset)
                }];
            },
            regex : "</?" + tagRegex + "",
        };
        this.$rules.start.unshift(jsxTag);
        const jsxJsRule = {
            push: "start",
            regex: "{",
            token: "paren.quasi.start",
        };
        this.$rules.jsx = [
            jsxJsRule,
            jsxTag,
            {include : "reference"},
            {defaultToken: "string"}
        ];
        this.$rules.jsxAttributes = [{
            nextState: "jsx",
            onMatch : (value, currentState, stack) => {
                if (currentState === stack[0]) {
                    stack.shift();
                }
                if (value.length === 2) {
                    if (stack[0] === this.nextState) {
                        stack[1]--;
                    }
                    if (!stack[1] || stack[1] < 0) {
                        stack.splice(0, 2);
                    }
                }
                this.next = stack[0] || "start";
                return [{type: this.token, value: value}];
            },
            regex : "/?>",
            token : "meta.tag.punctuation.tag-close.xml",
        },
        jsxJsRule,
        comments("jsxAttributes"),
        {
            regex : tagRegex,
            token : "entity.other.attribute-name.xml",
        }, {
            regex : "=",
            token : "keyword.operator.attribute-equals.xml",
        }, {
            regex : "\\s+",
            token : "text.tag-whitespace.xml",
        }, {
            push : [
                {token : "string.attribute-value.xml", regex: "'", next: "pop"},
                {include : "reference"},
                {defaultToken : "string.attribute-value.xml"}
            ],
            regex : "'",
            stateName : "jsx_attr_q",
            token : "string.attribute-value.xml",
            
        }, {            
            push : [
                {token : "string.attribute-value.xml", regex: '"', next: "pop"},
                {include : "reference"},
                {defaultToken : "string.attribute-value.xml"}
            ],
            regex : '"',
            stateName : "jsx_attr_qq",
            token : "string.attribute-value.xml",
        },
        jsxTag
        ];
        this.$rules.reference = [{
            regex : "(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)",
            token : "constant.language.escape.reference.xml",
        }];
    }
    
    function comments(next) {
        return [
            {
                next: [
                    DocCommentHighlightRules.getTagRule(),
                    {token : "comment", regex : "\\*\\/", next : next || "pop"},
                    {defaultToken : "comment", caseInsensitive: true}
                ],
                regex : /\/\*/,
                token : "comment", // multi line comment
                
            }, {
                next: [
                    DocCommentHighlightRules.getTagRule(),
                    {token : "comment", regex : "$|^", next : next || "pop"},
                    {defaultToken : "comment", caseInsensitive: true}
                ],
                regex : "\\/\\/",
                token : "comment",
            }
        ];
    }
    exports.SourceHighlightRules = SourceHighlightRules;
}



function _Mode(acequire, exports, module) {
    "use strict";

    var oop = acequire("../lib/oop");
    var TextMode = acequire("./text").Mode;
    var JavaScriptHighlightRules = acequire("./javascript_highlight_rules").JavaScriptHighlightRules;
    var MatchingBraceOutdent = acequire("./matching_brace_outdent").MatchingBraceOutdent;
    var WorkerClient = acequire("../worker/worker_client").WorkerClient;
    var CstyleBehaviour = acequire("./behaviour/cstyle").CstyleBehaviour;
    var CStyleFoldMode = acequire("./folding/cstyle").FoldMode;

    class Mode {
        constructor() {
            this.HighlightRules = JavaScriptHighlightRules;
            this.$outdent = new MatchingBraceOutdent();
            this.$behaviour = new CstyleBehaviour();
            this.foldingRules = new CStyleFoldMode();
        }
    }
    oop.inherits(Mode, TextMode);

    (function() {

        this.lineCommentStart = "//";
        this.blockComment = {start: "/*", end: "*/"};
        this.$quotes = {'"': '"', "'": "'", "`": "`"};

        this.getNextLineIndent = function(state, line, tab) {
            var indent = this.$getIndent(line);

            var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
            var tokens = tokenizedLine.tokens;
            var endState = tokenizedLine.state;
            var match = null;

            if (tokens.length && tokens[tokens.length-1].type === "comment") {
                return indent;
            }

            if (state === "start" || state === "no_regex") {
                match = line.match(/^.*(?:\bcase\b.*:|[\{\(\[])\s*$/);
                if (match) {
                    indent += tab;
                }
            } else if (state === "doc-start") {
                if (endState === "start" || endState === "no_regex") {
                    return "";
                }
                match = line.match(/^\s*(\/?)\*/);
                if (match) {
                    if (match[1]) {
                        indent += " ";
                    }
                    indent += "* ";
                }
            }

            return indent;
        };

        this.checkOutdent = function(state, line, input) {
            return this.$outdent.checkOutdent(line, input);
        };

        this.autoOutdent = function(state, doc, row) {
            this.$outdent.autoOutdent(doc, row);
        };

        this.createWorker = function(session) {
            var worker = new WorkerClient(["ace"], require("brace/worker/javascript"), "JavaScriptWorker");
            worker.attachToDocument(session.getDocument());

            worker.on("annotate", function(results) {
                session.setAnnotations(results.data);
            });

            worker.on("terminate", function() {
                session.clearAnnotations();
            });

            return worker;
        };

        this.$id = "ace/mode/source";
    }).call(Mode.prototype);

    exports.Mode = Mode;
    }
    

ace.define("ace/mode/doc_comment_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], _DocCommentHighlightRules);
ace.define("ace/mode/source_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/doc_comment_highlight_rules","ace/mode/text_highlight_rules"], _SourceHighlightRules);
ace.define("ace/mode/source",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/source_highlight_rules","ace/mode/matching_brace_outdent","ace/worker/worker_client","ace/mode/behaviour/cstyle","ace/mode/folding/cstyle"], _Mode);