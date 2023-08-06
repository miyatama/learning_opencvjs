# image processing

## color space

use cvtColor

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();

cv.cvtColor(src, dst, cv.COLOR_BGR2GRAY, 0);

console.log('src channel: ' + src.channels() + ', dst channel: ' + dst.channels());

cv.imshow('canvasOutput', dst);
dst.delete();
src.delete();
```

inRange

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
let low = new cv.Mat(src.rows, src.cols, src.type(), [0, 0, 0, 0]);
let high = new cv.Mat(src.rows, src.cols, src.type(), [150, 150, 150, 255]);
cv.inRange(src, low, high, dst);

console.log('src channel: ' + src.channels() + ', dst channel: ' + dst.channels());

cv.imshow('canvasOutput', dst);
high.delete();
low.delete();
dst.delete();
src.delete();
```

## transform

cv.resizeを利用する。

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
let dsize = new cv.Size(100, 100);

cv.resize(src, dst, dsize, 0, 0, cv.INTER_AREA);

cv.imshow('canvasOutput', dst);
dst.delete();
src.delete();
```

translate

移動に使う行列

```math
M = \begin{bmatrix}
1 & 0 & t_{x} \
0 & 1 & t_{y}
\end{bmatrix}
```

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
let M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, 50, 0, 1, 100]);
let dsize = new cv.Size(src.rows, src.cols);

cv.warpAffine(
  src, 
  dst, 
  M, 
  dsize, 
  cv.INTER_LINEAR, 
  cv.BORDER_CONSTANT, 
  new cv.Scalar());

cv.imshow('canvasOutput', dst);

M.delete();
dst.delete();
src.delete();
```

rotation。回転行列 + warpAffineで実装する。

$$
\begin{bmatrix}
\alpha & \beta & (1 - \alpha) \times center.x - \beta \ times center.y \\
-\beta & \alpha & \beta \times center.x + (1 - \alpha) \times center.y
\end{bmatrix} \\
\alpha = scale \times \cos\theta \\
\beta = scale \times \sin\theta
$$

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
let dsize = new cv.Size(src.rows, src.cols);
let center = new cv.Point(src.cols / 2, src.rows / 2);

let M = cv.getRotationMatrix2D(center, 45, 1);
cv.warpAffine(
  src, 
  dst, 
  M, 
  dsize, 
  cv.INTER_LINEAR, 
  cv.BORDER_CONSTANT, 
  new cv.Scalar());

cv.imshow('canvasOutput', dst);
src.delete(); dst.delete(); M.delete();
```

affine translation

3点をしていしたアフィン変換

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
let srcTri = cv.matFromArray(3, 1, cv.CV_32FC2, [0, 0, 0, 1, 1, 0]);
let dstTri = cv.matFromArray(3, 1, cv.CV_32FC2, [0.6, 0.2, 0.1, 1.3, 1.5, 0.3]);
let dsize = new cv.Size(src.rows, src.cols);
let M = cv.getAffineTransform(srcTri, dstTri);

cv.warpAffine(
  src, 
  dst, 
  M, 
  dsize, 
  cv.INTER_LINEAR, 
  cv.BORDER_CONSTANT, 
  new cv.Scalar()
);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
M.delete();
srcTri.delete();
dstTri.delete();
```

perspective translation

4点をしていしたアフィン変換

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
let dsize = new cv.Size(src.rows, src.cols);
let srcTri = cv.matFromArray(
  4, 
  1, 
  cv.CV_32FC2, 
  [
    56, 65, 
    368, 52, 
    28, 387, 
    389, 390
  ]
);
let dstTri = cv.matFromArray(
  4, 
  1, 
  cv.CV_32FC2, 
  [
    0, 0, 
    300, 0, 
    0, 300, 
    300, 300
  ]
);
let M = cv.getPerspectiveTransform(srcTri, dstTri);
cv.warpPerspective(
  src, 
  dst, 
  M, 
  dsize, 
  cv.INTER_LINEAR, 
  cv.BORDER_CONSTANT, 
  new cv.Scalar()
);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
M.delete();
srcTri.delete();
dstTri.delete();
```

## threshold

simple threshold

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
cv.threshold(src, dst, 177, 200, cv.THRESH_BINARY);
cv.imshow('canvasOutput', dst);
src.delete();
dst.delete();
```

adaptive threshold。領域毎のthreshold。

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);

cv.adaptiveThreshold(
  src, 
  dst, 
  200, 
  cv.ADAPTIVE_THRESH_GAUSSIAN_C, 
  cv.THRESH_BINARY, 
  3, 
  2);
cv.imshow('canvasOutput', dst);
src.delete();
dst.delete();
```

## smtooth images

2D convolution([参考](https://pystyle.info/opencv-filtering/))。
対象の画素及びその近傍の画素の画素値の重み付き総和を計算し、出力画像の画素値を計算。

```math
K = \frac{1}{25} \times \begin{bmatrix}
1 & 1 & 1 & 1 & 1 \
1 & 1 & 1 & 1 & 1 \
1 & 1 & 1 & 1 & 1 \
1 & 1 & 1 & 1 & 1 \
1 & 1 & 1 & 1 & 1
\end{bmatrix}
```

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
let M = cv.Mat.eye(3, 3, cv.CV_32FC1);
let anchor = new cv.Point(-1, -1);

cv.filter2D(
  src, 
  dst, 
  cv.CV_8U, 
  M, 
  anchor, 
  0, 
  cv.BORDER_DEFAULT);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
M.delete();
```

averaiging image blurring

```math
K = \frac{1}{9} \times \begin{bmatrix}
1 & 1 & 1 \
1 & 1 & 1 \
1 & 1 & 1
\end{bmatrix}
```

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
let ksize = new cv.Size(7, 7);
let anchor = new cv.Point(-1, -1);

cv.blur(src, dst, ksize, anchor, cv.BORDER_DEFAULT);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
```

[gaussian image blurring](https://qiita.com/UWATechnology/items/9a92f3c1430d5fb5f280)

画像全体を加重平均

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
let ksize = new cv.Size(20, 20);

cv.GaussianBlur(src, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
```

median image blurring

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();

cv.medianBlur(src, dst, 5);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
```

bilateral filtering image blurring

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();

cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);
cv.bilateralFilter(src, dst, 9, 75, 75, cv.BORDER_DEFAULT);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
```

## morphological transform

Erosion

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
let M = cv.Mat.ones(5, 5, cv.CV_8U);
let anchor = new cv.Point(-1, -1);

cv.erode(
  src, 
  dst, 
  M, 
  anchor, 
  8, 
  cv.BORDER_CONSTANT, 
  cv.morphologyDefaultBorderValue()
);
cv.imshow('canvasOutput', dst);

src.delete(); 
dst.delete(); 
M.delete();
```

Dilation

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
let M = cv.Mat.ones(5, 5, cv.CV_8U);
let anchor = new cv.Point(-1, -1);

cv.dilate(
  src, 
  dst, 
  M, 
  anchor, 
  8, 
  cv.BORDER_CONSTANT, 
  cv.morphologyDefaultBorderValue()
);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
M.delete();
```

opening

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
let M = cv.Mat.ones(5, 5, cv.CV_8U);
let anchor = new cv.Point(-1, -1);

cv.morphologyEx(
  src, 
  dst, 
  cv.MORPH_OPEN, 
  M, 
  anchor, 
  8,
  cv.BORDER_CONSTANT, 
  cv.morphologyDefaultBorderValue()
);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
M.delete();
```

closing

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
let M = cv.Mat.ones(5, 5, cv.CV_8U);

cv.morphologyEx(
  src, 
  dst, 
  cv.MORPH_CLOSE, 
  M
);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
M.delete();
```

Morphological gradient

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);
let dst = new cv.Mat();
let M = cv.Mat.ones(5, 5, cv.CV_8U);

cv.morphologyEx(src, dst, cv.MORPH_GRADIENT, M);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
M.delete();
```

top hat

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);
let dst = new cv.Mat();
let M = cv.Mat.ones(9, 9, cv.CV_8U);

cv.morphologyEx(
  src,
  dst,
  cv.MORPH_TOPHAT,
  M
);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
M.delete();
```

black hat

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);
let dst = new cv.Mat();
let M = cv.Mat.ones(53, 53, cv.CV_8U);

cv.morphologyEx(
  src,
  dst,
  cv.MORPH_BLACKHAT,
  M
);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
M.delete();
```

structuring element

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);
let dst = new cv.Mat();
let M = new cv.Mat();
let ksize = new cv.Size(5, 5);
M = cv.getStructuringElement(cv.MORPH_CROSS, ksize);

cv.morphologyEx(src, dst, cv.MORPH_GRADIENT, M);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
M.delete();
```

## image gradients

sobel derivaritives

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();

cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
cv.Sobel(src, dst, cv.CV_8U, 1, 0, 3, 1, 0, cv.BORDER_DEFAULT);
cv.Sobel(src, dst, cv.CV_8U, 0, 1, 3, 1, 0, cv.BORDER_DEFAULT);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
```

scharr derivaritives

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();

cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
cv.Scharr(src, dst, cv.CV_8U, 1, 0, 1, 0, cv.BORDER_DEFAULT);
cv.Scharr(src, dst, cv.CV_8U, 0, 1, 1, 0, cv.BORDER_DEFAULT);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
```

laplacian delivaritive

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();

cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
cv.Laplacian(src, dst, cv.CV_8U, 1, 1, 0, cv.BORDER_DEFAULT);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
```

## canny edge detection

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();

cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
cv.Canny(src, dst, 50, 100, 3, false);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
```

## image pyramids

pyramid down

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();

cv.pyrDown(src, dst, new cv.Size(0, 0), cv.BORDER_DEFAULT);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
```

pyramid up

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();

cv.pyrUp(src, dst, new cv.Size(0, 0), cv.BORDER_DEFAULT);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
```

## contours

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(src, src, 120, 200, cv.THRESH_BINARY);
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();

cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
// draw contours with random Scalar
for (let i = 0; i < contours.size(); ++i) {
    let color = new cv.Scalar(
      Math.round(Math.random() * 255), 
      Math.round(Math.random() * 255),
      Math.round(Math.random() * 255)
    );
    cv.drawContours(
      dst, 
      contours, 
      i, 
      color, 
      1, 
      cv.LINE_8, 
      hierarchy, 
      100
    );
}
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
contours.delete();
hierarchy.delete();
```

| properties | description |
| :----- | :----- |
| moment | |
| area | |
| perimeter | 外周 |

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(src, src, 177, 200, cv.THRESH_BINARY);
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
cv.findContours(
  src, 
  contours, 
  hierarchy, 
  cv.RETR_CCOMP, 
  cv.CHAIN_APPROX_SIMPLE
);
for (let i = 0; i < contours.size(); ++i) {
  let cnt = contours.get(i);
  let Moments = cv.moments(cnt, false);
  let area = cv.contourArea(cnt, false);
  let perimeter = cv.arcLength(cnt, true);
  console.log('contour ' + i + ' moments m00: ' + Moments.m00 + ',area: ' + area + ', perimeter: ' + perimeter );
  cnt.delete();
}

src.delete();
dst.delete();
contours.delete();
hierarchy.delete();
```

approximation

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(src, src, 100, 200, cv.THRESH_BINARY);
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
let poly = new cv.MatVector();

cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
for (let i = 0; i < contours.size(); ++i) {
    let tmp = new cv.Mat();
    let cnt = contours.get(i);

    cv.approxPolyDP(cnt, tmp, 3, true);
    poly.push_back(tmp);
    cnt.delete(); tmp.delete();
}

for (let i = 0; i < contours.size(); ++i) {
    let color = new cv.Scalar(
      Math.round(
        Math.random() * 255),
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255)
    );
    cv.drawContours(dst, poly, i, color, 1, 8, hierarchy, 0);
}
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
hierarchy.delete();
contours.delete();
poly.delete();
```

convex hull

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(src, src, 100, 200, cv.THRESH_BINARY);
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
let hull = new cv.MatVector();
cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
for (let i = 0; i < contours.size(); ++i) {
    let tmp = new cv.Mat();
    let cnt = contours.get(i);
    cv.convexHull(cnt, tmp, false, true);
    hull.push_back(tmp);
    cnt.delete(); tmp.delete();
}

for (let i = 0; i < contours.size(); ++i) {
    let colorHull = new cv.Scalar(
      Math.round(Math.random() * 255),
      Math.round(Math.random() * 255),
      Math.round(Math.random() * 255)
    );
    cv.drawContours(dst, hull, i, colorHull, 1, 8, hierarchy, 0);
}
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
hierarchy.delete();
contours.delete();
hull.delete();
```

bounding rectangle

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(src, src, 177, 200, cv.THRESH_BINARY);
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
for (let i = 0; i < contours.size(); ++i) {
  let cnt = contours.get(i);

  let rect = cv.boundingRect(cnt);
  let contoursColor = new cv.Scalar(255, 255, 255);
  let rectangleColor = new cv.Scalar(255, 0, 0);
  cv.drawContours(dst, contours, 0, contoursColor, 1, 8, hierarchy, 100);

  let point1 = new cv.Point(rect.x, rect.y);
  let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
  cv.rectangle(dst, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);
  cnt.delete();
}
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
contours.delete();
hierarchy.delete();
```

min area rect

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(src, src, 177, 200, cv.THRESH_BINARY);
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
let cnt = contours.get(0);

let rotatedRect = cv.minAreaRect(cnt);
let vertices = cv.RotatedRect.points(rotatedRect);
let contoursColor = new cv.Scalar(255, 255, 255);
let rectangleColor = new cv.Scalar(255, 0, 0);
cv.drawContours(dst, contours, 0, contoursColor, 1, 8, hierarchy, 100);
for (let i = 0; i < 4; i++) {
    cv.line(dst, vertices[i], vertices[(i + 1) % 4], rectangleColor, 2, cv.LINE_AA, 0);
}
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
contours.delete();
hierarchy.delete();
cnt.delete();
```

min area circle

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(src, src, 177, 200, cv.THRESH_BINARY);
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
let cnt = contours.get(0);

let circle = cv.minEnclosingCircle(cnt);
let contoursColor = new cv.Scalar(255, 255, 255);
let circleColor = new cv.Scalar(255, 0, 0);
cv.drawContours(dst, contours, 0, contoursColor, 1, 8, hierarchy, 100);
cv.circle(dst, circle.center, circle.radius, circleColor);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
contours.delete();
hierarchy.delete();
cnt.delete();
```

fit ellipse

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(src, src, 177, 200, cv.THRESH_BINARY);
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
let cnt = contours.get(0);

let rotatedRect = cv.fitEllipse(cnt);
let contoursColor = new cv.Scalar(0, 255, 0);
let ellipseColor = new cv.Scalar(255, 0, 0);
cv.drawContours(dst, contours, 0, contoursColor, 1, 8, hierarchy, 100);
cv.ellipse1(dst, rotatedRect, ellipseColor, 1, cv.LINE_8);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
contours.delete();
hierarchy.delete();
cnt.delete();
```

fit line

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(src, src, 177, 200, cv.THRESH_BINARY);
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
let line = new cv.Mat();
cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
let cnt = contours.get(0);

cv.fitLine(cnt, line, cv.DIST_L2, 0, 0.01, 0.01);
let contoursColor = new cv.Scalar(0, 255, 0);
let lineColor = new cv.Scalar(255, 0, 0);
cv.drawContours(dst, contours, 0, contoursColor, 1, 8, hierarchy, 100);

let vx = line.data32F[0];
let vy = line.data32F[1];
let x = line.data32F[2];
let y = line.data32F[3];
let lefty = Math.round((-x * vy / vx) + y);
let righty = Math.round(((src.cols - x) * vy / vx) + y);
let point1 = new cv.Point(src.cols - 1, righty);
let point2 = new cv.Point(0, lefty);
cv.line(dst, point1, point2, lineColor, 2, cv.LINE_AA, 0);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
contours.delete();
hierarchy.delete();
line.delete();
cnt.delete();
```

aspect ratio, extent, solidity, equivalent diameter, orientation

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(src, src, 177, 200, cv.THRESH_BINARY);
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
for (let i = 0; i < contours.size(); ++i) {
  let cnt = contours.get(i);

  let rect = cv.boundingRect(cnt);
  let contoursColor = new cv.Scalar(255, 255, 255);
  let rectangleColor = new cv.Scalar(255, 0, 0);
  cv.drawContours(dst, contours, 0, contoursColor, 1, 8, hierarchy, 100);

  let point1 = new cv.Point(rect.x, rect.y);
  let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
  cv.rectangle(dst, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);

  let aspectRatio = rect.width / rect.height;
  let area = cv.contourArea(cnt, false);
  let rectArea = rect.width * rect.height;
  let extent = area / rectArea;

  let hull = new cv.Mat();
  cv.convexHull(cnt, hull, false, true);
  let hullArea = cv.contourArea(hull, false);
  let solidity = area / hullArea;

  let equiDiameter = Math.sqrt(4 * area / Math.PI);

  let rotatedRect = cv.fitEllipse(cnt);
  let angle = rotatedRect.angle;
  
  console.log('contor[' + i + ']\n' + 
    'aspect ratio: ' + aspectRatio + ', ' +
    'extent: ' + extent +  ', ' +
    'solidity: ' + solidity + ', ' +
    'equivalent diameter: ' + equiDiameter + ', ' +
    'orientation: ' + angle);

  hull.delete();
  cnt.delete();
}
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
contours.delete();
hierarchy.delete();
```

mask and pixel point

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(src, src, 120, 200, cv.THRESH_BINARY);
cv.transpose(src, dst);
let result = cv.minMaxLoc(src, dst);
let average = cv.mean(src, dst);
console.log( 'min value: ' + result.minVal + '\n' +
  'max value: ' + result.maxVal + '\n' +
  'min location: ' + result.minLoc + '\n' +
  'max location: ' + result.maxLoc + '\n' +
  'average: ' + average);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
```

convex defects

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(src, src, 100, 200, cv.THRESH_BINARY);
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
let hull = new cv.Mat();
let defect = new cv.Mat();
let cnt = contours.get(0);
let lineColor = new cv.Scalar(255, 0, 0);
let circleColor = new cv.Scalar(255, 255, 255);
cv.convexHull(cnt, hull, false, false);
cv.convexityDefects(cnt, hull, defect);
for (let i = 0; i < defect.rows; ++i) {
    let start = new cv.Point(
      cnt.data32S[defect.data32S[i * 4] * 2],
      cnt.data32S[defect.data32S[i * 4] * 2 + 1]);
    let end = new cv.Point(
      cnt.data32S[defect.data32S[i * 4 + 1] * 2],
      cnt.data32S[defect.data32S[i * 4 + 1] * 2 + 1]);
    let far = new cv.Point(
      cnt.data32S[defect.data32S[i * 4 + 2] * 2],
      cnt.data32S[defect.data32S[i * 4 + 2] * 2 + 1]);
    cv.line(dst, start, end, lineColor, 2, cv.LINE_AA, 0);
    cv.circle(dst, far, 3, circleColor, -1);
}
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
hierarchy.delete();
contours.delete();
hull.delete();
defect.delete();
```

point polygon

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(src, src, 177, 200, cv.THRESH_BINARY);
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
let contourID0 = 10;
let contourID1 = 5;
let color0 = new cv.Scalar(255, 0, 0);
let color1 = new cv.Scalar(0, 0, 255);

let result = cv.matchShapes(
  contours.get(contourID0), 
  contours.get(contourID1), 
  1, 
  0
);
console.log(result);
cv.drawContours(dst, contours, contourID0, color0, 1, cv.LINE_8, hierarchy, 100);
cv.drawContours(dst, contours, contourID1, color1, 1, cv.LINE_8, hierarchy, 100);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
contours.delete();
hierarchy.delete();
```

## histgrams

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
let srcVec = new cv.MatVector();
srcVec.push_back(src);
let accumulate = false;
let channels = [0];
let histSize = [256];
let ranges = [0, 255];
let hist = new cv.Mat();
let mask = new cv.Mat();
let color = new cv.Scalar(255, 255, 255);
let scale = 2;

cv.calcHist(srcVec, channels, mask, hist, histSize, ranges, accumulate);
let result = cv.minMaxLoc(hist, mask);
let max = result.maxVal;
let dst = new cv.Mat.zeros(src.rows, histSize[0] * scale, cv.CV_8UC3);
for (let i = 0; i < histSize[0]; i++) {
    let binVal = hist.data32F[i] * src.rows / max;
    let point1 = new cv.Point(i * scale, src.rows - 1);
    let point2 = new cv.Point((i + 1) * scale - 1, src.rows - binVal);
    cv.rectangle(dst, point1, point2, color, cv.FILLED);
}
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
srcVec.delete();
mask.delete();
hist.delete();
```

equalization

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.equalizeHist(src, dst);
cv.imshow('canvasOutput', src);
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
```

Contrast Limited Adaptive Histogram Equalization

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let equalDst = new cv.Mat();
let claheDst = new cv.Mat();

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.equalizeHist(src, equalDst);
let tileGridSize = new cv.Size(8, 8);
let clahe = new cv.CLAHE(40, tileGridSize);
clahe.apply(src, claheDst);
cv.imshow('canvasOutput', equalDst);
cv.imshow('canvasOutput', claheDst);

src.delete();
equalDst.delete();
claheDst.delete();
clahe.delete();
```

back projection

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let img2Element = document.getElementById('imageSrc2');
let dst = cv.imread(img2Element);

cv.cvtColor(src, src, cv.COLOR_RGB2HSV, 0);
cv.cvtColor(dst, dst, cv.COLOR_RGB2HSV, 0);
let srcVec = new cv.MatVector();
let dstVec = new cv.MatVector();
srcVec.push_back(src); dstVec.push_back(dst);
let backproj = new cv.Mat();
let none = new cv.Mat();
let mask = new cv.Mat();
let hist = new cv.Mat();
let channels = [0];
let histSize = [50];
let ranges = [0, 180];
let accumulate = false;
cv.calcHist(srcVec, channels, mask, hist, histSize, ranges, accumulate);
cv.normalize(hist, hist, 0, 255, cv.NORM_MINMAX, -1, none);
cv.calcBackProject(dstVec, channels, hist, backproj, ranges, 1);
cv.imshow('canvasOutput', backproj);

src.delete();
dst.delete();
srcVec.delete();
dstVec.delete();
backproj.delete();
mask.delete();
hist.delete();
none.delete();
```

## image transform

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);

// get optimal size of DFT
let optimalRows = cv.getOptimalDFTSize(src.rows);
let optimalCols = cv.getOptimalDFTSize(src.cols);
let s0 = cv.Scalar.all(0);
let padded = new cv.Mat();
cv.copyMakeBorder(
  src,
  padded,
  0,
  optimalRows - src.rows,
  0,
  optimalCols - src.cols,
  cv.BORDER_CONSTANT,
  s0
);

let plane0 = new cv.Mat();
padded.convertTo(plane0, cv.CV_32F);
let planes = new cv.MatVector();
let complexI = new cv.Mat();
let plane1 = new cv.Mat.zeros(padded.rows, padded.cols, cv.CV_32F);
planes.push_back(plane0);
planes.push_back(plane1);
cv.merge(planes, complexI);

cv.dft(complexI, complexI);

cv.split(complexI, planes);
cv.magnitude(planes.get(0), planes.get(1), planes.get(0));
let mag = planes.get(0);
let m1 = new cv.Mat.ones(mag.rows, mag.cols, mag.type());
cv.add(mag, m1, mag);
cv.log(mag, mag);

let rect = new cv.Rect(0, 0, mag.cols & -2, mag.rows & -2);
mag = mag.roi(rect);

let cx = mag.cols / 2;
let cy = mag.rows / 2;
let tmp = new cv.Mat();

let rect0 = new cv.Rect(0, 0, cx, cy);
let rect1 = new cv.Rect(cx, 0, cx, cy);
let rect2 = new cv.Rect(0, cy, cx, cy);
let rect3 = new cv.Rect(cx, cy, cx, cy);

let q0 = mag.roi(rect0);
let q1 = mag.roi(rect1);
let q2 = mag.roi(rect2);
let q3 = mag.roi(rect3);

q0.copyTo(tmp);
q3.copyTo(q0);
tmp.copyTo(q3);

q1.copyTo(tmp);
q2.copyTo(q1);
tmp.copyTo(q2);

cv.normalize(mag, mag, 0, 1, cv.NORM_MINMAX);

cv.imshow('canvasOutput', mag);

src.delete();
padded.delete();
planes.delete();
complexI.delete();
m1.delete();
tmp.delete();
```

## template matching

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let img2Element = document.getElementById('imageSrc2');
let templ = cv.imread(img2Element);
let dst = new cv.Mat();
let mask = new cv.Mat();

console.log('image 1 size: ' + src.rows +', ' + src.cols);
console.log('image 2 size: ' + templ.rows +', ' + templ.cols);
cv.matchTemplate(src, templ, dst, cv.TM_CCOEFF, mask);
let result = cv.minMaxLoc(dst, mask);
let maxPoint = result.maxLoc;
console.log('point x: ' + maxPoint.x +',y: ' + maxPoint.y);
let color = new cv.Scalar(255, 0, 0, 255);
let point = new cv.Point(maxPoint.x + templ.cols, maxPoint.y + templ.rows);
cv.rectangle(src, maxPoint, point, color, 2, cv.LINE_8, 0);
cv.imshow('canvasOutput', src);

src.delete();
dst.delete();
mask.delete();
```

## hough line transform

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
let lines = new cv.Mat();

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.Canny(src, src, 50, 200, 3);
cv.HoughLines(
  src, 
  lines, 
  1, 
  Math.PI / 180,
  30, 
  0, 
  0, 
  0, 
  Math.PI
);

for (let i = 0; i < lines.rows; ++i) {
    let rho = lines.data32F[i * 2];
    let theta = lines.data32F[i * 2 + 1];
    let a = Math.cos(theta);
    let b = Math.sin(theta);
    let x0 = a * rho;
    let y0 = b * rho;
    let startPoint = {x: x0 - 1000 * b, y: y0 + 1000 * a};
    let endPoint = {x: x0 + 1000 * b, y: y0 - 1000 * a};
    cv.line(dst, startPoint, endPoint, [255, 0, 0, 255]);
}
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
lines.delete();
```

hough line

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
let lines = new cv.Mat();
let color = new cv.Scalar(255, 0, 0);

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.Canny(src, src, 50, 200, 3);
cv.HoughLinesP(src, lines, 1, Math.PI / 180, 2, 0, 0);
for (let i = 0; i < lines.rows; ++i) {
    let startPoint = new cv.Point(
      lines.data32S[i * 4],
      lines.data32S[i * 4 + 1]);
    let endPoint = new cv.Point(
      lines.data32S[i * 4 + 2],
      lines.data32S[i * 4 + 3]);
    cv.line(dst, startPoint, endPoint, color);
}
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
lines.delete();
```

## hough circle transform

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);

let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8U);
let circles = new cv.Mat();
let color = new cv.Scalar(255, 0, 0);

cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.HoughCircles(
  src,
  circles,
  cv.HOUGH_GRADIENT,
  1, 
  45, 
  75, 
  40, 
  0, 
  0
);
for (let i = 0; i < circles.cols; ++i) {
    let x = circles.data32F[i * 3];
    let y = circles.data32F[i * 3 + 1];
    let radius = circles.data32F[i * 3 + 2];
    let center = new cv.Point(x, y);
    cv.circle(dst, center, radius, color);
}
cv.imshow('canvasOutput', dst);

src.delete();
dst.delete();
circles.delete();
```

## image segmentation

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);

let dst = new cv.Mat();
let gray = new cv.Mat();

cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(gray, gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);

cv.imshow('canvasOutput', gray);

src.delete();
dst.delete();
gray.delete();
```

get background

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);

let dst = new cv.Mat();
let gray = new cv.Mat();
let opening = new cv.Mat();
let coinsBg = new cv.Mat();

cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(gray, gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);

let M = cv.Mat.ones(3, 3, cv.CV_8U);
cv.erode(gray, gray, M);
cv.dilate(gray, opening, M);
cv.dilate(opening, coinsBg, M, new cv.Point(-1, -1), 3);

cv.imshow('canvasOutput', coinsBg);

src.delete();
dst.delete();
gray.delete();
opening.delete();
coinsBg.delete();
M.delete();
```

distance transform

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
let gray = new cv.Mat();
let opening = new cv.Mat();
let coinsBg = new cv.Mat();
let coinsFg = new cv.Mat();
let distTrans = new cv.Mat();

cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(gray, gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);
let M = cv.Mat.ones(3, 3, cv.CV_8U);
cv.erode(gray, gray, M);
cv.dilate(gray, opening, M);
cv.dilate(opening, coinsBg, M, new cv.Point(-1, -1), 3);

cv.distanceTransform(opening, distTrans, cv.DIST_L2, 5);
cv.normalize(distTrans, distTrans, 1, 0, cv.NORM_INF);

cv.imshow('canvasOutput', distTrans);

src.delete();
dst.delete();
gray.delete();
opening.delete();
coinsBg.delete();
coinsFg.delete();
distTrans.delete();
M.delete();
```

foreground

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
let gray = new cv.Mat();
let opening = new cv.Mat();
let coinsBg = new cv.Mat();
let coinsFg = new cv.Mat();
let distTrans = new cv.Mat();

cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(gray, gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);
let M = cv.Mat.ones(3, 3, cv.CV_8U);
cv.erode(gray, gray, M);
cv.dilate(gray, opening, M);
cv.dilate(opening, coinsBg, M, new cv.Point(-1, -1), 3);
cv.distanceTransform(opening, distTrans, cv.DIST_L2, 5);
cv.normalize(distTrans, distTrans, 1, 0, cv.NORM_INF);
cv.threshold(distTrans, coinsFg, 0.7 * 1, 255, cv.THRESH_BINARY);

cv.imshow('canvasOutput', coinsFg);

src.delete();
dst.delete();
gray.delete();
opening.delete();
coinsBg.delete();
coinsFg.delete();
distTrans.delete();
M.delete();
```

watershed

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);
let dst = new cv.Mat();
let gray = new cv.Mat();
let opening = new cv.Mat();
let coinsBg = new cv.Mat();
let coinsFg = new cv.Mat();
let distTrans = new cv.Mat();
let unknown = new cv.Mat();
let markers = new cv.Mat();

cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(gray, gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);

let M = cv.Mat.ones(3, 3, cv.CV_8U);
cv.erode(gray, gray, M);
cv.dilate(gray, opening, M);
cv.dilate(opening, coinsBg, M, new cv.Point(-1, -1), 3);

cv.distanceTransform(opening, distTrans, cv.DIST_L2, 5);
cv.normalize(distTrans, distTrans, 1, 0, cv.NORM_INF);

cv.threshold(distTrans, coinsFg, 0.7 * 1, 255, cv.THRESH_BINARY);
coinsFg.convertTo(coinsFg, cv.CV_8U, 1, 0);
cv.subtract(coinsBg, coinsFg, unknown);

cv.connectedComponents(coinsFg, markers);
for (let i = 0; i < markers.rows; i++) {
    for (let j = 0; j < markers.cols; j++) {
        markers.intPtr(i, j)[0] = markers.ucharPtr(i, j)[0] + 1;
        if (unknown.ucharPtr(i, j)[0] == 255) {
            markers.intPtr(i, j)[0] = 0;
        }
    }
}
cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);
cv.watershed(src, markers);

for (let i = 0; i < markers.rows; i++) {
    for (let j = 0; j < markers.cols; j++) {
        if (markers.intPtr(i, j)[0] == -1) {
            src.ucharPtr(i, j)[0] = 255; // R
            src.ucharPtr(i, j)[1] = 0; // G
            src.ucharPtr(i, j)[2] = 0; // B
        }
    }
}
cv.imshow('canvasOutput', src);

src.delete();
dst.delete();
gray.delete();
opening.delete();
coinsBg.delete();
coinsFg.delete();
distTrans.delete();
unknown.delete();
markers.delete();
M.delete();
```

## foreground extraction

grubcat

```js
let img1Element = document.getElementById('imageSrc1');
let src = cv.imread(img1Element);

cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);
let mask = new cv.Mat();
let bgdModel = new cv.Mat();
let fgdModel = new cv.Mat();
let rect = new cv.Rect(50, 50, 260, 280);
cv.grabCut(src, mask, rect, bgdModel, fgdModel, 1, cv.GC_INIT_WITH_RECT);
for (let i = 0; i < src.rows; i++) {
    for (let j = 0; j < src.cols; j++) {
        if (mask.ucharPtr(i, j)[0] == 0 || mask.ucharPtr(i, j)[0] == 2) {
            src.ucharPtr(i, j)[0] = 0;
            src.ucharPtr(i, j)[1] = 0;
            src.ucharPtr(i, j)[2] = 0;
        }
    }
}

let color = new cv.Scalar(0, 0, 255);
let point1 = new cv.Point(rect.x, rect.y);
let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
cv.rectangle(src, point1, point2, color);
cv.imshow('canvasOutput', src);

src.delete();
mask.delete();
bgdModel.delete();
fgdModel.delete();
```
