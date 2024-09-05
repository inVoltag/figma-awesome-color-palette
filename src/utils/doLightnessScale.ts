import { doMap } from '@a-ng-d/figmug.modules.do-map'

import { Easing } from '../types/app'
import { ScaleConfiguration } from '../types/configurations'

const doLightnessScale = (
  stops: Array<number>,
  min: number,
  max: number,
  isDistributed = true,
  mode: Easing = 'LINEAR'
) => {
  let x = 1
  const scale: ScaleConfiguration = {}

  stops.map((index) => {
    scale[`lightness-${index}`] = isDistributed
      ? parseFloat(doMap(applyEase(mode, x), 0, 1, min, max).toFixed(1))
      : index
    x -= 1 / (stops.length - 1)
  })

  return scale
}

const applyEase = (mode: Easing, x: number): number => {
  const actions: { [key: string]: (x: number) => number } = {
    LINEAR: (x) => x,
    EASE_IN: (x) => 1 - Math.cos((x * Math.PI) / 2),
    EASE_OUT: (x) => Math.sin((x * Math.PI) / 2),
    EASE_IN_OUT: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  }

  return actions[mode ?? 'LINEAR']?.(x)
}

export default doLightnessScale
