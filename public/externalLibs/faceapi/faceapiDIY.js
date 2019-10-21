
// // ---------------------------------------------
// // Face API - Do It yourself 
// // ---------------------------------------------

// The code the students will have to produce at each step


// // ---------------------------------------------
// // LVL1 
// // ---------------------------------------------

// launch detection with
// init_webcam();
// load_faceapi();
// train_recognition();
  
// // ---------------------------------------------
// // LVL2 - high level functions
// // ---------------------------------------------

// call the differents functions
// init_webcam();
// load_faceapi();
// const e = encode_webcam_database();
// const face = face_matcher(e(),0.6);
// face;
// video_detect_faces(face);

const max_dist_between_faces = 0.6;
const encoded_database = encode_webcam_database();
const face_recogniser = face_matcher(encoded_database(), max_dist_between_faces);
video_detect_faces(face_recogniser);

// // ---------------------------------------------
// // LVL3 - code the function to encode 
// // LVL3bis - code function to detect
// // ---------------------------------------------


// code to encode labeled database
function encode(){
  let labelled_promise_embeddings=[];
  const labels = get_nonnull_labels();
  // for each label
  for (let i = 0; i < array_length(labels); i = i+1){
    const label = labels[i];
    const images_label = get_images(label);
    const descriptions = [];
    // for each image in label
    for (let j = 0; j < array_length(images_label); j = j+1){
      const image = images_label[j];
      const detections = encode_single_face(image);
      array_push(descriptions, detections);
    }
    store_embeddings(labelled_promise_embeddings, label, descriptions);
  }
  return labelled_promise_embeddings;
}


// without set_timeout and with do_after_detection
function detect(face_matcher) {
  function eventVideo (){
    const myCanvas = get_canvas_video();
    const width = get_video_width();
    const height = get_video_height();
    const myDisplaySize = display_size(height, width);
    match_dimensions(myCanvas, myDisplaySize);
    set_interval( () => {
      const detections = detect_all_faces_video("withFaceDescriptors","tinyFaceDetector",[]);
      do_after_detection(() => {
      const resizedDetections = resize_results(detections(),myDisplaySize);
      get_context(myCanvas);
      for (let i =0; i < array_length(resizedDetections); i=i+1){
        const detection = resizedDetections[i];
        const detection_descriptor = get_descriptors(detection);
        const result = find_best_match(face_matcher,detection_descriptor);
        draw_match(myCanvas, detection, result);
      }
      }); 
    },200);
  }
  add_event_video(eventVideo);
}

  
// code to write after by the student in the console
// init_webcam();
// load_faceapi();
// const labelled_promise_embeddings = encode();
// to convert functions to embedding values
// const labelled_embeddings = get_embeddings(labelled_promise_embeddings);
// const matcher = face_matcher(labelled_embeddings,0.6);
// detect(matcher);


// // ---------------------------------------------
// // LVL4 - Just play with faceapi without recognition
// // ---------------------------------------------

// version without set_timeout but with
// continuation passing function
function expression() {
  function eventVideo (){
    const myCanvas = get_canvas_video();
    const width = get_video_width();
    const height = get_video_height();
    const myDisplaySize = display_size(height, width);
    match_dimensions(myCanvas, myDisplaySize);
    set_interval( () => {
      const detections = detect_all_faces_video("all","tinyFaceDetector");
      do_after_detection(() => {
          const resizedDetections = resize_results(detections(),myDisplaySize);
          get_context(myCanvas);
          draw_detections(myCanvas, resizedDetections);
          draw_landmarks(myCanvas, resizedDetections);
          draw_expressions(myCanvas, resizedDetections);
      }); 
    },200);
  }
  add_event_video(eventVideo);
}

// code to launch program:
// init_webcam();
// load_faceapi();
// expression();

// // ---------------------------------------------
// // LVL5: TensorFlow
// // LVL5.1 - Prepare data for tensorflow
// // ---------------------------------------------


// encode labeled database to prepare data for building classifier (to be done in Face API)
function encode_tf(){
  let data=[];
  let data_image=[];
  const labels = get_nonnull_labels();
  // for each label
  for (let numberLabel = 0; numberLabel < array_length(labels); numberLabel = numberLabel+1){
    const label = labels[numberLabel];
    const images_label = get_images(label);
    // for each image in label
    for (let j = 0; j < array_length(images_label); j = j+1){
      data_image=[];
      const image = images_label[j];
      const detections = encode_single_face(image);
      array_push(data_image,detections);
      array_push(data_image,numberLabel);
      array_push(data,data_image);
    }
  }
   return data;
}

// take in arg the list previouly created to give the same list with the result of the embedding calculation
function get_embeddings(data){
  let labeled_embeddings=[];
  let embedding_image=[];
  for (let i =0; i < array_length(data); i=i+1){
      embedding_image=[];
      const embedding_function=data[i][0];
      const label=data[i][1];
      const embedings = embedding_function();
      for (let numberEmbedding=0; numberEmbedding<128 ; numberEmbedding=numberEmbedding+1){
          array_push(embedding_image,embedings[to_string(numberEmbedding)]);  
      }
      array_push(embedding_image,label);
      array_push(labeled_embeddings,embedding_image);
  }
  return labeled_embeddings;
}

// code to launch:
// init_webcam();
// load_faceapi();
// // construct database in faceAPI interface
// const labelled_promise_data = encode_tf();
// const dataEmbedding = get_embeddings(data);
// const labels = get_nonnull_labels();

// // ---------------------------------------------
// // LVL5.2 - Prepare data with tensors (without convert to tensor)
// // ---------------------------------------------

/*
 * split in training and testing data
 * Split in X and Y for training and testing, with:
 * X array of length-128 arrays of embeddings
 * Y array of number, representing the label, with the same length than X
 */
// we define "results" outside function because doesn't work if
// we try to return its value through the function (which is undefined in the S.A).
let results = [];
function prepareData(dataEmbedding, labels, testSplit) {
  return tf_tidy(() => {
    const dataByClass = [];
    const targetsByClass = [];
    for (let i=0 ; i < array_length(labels) ; i=i+1) {
      array_push(dataByClass,[]);
      array_push(targetsByClass,[]);
    }
    for (let k=0; k < array_length(dataEmbedding) ; k=k+1) {
      const element = dataEmbedding[k];
      const target = element[array_length(element) -1];
      const data = array_slice(element, 0, array_length(element)-1);
      array_push(targetsByClass[target], target);
      array_push(dataByClass[target], data);
    }
    console_log(dataByClass);
    console_log(targetsByClass);
    const xTrains = [];
    const yTrains = [];
    const xTests = [];
    const yTests = [];
    for (let i=0 ; i < array_length(labels) ; i=i+1) {
      const promise_arrayData = convert_to_tensor(dataByClass[i], targetsByClass[i], testSplit);
      const arrayData = promise_arrayData();
      const xTrain = arrayData[0];
      const yTrain = arrayData[1];
      const xTest = arrayData[2];
      const yTest = arrayData[3];
      array_push(xTrains, xTrain);
      array_push(yTrains, yTrain);
      array_push(xTests, xTest);
      array_push(yTests, yTest);
    }

    const concatAxis = 0;
    const test1 = xTrains;
    const test2 = tf_concat(xTrains,concatAxis);
    console_log(test1);
    console_log(test2);
    results = [tf_concat(xTrains,concatAxis), tf_concat(yTrains,concatAxis),
      tf_concat(xTests,concatAxis), tf_concat(yTests,concatAxis)];
  });
}



// call these functions to run everything
prepareData(dataEmbedding, labels, 0.2);
const xTrain = results[0];
const yTrain = results[1];
const xTest = results[2];
const yTest = results[3];

const model = train_model(xTrain, yTrain, xTest, yTest);

const input = tf_tensor2d(testEmbedding, [1, 128]);

// call in the console after the model has been trained
// const prediction = predict(model(), input);
// const proba = get_proba(prediction);
// const bestPred = get_highest_prediction(prediction);
// alertPrediction(prediction);

// // ---------------------------------------------
// // LVL5.3 - Add prepareModel which create and train the model
// // ---------------------------------------------

// Create and train the model 
function prepareModel(xTrain, yTrain, xTest, yTest){
  const model = tf_sequential();
  const learningRate = 0.01;
  const numberOfEpochs = 40;
  const optimizer = tf_train('adam', learningRate);

  add_input_layer(model, 10, 'sigmoid', [128], false);

  add_hidden_layer(model, 3, 'softmax');

  compile(model, optimizer, 'categoricalCrossentropy', ['accuracy']);

  // Train the model
  return model_fit(model, [xTrain, yTrain, xTest, yTest], numberOfEpochs);
}


// call these functions to run everything
prepareData(dataEmbedding, labels, 0.2);
const xTrain = results[0];
const yTrain = results[1];
const xTest = results[2];
const yTest = results[3];

const model = prepareModel(xTrain, yTrain, xTest, yTest);

const input = tf_tensor2d(testEmbedding, [1, 128]);

// call in the console after the model has been trained
// const prediction = predict(model(), input);
// const proba = get_proba(prediction);
// const bestPred = get_highest_prediction(prediction);
// alertPrediction(prediction);


// // ---------------------------------------------
// // LVL5.4 - Add convert to tensor function
// // ---------------------------------------------

// Convert data to tensor
// "2" for avoid same name function problem for testing
function convert_to_tensor2(data, targets, testSplit) {
  const numExamples = array_length(data);
  if (numExamples !== array_length(targets)) {
    return 'Error: data and targets have different number of examples';
  }
  else{
  const xDims = array_length(data[0]);
  // create a 2D tf.Tensor to hold the embeddings data
  const xs = tf_tensor2d(data, [numExamples, xDims]);

  // Create 1D ts.Tensor to hold the labels and convert to one hot encoding
  const ys = tf_one_hot(tf_tensor1d(targets), array_length(labels));

  // Split into training and testing data
  const numTestExamples = math_round(numExamples * testSplit);
  const numTrainExamples = numExamples-numTestExamples;
  const numLabels = array_length(labels);

  const xTrain = tf_slice(xs, [0,0],[numTrainExamples, xDims]);
  const xTest = tf_slice(xs, [numTrainExamples,0],[numTestExamples, xDims]);
  const yTrain = tf_slice(ys, [0,0],[numTrainExamples, numLabels]);
  const yTest = tf_slice(ys, [numTrainExamples,0],[numTestExamples, numLabels]);
  return [xTrain, yTrain, xTest, yTest];
  }
}

// call these functions to run everything
prepareData(dataEmbedding, labels, 0.2);
const xTrain = results[0];
const yTrain = results[1];
const xTest = results[2];
const yTest = results[3];

const model = prepareModel(xTrain, yTrain, xTest, yTest);

const input = tf_tensor2d(testEmbedding, [1, 128]);

// call in the console after the model has been trained
// const prediction = predict(model(), input);
// const proba = get_proba(prediction);
// const bestPred = get_highest_prediction(prediction);
// alertPrediction(prediction);

// // ---------------------------------------------
// // LVL6 - Glasses detection 
// // first step: detect faces and apply mobilenet to classify
// // ---------------------------------------------


function mobilenet_classification_faces() {
  function eventVideo (){
    const myCanvas = get_canvas_video();
    const width = get_video_width();
    const height = get_video_height();
    const myDisplaySize = display_size(height, width);
    match_dimensions(myCanvas, myDisplaySize);
    set_interval( () => {
      const detections = detect_all_faces_video("simpleDetection","tinyFaceDetector",[]);
      do_after_detection(() => {
          const resizedDetections = resize_results(detections(),myDisplaySize);
          get_context(myCanvas);
          const boxes = get_boxes(resizedDetections);
          for (let i=0; i < array_length(boxes) ; i=i+1){
            const box = boxes[i];
            const image = convert_to_image(box);
            const predictions = classify_mobilenet(image);
            do_after_mobilenet(() => {
              const classifications = predictions();
              // Do something with the classifications
              console_log(classifications);
              const first_pred = classifications[0];
              draw_custom_box(myCanvas, box, first_pred);
            });    
          }
      });
    },1000);
  }
  add_event_video(eventVideo);
}

// code to launch
// load_mobilenet();
// load_faceapi();
// init_webcam();
// mobilenet_classify_faces();

// // ---------------------------------------------
// // LVL6 - Glasses detection 
// // second step: apply with transfer learning with mobilenet and KNN
// // ---------------------------------------------

// train KNN over mobilnet inference on an online stored database
// load images first
function load_images(){
  let labeled_images=[];
  const labels = ['glasses', 'no_glasses'];
  const images_per_label = [3, 3];
  for (let i =0; i < array_length(labels); i=i+1){
    for (let j =0; j < images_per_label[i]; j=j+1){
      const label = labels[i];
      const j_string = to_string(j+1);
      const image = fetch_image('https://raw.githubusercontent.com/aurelcomp/Database/master/glasses_detection/' + label + '/' + j_string + '.png');
      array_push(labeled_images, [label,image]);
    }
  }
  return labeled_images;
}

// train knn in adding mobilenet inference of each image 
function train_knn(classifier, labeled_images){
  
  for (let i =0; i < array_length(labeled_images); i=i+1){
    // image is a function, we need to call it to 
    // get the loaded image
    const image = labeled_images[i][1];
    const label = labeled_images[i][0];
    const inference = infer_mobilenet(image());
    if (label==='glasses'){
      add_example_knn(classifier, inference, 1);
      console_log('added to KNN glasses');
    }
    else {
      add_example_knn(classifier, inference, 0);
      console_log('added to KNN no glasses');
    }
  }
}


function classify_faces(knn) {
  function eventVideo (){
    const myCanvas = get_canvas_video();
    const width = get_video_width();
    const height = get_video_height();
    const myDisplaySize = display_size(height, width);
    match_dimensions(myCanvas, myDisplaySize);
    set_interval( () => {
      const detections = detect_all_faces_video("simpleDetection","tinyFaceDetector",[]);
      do_after_detection(() => {
          const resizedDetections = resize_results(detections(),myDisplaySize);
          get_context(myCanvas);
          const boxes = get_boxes(resizedDetections);
          for (let i=0; i < array_length(boxes) ; i=i+1){
            const box = boxes[i];
            const image = convert_to_image(box);
            const inference = infer_mobilenet(image);
            const result2 = predict_class(knn, inference);
            do_after_prediction(() => {
                const result = result2();
                const category = result[0];
                let label = 'unknown';
                if (category === '0'){
                    label = 'no glasses';
                }
                else {
                    label = 'glasses';
                }
                draw_custom_box(myCanvas, box, label);
            });
          }
      });
    },1000);
  }
  add_event_video(eventVideo);
}


// code to launch
// load_mobilenet();
// load_faceapi();
// const knn = create_knn();
// const labeled_images = load_images();
// train_knn(knn, labeled_images);
// init_webcam();
// classify_faces(knn);