import { uid } from 'uid'

import Colors from '../canvas/Colors'
import { lang, locals } from '../content/locals'
import { presets } from '../stores/presets'
import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  VisionSimulationModeConfiguration,
} from '../types/configurations'
import setData from './setData'

const setPaletteMigration = async (palette: BaseNode) => {
  const type = palette.getPluginData('type'),
    name = palette.getPluginData('name'),
    min = palette.getPluginData('min'),
    max = palette.getPluginData('max'),
    description = palette.getPluginData('description'),
    preset = palette.getPluginData('preset'),
    scale = palette.getPluginData('scale'),
    shift = palette.getPluginData('shift'),
    areSourceColorsLocked = palette.getPluginData('areSourceColorsLocked'),
    colors = palette.getPluginData('colors'),
    colorsObject: Array<ColorConfiguration> = JSON.parse(colors),
    colorSpace = palette.getPluginData('colorSpace'),
    visionSimulationMode = palette.getPluginData('visionSimulationMode'),
    themes = palette.getPluginData('themes'),
    captions = palette.getPluginData('captions'),
    properties = palette.getPluginData('properties'),
    textColorsTheme = palette.getPluginData('textColorsTheme'),
    algorithmVersion = palette.getPluginData('algorithmVersion'),
    data = palette.getPluginData('data'),
    isPublished = palette.getPluginData('isPublished'),
    isShared = palette.getPluginData('isShared'),
    createdAt = palette.getPluginData('createdAt'),
    updatedAt = palette.getPluginData('updatedAt'),
    creatorFullName = palette.getPluginData('creatorFullName'),
    creatorAvatar = palette.getPluginData('creatorAvatar'),
    creatorAvatarImg =
      creatorAvatar !== '' && figma.editorType !== 'dev'
        ? await figma
            .createImageAsync(creatorAvatar)
            .then(async (image: Image) => image)
            .catch(() => null)
        : null

  // Id
  if (!isPublished) palette.setPluginData('id', '')

  // Type
  if (type === '') palette.setPluginData('type', 'UI_COLOR_PALETTE')

  // Min-Max
  if (min !== '' || max !== '') {
    palette.setPluginData('min', '')
    palette.setPluginData('max', '')
  }

  // Description
  if (description === '') palette.setPluginData('description', '')

  // Preset
  if (preset === '')
    palette.setPluginData(
      'preset',
      JSON.stringify(presets.find((preset) => preset.id === 'MATERIAL'))
    )

  // Shift
  if (shift === '')
    palette.setPluginData(
      'shift',
      JSON.stringify({
        chroma: 100,
      })
    )

  // Lock
  if (areSourceColorsLocked === '')
    palette.setPluginData('areSourceColorsLocked', 'false')

  // Colors
  if (colorsObject.length !== 0) {
    if (!Object.prototype.hasOwnProperty.call(colorsObject[0], 'description'))
      palette.setPluginData('colors', setData(colorsObject, 'description', ''))

    if (!Object.prototype.hasOwnProperty.call(colorsObject[0], 'id'))
      palette.setPluginData(
        'colors',
        JSON.stringify(
          colorsObject.map((color) => {
            color.id = uid()
            return color
          })
        )
      )

    if (Object.prototype.hasOwnProperty.call(colorsObject[0], 'oklch')) {
      colorsObject.map((color) => {
        if ('oklch' in color) delete color.oklch
        return color
      })
      palette.setPluginData('colors', JSON.stringify(colorsObject))
    }

    if (Object.prototype.hasOwnProperty.call(colorsObject[0], 'hueShifting')) {
      colorsObject.map((color) => {
        color.hue = {
          shift: color.hueShifting as number,
          isLocked: false,
        }
        if ('hueShifting' in color) delete color.hueShifting
        return color
      })
      palette.setPluginData('colors', JSON.stringify(colorsObject))
    }

    if (
      Object.prototype.hasOwnProperty.call(colorsObject[0], 'chromaShifting')
    ) {
      colorsObject.map((color) => {
        color.chroma = {
          shift: color.chromaShifting as number,
          isLocked: false,
        }
        if ('chromaShifting' in color) delete color.chromaShifting
        return color
      })
      palette.setPluginData('colors', JSON.stringify(colorsObject))
    }
  }

  if (colorSpace === '') palette.setPluginData('colorSpace', 'LCH')

  if (visionSimulationMode === '')
    palette.setPluginData('visionSimulationMode', 'NONE')

  // Themes
  if (themes === '')
    palette.setPluginData(
      'themes',
      JSON.stringify([
        {
          name: locals[lang].themes.switchTheme.defaultTheme,
          description: '',
          scale: JSON.parse(scale),
          paletteBackground: '#FFFFFF',
          isEnabled: true,
          id: '00000000000',
          type: 'default theme',
        },
      ])
    )

  // View
  if (captions === 'hasCaptions' || properties === 'hasProperties') {
    palette.setPluginData('captions', '')
    palette.setPluginData('properties', '')
    palette.setPluginData('view', 'PALETTE_WITH_PROPERTIES')
  } else if (
    captions === 'hasNotCaptions' ||
    properties === 'hasNotProperties'
  ) {
    palette.setPluginData('captions', '')
    palette.setPluginData('properties', '')
    palette.setPluginData('view', 'PALETTE')
  }

  // TextColorsTheme
  if (textColorsTheme === '')
    palette.setPluginData(
      'textColorsTheme',
      JSON.stringify({
        lightColor: '#FFFFFF',
        darkColor: '#000000',
      })
    )

  // Algorithm
  if (algorithmVersion === '') palette.setPluginData('algorithmVersion', 'v1')
  if (algorithmVersion.includes('v2'))
    palette.setPluginData('algorithmVersion', 'v2')

  // Data
  if (data === '' || JSON.parse(data).type === undefined)
    new Colors(
      {
        name: name,
        description: palette.getPluginData('description'),
        preset: JSON.parse(palette.getPluginData('preset')),
        scale: JSON.parse(palette.getPluginData('scale')),
        areSourceColorsLocked:
          palette.getPluginData('areSourceColorsLocked') === 'true',
        colors: JSON.parse(palette.getPluginData('colors')),
        colorSpace: palette.getPluginData(
          'colorSpace'
        ) as ColorSpaceConfiguration,
        visionSimulationMode: palette.getPluginData(
          'visionSimulationMode'
        ) as VisionSimulationModeConfiguration,
        themes: JSON.parse(palette.getPluginData('themes')),
        view: 'SHEET',
        textColorsTheme: JSON.parse(palette.getPluginData('textColorsTheme')),
        algorithmVersion: palette.getPluginData(
          'algorithmVersion'
        ) as AlgorithmVersionConfiguration,
        creatorFullName: creatorFullName,
        creatorAvatarImg: creatorAvatarImg,
      },
      palette as FrameNode
    ).makePaletteData('CREATE')

  // Publication and Share
  if (isPublished === '') palette.setPluginData('isPublished', 'false')
  if (isShared === '') palette.setPluginData('isShared', 'false')

  // Created, Updated and Published
  if (createdAt === '')
    palette.setPluginData('createdAt', new Date().toISOString())
  if (updatedAt === '')
    palette.setPluginData('updatedAt', new Date().toISOString())
}

export default setPaletteMigration
