// PXLME.JS - v1.0 (2015-01-08)
// Copyright (c) 2013-2015, Tobias Schultka
// http://tobias-schultka.com
//
// PXLME.JS is licensed under the MIT License.
// http://www.opensource.org/licenses/mit-license.php

( function ( window ) {
"use strict";

window.PXLME = window.PXLME || {};

// app constructor
PXLME.App = function () {

    // create an empty stage list
    this.stageList = [];

    // start animation
    this.render();
}

// create new stage and return it
PXLME.App.prototype.addStage = function ( data ) {

    // create new instance
    var stage = new PXLME.Stage( data );

    // push instance to stage list
    this.stageList.push( stage );

    // return the stage
    return stage;
}

// render the app
PXLME.App.prototype.render = function () {
    var self = this;

    // request new frame
    window.requestAnimationFrame( function () {
        self.render();
    });

    // render all stages
    for ( var i in this.stageList ) {
        this.stageList[i].render();
    }
}

// a stage represents a canvas
PXLME.Stage = function ( data ) {
    var self = this,
        container,
        matrix;

    // get the container where the stage will be add to
    container = typeof data.containerId !== "undefined"
        ? document.getElementById( data.containerId )
        : container = document.getElementsByTagName( "body" )[0];

    // set width and height
    this.width = data.width || 320;
    this.height = data.height || 320;

    // set cursor radius
    this.cursor = new PXLME.Cursor( data.cursorRadius );

    // set pixel acceleration
    this.speedUp = data.speedUp || 1.3;
    this.speedDown = data.speedDown || .4;

    // set pixel rubbing
    this.pixelRubbing = data.pixelRubbing || .974;

    // set pixel size
    this.pixelSize = data.pixelSize || 5;
    this.pixelSizeMax = data.pixelSizeMax || 15;
    this.pixelSizeRatio = data.pixelSizeRatio || .1;

    // create canvas and set width and height
    this.canvas = document.createElement( "canvas" );
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.position = "relative";

    // add canvas to container and create the 2d context
    container.appendChild( this.canvas );
    this.ctx = this.canvas.getContext( "2d" );

    // check if browser supports event listener
    if ( window.addEventListener ) {
        this.canvas.addEventListener(
            "mousemove",
            function ( e ) {
                self.onMouseMove( e );
            },
            false
        );
    }

    // set pixel colors
    this.colors = data.colors || { "1": "#000000" };

    // set rows array
    matrix = data.matrix || [
        "110010101000100010111",
        "101010101000110110100",
        "110001001000101010110",
        "100010101000100010100",
        "100010101110100010111"
    ];

    // set matrix size
    this.matrixSize = {
        "x": matrix[0].length,
        "y": matrix.length
    };

    // initialize pixel list
    this.pixelList = [];

    // loop all pixel array rows
    for ( var y = 0; y < this.matrixSize.y; y++ ) {

        // loop all columns
        for ( var x = 0; x < this.matrixSize.x; x++ ) {

            // zero is always no pixel
            if ( matrix[y].charAt(x) === "0" ) {
                continue;
            }

            // create pixel and push it to Pixels array
            this.pixelList.push(
                new PXLME.Pixel( x, y, matrix[y].charAt(x), this )
            );
        }
    }
}

// run as soon as mouse has moved on canvas
PXLME.Stage.prototype.onMouseMove = function ( e ) {

    // set cursor position
    var rect = this.canvas.getBoundingClientRect();
    this.cursor.x = e.clientX - rect.left;
    this.cursor.y = e.clientY - rect.top;

    // activate cursor
    this.cursor.onStage = true;
}

// render the stage
PXLME.Stage.prototype.render = function () {

    // clear canvas stage
    this.ctx.clearRect( 0, 0, this.width, this.height );

    // move and render all pixels
    for ( var i in this.pixelList ) {

        // set new pixel position
        this.pixelList[i].move();

        // render the pixel
        this.pixelList[i].render();
    }
}

// a stage can have multiply pixels
PXLME.Pixel = function ( x, y, color, stage ) {

    // set pixel stage
    this.stage = stage;

    // set pixel position
    // (half stage) - (half matrix) + (position) + (half pixel for center)
    this.x = ( stage.width  / 2 ) - ( stage.matrixSize.x * stage.pixelSize / 2 ) + ( x * stage.pixelSize ) + Math.floor( stage.pixelSize / 2);
    this.y = ( stage.height / 2 ) - ( stage.matrixSize.y * stage.pixelSize / 2 ) + ( y * stage.pixelSize ) + Math.floor( stage.pixelSize / 2);

    // set pixel start
    this.start = {
        "x": this.x,
        "y": this.y
    };

    // set pixel speed
    this.speed = {
        "x": 0,
        "y": 0
    };

    // set pixel size
    this.z = stage.pixelSize;

    // set pixel color
    this.color = stage.colors[color] || "#000";

    // set pixel is not moving
    this.isMoving = false;
}

// set the new pixel position
PXLME.Pixel.prototype.move = function () {

    // if cursor is on stage, then get distance between cursor and pixel,
    // otherwise get inaccessible distance
    var d = this.stage.cursor.onStage
        ? this.getDistance( this.stage.cursor )
        : this.stage.cursor.radius + 100;

    // change pixel speed, if cursor is nearby
    if ( d < this.stage.cursor.radius ) {

        // escape from the cursor
        this.speed.y += (( this.y - this.stage.cursor.y) * ( d + this.stage.speedUp ) / d ) - ( this.y - this.stage.cursor.y );
        this.speed.x += (( this.x - this.stage.cursor.x) * ( d + this.stage.speedUp ) / d ) - ( this.x - this.stage.cursor.x );

        // set pixel is currently moving
        this.isMoving = true;

    } else if ( this.isMoving ) {

        // go back to start
        this.speed.y -= (( this.y - this.start.y) * ( d + this.stage.speedDown ) / d ) - ( this.y - this.start.y );
        this.speed.x -= (( this.x - this.start.x) * ( d + this.stage.speedDown ) / d ) - ( this.x - this.start.x );

        // slow pixel down
        this.speed.y *= this.stage.pixelRubbing;
        this.speed.x *= this.stage.pixelRubbing;
    }

    // set start position, if pixel is nearby
    if (this.getDistance( this.start ) < 1 &&
        this.getDistance({ "x": this.x - this.speed.x, "y": this.y - this.speed.y }) < this.stage.speedUp ) {

        this.speed.y = 0;
        this.speed.x = 0;
        this.y = this.start.y;
        this.x = this.start.x;
        this.isMoving = false;
    }

    // move pixels
    this.x += this.speed.x;
    this.y += this.speed.y;
    this.z = this.stage.pixelSize + this.getDistance( this.start ) * this.stage.pixelSizeRatio;
    if ( this.z > this.stage.pixelSizeMax ) {
        this.z = this.stage.pixelSizeMax;
    }
}

// render the pixel
PXLME.Pixel.prototype.render = function () {

    // draw pixels on canvas
    this.stage.ctx.beginPath();
    this.stage.ctx.rect(
        this.x - this.z / 2,
        this.y - this.z / 2,
        this.z,
        this.z
    );
    this.stage.ctx.fillStyle = this.color;
    this.stage.ctx.fill();
}

// get distance between two points
PXLME.Pixel.prototype.getDistance = function ( pixel ) {
    var xs = pixel.x - this.x,
        ys = pixel.y - this.y;

    // pythagoras
    return Math.sqrt(( xs * xs ) + ( ys * ys ));
}

// every stage can have a differnt cursor
PXLME.Cursor = function ( radius ) {
    this.radius = radius || 30;
    this.x = 0;
    this.y = 0;
    this.onStage = false;
}

// provides request animation frame in a cross browser way
// author: Paul Irish - http://paulirish.com
if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = ( function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function( callback, element ) {
                window.setTimeout( callback, 1000 / 60 );
            };
    })();
}

})( window );