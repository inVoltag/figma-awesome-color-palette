import { PaletteData } from 'src/types/data'
import { CollectionMessage } from 'src/types/messages'
import { lang, locals } from '../../content/locals'
import {
  currentSelection,
  isSelectionChanged,
  previousSelection,
} from '../processSelection'

const updateVariablesCollection = async (msg: CollectionMessage) => {
  const palette = isSelectionChanged
    ? (previousSelection?.[0] as FrameNode)
    : (currentSelection[0] as FrameNode)

  if (palette.children.length === 1) {
    const paletteData: PaletteData = JSON.parse(palette.getPluginData('data'))
    const now = new Date().toISOString()

    paletteData.collectionId = msg.data.id
    console.log(paletteData)
    palette.setPluginData('data', JSON.stringify(paletteData))

    palette.setPluginData('updatedAt', now)
    figma.ui.postMessage({
      type: 'UPDATE_PALETTE_DATE',
      data: now,
    })
    figma.ui.postMessage({
      type: 'SWITCH_VARIABLE_COLLECTION',
      data: {
        id: msg.data.id,
      },
    })
  } else figma.notify(locals[lang].error.corruption)
}

export default updateVariablesCollection
