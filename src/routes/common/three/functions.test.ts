import { it, expect, describe } from 'vitest';
import { calcDirection, model, moveing } from './function';

/**
 * 原点[0,0]に対して移動量と北向きを基準とした角度から、角度に合わせた回転後の移動量を求める
 * 0: 北
 * 90: 西
 * 180/-180: 南
 * -90: 東
 *
 * x軸がプラス方向:
 */
const MODEL_DIRECTION = {
  前: 0,
  左: Math.PI / 2,
  右: -Math.PI / 2,
  後: Math.PI,
  左前: Math.PI / 4,
  右前: -Math.PI / 4,
  左後: Math.PI / 4 + Math.PI / 2,
  右後: -Math.PI / 4 - Math.PI / 2
};
const VIEW_ANGLE = {
  東: 90,
  西: -90,
  南: 180,
  南2: -180,
  北: 0,
  北西: -45,
  南西: -135,
  北東: 45,
  南東: 135
};

it('should first', () => {
  // GIVEN
  let actual: number[];

  // WHEN
  actual = model(0, MODEL_DIRECTION.前);
  // THEN
  expect(actual).toEqual([0, 0]);
  // WHEN
  actual = model(1, MODEL_DIRECTION.前);
  // THEN
  expect(actual).toEqual([0, 1]);
  // WHEN
  actual = model(1, MODEL_DIRECTION.右前);
  // THEN
  expect(actual).toEqual([0.707, 0.707]);
  // WHEN
  actual = model(1, MODEL_DIRECTION.右);
  // THEN
  expect(actual).toEqual([1, 0]);
  // WHEN
  actual = model(1, MODEL_DIRECTION.右後);
  // THEN
  expect(actual).toEqual([0.707, -0.707]);
  // WHEN
  actual = model(1, MODEL_DIRECTION.左前);
  // THEN
  expect(actual).toEqual([-0.707, 0.707]);
  // WHEN
  actual = model(1, MODEL_DIRECTION.左);
  // THEN
  expect(actual).toEqual([-1, 0]);
  // WHEN
  actual = model(1, MODEL_DIRECTION.左後);
  // THEN
  expect(actual).toEqual([-0.707, -0.707]);
  // WHEN
  actual = model(1, MODEL_DIRECTION.後);
  // THEN
  expect(actual).toEqual([0, -1]);
});

describe('Name of the group', () => {
  it.each`
    testCase                              | distance | direction               | viewAngle        | expected
    ${'北向きで前に進む -> 北に進む'}     | ${1}     | ${MODEL_DIRECTION.前}   | ${VIEW_ANGLE.北} | ${[0, 1]}
    ${'北向きで左に進む -> 西に進む'}     | ${1}     | ${MODEL_DIRECTION.左}   | ${VIEW_ANGLE.北} | ${[-1, 0]}
    ${'北向きで右に進む -> 東に進む'}     | ${1}     | ${MODEL_DIRECTION.右}   | ${VIEW_ANGLE.北} | ${[1, 0]}
    ${'北向きで後に進む -> 南に進む'}     | ${1}     | ${MODEL_DIRECTION.後}   | ${VIEW_ANGLE.北} | ${[0, -1]}
    ${'北向きで左前に進む -> 北西に進む'} | ${1}     | ${MODEL_DIRECTION.左前} | ${VIEW_ANGLE.北} | ${[-0.707, 0.707]}
    ${'北向きで右前に進む -> 北東に進む'} | ${1}     | ${MODEL_DIRECTION.右前} | ${VIEW_ANGLE.北} | ${[0.707, 0.707]}
    ${'北向きで左後に進む -> 南西に進む'} | ${1}     | ${MODEL_DIRECTION.左後} | ${VIEW_ANGLE.北} | ${[-0.707, -0.707]}
    ${'北向きで右後に進む -> 南東に進む'} | ${1}     | ${MODEL_DIRECTION.右後} | ${VIEW_ANGLE.北} | ${[0.707, -0.707]}
  `('$testCase', ({ distance, direction, viewAngle, expected }) => {
    // WHEN
    const actual = moveing(distance, direction, viewAngle);
    // THEN
    expect(actual).toEqual(expected);
  });
  it.each`
    testCase                                    | distance | direction               | viewAngle         | expected
    ${'南向きで前に進む -> 南に進む'}           | ${1}     | ${MODEL_DIRECTION.前}   | ${VIEW_ANGLE.南}  | ${[0, -1]}
    ${'南向き(-180)で前に進む -> 南に進む'}     | ${1}     | ${MODEL_DIRECTION.前}   | ${VIEW_ANGLE.南2} | ${[0, -1]}
    ${'南向きで左に進む -> 東に進む'}           | ${1}     | ${MODEL_DIRECTION.左}   | ${VIEW_ANGLE.南}  | ${[1, 0]}
    ${'南向きで右に進む -> 西に進む'}           | ${1}     | ${MODEL_DIRECTION.右}   | ${VIEW_ANGLE.南}  | ${[-1, 0]}
    ${'南向きで後に進む -> 北に進む'}           | ${1}     | ${MODEL_DIRECTION.後}   | ${VIEW_ANGLE.南}  | ${[0, 1]}
    ${'南向き(-180)で左に進む -> 東に進む'}     | ${1}     | ${MODEL_DIRECTION.左}   | ${VIEW_ANGLE.南2} | ${[1, 0]}
    ${'南向き(-180)で右に進む -> 西に進む'}     | ${1}     | ${MODEL_DIRECTION.右}   | ${VIEW_ANGLE.南2} | ${[-1, 0]}
    ${'南向き(-180)で後に進む -> 北に進む'}     | ${1}     | ${MODEL_DIRECTION.後}   | ${VIEW_ANGLE.南2} | ${[0, 1]}
    ${'南向きで左前に進む -> 南東に進む'}       | ${1}     | ${MODEL_DIRECTION.左前} | ${VIEW_ANGLE.南}  | ${[0.707, -0.707]}
    ${'南向きで右前に進む -> 南西に進む'}       | ${1}     | ${MODEL_DIRECTION.右前} | ${VIEW_ANGLE.南}  | ${[-0.707, -0.707]}
    ${'南向きで左後に進む -> 北東に進む'}       | ${1}     | ${MODEL_DIRECTION.左後} | ${VIEW_ANGLE.南}  | ${[0.707, 0.707]}
    ${'南向きで右後に進む -> 北西に進む'}       | ${1}     | ${MODEL_DIRECTION.右後} | ${VIEW_ANGLE.南}  | ${[-0.707, 0.707]}
    ${'南向き(-180)で左前に進む -> 南東に進む'} | ${1}     | ${MODEL_DIRECTION.左前} | ${VIEW_ANGLE.南2} | ${[0.707, -0.707]}
    ${'南向き(-180)で右前に進む -> 南西に進む'} | ${1}     | ${MODEL_DIRECTION.右前} | ${VIEW_ANGLE.南2} | ${[-0.707, -0.707]}
    ${'南向き(-180)で左後に進む -> 北東に進む'} | ${1}     | ${MODEL_DIRECTION.左後} | ${VIEW_ANGLE.南2} | ${[0.707, 0.707]}
    ${'南向き(-180)で右後に進む -> 北西に進む'} | ${1}     | ${MODEL_DIRECTION.右後} | ${VIEW_ANGLE.南2} | ${[-0.707, 0.707]}
  `('$testCase', ({ distance, direction, viewAngle, expected }) => {
    // WHEN
    const actual = moveing(distance, direction, viewAngle);
    // THEN
    expect(actual).toEqual(expected);
  });

  it.each`
    testCase                              | distance | direction               | viewAngle        | expected
    ${'西向きで前に進む -> 西に進む'}     | ${1}     | ${MODEL_DIRECTION.前}   | ${VIEW_ANGLE.西} | ${[-1, 0]}
    ${'西向きで左に進む -> 南に進む'}     | ${1}     | ${MODEL_DIRECTION.左}   | ${VIEW_ANGLE.西} | ${[0, -1]}
    ${'西向きで右に進む -> 北に進む'}     | ${1}     | ${MODEL_DIRECTION.右}   | ${VIEW_ANGLE.西} | ${[0, 1]}
    ${'西向きで後に進む -> 東に進む'}     | ${1}     | ${MODEL_DIRECTION.後}   | ${VIEW_ANGLE.西} | ${[1, 0]}
    ${'西向きで左前に進む -> 南西に進む'} | ${1}     | ${MODEL_DIRECTION.左前} | ${VIEW_ANGLE.西} | ${[-0.707, -0.707]}
    ${'西向きで右前に進む -> 北西に進む'} | ${1}     | ${MODEL_DIRECTION.右前} | ${VIEW_ANGLE.西} | ${[-0.707, 0.707]}
    ${'西向きで左後に進む -> 南東に進む'} | ${1}     | ${MODEL_DIRECTION.左後} | ${VIEW_ANGLE.西} | ${[0.707, -0.707]}
    ${'西向きで右後に進む -> 北東に進む'} | ${1}     | ${MODEL_DIRECTION.右後} | ${VIEW_ANGLE.西} | ${[0.707, 0.707]}
  `('$testCase', ({ distance, direction, viewAngle, expected }) => {
    // WHEN
    const actual = moveing(distance, direction, viewAngle);
    // THEN
    expect(actual).toEqual(expected);
  });
  it.each`
    testCase                              | distance | direction               | viewAngle        | expected
    ${'東向きで前に進む -> 東に進む'}     | ${1}     | ${MODEL_DIRECTION.前}   | ${VIEW_ANGLE.東} | ${[1, 0]}
    ${'東向きで左に進む -> 北に進む'}     | ${1}     | ${MODEL_DIRECTION.左}   | ${VIEW_ANGLE.東} | ${[0, 1]}
    ${'東向きで右に進む -> 南に進む'}     | ${1}     | ${MODEL_DIRECTION.右}   | ${VIEW_ANGLE.東} | ${[0, -1]}
    ${'東向きで後に進む -> 西に進む'}     | ${1}     | ${MODEL_DIRECTION.後}   | ${VIEW_ANGLE.東} | ${[-1, 0]}
    ${'東向きで左前に進む -> 北東に進む'} | ${1}     | ${MODEL_DIRECTION.左前} | ${VIEW_ANGLE.東} | ${[0.707, 0.707]}
    ${'東向きで右前に進む -> 南東に進む'} | ${1}     | ${MODEL_DIRECTION.右前} | ${VIEW_ANGLE.東} | ${[0.707, -0.707]}
    ${'東向きで左後に進む -> 北西に進む'} | ${1}     | ${MODEL_DIRECTION.左後} | ${VIEW_ANGLE.東} | ${[-0.707, 0.707]}
    ${'東向きで右後に進む -> 南西に進む'} | ${1}     | ${MODEL_DIRECTION.右後} | ${VIEW_ANGLE.東} | ${[-0.707, -0.707]}
  `('$testCase', ({ distance, direction, viewAngle, expected }) => {
    // WHEN
    const actual = moveing(distance, direction, viewAngle);
    // THEN
    expect(actual).toEqual(expected);
  });

  it.each`
    testCase                              | distance | direction               | viewAngle          | expected
    ${'北西向きで前に進む -> 北西に進む'} | ${1}     | ${MODEL_DIRECTION.前}   | ${VIEW_ANGLE.北西} | ${[-0.707, 0.707]}
    ${'北西向きで左に進む -> 南西に進む'} | ${1}     | ${MODEL_DIRECTION.左}   | ${VIEW_ANGLE.北西} | ${[-0.707, -0.707]}
    ${'北西向きで右に進む -> 北東に進む'} | ${1}     | ${MODEL_DIRECTION.右}   | ${VIEW_ANGLE.北西} | ${[0.707, 0.707]}
    ${'北西向きで後に進む -> 南東に進む'} | ${1}     | ${MODEL_DIRECTION.後}   | ${VIEW_ANGLE.北西} | ${[0.707, -0.707]}
    ${'北西向きで左前に進む -> 西に進む'} | ${1}     | ${MODEL_DIRECTION.左前} | ${VIEW_ANGLE.北西} | ${[-1, 0]}
    ${'北西向きで右前に進む -> 北に進む'} | ${1}     | ${MODEL_DIRECTION.右前} | ${VIEW_ANGLE.北西} | ${[0, 1]}
    ${'北西向きで左後に進む -> 南に進む'} | ${1}     | ${MODEL_DIRECTION.左後} | ${VIEW_ANGLE.北西} | ${[0, -1]}
    ${'北西向きで右後に進む -> 東に進む'} | ${1}     | ${MODEL_DIRECTION.右後} | ${VIEW_ANGLE.北西} | ${[1, 0]}
  `('$testCase', ({ distance, direction, viewAngle, expected }) => {
    // WHEN
    const actual = moveing(distance, direction, viewAngle);
    // THEN
    expect(actual).toEqual(expected);
  });

  it.each`
    testCase                              | distance | direction               | viewAngle          | expected
    ${'北東向きで前に進む -> 北東に進む'} | ${1}     | ${MODEL_DIRECTION.前}   | ${VIEW_ANGLE.北東} | ${[0.707, 0.707]}
    ${'北東向きで左に進む -> 北西に進む'} | ${1}     | ${MODEL_DIRECTION.左}   | ${VIEW_ANGLE.北東} | ${[-0.707, 0.707]}
    ${'北東向きで右に進む -> 南東に進む'} | ${1}     | ${MODEL_DIRECTION.右}   | ${VIEW_ANGLE.北東} | ${[0.707, -0.707]}
    ${'北東向きで後に進む -> 南西に進む'} | ${1}     | ${MODEL_DIRECTION.後}   | ${VIEW_ANGLE.北東} | ${[-0.707, -0.707]}
    ${'北東向きで左前に進む -> 北に進む'} | ${1}     | ${MODEL_DIRECTION.左前} | ${VIEW_ANGLE.北東} | ${[0, 1]}
    ${'北東向きで右前に進む -> 東に進む'} | ${1}     | ${MODEL_DIRECTION.右前} | ${VIEW_ANGLE.北東} | ${[1, 0]}
    ${'北東向きで左後に進む -> 西に進む'} | ${1}     | ${MODEL_DIRECTION.左後} | ${VIEW_ANGLE.北東} | ${[-1, 0]}
    ${'北東向きで右後に進む -> 南に進む'} | ${1}     | ${MODEL_DIRECTION.右後} | ${VIEW_ANGLE.北東} | ${[0, -1]}
  `('$testCase', ({ distance, direction, viewAngle, expected }) => {
    // WHEN
    const actual = moveing(distance, direction, viewAngle);
    // THEN
    expect(actual).toEqual(expected);
  });

  it.each`
    testCase                              | distance | direction               | viewAngle          | expected
    ${'南西向きで前に進む -> 南西に進む'} | ${1}     | ${MODEL_DIRECTION.前}   | ${VIEW_ANGLE.南西} | ${[-0.707, -0.707]}
    ${'南西向きで左に進む -> 南東に進む'} | ${1}     | ${MODEL_DIRECTION.左}   | ${VIEW_ANGLE.南西} | ${[0.707, -0.707]}
    ${'南西向きで右に進む -> 北西に進む'} | ${1}     | ${MODEL_DIRECTION.右}   | ${VIEW_ANGLE.南西} | ${[-0.707, 0.707]}
    ${'南西向きで後に進む -> 北東に進む'} | ${1}     | ${MODEL_DIRECTION.後}   | ${VIEW_ANGLE.南西} | ${[0.707, 0.707]}
    ${'南西向きで左前に進む -> 南に進む'} | ${1}     | ${MODEL_DIRECTION.左前} | ${VIEW_ANGLE.南西} | ${[0, -1]}
    ${'南西向きで右前に進む -> 西に進む'} | ${1}     | ${MODEL_DIRECTION.右前} | ${VIEW_ANGLE.南西} | ${[-1, 0]}
    ${'南西向きで左後に進む -> 東に進む'} | ${1}     | ${MODEL_DIRECTION.左後} | ${VIEW_ANGLE.南西} | ${[1, 0]}
    ${'南西向きで右後に進む -> 北に進む'} | ${1}     | ${MODEL_DIRECTION.右後} | ${VIEW_ANGLE.南西} | ${[0, 1]}
  `('$testCase', ({ distance, direction, viewAngle, expected }) => {
    // WHEN
    const actual = moveing(distance, direction, viewAngle);
    // THEN
    expect(actual).toEqual(expected);
  });

  it.each`
    testCase                              | distance | direction               | viewAngle          | expected
    ${'南東向きで前に進む -> 南東に進む'} | ${1}     | ${MODEL_DIRECTION.前}   | ${VIEW_ANGLE.南東} | ${[0.707, -0.707]}
    ${'南東向きで左に進む -> 北東に進む'} | ${1}     | ${MODEL_DIRECTION.左}   | ${VIEW_ANGLE.南東} | ${[0.707, 0.707]}
    ${'南東向きで右に進む -> 南西に進む'} | ${1}     | ${MODEL_DIRECTION.右}   | ${VIEW_ANGLE.南東} | ${[-0.707, -0.707]}
    ${'南東向きで後に進む -> 北西に進む'} | ${1}     | ${MODEL_DIRECTION.後}   | ${VIEW_ANGLE.南東} | ${[-0.707, 0.707]}
    ${'南東向きで左前に進む -> 東に進む'} | ${1}     | ${MODEL_DIRECTION.左前} | ${VIEW_ANGLE.南東} | ${[1, 0]}
    ${'南東向きで右前に進む -> 南に進む'} | ${1}     | ${MODEL_DIRECTION.右前} | ${VIEW_ANGLE.南東} | ${[0, -1]}
    ${'南東向きで左後に進む -> 北に進む'} | ${1}     | ${MODEL_DIRECTION.左後} | ${VIEW_ANGLE.南東} | ${[0, 1]}
    ${'南東向きで右後に進む -> 西に進む'} | ${1}     | ${MODEL_DIRECTION.右後} | ${VIEW_ANGLE.南東} | ${[-1, 0]}
  `('$testCase', ({ distance, direction, viewAngle, expected }) => {
    // WHEN
    const actual = moveing(distance, direction, viewAngle);
    // THEN
    expect(actual).toEqual(expected);
  });
});

describe.only('modelDirection + bearing', () => {
  it.each`
    testCase                                            | direction             | viewAngle          | expected
    ${'modelが前を向く 視点が北 ->modelが前を向く'}     | ${MODEL_DIRECTION.前} | ${VIEW_ANGLE.北}   | ${MODEL_DIRECTION.前}
    ${'modelが左を向く 視点が北 ->modelが左を向く'}     | ${MODEL_DIRECTION.左} | ${VIEW_ANGLE.北}   | ${MODEL_DIRECTION.左}
    ${'modelが右を向く 視点が北 ->modelが右を向く'}     | ${MODEL_DIRECTION.右} | ${VIEW_ANGLE.北}   | ${MODEL_DIRECTION.右}
    ${'modelが後を向く 視点が北 ->modelが後を向く'}     | ${MODEL_DIRECTION.後} | ${VIEW_ANGLE.北}   | ${MODEL_DIRECTION.後}

    ${'modelが前を向く 視点が西 ->modelが左を向く'}     | ${MODEL_DIRECTION.前} | ${VIEW_ANGLE.西}   | ${MODEL_DIRECTION.左}
    ${'modelが左を向く 視点が西 ->modelが後を向く'}     | ${MODEL_DIRECTION.左} | ${VIEW_ANGLE.西}   | ${MODEL_DIRECTION.後}
    ${'modelが右を向く 視点が西 ->modelが前を向く'}     | ${MODEL_DIRECTION.右} | ${VIEW_ANGLE.西}   | ${MODEL_DIRECTION.前}
    ${'modelが後を向く 視点が西 ->modelが右を向く'}     | ${MODEL_DIRECTION.後} | ${VIEW_ANGLE.西}   | ${MODEL_DIRECTION.右}

    ${'modelが前を向く 視点が東 ->modelが右を向く'}     | ${MODEL_DIRECTION.前} | ${VIEW_ANGLE.東}   | ${MODEL_DIRECTION.右}
    ${'modelが左を向く 視点が東 ->modelが前を向く'}     | ${MODEL_DIRECTION.左} | ${VIEW_ANGLE.東}   | ${MODEL_DIRECTION.前}
    ${'modelが右を向く 視点が東 ->modelが後を向く'}     | ${MODEL_DIRECTION.右} | ${VIEW_ANGLE.東}   | ${MODEL_DIRECTION.後}
    ${'modelが後を向く 視点が東 ->modelが左を向く'}     | ${MODEL_DIRECTION.後} | ${VIEW_ANGLE.東}   | ${MODEL_DIRECTION.左}

    ${'modelが前を向く 視点が南 ->modelが後を向く'}     | ${MODEL_DIRECTION.前} | ${VIEW_ANGLE.南}   | ${MODEL_DIRECTION.後}
    ${'modelが左を向く 視点が南 ->modelが右を向く'}     | ${MODEL_DIRECTION.左} | ${VIEW_ANGLE.南}   | ${MODEL_DIRECTION.右}
    ${'modelが右を向く 視点が南 ->modelが左を向く'}     | ${MODEL_DIRECTION.右} | ${VIEW_ANGLE.南}   | ${MODEL_DIRECTION.左}
    ${'modelが後を向く 視点が南 ->modelが前を向く'}     | ${MODEL_DIRECTION.後} | ${VIEW_ANGLE.南}   | ${MODEL_DIRECTION.前}
    
    ${'modelが前を向く 視点が北西 ->modelが左前を向く'} | ${MODEL_DIRECTION.前} | ${VIEW_ANGLE.北西} | ${MODEL_DIRECTION.左前}
    ${'modelが左を向く 視点が北西 ->modelが左後を向く'} | ${MODEL_DIRECTION.左} | ${VIEW_ANGLE.北西} | ${MODEL_DIRECTION.左後}
    ${'modelが右を向く 視点が北西 ->modelが右前を向く'} | ${MODEL_DIRECTION.右} | ${VIEW_ANGLE.北西} | ${MODEL_DIRECTION.右前}
    ${'modelが後を向く 視点が北西 ->modelが右後を向く'} | ${MODEL_DIRECTION.後} | ${VIEW_ANGLE.北西} | ${MODEL_DIRECTION.右後}
    
    ${'modelが前を向く 視点が北東 ->modelが右前を向く'} | ${MODEL_DIRECTION.前} | ${VIEW_ANGLE.北東} | ${MODEL_DIRECTION.右前}
    ${'modelが左を向く 視点が北東 ->modelが左前を向く'} | ${MODEL_DIRECTION.左} | ${VIEW_ANGLE.北東} | ${MODEL_DIRECTION.左前}
    ${'modelが右を向く 視点が北東 ->modelが右後を向く'} | ${MODEL_DIRECTION.右} | ${VIEW_ANGLE.北東} | ${MODEL_DIRECTION.右後}
    ${'modelが後を向く 視点が北東 ->modelが左後を向く'} | ${MODEL_DIRECTION.後} | ${VIEW_ANGLE.北東} | ${MODEL_DIRECTION.左後}

    ${'modelが前を向く 視点が南西 ->modelが左後を向く'} | ${MODEL_DIRECTION.前} | ${VIEW_ANGLE.南西} | ${MODEL_DIRECTION.左後}
    ${'modelが左を向く 視点が南西 ->modelが右後を向く'} | ${MODEL_DIRECTION.左} | ${VIEW_ANGLE.南西} | ${MODEL_DIRECTION.右後}
    ${'modelが右を向く 視点が南西 ->modelが左前を向く'} | ${MODEL_DIRECTION.右} | ${VIEW_ANGLE.南西} | ${MODEL_DIRECTION.左前}
    ${'modelが後を向く 視点が南西 ->modelが右前を向く'} | ${MODEL_DIRECTION.後} | ${VIEW_ANGLE.南西} | ${MODEL_DIRECTION.右前}

    ${'modelが前を向く 視点が南東 ->modelが右後を向く'} | ${MODEL_DIRECTION.前} | ${VIEW_ANGLE.南東} | ${MODEL_DIRECTION.右後}
    ${'modelが左を向く 視点が南東 ->modelが右前を向く'} | ${MODEL_DIRECTION.左} | ${VIEW_ANGLE.南東} | ${MODEL_DIRECTION.右前}
    ${'modelが右を向く 視点が南東 ->modelが左後を向く'} | ${MODEL_DIRECTION.右} | ${VIEW_ANGLE.南東} | ${MODEL_DIRECTION.左後}
    ${'modelが後を向く 視点が南東 ->modelが左前を向く'} | ${MODEL_DIRECTION.後} | ${VIEW_ANGLE.南東} | ${MODEL_DIRECTION.左前}
  `('$testCase', ({ direction, viewAngle, expected }) => {
    const actual = calcDirection(direction, viewAngle);
    expect(actual).toEqual(expected);
  });
});
