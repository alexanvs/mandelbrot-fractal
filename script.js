var canvas = document.getElementById('canvas');
var context = canvas.getContext("2d");


var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
var data = imageData.data;
var x,y;
var re,im,re1,im1,re1tmp;
var minRe = -2;
var maxRe = 1;
var minIm = -1;
var maxIm = 1;

for (var i = 0; i < data.length; i += 4) {
    x = (i/4)%canvas.width;
    y = Math.floor((i/4)/canvas.width);
    re = minRe + x/canvas.width * (maxRe - minRe);
    im = maxIm - y/canvas.height * (maxIm - minIm);
    re1=re;
    im1=im;
    var iter=0;
    for(iter = 0; iter<256; iter++){
      re1tmp = re1;
      re1= re1 * re1 - im1 * im1 + re;
      im1 = 2*re1tmp*im1 + im;
      if(Math.abs(re1) + Math.abs(im1) > 5) break;
    }

    data[i]     = 255-iter ; // red
    data[i + 1] = 255-iter ;// green
    data[i + 2] = 255-iter ; // blue
    data[i+3]=255;
}

context.putImageData(imageData, 0, 0);