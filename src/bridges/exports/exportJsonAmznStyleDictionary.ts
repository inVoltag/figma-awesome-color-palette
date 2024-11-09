import { lang, locals } from '../../content/locals'
import {
  PaletteData,
  PaletteDataColorItem,
  PaletteDataShadeItem,
} from '../../types/data'

const exportJsonAmznStyleDictionary = (palette: FrameNode) => {
  const paletteData: PaletteData = JSON.parse(palette.getPluginData('data')),
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme'),
    json: { [key: string]: any } = {
      color: {},
    }

  const model = (color: PaletteDataColorItem, shade: PaletteDataShadeItem) => {
    return {
      value: shade.hex,
      comment:
        color.description !== ''
          ? color.description + '・' + shade.description
          : shade.description,
    }
  }

  paletteData.themes[0].colors.forEach((color) => {
    json['color'][color.name] = {}
  })

  if (palette.children.length === 1) {
    if (workingThemes[0].type === 'custom theme')
      workingThemes.forEach((theme) => {
        theme.colors.forEach((color) => {
          json['color'][color.name][theme.name] = {}
          color.shades.reverse().forEach((shade) => {
            json['color'][color.name][theme.name][shade.name] = model(
              color,
              shade
            )
          })
        })
      })
    else
      workingThemes.forEach((theme) => {
        theme.colors.forEach((color) => {
          json['color'][color.name] = {}
          color.shades.sort().forEach((shade) => {
            json['color'][color.name][shade.name] = model(color, shade)
          })
        })
      })

    figma.ui.postMessage({
      type: 'EXPORT_PALETTE_JSON',
      id: figma.currentUser?.id,
      context: 'TOKENS_AMZN_STYLE_DICTIONARY',
      data: JSON.stringify(json, null, '  '),
    })
  } else figma.notify(locals[lang].error.corruption)
}

export default exportJsonAmznStyleDictionary
