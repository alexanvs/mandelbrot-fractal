/**
 * Copyright (c) 2017 Aleksandr Sviridenko.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */



var canvas = document.getElementById('canvas');
var context = canvas.getContext("2d");

canvas.addEventListener('mousedown', onDown, false);
canvas.addEventListener('mouseup', onUp, false);
canvas.addEventListener('dblclick', onDblclick, false);

var mouse_x1, mouse_y1, mouse_x2, mouse_y2;
var subAreaSelected1 = false;
var subAreaSelected2 = false;



var x,y;
var re,im,re1,im1,re1tmp;

var lookAroundRe = -0.5;
var lookAroundIm = 0;

//var deltaRe =       0.00001;
//var deltaIm =       0.00001;

var minRe = -2.1;//lookAroundRe-deltaRe/2;
var maxRe = 0.6;//lookAroundRe+deltaRe/2;
var minIm = -1.15;//lookAroundIm-deltaIm/2;
var maxIm = 1.15;//lookAroundIm+deltaIm/2;

function writeReIm(){
    document.getElementById("minre").innerHTML =  minRe;
    document.getElementById("maxre").innerHTML =  maxRe;
    document.getElementById("minim").innerHTML =  minIm;
    document.getElementById("maxim").innerHTML =  maxIm;
}
writeReIm();

canvas.width = 1200;
canvas.height = 800;


var csw=900;  //canvas style width
var csh=600;  //canvas style height
canvas.style.width = csw + 'px';
canvas.style.height = csh + 'px';
adjustCanvasSize();
console.log(canvas.width, canvas.height);
var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
var data = imageData.data;


var maxIter = 200;
var iterChanged = true;
document.getElementById("iters").innerHTML =  maxIter;
var paletteR = new Array(1000);
var paletteG = new Array(1000);
var paletteB = new Array(1000);
var drawMap = false;


var form = document.getElementById("xy_form");
form.elements.xmax.value = canvas.width;
form.elements.ymax.value = canvas.height;
form.addEventListener("submit", function(event) {
    changeXYmax(form.elements.xmax.value, form.elements.ymax.value);
 //   changeYmax(form.elements.ymax.value);
    event.preventDefault();
});

var xMaxRes,yMaxRes;
function changeXYmax(x,y){
    xMaxRes = x;
    yMaxRes = y;
    canvas.width = x;
    canvas.height = y;
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    data = imageData.data;
    console.log("xmax="+ xMaxRes);
    console.log("ymax="+ yMaxRes);
}

// function changeYmax(value){
//     canvas.height = value;
//     imageData = context.getImageData(0, 0, canvas.width, canvas.height);
//     data = imageData.data;
// }


function draw(){
    context.putImageData(imageData, 0, 0);
}

function calculateAndDraw(){
    calculateImage();
    draw();
}



function adjustCanvasSize(){
    var ratio = (maxRe - minRe) / (maxIm - minIm);
    if (canvas.width / canvas.height > ratio){
        canvas.width = Math.round(canvas.height * ratio);
    } else if (canvas.width / canvas.height < ratio){
        canvas.height = Math.round(canvas.width / ratio);
    }
    if(csw / csh > ratio){
        csw = Math.round(csh * ratio);
        canvas.style.width = csw + 'px';
    } else if (canvas.style.width / canvas.style.height < ratio){
        csh = Math.round(csw / ratio);
        canvas.style.height = csw + 'px';
    }
}


function approxEq(x,y){
    var melkFaktor = (maxRe-minRe)/1000;
    if (y>x-melkFaktor && y<x+melkFaktor){
        return true;
    }
    return false;
}

function generatePalette(colors){
    for (var i = 0; i < colors; i++){
        var x = i/(colors-1) * 2 * Math.PI;
        paletteG[i] = Math.round(255 * (Math.cos(x*3.5) + 1) / 2);
        paletteB[i] = Math.round(255 * (Math.cos(x*1.5) + 1) / 2);
        paletteR[i] = Math.round(255 * (Math.cos(x*2.5) + 1) / 2);
    }
}


function calculateImage(){
    if(iterChanged){
        generatePalette(maxIter);
        iterChanged = false;
    }
    for (var i = 0; i < data.length; i += 4) {
        x = (i/4)%canvas.width;
        y = Math.floor((i/4)/canvas.width);
        re = minRe + x/canvas.width * (maxRe - minRe);
        im = maxIm - y/canvas.height * (maxIm - minIm);
        re1=re;
        im1=im;
        var t=re-0.25;
        var imsq = im * im;
        var q=t*t + imsq;
        var iter=0;
        if( ( (q * (q + t) < 0.25 * imsq) || ((re+1)*(re+1) + im*im < 0.0625) ) ){
            /* Optimization */
            iter = maxIter-1;
        } else {
            while(true){ 
                re1tmp = re1;
                re1= re1 * re1 - im1 * im1 + re;
                im1 = 2*re1tmp*im1 + im;
                if(Math.abs(re1) + Math.abs(im1) > 5) break;
                if(iter==maxIter-1)break;
                iter++;
            }
        }

        data[i]     = paletteR[iter] ; // red
        data[i + 1] = paletteG[iter] ; // green
        data[i + 2] = paletteB[iter] ; // blue
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

function updateIterations(i){
    var tmpIter = maxIter;
    if (i<1) {
        maxIter = 1;
    } else if (i>1000) {
        maxIter = 1000;
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
}

function changeIterations(i){
    updateIterations(maxIter+i);
}

function onDown(event){
    event = event || window.event;
    mouse_x1 = event.pageX - canvas.offsetLeft;
    mouse_y1 = event.pageY - canvas.offsetTop;
    console.log(mouse_x1,mouse_y1);
    subAreaSelected1 = true;
}
function onUp(event){
    event = event || window.event;
    mouse_x2 = event.pageX - canvas.offsetLeft;
    mouse_y2 = event.pageY - canvas.offsetTop;
    var minReNew, maxReNew, minImNew, maxImNew;
    var minX,maxX,minY,maxY;

    console.log(mouse_x2,mouse_y2);
    if(subAreaSelected1 && mouse_x1 != mouse_x2 && mouse_y1 != mouse_y2){
        subAreaSelected2 = true;

        if(mouse_x1<mouse_x2){
            minX=mouse_x1; maxX = mouse_x2;
        }else{
            minX=mouse_x2; maxX = mouse_x1;
        }
        if(mouse_y1<mouse_y2){
            minY=mouse_y1; maxY = mouse_y2;
        }else{
            minY=mouse_y2; maxY = mouse_y1;
        }
        
        minReNew = minRe + minX / csw * (maxRe - minRe);
        maxReNew = minRe + maxX / csw * (maxRe - minRe);
        minImNew = maxIm - maxY / csh * (maxIm - minIm);
        maxImNew = maxIm - minY / csh * (maxIm - minIm);
        minRe = minReNew;
        maxRe = maxReNew;
        minIm = minImNew;
        maxIm = maxImNew;
        
        subAreaSelected1 = false;
        subAreaSelected2 = false;
        writeReIm();
        
    }
}
function onDblclick(event){
    event = event || window.event;
    var mouse_x = event.pageX - canvas.offsetLeft;
    var mouse_y = event.pageY - canvas.offsetTop;
    console.log("dblclick" + mouse_x + mouse_y);
    var zoom=4;
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
