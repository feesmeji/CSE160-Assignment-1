// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
/* Assingment notes to grader: Notes to grader: Most code based off of Professor's walkthrough videos. ChatGPT helped me debug and get unstuck with my code, and I made comments in my code indicating where it was used. Also recieved small help from course tutor. */

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() { 
    gl_Position = a_Position;
    //gl_PointSize = 30.0;
    gl_PointSize = u_Size;
  }`
//where pointsize changes the size of the squares.


// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

//Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL(){

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  //Get the storage loc. of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if(!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;


// Globals related to UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType=POINT;
let g_selectedSegment = 3;

function addActionForHTMLUI(){

  //Color buttons on webpage and shape type
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0,0.0,0.0,1.0]; };
  document.getElementById('clearButton').onclick = function() { g_shapesList=[]; renderAllShapes();};

  document.getElementById('pointButton').onclick = function() {g_selectedType=POINT};
  document.getElementById('triButton').onclick = function() {g_selectedType=TRIANGLE};
  document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE};

  //Slider Events
  document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100; });

  //Size Slider Events
  document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectedSize = this.value;});

  //Segment Slider Events
  document.getElementById('segmentSlide').addEventListener('mouseup', function() {g_selectedSegment = this.value;});

  document.getElementById('drawingButton').onclick = function(){drawMyDrawing();};  //chat gpt helped me come up with this line of code
}



function main() {

  setupWebGL();
  connectVariablesToGLSL();

  addActionForHTMLUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function (ev) { if(ev.buttons == 1) {click(ev) } };  //drag and move mouse on canvas

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

//  var g_points = [];  // The array for the position of a mouse press
//  var g_colors = [1.0, 1.0, 1.0, 1.0];  // The array to store the color of a point
//  var g_sizes = [];

function click(ev) {
  //Extract the event click and return it in WebGL coordinates
  let [x, y] = convertCoordinatesEventToGL(ev); // grab the values of the click event and return it in WebGl coordinates.
  
  //Create and store the new point
  let point;
  if(g_selectedType==POINT){
    point = new Point();
  }
  else if (g_selectedType==TRIANGLE){
    point = new Triangle();
  }
  else if (g_selectedType==CIRCLE){
    point = new Circle();
    // Set the segments property of the circle
    point.segments = g_selectedSegment;  //chat gpt helped me come up with this line of code, I was stuck debugging part 11 but it helped me come up with this code.
  }

  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  g_shapesList.push(point);
  //g_selectedType.push(point);
  // Store the coordinates to g_points array  (where to put the squares on the canvas)
  /* g_points.push([x, y]);
  // Store the coordinates to g_points array
  //g_colors.push(g_selectedColor); //this holds a pointer

  g_colors.push(g_selectedColor.slice());


  //Store the size to the g_sizes array
  g_sizes.push(g_selectedSize); */


  /*   if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  } */

  // draw all of the shapes that need to appear on the canvas. 
  renderAllShapes();
}

function drawMyDrawing() {
  // Set color as yellow
  gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0); // chat gpt helped me come up with this line (debug color not working for this function), Wendy the tutor gave me ideasof what could work which eventually led me to this

  //chat gpt helped me come up with these first two lines
  // yellow triangles
  drawTriangle([0, 0, 0.4, 0.8, -0.4, 0.8]); //tri 1
  drawTriangle([0, 0, -0.4, 0.8, -0.8, 0.4]); //tri 2
  drawTriangle([0, 0, -0.8, 0.4, -0.9, 0.0]); //tri 3
  drawTriangle([0, 0, -0.9, 0, -0.8, -0.4]);  //tri 4
  drawTriangle([0, 0, -0.8, -0.4, -0.4, -0.8]);  //tri 5
  drawTriangle([0, 0, -0.4, -0.8, 0.4, -0.8]);  //tri 6
  drawTriangle([0, 0, -0.4, -0.8, 0.4, -0.8]);  //tri 7
  drawTriangle([0, 0, 0.4, -0.8, 0.8, -0.4]); //tri 8
  drawTriangle([0, 0, 0.8, -0.4, 0.9, 0]); //tri 9
  drawTriangle([0, 0, 0.9, 0.0, 0.8, 0.4]); //tri 10
  drawTriangle([0, 0, 0.4, 0.8, 0.8, 0.4]); //tri 11

  //draw blue eyes
  gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0); // chat gpt helped me come up with this line (debug color not working for this function), Wendy the tutor gave me ideasof what could work which eventually led me to this
  drawTriangle([-0.5, 0.1, -0.5, 0.4, -0.2, 0.4])
  drawTriangle([-0.5, 0.1, -0.2, 0.4, -0.2, 0.1])
  drawTriangle([0.5, 0.1, 0.5, 0.4, 0.2, 0.4])
  drawTriangle([0.5, 0.1, 0.2, 0.4, 0.2, 0.1])

  //draw red nose
  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0); 
  drawTriangle([-0.2, -0.2, -0.2, 0.0, 0.2, 0.0])
  drawTriangle([-0.2, -0.2, 0.2, 0.0, 0.2, -0.2])

  //draw black mouth
  gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0); 
  drawTriangle([-0.5, -0.3, 0.5, -0.6, -0.5, -0.6])
  drawTriangle([-0.5, -0.3, 0.5, -0.6, 0.5, -0.3])


  //draw red tounge
  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0); 
  drawTriangle([-0.2, -0.6, -0.2, -0.4, 0.2, -0.4])
  drawTriangle([-0.2, -0.6, 0.2, -0.4, 0.2, -0.6])
}


function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
  
}

function renderAllShapes(){

  var startTime = performance.now();

  // Clear <canvas>  (rendering points)
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;

  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();

  }

  //Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}