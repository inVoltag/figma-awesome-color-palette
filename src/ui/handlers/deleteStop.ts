import { $palette } from '../../stores/palette'
import { ScaleConfiguration } from '../../types/configurations'

const deleteStop = (
  scale: ScaleConfiguration,
  selectedKnob: HTMLElement,
  presetName: string,
  presetMin: number,
  presetMax: number
) => {
  const newScale: Array<number> = [],
    newLightnessScale: { [key: string]: number } = {},
    factor = Math.min(
      ...Object.keys(scale).map((stop) => parseFloat(stop.split('-')[1]))
    ),
    palette = $palette

  Object.values(scale).forEach((scale) => {
    scale === parseFloat(selectedKnob.style.left) ? null : newScale.push(scale)
  })
  newScale.forEach(
    (scale, index) =>
      (newLightnessScale[`lightness-${(index + 1) * factor}`] = scale)
  )

  palette.setKey('scale', newLightnessScale)
  palette.setKey('preset', {
    name: presetName,
    scale: Object.keys(palette.get().scale).map((key) =>
      parseFloat(key.replace('lightness-', ''))
    ),
    min: presetMin,
    max: presetMax,
    isDistributed: false,
    id: 'CUSTOM',
  })
}

export default deleteStop
