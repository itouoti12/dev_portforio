import * as THREE from 'three';

/* NOTE: 
        sinはある角度の対辺の斜辺に対する「比率」を表す 対辺/斜辺
        cosはある角度の隣辺の斜辺に対する「比率」を表す 隣辺/斜辺

                /|
               / |
              /  |
             /   |
      斜辺   /    |
           /     |  対辺
          /      |
         /       |
        /        |
    x度  ---------|
           隣辺
    */

/*
方角
北・・・0
西・・・-90
東・・・90
南・・・-180/180

モデル
前・・・0
後・・・3.14
左・・・1.57
右・・・-1.57

sin/cosにおける基準
x軸の正方向・・・0度

*/

export function model(distance: number, direction: number) {
  const OFFSET = Math.PI / 2; //モデルの移動方向角度はy軸の正方向が基準になっているので90度の補正を入れてx軸の正方向を基準にする;

  // まず移動先座標を求める
  const x = distance * Math.cos(OFFSET + direction);
  const y = distance * Math.sin(OFFSET + direction);
  return [Math.round(x * 1000) / 1000 + 0, Math.round(y * 1000) / 1000 + 0];
}

/*
    modelの方向、向いている方角から、移動先をもとめる
    mapbox上のbearingは西(左)がマイナスを取るのに対し、
    sin/cosの計算上は x軸の正方向を基準として下(右)がマイナスを取る
    よって、bearingの補正が必要
*/
export function moveing(distance: number, direction: number, viewAngle: number) {
  // 角度を正規化
  const normalizeAngle = THREE.MathUtils.euclideanModulo(-viewAngle, 360);
  // ラジアン単位に変更
  const bearingRadiansAngle = THREE.MathUtils.degToRad(normalizeAngle);

  // まず移動先座標を求める
  const point = model(distance, direction);

  // viewの角度を考慮して、移動先座標を回転する
  const xDelta = point[0] * Math.cos(bearingRadiansAngle) - point[1] * Math.sin(bearingRadiansAngle);
  const yDelta = point[0] * Math.sin(bearingRadiansAngle) + point[1] * Math.cos(bearingRadiansAngle);

  console.log([Math.round(xDelta * 1000) / 1000 + 0, Math.round(yDelta * 1000) / 1000 + 0]);
  return [Math.round(xDelta * 1000) / 1000 + 0, Math.round(yDelta * 1000) / 1000 + 0];
}

/*
モデルの方向にbearignを加味
model -3.14 ~ 0 ~ 3.14
bearing -180 ~ 0  ~ 180
*/
export function calcDirection(modelDirection: number, bearing: number) {
  const bearingRadiansAngle = THREE.MathUtils.degToRad(-bearing);

  const rad = bearingRadiansAngle + modelDirection;

  if (Math.abs(rad) === Math.PI) {
    return Math.abs(rad);
  }
  if (rad >= -Math.PI && rad <= Math.PI) {
    return rad;
  } else {
    return rad > Math.PI ? rad - 2 * Math.PI : rad + 2 * Math.PI;
  }
}
