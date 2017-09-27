var canvas = document.getElementById('canvas');

var context = canvas.getContext("2d");


var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
var data = imageData.data;
var x,y;
var re,im,re1,im1,re1tmp;

var lookAroundRe = -1.7891690186048231066;
var lookAroundIm = -0.0000003393685157671;

var deltaRe =       0.00001;
var deltaIm =       0.00001;

var minRe = lookAroundRe-deltaRe/2;
var maxRe = lookAroundRe+deltaRe/2;
var minIm = lookAroundIm-deltaIm/2;
var maxIm = lookAroundIm+deltaIm/2;

var maxIter = 1000;
var paletteR = new Array(maxIter);
var paletteG = new Array(maxIter);
var paletteB = new Array(maxIter);
var drawMap = false;

var melkFaktorA = (maxRe-minRe)/1000;
function approxEq(x,y){
    if (y>x-melkFaktorA && y<x+melkFaktorA){
        return true;
    }
    return false;
}


for (var i = 0; i < maxIter; i++){
    var x = i/(maxIter-1) * 2 * Math.PI;
    paletteG[i] = Math.round(255 * (Math.cos(x*3.5) + 1) / 2);
    paletteB[i] = Math.round(255 * (Math.cos(x*1.5) + 1) / 2);
    paletteR[i] = Math.round(255 * (Math.cos(x*2.5) + 1) / 2);
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
    var iter;
    if( ( (q * (q + t) < 0.25 * imsq) || ((re+1)*(re+1) + im*im < 0.0625) ) ){
      // Optimization
      iter = maxIter-1;
    } else {
        for(iter = 0; iter < maxIter; iter++){
             re1tmp = re1;
             re1= re1 * re1 - im1 * im1 + re;
             im1 = 2*re1tmp*im1 + im;
             if(Math.abs(re1) + Math.abs(im1) > 5) break;
        }
    }

    data[i]     = paletteR[iter] ; // red
    data[i + 1] = paletteG[iter] ;// green
    data[i + 2] = paletteB[iter] ; // blue
    data[i+3]=255;
    
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

context.putImageData(imageData, 0, 0);