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
  const shiftValue = meta || ctrl ? 0.1 : 1

  Object.keys(scale).forEach((stop) => {
    stopsList.push(stop)
  })

  const selectedKnobIndex = stopsList.indexOf(
      selectedKnob.dataset.lightness as string
    ),
    newLightnessScale = scale,
    currentStopValue: number = newLightnessScale[stopsList[selectedKnobIndex]],
    nextStopValue: number = newLightnessScale[stopsList[selectedKnobIndex - 1]]

  if (currentStopValue - gap + shiftValue >= nextStopValue) nextStopValue - gap
  else if (currentStopValue >= 99 && (!meta || ctrl))
    newLightnessScale[stopsList[selectedKnobIndex]] = 100
  else if (currentStopValue === 100 && (meta || ctrl))
    newLightnessScale[stopsList[selectedKnobIndex]] = 100
  else
    newLightnessScale[stopsList[selectedKnobIndex]] =
      newLightnessScale[stopsList[selectedKnobIndex]] + shiftValue

  palette.scale = newLightnessScale
}

export default shiftRightStop
