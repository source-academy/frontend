var canvas = document.querySelector('.rune-canvas');
if (!canvas) {
  canvas = document.createElement('canvas');
  canvas.setAttribute('width', 512);
  canvas.setAttribute('height', 512);
  canvas.hidden = true;
  canvas.className = 'rune-canvas';
  document.body.appendChild(canvas);
}
getReadyWebGLForCanvas('3d', canvas);
initRuneBuffer(vertices, indices);
