import { Case } from '@a_ng_d/figmug-utils'
import { lang, locals } from '../../content/locals'
import { PaletteData } from '../../types/data'

const exportUIKit = (palette: FrameNode) => {
  const paletteData: PaletteData = JSON.parse(palette.getPluginData('data')),
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme'),
    swift: Array<string> = []

  if (palette.children.length === 1) {
    workingThemes.forEach((theme) => {
      const UIColors: Array<string> = []
      theme.colors.forEach((color) => {
        UIColors.unshift(`// ${color.name}`)
        color.shades.forEach((shade) => {
          UIColors.unshift(
            `static let ${new Case(color.name).doCamelCase()}${
              shade.name === 'source' ? 'Source' : shade.name
            } = UIColor(red: ${shade.gl[0].toFixed(
              3
            )}, green: ${shade.gl[1].toFixed(3)}, blue: ${shade.gl[2].toFixed(
              3
            )})`
          )
        })
        UIColors.unshift('')
      })
      UIColors.shift()
      if (workingThemes[0].type === 'custom theme') {
        swift.push(
          `struct ${new Case(theme.name).doPascalCase()} {\n    ${UIColors.reverse().join(
            '\n    '
          )}\n  }`
        )
      } else {
        swift.push(`${UIColors.reverse().join('\n  ')}`)
      }
    })

    figma.ui.postMessage({
      type: 'EXPORT_PALETTE_UIKIT',
      id: figma.currentUser?.id,
      context: 'APPLE_UIKIT',
      data: `import UIKit\n\nstruct Color {\n  ${swift.join('\n\n  ')}\n}`,
    })
  } else figma.notify(locals[lang].error.corruption)
}

export default exportUIKit
