import chroma from 'chroma-js'

import { lang, locals } from '../../content/locals'
import { PaletteData, PaletteDataThemeItem } from '../../types/data'

const updateLocalStyles = async (palette: FrameNode) => {
  const paletteData: PaletteData = JSON.parse(palette.getPluginData('data')),
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme')
  const canDeepSyncStyles = await figma.clientStorage.getAsync(
    'can_deep_sync_styles'
  )

  if (palette.children.length === 1) {
    const updatedLocalStylesStatusMessage = figma
      .getLocalPaintStylesAsync()
      .then((localStyles) => {
        let i = 0,
          j = 0

        if (canDeepSyncStyles ?? false)
          localStyles.forEach((localStyle) => {
            const shadeMatch = workingThemes.find(
              (theme) =>
                theme.colors.find(
                  (color) =>
                    color.shades.find(
                      (shade) => shade.styleId === localStyle.id
                    ) !== undefined
                ) !== undefined
            )
            if (shadeMatch === undefined) {
              localStyle.remove()
              i++
            }
          })

        workingThemes.forEach((theme: PaletteDataThemeItem) => {
          theme.colors.forEach((color) => {
            color.shades.forEach((shade) => {
              const name =
                  workingThemes[0].type === 'custom theme'
                    ? `${paletteData.name === '' ? '' : paletteData.name + '/'}${
                        theme.name
                      }/${color.name}/${shade.name}`
                    : `${paletteData.name === '' ? '' : paletteData.name}/${
                        color.name
                      }/${shade.name}`,
                description =
                  color.description !== ''
                    ? color.description + '・' + shade.description
                    : shade.description

              if (
                localStyles.find(
                  (localStyle) => localStyle.id === shade.styleId
                ) !== undefined
              ) {
                const styleMatch = localStyles.find(
                  (localStyle) => localStyle.id === shade.styleId
                )

                if (styleMatch !== undefined) {
                  if (styleMatch.name !== name) {
                    styleMatch.name = name
                    j++
                  }

                  if (styleMatch.description !== description) {
                    styleMatch.description = description
                    j++
                  }

                  if (
                    shade.hex !==
                    chroma([
                      (styleMatch.paints[0] as SolidPaint).color.r * 255,
                      (styleMatch.paints[0] as SolidPaint).color.g * 255,
                      (styleMatch.paints[0] as SolidPaint).color.b * 255,
                    ]).hex()
                  ) {
                    styleMatch.paints = [
                      {
                        type: 'SOLID',
                        color: {
                          r: shade.gl[0],
                          g: shade.gl[1],
                          b: shade.gl[2],
                        },
                      },
                    ]
                    j++
                  }
                }

                j > 0 ? i++ : i
                j = 0
              } else if (
                localStyles.find((localStyle) => localStyle.name === name) !==
                undefined
              ) {
                const styleMatch = localStyles.find(
                  (localStyle) => localStyle.name === name
                )

                if (styleMatch !== undefined) {
                  if (styleMatch.name !== name) {
                    styleMatch.name = name
                    j++
                  }

                  if (styleMatch.description !== shade.description) {
                    styleMatch.description = shade.description
                    j++
                  }

                  if (
                    shade.hex !==
                    chroma([
                      (styleMatch.paints[0] as SolidPaint).color.r * 255,
                      (styleMatch.paints[0] as SolidPaint).color.g * 255,
                      (styleMatch.paints[0] as SolidPaint).color.b * 255,
                    ]).hex()
                  ) {
                    styleMatch.paints = [
                      {
                        type: 'SOLID',
                        color: {
                          r: shade.gl[0],
                          g: shade.gl[1],
                          b: shade.gl[2],
                        },
                      },
                    ]
                    j++
                  }
                }

                j > 0 ? i++ : i
                j = 0
              }
            })
          })
        })

        if (i > 1) return `${i} ${locals[lang].info.updatedLocalStyles}`
        else return `${i} ${locals[lang].info.updatedLocalStyle}`
      })
      .catch(() => locals[lang].error.generic)

    return await updatedLocalStylesStatusMessage
  } else return locals[lang].error.corruption
}

export default updateLocalStyles
