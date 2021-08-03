/**
 * Load a given external library, as a javascript file
 * to run in the global scope, by adding it to the DOM
 */
function dynamicallyLoadScript(url) {
  var script = document.createElement('script')
  script.src = url
  /** Forces scripts to be loaded in order. */
  script.async = false
  script.defer = true
  // make sure document.body exists, since the scripts we load
  // assume that it does
  if (document.body) {
    document.body.appendChild(script)
  } else {
    var observer = new MutationObserver(function() {
      if (document.body) {
        document.body.appendChild(script)
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { childList: true });
  }
}

/**
 * Loads all libraries, including sound and graphics.
 */
function loadAllLibs() {
  const files = [
    // list library
    '/externalLibs/list.js',
    // sound
    '/externalLibs/sound/sounds.js',
    '/externalLibs/sound/soundToneMatrix.js',
    '/externalLibs/sound/microphone.js',
    // graphics
    '/externalLibs/graphics/gl-matrix.js',
    '/externalLibs/graphics/webGLgraphics.js',
    '/externalLibs/graphics/webGLrune.js',
    // binary tree library
    '/externalLibs/tree.js',
    // support for Practical Assessments (presently none)
    // video
    '/externalLibs/video/video_lib.js',
    // inspector
    '/externalLibs/inspector/inspector.js',
  ]

  for (var i = 0; i < files.length; i++) {
    dynamicallyLoadScript(files[i])
  }
}

/**
 * Loads libraries according to the name provided.
 * This is to faciliate a lack of namespace clash for
 * graphics libraries (@see #341)
 */
function loadLib(externalLibraryName) {
  let files
  switch (externalLibraryName) {
    /**
     * Appears that loadAllLibs() have loaded the libraries 
     * for RUNES, and no longer necessary for 
     * WorkspaceSaga.ts to call loadLib() for individual libraries.
     */
    case 'RUNES':
      files = [
        // graphics
        // '/externalLibs/graphics/gl-matrix.js',
        // '/externalLibs/graphics/webGLgraphics.js',
        // '/externalLibs/graphics/webGLrune.js'
      ]
      break
    case 'MACHINELEARNING':
      files = [
        // faceAPI
        '/externalLibs/faceapi/faceapi.js',
      ]
      break
    default:
      break
  }
  for (var i = 0; i < files.length; i++) {
    dynamicallyLoadScript(files[i])
  }
}

loadAllLibs()
