/**
 * Copyright (c) 2017 Aleksandr Sviridenko.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */


var canvas = document.getElementById('canvas');
var context = canvas.getContext("2d");


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

document.getElementById("minre").innerHTML =  minRe;
document.getElementById("maxre").innerHTML =  maxRe;
document.getElementById("minim").innerHTML =  minIm;
document.getElementById("maxim").innerHTML =  maxIm;

canvas.width = 1200;
canvas.height = 900;
var csw=900;  //canvas style width
var csh=600;  //canvas style height
canvas.style.width = csw + 'px';
canvas.style.height = csh + 'px';
adjustCanvasSize();
console.log(canvas.width, canvas.height);
var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
var data = imageData.data;


var maxIter = 200;
document.getElementById("iters").innerHTML =  maxIter;
var paletteR = new Array(1000);
var paletteG = new Array(1000);
var paletteB = new Array(1000);
var drawMap = false;


generatePalette(maxIter);
//calculateAndDraw();

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
    var melkFaktorA = (maxRe-minRe)/1000;
    if (y>x-melkFaktorA && y<x+melkFaktorA){
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
            // Optimization
            iter = maxIter-1;
        } else {
            while(1){ 
                re1tmp = re1;
                re1= re1 * re1 - im1 * im1 + re;
                im1 = 2*re1tmp*im1 + im;
                if(Math.abs(re1) + Math.abs(im1) > 5) break;
                if(iter==maxIter-1)break;
                iter++;
            }
        }

        data[i]     = paletteR[iter] ; // red
        data[i + 1] = paletteG[iter] ;// green
        data[i + 2] = paletteB[iter] ; // blue
        data[i+3]=255;
       // document.getElementById("percent").innerHTML = Math.round(i/data.length*100);
        
       // Drawing net map
        if(drawMap){
            var mF = 1000;
            if(approxEq(re , Math.round(re*mF)/mF) || approxEq(im, Math.round(im*mF)/mF) ){
                data[i]=0;
                data[i+1]=0;
                data[i+2]=0;
            }
        }

    }
}

function updateIterations(i){
    
  if (i<1) {
    maxIter = 1;
  } else if (i>1000) {
      maxIter = 1000;
    } else{
      maxIter = i;
    }
    
    console.log(maxIter);
  generatePalette(maxIter);  
  document.getElementById("iters").innerHTML =  maxIter;
}

function changeIterations(i){
    updateIterations(maxIter+i);
}
