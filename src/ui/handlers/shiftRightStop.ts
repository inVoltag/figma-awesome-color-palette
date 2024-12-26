import { $palette } from '../../stores/palette'
import { ScaleConfiguration } from '../../types/configurations'

const shiftRightStop = (
  scale: ScaleConfiguration,
  selectedKnob: HTMLElement,
  meta: boolean,
  ctrl: boolean,
  gap: number
) => {
  const stopsList: Array<string> = []
  const shiftValue = meta || ctrl ? 0.1 : 1
  const palette = $palette

  Object.keys(scale).forEach((stop) => {
    stopsList.push(stop)
  })

  const selectedKnobIndex = stopsList.indexOf(
      selectedKnob.dataset.id as string
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

  palette.setKey('scale', newLightnessScale)
}

export default shiftRightStop
