// handtracking variables
// initialise variables for handtracking
const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

// hide the video element, and just show the canvas
videoElement.style.display = "none";
const digitPositions = document.getElementsByClassName("digit-position__value");


//rope variables
var canvas;
var context;
var screenWidth;
var screenHeight;
var PI2 = Math.PI * 2;
var bgColor = '#262422';
var rope;
var gravity = 0.2;
var ropes = [];
var movementRamp = 0.984;
var windFactor = 0.02;
var windDirection = 1;
var windValue = 0;
var step = 0;
var cutting = false;
var blur = 0.6;
var gui;
var colors = ['#565853', '#5E9190', '#DCD9CD', '#BD4A61'];
var prev_displacement = 0;
var thres_displacement = 0;


// rope generation
window.onload = function()
{
	canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    window.onresize = function()
	{
		screenWidth = window.innerWidth;
		screenHeight = window.innerHeight;

		canvas.width = screenWidth;
		canvas.height = screenHeight;

		context.fillStyle = bgColor;
		context.fillRect(0, 0, screenWidth, screenHeight);
	};

	window.onresize();
	
	init();
	guiSetup();

    loop();
};

function init()
{
	generateRopes();

	// canvas.addEventListener('mousemove', function(e)
	// {
	// 	if(cutting) checkRopesIntersection(e.clientX, e.clientY);
	// });

	// canvas.addEventListener('mousedown', function(e)
	// {
	// 	cutting = true;
	// });

	// canvas.addEventListener('mouseup', function(e)
	// {
	// 	cutting = false;
	// });
}

function guiSetup()
{
	var controls =
	{
		blur:blur,
		gravity:gravity,
		windFactor:windFactor,
		movementRamp:movementRamp,

		reset:reset
	};

	gui = new dat.GUI();
	//gui.addColor(controls, 'bgColor').onChange(function(value){bgColor = value;});
	gui.add(controls, 'blur', 0.0, 1.0).onChange(function(value){blur = value;});
	gui.add(controls, 'gravity', -1.0, 1.0).onChange(function(value){gravity = value;});
	gui.add(controls, 'windFactor', 0.0, 1.0).onChange(function(value){windFactor = value;});
	gui.add(controls, 'movementRamp', 0.8, 1.0).onChange(function(value){movementRamp = value;});
	gui.add(controls, 'reset');
}

function reset()
{
	ropes = [];

	generateRopes();
}

function generateRopes()
{
	var r1 = new VRope(new VPoint(100, 0), new VPoint(screenWidth - 100, 0), 26, getRandomColor());
	var r2 = new VRope(r1.points[4], r1.points[20], 18, getRandomColor());
	var r3 = new VRope(r2.points[3], r2.points[20], 8, getRandomColor());
	var r4 = new VRope(r1.points[1], r1.points[2], 15, getRandomColor());
	var r5 = new VRope(r3.points[1], r3.points[2], 6, getRandomColor());
	var r6 = new VRope(r3.points[r3.points.length - 6], r2.points[8], 15, getRandomColor());
	var r7 = new VRope(r6.points[r6.points.length - 3], r1.points[28], 30, getRandomColor());
	var r8 = new VRope(r7.points[32], r1.points[r1.points.length - 4], 22, getRandomColor());
	var r9 = new VRope(r7.points[10], r1.points[r1.points.length - 10], 28, getRandomColor());

	r3.segments[0].constrainable = false;
	r4.segments[r4.segments.length - 1].constrainable = false;
	//r8.segments[r8.segments.length - 1].constrainable = false;

	ropes.push(r1);
	ropes.push(r2);
	ropes.push(r3);
	ropes.push(r4);
	ropes.push(r5);
	ropes.push(r6);
	ropes.push(r7);
	ropes.push(r8);
	ropes.push(r9);
}

function getRandomColor()
{
	return colors[(Math.random() * colors.length) >> 0];
}

function checkRopeIntersection(rope, x, y)
{
	var i = rope.points.length - 1;

	for(i; i > -1; --i)
	{
		var point = rope.points[i];
		var vx = x - point.x;
		var vy = y - point.y;
		var length = Math.sqrt(vx * vx + vy * vy);

		if(length < 10)
		{
			var segment = getSegmentFromPoint(point, rope);
			segment.constrainable = false;
		}
	}
};

function checkRopesIntersection(x, y)
{
	var i = ropes.length - 1;

	for(i; i > -1; --i)
	{
		var rope = ropes[i];
		checkRopeIntersection(rope, x, y);
	}
}

function getSegmentFromPoint(point, rope)
{
	var i = rope.segments.length - 1;

	for(i; i > -1; --i)
	{
		var segment = rope.segments[i];

		if(segment.a == point || segment.b == point)
		{
			return segment;

			break;
		}
	}
}

window.getAnimationFrame =
window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimationFrame ||
window.msRequestAnimationFrame ||
function(callback)
{
	window.setTimeout(callback, 16.6);
};

function loop()
{
	context.globalAlpha = 1 - blur;
	context.fillStyle = bgColor;
	context.fillRect(0, 0, screenWidth, screenHeight);
	context.globalAlpha = 1;

	updateWind();
	updateRopes();
	drawRopes();

	ropes[0].x += 1;

	step += 0.06;

	getAnimationFrame(loop);
}

function updateWind()
{
	windValue = Math.sin(step * Math.cos(step * 0.02) * Math.sin(step * 0.1) * 0.1) * windFactor * windDirection;
}

function updateRopes()
{
	var i = ropes.length - 1;

	for(i; i > -1; --i)
	{
		var rope = ropes[i];
		rope.update();
	}
}

function drawRopes()
{
	var i = ropes.length - 1;

	for(i; i > -1; --i)
	{
		var rope = ropes[i];
		drawRope(rope, '#FFF', 4);
	}
}

function Vector2(x, y)
{
	this.x = x || 0;
	this.y = y || 0;
}

Vector2.prototype =
{
	constructor:Vector2,

	angle :function()
	{
		return Math.atan2(this.y, this.x);
	},

	setAngle:function(value)
	{
		var length = this.length();

		this.x = Math.cos(value) * length;
		this.y = Math.sin(value) * length;
	},

	length:function()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},

	setLength:function(value)
	{
		var angle = this.angle();

		this.x = Math.cos(angle) * value;
		this.y = Math.sin(angle) * value;
	},

	dx:function()
	{
		return this.x / this.length();
	},

	dy:function()
	{
		return this.y / this.length();
	},

	ln:function()
	{
		return new Vector2(this.y, -this.x);
	},

	rn:function()
	{
		return new Vector2(-this.y, this.x);
	},
};

function VPoint(x, y)
{
	this.x = x || 0;
	this.y = y || 0;
	this.prevX = this.x;
	this.prevY = this.y;
}

VPoint.prototype =
{
	constructor:VPoint,

	setPos:function(x, y)
	{
		this.prevX = this.x = x;
		this.prevY = this.y = y;
	},

	update:function()
	{
		var tx = this.x;
		var ty = this.y;

		this.x += (this.x - this.prevX) * movementRamp;
		this.y += (this.y - this.prevY) * movementRamp;

		this.prevX = tx;
		this.prevY = ty;
	}
};

function VSegment(pointA, pointB)
{
	this.a = pointA;
	this.b = pointB;
	this.constrainable = true;

	this.length = Math.sqrt((this.b.x - this.a.x) * (this.b.x - this.a.x) + (this.b.y - this.a.y) * (this.b.y - this.a.y));
}

VSegment.prototype =
{
	constructor:VSegment,

	constrain:function()
	{
		var vx = this.b.x - this.a.x;
		var vy = this.b.y - this.a.y;

		var t = Math.sqrt(vx * vx + vy * vy);
		var diff = this.length - t;
		var offsetX = ((vx / t) * diff) * 0.5;
		var offsetY = ((vy / t) * diff) * 0.5;

		this.a.x -= offsetX;
		this.a.y -= offsetY;
		this.b.x += offsetX;
		this.b.y += offsetY;
	},

	update:function()
	{
		this.a.x += windValue;
		this.b.x += windValue;
		this.a.y += gravity;
		this.b.y += gravity;

		this.a.update();
		this.b.update();

		if(this.constrainable) this.constrain();
	}
};

function VRope(pa, pb, segs, color)
{
	this.a = pa;
	this.b = pb;
	this.segments = [];
	this.points = [];
	this.color = color || '#F00';
	this.lineWidth = (Math.random() * 8 + 4) >> 0;

	var vx = this.b.x - this.a.x;
	var vy = this.b.y - this.a.y;
	var t = Math.sqrt(vx * vx + vy * vy);
	var segmentWidth = t / segs;

	var i = 0;
	var l = segs;

	for(i; i < l; ++i)
	{
		var pointA = (this.points.length > 0) ? this.points[this.points.length - 1] : new VPoint(segmentWidth * i + pa.x, pa.y);
		var pointB = new VPoint(segmentWidth * (i + 1) + pa.x, pa.y);

		this.points.push(pointA);
		this.points.push(pointB);

		var segment = new VSegment(pointA, pointB);

		this.segments.push(segment);
	}
}

VRope.prototype =
{
	constructor:VRope,

	update:function()
	{
		var i = this.segments.length -1;

		for(i; i > -1; --i)
		{
			var segment = this.segments[i];

			segment.update();
		}

		this.points[0].setPos(this.a.x, this.a.y);
		this.points[this.points.length - 1].setPos(this.b.x, this.b.y);
	}
}

function drawRope(rope, color, lineWidth)
{
	var i = rope.segments.length - 1;
	var c = color || '#FFF';

	for(i; i > -1; --i)
	{
		var segment = rope.segments[i];

		context.strokeStyle = rope.color;
		context.lineWidth = rope.lineWidth;
		context.beginPath();
		context.moveTo(segment.a.x, segment.a.y);
		context.lineTo(segment.b.x, segment.b.y);
		if(segment.constrainable) context.stroke();
	}
}

function Point(x, y)
{
	this.x = x || 0;
	this.y = y || 0;
}

Point.prototype =
{
	constructor:Point
};

function norm(value, min, max)
{
	return (value - min) / (max - min);
};

function lerp(norm, min, max)
{
	return (max - min) * norm + min;
};

function map(value, smin, smax, omin, omax)
{
	return this.lerp(norm(value, smin, smax), omin, omax);
};

function dotProduct(v1, v2)
{
	return v1.dx() * v2.dx() + v1.dy() * v2.dy();
};

function unitRandom()
{
	return 1 - Math.random() * 2;
};

// handtracking mechanics

function onResults(results) {
    // Mirror the video feed and draw the results on the canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: "#00FF00",
                lineWidth: 5,
            });
            drawLandmarks(canvasCtx, landmarks, {
                color: "#FF0000",
                lineWidth: 2,
            });
        }
    }

    canvasCtx.restore();

    // wrist - 0
    // thumb tip - 4
    // index tip - 8
    // middle tip - 12
    // ring tip - 16
    // pinky tip - 20
    //index_finger_mcp = 5
    //middle_finger_mcp = 9

    //   display the coordinates of the tips of the fingers for each hand
    if (results.multiHandLandmarks) {
        for (let i = 0; i < results.multiHandedness.length; i++) {
            const classification = results.multiHandedness[i];
            const isRightHand = classification.label === "Right";
            const digitPosition = isRightHand ? digitPositions[0] : digitPositions[1];
            digitPosition.innerText = `
                    Thumb: [${results.multiHandLandmarks[i][4].x.toFixed(2)}, ${results.multiHandLandmarks[
                i
            ][4].y.toFixed(2)}]
                    Index: [${results.multiHandLandmarks[i][8].x.toFixed(2)}, ${results.multiHandLandmarks[
                i
            ][8].y.toFixed(2)}]
                    Middle: [${results.multiHandLandmarks[i][12].x.toFixed(2)}, ${results.multiHandLandmarks[
                i
            ][12].y.toFixed(2)}]
                    Ring: [${results.multiHandLandmarks[i][16].x.toFixed(2)}, ${results.multiHandLandmarks[
                i
            ][16].y.toFixed(2)}]
                    Pinky: [${results.multiHandLandmarks[i][20].x.toFixed(2)}, ${results.multiHandLandmarks[
                i
            ][20].y.toFixed(2)}]
                `;

            ////   check if index finger is higher than middle finger
            // if (results.multiHandLandmarks[i][8].y < results.multiHandLandmarks[i][12].y) {
            //     console.log("index is higher than middle");
            //     console.log()
            //     // spinPenguin(3);
            // } else {
            //     console.log("index is lower than middle");
            //     //if (animationId !== null) cancelAnimationFrame(animationId);
            // }

            //checking displacement between the index finger and the middle finger
            let middle_diff = Math.sqrt(Math.pow((results.multiHandLandmarks[i][9].y-results.multiHandLandmarks[i][12].y),2)+ Math.pow((results.multiHandLandmarks[i][9].x-results.multiHandLandmarks[i][12].x),2))
            let index_diff = Math.sqrt(Math.pow((results.multiHandLandmarks[i][8].y-results.multiHandLandmarks[i][5].y),2)+ Math.pow((results.multiHandLandmarks[i][8].x-results.multiHandLandmarks[i][5].x),2))
            var current_displacement = Math.sqrt(Math.pow((results.multiHandLandmarks[i][8].y-results.multiHandLandmarks[i][12].y),2)+ Math.pow((results.multiHandLandmarks[i][8].x-results.multiHandLandmarks[i][12].x),2))
            // console.log(previous_displacement, current_displacement)
            let difference = Math.abs(prev_displacement-current_displacement)

            console.log(index_diff, middle_diff);

            if(thres_displacement>=10 && difference>0.06 && middle_diff>0.15 &&index_diff>0.15){
                prev_displacement = current_displacement;
                thres_displacement = 0
                console.log(difference)
                console.log("cut")
            }
        
            
            thres_displacement++;
            

            //// zoom in and out
            // if (Math.abs(results.multiHandLandmarks[i][4].x - results.multiHandLandmarks[i][8].x) > 0.04) {
            //     console.log("zoom out");
            //     //camera.zoom = 0.5;
            //     //camera.updateProjectionMatrix();
            // } else { // pinch action
            //     console.log("zoom in");
            //     //camera.zoom = 2;
            //     //camera.updateProjectionMatrix();
            // }
        }
    }
}

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    },
});
hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
});
hands.onResults(onResults);

const webcam = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720,
});
webcam.start();
