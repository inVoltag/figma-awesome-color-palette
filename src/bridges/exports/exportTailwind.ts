import { Case } from '@a_ng_d/figmug-utils'
import { lang, locals } from '../../content/locals'
import { PaletteData } from '../../types/data'

const exportTailwind = (palette: FrameNode) => {
  const paletteData: PaletteData = JSON.parse(palette.getPluginData('data')),
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json: { [key: string]: any } = {
      theme: {
        colors: {},
      },
    }

  paletteData.themes[0].colors.forEach((color) => {
    json['theme']['colors'][new Case(color.name).doKebabCase()] = {}
  })

  if (palette.children.length === 1) {
    if (workingThemes[0].type === 'custom theme')
      workingThemes.forEach((theme) => {
        theme.colors.forEach((color) => {
          json['theme']['colors'][new Case(color.name).doKebabCase()][
            new Case(theme.name).doKebabCase()
          ] = {}
          color.shades.reverse().forEach((shade) => {
            json['theme']['colors'][new Case(color.name).doKebabCase()][
              new Case(theme.name).doKebabCase()
            ][new Case(shade.name).doKebabCase()] = shade.hex
          })
        })
      })
    else
      workingThemes.forEach((theme) => {
        theme.colors.forEach((color) => {
          json['theme']['colors'][new Case(color.name).doKebabCase()] = {}
          color.shades.sort().forEach((shade) => {
            json['theme']['colors'][new Case(color.name).doKebabCase()][
              new Case(shade.name).doKebabCase()
            ] = shade.hex
          })
        })
      })

    figma.ui.postMessage({
      type: 'EXPORT_PALETTE_TAILWIND',
      id: figma.currentUser?.id,
      context: 'TAILWIND',
      data: json,
    })
  } else figma.notify(locals[lang].error.corruption)
}

export default exportTailwind
