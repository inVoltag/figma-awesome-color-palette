import chroma from 'chroma-js'

import { lang, locals } from '../../content/locals'
import { PaletteData } from '../../types/data'

const updateLocalVariables = async (palette: FrameNode) => {
  const paletteData: PaletteData = JSON.parse(palette.getPluginData('data'))
  const canDeepSyncVariables = await figma.clientStorage.getAsync(
    'can_deep_sync_variables'
  )

  if (palette.children.length === 1) {
    const name =
      palette.getPluginData('name') === ''
        ? 'UI Color Palette'
        : palette.getPluginData('name')

    const collection = await figma.variables
      .getLocalVariableCollectionsAsync()
      .then((collections) =>
        collections.find(
          (collection) => collection.id === paletteData.collectionId
        )
      )

    if (collection !== undefined) {
      const updateLocalVariablesStatusMessage = figma.variables
        .getLocalVariablesAsync()
        .then((allLocalVariables) =>
          allLocalVariables.filter(
            (localVariable) =>
              localVariable.variableCollectionId === collection?.id
          )
        )
        .then((localVariables) => {
          let i = 0,
            j = 0,
            k = 0,
            l = 0,
            m = 0
          const messages: Array<string> = []

          if (collection.name !== name && (canDeepSyncVariables ?? false))
            collection.name = name
          const workingThemes =
            paletteData.themes.filter((theme) => theme.type === 'custom theme')
              .length === 0
              ? paletteData.themes.filter(
                  (theme) => theme.type === 'default theme'
                )
              : paletteData.themes.filter(
                  (theme) => theme.type === 'custom theme'
                )

          if (canDeepSyncVariables ?? false) {
            collection.modes.forEach((mode) => {
              const themeMatch = workingThemes.find(
                (theme) => theme.modeId === mode.modeId
              )
              if (themeMatch === undefined) {
                collection.removeMode(mode.modeId)
                m++
              }
            })
            localVariables.forEach((localVariable) => {
              const shadeMatch = workingThemes.find(
                (theme) =>
                  theme.colors.find(
                    (color) =>
                      color.shades.find(
                        (shade) => shade.variableId === localVariable.id
                      ) !== undefined
                  ) !== undefined
              )
              if (shadeMatch === undefined) {
                localVariable.remove()
                l++
              }
            })
          }

          workingThemes.forEach((theme) => {
            const modeMatch = collection.modes.find(
              (mode) => mode.modeId === theme.modeId
            )
            if (modeMatch !== undefined)
              if (modeMatch.name !== theme.name && theme.name !== 'None') {
                collection.renameMode(modeMatch.modeId, theme.name)
                j++
              }

            theme.colors.forEach((color) => {
              color.shades.forEach((shade) => {
                const variableMatch = localVariables.find(
                    (localVariable) => localVariable.id === shade.variableId
                  ),
                  description = color.description.endsWith(' ')
                    ? color.description.slice(0, -1)
                    : color.description

                if (variableMatch !== undefined && modeMatch !== undefined) {
                  if (variableMatch.name !== `${color.name}/${shade.name}`) {
                    variableMatch.name = `${color.name}/${shade.name}`
                    k++
                  }

                  if (variableMatch.description !== description) {
                    variableMatch.description = description
                    k++
                  }

                  if (
                    chroma([
                      (variableMatch.valuesByMode[theme.modeId] as RGB).r * 255,
                      (variableMatch.valuesByMode[theme.modeId] as RGB).g * 255,
                      (variableMatch.valuesByMode[theme.modeId] as RGB).b * 255,
                    ]).hex() !== shade.hex
                  ) {
                    variableMatch.setValueForMode(theme.modeId, {
                      r: shade.gl[0],
                      g: shade.gl[1],
                      b: shade.gl[2],
                    })
                    k++
                  }
                }
                if (k > 0) i++
                k = 0
              })
            })
          })

          if (i > 1 && j > 1)
            messages.push(
              locals[lang].info.updatedVariablesAndModes.pluralPlural
                .replace('$1', i)
                .replace('$2', j)
            )
          else if (i === 1 && j === 1)
            messages.push(
              locals[lang].info.updatedVariablesAndModes.singleSingle
            )
          else if (i === 0 && j === 0)
            messages.push(locals[lang].info.updatedVariablesAndModes.noneNone)
          else if (i > 1 && j === 1)
            messages.push(
              locals[lang].info.updatedVariablesAndModes.pluralSingle.replace(
                '$1',
                i
              )
            )
          else if (i === 1 && j > 1)
            messages.push(
              locals[lang].info.updatedVariablesAndModes.singlePlural.replace(
                '$1',
                j
              )
            )
          else if (i > 1 && j === 0)
            messages.push(
              locals[lang].info.updatedVariablesAndModes.pluralNone.replace(
                '$1',
                i
              )
            )
          else if (i === 0 && j > 1)
            messages.push(
              locals[lang].info.updatedVariablesAndModes.nonePlural.replace(
                '$1',
                j
              )
            )
          else if (i === 1 && j === 0)
            messages.push(locals[lang].info.updatedVariablesAndModes.singleNone)
          else if (i === 0 && j === 1)
            messages.push(locals[lang].info.updatedVariablesAndModes.noneSingle)

          if (l > 1 && m > 1)
            messages.push(
              locals[lang].info.removedVariablesAndModes.pluralPlural
                .replace('$1', l)
                .replace('$2', m)
            )
          else if (l === 1 && m === 1)
            messages.push(
              locals[lang].info.removedVariablesAndModes.singleSingle
            )
          else if (l === 0 && m === 0)
            messages.push(locals[lang].info.removedVariablesAndModes.noneNone)
          else if (l > 1 && m === 1)
            messages.push(
              locals[lang].info.removedVariablesAndModes.pluralSingle.replace(
                '$1',
                l
              )
            )
          else if (l === 1 && m > 1)
            messages.push(
              locals[lang].info.removedVariablesAndModes.singlePlural.replace(
                '$1',
                m
              )
            )
          else if (l > 1 && m === 0)
            messages.push(
              locals[lang].info.removedVariablesAndModes.pluralNone.replace(
                '$1',
                l
              )
            )
          else if (l === 0 && m > 1)
            messages.push(
              locals[lang].info.removedVariablesAndModes.nonePlural.replace(
                '$1',
                m
              )
            )
          else if (l === 1 && m === 0)
            messages.push(locals[lang].info.removedVariablesAndModes.singleNone)
          else if (l === 0 && m === 1)
            messages.push(locals[lang].info.removedVariablesAndModes.noneSingle)

          return messages.join('・')
        })
        .catch(() => locals[lang].error.generic)

      return await updateLocalVariablesStatusMessage
    } else return locals[lang].warning.collectionDoesNotExist
  } else return locals[lang].error.corruption
}

export default updateLocalVariables
