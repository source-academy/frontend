//-----------------------Shaders------------------------------
var shaders = {}

shaders['2d-vertex-shader'] = [
  'attribute vec4 a_position;',

  'attribute vec4 a_mat1;',
  'attribute vec4 a_mat2;',
  'attribute vec4 a_mat3;',
  'attribute vec4 a_mat4;',
  'attribute vec4 a_color;',

  'varying vec4 v_color;',

  'void main() {',
  '    mat4 transformMatrix = mat4(a_mat1, a_mat2, a_mat3, a_mat4);',
  '    gl_Position = transformMatrix * a_position;',
  // correct the right/left handed thing
  '    gl_Position.z = -gl_Position.z;',
  '    v_color = a_color;',
  '}'
].join('\n')

shaders['2d-fragment-shader'] = [
  'precision mediump float;',

  'varying vec4 v_color;',

  'void main() {',
  '    gl_FragColor = v_color;',
  '}'
].join('\n')

shaders['3d-vertex-shader'] = [
  'attribute vec4 a_position;',

  'attribute vec4 a_mat1;',
  'attribute vec4 a_mat2;',
  'attribute vec4 a_mat3;',
  'attribute vec4 a_mat4;',
  'attribute vec4 a_color;',

  'varying vec4 v_color;',

  'void main() {',
  '    mat4 transformMatrix = mat4(a_mat1, a_mat2, a_mat3, a_mat4);',
  '    vec4 final_pos = transformMatrix * a_position;',
  // Correct the left-handed / right-handed stuff
  '    final_pos.z = -final_pos.z;',
  '    gl_Position = final_pos;',
  '    v_color = a_color;',
  '    float color_factor = final_pos.z;',
  '    v_color += color_factor * (1.0 - v_color);',
  '    v_color.a = 1.0;',
  '}'
].join('\n')

shaders['3d-fragment-shader'] = [
  'precision mediump float;',

  'varying vec4 v_color;',

  'void main() {',
  '    gl_FragColor = v_color;',
  '}'
].join('\n')

shaders['anaglyph-vertex-shader'] = [
  'attribute vec4 a_position;',

  'attribute vec4 a_mat1;',
  'attribute vec4 a_mat2;',
  'attribute vec4 a_mat3;',
  'attribute vec4 a_mat4;',
  'attribute vec4 a_color;',

  'uniform mat4 u_cameraMatrix;',
  'uniform vec4 u_colorFilter;',

  'varying vec4 v_color;',

  'void main() {',
  '    mat4 transformMatrix = mat4(a_mat1, a_mat2, a_mat3, a_mat4);',
  '    vec4 world_pos = transformMatrix * a_position;',
  '    gl_Position = u_cameraMatrix * world_pos;',
  // Correct the left-handed / right-handed stuff
  '    gl_Position.z = -gl_Position.z;',
  '    v_color = a_color;',
  '    float color_factor = -world_pos.z;',
  '    v_color += color_factor * (1.0 - v_color);',
  // average green and blue to form true cyan
  // v_color.g = 0.5 * (v_color.g + v_color.b);
  // v_color.b = v_color.g;
  // v_color = 1.0 - v_color;
  '    v_color = u_colorFilter * v_color + 1.0 - u_colorFilter;',
  '    v_color.a = 1.0;',
  '}'
].join('\n')

shaders['anaglyph-fragment-shader'] = [
  'precision mediump float;',

  'varying vec4 v_color;',

  'void main() {',
  '    gl_FragColor = v_color;',
  '}'
].join('\n')

shaders['combine-vertex-shader'] = [
  'attribute vec4 a_position;',

  'varying highp vec2 v_texturePosition;',

  'void main() {',
  '    gl_Position = a_position;',
  '    v_texturePosition.x = (a_position.x + 1.0) / 2.0;',
  '    v_texturePosition.y = (a_position.y + 1.0) / 2.0;',
  '}'
].join('\n')

shaders['combine-fragment-shader'] = [
  'precision mediump float;',

  'uniform sampler2D u_sampler_red;',
  'uniform sampler2D u_sampler_cyan;',

  'varying highp vec2 v_texturePosition;',

  'void main() {',
  '    gl_FragColor = texture2D(u_sampler_red, v_texturePosition)',
  '            + texture2D(u_sampler_cyan, v_texturePosition) - 1.0;',
  '    gl_FragColor.a = 1.0;',
  '}'
].join('\n')

shaders['copy-vertex-shader'] = [
  'attribute vec4 a_position;',

  'varying highp vec2 v_texturePosition;',

  'void main() {',
  '    gl_Position = a_position;',
  '    v_texturePosition.x = (a_position.x + 1.0) / 2.0;',
  '    v_texturePosition.y = 1.0 - (a_position.y + 1.0) / 2.0;',
  '}'
].join('\n')

shaders['copy-fragment-shader'] = [
  'precision mediump float;',

  'uniform sampler2D u_sampler_image;',

  'varying highp vec2 v_texturePosition;',

  'void main() {',
  '    gl_FragColor = texture2D(u_sampler_image, v_texturePosition);',
  '}'
].join('\n')

//-------------------------Constants-------------------------
var antialias = 4 // common
var halfEyeDistance = 0.03 // rune 3d only

//----------------------Global variables----------------------
// common
var stringify // stringify function we should use (eg for error messages)
var gl // the WebGL context
var curShaderProgram // the shader program currently in use
var normalShaderProgram // the default shader program
var vertexBuffer
var vertexPositionAttribute // location of a_position
var colorAttribute // location of a_color
var canvas = canvas || createCanvas(); // the <canvas> object that is used to display webGL output

// rune 2d and 3d
var instance_ext // ANGLE_instanced_arrays extension
var instanceBuffer
var indexBuffer
var indexSize // number of bytes per element of index buffer
var mat1Attribute // location of a_mat1
var mat2Attribute // location of a_mat2
var mat3Attribute // location of a_mat3
var mat4Attribute // location of a_mat4

// rune 3d only
var anaglyphShaderProgram
var combineShaderProgram
var copyShaderProgram
var u_cameraMatrix // locatin of u_cameraMatrix
var u_colorFilter // location of u_colorFilter
var redUniform // location of u_sampler_red
var cyanUniform // location of u_sampler_cyan
var u_sampler_image
var leftCameraMatrix // view matrix for left eye
var rightCameraMatrix // view matrix for right eye
var leftFramebuffer
var rightFramebuffer
var copyTexture

//----------------------Common functions----------------------

// Appears to be unused

// function open_viewport(name, horiz, vert, aa_off) {
//   var canvas
//   canvas = open_pixmap(name, horiz, vert, aa_off)
//   document.body.appendChild(canvas)
//   canvas.setAttribute(
//     'style',
//     canvas.getAttribute('style') +
//       ' display: block; margin-left: auto; margin-right: auto; padding: 25px'
//   )
//   return canvas
// }

function open_pixmap(name, horiz, vert, aa_off) {
  var this_aa
  if (aa_off) {
    this_aa = 1
  } else {
    this_aa = antialias
  }
  var canvas = document.createElement('canvas')
  //this part uses actual canvas impl.
  canvas.width = horiz * this_aa
  canvas.height = vert * this_aa
  //this part uses CSS scaling, in this case is downsizing.
  canvas.style.width = horiz + 'px'
  canvas.style.height = vert + 'px'
  return canvas
}

/**
 * Creates a <canvas> object.
 *
 * Post-condition: canvas is defined as the selected <canvas>
 *   object in the document.
 */
function createCanvas() {
  const canvas = document.createElement('canvas')
  canvas.setAttribute('width', 512);
  canvas.setAttribute('height', 512);
  canvas.className = 'rune-canvas';
  canvas.hidden = true;
  document.body.appendChild(canvas);
  return canvas;
}

function getReadyStringifyForRunes(stringify_) {
  stringify = stringify_
}

/*
 * Gets the WebGL object (gl) ready for usage. Use this
 * to reset the mode of rendering i.e to change from 2d to 3d runes.
 *
 * Post-condition: gl is non-null, uses an appropriate
 *   program and has an appropriate initialized state
 *   for mode-specific rendering (e.g props for 3d render).
 *
 * @param mode a string -- '2d'/'3d'/'curve' that is the usage of
 *   the gl object.
 */
function getReadyWebGLForCanvas(mode) {
  // Get the rendering context for WebGL
  if (canvas) {
    // remove the previous canvas from the DOM
    canvas.remove();
  }
  canvas = createCanvas();
  gl = initWebGL(canvas)
  if (gl) {
    gl.clearColor(1.0, 1.0, 1.0, 1.0) // Set clear color to white, fully opaque
    gl.enable(gl.DEPTH_TEST) // Enable depth testing
    gl.depthFunc(gl.LEQUAL) // Near things obscure far things
    // Clear the color as well as the depth buffer.
    clear_viewport()

    //TODO: Revise this, it seems unnecessary
    // Align the drawable canvas in the middle
    gl.viewport((canvas.width - canvas.height) / 2, 0, canvas.height, canvas.height)

    // setup a GLSL program i.e. vertex and fragment shader
    if (!(normalShaderProgram = initShader(mode))) {
      return
    }
    curShaderProgram = normalShaderProgram
    gl.useProgram(curShaderProgram)

    // rune-specific operations
    if (mode === '2d' || mode === '3d') {
      initRuneCommon()
      initRuneBuffer(vertices, indices)
      initRune3d()
    }
  }
}

function initWebGL(canvas) {
  var gl = null

  try {
    // Try to grab the standard context. If it fails, fallback to experimental.
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  } catch (e) {}

  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.')
    gl = null
  }
  return gl
}

function initShader(programName) {
  var vertexShader
  if (!(vertexShader = getShader(gl, programName + '-vertex-shader', 'vertex'))) {
    return null
  }
  var fragmentShader
  if (!(fragmentShader = getShader(gl, programName + '-fragment-shader', 'fragment'))) {
    return null
  }
  var shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.bindAttribLocation(shaderProgram, 0, 'a_position')
  gl.linkProgram(shaderProgram)
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program.')
    return null
  } else {
    return shaderProgram
  }
}

function getShader(gl, id, type) {
  var shader
  var theSource = shaders[id]

  if (type == 'fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER)
  } else if (type == 'vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER)
  } else {
    // Unknown shader type
    return null
  }

  gl.shaderSource(shader, theSource)

  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
    return null
  }
  return shader
}

function initFramebufferObject() {
  var framebuffer, texture, depthBuffer

  // Define the error handling function
  var error = function() {
    if (framebuffer) gl.deleteFramebuffer(framebuffer)
    if (texture) gl.deleteTexture(texture)
    if (depthBuffer) gl.deleteRenderbuffer(depthBuffer)
    return null
  }

  // create a framebuffer object
  framebuffer = gl.createFramebuffer()
  if (!framebuffer) {
    console.log('Failed to create frame buffer object')
    return error()
  }

  // create a texture object and set its size and parameters
  texture = gl.createTexture()
  if (!texture) {
    console.log('Failed to create texture object')
    return error()
  }
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.drawingBufferWidth,
    gl.drawingBufferHeight,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  )
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  framebuffer.texture = texture

  // create a renderbuffer for depth buffer
  depthBuffer = gl.createRenderbuffer()
  if (!depthBuffer) {
    console.log('Failed to create renderbuffer object')
    return error()
  }

  // bind renderbuffer object to target and set size
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
  gl.renderbufferStorage(
    gl.RENDERBUFFER,
    gl.DEPTH_COMPONENT16,
    gl.drawingBufferWidth,
    gl.drawingBufferHeight
  )

  // set the texture object to the framebuffer object
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer) // bind to target
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  // set the renderbuffer object to the framebuffer object
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)

  // check whether the framebuffer is configured correctly
  var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
  if (gl.FRAMEBUFFER_COMPLETE !== e) {
    console.log('Frame buffer object is incomplete:' + e.toString())
    return error()
  }

  // Unbind the buffer object
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.bindRenderbuffer(gl.RENDERBUFFER, null)

  return framebuffer
}

function clearFramebuffer(framebuffer) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  clear_viewport()
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}

function clear_viewport() {
  if (!gl) {
    throw new Error('Please activate the Canvas component by clicking it in the sidebar')
  }
  // Clear the viewport as well as the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  if (typeof clearHollusion !== 'undefined') {
    clearHollusion()
  }
}

//---------------------Rune 2d and 3d functions---------------------
function initRuneCommon() {
  // set up attribute locations
  vertexPositionAttribute = gl.getAttribLocation(normalShaderProgram, 'a_position')
  colorAttribute = gl.getAttribLocation(normalShaderProgram, 'a_color')
  mat1Attribute = gl.getAttribLocation(normalShaderProgram, 'a_mat1')
  mat2Attribute = gl.getAttribLocation(normalShaderProgram, 'a_mat2')
  mat3Attribute = gl.getAttribLocation(normalShaderProgram, 'a_mat3')
  mat4Attribute = gl.getAttribLocation(normalShaderProgram, 'a_mat4')

  enableInstanceAttribs()

  // set up ANGLE_instanced_array extension
  if (!(instance_ext = gl.getExtension('ANGLE_instanced_arrays'))) {
    console.log('Unable to set up ANGLE_instanced_array extension!')
  }
}

function enableInstanceAttribs() {
  gl.enableVertexAttribArray(colorAttribute)
  gl.enableVertexAttribArray(mat1Attribute)
  gl.enableVertexAttribArray(mat2Attribute)
  gl.enableVertexAttribArray(mat3Attribute)
  gl.enableVertexAttribArray(mat4Attribute)
}

function disableInstanceAttribs() {
  gl.disableVertexAttribArray(colorAttribute)
  gl.disableVertexAttribArray(mat1Attribute)
  gl.disableVertexAttribArray(mat2Attribute)
  gl.disableVertexAttribArray(mat3Attribute)
  gl.disableVertexAttribArray(mat4Attribute)
}

function initRuneBuffer(vertices, indices) {
  // vertices should be Float32Array
  // indices should be Uint16Array
  vertexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  // enable assignment to vertex attribute
  gl.enableVertexAttribArray(vertexPositionAttribute)

  var FSIZE = vertices.BYTES_PER_ELEMENT
  gl.vertexAttribPointer(vertexPositionAttribute, 4, gl.FLOAT, false, FSIZE * 4, 0)

  // Also initialize the indexBuffer
  indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

  indexSize = indices.BYTES_PER_ELEMENT
}

function drawRune(first, indexCount, instanceArray) {
  // instanceArray should be Float32Array
  // instanceCount should be instanceArray.length / 20

  // this draw function uses the "normal" shader
  if (curShaderProgram !== normalShaderProgram) {
    curShaderProgram = normalShaderProgram
    gl.useProgram(curShaderProgram)
  }

  enableInstanceAttribs()

  // due to a bug in ANGLE implementation on Windows
  // a new buffer need to be created everytime for a new instanceArray
  // drawing mode MUST be STREAM_DRAW
  // delete the buffer at the end
  // More info about the ANGLE implementation (which helped me fix this bug)
  // https://code.google.com/p/angleproject/wiki/BufferImplementation
  instanceBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, instanceArray, gl.STREAM_DRAW)

  var FSIZE = instanceArray.BYTES_PER_ELEMENT
  var instanceCount = instanceArray.length / 20

  // pass transform matrix and color of instances
  assignRuneAttributes(FSIZE)

  instance_ext.drawElementsInstancedANGLE(
    gl.TRIANGLES,
    indexCount,
    gl.UNSIGNED_SHORT,
    first * indexSize,
    instanceCount
  )

  // delete the instance buffer
  gl.deleteBuffer(instanceBuffer)
}

function assignRuneAttributes(FSIZE) {
  gl.vertexAttribPointer(mat1Attribute, 4, gl.FLOAT, false, FSIZE * 20, 0)
  instance_ext.vertexAttribDivisorANGLE(mat1Attribute, 1)
  gl.vertexAttribPointer(mat2Attribute, 4, gl.FLOAT, false, FSIZE * 20, FSIZE * 4)
  instance_ext.vertexAttribDivisorANGLE(mat2Attribute, 1)
  gl.vertexAttribPointer(mat3Attribute, 4, gl.FLOAT, false, FSIZE * 20, FSIZE * 8)
  instance_ext.vertexAttribDivisorANGLE(mat3Attribute, 1)
  gl.vertexAttribPointer(mat4Attribute, 4, gl.FLOAT, false, FSIZE * 20, FSIZE * 12)
  instance_ext.vertexAttribDivisorANGLE(mat4Attribute, 1)
  gl.vertexAttribPointer(colorAttribute, 4, gl.FLOAT, false, FSIZE * 20, FSIZE * 16)
  instance_ext.vertexAttribDivisorANGLE(colorAttribute, 1)
}

//------------------------Rune 3d functions------------------------
function initRune3d() {
  // set up other shaders
  if (
    !(
      (anaglyphShaderProgram = initShader('anaglyph')) &&
      (combineShaderProgram = initShader('combine'))
    )
  ) {
    console.log('Anaglyph cannot be used!')
  }
  if (!(copyShaderProgram = initShader('copy'))) {
    console.log('Stereogram and hollusion cannot be used!')
  }

  // set up uniform locations
  u_cameraMatrix = gl.getUniformLocation(anaglyphShaderProgram, 'u_cameraMatrix')
  u_colorFilter = gl.getUniformLocation(anaglyphShaderProgram, 'u_colorFilter')
  redUniform = gl.getUniformLocation(combineShaderProgram, 'u_sampler_red')
  cyanUniform = gl.getUniformLocation(combineShaderProgram, 'u_sampler_cyan')
  u_sampler_image = gl.getUniformLocation(copyShaderProgram, 'u_sampler_image')

  // calculate the left and right camera matrices
  leftCameraMatrix = mat4.create()
  mat4.lookAt(
    leftCameraMatrix,
    vec3.fromValues(-halfEyeDistance, 0, 0),
    vec3.fromValues(0, 0, -0.4),
    vec3.fromValues(0, 1, 0)
  )
  rightCameraMatrix = mat4.create()
  mat4.lookAt(
    rightCameraMatrix,
    vec3.fromValues(halfEyeDistance, 0, 0),
    vec3.fromValues(0, 0, -0.4),
    vec3.fromValues(0, 1, 0)
  )
  // set up frame buffers
  if (
    !((leftFramebuffer = initFramebufferObject()) && (rightFramebuffer = initFramebufferObject()))
  ) {
    console.log('Unable to initialize for anaglyph.')
    return
  }

  // set up a texture for copying
  // create a texture object and set its size and parameters
  copyTexture = gl.createTexture()
  if (!copyTexture) {
    console.log('Failed to create texture object')
    return error()
  }
}

function draw3D(first, indexCount, instanceArray, cameraMatrix, colorFilter, framebuffer) {
  // this draw function uses the "anaglyph" shader
  if (curShaderProgram !== anaglyphShaderProgram) {
    curShaderProgram = anaglyphShaderProgram
    gl.useProgram(curShaderProgram)
  }

  enableInstanceAttribs()

  // due to a bug in ANGLE implementation on Windows
  // a new buffer need to be created everytime for a new instanceArray
  // drawing mode MUST be STREAM_DRAW
  // delete the buffer at the end
  // More info about the ANGLE implementation (which helped me fix this bug)
  // https://code.google.com/p/angleproject/wiki/BufferImplementation
  instanceBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, instanceArray, gl.STREAM_DRAW)

  var FSIZE = instanceArray.BYTES_PER_ELEMENT
  var instanceCount = instanceArray.length / 20

  // pass transform matrix and color of instances
  assignRuneAttributes(FSIZE)

  // pass the camera matrix and color filter for left eye
  gl.uniformMatrix4fv(u_cameraMatrix, false, cameraMatrix)
  gl.uniform4fv(u_colorFilter, new Float32Array(colorFilter))

  // draw left eye to frame buffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  instance_ext.drawElementsInstancedANGLE(
    gl.TRIANGLES,
    indexCount,
    gl.UNSIGNED_SHORT,
    first * indexSize,
    instanceCount
  )

  gl.deleteBuffer(instanceBuffer)
}

function drawAnaglyph(first, indexCount, instanceArray) {
  // instanceArray should be Float32Array
  // instanceCount should be instanceArray.length / 20

  draw3D(first, indexCount, instanceArray, leftCameraMatrix, [1, 0, 0, 1], leftFramebuffer)
  draw3D(first, indexCount, instanceArray, rightCameraMatrix, [0, 1, 1, 1], rightFramebuffer)

  // combine to screen
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  combine(leftFramebuffer.texture, rightFramebuffer.texture)
}

function combine(texA, texB) {
  // this draw function uses the "combine" shader
  if (curShaderProgram !== combineShaderProgram) {
    curShaderProgram = combineShaderProgram
    gl.useProgram(curShaderProgram)
  }

  disableInstanceAttribs()

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texA)
  gl.uniform1i(cyanUniform, 0)

  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, texB)
  gl.uniform1i(redUniform, 1)

  gl.drawElements(gl.TRIANGLES, square.count, gl.UNSIGNED_SHORT, indexSize * square.first)
}

function clearAnaglyphFramebuffer() {
  clearFramebuffer(leftFramebuffer)
  clearFramebuffer(rightFramebuffer)
}

function copy_viewport_webGL(src) {
  // this draw function uses the "copy" shader
  if (curShaderProgram !== copyShaderProgram) {
    curShaderProgram = copyShaderProgram
    gl.useProgram(curShaderProgram)
  }

  disableInstanceAttribs()

  gl.activeTexture(gl.TEXTURE2)
  gl.bindTexture(gl.TEXTURE_2D, copyTexture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.uniform1i(u_sampler_image, 2)

  gl.drawElements(gl.TRIANGLES, square.count, gl.UNSIGNED_SHORT, indexSize * square.first)
}
//---------------------Cheating canvas functions-----------------
function copy_viewport(src, dest) {
  dest.getContext('2d').clearRect(0, 0, dest.width, dest.height)
  dest.getContext('2d').drawImage(src, 0, 0, dest.width, dest.height) // auto scaling
}

function ShapeDrawn(canvas) {
  this.$canvas = canvas;
}

/**
 * compares two Pictures and returns the mean squared error of the pixel intensities.
 * @param {Picture} picture1
 * @param {Picture} picture2
 * @return {number} mse
 * example: picture_mse(show(heart), show(nova));
 */
function picture_mse(picture1, picture2) {
  var width = picture1.$canvas.width
  var height = picture1.$canvas.height
  var data1 = picture1.$canvas.getContext('2d').getImageData(0, 0, width, height).data
  var data2 = picture2.$canvas.getContext('2d').getImageData(0, 0, width, height).data
  var sq_err = 0
  for (var i = 0; i < data1.length; i++) {
    var err = (data1[i] - data2[i]) / 255
    sq_err += err * err
  }
  return sq_err / data1.length
}
