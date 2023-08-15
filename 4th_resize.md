# resize

## docs

+ [cv::resize](https://docs.opencv.org/4.8.0/da/d54/group__imgproc__transform.html#ga47a974309e9102f5f08231edc7e7529d)
+ [interpolation Flags](https://docs.opencv.org/4.8.0/da/d54/group__imgproc__transform.html#ga5bb5a1fea74ea38e1a5445ca803ff121)
+ [【OpenCV】画像サイズを変更するresize](https://python-no-memo.blogspot.com/2021/06/opencvcv2resize.html)
+ [OpenCVの丸め誤差bit-exactnessについて](https://qiita.com/tomoaki_teshima/items/0f97defc72639c2db9df)
+ [画像の幾何変換](http://labs.eecs.tottori-u.ac.jp/sd/Member/oyamada/OpenCV/html/py_tutorials/py_imgproc/py_geometric_transformations/py_geometric_transformations.html)

## 幾何学変換

画素の座標値のみを使った変換を指す。

線形変換: x', y'への変換がx,yの定数項なしの1次式で表される変換。

$$
\begin{pmatrix}
x \\
y \\
\end{pmatrix} \rightarrow \begin{pmatrix}
x' \\
y' \\
\end{pmatrix} \\
\left\{ \,
\begin{aligned}
x' = ax + by \\
y' = cx + dy
\end{aligned}
\right.
$$

## リサイズとは

行列の掛け算で行う

並進: 移動量がtx, ty。

$$
M = \begin{bmatrix}
1 & 0 & t_x \\
0 & 1 & t_y \\
\end{bmatrix}
$$

回転

$$
M = \begin{bmatrix}
\cos{\theta} & -\sin{\theta} \\
\sin{\theta} & \cos{\theta}
\end{bmatrix}
$$

中心の変更

$$
M = \begin{bmatrix}
\alpha & \beta & (1 - \alpha) \cdot center_x - \beta \cdot center_y \\
-\beta & \alpha & \beta \cdot center_x + (1 - \alpha) \cdot center_y \\
\end{bmatrix} \\
\alpha = scale \cdot \cos{\theta} \\
\beta = scale \cdot \sin{\theta} \\
$$

## 保管方法

| enum | description |
| :----- | :----- |
| INTER_NEAREST  | 最近傍補間 |
| INTER_LINEAR | バイリニア補間 |
| INTER_CUBIC | 4x4 の近傍領域を利用するバイキュービック補間 |
| INTER_AREA | ピクセル領域の関係を利用したリサンプリング |
| INTER_LANCZOS4  | 8x8 の近傍領域を利用する Lanczos法の補間 |
| INTER_LINEAR_EXACT | INTER_LINEAR + bit-exactness |
| INTER_NEAREST_EXACT | INTER_NEAREST + bit-exactness |
| INTER_MAX | 補間コードのマスク |
| WARP_FILL_OUTLIERS | フラグは、宛先イメージのすべてのピクセルを埋めます。それらの一部がソース画像の外れ値に対応する場合、それらはゼロに設定されます。 |
| WARP_INVERSE_MAP  | 逆変換 |

## INTER_NEAREST

## INTER_LINEAR

## INTER_CUBIC

## INTER_AREA

## INTER_LANCZOS4

## INTER_LINEAR_EXACT

## INTER_NEAREST_EXACT

## INTER_MAX

## WARP_FILL_OUTLIERS

## WARP_INVERSE_MAP
