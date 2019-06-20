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
  document.head.appendChild(script)
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
    '/externalLibs/sound/riffwave.js',
    '/externalLibs/sound/microphone.js',
    // graphics
    '/externalLibs/graphics/gl-matrix.js',
    '/externalLibs/graphics/webGLhi_graph.js',
    '/externalLibs/graphics/webGLhi_graph_ce.js',
    '/externalLibs/graphics/webGLgraphics.js',
    '/externalLibs/graphics/webGLcurve.js',
    '/externalLibs/graphics/webGLrune.js',
    // list visualizer
    '/externalLibs/visualizer/KineticJS.js',
    '/externalLibs/visualizer/visualizer.js',
    // binary tree library
    '/externalLibs/tree.js',
    // streams
    '/externalLibs/streams/stream.js',
    '/externalLibs/pe_library.js',
    '/externalLibs/assert_compiled.js',
    // inspector
    '/externalLibs/inspector/inspector.js',
    // env visualizer
    '/externalLibs/env_visualizer/ConcreteJs.js',
    '/externalLibs/env_visualizer/visualizer.js'
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
    case 'TWO_DIM_RUNES':
      files = [
        // graphics
        '/externalLibs/graphics/gl-matrix.js',
        '/externalLibs/graphics/webGLgraphics.js',
        '/externalLibs/graphics/webGLrune.js'
      ]
      break
    case 'THREE_DIM_RUNES':
      files = [
        // graphics
        '/externalLibs/graphics/gl-matrix.js',
        '/externalLibs/graphics/webGLgraphics.js',
        '/externalLibs/graphics/webGLrune.js'
      ]
      break
    case 'CURVES':
      files = [
        // graphics
        '/externalLibs/graphics/gl-matrix.js',
        '/externalLibs/graphics/webGLhi_graph.js',
        '/externalLibs/graphics/webGLhi_graph_ce.js',
        '/externalLibs/graphics/webGLgraphics.js',
        '/externalLibs/graphics/webGLcurve.js'
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
