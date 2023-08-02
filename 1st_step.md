# basic operation

get image from canvas

```js
let src = cv.imread('canvasInput');
src.delete();
```

get image information

```js
let img1Element = document.getElementById('imageSrc1');
let mat = cv.imread(img1Element);
console.log('image1 width: ' + mat.cols + '\n' +
'image1 height: ' + mat.rows + '\n' +
'image1 size: ' + mat.size().width + ',' + mat.size().height + '\n' +
'image1 depth: ' + mat.depth() + '\n' +
'image1 channels: ' + mat.channels() + '\n' +
'image1 type: ' + mat.type() + '\niroii')
cv.imshow('canvasOutput', mat);
mat.delete();
```

mat constructor

```js
let mat = new cv.Mat();
let mat2 = new cv.Mat(size, type);
let mat3 = new cv.Mat(rows, cols, type);
let mat4 = new cv.Mat(rows, cols, type, new cv.Scalar());

let mat5 = cv.Mat.zeros(rows, cols, type);
let mat6 = cv.Mat.ones(rows, cols, type);
let mat7 = cv.Mat.eye(rows, cols, type);

// let mat8 = cv.matFromArray(2, 2, cv.CV_8UC1, [1, 2, 3, 4]);
let mat8 = cv.matFromArray(rows, cols, type, array);
let ctx = canvas.getContext('2d');
let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
let mat9 = cv.matFromImageData(imgData);
```

copy mat

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
// clone 
let dst1 = src.clone();

// or copyTo
let dst2 = cv.Mat(src.rows, src.cols, src.type);
src.copyTo(dst2);
```

convert and mat vector

```js
// beta: delta added to scaled values
src.convertTo(dst, type, alpha, beta);

let mat = new cv.Mat();
let matVec = new cv.MatVector();
matVec.push_back(mat);
let cnt = matVec.get(0);
cnt.delete();
matVec.delete();
mat.delete();
```

type

+ CV_8U
+ CV_8S
+ CV_16U
+ CV_16S
+ CV_32S
+ CV_32F
+ CV_64F

Roi

```js
let src = cv.imread('canvas');
let dst = new cv.Mat();

let rect = new cv.Rect(100, 100, 200, 200);
dst = src.roi(rect);

cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
```

channel - split and merge

```js
let src = cv.imread('canvas');
let dst = new cv.Mat();

let rgbaPlanes = new cv.MatVector();
cv.split(src, rgbaPlanes);
let r = rgbaPlanes.get(0);
cv.merge(rgbaPlanes, src);

r.delete();
rgbaPlanes.delete();
src.delete();
```

marking borders

```js
let src = cv.imread('canvas');
let dst = new cv.Mat();

let s = new cv.Scalar(255, 0, 0, 255);
cv.copyMakeBorder(src, dst, 10, 10, 10, 10, cv.BORDER_CONSTRAINT, s);

cv.imshow('canvasOutput', dst);

dst.delete();
src.delete();
```

# arithmetic operation

addition

```js
let src1 = cv.imread('canvas1');
let src2 = cv.imread('canvas2');
let dst = new cv.Mat();
let mask = new cv.Mat();
let dtype = -1;
cv.add(src1, src2, dst, mask, dtype);

cv.imshow('canvasOutput', dst);
mask.delete();
dst.delete();
src2.delete();
src1.delete();
```

subtract

```js
let src1 = cv.imread('canvas1');
let src2 = cv.imread('canvas2');
let dst = new cv.Mat();
let mask = new cv.Mat();
let dtype = -1;
cv.subtract(src1, src2, dst, mask, dtype);

cv.imshow('canvasOutput', dst);
mask.delete();
dst.delete();
src2.delete();
src1.delete();
```

bitwrise

```js
let src = cv.imread('canvas1');
let logo = cv.imread('canvas2');
let dst = new cv.Mat();
let roi = new cv.Mat();
let mask = new cv.Mat();
let maskInv = new cv.Mat();
let imgBg = new cv.Mat();
let imgFg = new cv.Mat();
let sum = new cv.Mat();
let rect = new cv.Rect(0, 0, logo.cols, logo.rows);

// I want to put logo on top-left corner, So I create a ROI
roi = src.roi(rect);

// Create a mask of logo and create its inverse mask also
cv.cvtColor(logo, mask, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(mask, mask, 100, 255, cv.THRESH_BINARY);
cv.bitwise_not(mask, maskInv);

// Black-out the area of logo in ROI
cv.bitwise_and(roi, roi, imgBg, maskInv);

// Take only region of logo from logo image
cv.bitwise_and(logo, logo, imgFg, mask);

// Put logo in ROI and modify the main image
cv.add(imgBg, imgFg, sum);

dst = src.clone();
for (let i = 0; i < logo.rows; i++) {
    for (let j = 0; j < logo.cols; j++) {
        dst.ucharPtr(i, j)[0] = sum.ucharPtr(i, j)[0];
    }
}
cv.imshow('canvasOutput', dst);
src.delete(); 
dst.delete(); 
logo.delete(); 
roi.delete(); 
mask.delete();
maskInv.delete(); 
imgBg.delete(); 
imgFg.delete(); 
sum.delete();
```

# data structure

## Point

```js
let point1 = new cv.Point(x, y);
let point2 = {x: x, y: y};
```

## Scalar

```js
let scalar1 = new cv.Scalar(r, g, b, a);
let scalar2 = [r, g, b, a];
```

## Size

```js
let size1 = new cv.Size(width, height);
let size2 = {width: width, height: height};
```

## Circle

```js
let circle1 = new cv.Circle(center, radius);
let circle2 = {center: center, radius: radius};
```

## Rect

```js
let rect1 = new cv.Rect(x, y, width, height);
let rect2 = {x: x, y: y, width: width, height: height};
```

## Rotated Rect

```js
let rotatedRect1 = new cv.RotatedRect1(center, size, angle);
let rotatedRect2 = {center: center, size: size, angle: angle};
```
