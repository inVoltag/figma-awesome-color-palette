import { ScaleConfiguration } from '../../types/configurations'
import { palette } from '../../utils/palettePackage'

const shiftRightStop = (
  scale: ScaleConfiguration,
  selectedKnob: HTMLElement,
  meta: boolean,
  ctrl: boolean,
  gap: number
) => {
  const stopsList: Array<string> = []

  Object.keys(scale).forEach((stop) => {
    stopsList.push(stop)
  })

  const selectedKnobIndex = stopsList.indexOf(
      selectedKnob.dataset.lightness as string
    ),
    newLightnessScale = scale,
    currentStopValue: number = newLightnessScale[stopsList[selectedKnobIndex]],
    nextStopValue: number =
      newLightnessScale[stopsList[selectedKnobIndex - 1]] - gap

  if (currentStopValue >= nextStopValue) null
  else if (currentStopValue >= 99 && (!meta || ctrl))
    newLightnessScale[stopsList[selectedKnobIndex]] = 100
  else if (currentStopValue === 100 && (meta || ctrl))
    newLightnessScale[stopsList[selectedKnobIndex]] = 100
  else
    meta || ctrl
      ? (newLightnessScale[stopsList[selectedKnobIndex]] = parseFloat(
          (newLightnessScale[stopsList[selectedKnobIndex]] + 0.1).toFixed(1)
        ))
      : newLightnessScale[stopsList[selectedKnobIndex]]++

  palette.scale = newLightnessScale
}

export default shiftRightStop
