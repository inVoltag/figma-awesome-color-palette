import { doMap } from '@a-ng-d/figmug.modules.do-map'

import { ScaleConfiguration } from '../../types/configurations'
import { palette } from '../../utils/palettePackage'

const addStop = (
  e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  scale: ScaleConfiguration,
  presetName: string,
  presetMin: number,
  presetMax: number
) => {
  const rangeWidth: number = (e.currentTarget as HTMLElement).offsetWidth,
    sliderPadding: number = parseFloat(
      window
        .getComputedStyle(
          (e.currentTarget as HTMLElement).parentNode as Element,
          null
        )
        .getPropertyValue('padding-left')
    ),
    offset: number = doMap(e.clientX - sliderPadding, 0, rangeWidth, 0, 100),
    newLightnessScale: { [key: string]: number } = {},
    factor = Math.min(
      ...Object.keys(scale).map((stop) => parseFloat(stop.split('-')[1]))
    )

  let newScale: Array<number> = []

  newScale = Object.values(scale)
  newScale.length < 25 && newScale.push(parseFloat(offset.toFixed(1)))
  newScale.sort((a, b) => b - a)
  newScale.forEach(
    (scale, index) =>
      (newLightnessScale[`lightness-${(index + 1) * factor}`] = scale)
  )

  palette.scale = newLightnessScale
  palette.preset = {
    name: presetName,
    scale: newScale.map((scale, index) => (index + 1) * factor),
    min: presetMin,
    max: presetMax,
    isDistributed: false,
    id: 'CUSTOM',
  }
}

export default addStop
