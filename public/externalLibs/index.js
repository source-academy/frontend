/**
 * Load a given external library, as a javascript file
 * to run in the global scope, by adding it to the DOM
 */
function dynamicallyLoadScript(url) {
  var script = document.createElement('script');
  script.src = url;
  /** Forces scripts to be loaded in order. */
  script.async = false;
  script.defer = true;
  
  // Add load/error handlers for debugging
  script.onload = function() {
    console.log('[EXTERNAL-LIBS] Loaded:', url);
  };
  script.onerror = function() {
    console.error('[EXTERNAL-LIBS] Failed to load:', url);
  };
  
  // make sure document.body exists, since the scripts we load
  // assume that it does
  if (document.body) {
    document.body.appendChild(script);
  } else {
    var observer = new MutationObserver(function () {
      if (document.body) {
        document.body.appendChild(script);
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
  const v = 'prefix-stepper-5-' + Date.now()
  const files = [
    // sound
    '/externalLibs/sound/soundToneMatrix.js',
    // inspector
    '/externalLibs/inspector/inspector.js',
    // scm-slang tracer UMD bundle (optional; ignore if missing)
    `/externalLibs/scm-slang/index.js?v=${v}`
  ];

  console.log('[EXTERNAL-LIBS] Loading libraries with version:', v);
  for (var i = 0; i < files.length; i++) {
    try {
      console.log('[EXTERNAL-LIBS] Loading:', files[i]);
      dynamicallyLoadScript(files[i]);
    } catch (e) {
      console.error('[EXTERNAL-LIBS] Error loading:', files[i], e);
    }
  }
}

loadAllLibs();
