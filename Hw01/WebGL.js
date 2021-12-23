var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute float a_PointSize;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main(){
        gl_Position = a_Position;
        gl_PointSize = a_PointSize;
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


// record color and shape

var shape_type = 1;
var color_type = 1;




function main(){
    var canvas = document.getElementById('webgl');

    var gl = canvas.getContext('webgl2');
    if(!gl){
        console.log('Failed to get the rendering context for WebGL');
        return ;
    }

    let renderProgram = compileShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);
 
    gl.useProgram(renderProgram);


    /* keyboard event:
        
        Shape:
            A: point
            S: square
            D: circle
            F: triangle

        Color:
            Z: red
            X: green
            C: blue

    */

    document.onkeydown=function(e){    // check the page 
        var keyNum=window.event ? e.keyCode :e.which;       // acquire the key that the user press  
        


        //////////////
        //  shapes  //
        //////////////


        // A for points
        if( keyNum == 65 )  
            shape_type = 1;


        // S for squares
        if( keyNum == 83 )
            shape_type = 2;


        // D for circles
        if( keyNum == 68 )
            shape_type = 3; 


        // F for triangles
        if( keyNum == 70 )
            shape_type = 4;





        //////////////
        //  colors  //
        //////////////


        // Z for red
        if( keyNum == 90 )
            color_type = 1;


        // X for green
        if( keyNum == 88 )
            color_type = 2;


        // C for blue
        if( keyNum == 67 )
            color_type = 3;

    }



    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    
    // mouse and keyboard event
    canvas.onmousedown = function(ev){user_operation(ev, gl, canvas, renderProgram)}
}


g_points = [];   // store 3 points
g_squares = [];  // store 3 squares
g_circles = [];  // store 3 circles
g_triangles = [];// store 3 triangles
g_point_colors = [];     // store 3 points's color while keyboard event
g_square_colors = [];    // store 3 squares's color while keyboard event
g_circle_colors = [];    // store 3 circles's color while keyboard event
g_triangle_colors = [];  // store 3 triangles's color while keyboard event



function user_operation(ev, gl, canvas, renderProgram ){
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    console.log("x: " + x);
    console.log("y: " + y);
    console.log("rect. left, top, width, height: " + rect.left + " "  + rect.top + " " + rect.width + " " + rect.height );


    // convert x and y to canvas space and normal them to (-1, 1) for webgl to use
    x = ( x - 208.0 ) / 200.0
    y = -( y - 208.0 ) / 200.0


    if( shape_type == 1 )
    {
        // we only stack 3 same shapes at once, so shift out the last one
        if( g_points.length == 3 )
            g_points.shift();

        //put mouse click position to g_points
        g_points.push([x, y]);
    }

    else if( shape_type == 2 )
    {
        // we only stack 3 same shapes at once, so shift out the last one
        if( g_squares.length == 3 )
            g_squares.shift();

        //put mouse click position to g_points
        g_squares.push([x, y]);
    }

    else if( shape_type == 3 )
    {
        // we only stack 3 same shapes at once, so shift out the last one
        if( g_circles.length == 3 )
            g_circles.shift();

        //put mouse click position to g_points
        g_circles.push([x, y]);
    }

    else    // shape_type == 4
    {
        // we only stack 3 same shapes at once, so shift out the last one
        if( g_triangles.length == 3 )
            g_triangles.shift();

        //put mouse click position to g_points
        g_triangles.push([x, y]);
    }

    if( color_type == 1 )
    {
        // change color to red

        if( shape_type == 1 )   // point
        {
            // we only stack 3 same shapes at once, so shift out the last one
            if( g_point_colors.length == 3 )
                g_point_colors.shift();

            g_point_colors.push([1.0, 0.0, 0.0]);
        }

        else if( shape_type == 2 )  // square
        {
            // we only stack 3 same shapes at once, so shift out the last one
            if( g_square_colors.length == 3 )
                g_square_colors.shift();

            g_square_colors.push([1.0, 0.0, 0.0]);
        }

        else if( shape_type == 3 )  // circle
        {
            // we only stack 3 same shapes at once, so shift out the last one
            if( g_circle_colors.length == 3 )
                g_circle_colors.shift();

            g_circle_colors.push([1.0, 0.0, 0.0]);
        }
        else    // triangle
        {
            // we only stack 3 same shapes at once, so shift out the last one
            if( g_triangle_colors.length == 3 )
                g_triangle_colors.shift();

            g_triangle_colors.push([1.0, 0.0, 0.0]);
        }

    }

    else if( color_type == 2 )
    {
        // change color to green
        
        
        if( shape_type == 1 )   // point
        {
            // we only stack 3 same shapes at once, so shift out the last one
            if( g_point_colors.length == 3 )
                g_point_colors.shift();

            g_point_colors.push([0.0, 1.0, 0.0]);
        }

        else if( shape_type == 2 )  // square
        {
            // we only stack 3 same shapes at once, so shift out the last one
            if( g_square_colors.length == 3 )
                g_square_colors.shift();

            g_square_colors.push([0.0, 1.0, 0.0]);
        }

        else if( shape_type == 3 )  // circle
        {
            // we only stack 3 same shapes at once, so shift out the last one
            if( g_circle_colors.length == 3 )
                g_circle_colors.shift();

            g_circle_colors.push([0.0, 1.0, 0.0]);
        }
        else    // triangle
        {
            // we only stack 3 same shapes at once, so shift out the last one
            if( g_triangle_colors.length == 3 )
                g_triangle_colors.shift();

            g_triangle_colors.push([0.0, 1.0, 0.0]);
        }
    }

    else    // color_type == 3
    {
        // change color to blue
        

        if( shape_type == 1 )   // point
        {
            // we only stack 3 same shapes at once, so shift out the last one
            if( g_point_colors.length == 3 )
                g_point_colors.shift();

            g_point_colors.push([0.0, 0.0, 1.0]);
        }

        else if( shape_type == 2 )  // square
        {
            // we only stack 3 same shapes at once, so shift out the last one
            if( g_square_colors.length == 3 )
                g_square_colors.shift();

            g_square_colors.push([0.0, 0.0, 1.0]);
        }

        else if( shape_type == 3 )  // circle
        {
            // we only stack 3 same shapes at once, so shift out the last one
            if( g_circle_colors.length == 3 )
                g_circle_colors.shift();

            g_circle_colors.push([0.0, 0.0, 1.0]);
        }
        else    // triangle
        {
            // we only stack 3 same shapes at once, so shift out the last one
            if( g_triangle_colors.length == 3 )
                g_triangle_colors.shift();

            g_triangle_colors.push([0.0, 0.0, 1.0]);
        }
    }


    // Clear canvas by background color before drawing
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);


    /*
        Let's start drawing :D
        the last part of the program 
    */

 
    // points
    var n1 = drawPoint(gl, renderProgram, g_points.length);
    gl.drawArrays(gl.POINTS, 0, n1);


    // squares
    var n2 = drawSquare(gl, renderProgram, g_squares.length);
    gl.drawArrays(gl.POINTS, 0, n2);


    // circles
    var n3 = drawCircle(gl, renderProgram, g_circles.length);
    gl.drawArrays(gl.TRIANGLES, 0, n3);

    // triangles
    var n4 = drawTriangle(gl, renderProgram, g_triangles.length);
    gl.drawArrays(gl.TRIANGLES, 0, n4);

}




// draw point

function drawPoint(gl, program, i )
{
    var n = i;
    var vertices;
    if( i == 3 )
    {
        vertices = new Float32Array(
        // point: x, y, size, R, G, B
        [g_points[0][0], g_points[0][1], 4.0, g_point_colors[0][0], g_point_colors[0][1], g_point_colors[0][2],
        g_points[1][0], g_points[1][1], 4.0, g_point_colors[1][0], g_point_colors[1][1], g_point_colors[1][2],
        g_points[2][0], g_points[2][1], 4.0, g_point_colors[2][0], g_point_colors[2][1], g_point_colors[2][2]]
        );
    }

    else if( i == 2 )
    {
        vertices = new Float32Array(
        // point: x, y, size, R, G, B
        [g_points[0][0], g_points[0][1], 4.0, g_point_colors[0][0], g_point_colors[0][1], g_point_colors[0][2],
        g_points[1][0], g_points[1][1], 4.0, g_point_colors[1][0], g_point_colors[1][1], g_point_colors[1][2]]
        );
    }

    else if( i == 1 )
    {
        vertices = new Float32Array(
        // point: x, y, size, R, G, B
        [g_points[0][0], g_points[0][1], 4.0, g_point_colors[0][0], g_point_colors[0][1], g_point_colors[0][2]]
        );
    }

    else
        return 0;

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var a_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_PointSize = gl.getAttribLocation(program, 'a_PointSize');
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE*6, FSIZE*2);
    gl.enableVertexAttribArray(a_PointSize);

    var a_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE*6, FSIZE*3);
    gl.enableVertexAttribArray(a_Color);

    return n;
}



// draw square

function drawSquare(gl, program, i)
{
    var n = i;
    var vertices;
    if( i == 3 )
    {
        vertices = new Float32Array(
        // point: x, y, size, R, G, B
        [g_squares[0][0], g_squares[0][1], 20.0, g_square_colors[0][0], g_square_colors[0][1], g_square_colors[0][2],
        g_squares[1][0], g_squares[1][1], 20.0, g_square_colors[1][0], g_square_colors[1][1], g_square_colors[1][2],
        g_squares[2][0], g_squares[2][1], 20.0, g_square_colors[2][0], g_square_colors[2][1], g_square_colors[2][2]]
        );
    }

    else if( i == 2 )
    {
        vertices = new Float32Array(
        // point: x, y, size, R, G, B
        [g_squares[0][0], g_squares[0][1], 20.0, g_square_colors[0][0], g_square_colors[0][1], g_square_colors[0][2],
        g_squares[1][0], g_squares[1][1], 20.0, g_square_colors[1][0], g_square_colors[1][1], g_square_colors[1][2]]
        );
    }

    else if( i == 1 )
    {
        vertices = new Float32Array(
        // point: x, y, size, R, G, B
        [g_squares[0][0], g_squares[0][1], 20.0, g_square_colors[0][0], g_square_colors[0][1], g_square_colors[0][2]]
        );
    }

    else
        return 0;


    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var a_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_PointSize = gl.getAttribLocation(program, 'a_PointSize');
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE*6, FSIZE*2);
    gl.enableVertexAttribArray(a_PointSize);

    var a_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE*6, FSIZE*3);
    gl.enableVertexAttribArray(a_Color);

    return n;
}




// draw circle
function drawCircle(gl, program, i)
{
    // i use 360 triangles to make a circle
    // radius == 0.05 

    var n = 3*360*i;
    var vertices = new Float32Array(n);


    if( i == 3 )
    {
        for( let k = 0; k < 3; k++ )
        {
            for( let c = 0; c < 360; c++ )
            {
                // first point
                var theta1 = c * 6 * Math.PI / 180; // rad
                var x1 = g_circles[k][0] + 0.075 * Math.cos(theta1);
                var y1 = g_circles[k][1] + 0.075 * Math.sin(theta1);


                // second point
                var theta2 = (c+1) * 6 * Math.PI / 180; // rad
                var x2 = g_circles[k][0] + 0.075 * Math.cos(theta2);
                var y2 = g_circles[k][1] + 0.075 * Math.sin(theta2);


                // x, y, size, R, G, B
                vertices[1080*k + 18*c] = g_circles[k][0];
                vertices[1080*k + 18*c+1] = g_circles[k][1];
                vertices[1080*k + 18*c+2] = 10.0;
                vertices[1080*k + 18*c+3] = g_circle_colors[k][0];
                vertices[1080*k + 18*c+4] = g_circle_colors[k][1];
                vertices[1080*k + 18*c+5] = g_circle_colors[k][2];

                // x, y, size, R, G, B
                vertices[1080*k + 18*c+6] = x1;
                vertices[1080*k + 18*c+7] = y1;
                vertices[1080*k + 18*c+8] = 10.0;
                vertices[1080*k + 18*c+9] = g_circle_colors[k][0];
                vertices[1080*k + 18*c+10] = g_circle_colors[k][1];
                vertices[1080*k + 18*c+11] = g_circle_colors[k][2];

                // x, y, size, R, G, B
                vertices[1080*k + 18*c+12] = x2;
                vertices[1080*k + 18*c+13] = y2;
                vertices[1080*k + 18*c+14] = 10.0;
                vertices[1080*k + 18*c+15] = g_circle_colors[k][0];
                vertices[1080*k + 18*c+16] = g_circle_colors[k][1];
                vertices[1080*k + 18*c+17] = g_circle_colors[k][2];
            }
        }
    }

    else if( i == 2 )
    {
        for( let k = 0; k < 2; k++ )
        {
            for( let c = 0; c < 360; c++ )
            {
                // first point
                var theta1 = c * 6 * Math.PI / 180; // rad
                var x1 = g_circles[k][0] + 0.075 * Math.cos(theta1);
                var y1 = g_circles[k][1] + 0.075 * Math.sin(theta1);


                // second point
                var theta2 = (c+1) * 6 * Math.PI / 180; // rad
                var x2 = g_circles[k][0] + 0.075 * Math.cos(theta2);
                var y2 = g_circles[k][1] + 0.075 * Math.sin(theta2);


                // x, y, size, R, G, B
                vertices[1080*k + 18*c] = g_circles[k][0];
                vertices[1080*k + 18*c+1] = g_circles[k][1];
                vertices[1080*k + 18*c+2] = 10.0;
                vertices[1080*k + 18*c+3] = g_circle_colors[k][0];
                vertices[1080*k + 18*c+4] = g_circle_colors[k][1];
                vertices[1080*k + 18*c+5] = g_circle_colors[k][2];

                // x, y, size, R, G, B
                vertices[1080*k + 18*c+6] = x1;
                vertices[1080*k + 18*c+7] = y1;
                vertices[1080*k + 18*c+8] = 10.0;
                vertices[1080*k + 18*c+9] = g_circle_colors[k][0];
                vertices[1080*k + 18*c+10] = g_circle_colors[k][1];
                vertices[1080*k + 18*c+11] = g_circle_colors[k][2];

                // x, y, size, R, G, B
                vertices[1080*k + 18*c+12] = x2;
                vertices[1080*k + 18*c+13] = y2;
                vertices[1080*k + 18*c+14] = 10.0;
                vertices[1080*k + 18*c+15] = g_circle_colors[k][0];
                vertices[1080*k + 18*c+16] = g_circle_colors[k][1];
                vertices[1080*k + 18*c+17] = g_circle_colors[k][2];
            }
        }
    }

    else if( i == 1 )
    {
        for( let c = 0; c < 360; c++ )
        {
            // first point
            var theta1 = c * 6 * Math.PI / 180; // rad
            var x1 = g_circles[0][0] + 0.075 * Math.cos(theta1);
            var y1 = g_circles[0][1] + 0.075 * Math.sin(theta1);


            // second point
            var theta2 = (c+1) * 6 * Math.PI / 180; // rad
            var x2 = g_circles[0][0] + 0.075 * Math.cos(theta2);
            var y2 = g_circles[0][1] + 0.075 * Math.sin(theta2);


            // x, y, size, R, G, B
            vertices[18*c] = g_circles[0][0];
            vertices[18*c+1] = g_circles[0][1];
            vertices[18*c+2] = 10.0;
            vertices[18*c+3] = g_circle_colors[0][0];
            vertices[18*c+4] = g_circle_colors[0][1];
            vertices[18*c+5] = g_circle_colors[0][2];

            // x, y, size, R, G, B
            vertices[18*c+6] = x1;
            vertices[18*c+7] = y1;
            vertices[18*c+8] = 10.0;
            vertices[18*c+9] = g_circle_colors[0][0];
            vertices[18*c+10] = g_circle_colors[0][1];
            vertices[18*c+11] = g_circle_colors[0][2];

            // x, y, size, R, G, B
            vertices[18*c+12] = x2;
            vertices[18*c+13] = y2;
            vertices[18*c+14] = 10.0;
            vertices[18*c+15] = g_circle_colors[0][0];
            vertices[18*c+16] = g_circle_colors[0][1];
            vertices[18*c+17] = g_circle_colors[0][2];
        }

    }

    else
        return 0;

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var a_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_PointSize = gl.getAttribLocation(program, 'a_PointSize');
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE*6, FSIZE*2);
    gl.enableVertexAttribArray(a_PointSize);

    var a_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE*6, FSIZE*3);
    gl.enableVertexAttribArray(a_Color);

    return n;
}




// draw triangle

function drawTriangle(gl, program, i)
{
    var n = 3*i;    // since it's a triangle, we need 3 times more points
    var vertices;
    if( i == 3 )
    {
        vertices = new Float32Array(
        // point: x, y, size, R, G, B
        [g_triangles[0][0], g_triangles[0][1]+0.05, 10.0, g_triangle_colors[0][0], g_triangle_colors[0][1], g_triangle_colors[0][2],
        g_triangles[0][0]-0.05, g_triangles[0][1]-0.05, 10.0, g_triangle_colors[0][0], g_triangle_colors[0][1], g_triangle_colors[0][2],
        g_triangles[0][0]+0.05, g_triangles[0][1]-0.05, 10.0, g_triangle_colors[0][0], g_triangle_colors[0][1], g_triangle_colors[0][2],
        g_triangles[1][0], g_triangles[1][1]+0.05, 10.0, g_triangle_colors[1][0], g_triangle_colors[1][1], g_triangle_colors[1][2],
        g_triangles[1][0]-0.05, g_triangles[1][1]-0.05, 10.0, g_triangle_colors[1][0], g_triangle_colors[1][1], g_triangle_colors[1][2],
        g_triangles[1][0]+0.05, g_triangles[1][1]-0.05, 10.0, g_triangle_colors[1][0], g_triangle_colors[1][1], g_triangle_colors[1][2],
        g_triangles[2][0], g_triangles[2][1]+0.05, 10.0, g_triangle_colors[2][0], g_triangle_colors[2][1], g_triangle_colors[2][2],
        g_triangles[2][0]-0.05, g_triangles[2][1]-0.05, 10.0, g_triangle_colors[2][0], g_triangle_colors[2][1], g_triangle_colors[2][2],
        g_triangles[2][0]+0.05, g_triangles[2][1]-0.05, 10.0, g_triangle_colors[2][0], g_triangle_colors[2][1], g_triangle_colors[2][2]]
        );
    }

    else if( i == 2 )
    {
        vertices = new Float32Array(
        // point: x, y, size, R, G, B
        [g_triangles[0][0], g_triangles[0][1]+0.05, 10.0, g_triangle_colors[0][0], g_triangle_colors[0][1], g_triangle_colors[0][2],
        g_triangles[0][0]-0.05, g_triangles[0][1]-0.05, 10.0, g_triangle_colors[0][0], g_triangle_colors[0][1], g_triangle_colors[0][2],
        g_triangles[0][0]+0.05, g_triangles[0][1]-0.05, 10.0, g_triangle_colors[0][0], g_triangle_colors[0][1], g_triangle_colors[0][2],
        g_triangles[1][0], g_triangles[1][1]+0.05, 10.0, g_triangle_colors[1][0], g_triangle_colors[1][1], g_triangle_colors[1][2],
        g_triangles[1][0]-0.05, g_triangles[1][1]-0.05, 10.0, g_triangle_colors[1][0], g_triangle_colors[1][1], g_triangle_colors[1][2],
        g_triangles[1][0]+0.05, g_triangles[1][1]-0.05, 10.0, g_triangle_colors[1][0], g_triangle_colors[1][1], g_triangle_colors[1][2]]
        );
    }

    else if( i == 1)
    {
        vertices = new Float32Array(
        // point: x, y, size, R, G, B
        [g_triangles[0][0], g_triangles[0][1]+0.05, 10.0, g_triangle_colors[0][0], g_triangle_colors[0][1], g_triangle_colors[0][2],
        g_triangles[0][0]-0.05, g_triangles[0][1]-0.05, 10.0, g_triangle_colors[0][0], g_triangle_colors[0][1], g_triangle_colors[0][2],
        g_triangles[0][0]+0.05, g_triangles[0][1]-0.05, 10.0, g_triangle_colors[0][0], g_triangle_colors[0][1], g_triangle_colors[0][2]]
        );
    }

    else
        return 0;


    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var a_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_PointSize = gl.getAttribLocation(program, 'a_PointSize');
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE*6, FSIZE*2);
    gl.enableVertexAttribArray(a_PointSize);

    var a_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE*6, FSIZE*3);
    gl.enableVertexAttribArray(a_Color);

    return n;
}