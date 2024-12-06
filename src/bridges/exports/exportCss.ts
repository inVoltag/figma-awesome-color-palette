import { Case } from '@a_ng_d/figmug-utils'
import { lang, locals } from '../../content/locals'
import { PaletteData, PaletteDataShadeItem } from '../../types/data'
import { ActionsList } from '../../types/models'

const exportCss = (palette: FrameNode, colorSpace: 'RGB' | 'LCH' | 'P3') => {
  const paletteData: PaletteData = JSON.parse(palette.getPluginData('data')),
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme'),
    css: Array<string> = []

  const setValueAccordingToColorSpace = (shade: PaletteDataShadeItem) => {
    const actions: ActionsList = {
      RGB: () =>
        `rgb(${Math.floor(shade.rgb[0])}, ${Math.floor(
          shade.rgb[1]
        )}, ${Math.floor(shade.rgb[2])})`,
      HEX: () => shade.hex,
      HSL: () =>
        `hsl(${Math.floor(shade.hsl[0])} ${Math.floor(
          shade.hsl[1]
        )}% ${Math.floor(shade.hsl[2])}%)`,
      LCH: () =>
        `lch(${Math.floor(shade.lch[0])}% ${Math.floor(
          shade.lch[1]
        )} ${Math.floor(shade.lch[2])})`,
      P3: () =>
        `color(display-p3 ${shade.gl[0].toFixed(3)} ${shade.gl[1].toFixed(
          3
        )} ${shade.gl[2].toFixed(3)})`,
    }

    return actions[colorSpace ?? 'RGB']?.()
  }

  if (palette.children.length === 1) {
    workingThemes.forEach((theme) => {
      const rowCss: Array<string> = []
      theme.colors.forEach((color) => {
        rowCss.push(`/* ${color.name} */`)
        color.shades.forEach((shade) => {
          rowCss.push(
            `--${new Case(color.name).doKebabCase()}-${shade.name}: ${setValueAccordingToColorSpace(shade)};`
          )
        })
        rowCss.push('')
      })
      rowCss.pop()
      css.push(
        `:root${
          theme.type === 'custom theme'
            ? `[data-theme='${new Case(theme.name).doKebabCase()}']`
            : ''
        } {\n  ${rowCss.join('\n  ')}\n}`
      )
    })

    figma.ui.postMessage({
      type: 'EXPORT_PALETTE_CSS',
      id: figma.currentUser?.id,
      context: 'CSS',
      colorSpace: colorSpace,
      data: css.join('\n\n'),
    })
  } else figma.notify(locals[lang].error.corruption)
}

export default exportCss
