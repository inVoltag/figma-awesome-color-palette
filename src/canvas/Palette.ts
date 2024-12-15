import { uid } from 'uid'

import { lang, locals } from '../content/locals'
import { Service } from '../types/app'
import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  MetaConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  ShiftConfiguration,
  SourceColorConfiguration,
  ThemeConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
} from '../types/configurations'
import { TextColorsThemeHexModel } from '../types/models'
import { PaletteNode } from '../types/nodes'
import setPaletteName from '../utils/setPaletteName'
import Colors from './Colors'

export default class Palette {
  sourceColors: Array<SourceColorConfiguration>
  name: string
  description: string
  frameName: string
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  colors: Array<ColorConfiguration>
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  themes: Array<ThemeConfiguration>
  preset: PresetConfiguration
  view: ViewConfiguration
  textColorsTheme: TextColorsThemeHexModel
  algorithmVersion: AlgorithmVersionConfiguration
  isRemote: boolean | undefined
  meta: MetaConfiguration | undefined
  creatorFullName: string | undefined
  creatorAvatarImg: Image | null
  service: Service
  node: FrameNode | null

  constructor(
    sourceColors: Array<SourceColorConfiguration>,
    name: string,
    description: string,
    preset: PresetConfiguration,
    scale: ScaleConfiguration,
    shift: ShiftConfiguration,
    colorSpace: ColorSpaceConfiguration,
    visionSimulationMode: VisionSimulationModeConfiguration,
    view: ViewConfiguration,
    textColorsTheme: TextColorsThemeHexModel,
    algorithmVersion: AlgorithmVersionConfiguration,
    themes: Array<ThemeConfiguration> | undefined = undefined,
    isRemote: boolean | undefined = false,
    meta: MetaConfiguration | undefined = undefined,
    creatorAvatarImg: Image | null = null
  ) {
    this.sourceColors = sourceColors
    this.name = name
    this.description = description
    this.frameName = setPaletteName(
      name === '' ? locals[lang].name : name,
      undefined,
      preset.name,
      colorSpace,
      visionSimulationMode
    )
    this.preset = preset
    this.scale = scale
    this.shift = shift
    this.colors = []
    this.colorSpace = colorSpace
    this.visionSimulationMode = visionSimulationMode
    ;(this.themes =
      themes === undefined
        ? [
            {
              name: locals[lang].themes.switchTheme.defaultTheme,
              description: '',
              scale: this.scale,
              paletteBackground: '#FFFFFF',
              isEnabled: true,
              id: '00000000000',
              type: 'default theme',
            },
          ]
        : themes),
      (this.view = view)
    this.algorithmVersion = algorithmVersion
    this.textColorsTheme = textColorsTheme
    this.isRemote = isRemote
    this.meta = meta
    this.creatorFullName = meta?.creatorIdentity.creatorFullName
    this.creatorAvatarImg = creatorAvatarImg
    this.service = 'CREATE'
    this.node = null
  }

  makeNode = () => {
    const now = new Date().toISOString()
    // Base
    this.node = figma.createFrame()
    this.node.name = this.frameName
    this.node.resize(1640, 100)
    this.node.cornerRadius = 16

    // Layout
    this.node.layoutMode = 'VERTICAL'
    this.node.layoutSizingHorizontal = 'HUG'
    this.node.layoutSizingVertical = 'HUG'
    this.node.paddingTop =
      this.node.paddingRight =
      this.node.paddingBottom =
      this.node.paddingLeft =
        32

    // data
    this.node.setRelaunchData({ edit: '' })
    this.node.setPluginData('type', 'UI_COLOR_PALETTE')
    this.node.setPluginData('name', this.name)
    this.node.setPluginData('description', this.description)
    this.node.setPluginData('preset', JSON.stringify(this.preset))
    this.node.setPluginData('scale', JSON.stringify(this.scale))
    this.node.setPluginData('shift', JSON.stringify(this.shift))
    this.node.setPluginData('shift', JSON.stringify(this.shift))
    this.node.setPluginData('colorSpace', this.colorSpace)
    this.node.setPluginData('visionSimulationMode', this.visionSimulationMode)
    this.node.setPluginData('themes', JSON.stringify(this.themes))
    this.node.setPluginData('view', this.view)
    this.node.setPluginData(
      'textColorsTheme',
      JSON.stringify(this.textColorsTheme)
    )
    this.node.setPluginData('algorithmVersion', this.algorithmVersion)

    if (this.isRemote && this.meta !== undefined) {
      this.node.setPluginData('id', this.meta.id)
      this.node.setPluginData('createdAt', this.meta.dates.createdAt as string)
      this.node.setPluginData('updatedAt', this.meta.dates.updatedAt as string)
      this.node.setPluginData(
        'publishedAt',
        this.meta.dates.publishedAt as string
      )
      this.node.setPluginData('isPublished', 'true')
      this.node.setPluginData(
        'isShared',
        this.meta.publicationStatus.isShared.toString()
      )
      this.node.setPluginData(
        'creatorFullName',
        this.meta.creatorIdentity.creatorFullName
      )
      this.node.setPluginData(
        'creatorAvatar',
        this.meta.creatorIdentity.creatorAvatar
      )
      this.node.setPluginData('creatorId', this.meta.creatorIdentity.creatorId)
    } else {
      this.node.setPluginData('createdAt', now)
      this.node.setPluginData('updatedAt', now)
      this.node.setPluginData('publishedAt', '')
      this.node.setPluginData('isPublished', 'false')
      this.node.setPluginData('isShared', 'false')
    }

    // Insert
    this.sourceColors.forEach((sourceColor) =>
      this.colors.push({
        name: sourceColor.name,
        description: '',
        rgb: sourceColor.rgb,
        id: uid(),
        oklch: false,
        hueShifting: sourceColor.hueShifting ?? 0,
        chromaShifting: this.isRemote
          ? (sourceColor.chromaShifting ?? 100)
          : this.shift.chroma,
      })
    )

    this.colors.sort((a, b) => {
      if (a.name.localeCompare(b.name) > 0) return 1
      else if (a.name.localeCompare(b.name) < 0) return -1
      else return 0
    })

    this.node.appendChild(new Colors(this as PaletteNode, this.node).makeNode())

    this.node.setPluginData('colors', JSON.stringify(this.colors))
    return this.node
  }
}
