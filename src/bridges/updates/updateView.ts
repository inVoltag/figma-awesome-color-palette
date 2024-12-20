import Colors from '../../canvas/Colors'
import { lang, locals } from '../../content/locals'
import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  ThemeConfiguration,
  VisionSimulationModeConfiguration,
} from '../../types/configurations'
import { ViewMessage } from '../../types/messages'
import { TextColorsThemeHexModel } from '../../types/models'
import setPaletteName from '../../utils/setPaletteName'
import {
  currentSelection,
  isSelectionChanged,
  previousSelection,
} from '../processSelection'

const updateView = async (msg: ViewMessage) => {
  const palette = isSelectionChanged
    ? (previousSelection?.[0] as FrameNode)
    : (currentSelection[0] as FrameNode)

  if (palette.children.length === 1) {
    const name: string =
        palette.getPluginData('name') === ''
          ? locals[lang].name
          : palette.getPluginData('name'),
      description: string = palette.getPluginData('description'),
      preset = JSON.parse(
        palette.getPluginData('preset')
      ) as PresetConfiguration,
      scale = JSON.parse(palette.getPluginData('scale')) as ScaleConfiguration,
      areSourceColorsLocked =
        palette.getPluginData('areSourceColorsLocked') === 'true',
      colors = JSON.parse(
        palette.getPluginData('colors')
      ) as Array<ColorConfiguration>,
      colorSpace = palette.getPluginData(
        'colorSpace'
      ) as ColorSpaceConfiguration,
      visionSimulationMode = palette.getPluginData(
        'visionSimulationMode'
      ) as VisionSimulationModeConfiguration,
      themes = JSON.parse(
        palette.getPluginData('themes')
      ) as Array<ThemeConfiguration>,
      textColorsTheme = JSON.parse(
        palette.getPluginData('textColorsTheme')
      ) as TextColorsThemeHexModel,
      algorithmVersion = palette.getPluginData(
        'algorithmVersion'
      ) as AlgorithmVersionConfiguration,
      creatorFullName = palette.getPluginData('creatorFullName'),
      creatorAvatar = palette.getPluginData('creatorAvatar'),
      creatorAvatarImg =
        creatorAvatar !== ''
          ? await figma
              .createImageAsync(creatorAvatar)
              .then(async (image: Image) => image)
              .catch(() => null)
          : null

    palette.setPluginData('view', msg.data.view)

    palette.children[0].remove()
    palette.appendChild(
      new Colors(
        {
          name: palette.getPluginData('name'),
          description: description,
          preset: preset,
          scale: scale,
          areSourceColorsLocked: areSourceColorsLocked,
          colors: colors,
          colorSpace: colorSpace,
          visionSimulationMode: visionSimulationMode,
          themes: themes,
          view: msg.data.view,
          textColorsTheme: textColorsTheme,
          algorithmVersion: algorithmVersion,
          creatorFullName: creatorFullName,
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
      name,
      themes.find((theme) => theme.isEnabled)?.name,
      preset.name,
      colorSpace,
      visionSimulationMode
    )
  } else figma.notify(locals[lang].error.corruption)
}

export default updateView
