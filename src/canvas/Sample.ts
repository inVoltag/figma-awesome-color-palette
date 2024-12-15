import {
  ColorSpaceConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
} from '../types/configurations'
import { RgbModel, TextColorsThemeHexModel } from '../types/models'
import Paragraph from './Paragraph'
import Properties from './Properties'
import Property from './Property'
import Status from './Status'

export default class Sample {
  private name: string
  private source: RgbModel | null
  private scale: string | null
  private rgb: [number, number, number]
  private colorSpace: ColorSpaceConfiguration
  private visionSimulationMode: VisionSimulationModeConfiguration
  private view: ViewConfiguration
  private textColorsTheme: TextColorsThemeHexModel
  private status: {
    isClosestToRef: boolean
  }
  private nodeColor: FrameNode | null
  private node: FrameNode | null
  private children: FrameNode | null

  constructor(
    name: string,
    source: RgbModel | null,
    scale: string | null,
    rgb: [number, number, number],
    colorSpace: ColorSpaceConfiguration,
    visionSimulationMode: VisionSimulationModeConfiguration,
    view: ViewConfiguration,
    textColorsTheme: TextColorsThemeHexModel,
    status: { isClosestToRef: boolean } = { isClosestToRef: false }
  ) {
    this.name = name
    this.source = source
    this.scale = scale
    this.rgb = rgb
    this.colorSpace = colorSpace
    this.visionSimulationMode = visionSimulationMode
    this.view = view
    this.textColorsTheme = textColorsTheme
    this.status = status
    this.nodeColor = null
    this.node = null
    this.children = null
  }

  makeNodeName = (mode: string, width: number, height: number) => {
    // Base
    this.node = figma.createFrame()
    this.node.name = this.name
    this.node.fills = []

    // Layout
    this.node.layoutMode = 'HORIZONTAL'
    this.node.layoutSizingHorizontal = 'FIXED'
    this.node.paddingTop =
      this.node.paddingRight =
      this.node.paddingBottom =
      this.node.paddingLeft =
        8
    this.node.resize(width, height)

    if (mode === 'FILL') {
      this.node.counterAxisSizingMode = 'FIXED'
      this.node.layoutGrow = 1
      this.children = new Property('_large-label', this.name, 16).makeNode()
    } else if (mode === 'FIXED')
      this.children = new Property('_label', this.name, 10).makeNode()

    // Insert
    this.node.appendChild(this.children as FrameNode)

    return this.node
  }

  makeNodeShade = (
    width: number,
    height: number,
    name: string,
    isColorName = false
  ) => {
    // Base
    this.node = figma.createFrame()
    this.node.name = name
    this.node.resize(width, height)
    this.node.fills = [
      {
        type: 'SOLID',
        color: {
          r: this.rgb[0] / 255,
          g: this.rgb[1] / 255,
          b: this.rgb[2] / 255,
        },
      },
    ]

    // Layout
    this.node.layoutMode = 'VERTICAL'
    this.node.layoutSizingHorizontal = 'FIXED'
    this.node.layoutSizingVertical = 'FIXED'
    this.node.primaryAxisAlignItems = 'MAX'
    this.node.paddingTop =
      this.node.paddingRight =
      this.node.paddingBottom =
      this.node.paddingLeft =
        8
    this.node.itemSpacing = 8

    // Insert
    if (this.view.includes('PALETTE_WITH_PROPERTIES') && !isColorName)
      this.node.appendChild(
        new Properties(
          this.scale ?? '0',
          this.rgb,
          this.colorSpace,
          this.visionSimulationMode,
          this.textColorsTheme
        ).makeNode()
      )
    else if (isColorName)
      this.node.appendChild(new Property('_label', this.name, 10).makeNode())
    if (this.status.isClosestToRef)
      this.node.appendChild(
        new Status(
          this.status,
          this.source
            ? { r: this.source.r, g: this.source.g, b: this.source.b }
            : {}
        ).makeNode()
      )

    return this.node
  }

  makeNodeRichShade = (
    width: number,
    height: number,
    name: string,
    isColorName = false,
    description = ''
  ) => {
    // Base
    this.node = figma.createFrame()
    this.node.name = name
    this.node.resize(width, height)
    this.node.fills = []

    // Layout
    this.node.layoutMode = 'VERTICAL'
    this.node.layoutSizingHorizontal = 'FIXED'
    this.node.layoutSizingVertical = 'FIXED'
    this.node.primaryAxisAlignItems = 'MIN'
    this.node.itemSpacing = 8

    // color
    this.nodeColor = figma.createFrame()
    this.nodeColor.name = '_color'
    this.nodeColor.layoutMode = 'VERTICAL'
    this.nodeColor.layoutSizingHorizontal = 'FIXED'
    this.nodeColor.layoutSizingVertical = 'FIXED'
    this.nodeColor.layoutAlign = 'STRETCH'
    this.nodeColor.resize(96, 96)
    this.nodeColor.paddingTop =
      this.nodeColor.paddingRight =
      this.nodeColor.paddingBottom =
      this.nodeColor.paddingLeft =
        8
    this.nodeColor.itemSpacing = 8
    this.nodeColor.fills = [
      {
        type: 'SOLID',
        color: {
          r: this.rgb[0] / 255,
          g: this.rgb[1] / 255,
          b: this.rgb[2] / 255,
        },
      },
    ]
    this.nodeColor.cornerRadius = 16

    // Insert
    this.nodeColor.appendChild(new Property('_label', name, 10).makeNode())
    if (this.status.isClosestToRef)
      this.nodeColor.appendChild(
        new Status(
          this.status,
          this.source
            ? { r: this.source.r, g: this.source.g, b: this.source.b }
            : {}
        ).makeNode()
      )

    this.node.appendChild(this.nodeColor)
    if (isColorName && description !== '')
      this.node.appendChild(
        new Paragraph(
          '_description',
          description,
          'FILL',
          undefined,
          8
        ).makeNode()
      )
    else if (!this.view.includes('SHEET_SAFE_MODE') && !isColorName)
      this.node.appendChild(
        new Properties(
          this.scale ?? '0',
          this.rgb,
          this.colorSpace,
          this.visionSimulationMode,
          this.textColorsTheme
        ).makeNodeDetailed()
      )

    return this.node
  }
}
