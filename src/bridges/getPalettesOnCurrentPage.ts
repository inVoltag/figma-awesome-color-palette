import { lang, locals } from '../content/locals'

const getPalettesOnCurrentPage = async () => {
  const palettes = (await figma.currentPage
    .loadAsync()
    .then(() =>
      figma.currentPage.findAllWithCriteria({
        pluginData: {},
      })
    )
    .catch(() => {
      figma.notify(locals[lang].error.palettesPicking)
      return []
    })) as Array<FrameNode>

  if (palettes.length !== 0) {
    const palettesList = async () => {
      const palettePromises = palettes.map(async (palette) => {
        const name = palette.getPluginData('name')
        const preset = palette.getPluginData('preset')
        const colors = palette.getPluginData('colors')
        const themes = palette.getPluginData('themes')

        if (preset === '' || colors === '' || themes === '') return null
        

        const bytes = await palette.exportAsync({
          format: 'PNG',
          constraint: { type: 'SCALE', value: 0.25 },
        })
        return {
          id: palette.id,
          name: name,
          preset: JSON.parse(preset).name,
          colors: JSON.parse(colors),
          themes: JSON.parse(themes),
          screenshot: bytes,
          devStatus: palette.devStatus !== null && palette.devStatus.type,
        }
      })
      const filteredPalettes = (await Promise.all(palettePromises)).filter(
        (palette) => palette !== null
      )
      return filteredPalettes
    }

    figma.ui.postMessage({
      type: 'EXPOSE_PALETTES',
      data: await palettesList().then((list) => {
        return list.sort((a, b) => {
          if (
            a.devStatus === 'READY_FOR_DEV' &&
            b.devStatus !== 'READY_FOR_DEV'
          )
            return -1
          else if (
            a.devStatus !== 'READY_FOR_DEV' &&
            b.devStatus === 'READY_FOR_DEV'
          )
            return 1
          else return 0
        })
      }),
    })
  } else
    figma.ui.postMessage({
      type: 'EXPOSE_PALETTES',
      data: [],
    })
}

export default getPalettesOnCurrentPage
