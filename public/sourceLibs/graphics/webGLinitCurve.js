var canvas = document.querySelector('.rune-canvas');
if (!canvas) {
  canvas = document.createElement('canvas');
  canvas.setAttribute('width', 512);
  canvas.setAttribute('height', 512);
  canvas.className = 'rune-canvas';
  canvas.hidden = true;
  document.body.appendChild(canvas);
}
getReadyWebGLForCanvas('curve', canvas);
