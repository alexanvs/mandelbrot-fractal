/**
 * Copyright (c) 2017 Aleksandr Sviridenko.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */

var MyMouseCoords = function constructor() {
    this['x'] = arguments[0];
    this['y'] = arguments[1];
}

var CanvasState = function constructor() {
    this['minRe'] = arguments[0];
    this['maxRe'] = arguments[1];
    this['minIm'] = arguments[2];
    this['maxIm'] = arguments[3];
}

var canvasStates = [];

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');


canvas.addEventListener('mousedown', onDown, false);
canvas.addEventListener('mouseup', onUp, false);
canvas.addEventListener('dblclick', onDblclick, false);
canvas.addEventListener('mousemove', onMousemove, false);


var subAreaSelected1 = false;

var x,y;
var re,im,re1,im1,re1tmp;

var lookAroundRe = -0.8;
var lookAroundIm = 0;

var deltaRe = 3.45  ;
var deltaIm = 2.3  ;

// var minRe = -2.1;
// var maxRe = 0.6;
// var minIm = -1.15;
// var maxIm = 1.15;


var minRe = lookAroundRe-deltaRe/2;
var maxRe = lookAroundRe+deltaRe/2;
var minIm = lookAroundIm-deltaIm/2;
var maxIm = lookAroundIm+deltaIm/2;

function writeReIm(){
    document.getElementById("minre").innerHTML =  minRe;
    document.getElementById("maxre").innerHTML =  maxRe;
    document.getElementById("minim").innerHTML =  minIm;
    document.getElementById("maxim").innerHTML =  maxIm;
}
writeReIm();

canvas.width = 1200;
canvas.height = 800;

const cswmax=900, cshmax=900;
var xMaxRes=canvas.width;
var yMaxRes=canvas.height;
var csw=cswmax;  //canvas style width
var csh=cshmax;  //canvas style height
canvas.style.width = csw + 'px';
canvas.style.height = csh + 'px';
adjustCanvasSize();

console.log(canvas.width, canvas.height);
var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
var data = imageData.data;


var maxIter = 200;
var iterLimit = 2000;
var iterChanged = true;
document.getElementById("iters").innerHTML =  maxIter;
var paletteR = new Array(iterLimit);
var paletteG = new Array(iterLimit);
var paletteB = new Array(iterLimit);
const maxColors=16777216;
var smoothPaletteR = new Array(maxColors);
var smoothPaletteG = new Array(maxColors);
var smoothPaletteB = new Array(maxColors);

var drawMap = false;


var form = document.getElementById("xy_form");
form.elements.xmax.value = canvas.width;
form.elements.ymax.value = canvas.height;
form.addEventListener("submit", function(event) {
    changeXYmax(form.elements.xmax.value, form.elements.ymax.value);
    event.preventDefault();
});

function changeXYmax(x,y){
    if(x==0 || y==0){
        alert("x, y must be not zero");
        x=1200;
        y=800;
        form.elements.xmax.value = x;
        form.elements.ymax.value = y;
    }
    xMaxRes = x;
    yMaxRes = y;
    canvas.width = x;
    canvas.height = y;
    adjustCanvasSize();
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    data = imageData.data;
    console.log("xmax="+ xMaxRes);
    console.log("ymax="+ yMaxRes);   
}

function applyNewRatio(){
    canvas.width = xMaxRes;
    canvas.height = yMaxRes;
    document.getElementById("xres").innerHTML =  canvas.width;
    document.getElementById("yres").innerHTML =  canvas.height;
    var canvasRatio = xMaxRes / yMaxRes;
    var dre = maxRe - minRe;
    var dim = maxIm - minIm;
    var cre = minRe + dre/2;
    var cim = minIm + dim/2;
    var reImRatio = dre/dim;
    if(canvasRatio > reImRatio){
        var dreNew = dim * canvasRatio;
        minRe = cre - dreNew/2;
        maxRe = cre + dreNew/2;
    }else if(canvasRatio < reImRatio){
        var dimNew = dre / canvasRatio;
        minIm = cim - dimNew/2;
        maxIm = cim + dimNew/2;
    }
    var canvasStyleRatio = cswmax / cshmax;
    if(canvasRatio > canvasStyleRatio){
        csw = cswmax;
        csh = csw/canvasRatio;
    } else {
        csh = cshmax;
        csw = csh * canvasRatio;
    }
    canvas.style.width = csw + 'px';
    canvas.style.height = csh + 'px';
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    data = imageData.data;
}

function adjustCanvasSize(){
    var ratio = (maxRe - minRe) / (maxIm - minIm);
    if (xMaxRes / yMaxRes > ratio){
        canvas.height = yMaxRes;
        canvas.width = Math.round(canvas.height * ratio);
    } else if (xMaxRes / yMaxRes < ratio){
        canvas.width = xMaxRes;
        canvas.height = Math.round(canvas.width / ratio);
    }
    if(cswmax / cshmax > ratio){
        csh = cshmax;
        csw = Math.round(cshmax * ratio);
    } else {
        csw = cswmax;
        csh = Math.round(cswmax / ratio);
    }
    canvas.style.width = csw + 'px';
    canvas.style.height = csh + 'px';
    document.getElementById("xres").innerHTML =  canvas.width;
    document.getElementById("yres").innerHTML =  canvas.height;
    console.log("after adjust: csw = "+csw+ " csh = "+ csh);
}

function draw(){
    context.putImageData(imageData, 0, 0);
}

function calculateAndDraw(){
    calculateImage();
    draw();
}

calculateAndDraw();



function generatePalette(colors, paletteNum){
    if(paletteNum == null) paletteNum = 0; // default
    switch(paletteNum) {

        case 1:   // Black and white
            for (var i = 0; i < colors; i++){
                var factor = Math.sqrt(i / (colors-1));
                var intensity = Math.round((colors-1) * factor);
                paletteG[i] = Math.round(255*intensity/(colors-1));
                paletteB[i] = Math.round(255*intensity/(colors-1));
                paletteR[i] = Math.round(255*intensity/(colors-1));
            }
            paletteR[colors-1]=0;
            paletteG[colors-1]=0;
            paletteB[colors-1]=0;
            break;

        case 2:
            for (var i = 0; i < colors; i++){
                var factor = Math.sqrt(i / (colors-1));
                var intensity = Math.round((colors-1) * factor);
                var x = intensity/(colors-1) * 2 * Math.PI;
                paletteG[i] = Math.round(255 * (Math.cos(x*3.5) + 1) / 2);
                paletteB[i] = Math.round(255 * (Math.cos(x*1.5) + 1) / 2);
                paletteR[i] = Math.round(255 * (Math.cos(x*2.5) + 1) / 2);
            }            
            break;   

        default:
            for (var i = 0; i < colors; i++){
                var x = i/(colors-1) * 2 * Math.PI;
                paletteG[i] = Math.round(255 * (Math.cos(x*3.5) + 1) / 2);
                paletteB[i] = Math.round(255 * (Math.cos(x*1.5) + 1) / 2);
                paletteR[i] = Math.round(255 * (Math.cos(x*2.5) + 1) / 2);
            }     
            for (var i = 0; i < maxColors; i++){
                var x = i/(maxColors-1) * 2 * Math.PI;
                smoothPaletteG[i] = Math.round(255 * (Math.cos(x*3.5) + 1) / 2);
                smoothPaletteB[i] = Math.round(255 * (Math.cos(x*1.5) + 1) / 2);
                smoothPaletteR[i] = Math.round(255 * (Math.cos(x*2.5) + 1) / 2);
            }       
    }    
}


function calculateImage(){
    if(iterChanged){
        generatePalette(maxIter);
        iterChanged = false;
    }
    for (var i = 0; i < data.length; i += 4) {
        var x = (i/4)%canvas.width;
        var y = Math.floor((i/4)/canvas.width);
        var re = minRe + x/canvas.width * (maxRe - minRe);
        var im = maxIm - y/canvas.height * (maxIm - minIm);
        var re1 = re;
        var im1 = im;
        var t = re-0.25;
        var imsq = im * im;
        var q = t*t + imsq;
        var iter = 0;
        var nsmooth = 0;
        if( q * (q + t) < 0.25 * imsq || (re+1)*(re+1) + im*im < 0.0625 ){
            /* Optimization */
            iter = maxIter-1;
            nsmooth = maxColors-1;
        } else {
            while(true){ 
                re1tmp = re1;
                re1re1=re1*re1;
                im1im1=im1*im1;
                re1= re1re1 - im1im1 + re;
                im1 = 2*re1tmp*im1 + im;
                //if(Math.abs(re1) + Math.abs(im1) > 5) break;
                if(re1re1 + im1im1 > 4)break;
                if(iter==maxIter-1)break;
                iter++;
            }
            nsmooth = iter + 1 - Math.log(Math.log(Math.sqrt(re1re1+im1im1)))/Math.log(2);
        }

        // data[i]     = paletteR[iter] ; // red
        // data[i + 1] = paletteG[iter] ; // green
        // data[i + 2] = paletteB[iter] ; // blue
        // data[i+3]=255;
        var indexSmooth = Math.round(nsmooth/(maxIter-1)*(maxColors-1));
        data[i]     = smoothPaletteR[indexSmooth] ; // red
        data[i + 1] = smoothPaletteG[indexSmooth] ; // green
        data[i + 2] = smoothPaletteB[indexSmooth] ; // blue
        data[i+3]=255;


        
       /* Drawing net map */
        if(drawMap){
            var mF = 10;
            var re_tmp=re;
            while(true){
                if((maxRe-minRe)*mF>3)break;
                mF*=10;
            }
            if(approxEq(re , Math.round(re*mF)/mF) || approxEq(im, Math.round(im*mF)/mF) ){
                data[i]=0;
                data[i+1]=0;
                data[i+2]=0;
            }
        }

    }
}

function approxEq(x,y){
    var melkFaktor = (maxRe-minRe)/1000;
    if (y>x-melkFaktor && y<x+melkFaktor){
        return true;
    }
    return false;
}

function updateIterations(i){
    var tmpIter = maxIter;
    if (i<1) {
        maxIter = 1;
    } else if (i>iterLimit) {
        maxIter = iterLimit;
    } else {
        maxIter = i;
    }
    iterChanged = true;
    if (maxIter == tmpIter){
        iterChanged = false;
    } else {
        iterChanged = true;
    }
    console.log(maxIter);
    document.getElementById("iters").innerHTML =  maxIter;
    return iterChanged;
}

function changeIterations(i){
    updateIterations(maxIter+i);
}

function onDown(event){
    event = event || window.event;
    var orig_x1 = event.pageX - canvas.offsetLeft;
    var orig_y1 = event.pageY - canvas.offsetTop;
    console.log("mouseDown: "+orig_x1+" "+orig_y1);
    subAreaSelected1 = true;
    event.target._mouseDown = new MyMouseCoords(orig_x1, orig_y1);
}

function onUp(event) {
    event = event || window.event;
    var down_x = event.target._mouseDown.x;
    var down_y = event.target._mouseDown.y;
    var up_x = event.pageX - canvas.offsetLeft;
    var up_y = event.pageY - canvas.offsetTop;
    var minReNew, maxReNew, minImNew, maxImNew;
    var minX,maxX,minY,maxY;

    console.log("mouseUp: "+up_x+" "+up_y);
    if (subAreaSelected1 && down_x != up_x && down_y != up_y) {
        if (down_x < up_x){
            minX = down_x; 
            maxX = up_x;
        } else {
            minX = up_x; 
            maxX = down_x;
        }
        if (down_y < up_y){
            minY = down_y; 
            maxY = up_y;
        } else {
            minY = up_y; 
            maxY = down_y;
        }
        canvasStates.push(new CanvasState(minRe, maxRe, minIm, maxIm));
        console.log("Saved Re="+minRe+"..."+maxRe+" Im="+minIm+"..."+maxIm);
        minReNew = minRe + minX / csw * (maxRe - minRe);
        maxReNew = minRe + maxX / csw * (maxRe - minRe);
        minImNew = maxIm - maxY / csh * (maxIm - minIm);
        maxImNew = maxIm - minY / csh * (maxIm - minIm);
        minRe = minReNew;
        maxRe = maxReNew;
        minIm = minImNew;
        maxIm = maxImNew;
        
        subAreaSelected1 = false;
       
        writeReIm();
        adjustCanvasSize();
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        data = imageData.data;
        calculateAndDraw();
        
    }
}
function onDblclick(event){
    event = event || window.event;
    var mouse_x = event.pageX - canvas.offsetLeft;
    var mouse_y = event.pageY - canvas.offsetTop;
    console.log("dblclick" + mouse_x + mouse_y);
    var zoom=4;
    canvasStates.push(new CanvasState(minRe, maxRe, minIm, maxIm));
    console.log("Saved Re="+minRe+"..."+maxRe+" Im="+minIm+"..."+maxIm);
    var dRe = maxRe - minRe;
    var dIm = maxIm - minIm;
    var dReZoomHalf = 0.5*dRe/zoom;
    var dImZoomHalf = 0.5*dIm/zoom;
    var re = minRe+0.5*dRe;
    var im = minIm+0.5*dIm;
    var re = minRe + mouse_x / csw * dRe;
    var im = maxIm - mouse_y / csh * dIm;
    minRe = re - dReZoomHalf;
    maxRe = re + dReZoomHalf;
    minIm = im - dImZoomHalf;
    maxIm = im + dImZoomHalf;
    writeReIm();
    calculateAndDraw();
}

function goBack(){
    if (canvasStates.length == 0){
        alert("This is already the first image.");
        return;
    }
    var previousState = canvasStates.pop();
    minRe = previousState.minRe;
    maxRe = previousState.maxRe;
    minIm = previousState.minIm;
    maxIm = previousState.maxIm;
    console.log("Popped Re="+minRe+"..."+maxRe+" Im="+minIm+"..."+maxIm);
    writeReIm();
    adjustCanvasSize();
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    data = imageData.data;
    calculateAndDraw();
}

function onMousemove(event){
    event = event || window.event;
    var mouse_x = event.pageX - canvas.offsetLeft;
    var mouse_y = event.pageY - canvas.offsetTop;
    re = minRe + mouse_x / csw * (maxRe - minRe);
    im = maxIm - mouse_y / csh * (maxIm - minIm);
    document.getElementById("mouseX").innerHTML =  re;
    document.getElementById("mouseY").innerHTML =  im;
}
