/* eslint-disable */
import * as ace from 'ace-builds/src-noconflict/ace';
import { Variant } from 'js-slang/dist/types';

export function HighlightRulesSelector_native(
  id,
  variant = Variant.DEFAULT,
  external = 'NONE',
  externalLibraries = []
) {
  // @ts-ignore
  function _SourceHighlightRules(acequire, exports, module) {
    const oop = acequire('../lib/oop');
    const DocCommentHighlightRules = acequire(
      './doc_comment_highlight_rules'
    ).DocCommentHighlightRules;
    const TextHighlightRules = acequire('./text_highlight_rules').TextHighlightRules;
    const identifierRegex = '[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*';
    const chapter = variant === Variant.DEFAULT ? id.toString() : id.toString() + '_' + variant;

    // Currently there are no builtin libraries for NativeJS
    // const builtin_lib = SourceDocumentation.builtins[chapter];
    const builtin_lib = null;

    function addFromBuiltinLibrary(meta) {
      if (builtin_lib === null) {
        return '';
      }
      let func = '';
      for (const name in builtin_lib) {
        if (builtin_lib[name]['meta'] === meta) {
          func += '|' + name;
        }
      }
      return func;
    }
    function addFromExternalLibrary(meta) {
      if (externalLibraries === null) {
        return '';
      }
      let func = '';
      externalLibraries.forEach(node => {
        if (node.meta === meta) {
          func += '|' + node.caption;
        }
      });
      return func;
    }
    function getAllNames(meta) {
      const concat = addFromBuiltinLibrary(meta) + addFromExternalLibrary(meta);
      return concat.substr(1);
    }
    const ChapterKeywordSelector = () => {
      let output = '';
      return output;
    };
    const ChapterForbbidenWordSelector = () => {
      return 'window|document';
    };
    // @ts-ignore
    const SourceHighlightRules = function (options) {
      // @ts-ignore

      // Copied from https://github.com/ajaxorg/ace-builds/blob/master/src/mode-javascript.js
      const keywordMapper = this.createKeywordMapper(
        {
          'variable.language':
            // Purple: for disallowed words
            'implements|interface|package|private|protected|public|static|' +
            ChapterForbbidenWordSelector(), // Pseudo
          keyword:
            // Orange: for normal keywords
            'Array|Boolean|Date|Function|Iterator|Number|Object|RegExp|String|Proxy|' + // Constructors
            'Namespace|QName|XML|XMLList|' + // E4X
            'ArrayBuffer|Float32Array|Float64Array|Int16Array|Int32Array|Int8Array|' +
            'Uint16Array|Uint32Array|Uint8Array|Uint8ClampedArray|' +
            'Error|EvalError|InternalError|RangeError|ReferenceError|StopIteration|' + // Errors
            'SyntaxError|TypeError|URIError|' +
            'decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|isFinite|' + // Non-constructor functions
            'isNaN|parseFloat|parseInt|' +
            'Math|' +
            'this|arguments|prototype' +
            'yield|get|set|async|await|' +
            'enum|eval|' +
            'true|false|' +
            'null|Infinity|NaN|undefined|' +
            'break|case|continue|default|delete|do|else|finally|for|' +
            'if|in|of|instanceof|new|return|switch|throw|try|typeof|while|with|debugger|' +
            'escape|with|' +
            'extends|super|export',
          'storage.type':
            // Yellow: for declarations
            'const|let|var|function|import|class|catch',
          'support.function': 'alert'
          // "constant.language.boolean": "true|false"
        },
        'identifier'
      );
      const keywordBeforeRegex =
        'case|do|else|finally|in|instanceof|return|throw|try|typeof|yield|void';
      const escapedRegex =
        '\\\\(?:x[0-9a-fA-F]{2}|' + // hex
        'u[0-9a-fA-F]{4}|' + // unicode
        'u{[0-9a-fA-F]{1,6}}|' + // es6 unicode
        '[0-2][0-7]{0,2}|' + // oct
        '3[0-7][0-7]?|' + // oct
        '[4-7][0-7]?|' + //oct
        '.)';
      // @ts-ignore
      this.$rules = {
        no_regex: [
          DocCommentHighlightRules.getStartRule('doc-start'),
          comments('no_regex'),
          {
            token: 'string',
            regex: "'(?=.)",
            next: 'qstring'
          },
          {
            token: 'string',
            regex: '"(?=.)',
            next: 'qqstring'
          },
          {
            token: 'constant.numeric',
            regex: /0(?:[xX][0-9a-fA-F]+|[oO][0-7]+|[bB][01]+)\b/
          },
          {
            token: 'constant.numeric',
            regex: /(?:\d\d*(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+\b)?/
          },
          {
            token: [
              'storage.type',
              'punctuation.operator',
              'support.function',
              'punctuation.operator',
              'entity.name.function',
              'text',
              'keyword.operator'
            ],
            regex:
              '(' + identifierRegex + ')(\\.)(prototype)(\\.)(' + identifierRegex + ')(\\s*)(=)',
            next: 'function_arguments'
          },
          {
            token: [
              'storage.type',
              'punctuation.operator',
              'entity.name.function',
              'text',
              'keyword.operator',
              'text',
              'storage.type',
              'text',
              'paren.lparen'
            ],
            regex:
              '(' +
              identifierRegex +
              ')(\\.)(' +
              identifierRegex +
              ')(\\s*)(=)(\\s*)(function)(\\s*)(\\()',
            next: 'function_arguments'
          },
          {
            token: [
              'entity.name.function',
              'text',
              'keyword.operator',
              'text',
              'storage.type',
              'text',
              'paren.lparen'
            ],
            regex: '(' + identifierRegex + ')(\\s*)(=)(\\s*)(function)(\\s*)(\\()',
            next: 'function_arguments'
          },
          {
            token: [
              'storage.type',
              'punctuation.operator',
              'entity.name.function',
              'text',
              'keyword.operator',
              'text',
              'storage.type',
              'text',
              'entity.name.function',
              'text',
              'paren.lparen'
            ],
            regex:
              '(' +
              identifierRegex +
              ')(\\.)(' +
              identifierRegex +
              ')(\\s*)(=)(\\s*)(function)(\\s+)(\\w+)(\\s*)(\\()',
            next: 'function_arguments'
          },
          {
            token: ['storage.type', 'text', 'entity.name.function', 'text', 'paren.lparen'],
            regex: '(function)(\\s+)(' + identifierRegex + ')(\\s*)(\\()',
            next: 'function_arguments'
          },
          {
            token: [
              'entity.name.function',
              'text',
              'punctuation.operator',
              'text',
              'storage.type',
              'text',
              'paren.lparen'
            ],
            regex: '(' + identifierRegex + ')(\\s*)(:)(\\s*)(function)(\\s*)(\\()',
            next: 'function_arguments'
          },
          {
            token: ['text', 'text', 'storage.type', 'text', 'paren.lparen'],
            regex: '(:)(\\s*)(function)(\\s*)(\\()',
            next: 'function_arguments'
          },
          {
            token: 'keyword',
            regex: 'from(?=\\s*(\'|"))'
          },
          {
            token: 'keyword',
            regex: '(?:' + keywordBeforeRegex + ')\\b',
            next: 'start'
          },
          {
            token: ['support.constant'],
            regex: /that\b/
          },
          {
            token: keywordMapper,
            regex: identifierRegex
          },
          {
            token: 'variable.language',
            regex: /[.](?![.])/,
            next: 'property'
          },
          {
            token: 'storage.type',
            regex: /=>/
          },
          {
            token: 'keyword.operator',
            regex: /--|\+\+|\.{3}|===|==|=|!=|!==|<+=?|>+=?|!|&&|\|\||\?:|[!$%&*+\-~\/^]=?/,
            next: 'start'
          },
          {
            token: 'punctuation.operator',
            regex: /[?:,;.]/,
            next: 'start'
          },
          {
            token: 'paren.lparen',
            regex: /[\[({]/,
            next: 'start'
          },
          {
            token: 'paren.rparen',
            regex: /[\])}]/
          },
          {
            token: 'comment',
            regex: /^#!.*$/
          }
        ],
        property: [
          {
            token: 'text',
            regex: '\\s+'
          },
          {
            token: [
              'storage.type',
              'punctuation.operator',
              'entity.name.function',
              'text',
              'keyword.operator',
              'text',
              'storage.type',
              'text',
              'entity.name.function',
              'text',
              'paren.lparen'
            ],
            regex:
              '(' +
              identifierRegex +
              ')(\\.)(' +
              identifierRegex +
              ')(\\s*)(=)(\\s*)(function)(?:(\\s+)(\\w+))?(\\s*)(\\()',
            next: 'function_arguments'
          },
          {
            token: 'punctuation.operator',
            regex: /[.](?![.])/
          },
          {
            token: 'variable.language',
            regex:
              /(s(?:h(?:ift|ow(?:Mod(?:elessDialog|alDialog)|Help))|croll(?:X|By(?:Pages|Lines)?|Y|To)?|t(?:op|rike)|i(?:n|zeToContent|debar|gnText)|ort|u(?:p|b(?:str(?:ing)?)?)|pli(?:ce|t)|e(?:nd|t(?:Re(?:sizable|questHeader)|M(?:i(?:nutes|lliseconds)|onth)|Seconds|Ho(?:tKeys|urs)|Year|Cursor|Time(?:out)?|Interval|ZOptions|Date|UTC(?:M(?:i(?:nutes|lliseconds)|onth)|Seconds|Hours|Date|FullYear)|FullYear|Active)|arch)|qrt|lice|avePreferences|mall)|h(?:ome|andleEvent)|navigate|c(?:har(?:CodeAt|At)|o(?:s|n(?:cat|textual|firm)|mpile)|eil|lear(?:Timeout|Interval)?|a(?:ptureEvents|ll)|reate(?:StyleSheet|Popup|EventObject))|t(?:o(?:GMTString|S(?:tring|ource)|U(?:TCString|pperCase)|Lo(?:caleString|werCase))|est|a(?:n|int(?:Enabled)?))|i(?:s(?:NaN|Finite)|ndexOf|talics)|d(?:isableExternalCapture|ump|etachEvent)|u(?:n(?:shift|taint|escape|watch)|pdateCommands)|j(?:oin|avaEnabled)|p(?:o(?:p|w)|ush|lugins.refresh|a(?:ddings|rse(?:Int|Float)?)|r(?:int|ompt|eference))|e(?:scape|nableExternalCapture|val|lementFromPoint|x(?:p|ec(?:Script|Command)?))|valueOf|UTC|queryCommand(?:State|Indeterm|Enabled|Value)|f(?:i(?:nd|le(?:ModifiedDate|Size|CreatedDate|UpdatedDate)|xed)|o(?:nt(?:size|color)|rward)|loor|romCharCode)|watch|l(?:ink|o(?:ad|g)|astIndexOf)|a(?:sin|nchor|cos|t(?:tachEvent|ob|an(?:2)?)|pply|lert|b(?:s|ort))|r(?:ou(?:nd|teEvents)|e(?:size(?:By|To)|calc|turnValue|place|verse|l(?:oad|ease(?:Capture|Events)))|andom)|g(?:o|et(?:ResponseHeader|M(?:i(?:nutes|lliseconds)|onth)|Se(?:conds|lection)|Hours|Year|Time(?:zoneOffset)?|Da(?:y|te)|UTC(?:M(?:i(?:nutes|lliseconds)|onth)|Seconds|Hours|Da(?:y|te)|FullYear)|FullYear|A(?:ttention|llResponseHeaders)))|m(?:in|ove(?:B(?:y|elow)|To(?:Absolute)?|Above)|ergeAttributes|a(?:tch|rgins|x))|b(?:toa|ig|o(?:ld|rderWidths)|link|ack))\b(?=\()/
          },
          {
            token: 'variable.language.dom',
            regex:
              /(s(?:ub(?:stringData|mit)|plitText|e(?:t(?:NamedItem|Attribute(?:Node)?)|lect))|has(?:ChildNodes|Feature)|namedItem|c(?:l(?:ick|o(?:se|neNode))|reate(?:C(?:omment|DATASection|aption)|T(?:Head|extNode|Foot)|DocumentFragment|ProcessingInstruction|E(?:ntityReference|lement)|Attribute))|tabIndex|i(?:nsert(?:Row|Before|Cell|Data)|tem)|open|delete(?:Row|C(?:ell|aption)|T(?:Head|Foot)|Data)|focus|write(?:ln)?|a(?:dd|ppend(?:Child|Data))|re(?:set|place(?:Child|Data)|move(?:NamedItem|Child|Attribute(?:Node)?)?)|get(?:NamedItem|Element(?:sBy(?:Name|TagName|ClassName)|ById)|Attribute(?:Node)?)|blur)\b(?=\()/
          },
          {
            token: 'support.constant',
            regex:
              /(s(?:ystemLanguage|cr(?:ipts|ollbars|een(?:X|Y|Top|Left))|t(?:yle(?:Sheets)?|atus(?:Text|bar)?)|ibling(?:Below|Above)|ource|uffixes|e(?:curity(?:Policy)?|l(?:ection|f)))|h(?:istory|ost(?:name)?|as(?:h|Focus))|y|X(?:MLDocument|SLDocument)|n(?:ext|ame(?:space(?:s|URI)|Prop))|M(?:IN_VALUE|AX_VALUE)|c(?:haracterSet|o(?:n(?:structor|trollers)|okieEnabled|lorDepth|mp(?:onents|lete))|urrent|puClass|l(?:i(?:p(?:boardData)?|entInformation)|osed|asses)|alle(?:e|r)|rypto)|t(?:o(?:olbar|p)|ext(?:Transform|Indent|Decoration|Align)|ags)|SQRT(?:1_2|2)|i(?:n(?:ner(?:Height|Width)|put)|ds|gnoreCase)|zIndex|o(?:scpu|n(?:readystatechange|Line)|uter(?:Height|Width)|p(?:sProfile|ener)|ffscreenBuffering)|NEGATIVE_INFINITY|d(?:i(?:splay|alog(?:Height|Top|Width|Left|Arguments)|rectories)|e(?:scription|fault(?:Status|Ch(?:ecked|arset)|View)))|u(?:ser(?:Profile|Language|Agent)|n(?:iqueID|defined)|pdateInterval)|_content|p(?:ixelDepth|ort|ersonalbar|kcs11|l(?:ugins|atform)|a(?:thname|dding(?:Right|Bottom|Top|Left)|rent(?:Window|Layer)?|ge(?:X(?:Offset)?|Y(?:Offset)?))|r(?:o(?:to(?:col|type)|duct(?:Sub)?|mpter)|e(?:vious|fix)))|e(?:n(?:coding|abledPlugin)|x(?:ternal|pando)|mbeds)|v(?:isibility|endor(?:Sub)?|Linkcolor)|URLUnencoded|P(?:I|OSITIVE_INFINITY)|f(?:ilename|o(?:nt(?:Size|Family|Weight)|rmName)|rame(?:s|Element)|gColor)|E|whiteSpace|l(?:i(?:stStyleType|n(?:eHeight|kColor))|o(?:ca(?:tion(?:bar)?|lName)|wsrc)|e(?:ngth|ft(?:Context)?)|a(?:st(?:M(?:odified|atch)|Index|Paren)|yer(?:s|X)|nguage))|a(?:pp(?:MinorVersion|Name|Co(?:deName|re)|Version)|vail(?:Height|Top|Width|Left)|ll|r(?:ity|guments)|Linkcolor|bove)|r(?:ight(?:Context)?|e(?:sponse(?:XML|Text)|adyState))|global|x|m(?:imeTypes|ultiline|enubar|argin(?:Right|Bottom|Top|Left))|L(?:N(?:10|2)|OG(?:10E|2E))|b(?:o(?:ttom|rder(?:Width|RightWidth|BottomWidth|Style|Color|TopWidth|LeftWidth))|ufferDepth|elow|ackground(?:Color|Image)))\b/
          },
          {
            token: 'identifier',
            regex: identifierRegex
          },
          {
            regex: '',
            token: 'empty',
            next: 'no_regex'
          }
        ],
        start: [
          DocCommentHighlightRules.getStartRule('doc-start'),
          comments('start'),
          {
            token: 'string.regexp',
            regex: '\\/',
            next: 'regex'
          },
          {
            token: 'text',
            regex: '\\s+|^$',
            next: 'start'
          },
          {
            token: 'empty',
            regex: '',
            next: 'no_regex'
          }
        ],
        regex: [
          {
            token: 'regexp.keyword.operator',
            regex: '\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)'
          },
          {
            token: 'string.regexp',
            regex: '/[sxngimy]*',
            next: 'no_regex'
          },
          {
            token: 'invalid',
            regex: /\{\d+\b,?\d*\}[+*]|[+*$^?][+*]|[$^][?]|\?{3,}/
          },
          {
            token: 'constant.language.escape',
            regex: /\(\?[:=!]|\)|\{\d+\b,?\d*\}|[+*]\?|[()$^+*?.]/
          },
          {
            token: 'constant.language.delimiter',
            regex: /\|/
          },
          {
            token: 'constant.language.escape',
            regex: /\[\^?/,
            next: 'regex_character_class'
          },
          {
            token: 'empty',
            regex: '$',
            next: 'no_regex'
          },
          {
            defaultToken: 'string.regexp'
          }
        ],
        regex_character_class: [
          {
            token: 'regexp.charclass.keyword.operator',
            regex: '\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)'
          },
          {
            token: 'constant.language.escape',
            regex: ']',
            next: 'regex'
          },
          {
            token: 'constant.language.escape',
            regex: '-'
          },
          {
            token: 'empty',
            regex: '$',
            next: 'no_regex'
          },
          {
            defaultToken: 'string.regexp.charachterclass'
          }
        ],
        function_arguments: [
          {
            token: 'variable.parameter',
            regex: identifierRegex
          },
          {
            token: 'punctuation.operator',
            regex: '[, ]+'
          },
          {
            token: 'punctuation.operator',
            regex: '$'
          },
          {
            token: 'empty',
            regex: '',
            next: 'no_regex'
          }
        ],
        qqstring: [
          {
            token: 'constant.language.escape',
            regex: escapedRegex
          },
          {
            token: 'string',
            regex: '\\\\$',
            consumeLineEnd: true
          },
          {
            token: 'string',
            regex: '"|$',
            next: 'no_regex'
          },
          {
            defaultToken: 'string'
          }
        ],
        qstring: [
          {
            token: 'constant.language.escape',
            regex: escapedRegex
          },
          {
            token: 'string',
            regex: '\\\\$',
            consumeLineEnd: true
          },
          {
            token: 'string',
            regex: "'|$",
            next: 'no_regex'
          },
          {
            defaultToken: 'string'
          }
        ]
      };
      if (!options || !options.noES6) {
        // @ts-ignore
        this.$rules.no_regex.unshift(
          {
            regex: '[{}]',
            // @ts-ignore
            onMatch: function (val, state, stack) {
              this.next = val == '{' ? this.nextState : '';
              if (val == '{' && stack.length) {
                stack.unshift('start', state);
              } else if (val == '}' && stack.length) {
                stack.shift();
                this.next = stack.shift();
                if (this.next.indexOf('string') != -1 || this.next.indexOf('jsx') != -1)
                  return 'paren.quasi.end';
              }
              return val == '{' ? 'paren.lparen' : 'paren.rparen';
            },
            nextState: 'start'
          },
          {
            token: 'string.quasi.start',
            regex: /`/,
            push: [
              {
                token: 'constant.language.escape',
                regex: escapedRegex
              },
              {
                token: 'paren.quasi.start',
                regex: /\${/,
                push: 'start'
              },
              {
                token: 'string.quasi.end',
                regex: /`/,
                next: 'pop'
              },
              {
                defaultToken: 'string.quasi'
              }
            ]
          }
        );
        if (!options || options.jsx != false)
          // @ts-ignore
          JSX.call(this);
      }
      // @ts-ignore
      this.embedRules(DocCommentHighlightRules, 'doc-', [
        DocCommentHighlightRules.getEndRule('no_regex')
      ]);
      // @ts-ignore
      this.normalizeRules();
    };
    oop.inherits(SourceHighlightRules, TextHighlightRules);
    function JSX() {
      const tagRegex = identifierRegex.replace('\\d', '\\d\\-');
      const jsxTag = {
        // @ts-ignore
        onMatch: function (val, state, stack) {
          const offset = val.charAt(1) == '/' ? 2 : 1;
          if (offset == 1) {
            if (state != this.nextState) stack.unshift(this.next, this.nextState, 0);
            else stack.unshift(this.next);
            stack[2]++;
          } else if (offset == 2) {
            if (state == this.nextState) {
              stack[1]--;
              if (!stack[1] || stack[1] < 0) {
                stack.shift();
                stack.shift();
              }
            }
          }
          return [
            {
              type: 'meta.tag.punctuation.' + (offset == 1 ? '' : 'end-') + 'tag-open.xml',
              value: val.slice(0, offset)
            },
            {
              type: 'meta.tag.tag-name.xml',
              value: val.substr(offset)
            }
          ];
        },
        regex: '</?' + tagRegex + '',
        next: 'jsxAttributes',
        nextState: 'jsx'
      };
      // @ts-ignore
      this.$rules.start.unshift(jsxTag);
      const jsxJsRule = {
        regex: '{',
        token: 'paren.quasi.start',
        push: 'start'
      };
      // @ts-ignore
      this.$rules.jsx = [jsxJsRule, jsxTag, { include: 'reference' }, { defaultToken: 'string' }];
      // @ts-ignore
      this.$rules.jsxAttributes = [
        {
          token: 'meta.tag.punctuation.tag-close.xml',
          regex: '/?>',
          // @ts-ignore
          onMatch: function (value, currentState, stack) {
            if (currentState == stack[0]) stack.shift();
            if (value.length == 2) {
              if (stack[0] == this.nextState) stack[1]--;
              if (!stack[1] || stack[1] < 0) {
                stack.splice(0, 2);
              }
            }
            // @ts-ignore
            this.next = stack[0] || 'start';
            return [{ type: this.token, value: value }];
          },
          nextState: 'jsx'
        },
        jsxJsRule,
        comments('jsxAttributes'),
        {
          token: 'entity.other.attribute-name.xml',
          regex: tagRegex
        },
        {
          token: 'keyword.operator.attribute-equals.xml',
          regex: '='
        },
        {
          token: 'text.tag-whitespace.xml',
          regex: '\\s+'
        },
        {
          token: 'string.attribute-value.xml',
          regex: "'",
          stateName: 'jsx_attr_q',
          push: [
            { token: 'string.attribute-value.xml', regex: "'", next: 'pop' },
            { include: 'reference' },
            { defaultToken: 'string.attribute-value.xml' }
          ]
        },
        {
          token: 'string.attribute-value.xml',
          regex: '"',
          stateName: 'jsx_attr_qq',
          push: [
            { token: 'string.attribute-value.xml', regex: '"', next: 'pop' },
            { include: 'reference' },
            { defaultToken: 'string.attribute-value.xml' }
          ]
        },
        jsxTag
      ];
      // @ts-ignore
      this.$rules.reference = [
        {
          token: 'constant.language.escape.reference.xml',
          regex: '(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)'
        }
      ];
    }
    // @ts-ignore
    function comments(next) {
      return [
        {
          token: 'comment',
          regex: /\/\*/,
          next: [
            DocCommentHighlightRules.getTagRule(),
            { token: 'comment', regex: '\\*\\/', next: next || 'pop' },
            { defaultToken: 'comment', caseInsensitive: true }
          ]
        },
        {
          token: 'comment',
          regex: '\\/\\/',
          next: [
            DocCommentHighlightRules.getTagRule(),
            { token: 'comment', regex: '$|^', next: next || 'pop' },
            { defaultToken: 'comment', caseInsensitive: true }
          ]
        }
      ];
    }
    exports.SourceHighlightRules = SourceHighlightRules;
  }
  const name = id.toString() + variant + external;
  // @ts-ignore
  ace.define(
    'ace/mode/source_highlight_rules' + name,
    [
      'require',
      'exports',
      'module',
      'ace/lib/oop',
      'ace/mode/doc_comment_highlight_rules',
      'ace/mode/text_highlight_rules'
    ],
    _SourceHighlightRules
  );
}
