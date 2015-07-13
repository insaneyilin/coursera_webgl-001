"use strict";

var canvas;
var gl;
var points = [];
var numTimesToSubdivide = 1;
var theta = 0.0;
var bufferId;

var slider_step;
var slider_theta;

function init()
{
    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl)
    {
        alert("WebGL is not available!");
    }
    
    //
    // Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    // Load shaders and initialize attribute buffers
    
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    // Load the data into the GPU
    
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8 * Math.pow(3, 6), gl.STATIC_DRAW );
    
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    slider_step = document.getElementById("slider_step");
    slider_theta = document.getElementById("slider_theta");
    
    slider_step.onchange = function() {
        numTimesToSubdivide = event.srcElement.value;
        render();
    };
    slider_theta.onchange = function() {
        theta = event.srcElement.value;
        render();
    }

    render();
}

function triangle(a, b, c)
{
    points.push(a, b, c);
}

function rotate2(p, angle)
{
    var x = p[0];
    var y = p[1];
    var d = Math.sqrt(x*x + y*y);
    var phi = d * angle;
    var xx = x * Math.cos(phi) + y * Math.sin(phi);
    var yy = -1.0 * x * Math.sin(phi) + y * Math.cos(phi);
    
    return [xx, yy];
}

function divideTriangle(a, b, c, count)
{
    // rotate according distance from origin
    a = rotate2(a, theta);
    b = rotate2(b, theta);
    c = rotate2(c, theta);
    
    // check for end of recursion
    if (count === 0)
    {
        triangle(a, b, c);
    }
    else
    {
        // bisect the sides
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);
        
        // three new triangles
        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(c, ac, bc, count - 1);
        divideTriangle(b, bc, ab, count - 1);
    }
}

function render()
{
    var vertices = [vec2(-0.5, -0.5), vec2(0, 0.5), vec2(0.5, -0.5)];
    points = [];
    divideTriangle(vertices[0], vertices[1], vertices[2], numTimesToSubdivide);
    
    /* 
        When replacing the entire data store, consider using 
        glBufferSubData rather than completely recreating the 
        data store with glBufferData. This avoids the cost of 
        reallocating the data store.
    */
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    points = [];
}

window.onload = init;