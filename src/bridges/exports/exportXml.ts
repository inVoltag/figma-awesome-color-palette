import { Case } from '@a_ng_d/figmug-utils'
import { lang, locals } from '../../content/locals'
import { PaletteData } from '../../types/data'

const exportXml = (palette: FrameNode) => {
  const paletteData: PaletteData = JSON.parse(palette.getPluginData('data')),
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme'),
    resources: Array<string> = []

  if (palette.children.length === 1) {
    workingThemes.forEach((theme) => {
      theme.colors.forEach((color) => {
        const colors: Array<string> = []
        colors.unshift(
          `<!--${
            workingThemes[0].type === 'custom theme' ? theme.name + ' - ' : ''
          }${color.name}-->`
        )
        color.shades.forEach((shade) => {
          colors.unshift(
            `<color name="${
              workingThemes[0].type === 'custom theme'
                ? new Case(theme.name + ' ' + color.name).doSnakeCase()
                : new Case(color.name).doSnakeCase()
            }_${shade.name}">${shade.hex}</color>`
          )
        })
        colors.unshift('')
        colors.reverse().forEach((color) => resources.push(color))
      })
    })

    resources.pop()

    figma.ui.postMessage({
      type: 'EXPORT_PALETTE_XML',
      id: figma.currentUser?.id,
      context: 'ANDROID_XML',
      data: `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n  ${resources.join(
        '\n  '
      )}\n</resources>`,
    })
  } else figma.notify(locals[lang].error.corruption)
}

export default exportXml
