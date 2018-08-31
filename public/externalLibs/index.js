/** 
 * Load a given external library, as a javascript file
 * to run in the global scope, by adding it to the DOM
 */
function dynamicallyLoadScript(url) {
  var script = document.createElement("script"); 
  script.src = url; 
  /** Forces scripts to be loaded in order. */
  script.async = false
  script.defer = true
  document.head.appendChild(script); 
}

/**
 * Loads all the required libraries
 */
function loadAllLibs() {
  const files = [
    // list library 
    '/externalLibs/list.js',
    // sound
    '/externalLibs/sound/sounds.js',
    '/externalLibs/sound/soundToneMatrix.js',
    '/externalLibs/sound/riffwave.js',
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
  ];

  for (var i = 0; i < files.length; i++) {
    dynamicallyLoadScript(files[i]);
  }
}

function loadLib(externalLibraryName) {
  let files;
  switch(externalLibraryName) {
    case "TWO_DIM_RUNES":
      files = [
        // graphics
        '/externalLibs/graphics/gl-matrix.js',
        '/externalLibs/graphics/webGLgraphics.js',
        '/externalLibs/graphics/webGLrune.js',
      ];
      for (var i = 0; i < files.length; i++) {
        dynamicallyLoadScript(files[i]);
      }
      break;
    case "THREE_DIM_RUNES":
      files = [
        // graphics
        '/externalLibs/graphics/gl-matrix.js',
        '/externalLibs/graphics/webGLgraphics.js',
        '/externalLibs/graphics/webGLrune.js',
      ];
      for (var i = 0; i < files.length; i++) {
        dynamicallyLoadScript(files[i]);
      }
      break;
    case "CURVES":
      files = [
        // graphics
        '/externalLibs/graphics/gl-matrix.js',
        '/externalLibs/graphics/webGLhi_graph.js',
        '/externalLibs/graphics/webGLhi_graph_ce.js',
        '/externalLibs/graphics/webGLgraphics.js',
        '/externalLibs/graphics/webGLcurve.js',
      ];
      for (var i = 0; i < files.length; i++) {
        dynamicallyLoadScript(files[i]);
      }
      break;
    default:
      break;
  }
}

loadAllLibs();
