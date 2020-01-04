
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

var myPosition = [1, 1];
var state = 0;

var stop = 0;
var moveForward = 1;
var moveLeft = 2;
var moveBackward = 3;
var moveRight = 4;
var turnLeft = 5;
var turnRight = 6;
var newGame = 7;
var mapping = 8;
var nextGame = 9;
var main = 10;
var starting = 11;
var animate = 100;

var mappingHight = 0.08;

var nextMazeSize = 2;

var mazeColor = [1, 1, 0.8];

var face = 3;
var faceDirection = [0, 0, -1];
var faceDir = [[0, 0, -1],
				[-1, 0, 0],
				[0, 0, 1],
				[1, 0, 0]];

var animated = 1;
var animationCount = 0;
var myPrePosition = [3, 3];
var preFace = 0;

var animationFrame = [18, 15, 400, 50, 200];
var moveAnimation = 0;
var turnAnimation = 1;
var newGameAnimation = 2;
var mappingAnimation = 3;
var startingAnimation = 4;

var moveDir = [[0, -1],
				[-1, 0],
				[0, 1],
				[1, 0]];

var endPointTheta = [45, 45, 0];

var bgm = new Audio();			// bgm setting
bgm.src = 'BGM.mp3';
bgm.loop = true;
bgm.volume = 0.5;
var walk_sound = new Audio();	// walking sound effect setting
walk_sound.src = 'walk.m4a';
var win = new Audio();
win.src = 'win.m4a';
var musicStarted = true; 	// music control


// Reset the wall and path of the maze
function maze_reset(maze){
	for (i = 0; i < maze.length; i++){
		for (j = 0; j < maze.length; j++){
			if (i % 2 == 0 | j % 2 == 0){
					// wall
					maze[i][j] = 1;
				} else {
					// path grid point
					maze[i][j] = 0;
				}
		}
	}
}

// random generate maze by recursive backtracker method
function maze_algorithm(maze, size, fix_end){
	// 1. Choose the start
	// 2. Choose a neighbor to move, mark the position, and break the wall
	// 3. If there is no neighbor can be reached, go backward and search neighbor again until we go back to the start
	var curx = 0;				// current x position
	var cury = 0;				// current y position
	var path = [];				// record the path I walked
	var ava_direction = [];  	// available direction (0, 1, 2, 3)
	var grid = [];				// record the grid I have been to
	var possible_end = [];		// possible end 
	var pre_step = true;		// true -> foreward, false -> backward
	
	
	// Grid initialize
	for (i = 0; i < size; i++){
		grid.push([]);
		for (j = 0; j < size; j++){
			grid[i].push(false);
		}
	}
	
	// start at 0, 0, and move the first setp
	grid[curx][cury] = true;
	path.push([0, 0]);
	if (size != 1){ // avoid the case which the size equals to 1
		if (Math.random() < 0.5){
			maze[2*curx + 1 + 1][2*cury + 1] = 0;
			curx += 1;
		} else{
			maze[2*curx + 1][2*cury + 1 + 1] = 0;
			cury += 1;
		}
		grid[curx][cury] = true;
		path.push([curx, cury]);
	} else{
		possible_end.push([0, 0]);
	}
	
	// start the recursive loop
	//for (i = 0; i < 4; i++){
	while (curx != 0 | cury != 0){
		// Check the neighbor
		ava_direction = [];
		// left
		try{
			if (!grid[curx][cury - 1] & cury > 0){
				ava_direction.push(0);
			}
		} catch(e){
		}
		// up
		try{
			if (!grid[curx - 1][cury] & curx > 0){
				ava_direction.push(1);
			}
		} catch(e){
		}
		// right
		try{
			if (!grid[curx][cury + 1] & cury < size - 1){
				ava_direction.push(2);
			}
		} catch(e){
		}
		// down
		try{
			if (!grid[curx + 1][cury] & curx < size - 1){
				ava_direction.push(3);
			}
		} catch(e){
		}
		
		if (ava_direction.length > 0){
			// pick a random neighbor to move
			var temp = ava_direction[Math.floor(Math.random()*ava_direction.length)];
			maze[2*curx+1 + moveDir[temp][0]][2*cury+1 + moveDir[temp][1]] = 0;
			curx += moveDir[temp][0];
			cury += moveDir[temp][1];
			grid[curx][cury] = true;
			path.push([curx, cury]);
			pre_step = true;
		}else{
			// move backword
			if (pre_step){
				possible_end.push([curx, cury]);
				pre_step = false;
			}
			path.pop();
			curx = path[path.length - 1][0];
			cury = path[path.length - 1][1];
		}
	}
	
	// check if fix the end
	if (fix_end[0]){
		fix_end[1] = maze.length - 2;
		fix_end[2] = maze.length - 2;
	}else{
		var temp2 = Math.floor(Math.random()*possible_end.length);
		fix_end[1] = 2 * possible_end[temp2][0] + 1;
		fix_end[2] = 2 * possible_end[temp2][1] + 1;
	}
}

// Generate random maze
function maze_generate(maze, size, fix_end){
	// maze: the plotting map
	// size: the size of the grid
	// fix_end: if fix end at (maze.length - 2, maze.length - 2) -> true, 
	//			it will return [true, endx, endy]
	
	var pre_len = maze.length;	// record the previous maze size
	
	// Initialization
	if (pre_len < 2*size + 1){
		// add the column
		for (i = 0; i < pre_len; i++){
			for (j = pre_len; j < 2*size + 1; j++){
				maze[i].push(1);
			}
		}
		// add the row
		for (i = pre_len; i < 2*size + 1; i++){
			maze.push([]);
			for (j = 0; j < 2*size + 1; j++){
				maze[i].push(1);
			}
		}
	} else if (pre_len > 2*size + 1){
		// delete the row
		for (i = 2*size + 1; i < pre_len; i++){
			maze.pop();
		}
		// delete the column
		for (i = 0; i < 2*size + 1; i++){
			for (j = 2*size + 1; j < pre_len; j++){
				maze[i].pop();
			}
		}
	}
	maze_reset(maze);
	maze_algorithm(maze, size, fix_end);
}


// Creating maze
var maze = [];
var maze_size = 2;
var end = [false, 0, 0];
maze_generate(maze, maze_size, end);
//console.log(maze);
//console.log(end);

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

var endPointRotationMatrix = [[-0.37251620408564196, -0.22499164665912458, -0.9003390675891072, 0],
	[0.7384982911710434, 0.5156581606346375, -0.4344156250738973, 0],
	[0.5620070743603364, -0.8267257225371119, -0.025935074019875277, 0],
	[0, 0, 0, 1]];
endPointRotationMatrix.matrix = true;

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

    endPointRotationMatrix = mult(newRotationMatrix, endPointRotationMatrix);

	console.log(endPointRotationMatrix);

    lastMouseX = newX
    lastMouseY = newY;
}

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

	
	// event handlers for mouse input (borrowed from "Learning WebGL" lesson 11)
	//canvas.onmousedown = handleMouseDown;
    //document.onmouseup = handleMouseUp;
    //document.onmousemove = handleMouseMove;

	document.addEventListener('keydown', function(event) {
		// keyboard "w"
		if(event.keyCode == 87) {
			if(state == stop) {
				state = moveForward;
			}
		}
		// keyboard "s"
		else if(event.keyCode == 83) {
			if(state == stop) {
				state = moveBackward;
			}
			else if(state == main) {
				state = starting;
			}
		}
		// keyboard "a"
		else if(event.keyCode == 65) {
			if(state == stop) {
				state = moveLeft;
			}
		}
		// keyboard "d"
		else if(event.keyCode == 68) {
			if(state == stop) {
				state = moveRight;
			}
		}
		// keyboard "q"
		else if(event.keyCode == 81) {
			if(state == stop) {
				state = turnLeft;
			}
		}
		// keyboard "e"
		else if(event.keyCode == 69) {
			if(state == stop) {
				state = turnRight;
			}
		}
		// keyboard "n"
		else if(event.keyCode == 78) {
			if(state == stop)
				state = newGame;
		}
		// keyboard "m"
		else if(event.keyCode == 77) {
			if(state == stop)
				state = mapping;
			else if(state == mapping) {
				state = stop;
				animationCount = 0;
			}
		}
		// keyboard "p"
		else if(event.keyCode == 80) {
			if(state == stop)
				state = nextGame;
		}
		// keyboard "o"
		else if(event.keyCode == 79) {
			if (musicStarted){
				musicStarted = false;
				bgm.muted = true;
				walk_sound.muted = true;
				win.muted = true;
			} else {
				musicStarted = true;
				bgm.muted = false;
				walk_sound.muted = false;
				win.muted = false;
			}
		}
		// keyboard ","
		else if(event.keyCode == 188) {
			bgm.volume -= 0.1;
		}
		// keyboard "."
		else if(event.keyCode == 190) {
			bgm.volume += 0.1;
		}
	});

	state = main;
    mainRender();
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
  
	for (i = -maze_size; i <= maze_size; i++) {
		for (j = 0; j < 2; j++) {
			for (k = -maze_size; k <= maze_size; k++) {
				if (maze[i+maze_size][k+maze_size] | j == 0){
					var cloned = mult(modeling, mult(translate(0.1*i, 0.1*j, 0.1*k), scale(0.1, 0.1, 0.1)));
					gl.uniformMatrix4fv( modelingLoc,   0, flatten(cloned) );
					gl.drawArrays( gl.TRIANGLES, 0, numVertices );
				}
			}
		}
	}
    requestAnimFrame( render );
}

function initMyPosition() {
	myPosition[0] = 1;
	myPosition[1] = 1;
}

function initFace() {
	face = 3;
}

function action() {
	// state for moveing forward, backward, left and right
	if(state >= moveForward && state <= moveRight) {
		// check if a wall exist
		if(maze[myPosition[0] + moveDir[(face + state - 1) % 4][0]]
		[myPosition[1] + moveDir[(face + state - 1) % 4][1]] == 0) {
			// check if animation mode 
			if(animated) {
				Music(walk_sound);
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
	else if(state == newGame) {
		// check if animat..
		if(animated) {
			animationCount = 1;
			preFace = face;
			state += animate;
		}
		initMyPosition();
		initFace();
		if(!animated) {
			maze_size = nextMazeSize;
			maze_generate(maze, maze_size, end);
			changeMazeColor();
		}
	}
	else if(state == mapping) {
		if(animationCount == animationFrame[mappingAnimation])
			;
		else if(animated) {
			animationCount = 1;
			state += animate;
		}
		return;
	}
	else if(state == nextGame) {
		Music(win);
		nextMazeSize = maze_size + 1;
		state = newGame;
		return;
	}
	else if(state == main) {
		return;
	}
	else if(state == starting) {
		if(animated) {
			animationCount = 1;
			state += animate;
			Music(bgm);
		}
		if(!animated) {
			state = stop;
			gameRender();
			return;
		}
	}
	// if there is an animation running, state won't be "stop"
	if(animationCount == 0)
		state = stop;
}

function setEyePosition() {
	if(state >= (moveForward + animate) && state <= (moveRight + animate)) {
		eyePosition[0] = (-maze_size + myPrePosition[0] + 
			(myPosition[0] - myPrePosition[0]) / animationFrame[moveAnimation] * animationCount) * 0.1;
		eyePosition[2] = (-maze_size + myPrePosition[1] +
			(myPosition[1] - myPrePosition[1]) / animationFrame[moveAnimation] * animationCount) * 0.1;
		// change eyePosition[1] to make the movement more human
		eyePosition[1] = 0.1 + 
			Math.sin(Math.PI / animationFrame[moveAnimation] * animationCount) * 0.005;
		animationCount++;
		if(animationCount == animationFrame[moveAnimation])
			animationCount = 0;
	}
	else if(state == newGame + animate) {
		if(animationCount < animationFrame[newGameAnimation] / 2) {
			// 4 is because pi / 2 and animationFrame[newGameAnimation] / 2
			eyePosition[1] = 0.1 + Math.sin(Math.PI / 4 / animationFrame[newGameAnimation] *
				animationCount) * 2;
		}
		else {
			eyePosition[1] = 0.1 + Math.sin(Math.PI / 4 / animationFrame[newGameAnimation] *
				(animationFrame[newGameAnimation] - animationCount)) * 2;
		}
		// for maze fade out and fade in
		if(animationCount < animationFrame[newGameAnimation] / 2) {
			for(i = 0; i < 36; i++) {
			colorsArray[i][3] = 1 - 1 / (animationFrame[newGameAnimation] / 2) * animationCount;
			}
			var cBuffer = gl.createBuffer();
			gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
			gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
			var vColor = gl.getAttribLocation( program, "vColor" );
			gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
			gl.enableVertexAttribArray( vColor );
		}
		else {
			for(i = 0; i < 36; i++) {
				colorsArray[i][3] = 1 / (animationFrame[newGameAnimation] / 2) * 
					(animationCount - animationFrame[newGameAnimation] / 2);
			}
			var cBuffer = gl.createBuffer();
			gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
			gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
			var vColor = gl.getAttribLocation( program, "vColor" );
			gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
			gl.enableVertexAttribArray( vColor );
		}
		// when count to half, generate the new maze, init the position
		if(animationCount == animationFrame[newGameAnimation] / 2) {
			maze_size = nextMazeSize;
			maze_generate(maze, maze_size, end);
			changeMazeColor();
			eyePosition[0] = (-maze_size + myPosition[0]) * 0.1;
			eyePosition[2] = (-maze_size + myPosition[1]) * 0.1;
		}
	}
	else if(state == mapping) {
		eyePosition[1] = 0.1 + maze_size * mappingHight;
	}
	else if(state == mapping + animate) {
		eyePosition[1] = 0.1 + (maze_size * mappingHight) / animationFrame[mappingAnimation] 
			* animationCount;
	}
	else {
		eyePosition[0] = (-maze_size + myPosition[0]) * 0.1;
		eyePosition[2] = (-maze_size + myPosition[1]) * 0.1;
		eyePosition[1] = 0.1;
	}
}

function setFaceDirection() {
	if(state >= (turnLeft + animate) && state <= (turnRight + animate)) {
		for(i = 0; i < 3; i++) {
			faceDirection[i] = eyePosition[i] + faceDir[preFace][i] + 
				(faceDir[face][i] - faceDir[preFace][i]) / animationFrame[turnAnimation] * animationCount;
		}
		animationCount++;
		if(animationCount == animationFrame[turnAnimation])
			animationCount = 0;
	}
	else if(state == newGame + animate) {
		if(animationCount < animationFrame[newGameAnimation] / 2) {
			faceDirection[0] = (eyePosition[0] + faceDir[preFace][0]) / 
				(animationFrame[newGameAnimation] / 2) * 
				(animationFrame[newGameAnimation] / 2 - animationCount);
			faceDirection[2] = (eyePosition[2] + faceDir[preFace][2]) / 
				(animationFrame[newGameAnimation] / 2) * 
				(animationFrame[newGameAnimation] / 2 - animationCount);
		}
		else {
			faceDirection[0] = (eyePosition[0] + faceDir[face][0]) / 
				(animationFrame[newGameAnimation] / 2) * 
				(animationCount - animationFrame[newGameAnimation] / 2) + 0.00000000000001;
			faceDirection[2] = (eyePosition[2] + faceDir[face][2]) / 
				(animationFrame[newGameAnimation] / 2) * 
				(animationCount - animationFrame[newGameAnimation] / 2);
		}
		animationCount++;
		if(animationCount == animationFrame[newGameAnimation])
			animationCount = 0;
	}
	else if(state == mapping) {
		faceDirection[0] = (-maze_size + end[1]) * 0.1 + 0.00000000000001;
		faceDirection[1] = 0.1;
		faceDirection[2] = (-maze_size + end[2]) * 0.1;
	}
	else if(state == mapping + animate) {
		faceDirection[1] = 0.1;
		faceDirection[0] = (eyePosition[0] + faceDir[face][0]) + 
			((-maze_size + end[1]) * 0.1 - (eyePosition[0] + faceDir[face][0])) 
			/ animationFrame[mappingAnimation] * animationCount + 0.00000000000001;
		faceDirection[2] = (eyePosition[2] + faceDir[face][2]) + 
			((-maze_size + end[2]) * 0.1 - (eyePosition[2] + faceDir[face][2])) 
			/ animationFrame[mappingAnimation] * animationCount;
		if(animationCount != animationFrame[mappingAnimation])
			animationCount++;
		else 
			state = mapping;
	}
	else if(state == starting + animate) {
		if(animationCount == animationFrame[startingAnimation] / 2) {
			for(i = 0; i < 3; i++) {
				faceDirection[i] = eyePosition[i] + faceDir[face][i];
			}
		}
		for(i = 0; i < 36; i++) {
			colorsArray[i][3] = 1 / (animationFrame[startingAnimation] / 2) * 
				(animationCount - animationFrame[startingAnimation] / 2);
		}
		var cBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
		var vColor = gl.getAttribLocation( program, "vColor" );
		gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vColor );
		animationCount++;
		if(animationCount == animationFrame[startingAnimation])
			animationCount = 0;
	}
	else {
		for(i = 0; i < 3; i++) {
			faceDirection[i] = eyePosition[i] + faceDir[face][i];
		}
	}
}

function setMazeColor(R, G, B) {
	for(i = 0; i < 36; i++) {
		colorsArray[i][0] = R;
		colorsArray[i][1] = G;
		colorsArray[i][2] = B;
	}
	var cBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
	var vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );
}

function changeMazeColor() {
	if(maze_size < 4) {
		mazeColor[0] = 1;
		mazeColor[1] = 1;
		mazeColor[2] = 0.8;
	}
	else if(maze_size < 6) {
		mazeColor[0] = 0.8;
		mazeColor[1] = 0.6;
		mazeColor[2] = 0.3;
	}
	else if(maze_size < 8){
		mazeColor[0] = 0.6;
		mazeColor[1] = 1;
		mazeColor[2] = 0.8;
	}
	else if(maze_size < 10){
		mazeColor[0] = 1;
		mazeColor[1] = 0.5;
		mazeColor[2] = 0.5;
	}
	else {
		for(i = 0; i < 3; i++)
			mazeColor[i] = Math.random();
	}
}

// play music function
function Music(item){
	if (musicStarted){
		item.play();
	} else{
		return;
	}
}

function gameRender() {
	modeling = mult(rotate(0, 1, 0, 0),
	                mult(rotate(0, 0, 1, 0),rotate(0, 0, 0, 1)));

	//if (paused)	modeling = moonRotationMatrix;
	
	action();
	
	setEyePosition();
	setFaceDirection();
	
	setMazeColor(mazeColor[0], mazeColor[1], mazeColor[2]);
	
	viewing = lookAt(eyePosition, faceDirection, [0,1,0]);

	projection = perspective(100, 1.0, 0.01, 3.0);

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    //if (! paused) theta[axis] += 1.0;
	if (depthTest) gl.enable(gl.DEPTH_TEST); else gl.disable(gl.DEPTH_TEST);

    gl.uniformMatrix4fv( viewingLoc,    0, flatten(viewing) );
	gl.uniformMatrix4fv( projectionLoc, 0, flatten(projection) );
	gl.uniformMatrix4fv( lightMatrixLoc,0, flatten(moonRotationMatrix) );
  
	for (i = -maze_size; i <= maze_size; i++) {
		for (j = 0; j < 2; j++) {
			for (k = -maze_size; k <= maze_size; k++) {
				if (maze[i+maze_size][k+maze_size] | j == 0){
					var cloned = mult(modeling, mult(translate(0.1*i, 0.1*j, 0.1*k), scale(0.1, 0.1, 0.1)));
					gl.uniformMatrix4fv( modelingLoc,   0, flatten(cloned) );
					gl.drawArrays( gl.TRIANGLES, 0, numVertices );
				}
			}
		}
	}
	
	setMazeColor(0.4, 0.8, 1);
	endPointTheta[xAxis] = (endPointTheta[xAxis] + 1) % 360;
	endPointTheta[yAxis] = (endPointTheta[yAxis] + 1) % 360;
	var cloned = mult(modeling, mult(mult(translate((-maze_size + end[1]) * 0.1, 0.15,
		(-maze_size + end[2]) * 0.1), scale(0.02, 0.02, 0.02)), 
		mult(rotate(endPointTheta[xAxis], 1, 0, 0), mult(rotate(endPointTheta[yAxis], 0, 1, 0),
		rotate(endPointTheta[zAxis], 0, 0, 1)))));
	gl.uniformMatrix4fv( modelingLoc,   0, flatten(cloned));
	gl.uniformMatrix4fv( lightMatrixLoc,0, flatten(endPointRotationMatrix) );
	gl.drawArrays( gl.TRIANGLES, 0, numVertices );

	if(myPosition[0] == end[1] && myPosition[1] == end[2] && state == stop)
		state = nextGame;
    requestAnimFrame( gameRender );
}

function drawLetter(L, x, y, size) {
	if(L == " ")
		return;
	else if(L == "&") {
		for (i = -letter_size; i <= letter_size; i++) {
			for (j = -letter_size; j <= letter_size; j++) {
				if(letter[27][letter_size + i][letter_size + j] == 1){
					var cloned = mult(modeling, mult(translate(size * j + x, -size * i + y, 0), 
						scale(size, size, size)));
					gl.uniformMatrix4fv( modelingLoc,   0, flatten(cloned) );
					gl.drawArrays( gl.TRIANGLES, 0, numVertices );
				}
			}
		}
	}
	else if(L.charCodeAt(0) >= "A".charCodeAt(0) && L.charCodeAt(0) <= "Z".charCodeAt(0)){
		for (i = -letter_size; i <= letter_size; i++) {
			for (j = -letter_size; j <= letter_size; j++) {
				if(letter[L.charCodeAt(0) - "A".charCodeAt(0)][letter_size + i][letter_size + j] == 1){
					var cloned = mult(modeling, mult(translate(size * j + x, -size * i + y, 0), 
						scale(size, size, size)));
					gl.uniformMatrix4fv( modelingLoc,   0, flatten(cloned) );
					gl.drawArrays( gl.TRIANGLES, 0, numVertices );
				}
			}
		}
	}
	else {
		for (i = -letter_size; i <= letter_size; i++) {
			for (j = -letter_size; j <= letter_size; j++) {
				if(letter[26][letter_size + i][letter_size + j] == 1){
					var cloned = mult(modeling, mult(translate(size * j + x, -size * i + y, 0), 
						scale(size, size, size)));
					gl.uniformMatrix4fv( modelingLoc,   0, flatten(cloned) );
					gl.drawArrays( gl.TRIANGLES, 0, numVertices );
				}
			}
		}
	}
}

function drawSentence(S, y, size) {
	if(S.length % 2 == 0) {
		for(now = 0; now < S.length; now++) {
			if(now - S.length / 2 < 0) {
				drawLetter(S[now], (now - S.length / 2) * (letter_size * 2 + 2) * size + 
					(letter_size + 1) * size, y, size);
			}
			else {	
				drawLetter(S[now], (now - S.length / 2 + 1) * (letter_size * 2 + 2) * size -
					(letter_size + 1) * size, y, size);
			}
		}
	}
	else {
		for(now = 0; now < S.length; now++) {
			drawLetter(S[now], (now - Math.floor(S.length / 2)) * 6 * size, y, size);

		}
	}
}

var blablabla = [["BEGIN YOUR JOURNEY", 0.08],
				[" ", 0.01],
				["TIME TO GO", 0.08],
				["YOU SHOULD START", 0.08],
				["START NOW", 0.08],
				["PRESS THE BUTTON", 0.08],
				["DO IT NOW", 0.08],
				["PLEASE JUST DO IT", 0.08],
				["IM BEGGING YOU", 0.08],
				["PLEASE", 0.08],
				["...", 0.08],
				[" ", 0.01],
				["OVER MY DEAD BODY", 0.08],
				["YO MAMA SO FAT", 0.08],
				["DO YOU KNOW DA WAE", 0.08],
				["GO GO POWER RANGER", 0.08],
				["THE CAKE IS A LIE", 0.08],
				["...", 0.08],
				["QQ", 0.08]];

var blablablaNow = 0;
var blablablaCount = 0;
var blablablaY = -1.2;
var shake = 0.08;

var pressEnable = 1;

function mainRender() {
	modeling = mult(rotate(0, 1, 0, 0),
	                mult(rotate(0, 0, 1, 0),rotate(0, 0, 0, 1)));

	//if (paused)	modeling = moonRotationMatrix;
	
	viewing = lookAt([0, 0, 5], [0, 0, 0], [0, 1, 0]);

	projection = perspective(90, 1.0, 0.001, 100.0);

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    //if (! paused) theta[axis] += 1.0;
	if (depthTest) gl.enable(gl.DEPTH_TEST); else gl.disable(gl.DEPTH_TEST);

    gl.uniformMatrix4fv( viewingLoc,    0, flatten(viewing) );
	gl.uniformMatrix4fv( projectionLoc, 0, flatten(projection) );
	gl.uniformMatrix4fv( lightMatrixLoc,0, flatten(moonRotationMatrix) );
	
	if(state == starting + animate) {
		if(animationCount < animationFrame[startingAnimation] / 2) {
			for(i = 0; i < 36; i++) {
				colorsArray[i][3] = 1 - 1 / (animationFrame[startingAnimation] / 2) * animationCount;
			}
			var cBuffer = gl.createBuffer();
			gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
			gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
			var vColor = gl.getAttribLocation( program, "vColor" );
			gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
			gl.enableVertexAttribArray( vColor );
		}
		animationCount++;
		if(animationCount == animationFrame[startingAnimation] / 2) {
			gameRender();
			return;
		}
	}
	
	setMazeColor(0.1, 0.1, 0.5);
	drawSentence("DAT MAZE", 3, 0.2);
	
	drawSentence("THE ONE AND ONLY MAZE", 2, 0.076);
	
	if(blablablaCount % 50 == 0)
		pressEnable *= -1;
	//setMazeColor(0, 0, 0);
	if(pressEnable == 1)
		drawSentence("PRESS S TO START", 0, 0.08);
	
	if(blablablaCount % 20 == 0)
		shake *= -1;
	//setMazeColor(0, 0, 0);
	if(blablablaCount == 400) {
		if(blablablaNow == blablabla.length - 1)
			;
		else
			blablablaNow++;
		blablablaCount = 0;
	}
	drawSentence(blablabla[blablablaNow][0], blablablaY + shake, blablabla[blablablaNow][1]);
	blablablaCount++;

	drawSentence("CREATED BY W.SHEN & J.CHEN", -3, 0.03)
	
	action();
	if(state == stop)
		return;
    requestAnimFrame( mainRender );
}