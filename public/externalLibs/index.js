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
function loadLibs() {
  const files = [
    '/externalLibs/list.js',
    '/externalLibs/sound/sounds.js',
    '/externalLibs/sound/soundToneMatrix.js',
    '/externalLibs/sound/riffwave.js',
    '/externalLibs/graphics/gl-matrix.js',
    '/externalLibs/graphics/webGLcurve.js',
    '/externalLibs/graphics/webGLgraphics.js',
    '/externalLibs/graphics/webGLhi_graph.js',
    '/externalLibs/graphics/webGLinitCurve.js',
    '/externalLibs/graphics/webGLrune.js',
    '/externalLibs/graphics/webGLinit2D.js',
    '/externalLibs/graphics/webGLinit3D.js',
    '/externalLibs/visualizer/KineticJS.js',
    '/externalLibs/visualizer/visualizer.js',
  ];

  for (var i = 0; i < files.length; i++) {
    dynamicallyLoadScript(files[i]);
  }
}

// loadLibs(dependencies);
loadLibs();
