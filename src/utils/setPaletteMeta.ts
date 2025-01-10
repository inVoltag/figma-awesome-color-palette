import {
  ColorConfiguration,
  ThemeConfiguration,
} from 'src/types/configurations'
import { lang, locals } from '../content/locals'

const getPaletteMeta = (
  colors: Array<ColorConfiguration>,
  themes: Array<ThemeConfiguration>
) => {
  const colorsNumber = colors.length,
    themesNumber = themes.filter(
      (theme) => theme.type === 'custom theme'
    ).length

  let colorLabel: string, themeLabel: string

  if (colorsNumber > 1)
    colorLabel = locals[lang].actions.sourceColorsNumber.several.replace(
      '$1',
      colorsNumber
    )
  else
    colorLabel = locals[lang].actions.sourceColorsNumber.single.replace(
      '$1',
      colorsNumber
    )

  if (themesNumber > 1)
    themeLabel = locals[lang].actions.colorThemesNumber.several.replace(
      '$1',
      themesNumber
    )
  else
    themeLabel = locals[lang].actions.colorThemesNumber.single.replace(
      '$1',
      themesNumber
    )

  return `${colorLabel}・${themeLabel}`
}

export default getPaletteMeta
