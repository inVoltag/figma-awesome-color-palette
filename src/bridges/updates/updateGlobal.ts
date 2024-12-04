import Colors from '../../canvas/Colors'
import { lang, locals } from '../../content/locals'
import {
  ColorConfiguration,
  CreatorConfiguration,
  DatesConfiguration,
  PaletteConfiguration,
  PublicationConfiguration,
  ThemeConfiguration,
} from '../../types/configurations'
import setPaletteName from '../../utils/setPaletteName'
import {
  currentSelection,
  isSelectionChanged,
  previousSelection,
} from '../processSelection'

interface Msg {
  data: PaletteConfiguration & {
    creatorIdentity: CreatorConfiguration
    colors: Array<ColorConfiguration>
    themes: Array<ThemeConfiguration>
    dates: DatesConfiguration
    publicationStatus: PublicationConfiguration
  }
}

const updateGlobal = async (msg: Msg) => {
  const palette = isSelectionChanged
    ? (previousSelection?.[0] as FrameNode)
    : (currentSelection[0] as FrameNode)

  const creatorAvatarImg = await figma
    .createImageAsync(msg.data.creatorIdentity.creatorAvatar)
    .then(async (image: Image) => image)
    .catch(() => null)

  if (palette.children.length === 1) {
    palette.children[0].remove()
    palette.appendChild(
      new Colors(
        {
          name: msg.data.name,
          description: msg.data.description,
          preset: msg.data.preset,
          scale: msg.data.scale,
          colors: msg.data.colors,
          colorSpace: msg.data.colorSpace,
          visionSimulationMode: msg.data.visionSimulationMode,
          themes: msg.data.themes,
          view: msg.data.view,
          textColorsTheme: msg.data.textColorsTheme,
          algorithmVersion: msg.data.algorithmVersion,
          creatorFullName: msg.data.creatorIdentity.creatorFullName,
          creatorAvatarImg: creatorAvatarImg,
          service: 'EDIT',
        },
        palette
      ).makeNode()
    )

    palette.name = setPaletteName(
      msg.data.name,
      msg.data.themes.find((theme) => theme.isEnabled)?.name,
      msg.data.preset.name,
      msg.data.colorSpace,
      msg.data.visionSimulationMode
    )

    palette.setPluginData('name', msg.data.name)
    palette.setPluginData('description', msg.data.description)
    palette.setPluginData('preset', JSON.stringify(msg.data.preset))
    palette.setPluginData('scale', JSON.stringify(msg.data.scale))
    palette.setPluginData('colors', JSON.stringify(msg.data.colors))
    palette.setPluginData('colorSpace', msg.data.colorSpace)
    palette.setPluginData('visionSimulationMode', msg.data.visionSimulationMode)
    palette.setPluginData('themes', JSON.stringify(msg.data.themes))
    palette.setPluginData('view', msg.data.view)
    palette.setPluginData(
      'textColorsTheme',
      JSON.stringify(msg.data.textColorsTheme)
    )
    palette.setPluginData('algorithmVersion', msg.data.algorithmVersion)
    palette.setPluginData('createdAt', msg.data.dates.createdAt.toString())
    palette.setPluginData('updatedAt', msg.data.dates.updatedAt.toString())
    palette.setPluginData('publishedAt', msg.data.dates.publishedAt.toString())
    palette.setPluginData(
      'isPublished',
      msg.data.publicationStatus.isPublished.toString()
    )
    palette.setPluginData(
      'isShared',
      msg.data.publicationStatus.isShared.toString()
    )
    palette.setPluginData(
      'creatorFullName',
      msg.data.creatorIdentity.creatorFullName
    )
    palette.setPluginData(
      'creatorAvatar',
      msg.data.creatorIdentity.creatorAvatar
    )
    palette.setPluginData('creatorId', msg.data.creatorIdentity.creatorId)

    figma.ui.postMessage({
      type: 'UPDATE_SCREENSHOT',
      data: await palette.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 0.25 },
      }),
    })
  } else figma.notify(locals[lang].error.corruption)
}

export default updateGlobal
