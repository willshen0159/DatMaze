
var gl;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];
var paused = 0;
var depthTest = 1;
var eyePosition = [ 0.1, 0.1, 0.1 ];

var myPosition = [3, 3];
var state = 0;

var stop = 0;
var moveForward = 1;
var moveLeft = 2;
var moveBackward = 3;
var moveRight = 4;
var turnLeft = 5;
var turnRight = 6;
var animate = 100;

var face = 0;
var faceDirection = [0, 0, -100];
var faceDir = [[0, 0, -100],
				[-100, 0, 0],
				[0, 0, 100],
				[100, 0, 0]];

var animated = 1;
var animationCount = 0;
var myPrePosition = [3, 3];
var preFace = 0;

var moveDir = [[0, -1],
				[-1, 0],
				[0, 1],
				[1, 0]];

var maze_half_len = 2;
var maze = [[1, 1, 1, 1, 1], 
			[1, 0, 0, 0, 1], 
			[1, 0, 1, 0, 1], 
			[1, 0, 0, 0, 1], 
			[1, 1, 1, 1, 1]];
/*
function maze_initialize(maze, len){
	for (i = 0; i < 2*len + 1; i++){
		maze.push([]);
		for (j = 0; j < 2*len + 1; j++){
			// no wall (i+, i-, k+, k-)
			maze[i].push([false, false, false, false]);
		}
	}
}

function getNeighors(cell){
	
}

function maze_generate(maze){
	var len = maze.length;
	var curx = 0;
	var cury = 0;
	var path = [];
	
	var visited = [];
	for (i = 0; i < 2*len + 1; i++){
		visited.push([]);
		for (j = 0; j < 2*len + 1; j++){
			visited[i].push(false);
		}
	}
	
	
	
	console.log(len);
}

maze_initialize(maze, maze_half_len);
maze_generate(maze);
*/

// event handlers for mouse input (borrowed from "Learning WebGL" lesson 11)
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

//var moonRotationMatrix = mat4();
var moonRotationMatrix = [[0.8933313170557982, -0.25362208401028374, -0.3709919089004878, 0],
	[-0.07294105585034996, 0.7327540378928623, -0.6765730724194803, 0],
	[0.4434396918846838, 0.6314644554161226, 0.6360926671541045, 0],
	[0, 0, 0, 1]];
moonRotationMatrix.matrix = true;

function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
      return;
    }

    var newX = event.clientX;
    var newY = event.clientY;
    var deltaX = newX - lastMouseX;
    var newRotationMatrix = rotate(deltaX/10, 0, 1, 0);

    var deltaY = newY - lastMouseY;
    newRotationMatrix = mult(rotate(deltaY/10, 1, 0, 0), newRotationMatrix);

    moonRotationMatrix = mult(newRotationMatrix, moonRotationMatrix);

	console.log(moonRotationMatrix);

    lastMouseX = newX
    lastMouseY = newY;
}


// event handlers for button clicks
function rotateX() {
	paused = 0;
    axis = xAxis;
};
function rotateY() {
	paused = 0;
	axis = yAxis;
};
function rotateZ() {
	paused = 0;
	axis = zAxis;
};


// ModelView and Projection matrices
var modelingLoc, viewingLoc, projectionLoc, lightMatrixLoc;
var modeling, viewing, projection;

var numVertices  = 36;

var pointsArray = [];
var colorsArray = [];
var normalsArray = [];
var texCoordsArray = [];

var texture;

var texCoord = [
    vec2(0, 2),
    vec2(0, 0),
    vec2(1, 0),
    vec2(1, 2)
];

var vertices = [
	vec4( -0.5, -0.5,  0.5, 1 ),
	vec4( -0.5,  0.5,  0.5, 1 ),
	vec4(  0.5,  0.5,  0.5, 1 ),
	vec4(  0.5, -0.5,  0.5, 1 ),
	vec4( -0.5, -0.5, -0.5, 1 ),
	vec4( -0.5,  0.5, -0.5, 1 ),
	vec4(  0.5,  0.5, -0.5, 1 ),
	vec4(  0.5, -0.5, -0.5, 1 )
];

// Using off-white cube for testing
var vertexColors = [
	vec4( 1.0, 1.0, 0.8, 1.0 ),  
	vec4( 1.0, 1.0, 0.8, 1.0 ),  
	vec4( 1.0, 1.0, 0.8, 1.0 ),  
	vec4( 1.0, 1.0, 0.8, 1.0 ),  
	vec4( 1.0, 1.0, 0.8, 1.0 ),  
	vec4( 1.0, 1.0, 0.8, 1.0 ),  
	vec4( 1.0, 1.0, 0.8, 1.0 ),  
	vec4( 1.0, 1.0, 0.8, 1.0 )
];

var lightPosition = vec4( 0.0, 100.0, 200.0, 1.0 );

var materialAmbient = vec4( 0.25, 0.25, 0.25, 1.0 );
var materialDiffuse = vec4( 0.8, 0.8, 0.8, 1.0);
var materialSpecular = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialShininess = 100.0;

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);  // cross returns vec3
	 normal.push(0.0); // convert to vec4
     normal = normalize(normal);

    pointsArray.push(vertices[a]); 
	 colorsArray.push(vertexColors[a]);
     normalsArray.push(normal); 
     texCoordsArray.push(texCoord[0]);
    pointsArray.push(vertices[b]); 
	 colorsArray.push(vertexColors[b]);
     normalsArray.push(normal); 
     texCoordsArray.push(texCoord[1]);
    pointsArray.push(vertices[c]); 
	 colorsArray.push(vertexColors[c]);
     normalsArray.push(normal);   
     texCoordsArray.push(texCoord[2]);

    pointsArray.push(vertices[a]);  
	 colorsArray.push(vertexColors[a]);
     normalsArray.push(normal); 
     texCoordsArray.push(texCoord[0]);
    pointsArray.push(vertices[c]); 
	 colorsArray.push(vertexColors[c]);
     normalsArray.push(normal); 
     texCoordsArray.push(texCoord[2]);
    pointsArray.push(vertices[d]); 
	 colorsArray.push(vertexColors[d]);
     normalsArray.push(normal);
     texCoordsArray.push(texCoord[3]);	 
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	// Generate pointsArray[], colorsArray[] and normalsArray[] from vertices[] and vertexColors[].
	// We don't use indices and ELEMENT_ARRAY_BUFFER (as in previous example)
	// because we need to assign different face normals to shared vertices.
	colorCube();
    
    // vertex array attribute buffer
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // color array atrribute buffer
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    // normal array atrribute buffer

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    // texture-coordinate array atrribute buffer

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    //
    // Initialize a texture
    //
	/*
    var image = new Image();
    image.onload = function() { 
        configureTexture( image );
    }
    image.src = "bump.jpg";
	*/

	// uniform variables in shaders
    modelingLoc   = gl.getUniformLocation(program, "modelingMatrix"); 
    viewingLoc    = gl.getUniformLocation(program, "viewingMatrix"); 
    projectionLoc = gl.getUniformLocation(program, "projectionMatrix"); 
    lightMatrixLoc= gl.getUniformLocation(program, "lightMatrix"); 

    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
    gl.uniform4fv( gl.getUniformLocation(program, "materialAmbient"),
       flatten(materialAmbient));
    gl.uniform4fv( gl.getUniformLocation(program, "materialDiffuse"),
       flatten(materialDiffuse) );
    gl.uniform4fv( gl.getUniformLocation(program, "materialSpecular"), 
       flatten(materialSpecular) );	       
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess);

    //event listeners for buttons 
    document.getElementById( "xButton" ).onclick = rotateX;
    document.getElementById( "yButton" ).onclick = rotateY;
    document.getElementById( "zButton" ).onclick = rotateZ;
    document.getElementById( "pButton" ).onclick = function() {paused=!paused;};
    document.getElementById( "dButton" ).onclick = function() {depthTest=!depthTest;};
	
	// event handlers for mouse input (borrowed from "Learning WebGL" lesson 11)
	//canvas.onmousedown = handleMouseDown;
    //document.onmouseup = handleMouseUp;
    //document.onmousemove = handleMouseMove;

	document.addEventListener('keydown', function(event) {
		// keyboard "w"
		if(event.keyCode == 87) {
			if(state == stop)
				state = moveForward;
		}
		// keyboard "s"
		else if(event.keyCode == 83) {
			if(state == stop)
				state = moveBackward;
		}
		// keyboard "a"
		else if(event.keyCode == 65) {
			if(state == stop)
				state = moveLeft;
		}
		// keyboard "d"
		else if(event.keyCode == 68) {
			if(state == stop)
				state = moveRight;
		}
		// keyboard "q"
		else if(event.keyCode == 81) {
			if(state == stop)
				state = turnLeft;
		}
		// keyboard "e"
		else if(event.keyCode == 69) {
			if(state == stop)
				state = turnRight;
		}
	});

    testRender();
};

function render() {
	modeling = mult(rotate(theta[xAxis], 1, 0, 0),
	                mult(rotate(theta[yAxis], 0, 1, 0),rotate(theta[zAxis], 0, 0, 1)));

	//if (paused)	modeling = moonRotationMatrix;
	eyePosition = [0, 0, 2]
	viewing = lookAt(eyePosition, [0,0,0], [0,1,0]);

	projection = perspective(45, 1.0, 1.0, 3.0);

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    if (! paused) theta[axis] += 1.0;
	if (depthTest) gl.enable(gl.DEPTH_TEST); else gl.disable(gl.DEPTH_TEST);

    gl.uniformMatrix4fv( viewingLoc,    0, flatten(viewing) );
	gl.uniformMatrix4fv( projectionLoc, 0, flatten(projection) );
	gl.uniformMatrix4fv( lightMatrixLoc,0, flatten(moonRotationMatrix) );
  
	for (i = -maze_half_len; i <= maze_half_len; i++) {
		for (j = 0; j < 2; j++) {
			for (k = -maze_half_len; k <= maze_half_len; k++) {
				if (maze[i+maze_half_len][k+maze_half_len] | j == 0){
					var cloned = mult(modeling, mult(translate(0.1*i, 0.1*j, 0.1*k), scale(0.1, 0.1, 0.1)));
					gl.uniformMatrix4fv( modelingLoc,   0, flatten(cloned) );
					gl.drawArrays( gl.TRIANGLES, 0, numVertices );
				}
			}
		}
	}

    requestAnimFrame( render );
}

function action() {
	// state for moveing forward, backward, left and right
	if(state >= moveForward && state <= moveRight) {
		// check if a wall exist
		if(maze[myPosition[0] + moveDir[(face + state - 1) % 4][0]]
		[myPosition[1] + moveDir[(face + state - 1) % 4][1]] == 0) {
			// check if animation mode 
			if(animated) {
				animationCount = 1;
				// use myPrePosition to store the information of previous position
				myPrePosition[0] = myPosition[0];
				myPrePosition[1] = myPosition[1];
				state += animate;
			}
			// when the wall doesn't exist, just move
			for(i = 0; i < 2; i++) {
				myPosition[i] += moveDir[(face + state - 1) % 4][i];
			}
		}
	}
	else if(state == turnLeft) {
		// check if animation mode 
		if(animated) {
			animationCount = 1;
			// use preFace to store the previous information
			preFace = face;
			state += animate;
		}
		face = (face + 1) % 4;
	}
	else if(state == turnRight) {
		// check if animation mode 
		if(animated) {
			animationCount = 1;
			// use preFace to ...
			preFace = face;
			state += animate;
		}
		face = (face - 1 + 4) % 4;
	}
	// if there is an animation running, state won't be "stop"
	if(animationCount == 0)
		state = stop;
}

function setEyePosition() {
	if(state >= (moveForward + animate) && state <= (moveRight + animate)) {
		eyePosition[0] = (-maze_half_len + myPrePosition[0] + 
			(myPosition[0] - myPrePosition[0]) * 0.1 * animationCount) * 0.1;
		eyePosition[2] = (-maze_half_len + myPrePosition[1] +
			(myPosition[1] - myPrePosition[1]) * 0.1 * animationCount) * 0.1;
		animationCount++;
		if(animationCount == 10)
			animationCount = 0;
	}
	else {
		eyePosition[0] = (-maze_half_len + myPosition[0]) * 0.1;
		eyePosition[2] = (-maze_half_len + myPosition[1]) * 0.1;
	}
}

function setFaceDirection() {
	if(state >= (turnLeft + animate) && state <= (turnRight + animate)) {
		for(i = 0; i < 3; i++) {
			faceDirection[i] = faceDir[preFace][i] + 
				(faceDir[face][i] - faceDir[preFace][i]) * 0.1 * animationCount;
		}
		animationCount++;
		if(animationCount == 10)
			animationCount = 0;
	}
	else {
		for(i = 0; i < 3; i++) {
			faceDirection[i] = faceDir[face][i];
		}
	}
}

function testRender() {
	modeling = mult(rotate(0, 1, 0, 0),
	                mult(rotate(0, 0, 1, 0),rotate(0, 0, 0, 1)));

	//if (paused)	modeling = moonRotationMatrix;
	
	action();
	
	setEyePosition();
	setFaceDirection();
	
	viewing = lookAt(eyePosition, faceDirection, [0,1,0]);

	projection = perspective(100, 1.0, 0.01, 3.0);

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    //if (! paused) theta[axis] += 1.0;
	if (depthTest) gl.enable(gl.DEPTH_TEST); else gl.disable(gl.DEPTH_TEST);

    gl.uniformMatrix4fv( viewingLoc,    0, flatten(viewing) );
	gl.uniformMatrix4fv( projectionLoc, 0, flatten(projection) );
	gl.uniformMatrix4fv( lightMatrixLoc,0, flatten(moonRotationMatrix) );
  
	for (i = -maze_half_len; i <= maze_half_len; i++) {
		for (j = 0; j < 2; j++) {
			for (k = -maze_half_len; k <= maze_half_len; k++) {
				if (maze[i+maze_half_len][k+maze_half_len] | j == 0){
					var cloned = mult(modeling, mult(translate(0.1*i, 0.1*j, 0.1*k), scale(0.1, 0.1, 0.1)));
					gl.uniformMatrix4fv( modelingLoc,   0, flatten(cloned) );
					gl.drawArrays( gl.TRIANGLES, 0, numVertices );
				}
			}
		}
	}

    requestAnimFrame( testRender );
}
