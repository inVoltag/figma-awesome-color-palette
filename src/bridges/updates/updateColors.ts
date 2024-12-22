import { PaletteNode } from 'src/types/nodes'
import Colors from '../../canvas/Colors'
import { lang, locals } from '../../content/locals'
import { ColorsMessage } from '../../types/messages'
import setPaletteName from '../../utils/setPaletteName'
import {
  currentSelection,
  isSelectionChanged,
  previousSelection,
} from '../processSelection'

const updateColors = async (msg: ColorsMessage) => {
  const palette = isSelectionChanged
    ? (previousSelection?.[0] as FrameNode)
    : (currentSelection[0] as FrameNode)

  if (palette.children.length === 1) {
    const keys = palette.getPluginDataKeys()
    const paletteData: [string, string | boolean | object][] = keys.map(
      (key) => {
        const value = palette.getPluginData(key)
        if (value === 'true' || value === 'false')
          return [key, value === 'true']
        else if (value.includes('{'))
          return [key, JSON.parse(palette.getPluginData(key))]
        return [key, value]
      }
    )
    const paletteObject = makePaletteNode(paletteData)
    const creatorAvatarImg =
      paletteObject.creatorAvatar !== ''
        ? await figma
            .createImageAsync(paletteObject.creatorAvatar ?? '')
            .then(async (image: Image) => image)
            .catch(() => null)
        : null

    palette.setPluginData('colors', JSON.stringify(msg.data))

    palette.children[0].remove()
    palette.appendChild(
      new Colors(
        {
          ...paletteObject,
          colors: msg.data,
          name: paletteObject.name !== undefined ? paletteObject.name : '',
          description:
            paletteObject.description !== undefined
              ? paletteObject.description
              : '',
          view:
            msg.isEditedInRealTime &&
            paletteObject.view === 'PALETTE_WITH_PROPERTIES'
              ? 'PALETTE'
              : msg.isEditedInRealTime && paletteObject.view === 'SHEET'
                ? 'SHEET_SAFE_MODE'
                : paletteObject.view,
          creatorAvatarImg: creatorAvatarImg,
          service: 'EDIT',
        },
        palette
      ).makeNode()
    )

    // Update
    const now = new Date().toISOString()
    palette.setPluginData('updatedAt', now)
    figma.ui.postMessage({
      type: 'UPDATE_PALETTE_DATE',
      data: now,
    })

    // Palette migration
    palette.counterAxisSizingMode = 'AUTO'
    palette.name = setPaletteName(
      paletteObject.name !== undefined ? paletteObject.name : locals[lang].name,
      paletteObject.themes.find((theme) => theme.isEnabled)?.name,
      paletteObject.preset.name,
      paletteObject.colorSpace,
      paletteObject.visionSimulationMode
    )
  } else figma.notify(locals[lang].error.corruption)
}

const makePaletteNode = (data: [string, string | boolean | object][]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: { [key: string]: any } = {}

  data.forEach((d) => {
    obj[d[0]] = d[1]
  })

  return obj as PaletteNode
}

export default updateColors
