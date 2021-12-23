var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Normal;
    uniform mat4 u_MvpMatrix;
    uniform mat4 u_modelMatrix;
    uniform mat4 u_normalMatrix;
    varying vec3 v_Normal;
    varying vec3 v_PositionInWorld;
    void main(){
        gl_Position = u_MvpMatrix * a_Position;
        v_PositionInWorld = (u_modelMatrix * a_Position).xyz; 
        v_Normal = normalize(vec3(u_normalMatrix * a_Normal));
    }    
`;

var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec3 u_LightPosition;
    uniform vec3 u_ViewPosition;
    uniform float u_Ka;
    uniform float u_Kd;
    uniform float u_Ks;
    uniform float u_shininess;
    uniform vec3 u_Color;
    varying vec3 v_Normal;
    varying vec3 v_PositionInWorld;
    void main(){
        // let ambient and diffuse color are u_Color 
        // (you can also input them from ouside and make them different)
        vec3 ambientLightColor = u_Color;
        vec3 diffuseLightColor = u_Color;
        // assume white specular light (you can also input it from ouside)
        vec3 specularLightColor = vec3(1.0, 1.0, 1.0);        

        vec3 ambient = ambientLightColor * u_Ka;

        vec3 normal = normalize(v_Normal);
        vec3 lightDirection = normalize(u_LightPosition - v_PositionInWorld);
        float nDotL = max(dot(lightDirection, normal), 0.0);
        vec3 diffuse = diffuseLightColor * u_Kd * nDotL;

        vec3 specular = vec3(0.0, 0.0, 0.0);
        if(nDotL > 0.0) {
            vec3 R = reflect(-lightDirection, normal);
            // V: the vector, point to viewer       
            vec3 V = normalize(u_ViewPosition - v_PositionInWorld); 
            float specAngle = clamp(dot(R, V), 0.0, 1.0);
            specular = u_Ks * pow(specAngle, u_shininess) * specularLightColor; 
        }

        gl_FragColor = vec4( ambient + diffuse + specular, 1.0 );
    }
`;

function compileShader(gl, vShaderText, fShaderText){
    //////Build vertex and fragment shader objects
    var vertexShader = gl.createShader(gl.VERTEX_SHADER)
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    //The way to  set up shader text source
    gl.shaderSource(vertexShader, vShaderText)
    gl.shaderSource(fragmentShader, fShaderText)
    //compile vertex shader
    gl.compileShader(vertexShader)
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.log('vertex shader ereror');
        var message = gl.getShaderInfoLog(vertexShader); 
        console.log(message);//print shader compiling error message
    }
    //compile fragment shader
    gl.compileShader(fragmentShader)
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.log('fragment shader ereror');
        var message = gl.getShaderInfoLog(fragmentShader);
        console.log(message);//print shader compiling error message
    }

    /////link shader to program (by a self-define function)
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    //if not success, log the program info, and delete it.
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        alert(gl.getProgramInfoLog(program) + "");
        gl.deleteProgram(program);
    }

    return program;
}

/////BEGIN:///////////////////////////////////////////////////////////////////////////////////////////////
/////The folloing three function is for creating vertex buffer, but link to shader to user later//////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function initAttributeVariable(gl, a_attribute, buffer){
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
}

function initArrayBufferForLaterUse(gl, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Store the necessary information to assign the object to the attribute variable later
  buffer.num = num;
  buffer.type = type;

  return buffer;
}

function initVertexBufferForLaterUse(gl, vertices, normals, texCoords){
  var nVertices = vertices.length / 3;

  var o = new Object();
  o.vertexBuffer = initArrayBufferForLaterUse(gl, new Float32Array(vertices), 3, gl.FLOAT);
  if( normals != null ) o.normalBuffer = initArrayBufferForLaterUse(gl, new Float32Array(normals), 3, gl.FLOAT);
  if( texCoords != null ) o.texCoordBuffer = initArrayBufferForLaterUse(gl, new Float32Array(texCoords), 2, gl.FLOAT);
  //you can have error check here
  o.numVertices = nVertices;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return o;
}
/////END://///////////////////////////////////////////////////////////////////////////////////////////////
/////The folloing three function is for creating vertex buffer, but link to shader to user later//////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

///// normal vector calculation (for the cube)
function getNormalOnVertices(vertices){
  var normals = [];
  var nTriangles = vertices.length/9;
  for(let i=0; i < nTriangles; i ++ ){
      var idx = i * 9 + 0 * 3;
      var p0x = vertices[idx+0], p0y = vertices[idx+1], p0z = vertices[idx+2];
      idx = i * 9 + 1 * 3;
      var p1x = vertices[idx+0], p1y = vertices[idx+1], p1z = vertices[idx+2];
      idx = i * 9 + 2 * 3;
      var p2x = vertices[idx+0], p2y = vertices[idx+1], p2z = vertices[idx+2];

      var ux = p1x - p0x, uy = p1y - p0y, uz = p1z - p0z;
      var vx = p2x - p0x, vy = p2y - p0y, vz = p2z - p0z;

      var nx = uy*vz - uz*vy;
      var ny = uz*vx - ux*vz;
      var nz = ux*vy - uy*vx;

      var norm = Math.sqrt(nx*nx + ny*ny + nz*nz);
      nx = nx / norm;
      ny = ny / norm;
      nz = nz / norm;

      normals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
  }
  return normals;
}

var mouseLastX, mouseLastY;
var mouseDragging = false;
var angleX = 0, angleY = 0;
var gl, canvas;
var mvpMatrix;
var modelMatrix;
var normalMatrix;
var nVertex;
var cameraX = 3, cameraY = 3, cameraZ = 7;
var shiba = [];
var fox = [];
var steak = [];
var pyramid = [];
var sphere = [];
var cube = [];
var backforth = 0;
var leftright = 0;
var zoomAngle = 50;
var leftarm = 30;
var rightarm = 30;
var leftelbow = 0;
var rightelbow = 0;


async function main(){
    canvas = document.getElementById('webgl');
    gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    program = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);

    gl.useProgram(program);

    program.a_Position = gl.getAttribLocation(program, 'a_Position'); 
    program.a_Normal = gl.getAttribLocation(program, 'a_Normal'); 
    program.u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix'); 
    program.u_modelMatrix = gl.getUniformLocation(program, 'u_modelMatrix'); 
    program.u_normalMatrix = gl.getUniformLocation(program, 'u_normalMatrix');
    program.u_LightPosition = gl.getUniformLocation(program, 'u_LightPosition');
    program.u_ViewPosition = gl.getUniformLocation(program, 'u_ViewPosition');
    program.u_Ka = gl.getUniformLocation(program, 'u_Ka'); 
    program.u_Kd = gl.getUniformLocation(program, 'u_Kd');
    program.u_Ks = gl.getUniformLocation(program, 'u_Ks');
    program.u_shininess = gl.getUniformLocation(program, 'u_shininess');
    program.u_Color = gl.getUniformLocation(program, 'u_Color'); 

    
    
    /////3D model shiba
    response = await fetch('shiba-inu.obj');
    text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      shiba.push(o);
    }


    
    /////3D model fox
    response = await fetch('fox.obj');
    text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      fox.push(o);
    }



    /////3D model Steak
    response = await fetch('steak.obj');
    text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      steak.push(o);
    }



    /////3D model Pyramid
    response = await fetch('pyramid.obj');
    text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      pyramid.push(o);
    }



    /////3D model Sphere
    response = await fetch('ball.obj');
    text = await response.text();
    obj = parseOBJ(text);
    for( let i=0; i < obj.geometries.length; i ++ ){
      let o = initVertexBufferForLaterUse(gl, 
                                          obj.geometries[i].data.position,
                                          obj.geometries[i].data.normal, 
                                          obj.geometries[i].data.texcoord);
      sphere.push(o);
    }


    ////cube
    //TODO-1: create vertices for the cube whose edge length is 2.0 (or 1.0 is also fine)
    //F: Face, T: Triangle
    cubeVertices = [ 2.0, 0.1, 2.0,  2.0, -0.1, 2.0,  -2.0, 0.1, 2.0,  -2.0, 0.1, 2.0,  2.0, -0.1, 2.0,  -2.0, -0.1, 2.0,   //this row for the face z = 2.0
                    2.0, 0.1, 2.0,  2.0, -0.1, 2.0,  2.0, 0.1, -2.0,  2.0, 0.1, -2.0,  2.0, -0.1, 2.0,  2.0, -0.1, -2.0,   //this row for the face x = 2.0
                    2.0, 0.1, 2.0,  -2.0, 0.1, -2.0,  -2.0, 0.1, 2.0,  -2.0, 0.1, -2.0,  2.0, 0.1, 2.0,  2.0, 0.1, -2.0,   //this row for the face y = 0.1
                    -2.0, 0.1, 2.0,  -2.0, 0.1, -2.0,  -2.0, -0.1, 2.0,  -2.0, -0.1, 2.0,  -2.0, 0.1, -2.0,  -2.0, -0.1, -2.0,   //this row for the face x = -2.0
                    2.0, -0.1, 2.0,  -2.0, -0.1, 2.0,  -2.0, -0.1, -2.0,  2.0, -0.1, 2.0,  -2.0, -0.1, -2.0,  2.0, -0.1, -2.0,   //this row for the face y = -0.2
                    2.0, 0.1, -2.0,  -2.0, 0.1, -2.0,  2.0, -0.1, -2.0,  2.0, -0.1, -2.0,  -2.0, 0.1, -2.0,  -2.0, -0.1, -2.0,   //this row for the face z = -2.0
                  ];
    cubeNormals = getNormalOnVertices(cubeVertices);
    let o = initVertexBufferForLaterUse(gl, cubeVertices, cubeNormals, null);
    cube.push(o);

    mvpMatrix = new Matrix4();
    modelMatrix = new Matrix4();
    normalMatrix = new Matrix4();

    gl.enable(gl.DEPTH_TEST);

    draw();//draw it once before mouse move

    canvas.onmousedown = function(ev){mouseDown(ev)};
    canvas.onmousemove = function(ev){mouseMove(ev)};
    canvas.onmouseup = function(ev){mouseUp(ev)};

    var slider1 = document.getElementById("BF");
    slider1.oninput = function() {
        backforth = this.value/60.0;
        draw();
    }

    var slider2 = document.getElementById("LR");
    slider2.oninput = function() {
        leftright = this.value/60.0;
        draw();
    }

    var slider3 = document.getElementById("Zoom");
    slider3.oninput = function() {
        zoomAngle = this.value;
        draw();
    }


    var slider4 = document.getElementById("Leftarm");
    slider4.oninput = function() {
        leftarm = this.value ;
        draw();
    }

    var slider5 = document.getElementById("Leftelbow");
    slider5.oninput = function() {
        leftelbow = this.value ;
        draw();
    }

    var slider6 = document.getElementById("Rightarm");
    slider6.oninput = function() {
        rightarm = this.value ;
        draw();
    }

    var slider7 = document.getElementById("Rightelbow");
    slider7.oninput = function() {
        rightelbow = this.value; 
        draw();
    }
}



/////Call drawOneObject() here to draw all object one by one 
////   (setup the model matrix and color to draw)
function draw(){
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let mdlMatrix = new Matrix4(); //model matrix of objects
    var matStack = [];
    function pushMatrix(){
        matStack.push(new Matrix4(mdlMatrix));
    }
    function popMatrix(){
        mdlMatrix= matStack.pop();
    }



    // Light Source
    pushMatrix();
    mdlMatrix.translate(0, 2.5, 0.0);
    mdlMatrix.scale(0.1, 1.0, 0.1);
    drawOneObject(cube, mdlMatrix, 1.0, 1.0, 1.0);
    popMatrix();


    // Cube (ground)
    drawOneObject(cube, mdlMatrix, 0.0, 0.5, 0.0);

    // Shiba
    pushMatrix();
    mdlMatrix.translate(-1.4, 0.13, -2.0);
    mdlMatrix.scale(300.0, 300.0, 300.0);
    drawOneObject(shiba, mdlMatrix, 0.8, 0.6, 0.0 );
    popMatrix();


    // Fox
    pushMatrix();
    mdlMatrix.translate(1.5, 0.1, -1.0);
    mdlMatrix.scale(0.01, 0.01, 0.01);
    drawOneObject(fox, mdlMatrix, 1.0, 0.3, 0.0 );
    popMatrix();



    /* Below are the owner's body,
      so they all move together */

    pushMatrix();
    mdlMatrix.translate(leftright, 0.0, backforth);



    /* Below are the owner's left-arm,
      so they all rotate together */


    // left arm
    pushMatrix();
    mdlMatrix.translate(-0.15, 0.45, 1.25);
    mdlMatrix.rotate(90, 1, 0, -1);
    mdlMatrix.rotate(-backforth*15 + (leftarm-30), 1, 0, 0);
    mdlMatrix.translate(0.0, -0.1, 0.0);
    mdlMatrix.scale(0.02, 1.0, 0.02);
    drawOneObject(cube, mdlMatrix, 0.5, 0.0, 0.5 );


    // left elbow
    pushMatrix();
    mdlMatrix.scale(50, 1.0, 50);
    mdlMatrix.rotate(-leftright*15 + (leftelbow/2), 1, 0, 0);
    mdlMatrix.translate(0.0, -0.2, 0.15*(-leftright/90 + leftelbow/2)/90);
    mdlMatrix.scale(0.02, 1.0, 0.02);
    drawOneObject(cube, mdlMatrix, 1.0, 0.7, 0.6 );


    mdlMatrix.scale(50, 1.0, 50);
    mdlMatrix.rotate(-90, 0, 0, -1);    

    // Steak
    pushMatrix();
    mdlMatrix.rotate(-45, 1, 0, 0); 
    mdlMatrix.translate(-0.3, 0.0, 0.0);
    mdlMatrix.scale(0.3, 0.3, 0.3);
    drawOneObject(steak, mdlMatrix, 0.4, 0.0, 0.0 );
    popMatrix();

    // Plate
    pushMatrix();
    mdlMatrix.rotate(-45, 1, 0, 0);
    mdlMatrix.translate(-0.3, 0.0, 0.0);
    mdlMatrix.scale(0.1, 0.05, 0.1);
    drawOneObject(cube, mdlMatrix, 1.0, 1.0, 1.0 );
    popMatrix();

    // remember to pop out the whole left hand move
    popMatrix();
    popMatrix();
    


    /* Below are the owner's right-arm,
      so they all rotate together */


    // right arm
    pushMatrix();
    mdlMatrix.translate(0.1, 0.45, 1.25);
    mdlMatrix.rotate(90, 1, 0, 1);
    mdlMatrix.rotate(-backforth*15 + (rightarm-30), 1, 0, 0);
    mdlMatrix.translate(0.0, -0.1, 0.0);
    mdlMatrix.scale(0.02, 1.0, 0.02);
    drawOneObject(cube, mdlMatrix, 0.5, 0.0, 0.5 );


    // right elbow
    pushMatrix();
    mdlMatrix.scale(50, 1.0, 50);
    mdlMatrix.rotate(-leftright*15 + rightelbow/2, 1, 0, 0);
    mdlMatrix.translate(0.0, -0.2, 0.15*(-leftright*15 + rightelbow/2)/90);
    mdlMatrix.scale(0.02, 1.0, 0.02);
    drawOneObject(cube, mdlMatrix, 1.0, 0.7, 0.6 );


    mdlMatrix.scale(50, 1.0, 50);
    mdlMatrix.rotate(90, 0, 0, -1);


    // Water
    pushMatrix();
    mdlMatrix.rotate(-45, 1, 0, 0);
    mdlMatrix.translate(0.3, 0.0, 0.05);
    mdlMatrix.scale(0.15, 0.01, 0.15);
    drawOneObject(sphere, mdlMatrix, 0.0, 0.0, 0.5 );
    popMatrix();

    // Plate
    pushMatrix();
    mdlMatrix.rotate(-45, 1, 0, 0);
    mdlMatrix.translate(0.3, -0.01, 0.0);
    mdlMatrix.scale(0.1, 0.05, 0.1);
    drawOneObject(cube, mdlMatrix, 1.0, 1.0, 1.0 );
    popMatrix();


    // remember to pop out the whole left hand move
    popMatrix();
    popMatrix();


    // Left leg
    pushMatrix();
    mdlMatrix.translate(-0.1, 0.2, 1.25);
    mdlMatrix.scale(0.03, 1.0, 0.03);
    drawOneObject(cube, mdlMatrix, 0.8, 0.8, 0.8 );
    popMatrix();


    // Right leg
    pushMatrix();
    mdlMatrix.translate(0.1, 0.2, 1.25);
    mdlMatrix.scale(0.03, 1.0, 0.03);
    drawOneObject(cube, mdlMatrix, 0.8, 0.8, 0.8 );
    popMatrix();



    // Sphere (head)
    pushMatrix();
    mdlMatrix.translate(0.0, 0.75, 1.35);
    mdlMatrix.scale(0.18, 0.18, 0.18);
    drawOneObject(sphere, mdlMatrix, 1.0, 0.7, 0.6 );
    popMatrix();


    // Pyramid (body)
    pushMatrix();
    mdlMatrix.translate(0.15, 0.25, 1.0);
    mdlMatrix.scale(0.02, 0.02, 0.02);
    drawOneObject(pyramid, mdlMatrix, 0.5, 0.0, 0.5 );
    popMatrix();



    // remember to pop out the whole body move
    popMatrix();
}

//obj: the object components
//mdlMatrix: the model matrix without mouse rotation
//colorR, G, B: object color
function drawOneObject(obj, mdlMatrix, colorR, colorG, colorB){
    //model Matrix (part of the mvp matrix)
    modelMatrix.setRotate(angleY, 1, 0, 0);//for mouse rotation
    modelMatrix.rotate(angleX, 0, 1, 0);//for mouse rotation
    modelMatrix.scale(1.0*zoomAngle/50, 1.0*zoomAngle/50, 1.0*zoomAngle/50);
    modelMatrix.multiply(mdlMatrix);
    //mvp: projection * view * model matrix  
    mvpMatrix.setPerspective(30, 1, 1, 100);
    mvpMatrix.lookAt(cameraX, cameraY, cameraZ, 0, 0, 0, 0, 1, 0);
    mvpMatrix.multiply(modelMatrix);

    //normal matrix
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();

    gl.uniform3f(program.u_LightPosition, 0, 2.5*Math.cos(angleY*2*Math.PI/360)*Math.pow(zoomAngle/50,1.5), 2.5*Math.sin(angleY*2*Math.PI/360)*Math.pow(zoomAngle/50,1.5));
    gl.uniform3f(program.u_ViewPosition, cameraX, cameraY, cameraZ);
    gl.uniform1f(program.u_Ka, 0.2);
    gl.uniform1f(program.u_Kd, 0.7);
    gl.uniform1f(program.u_Ks, 1.0);
    gl.uniform1f(program.u_shininess, 10.0);
    gl.uniform3f(program.u_Color, colorR, colorG, colorB);


    gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(program.u_modelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(program.u_normalMatrix, false, normalMatrix.elements);

    for( let i=0; i < obj.length; i ++ ){
      initAttributeVariable(gl, program.a_Position, obj[i].vertexBuffer);
      initAttributeVariable(gl, program.a_Normal, obj[i].normalBuffer);
      gl.drawArrays(gl.TRIANGLES, 0, obj[i].numVertices);
    }
}

function parseOBJ(text) {
  // because indices are base 1 let's just fill in the 0th data
  const objPositions = [[0, 0, 0]];
  const objTexcoords = [[0, 0]];
  const objNormals = [[0, 0, 0]];

  // same order as `f` indices
  const objVertexData = [
    objPositions,
    objTexcoords,
    objNormals,
  ];

  // same order as `f` indices
  let webglVertexData = [
    [],   // positions
    [],   // texcoords
    [],   // normals
  ];

  const materialLibs = [];
  const geometries = [];
  let geometry;
  let groups = ['default'];
  let material = 'default';
  let object = 'default';

  const noop = () => {};

  function newGeometry() {
    // If there is an existing geometry and it's
    // not empty then start a new one.
    if (geometry && geometry.data.position.length) {
      geometry = undefined;
    }
  }

  function setGeometry() {
    if (!geometry) {
      const position = [];
      const texcoord = [];
      const normal = [];
      webglVertexData = [
        position,
        texcoord,
        normal,
      ];
      geometry = {
        object,
        groups,
        material,
        data: {
          position,
          texcoord,
          normal,
        },
      };
      geometries.push(geometry);
    }
  }

  function addVertex(vert) {
    const ptn = vert.split('/');
    ptn.forEach((objIndexStr, i) => {
      if (!objIndexStr) {
        return;
      }
      const objIndex = parseInt(objIndexStr);
      const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
      webglVertexData[i].push(...objVertexData[i][index]);
    });
  }

  const keywords = {
    v(parts) {
      objPositions.push(parts.map(parseFloat));
    },
    vn(parts) {
      objNormals.push(parts.map(parseFloat));
    },
    vt(parts) {
      // should check for missing v and extra w?
      objTexcoords.push(parts.map(parseFloat));
    },
    f(parts) {
      setGeometry();
      const numTriangles = parts.length - 2;
      for (let tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0]);
        addVertex(parts[tri + 1]);
        addVertex(parts[tri + 2]);
      }
    },
    s: noop,    // smoothing group
    mtllib(parts, unparsedArgs) {
      // the spec says there can be multiple filenames here
      // but many exist with spaces in a single filename
      materialLibs.push(unparsedArgs);
    },
    usemtl(parts, unparsedArgs) {
      material = unparsedArgs;
      newGeometry();
    },
    g(parts) {
      groups = parts;
      newGeometry();
    },
    o(parts, unparsedArgs) {
      object = unparsedArgs;
      newGeometry();
    },
  };

  const keywordRE = /(\w*)(?: )*(.*)/;
  const lines = text.split('\n');
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const m = keywordRE.exec(line);
    if (!m) {
      continue;
    }
    const [, keyword, unparsedArgs] = m;
    const parts = line.split(/\s+/).slice(1);
    const handler = keywords[keyword];
    if (!handler) {
      console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
      continue;
    }
    handler(parts, unparsedArgs);
  }

  // remove any arrays that have no entries.
  for (const geometry of geometries) {
    geometry.data = Object.fromEntries(
        Object.entries(geometry.data).filter(([, array]) => array.length > 0));
  }

  return {
    geometries,
    materialLibs,
  };
}

function mouseDown(ev){ 
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    if( rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom){
        mouseLastX = x;
        mouseLastY = y;
        mouseDragging = true;
    }
}

function mouseUp(ev){ 
    mouseDragging = false;
}

function mouseMove(ev){ 
    var x = ev.clientX;
    var y = ev.clientY;
    if( mouseDragging ){
        var factor = 100/canvas.height; //100 determine the spped you rotate the object
        var dx = factor * (x - mouseLastX);
        var dy = factor * (y - mouseLastY);

        angleX += dx; //yes, x for y, y for x, this is right
        angleY += dy;
    }
    mouseLastX = x;
    mouseLastY = y;

    draw();
}
