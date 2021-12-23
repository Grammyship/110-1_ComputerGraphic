var VSHADER_SOURCE = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        varying vec4 v_Color;
        uniform mat4 u_modelMatrix;
        void main(){
            gl_Position = u_modelMatrix * a_Position;
            v_Color = a_Color;
        }    
    `;

var FSHADER_SOURCE = `
        precision mediump float;
        varying vec4 v_Color;
        void main(){
            gl_FragColor = v_Color;
        }
    `;

function createProgram(gl, vertexShader, fragmentShader){
    //create the program and attach the shaders
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    //if success, return the program. if not, log the program info, and delete it.
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
        return program;
    }
    alert(gl.getProgramInfoLog(program) + "");
    gl.deleteProgram(program);
}

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

function initArrayBuffer( gl, data, num, type, attribute){
    var buffer = gl.createBuffer();
    if(!buffer){
        console.log("failed to create the buffere object");
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    var a_attribute = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), attribute);

    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);

    return true;
}

var transformMat = new Matrix4();
var matStack = [];
var u_modelMatrix;
function pushMatrix(){
    matStack.push(new Matrix4(transformMat));
}
function popMatrix(){
    transformMat = matStack.pop();
}


//variables for tx, ty 
var tx = 0;
var ty = 0;
var tz = 0;

// variables for object angle
var tailAngle = 0;
var tail2Angle = 0;
var stingAngle = 0;
var sizeAngle = 50;


function main(){
    //////Get the canvas context
    var canvas = document.getElementById('webgl');
    var gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    program = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    redraw(gl); //call redarw here to show the initial image

    //setup the call back function of tx, ty, tz Sliders
    var txSlider = document.getElementById("Move_X");
    txSlider.oninput = function() {
        tx = this.value / 100.0; //convert sliders value to -1 to +1
        redraw(gl);
    }

    var tySlider = document.getElementById("Move_Y");
    tySlider.oninput = function() {
        ty = this.value / 100.0; //convert sliders value to -1 to 1
        redraw(gl);
    }

    //setup the call back function of Strong_Tail rotation Sliders
    var jointTailSlider = document.getElementById("jointForTail");
    jointTailSlider.oninput = function() {
        tailAngle = -this.value; //convert sliders value to -45 to 45 degrees
        redraw(gl);
    }

    //setup the call back function of Small_Tail rotation Sliders
    var jointTail2Slider = document.getElementById("jointForTail2");
    jointTail2Slider.oninput = function() {
        tail2Angle = -this.value; //convert sliders value to 0 to 60 degrees
        redraw(gl);
    }

    //setup the call back function of sting rotation Sliders
    var jointStingSlider = document.getElementById("jointForSting");
    jointStingSlider.oninput = function() {
        stingAngle = -this.value; //convert sliders value to 30 to -30 degrees
        redraw(gl);
    }

    //setup the call back function of plier rotation Sliders
    var jointSizeSlider = document.getElementById("jointForSize");
    jointSizeSlider.oninput = function() {
        sizeAngle = this.value;
        redraw(gl);
    }
}


//Call this funtion when we have to update the screen (eg. user input happens)
function redraw(gl)
{
    gl.clearColor(0.6, 0.6, 0.6, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    u_modelMatrix = gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM), 'u_modelMatrix');
    
    rectVertices = [-0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5];
    scorpionbody = [  -0.25, 0.0, 0.25, 0.0, -0.35, -1.2, 0.35, -1.2 ];
    scorpionhead = [ 0.0, 0.0, 0.12, 0.0, 0.12*Math.cos( 2*Math.PI / 360), 0.12*Math.sin( 2*Math.PI / 360) ];
    scorpionsting = [ 0.0, 0.3, 0.17, 0.0, -0.17, 0.0 ];
    var blackColor = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ];
    var posionColor = [0.8, 0.0, 0.8, 0.2, 0.0, 0.2, 0.2, 0.0, 0.2, 0.5, 0.0, 0.5 ];
    var redColor = [0.0, 0.0, 0.0, 0.4, 0.0, 0.0, 0.0, 0.0, 0.0, 0.4, 0.0, 0.0 ];
    var plierColor = [0.8, 0.0, 0.0, 0.8, 0.0, 0.0, 0.8, 0.0, 0.0, 0.8, 0.0, 0.0 ];

    // for shape
    buffer0 = initArrayBuffer(gl, new Float32Array(scorpionhead), 2, gl.FLOAT, 'a_Position');    

    // for color
    buffer1 = initArrayBuffer(gl, new Float32Array(blackColor), 3, gl.FLOAT, 'a_Color');

    transformMat.setIdentity();




    /*
        Start drawing! :D
    */

    transformMat.scale(1.0*sizeAngle/50, 1.0*sizeAngle/50, 0.0);


    // translate whole scorpion here
    transformMat.translate(tx+0.1, ty-0.1, 0.0);
    pushMatrix();


    // draw the body of the scorpion
    for( let i = 0; i < 360; i++ )
    {
        
        transformMat.rotate( 1, 0.0, 0.0, 1.0 );
        gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
        gl.drawArrays(gl.TRIANGLES, 0, scorpionhead.length/2);
    }

    popMatrix();


  
    // translate scorpion body pivot  
    buffer0 = initArrayBuffer(gl, new Float32Array(scorpionbody), 2, gl.FLOAT, 'a_Position');    
    transformMat.translate(-0.25, 0.13, 0.0);
    pushMatrix();

    // draw the body
    transformMat.rotate(60, 0.0, 0.0, 1.0 );
    transformMat.scale(0.22, 0.2, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, scorpionbody.length/2);
    popMatrix();



    // change to rectangle
    buffer0 = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');  
    
    
    // translate scorpion leg pivot
    transformMat.translate(0.0, -0.05, 0.0);
    transformMat.rotate(-70, 0.0, 0.0, 1.0 );



    // draw the legs

    // top big
    pushMatrix();
    transformMat.translate(-0.04, -0.05, 0.0);
    transformMat.scale(0.05, 0.2, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);
    popMatrix();


    // top small
    pushMatrix();
    transformMat.translate(-0.02, -0.15, 0.0);
    transformMat.rotate(50, 0.0, 0.0, 1.0 );
    transformMat.translate(0.0, -0.03, 0.0);
    transformMat.scale(0.03, 0.15, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);
    popMatrix();


    // mid big
    pushMatrix();
    transformMat.translate(0.05, -0.02, 0.0);
    transformMat.scale(0.05, 0.15, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);
    popMatrix();


    // mid small
    pushMatrix();
    transformMat.translate(0.07, -0.12, 0.0);
    transformMat.rotate(70, 0.0, 0.0, 1.0 );
    transformMat.translate(0.0, -0.03, 0.0);
    transformMat.scale(0.03, 0.15, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);
    popMatrix();

    // bottom big
    pushMatrix();
    transformMat.translate(0.12, 0.03, 0.0);
    transformMat.rotate(20, 0.0, 0.0, 1.0 );
    transformMat.scale(0.05, 0.15, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);
    popMatrix();

    // bottom small
    pushMatrix();
    transformMat.translate(0.32, -0.07, 0.0);
    transformMat.rotate(110, 0.0, 0.0, 1.0 );
    transformMat.translate(0.08, 0.1, 0.0);
    transformMat.scale(0.03, 0.15, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);
    popMatrix();



    // draw the pliers
    pushMatrix();
    // for shape
    buffer0 = initArrayBuffer(gl, new Float32Array(scorpionhead), 2, gl.FLOAT, 'a_Position');    
    // for color
    buffer1 = initArrayBuffer(gl, new Float32Array(plierColor), 3, gl.FLOAT, 'a_Color');
    transformMat.translate(0.32, 0.0, 0.0);
    transformMat.scale(0.8,0.8,0.0);
    for( let i = 0; i < 360; i++ )
    {
            transformMat.rotate( 1, 0.0, 0.0, 1.0 );
            gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
            gl.drawArrays(gl.TRIANGLES, 0, scorpionhead.length/2);
    }

    popMatrix();





    // back to body position
    transformMat.rotate(70, 0.0, 0.0, 1.0 );
    transformMat.translate(0.0, 0.05, 0.0);

    // change to rectangle
    buffer0 = initArrayBuffer(gl, new Float32Array(rectVertices), 2, gl.FLOAT, 'a_Position');  

    // color
    buffer1 = initArrayBuffer(gl, new Float32Array(redColor), 3, gl.FLOAT, 'a_Color');

    // translate scorpion strong tail pivot
    transformMat.translate(0.055, -0.045, 0.0);  
    transformMat.rotate(tailAngle+45, 0.0, 0.0, 1.0);
    transformMat.translate(0.0, 0.18, 0.0);
    pushMatrix();

    // draw the strong tail
    transformMat.scale(0.08, 0.25, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);
    popMatrix();



    // color
    buffer1 = initArrayBuffer(gl, new Float32Array(redColor), 3, gl.FLOAT, 'a_Color');
    // translate scorpion small tail pivot
    transformMat.translate( 0.0, 0.07, 0.0);  
    transformMat.rotate(tail2Angle-20, 0.0, 0.0, 1.0);
    transformMat.translate(0.0, 0.15, 0.0);
    pushMatrix();

    // draw the small tail
    transformMat.scale(0.06, 0.2, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rectVertices.length/2);
    popMatrix();



    // change to sting
    buffer0 = initArrayBuffer(gl, new Float32Array(scorpionsting), 2, gl.FLOAT, 'a_Position');    
    // color
    buffer1 = initArrayBuffer(gl, new Float32Array(posionColor), 3, gl.FLOAT, 'a_Color');

    // translate scorpion sting pivot
    transformMat.translate( 0.0, 0.12, 0.0);
    transformMat.rotate( stingAngle, 0.0, 0.0, 1.0 );
    pushMatrix();

    // draw the sting
    transformMat.scale(0.3, 0.5, 0.0);
    gl.uniformMatrix4fv(u_modelMatrix, false, transformMat.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, scorpionsting.length/2);
    popMatrix();


    

}
