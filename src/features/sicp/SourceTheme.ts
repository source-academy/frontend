/**
 * Source Theme for use with react-syntax-highlighter.
 * Tries to match the Source Theme for Ace Editor in js-slang
 */
export const SourceTheme = {
  'code[class*="language-"]': {
    color: 'white',
    background: '#2c3e50',
    fontFamily: "'Inconsolata', 'Consolas', monospace",
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.5',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none'
  },
  'pre[class*="language-"]': {
    color: 'white',
    background: '#2c3e50',
    fontFamily: "'Inconsolata', 'Consolas', monospace",
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.5',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none',
    padding: '1em',
    margin: '0.5em 0',
    overflow: 'auto',
    borderRadius: '0.3em'
  },
  ':not(pre) > code[class*="language-"]': {
    background: '#2c3e50',
    padding: '0.1em',
    borderRadius: '0.3em',
    whiteSpace: 'normal'
  },
  comment: {
    color: '#0088FF'
  },
  punctuation: {
    color: 'white'
  },
  boolean: {
    color: '#FF628C'
  },
  number: {
    color: '#FF628C'
  },
  string: {
    color: '#3AD900'
  },
  operator: {
    color: '#FF9D00'
  },
  function: {
    color: '#ffdd00'
  },
  keyword: {
    color: '#FF9D00'
  }
};
