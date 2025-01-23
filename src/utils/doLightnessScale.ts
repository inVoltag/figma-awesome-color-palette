import { doMap } from '@a_ng_d/figmug-utils'

import { Easing } from '../types/app'
import { ScaleConfiguration } from '../types/configurations'

const doLightnessScale = (
  stops: Array<number>,
  min: number,
  max: number,
  mode: Easing = 'LINEAR'
) => {
  let x = 1
  const scale: ScaleConfiguration = {}

  stops.map((index) => {
    scale[`lightness-${index}`] =
      mode !== 'NONE'
        ? parseFloat(doMap(applyEase(mode, x), 0, 1, min, max).toFixed(1))
        : index
    x -= 1 / (stops.length - 1)
    x < 0.01 ? (x = 0) : x
  })

  return scale
}

const applyEase = (mode: Easing, x: number): number => {
  const actions: { [key: string]: (x: number) => number } = {
    LINEAR: (x) => x,
    SLOW_EASE_IN: (x) => Math.pow(x, 1.2),
    SLOW_EASE_OUT: (x) => 1 - Math.pow(1 - x, 1.2),
    SLOW_EASE_IN_OUT: (x) =>
      x < 0.5 ? Math.pow(x * 2, 1.2) / 2 : 1 - Math.pow((1 - x) * 2, 1.2) / 2,
    EASE_IN: (x) => Math.pow(x, 1.5),
    EASE_OUT: (x) => 1 - Math.pow(1 - x, 1.5),
    EASE_IN_OUT: (x) =>
      x < 0.5 ? Math.pow(x * 2, 1.5) / 2 : 1 - Math.pow((1 - x) * 2, 1.5) / 2,
    FAST_EASE_IN: (x) => 1 - Math.cos((x * Math.PI) / 2),
    FAST_EASE_OUT: (x) => Math.sin((x * Math.PI) / 2),
    FAST_EASE_IN_OUT: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  }

  return actions[mode ?? 'LINEAR']?.(x)
}

export default doLightnessScale
