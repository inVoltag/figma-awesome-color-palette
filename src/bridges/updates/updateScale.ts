import Colors from '../../canvas/Colors'
import { lang, locals } from '../../content/locals'
import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  PresetConfiguration,
  ThemeConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
} from '../../types/configurations'
import { ScaleMessage } from '../../types/messages'
import { TextColorsThemeHexModel } from '../../types/models'
import doLightnessScale from '../../utils/doLightnessScale'
import setPaletteName from '../../utils/setPaletteName'
import {
  currentSelection,
  isSelectionChanged,
  previousSelection,
} from '../processSelection'

const updateScale = async (msg: ScaleMessage) => {
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
      view = palette.getPluginData('view') as ViewConfiguration,
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

    const theme = themes.find((theme) => theme.isEnabled)
    if (theme !== undefined) theme.scale = msg.data.scale

    if (msg.feature === 'ADD_STOP' || msg.feature === 'DELETE_STOP')
      themes.forEach((theme) => {
        if (!theme.isEnabled)
          theme.scale = doLightnessScale(
            Object.keys(msg.data.scale).map((stop) => {
              return parseFloat(stop.replace('lightness-', ''))
            }),
            theme.scale[
              Object.keys(theme.scale)[Object.keys(theme.scale).length - 1]
            ],
            theme.scale[Object.keys(theme.scale)[0]]
          )
      })
    palette.setPluginData('shift', JSON.stringify(msg.data.shift))
    palette.setPluginData('themes', JSON.stringify(themes))

    if (Object.keys(msg.data.preset).length !== 0)
      palette.setPluginData('preset', JSON.stringify(msg.data.preset))

    palette.children[0].remove()
    palette.appendChild(
      new Colors(
        {
          name: palette.getPluginData('name'),
          description: description,
          preset: preset,
          scale: msg.data.scale,
          areSourceColorsLocked: areSourceColorsLocked,
          colors: colors,
          colorSpace: colorSpace,
          visionSimulationMode: visionSimulationMode,
          themes: themes,
          view:
            msg.isEditedInRealTime && view === 'PALETTE_WITH_PROPERTIES'
              ? 'PALETTE'
              : msg.isEditedInRealTime && view === 'SHEET'
                ? 'SHEET_SAFE_MODE'
                : view,
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

export default updateScale
