/**
 * Regex to get full parent path of a file path, and filename with file extension.
 * Some examples of calling exec:
 *
 *     '/playground/cp3108' -> ['/playground/cp3108', '/playground/', 'cp3108', '']
 *     '/playground/cp3108/a.js' -> ['/playground/cp3108/a.js', '/playground/cp3108/', 'a', '.js']
 *     '' -> ['', undefined, '', '']
 *     'a.js' -> ['a.js', undefined, 'a', '.js']
 *     'asdf' -> ['asdf', undefined, 'asdf', '']
 */
export const filePathRegex = /^(.*[\\/])?(\.*.*?)(\.[^.]+?|)$/;
