import LocalStyle from '../../canvas/LocalStyle'
import { lang, locals } from '../../content/locals'
import { PaletteData } from '../../types/data'

const createLocalStyles = async (palette: FrameNode) => {
  const paletteData: PaletteData = JSON.parse(palette.getPluginData('data')),
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme')

  if (palette.children.length === 1) {
    const createdLocalStylesStatusMessage = figma
      .getLocalPaintStylesAsync()
      .then((localStyles) => {
        let i = 0
        workingThemes.forEach((theme) => {
          theme.colors.forEach((color) => {
            color.shades.forEach((shade) => {
              if (
                localStyles.find(
                  (localStyle) => localStyle.id === shade.styleId
                ) === undefined
              ) {
                const style = new LocalStyle(
                  workingThemes[0].type === 'custom theme'
                    ? `${
                        paletteData.name === '' ? '' : paletteData.name + '/'
                      }${theme.name}/${color.name}/${shade.name}`
                    : `${paletteData.name === '' ? '' : paletteData.name}/${
                        color.name
                      }/${shade.name}`,
                  color.description !== ''
                    ? color.description + '・' + shade.description
                    : shade.description,
                  {
                    r: shade.gl[0],
                    g: shade.gl[1],
                    b: shade.gl[2],
                  }
                ).makePaintStyle()
                shade.styleId = style.id
                i++
              }
            })
          })
        })
        palette.setPluginData('data', JSON.stringify(paletteData))

        if (i > 1) return `${i} ${locals[lang].info.createdLocalStyles.plural}`
        else if (i === 1)
          return `${i} ${locals[lang].info.createdLocalStyle.single}`
        else return locals[lang].info.createdLocalStyles.none
      })
      .catch(() => locals[lang].error.generic)

    return await createdLocalStylesStatusMessage
  } else locals[lang].error.corruption
}

export default createLocalStyles
