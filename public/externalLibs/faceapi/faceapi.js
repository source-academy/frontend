// Function for loading FaceAPI models
let faceapi_models_loaded = undefined;

/**
 * loads the face API models for face recognition
 * @return {undefined}
 */
function load_faceapi(){
  load_faceapi_async();
  return "loading Face API..."
}

async function load_faceapi_async(){
  console.log('Loading Face API...');
  // Load the model.
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('externalLibs/faceapi/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('externalLibs/faceapi/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('externalLibs/faceapi/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('externalLibs/faceapi/models'),
    faceapi.nets.ageGenderNet.loadFromUri('externalLibs/faceapi/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('externalLibs/faceapi/models')
  ]).then(() => {
    console.log('FaceAPI Models loaded')
    faceapi_models_loaded = true;
  })
}


// Video
let video = document.getElementById('video');
let video_launched = undefined;

/**
 * Initialize webcam by obtaining permission to 
 * use the default device webcam.
 * @return {undefined}
 */
function init_webcam(){
  video_launched = true;
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
  return "obtaining webcam permission"
}


// // ---------------------------------------------
// // Functions for the Face API interface
// // ---------------------------------------------
// Take a snap of the video (for FaceAPI) and save it in a labeled map
// Initialise the labeled map
var labeledImages = new Map();
let imagesA=[];
let imagesB=[];
let imagesC=[];
let labelA="A";
let labelB="B";
let labelC="C";
labeledImages.set(labelA,imagesA);
labeledImages.set(labelB,imagesB);
labeledImages.set(labelC,imagesC);

// Take a snap from webcam by clicking on "Take Photo" button
// One function for each button A, B, C
video.takePhotoA = async function(){
  const canvas = document.getElementById('canvas-capture-a');
  const width = 200;
  const height = 150;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, width, height);
  const img = canvas.toDataURL('image/png');
  const image = await faceapi.fetchImage(img);
  imagesA.push(image);
}
video.takePhotoB = async function(){
  const canvas = document.getElementById('canvas-capture-b');
  const width = 200;
  const height = 150;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, width, height);
  const img = canvas.toDataURL('image/png');
  const image = await faceapi.fetchImage(img);
  imagesB.push(image);
}
video.takePhotoC = async function(){
  const canvas = document.getElementById('canvas-capture-c');
  const width = 200;
  const height = 150;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, width, height);
  const img = canvas.toDataURL('image/png');
  const image = await faceapi.fetchImage(img);
  imagesC.push(image);
}

// Reset images for the label by clicking on "Reset" button
// One function for each button A, B, C
function resetPhotoA() {
  imagesA.length=0;
  var canvas = document.getElementById('canvas-capture-a');
  var context = canvas.getContext('2d');
  var img = context.createImageData(canvas.width, canvas.height);
  // to delete the photo on the screen
  for (var i = img.data.length; --i >= 0; )
    img.data[i] = 0;
  context.putImageData(img, 0, 0);
}
function resetPhotoB() {
  imagesB.length=0;
  var canvas = document.getElementById('canvas-capture-b');
  var context = canvas.getContext('2d');
  var img = context.createImageData(canvas.width, canvas.height);
  for (var i = img.data.length; --i >= 0; )
    img.data[i] = 0;
  context.putImageData(img, 0, 0);
}
function resetPhotoC() {
  imagesC.length=0;
  var canvas = document.getElementById('canvas-capture-c');
  var context = canvas.getContext('2d');
  var img = context.createImageData(canvas.width, canvas.height);
  for (var i = img.data.length; --i >= 0; )
    img.data[i] = 0;
  context.putImageData(img, 0, 0);
}


// // ---------------------------------------------
// // LVL1 - Attract curiosity
// // ---------------------------------------------

// Train Face Recognition after having launched the video

/**
 * Train face recognition on webcam stream with the 
 * database you have created in the FACE API interface.
 * @return {undefined}
 */
function train_recognition() {
  if (video_launched === undefined){
    throw new Error("Call init_webcam(); " +
        "to obtain permission to use the webcam and launch the video");
  }
  if (faceapi_models_loaded === undefined){
    throw new Error("Call load_faceapi(); " +
        "to load the Face API models before using face recognition");
  }
  else {
    if (imagesA.length + imagesB.length + imagesC.length === 0) {
      throw new Error("No photos in the database yet. "+
      "Take snapshot for each person in the Face API Display to create your database");
    }
    else{
      train();
      return "face recognition training progress"
    }
  }
}

async function train() {
  if (video_launched === true){
    navigator.getUserMedia(
      { video: {} },
      stream => video.srcObject = stream,
      err => console.error(err)
    )
  }
  video.removeEventListener('play', await eventListener);
  const maxDescriptorDistance = 0.6;
  const labeledFaceDescriptors = await trainLabeledImages();
  faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance);
  if (video_launched === true){
    navigator.getUserMedia(
      { video: {} },
      stream => video.srcObject = stream,
      err => console.error(err)
    )
  }
  video.addEventListener('play', eventListener);
}

async function eventListener() {
  const canvas = document.getElementById('canvas')
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  // common sizes are 128, 160, 224, 320, 416, 512, 608 (video recommend 128, 160)
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
    })
  }, 50)
}

async function trainLabeledImages(){
  const labels = Array.from(labeledImages.keys());
  var labelsNoZero = [];
  // Remove labels with no images
  labels.forEach(function(label) {
    if (labeledImages.get(label).length!=0) {
      labelsNoZero.push(label);
    }
  })
  return Promise.all(
    labelsNoZero.map(async label => {
      const descriptions = [];
      const imageList = labeledImages.get(label);
      for (let i = 0 ; i <= imageList.length -1 ; i++) {
          const detections = await faceapi.detectSingleFace(imageList[i]).withFaceLandmarks().withFaceDescriptor()
          if (!detections) {
            throw new Error(`no faces detected for ${label} image ${i+1}`)
          }
          descriptions.push(detections.descriptor)
      }
      loaded_images=true
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}


// // ---------------------------------------------
// // Face API - Do It yourself
// // LVL2 - Code with high level functions
// // ---------------------------------------------


let labeledFaceDescriptors;
let loaded_images= undefined

/**
* Encode the database you have created in the FACE API interface and returns
* an encoding promise: a nullary function that returns an array containing 
* faces’ embeddings for each label when encoding calculation is finished. 
* Example:
* <CODE>
* int_webcam();
* // Take pictures in the FACE API interface to build your database of known faces
* // Then, call the function to encode this database
* const promise = encode_webcam_database();
* // In next query, you can get the promised embeddings, by
* // applying the promise:
* const encoded_database = promise();
* </CODE>
* @return {function} promise: nullary function which returns the encoded database
*/
function encode_webcam_database() {
  if (video_launched === undefined){
    throw new Error("Call 'init_webcam();' to enable the webcam. Then, " +
    "take snapshot for each person in the Face API Display to create your database");
  }
  else if (imagesA.length + imagesB.length + imagesC.length === 0) {
    throw new Error("No photos in the database yet. "+
    "Take snapshot for each person in the Face API Display to create your database");
  }
  else{
  face_descriptors();
  return () => {
    if (loaded_images === undefined) {
  throw new Error("encoding still in progress")
    } else {
      return labeledFaceDescriptors
    }
  };
  }
}

async function face_descriptors(){
  labeledFaceDescriptors = await trainLabeledImages();
}

/**
 * Create a face_matcher which store the parameters needed 
 * to apply recognition with regards to the encoded_database. 
 * @param {Array} encoded_database - Array containing the encoded database.
 * @param {Number} max_descriptor_distance - The maximum distance between 
 * the embeddings (the encoding) of two faces to be categorised as the 
 * same person. Value between 0 and 1: 0.6 is a good value. 
 * @return {face-matcher} face-matcher which store the parameters needed to apply recognition.
 */
function face_matcher(encoded_database, max_descriptor_distance) {
  if (Array.isArray(encoded_database)){
    return new faceapi.FaceMatcher(encoded_database, max_descriptor_distance);
  }
  // if encoded_database not an array
  else{
    throw new Error("encoded_database should be an array containing the encoded database")
  }
}

/**
 * Launch the face recognition on the webcam with the face_matcher.
 * @param {face-matcher} face_matcher - The face-matcher containing parameters 
 * needed to apply face recognition.
 * @return {undefined}
 */
function video_detect_faces(face_matcher) {
  detect(face_matcher);
  return "detection activated"
}
let faceMatcher;
async function detect(face_matcher) {
  if (video_launched === true){
    navigator.getUserMedia(
      { video: {} },
      stream => video.srcObject = stream,
      err => console.error(err)
    )
  }
  // remove former detection
  video.removeEventListener('play', await eventListener);
  faceMatcher=face_matcher;
  if (video_launched === true){
    navigator.getUserMedia(
      { video: {} },
      stream => video.srcObject = stream,
      err => console.error(err)
    )
  }
  // add new detection
  video.addEventListener('play', eventListener);
}


// // ---------------------------------------------
// // Face API - Do It yourself 
// // LVL3 - LVL3bis - Detail each function
// // ---------------------------------------------

// Get the labels of the pictures database

/**
 * Returns the labels of the database you have 
 * created in the FACE API interface.
 * @return {Array} labels: an array containing the 
 * labels of the faces database.
 */
function get_labels() {
  return (Array.from(labeledImages.keys()))
}

// Get the labels which have at least one image in the database

/**
 * Returns the labels of the database you have created 
 * in the FACE API interface which contains at least one image.
 * @return {Array} labels: an array containing the labels 
 * of the non null faces database.
 */
function get_nonnull_labels() {
  const labels = get_labels();
  var labelsNonNull = [];
  // Remove labels with no images
  labels.forEach(function(label) {
    if (labeledImages.get(label).length!=0) {
      labelsNonNull.push(label);
    }
  })
  return labelsNonNull
}

// Change the label name

/**
 * Change the former_label into new_label in the database you 
 * have create in the FACE API interface. The value of the 
 * three labels are initialised at “A”, “B” and “C”.
 * @param {String} former_label - the label you want to change. 
 * @param {String} new_label - the new value of the label you want to set.
 * @return {undefined} 
 */
function change_label(former_label, new_label) {
  if (typeof former_label === "string" && typeof new_label === "string") {
    const labels = get_labels();
    if (labels.includes(former_label)) {
      const images = labeledImages.get(former_label)
      labeledImages.delete(former_label);
      labelA = new_label
      labeledImages.set(new_label, images);
      return ("label '" + former_label + "' changed to '" + labelA + "'")
    }
    else {
      throw new Error("Label "+ former_label + " doesn't exist");
    }
  }
  else {
    throw new Error("Parameters needs to be string elements");
  } 
}


// Get the images for one particular label

/**
 * Gives an Array containing the images for a given label in 
 * the database you have created in the FACE API interface.
 * @param {String} label - The label of which you want the images.
 * @return {Array} Array of images.
 */
function get_images(label) {
  return (labeledImages.get(label))
}

// Encode image - calculate embeddings from faceAPI model
// Lists and iteration for calculations in for loops and deal with asynchronism
let list_encoded = [];
let calculation_embeddings = [];
let iteration = -1;
let errorDetection = undefined
// ask for label in parameter to return error for the concerned
// label if we can't detect face on the picture

/**
 * Encode the face detected in the image and returns an 
 * encoding promise: a nullary function that returns the 
 * face’s embeddings when encoding calculation is finished. 
 * @param {Image} image - The image of the face you want to encode.
 * @param {String} label - The label of the image. 
 * Allow the function to return an error based on the 
 * label name if no face is detected in the image.
 * @return {function} encoding promise: a nullary function that returns 
 * the face’s embeddings when encoding calculation is finished.
 */
function encode_single_face(image,label) {
  if (faceapi_models_loaded === undefined){
    throw new Error("Call load_faceapi(); " +
        "to load the Face API models before using them");
  }
  else {
    list_encoded.push(undefined)
    iteration = iteration + 1;
    const i = iteration
    calc_embeddings(image,i,label);
    return () => {
      if (list_encoded[i] === undefined) {
        throw new Error("encoding image still in progress")
          }
      else if (errorDetection !== undefined){
        throw new Error(`no faces detected for ${errorDetection}, reset database for ${errorDetection} and start again`)
      }
      else {
        return calculation_embeddings[i];
      }
    };
  }
}

async function calc_embeddings(image,i,label) {
  const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
  // change errorDetection value to the label on which we can't detect a face 
  //  on the database to return an error in function encode_image
  if (!detections) {
    errorDetection=label;
  }
  calculation_embeddings.push(detections.descriptor);
  list_encoded[i]=true;
}

// Store embeddings in a labeled map

/**
 * Store the labelled encoding promise in the array labelled_encoding_promise. 
 * Useful to create a face-matcher then.
 * @param {Array} labelled_encoding_promises - Array containing the labelled 
 * encoding promises of known faces stored in the database.
 * @param {String} label - The label corresponding to the encoding promise.
 * @param {function} encoding_promise - The encoding promise you want to store.
 * @return {undefined}
 */
function store_embeddings(labelled_encoding_promises, label, encoding_promise) {
  let labeled_embeddings ={};
  labeled_embeddings._label = label;
  labeled_embeddings._descriptors = encoding_promise;
  labelled_encoding_promises.push(labeled_embeddings);
}

// Convert the stored functions embedding labeled into a labeled map with the value of these functions

/**
 * Call all the stored promises to get the calculated embeddings and 
 * returns an Array of the same dimensions than labelled_encoding_promise 
 * containing the labelled embeddings for each labelled face.
 * @param {Array} labelled_encoding_promises - Array containing the labelled 
 * encoding promises of known faces stored in the database.
 * @return {Array} An Array containing the labelled embeddings.
 */
function get_embeddings(labelled_encoding_promises){
  T=[]
  labelled_encoding_promises.forEach(function(functions_embeddings_one_label){
    descriptions=[];
    label=functions_embeddings_one_label._label;
    functions_embeddings_one_label._descriptors.forEach(function(embeddings){
      descriptions.push(embeddings())
    });
    T.push(new faceapi.LabeledFaceDescriptors(label, descriptions))
  });
  return T
}

// Functions to calculate and draw the detection on video

/**
 * Get canvas containing the video image.
 * @return {Canvas} canvas containing the video image.
 */
function get_canvas_video() {
  return document.getElementById('canvas')
}

/**
 * Get height dimension of the video.
 * @return {Number} height dimension of the video.
 */
function get_video_height() {
  return video.height
}

/**
 * Get width dimension of the video.
 * @return {Number} width dimension of the video.
 */
function get_video_width() {
  return video.width
}

/**
 * Gives a display-size containing the dimensions of the 
 * video that you pass to the function.
 * @param {Number} height_video - height of the video.
 * @param {Number} width_video - width of the video.
 * @return {display-size} display-size containing height and width dimensions
 */
function display_size(heightVideo, widthVideo) {
  return { width: widthVideo, height: heightVideo }
}

/**
 * Matches dimensions of the canvas to the one of display_size.
 * @param {Canvas} my_canvas - The canvas of which you want to set dimensions
 * @param {display-size} display_size - The dimensions you want to set
 * @return {undefined}
 */
function match_dimensions(my_canvas, display_size) {
  faceapi.matchDimensions(my_canvas, display_size);
}

/**
 * Call myFunction every time milliseconds. Used in the function 
 * <CODE>action_video</CODE> passed to <CODE>add_event_video(action_video)</CODE>
 * to apply this function periodically on the webcam stream.
 * @param {function} my_function - The function you want to call periodically. 
 * @param {display-size} time - Time between two calls of myFunction.
 * @return {undefined}
 */
function set_interval(my_function, time) {
  setInterval(my_function, time);
}

/**
 * Runs the function action_video at every frame of the webcam video.
 * @param {function} action_video - The function you want to run on the video. 
 * @return {undefined}
 */
function add_event_video(action_video){
  if (video_launched === undefined){
    throw new Error("Call init_webcam(); " +
        "to obtain permission to use the webcam and launch the video "+
        "before adding an event on the video");
  }
  else {
    navigator.getUserMedia(
      { video: {} },
      stream => video.srcObject = stream,
      err => console.error(err)
    )
    video.addEventListener('play', action_video);
  }
}

// global variable for face detection
let detect_faces=undefined
let faces

// without parameters for detection
function detect_all_faces_video2() {
  detect_faces=undefined
  async_detect_all_faces_video2();
  return () => {
    if (detect_faces === true) {
      return faces
    }
  }
}

// add parameters for detection

/**
 * Encode the faces detected in the webcam video and returns an 
 * detection promise: a nullary function that returns the 
 * faces’ detection when calculation is finished. 
 * All parameters are optionals, but you still need to specify 
 * all the parameters in order.
 * Ex:
 * <CODE>detect_all_faces_video(detection_type)</CODE> works.
 * <CODE>detect_all_faces_video(detection_type, model)</CODE> works.
 * <CODE>detect_all_faces_video(detection_type, model, parameters)</CODE> works.
 * <CODE>detect_all_faces_video(model, parameters)</CODE> DOES NOT work.
 * <CODE>detect_all_faces_video(detection_type, parameters)</CODE> DOES NOT work.
 * <CODE>detect_all_faces_video(parameters)</CODE> DOES NOT work.
 * @param {String} detection_type - (optional) The detection type you want to 
 * execute on the video: 
 * <CODE>"simpleDetection"</CODE>: detect faces on the video.  
 * <CODE>"withFaceLandmarks"</CODE>: detect faces on the video and 
 * calculate the 68 landmark points for each face. 
 * <CODE>"withFaceDescriptors"</CODE>: detect faces on the video, 
 * calculate the 68 landmark points and calculate the 128 embeddings
 * for each face.  
 * <CODE>"withExpression"</CODE>: detect faces on the video and
 * determine the expression of each face. 
 * <CODE>"withAgeAndGender"</CODE>: detect faces on the video and
 * determine the age and the gender for each face. 
 * <CODE>"all"</CODE>: detect faces on the video, calculate 
 * the 68 landmark points, calculate the 128 embeddings, and
 * determine the expression, the age and the gender for each face.
 * value by default: <CODE>"all"</CODE>
 * @param {String} model - (optional) The model used to detect faces:
 * <CODE>"tinyFaceDetector"</CODE>: fast and performant model.  
 * <CODE>"ssdMobilenetv1"</CODE>: very high performance but slower.
 * value by default: <CODE>"tinyFaceDetector"</CODE>
 * @param {Array} parameters - (optional) an Array containing the two parameters 
 * of the model/
 * for "tinyFaceDetector": <CODE>[input_size, score_threshold]</CODE>
 * <CODE>input_size</CODE>: size at which video is processed. The smaller 
 * the faster, but less precise in detecting smaller faces. Must be divisible
 * by 32, common sizes are 128, 160, 224, 320, 416, 512, 608. 
 * value by default: <CODE>224</CODE>
 * @return {function} detection promise: a nullary function that returns the 
 * faces’ detections when calculation is finished. 
 */
function detect_all_faces_video(detection_type, model, parameters) {
  if (faceapi_models_loaded === undefined){
    throw new Error("Call load_faceapi(); " +
        "to load the Face API models before using them");
  }
  else {
    detect_faces=undefined
    async_detect_all_faces_video(detection_type, model, parameters);
    return () => {
      if (detect_faces === true) {
        return faces
      }
    }
  }
}

async function async_detect_all_faces_video2() {
  // common sizes are 128, 160, 224, 320, 416, 512, 608 (video recommend 128, 160, 224)
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
  faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceDescriptors();
  detect_faces=true;
}


async function async_detect_all_faces_video(detectionType = "all", option = "tinyFaceDetector", parameters = []) {
  // we set default value for the parameter inputSize of TinyFaceDetector 
  // to 224 instead of the normal 416, because 416 makes detection slow
  const inputSize_tinyFaceDetector = 224;
  // all different cases for detection
  switch (detectionType){
    case "withFaceDescriptors":
      switch (option) {
        case "tinyFaceDetector":
          if (parameters.length === 0) {
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: inputSize_tinyFaceDetector })
            faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceDescriptors();
            detect_faces=true;
            return
          }
          else {
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: parameters[0], scoreThreshold: parameters[1]})
            faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceDescriptors();
            detect_faces=true;
            return
          }
        case "ssdMobilenetv1":
          if (parameters.length === 0) {
            const options = new faceapi.SsdMobilenetv1Options()
            faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceDescriptors();
            detect_faces=true;
            return
          }
          else {
            const options = new faceapi.SsdMobilenetv1Options({ minConfidence: parameters[0], maxResults: parameters[1]})
            faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceDescriptors();
            detect_faces=true;
            return
          }
      }
    case "withFaceLandmarks":
      switch (option) {
        case "tinyFaceDetector":
          if (parameters.length === 0) {
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: inputSize_tinyFaceDetector })
            faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks();
            detect_faces=true;
            return
          }
          else {
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: parameters[0], scoreThreshold: parameters[1]})
            faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks();
            detect_faces=true;
            return
          }
        case "ssdMobilenetv1":
          if (parameters.length === 0) {
            const options = new faceapi.SsdMobilenetv1Options()
            faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks();
            detect_faces=true;
            return
          }
          else {
            const options = new faceapi.SsdMobilenetv1Options({ minConfidence: parameters[0], maxResults: parameters[1]})
            faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks();
            detect_faces=true;
            return
          }
      }
    case "simpleDetection":
      switch (option) {
        case "tinyFaceDetector":
          if (parameters.length === 0) {
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: inputSize_tinyFaceDetector })
            faces = await faceapi.detectAllFaces(video, options);
            detect_faces=true;
            return
          }
          else {
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: parameters[0], scoreThreshold: parameters[1]})
            faces = await faceapi.detectAllFaces(video, options);
            detect_faces=true;
            return
          }
        case "ssdMobilenetv1":
          if (parameters.length === 0) {
            const options = new faceapi.SsdMobilenetv1Options()
            faces = await faceapi.detectAllFaces(video, options);
            detect_faces=true;
            return
          }
          else {
            const options = new faceapi.SsdMobilenetv1Options({ minConfidence: parameters[0], maxResults: parameters[1]})
            faces = await faceapi.detectAllFaces(video, options);
            detect_faces=true;
            return
          }
      }
    case "withExpression":
      switch (option) {
        case "tinyFaceDetector":
          if (parameters.length === 0) {
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: inputSize_tinyFaceDetector })
            faces = await faceapi.detectAllFaces(video, options).withFaceExpressions();
            detect_faces=true;
            return
          }
          else {
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: parameters[0], scoreThreshold: parameters[1]})
            faces = await faceapi.detectAllFaces(video, options).withFaceExpressions();
            detect_faces=true;
            return
          }
        case "ssdMobilenetv1":
          if (parameters.length === 0) {
            const options = new faceapi.SsdMobilenetv1Options()
            faces = await faceapi.detectAllFaces(video, options).withFaceExpressions();
            detect_faces=true;
            return
          }
          else {
            const options = new faceapi.SsdMobilenetv1Options({ minConfidence: parameters[0], maxResults: parameters[1]})
            faces = await faceapi.detectAllFaces(video, options).withFaceExpressions();
            detect_faces=true;
            return
          }
      }
    case "withAgeAndGender":
      switch (option) {
        case "tinyFaceDetector":
          if (parameters.length === 0) {
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: inputSize_tinyFaceDetector })
            faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withAgeAndGender();
            detect_faces=true;
            return
          }
          else {
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: parameters[0], scoreThreshold: parameters[1]})
            faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withAgeAndGender();
            detect_faces=true;
            return
          }
        case "ssdMobilenetv1":
          if (parameters.length === 0) {
            const options = new faceapi.SsdMobilenetv1Options()
            faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withAgeAndGender();
            detect_faces=true;
            return
          }
          else {
            const options = new faceapi.SsdMobilenetv1Options({ minConfidence: parameters[0], maxResults: parameters[1]})
            faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withAgeAndGender();
            detect_faces=true;
            return
          }
      }
    case "all":
      switch (option) {
        case "tinyFaceDetector":
          if (parameters.length === 0) {
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: inputSize_tinyFaceDetector })
            faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceExpressions().withAgeAndGender().withFaceDescriptors();
            detect_faces=true;
            return
          }
          else {
            const options = new faceapi.TinyFaceDetectorOptions({ inputSize: parameters[0], scoreThreshold: parameters[1]})
            faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceExpressions().withAgeAndGender().withFaceDescriptors();
            detect_faces=true;
            return
          }
        case "ssdMobilenetv1":
          if (parameters.length === 0) {
            const options = new faceapi.SsdMobilenetv1Options()
            faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceExpressions().withAgeAndGender().withFaceDescriptors();
            detect_faces=true;
            return
          }
          else {
            const options = new faceapi.SsdMobilenetv1Options({ minConfidence: parameters[0], maxResults: parameters[1]})
            faces = await faceapi.detectAllFaces(video, options).withFaceLandmarks().withFaceExpressions().withAgeAndGender().withFaceDescriptors();
            detect_faces=true;
            return
          }
      }  
  }
}

/**
 * Resizes the faces' detections with regards to display_size.
 * @param {Array} detections - Array of detected faces.
 * @param {Array} display_size - display_size contain the reference
 * dimensions with which the detections have to be resized.
 * @return {Array} Array of resized detected faces.
 */
function resize_results(detections, display_size) {
  return faceapi.resizeResults(detections, display_size)
}

/**
 * Used to get the descriptors (the embeddings) of a detected face.
 * @param {detection} detection - A detected face.
 * @return {Array} Embeddings of the face.
 */
function get_descriptors(detection){
  return detection.descriptor
}

/**
 * Used to get the model's estimation on the age of a detected face.
 * @param {detection} detection - A detected face.
 * @return {Number} The estimated age of the face.
 */
function get_age(detection){
  return detection.age
}

/**
 * Used to get the model's inference on the gender of a detected face.
 * @param {detection} detection - A detected face.
 * @return {String} The infered gender of the face.
 */
function get_gender(detection){
  return detection.gender
}

/**
 * Dertermines which is the closest known face in 
 * face_matcher from the face whose descriptor was passed.
 * @param {face-matcher} face_matcher - face-matcher which store 
 * the data needed to apply recognition (the labelled embedding database
 * and the maximum distance between two faces to be recognised as same).
 * @param {Array} face_matcher - Embedding of the face we want to recognise.
 * @return {match} The infered recognized face.
 */
function find_best_match(face_matcher, descriptor) {
  const match = face_matcher.findBestMatch(descriptor)
  return match
}

/**
 * Gives the label of the match.
 * @param {match} match - The infered recognized face.
 * @return {String} The label of the infered recognized face.
 */
function get_label_match(match){
  return match._label
}

/**
 * Gives the distance between the face recognized
 * and the corresponding face in the database.
 * @param {match} match - The infered recognized face.
 * @return {Number} The distance between the face recognized
 * and the corresponding face in the database.
 */
function get_distance_match(match){
  return match._distance
}

/**
 * Draw a box on the face on which we applied recognition
 * with the result of the find_best_match function.
 * @param {Canvas} my_canvas - The canvas on which we want to 
 * draw the box.
 * @param {detection} detection - The detected face on which we applied
 * recognition.
 * @param {match} match - The infered recognized face.
 * @return {undefined}
 */
function draw_match(my_canvas, detection, match) {
const box = detection.detection.box;
const drawBox = new faceapi.draw.DrawBox(box, { label: match.toString() })
drawBox.draw(my_canvas);
}

/**
 * Draw a box on each detected face.
 * @param {Canvas} my_canvas - The canvas on which we want to 
 * draw the boxes.
 * @param {Array} resized_detections - Array of the resized detected faces.
 * @return {undefined}
 */
function draw_detections(my_canvas, resized_detections) {
  faceapi.draw.drawDetections(my_canvas, resized_detections);
}

/**
 * Draw the face landmarks on each detected face.
 * @param {Canvas} my_canvas - The canvas on which we want to 
 * draw the boxes.
 * @param {Array} resized_detections - Array of the resized detected faces.
 * @return {undefined}
 */
function draw_landmarks(my_canvas, resized_detections) {
  faceapi.draw.drawFaceLandmarks(my_canvas, resized_detections);
}

/**
 * Draw the faces' expression on each detected face.
 * @param {Canvas} my_canvas - The canvas on which we want to 
 * draw the boxes.
 * @param {Array} resized_detections - Array of the resized detected faces.
 * @return {undefined}
 */
function draw_expressions(my_canvas, resized_detections) {
  faceapi.draw.drawFaceExpressions(my_canvas, resized_detections);
}

function get_context(canvas) {
canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
}

function detection_done(){
if (detect_faces === true) {
  return true
}
else{
  return false
}
}

function set_timeout(myFunction,time) {
setTimeout(myFunction,time);
}

// To deal with asynchronism issues. We need to wait
// detection results before continuing the program.
// value of setTimeout fixed to 150ms because it 
// seems to be enough to calculate detections.
const do_after_detection_timeout = 150;

/**
 * Continuation passing function which run myFunction after 
 * the detection has been done.
 * @param {function} my_function - The function to run after the 
 * detection has been done.
 * @return {undefined}
 */
function do_after_detection(my_function) {
  setTimeout(() => {
    if (detect_faces === true){
      my_function();
    }
  }, do_after_detection_timeout)       
}

/**
 * Add an element at the end of the Array.
 * Ex:
 * <CODE>
 * let L = [1 ,2];
 * array_push(L, 3);
 * // L = [1, 2, 3]
 * </CODE>
 * @param {Array} array - The Array on which we want to
 * add an element.
 * @param {element} element - The element we want to add.
 * @return {undefined}
 */
function array_push(array, element) {
  array.push(element);
}

/**
 * Converts a Number into a String
 * @param {Number} num - The Number we want to convert to String.
 * @return {String} The String converted Number.
 */
function to_string(num){
  return num.toString();
}


// // ---------------------------------------------
// // Face API - Detect glasses application 
// // ---------------------------------------------


/**
 * Gets the position of the faces detected
 * @param {Array} resized_detections - Array of the resized detected faces.
 * @return {Array} Array of Arrays. Each Array contains the box position 
 * for one face. The box position are: box = [height, width, x, y].
 * x and y are coordinate of the top left corner of the box and the origin
 * of the coordinates in the top left corner of the canvas on xhich faces
 * where detected.
 */
function get_boxes(resized_detections) {
  var boxes = [];
  resized_detections.forEach(function(detection) {
    const box = detection._box;
    const box_position = [box._height, box._width, box._x, box._y];
    boxes.push(box_position);
  })
  return boxes
}

/**
 * Takes snap images of each of the boxes regions (the faces detected) 
 * on the webcam video.
 * @param {Array} boxes - Array containing the box for each face detected.
 * @return {Array} Array of images of all faces detected.
 */
function convert_to_img(boxes) {
  var images = [];
  // to store snap of the webcam
  var hiden_canvas=document.getElementById('hiden-canvas');
  boxes.forEach(function(box) {
    const height = box[0];
    const width = box[1];
    const x = box[2];
    const y = box[3];
    var hidenContext = hiden_canvas.getContext('2d');
    hidenContext.drawImage(video, 0 , 0, 400, 300);
    var imgData = hidenContext.getImageData(x, y, width, height);
    images.push(imgData);
  })
  return images;
}

/**
 * Takes a snap image of the box region on the webcam video
 * where the face was detected.
 * @param {box} boxe - The box of a detected face.
 * @return {image} Images of the detected face.
 */
function convert_to_image(box) {
  // to store snap of the webcam
  var hiden_canvas=document.getElementById('hiden-canvas');
  hiden_canvas.width = video.width;
  hiden_canvas.height = video.height;
  const height = box[0];
  const width = box[1];
  const x = box[2];
  const y = box[3];
  var hidenContext = hiden_canvas.getContext('2d');
  hidenContext.drawImage(video, 0 , 0, 400, 300);
  var imgData = hidenContext.getImageData(x, y, width, height);
  return imgData;
}


// lineWidth set to 2
const line_width = 2;

/**
 * Draws a custom box with text.
 * @param {Canvas} my_canvas - The canvas on which to draw the box.
 * @param {box} box - The box dimensions of the face detected.
 * @param {String} text - The text to attach to the box.
 * @return {image} Images of the detected face.
 */
function draw_custom_box(my_canvas, box, text){
  const myBox = { x: box[2], y: box[3], width: box[1], height: box[0] }
  // see DrawBoxOptions below
  const drawOptions = {
  label: text,
  lineWidth: line_width
  }
  const drawBox = new faceapi.draw.DrawBox(myBox, drawOptions)
  drawBox.draw(my_canvas)
}


// fetch image from url
// Lists and iteration for calculations in for loops and deal with asynchronism
let list_verification_loaded = [];
let images_loaded = [];
let iteration_load = -1;

/**
 * Load an image from an url and returns a promise of the image: 
 * a nullary function which returns the image when loaded has finished.
 * @param {String} url - The URL of the image we want to load.
 * @return {function} promise of the image: a nullary function 
 * which returns the image when loaded has finished.
 */
function fetch_image(url){
  list_verification_loaded.push(undefined)
  iteration_load = iteration_load + 1;
  const i = iteration_load;
  fetch_image_async(url, i);
  return () => {
    if (list_verification_loaded[i] === undefined) {
      throw new Error("image still loading")
        }
    else {
      return images_loaded[i];
    }
  };
}

async function fetch_image_async(url, i){
  const image = await faceapi.fetchImage(url);
  // To convert image to dataImage 
  // Otherwise we have problem on the Source Academy
  var canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  var context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  images_loaded.push(imageData);
  list_verification_loaded[i] = true;
}



