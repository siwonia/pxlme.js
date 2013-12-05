// PXLME.JS - v0.1
// Copyright (c) 2013, Tobias Schultka.
// http://tobias-schultka.com
//
// Compiled: 2013-12-05
//
// PXLME.JS is licensed under the MIT License.
// http://www.opensource.org/licenses/mit-license.php

var PXLME = PXLME || {};

// set true when Animation is running
PXLME.running = false;

// run when move mouse on canvas
PXLME.mousemove = function( e, stage ) {

  // set Cursor Position
  var rect = stage.canvas.getBoundingClientRect();
  stage.cursor.x = e.clientX - rect.left;
  stage.cursor.y = e.clientY - rect.top;
  
  // activate Cursor
  stage.cursor.onStage = true;
  
}

// create array of all Stages
PXLME.stages = [];

// a Stage represents the the Canvas where the App is rendered on
PXLME.Stage = function( data ) {
  
  var self = this;
  
  // set the Container where the Stage will be add to
  if ( typeof data.containerId !== 'undefined' ) {
    var container = document.getElementById( data.containerId );
  } else {
    var container = document.getElementsByTagName( 'body' )[0];
  }
  
  // set width and height
  this.width  = data.width || 320;
  this.height = data.height || 320;
  
  // set cursor radius
  this.cursor = {};
  this.cursor.radius = data.cursorRadius || 30;
  this.cursor.x = 0;
  this.cursor.y = 0;
  this.cursor.onStage = false;
  
  // set Pixel Acceleration
  this.speedUp   = data.speedUp || 1.3;
  this.speedDown = data.speedDown || .4;
  
  // set Pixel Rubbing
  this.pixelRubbing = data.pixelRubbing || .974;
  
  // set Pixel Size
  this.pixelSize      = data.pixelSize || 5;
  this.pixelSizeMax   = data.pixelSizeMax || 15;
  this.pixelSizeRatio = data.pixelSizeRatio || .1;
  
  // create Canvas and set Width and Height
  this.canvas = document.createElement( 'canvas' );
  this.canvas.width  = this.width;
  this.canvas.height = this.height;
  this.canvas.style.position = 'relative';
  
  // add Canvas to Container and create the 2d context
  container.appendChild( this.canvas );
  this.ctx = this.canvas.getContext('2d');
  
  // check if browser supports event listener
  if ( window.addEventListener ) {
    this.canvas.addEventListener( 'mousemove' , function(e) { PXLME.mousemove( e, self ); }, false );
  }
  
  // set Pixel Colors
  this.colors = data.colors || {};
  
  // add Pixels
  this.pixels = [];
  
  // set Rows array
  var matrix = data.matrix || [
    "110010101000100010111",
    "101010101000110110100",
    "110001001000101010110",
    "100010101000100010100",
    "100010101110100010111"
  ];

  // set Matrix Size
  this.matrixSize = {
    x : matrix[0].length,
    y : matrix.length
  };
  
  // loop all Pixel array rows
  for ( var y = 0; y < this.matrixSize.y; y++ ) {
  
    // loop all columns
    for ( var x = 0; x < this.matrixSize.x; x++ ) {
    
      // zero is always no Pixel
      if ( matrix[y].charAt(x) != '0' ) {
      
        // create Pixel and push it to Pixels array
        this.pixels.push( 
          new PXLME.Pixel( x, y, matrix[y].charAt(x), this )
        );
      }
    }
  }
  
  // push this Stage to Stages array
  PXLME.stages.push( this );
  
  // start Animation Loop when it is the first stage
  if ( !PXLME.running ) {
    PXLME.running = true;
    PXLME.requestAnimationFrame( PXLME.render );
  }
}

// a Stage can have multiply Pixels
PXLME.Pixel = function( x, y, color, stage ) {
  
  // set Pixel Position
  // (half stage) - (half matrix) + (position) + (half pixel for center)
  this.x = ( stage.width  / 2 ) - ( stage.matrixSize.x * stage.pixelSize / 2 ) + ( x * stage.pixelSize ) + Math.floor( stage.pixelSize / 2);
  this.y = ( stage.height / 2 ) - ( stage.matrixSize.y * stage.pixelSize / 2 ) + ( y * stage.pixelSize ) + Math.floor( stage.pixelSize / 2);
  
  // set Pixel Start
  this.start = { x : this.x, y : this.y };
  
  // set Pixel Speed
  this.speed = { x : 0, y : 0 };
  
  // set Pixel Size
  this.z = stage.pixelSize;
  
  // set Pixel Color
  this.color = stage.colors[color] || '#000';
  
  // set Pixel is not moving
  this.isMoving = false;
  
}

// run a frame and render on canvas
PXLME.render = function() {

  // request new frame
  PXLME.requestAnimationFrame( PXLME.render );
  
  // loop all Stages
  for ( var s in PXLME.stages ) {
    
    var stage = PXLME.stages[s];
    
    // clear Canvas Stage
    stage.ctx.clearRect( 0, 0, stage.width, stage.height );
    
    // set Pixel
    for ( var p in stage.pixels ) {
      
      // define Pixel
      var pixel = stage.pixels[p];
      
      // get distance if Cursor is on Stage
      if ( stage.cursor.onStage ) {
        // get distance between Cursor and Pixel
        var d = PXLME.distance( stage.cursor , pixel );
      } else {
        // set distace inaccessible
        var d = stage.cursor.radius + 100;
      }
      
      if ( d < stage.cursor.radius ) {
        
        // escape from the cursor
        pixel.speed.y += (( pixel.y - stage.cursor.y) * ( d + stage.speedUp ) / d ) - ( pixel.y - stage.cursor.y );
        pixel.speed.x += (( pixel.x - stage.cursor.x) * ( d + stage.speedUp ) / d ) - ( pixel.x - stage.cursor.x );
      
        // set is moving true
        pixel.isMoving = true;

      } else if ( pixel.isMoving ) {
        
        // go back to start
        pixel.speed.y -= (( pixel.y - pixel.start.y) * ( d + stage.speedDown ) / d ) - ( pixel.y - pixel.start.y );
        pixel.speed.x -= (( pixel.x - pixel.start.x) * ( d + stage.speedDown ) / d ) - ( pixel.x - pixel.start.x );
      
        // slow Pixel down
        pixel.speed.y *= stage.pixelRubbing;
        pixel.speed.x *= stage.pixelRubbing;
      }
      
      // set Start Position if Pixel is nearby 
      if (
        PXLME.distance( pixel, pixel.start ) < 1 &&
        PXLME.distance( pixel, { x : pixel.x - pixel.speed.x, y : pixel.y - pixel.speed.y }) < stage.speedUp
      ){
        pixel.speed.y = 0;
        pixel.speed.x = 0;
        pixel.y = pixel.start.y;
        pixel.x = pixel.start.x;
        pixel.isMoving = false;
      }
      
      // move pixels
      pixel.x += pixel.speed.x;
      pixel.y += pixel.speed.y;
      pixel.z = stage.pixelSize + PXLME.distance( pixel, pixel.start ) * stage.pixelSizeRatio;
      if ( pixel.z > stage.pixelSizeMax ){ pixel.z = stage.pixelSizeMax; }
      
      // draw Pixels on Canvas
      stage.ctx.beginPath();
      stage.ctx.rect(
        pixel.x - pixel.z / 2, 
        pixel.y - pixel.z / 2,
        pixel.z,
        pixel.z
      );
      stage.ctx.fillStyle = pixel.color;
      stage.ctx.fill();
    }
  }

}

// get distance between two points
PXLME.distance = function( p1, p2 ) {

  // pythagoras
  var xs = p2.x - p1.x;
  var ys = p2.y - p1.y;
  return Math.sqrt(( xs * xs ) + ( ys * ys ));
  
}

// request a Animation Frame
PXLME.requestAnimationFrame = 
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function( callback ) { window.setTimeout( callback, 1000 / 60 ); };