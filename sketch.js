let handpose;
let video;
let predictions = [];
let synth;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  handpose = ml5.handpose(video, modelReady);
  // Initialize Tone.js synth
  synth = new Tone.FMSynth().toDestination();
  const autoWah = new Tone.AutoWah(50, 6, -30).toDestination();
  // This sets up an event that fills the global variable "predictions"
  // with an array every time new hand poses are detected
  handpose.on("predict", results => {
    predictions = results;
  });

  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  console.log("Model ready!");
}

function draw() {
  image(video, 0, 0, width, height);
  drawKeypoints();
  drawGrid();
  
   // Check if any hand keypoints are detected and play synth sound
  if (predictions.length > 0) {
    playSynthSound(predictions[0].landmarks);
  }
}

function drawGrid(){
    //Grid system for notes
  for (let x =0; x<8; x++){
    for (let y =0; y<3; y++){
      fill(255, 255, 255, 10);
      rect(x*width/8, y*height /3, width/8, height / 3);
    }
  }
}
// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  for (let i = 0; i < predictions.length; i++) {
    const prediction = predictions[i];
    for (let j = 0; j < prediction.landmarks.length; j++) {
      const keypoint = prediction.landmarks[j];
      fill(0, 255, 0);
      noStroke();
      ellipse(keypoint[0], keypoint[1], 10, 10);
    }
  }
}
function playSynthSound(landmarks) {
  // Calculate the distance between the thumb tip (landmark 4) and the pinky tip (landmark 8)
  const handOpenness = dist(
    landmarks[4][0],
    landmarks[4][1],
    landmarks[8][0],
    landmarks[8][1]
  );

  // Map hand openness to amplitude (adjust the scaling factor as needed)
  let amplitude = map(handOpenness, 0, width, 0, 40);

  // Map hand keypoints' x and y coordinates to synth frequency
  let gridX = Math.floor(map(landmarks[9][0], 0, width, 0, 5));
  let gridY = Math.floor(map(landmarks[9][1], 0, height, 0, 3));

  // Map grid position to a specific note
  let note = getNoteFromGridPosition(gridX, gridY);

  // Declare frequency and map it to the note
  let frequency = Tone.Frequency(note).toFrequency() * 2;

  // Set the synth volume based on the calculated amplitude
  synth.volume.value = amplitude;

  // Play the synth sound
  synth.triggerAttackRelease(frequency, '8n');
}


function getNoteFromGridPosition(x, y){
  //Define the notes for each grid position
  const notes = ['D', 'D#', 'F#', 'G', 'A', 'A#', 'C'];
  //Define the octaves for each row
  const octaves = [1, 2, 3];
  
  //Get the note and octave for the given grid position
  let note = notes[x % notes.length];
  let octave = octaves[y];
  
  //Concatenate note and octave to form the complete note
  return note + octave;
}

//Next ideas
//Make a grid (translucent) and trigger notes based on different grid systems
//Turn on and off based on hand shape