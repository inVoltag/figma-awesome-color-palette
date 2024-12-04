import { lang, locals } from '../../content/locals'
import {
  PaletteData,
  PaletteDataColorItem,
  PaletteDataShadeItem,
} from '../../types/data'

const exportJsonTokensStudio = (palette: FrameNode) => {
  const paletteData: PaletteData = JSON.parse(palette.getPluginData('data')),
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme'),
    name: string =
      palette.getPluginData('name') === ''
        ? locals[lang].name
        : palette.getPluginData('name'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json: { [key: string]: any } = {}

  const model = (color: PaletteDataColorItem, shade: PaletteDataShadeItem) => {
    return {
      value: shade.hex,
      description:
        color.description !== ''
          ? color.description + '・' + shade.description
          : shade.description,
      type: 'color',
    }
  }

  if (palette.children.length === 1) {
    if (workingThemes[0].type === 'custom theme')
      workingThemes.forEach((theme) => {
        json[name + ' - ' + theme.name] = {}
        theme.colors.forEach((color) => {
          json[name + ' - ' + theme.name][color.name] = {}
          color.shades.reverse().forEach((shade) => {
            json[name + ' - ' + theme.name][color.name][shade.name] = model(
              color,
              shade
            )
          })
          json[name + ' - ' + theme.name][color.name]['type'] = 'color'
        })
      })
    else
      workingThemes.forEach((theme) => {
        json[name] = {}
        theme.colors.forEach((color) => {
          json[name][color.name] = {}
          color.shades.sort().forEach((shade) => {
            json[name][color.name][shade.name] = model(color, shade)
          })
          json[name][color.name]['type'] = 'color'
        })
      })

    figma.ui.postMessage({
      type: 'EXPORT_PALETTE_JSON',
      id: figma.currentUser?.id,
      context: 'TOKENS_TOKENS_STUDIO',
      data: JSON.stringify(json, null, '  '),
    })
  } else figma.notify(locals[lang].error.corruption)
}

export default exportJsonTokensStudio
