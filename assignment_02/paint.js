"use strict";

var canvas;
var gl;

var maxNumTriangles = 80000;
var maxNumVertices = 3 * maxNumTriangles;

var numLines = 0;

var vertexIndex = 0;

var pointsOnLines = [];

var colorIndex = 0;

var drawing = false;

var lineWidth = 1.0;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan 
];

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}
	
	// configure WebGL
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.7, 0.7, 0.7, 1.0);
	gl.clear( gl.COLOR_BUFFER_BIT );
    
    
	// load shaders and initialize attribute buffers
	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
	// load the data into the GPU
	var bufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.STATIC_DRAW);
	
	// associate out shader variables with our data buffer
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	
    var colorBufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferID);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);
    
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
    //------------------------------//
    
    var colorMenu = document.getElementById("color_menu");
    colorMenu.addEventListener("click", function() {
        colorIndex = colorMenu.selectedIndex;
    });
    
    var lineWidthSlider = document.getElementById("slider_line_width");
    
    lineWidthSlider.onchange = function() {
        lineWidth = event.srcElement.value;
    };
    
    canvas.addEventListener("mousedown", function(event) {
        drawing = true;
        ++numLines;
        pointsOnLines[numLines-1] = 0;
    });
    
    canvas.addEventListener("mousemove", function(event) {
        if (drawing) {
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
            var t = vec2(2 * event.clientX / canvas.width - 1, 
              2 * (canvas.height - event.clientY) / canvas.height - 1);
            gl.bufferSubData(gl.ARRAY_BUFFER, 8*vertexIndex, flatten(t));
            
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferID);
            t = vec4(colors[colorIndex%7]);
            gl.bufferSubData(gl.ARRAY_BUFFER, 16*vertexIndex, flatten(t));
            
            pointsOnLines[numLines-1]++;
            ++vertexIndex;
        }
    });
    
    canvas.addEventListener("mouseup", function(event) {
        drawing = false;
    });
    
	render();
};

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	
    gl.lineWidth(lineWidth);
    var vertexIdx = 0;
    for (var i = 0; i < numLines; ++i) {
        gl.drawArrays(gl.LINE_STRIP, vertexIdx, pointsOnLines[i]);
        vertexIdx += pointsOnLines[i];
    }
    window.requestAnimFrame(render);
}
