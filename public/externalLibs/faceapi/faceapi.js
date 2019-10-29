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
      return () => {
        if (error === undefined){
          return "face recognition training progress"
        }
        else {
          return error
        }
      }
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
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 160 })
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

// in case of error of detection
let error = undefined;

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
            error = `no faces detected for ${label} image ${i+1}`;
            throw new Error(`no faces detected for ${label} image ${i+1}`)
          }
          descriptions.push(detections.descriptor)
      }
      loaded_images=true
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}


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

/**
 * Returns the labels of the database you have 
 * created in the FACE API interface.
 * @return {Array} labels: an array containing the 
 * labels of the faces database.
 */
function get_labels() {
  return (Array.from(labeledImages.keys()))
}

// // ---------------------------------------------
// // Needed for NN from scratch
// // ---------------------------------------------


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


// normalize data with gaussian normalisation
// to avoid issues in the NN
function normalise_data(unormalized_data){
  let means = [0, 0, 0, 0];
  let deviations = [0, 0, 0, 0];
  // we calculate means first
  const num_data = unormalized_data.length
  for (let i=0; i<num_data; i=i+1){
      const input = unormalized_data[i][0];
      means[0] = means[0] + input[0];
      means[1] = means[1] + input[1];
      means[2] = means[2] + input[2];
      means[3] = means[3] + input[3];
  }
  means[0] = means[0] / num_data;
  means[1] = means[1] / num_data;
  means[2] = means[2] / num_data;
  means[3] = means[3] / num_data;
  // then we calculate deviations
  for (let i=0; i<num_data; i=i+1){
      const input = unormalized_data[i][0];
      deviations[0] = deviations[0] + Math.pow(input[0]-means[0], 2);
      deviations[1] = deviations[1] + Math.pow(input[1]-means[1], 2);
      deviations[2] = deviations[2] + Math.pow(input[2]-means[2], 2);
      deviations[3] = deviations[3] + Math.pow(input[3]-means[3], 2);
  }
  deviations[0] = Math.sqrt(deviations[0]);
  deviations[1] = Math.sqrt(deviations[1]);
  deviations[2] = Math.sqrt(deviations[2]);
  deviations[3] = Math.sqrt(deviations[3]);
  // normalise data
  let normalised_data = [];
  for (let i=0; i<num_data; i=i+1){
      const unormalised_input = unormalized_data[i][0];
      const output = unormalized_data[i][1];
      const normalised_input = [];
      array_push(normalised_input, (unormalised_input[0] - means[0]) / deviations[0]);
      array_push(normalised_input, (unormalised_input[1] - means[1]) / deviations[1]);
      array_push(normalised_input, (unormalised_input[2] - means[2]) / deviations[2]);
      array_push(normalised_input, (unormalised_input[3] - means[3]) / deviations[3]);
      array_push(normalised_data, [normalised_input, output]);
  }
  return normalised_data;
}
