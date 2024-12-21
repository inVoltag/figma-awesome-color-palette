import { PaletteNode } from 'src/types/nodes'
import Colors from '../../canvas/Colors'
import { lang, locals } from '../../content/locals'
import setPaletteName from '../../utils/setPaletteName'
import {
  currentSelection,
  isSelectionChanged,
  previousSelection,
} from '../processSelection'

interface Item {
  key: string
  value: boolean | object | string
}

const updatePalette = async (msg: Array<Item>) => {
  const palette = isSelectionChanged
    ? (previousSelection?.[0] as FrameNode)
    : (currentSelection[0] as FrameNode)

  if (palette.children.length === 1) {
    msg.forEach((s: Item) => {
      if (typeof s.value === 'object')
        palette.setPluginData(s.key, JSON.stringify(s.value))
      else if (typeof s.value === 'boolean')
        palette.setPluginData(s.key, s.value.toString())
      else palette.setPluginData(s.key, s.value)
    })

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

    palette.children[0].remove()
    palette.appendChild(
      new Colors(
        {
          ...paletteObject,
          name: paletteObject.name !== undefined ? paletteObject.name : '',
          description:
            paletteObject.description !== undefined
              ? paletteObject.description
              : '',
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

export default updatePalette
