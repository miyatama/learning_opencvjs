# feature detection

## edge and corner

moravec

$$
E(x, y)  = \frac{1}{8} \sum_{u=-1}^{1} \sum_{v=-1}^{1} | I(x+u, y+v) - I(x,y)|
$$

kanade-lucas-tomasi

$$
E(x, y) = \sum_{u,v} G(u,v) \lbrace I(x+u, y+v) - I(x,y) \rbrace^2 \\
G(x,y) = \frac{1}{2 \pi \sigma^2} e^{-\frac{x^2 y^2}{\sigma^2}} \\
$$

特徴点探索

$$
E(x, y) = \sum_{u,v} G(u,v) \lbrace I(x+u, y+v) - I(x,y) \rbrace^2 \\
全微分 \\
E(x, y) \approx \sum_{u,v}G(u,v) \lbrace I(x,y) + uI_x + vI_y - I(x,y)\rbrace^2 \\
E(x, y) \approx \sum_{u,v}G(u,v) \lbrace uI_x + vI_y \rbrace^2 \\
E(x, y) \approx \sum_{u,v}G(u,v) \lbrace u^2I_x^2 + 2uvI_x I_y + v^2I_y^2 \rbrace \\

E(x, y) \approx \sum_{u,v}G(u,v) \lbrace u^2I_x^2 \rbrace 
+ \sum_{u,v}G(u,v) \lbrace 2uvI_x I_y \rbrace 
+ \sum_{u,v}G(u,v) \lbrace  v^2I_y^2 \rbrace \\
$$

行列へ変換

$$
\begin{pmatrix}
u & v
\end{pmatrix}
\begin{pmatrix}
\sum_{u,v}G(u,v)I_x^2 & \sum_{u,v}G(u,v)I_x I_y \\
\sum_{u,v}G(u,v)I_x I_y & \sum_{u,v}G(u,v) I_y^2
\end{pmatrix}
\begin{pmatrix}
u \\
v
\end{pmatrix}
$$

構造テンソルの固有ベクトルを元に特徴を判定する

$$
M = \begin{pmatrix}
\sum_{u,v}G(u,v)I_x^2 & \sum_{u,v}G(u,v)I_x I_y \\
\sum_{u,v}G(u,v)I_x I_y & \sum_{u,v}G(u,v) I_y^2
\end{pmatrix}
$$

特性方程式をとく

$$
det(M - \lambda I) = 0 \\
$$

長いので別名付けて計算する

$$
e_1 = \sum_{u,v}G(u,v)I_x^2 \\
e_2 = \sum_{u,v}G(u,v)I_x I_y \\
e_3 = \sum_{u,v}G(u,v) I_y^2 \\

M = \begin{pmatrix}
e_1 & e_2 \\
e_2 & e_3 \\
\end{pmatrix} \\
det(M - \lambda I) = 0\\
(e_1 - \lambda)(e_3 - \lambda) - e_2^2 = 0 \\
\lambda^2 + (-e_1 - e_3)\lambda - e_2^2 + e_1e_3= 0 \\
$$

解の公式を使ってλを求める

$$
ax^2 + bx + c = 0 \\
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} \\
a = 1, b = (-e_1 - e_3), c = -e_2^2 + e_1e_3 \\
\lambda = \frac{1}{2}(e_1 + e_3 \pm \sqrt{(-e_1 - e_3)^2 - 4(-e_2^2 + e_1e_3)}) \\
\lambda = \frac{1}{2}(e_1 + e_3 \pm \sqrt{(e_1 - e_3)^2 + 4e_2^2})

$$



結果

$$
\lambda_1 = \frac{1}{2}(e_1 + e_3 + \sqrt{(e_1 - e_3)^2 + 4e_2^2}) \\
\lambda_2 = \frac{1}{2}(e_1 + e_3 - \sqrt{(e_1 - e_3)^2 + 4e_2^2})
$$

特徴点の判定

$$
min(\lambda_1, \lambda_2) > T
$$

| 特徴 | condition |
| :----- | :----- |
| なし | $M = 0, \lambda_1 = \lambda_2 = 0$ |
| エッジ | $\lambda_1 > 0, \lambda_2 = 0$ |
| コーナー | $\lambda_1 \geq \lambda_2 > 0$ |

## contour

sobel, laplacian, ゼロ交差法

## line, circle

Hough

## AKAZE

### 特徴マッチ

<details><summary>Code</summary><div>

```js
let img1Element = document.getElementById('imageSrc1');
let img1Raw = cv.imread(img1Element);
let img1 = new cv.Mat();
let mask1 = new cv.Mat();
let kp1 = new cv.KeyPointVector(); // 特徴点
let des1 = new cv.Mat();           // 特徴記述子

let img2Element = document.getElementById('imageSrc2');
let img2Raw = cv.imread(img2Element);
let img2 = new cv.Mat();
let mask2 = new cv.Mat();
let kp2 = new cv.KeyPointVector();
let des2 = new cv.Mat();

cv.cvtColor(
  img1Raw, 
  img1, 
  cv.COLOR_RGBA2RGB,
  0
);
cv.cvtColor(
  img2Raw, 
  img2, 
  cv.COLOR_RGBA2RGB,
  0
);

/*
// https://docs.opencv.org/4.x/d8/d30/classcv_1_1AKAZE.html
int descriptor_type = AKAZE::DESCRIPTOR_MLDB = 5, - 記述子タイプ
int descriptor_size = 0,
int descriptor_channels = 3,
float threshold = 0.001f,
int nOctaves = 4,
int nOctaveLayers = 4,
int diffusivity = KAZE::DIFF_PM_G2
*/
let akaze = new cv.AKAZE();

akaze.detectAndCompute(img1, mask1, kp1, des1);
akaze.detectAndCompute(img2, mask2, kp2, des2);

let matches = new cv.DMatchVectorVector();
let matcher = new cv.BFMatcher();
matcher.knnMatch(des1, des2, matches, 2);

let ratio = .5;
let filteredMatches = new cv.DMatchVectorVector();
for (let i = 0; i < matches.size(); i++) {
    let match = matches.get(i);
    let dMatch1 = match.get(0);
    let dMatch2 = match.get(1);
    if (dMatch1.distance < dMatch2.distance * ratio) {
      const t = new cv.DMatchVector();
      t.push_back(dMatch1);
      filteredMatches.push_back(t);
    }
}

let matchingImage = new cv.Mat();
cv.drawMatchesKnn(
  img1,
  kp1,
  img2,
  kp2,
  filteredMatches,
  matchingImage
);

cv.imshow('canvasOutput', matchingImage);

img1Raw.delete();
img2Raw.delete();
img1.delete();
img2.delete();
akaze.delete();
mask1.delete();
kp1.delete();
des1.delete();
mask2.delete();
kp2.delete();
des2.delete();
matcher.delete();
matches.delete();
filteredMatches.delete();
matchingImage.delete();
```

</div></details>

+ [OpenCVで他のどの記事よりも頑強に特徴量マッチングしてみた(Python, AKAZE)](https://qiita.com/grouse324/items/74988134a9073568b32d)
+ [Opencv.js - findPerspective returns wrong corners coordinatesa](https://answers.opencv.org/question/235594/opencvjs-findperspective-returns-wrong-corners-coordinates/_)


### 特徴点マッチと画像置き換え

+ [DMatch](https://docs.opencv.org/4.8.0/d4/de0/classcv_1_1DMatch.html)
+ [DMatchVector](https://cancerberosgx.github.io/demos/mirada-opencv-api-html/classes/_types_opencv__hacks_.dmatchvector.html)

<details><summary>Code</summary><div>

```js
let img1Element = document.getElementById('imageSrc1');
let imgQueryRaw = cv.imread(img1Element);
let imgQuery = new cv.Mat();
let maskQuery = new cv.Mat();
let queryKeypoints = new cv.KeyPointVector();
let queryDescriptors = new cv.Mat();

let img2Element = document.getElementById('imageSrc2');
let imgTrainRaw = cv.imread(img2Element);
let imgTrain = new cv.Mat();
let maskTrain = new cv.Mat();
let trainKeypoints = new cv.KeyPointVector();
let trainDescriptors = new cv.Mat();

cv.cvtColor(
  imgQueryRaw, 
  imgQuery, 
  cv.COLOR_RGBA2RGB,
  0
);
cv.cvtColor(
  imgTrainRaw, 
  imgTrain, 
  cv.COLOR_RGBA2RGB,
  0
);
let akaze = new cv.AKAZE();

akaze.detectAndCompute(
  imgQuery, 
  maskQuery, 
  queryKeypoints, 
  queryDescriptors);
akaze.detectAndCompute(
  imgTrain, 
  maskTrain, 
  trainKeypoints, 
  trainDescriptors);

let matches = new cv.DMatchVectorVector();
let matcher = new cv.BFMatcher();
matcher.knnMatch(
  queryDescriptors, 
  trainDescriptors,
  matches, 
  2
);

let ratio = .5;
let queryMatchKeypoints = new cv.KeyPointVector();
let trainMatchKeypoints = new cv.KeyPointVector();
for (let i = 0; i < matches.size(); i++) {
    let match = matches.get(i);
    let dMatch1 = match.get(0);
    let dMatch2 = match.get(1);
    if (dMatch1.distance < dMatch2.distance * ratio) {
      let queryKp = queryKeypoints.get(dMatch1.queryIdx);
      queryMatchKeypoints.push_back(queryKp);

      let trainKp = trainKeypoints.get(dMatch1.trainIdx);
      trainMatchKeypoints.push_back(trainKp);
    }
}

let img3Element = document.getElementById('imageSrc3');
let imgReplaceRaw = cv.imread(img3Element);
let imgReplace = new cv.Mat();
cv.cvtColor(
  imgReplaceRaw, 
  imgReplace, 
  cv.COLOR_RGBA2RGB,
  0
);

let srcPoints = [];
let distPoints = [];
for(let i = 0; i < 4; i++) {
  let queryKp = queryMatchKeypoints.get(i);
  let trainKp = trainMatchKeypoints.get(i);
  srcPoints.push(queryKp.pt.x);
  srcPoints.push(queryKp.pt.y);
  distPoints.push(trainKp.pt.x);
  distPoints.push(trainKp.pt.y);
}

let dsize = new cv.Size(imgTrain.rows, imgTrain.cols);
let srcTri = cv.matFromArray(
  4, 
  1, 
  cv.CV_32FC2, 
  srcPoints ,
);
let dstTri = cv.matFromArray(
  4, 
  1, 
  cv.CV_32FC2, 
  distPoints,
);
let M = cv.getPerspectiveTransform(srcTri, dstTri);

cv.warpPerspective(
  imgReplace, 
  imgTrain, 
  M, 
  dsize, 
  cv.INTER_LINEAR, 
  cv.BORDER_TRANSPARENT, 
  new cv.Scalar(0, 0, 0, 0)
);
cv.imshow('canvasOutput', imgTrain);

imgQueryRaw.delete();
imgQuery.delete();
maskQuery.delete();
queryKeypoints.delete();
queryDescriptors.delete();
imgTrainRaw.delete();
imgTrain.delete();
maskTrain.delete();
trainKeypoints.delete();
trainDescriptors.delete();
akaze.delete();
imgReplaceRaw.delete();
imgReplace.delete();
queryMatchKeypoints.delete();
trainMatchKeypoints.delete();
matcher.delete();
matches.delete();
```

</div></details>
