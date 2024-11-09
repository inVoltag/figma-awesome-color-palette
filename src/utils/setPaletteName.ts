import { lang, locals } from '../content/locals'

const setPaletteName = (
  name: string,
  theme: string | undefined,
  preset: string,
  colorSpace: string,
  visionSimulationMode: string
): string => {
  const parameters: Array<string> = []

  name === '' ? parameters.push(locals[lang].name) : parameters.push(name)
  theme === 'None' || theme === undefined ? null : parameters.push(theme)
  parameters.push(preset)
  parameters.push(colorSpace)
  visionSimulationMode === 'NONE'
    ? null
    : parameters.push(
        locals[lang].settings.color.visionSimulationMode[
          visionSimulationMode.toLowerCase()
        ]
      )

  return parameters.join('・')
}

export default setPaletteName
