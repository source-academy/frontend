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
  const files = [
    // sound
    '/externalLibs/sound/soundToneMatrix.js',
    // inspector
    '/externalLibs/inspector/inspector.js'
  ];

  for (var i = 0; i < files.length; i++) {
    dynamicallyLoadScript(files[i]);
  }
}

loadAllLibs();
