PXLME.js
========

#### Javascript 2D Renderer ####

PXLME (Pixel Me) is an open source framework for dynamic pixel graphics by Tobias Schultka.

### Demos ###

- [Advanced Smiley Demo](<https://rawgithub.com/schultka/pxlme.js/master/example.html>)

### Simple Usage ###

```javascript
  // create an app instance
  var app = new PXLME.App();

  // create a stage and push it to the app
  var stage = app.addStage({
    "matrix": [
      "101",
      "010",
      "101"
    ],
    colors : { "1": "#FF0000" }
  });
```

### Advanced Usage ###

```html
  <div id="pxlme-stage"></div>
```
```javascript
  // define an options object
  var opt = {};

  // set the target ID
  opt.containerId = 'pxlme-stage';

  // set the width and height of the canvas (px)
  opt.width = 800;
  opt.height = 600;

  // set the pixel matrix. 0 is always no pixel
  opt.matrix = [
    "001111100",
    "012222210",
    "122A2A221",
    "122222221",
    "1222A2221",
    "12A222A21",
    "122AAA221",
    "012222210",
    "001111100"
  ];

  // set the colors of pixels based on the matrix
  opt.colors = {
    "1": "#00BDE3",
    "2": "#f3daca",
    "A": "#d27a8d"
  };

  // set the size of pixels (px)
  opt.pixelSize = 10;

  // set the speed of pixel growing, the farther the pixel is away from start
  opt.pixelSizeRatio = .1;

  // set the maximal pixel size
  opt.pixelSizeMax = 26;

  // set cursor radius
  opt.cursorRadius = 40;

  // set how fast a pixel escapes, if the cursor is nearby
  opt.speedUp = 1.8;

  // set how fast a pixel is going back
  opt.speedDown = .7;

  // set the percentage of speed after every frame (1 = 100%)
  opt.pixelRubbing = .974;
  
  // create an app instance
  var app = new PXLME.App();

  // create a stage and push it to the app
  var stage = app.addStage( opt );
```

This content is released under the (http://opensource.org/licenses/MIT) MIT License.