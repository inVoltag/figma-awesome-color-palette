import { RgbModel } from '../types/models'

export default class Tag {
  private name: string
  private content: string
  private fontSize: number
  private url: string | null
  private backgroundColor: {
    rgb: RgbModel
    alpha: number
  }
  private isCompact: boolean
  private nodeTag: FrameNode | null
  private nodeTagWithAvatar: FrameNode | null
  private nodeTagwithIndicator: FrameNode | null
  private nodeText: TextNode | null
  private nodeIndicator: EllipseNode | null
  private nodeAvatar: EllipseNode | null

  constructor(options: {
    name: string
    content: string
    fontSize?: number
    backgroundColor?: {
      rgb: RgbModel
      alpha: number
    }
    isCompact?: boolean
    url?: string | null
  }) {
    this.name = options.name
    this.content = options.content
    this.fontSize = options.fontSize ?? 8
    this.url = options.url ?? (null as string | null)
    this.backgroundColor = options.backgroundColor ?? {
      rgb: {
        r: 1,
        g: 1,
        b: 1,
      },
      alpha: 0.5,
    }
    this.isCompact = options.isCompact ?? false
    this.nodeTag = null
    this.nodeTagwithIndicator = null
    this.nodeTagWithAvatar = null
    this.nodeText = null
    this.nodeIndicator = null
    this.nodeAvatar = null
  }

  makeNodeTag = () => {
    // Base
    this.nodeTag = figma.createFrame()
    this.nodeTag.name = this.name
    this.nodeTag.fills = [
      {
        type: 'SOLID',
        opacity: this.backgroundColor.alpha,
        color: {
          r: this.backgroundColor?.rgb.r,
          g: this.backgroundColor.rgb.g,
          b: this.backgroundColor.rgb.b,
        },
      },
    ]
    this.nodeTag.strokes = [
      {
        type: 'SOLID',
        color: {
          r: 0,
          g: 0,
          b: 0,
        },
        opacity: 0.05,
      },
    ]
    this.nodeTag.cornerRadius = 16

    // Layout
    this.nodeTag.layoutMode = 'HORIZONTAL'
    this.nodeTag.layoutSizingHorizontal = 'HUG'
    this.nodeTag.layoutSizingVertical = 'HUG'
    this.nodeTag.counterAxisAlignItems = 'CENTER'
    this.nodeTag.paddingRight = this.isCompact ? 2 : 8
    this.nodeTag.paddingLeft = 8
    this.nodeTag.paddingTop = this.nodeTag.paddingBottom = this.isCompact
      ? 2
      : 4
    this.nodeTag.itemSpacing = 4

    // Insert
    this.nodeTag.appendChild(this.makeNodeText())

    return this.nodeTag
  }

  makeNodeTagwithIndicator = (gl: Array<number> = [0, 0, 0, 1]) => {
    // Base
    this.nodeTagwithIndicator = figma.createFrame()
    this.nodeTagwithIndicator.name = this.name
    this.nodeTagwithIndicator.fills = [
      {
        type: 'SOLID',
        opacity: this.backgroundColor.alpha,
        color: {
          r: this.backgroundColor.rgb.r,
          g: this.backgroundColor.rgb.g,
          b: this.backgroundColor.rgb.b,
        },
      },
    ]
    this.nodeTagwithIndicator.strokes = [
      {
        type: 'SOLID',
        color: {
          r: 0,
          g: 0,
          b: 0,
        },
        opacity: 0.05,
      },
    ]
    this.nodeTagwithIndicator.cornerRadius = 16

    // Layout
    this.nodeTagwithIndicator.layoutMode = 'HORIZONTAL'
    this.nodeTagwithIndicator.layoutSizingHorizontal = 'HUG'
    this.nodeTagwithIndicator.layoutSizingVertical = 'HUG'
    this.nodeTagwithIndicator.counterAxisAlignItems = 'CENTER'
    this.nodeTagwithIndicator.paddingRight = this.isCompact ? 2 : 8
    this.nodeTagwithIndicator.paddingLeft = 8
    this.nodeTagwithIndicator.paddingTop =
      this.nodeTagwithIndicator.paddingBottom = this.isCompact ? 2 : 4
    this.nodeTagwithIndicator.itemSpacing = 4

    // Insert
    this.nodeTagwithIndicator.appendChild(
      this.makeNodeIndicator([gl[0], gl[1], gl[2]])
    )
    this.nodeTagwithIndicator.appendChild(this.makeNodeText())

    return this.nodeTagwithIndicator
  }

  makeNodeTagWithAvatar = (image?: Image | null): FrameNode => {
    // Base
    this.nodeTagWithAvatar = figma.createFrame()
    this.nodeTagWithAvatar.name = this.name
    this.nodeTagWithAvatar.fills = [
      {
        type: 'SOLID',
        opacity: this.backgroundColor.alpha,
        color: {
          r: this.backgroundColor.rgb.r,
          g: this.backgroundColor.rgb.g,
          b: this.backgroundColor.rgb.b,
        },
      },
    ]
    this.nodeTagWithAvatar.strokes = [
      {
        type: 'SOLID',
        color: {
          r: 0,
          g: 0,
          b: 0,
        },
        opacity: 0.05,
      },
    ]
    this.nodeTagWithAvatar.cornerRadius = 16

    // Layout
    this.nodeTagWithAvatar.layoutMode = 'HORIZONTAL'
    this.nodeTagWithAvatar.layoutSizingHorizontal = 'HUG'
    this.nodeTagWithAvatar.layoutSizingVertical = 'HUG'
    this.nodeTagWithAvatar.counterAxisAlignItems = 'CENTER'
    this.nodeTagWithAvatar.horizontalPadding = this.isCompact ? 4 : 8
    this.nodeTagWithAvatar.verticalPadding = this.isCompact ? 2 : 4
    this.nodeTagWithAvatar.itemSpacing = 8

    // Insert
    this.nodeTagWithAvatar.appendChild(this.makeNodeText())
    this.nodeTagWithAvatar.appendChild(this.makeNodeAvatar(image))

    return this.nodeTagWithAvatar
  }

  makeNodeText = () => {
    // Base
    this.nodeText = figma.createText()
    this.nodeText.name = '_text'
    this.nodeText.characters = this.content
    this.nodeText.fontName = {
      family: 'Red Hat Mono',
      style: 'Medium',
    }
    this.nodeText.fontSize = this.fontSize
    this.nodeText.setRangeLineHeight(0, this.content.length, {
      value: 100,
      unit: 'PERCENT',
    })
    this.nodeText.textAlignHorizontal = 'CENTER'
    if (this.url !== null) {
      this.nodeText.setRangeHyperlink(0, this.content.length, {
        type: 'URL',
        value: this.url,
      })
      this.nodeText.setRangeTextDecoration(0, this.content.length, 'UNDERLINE')
    }
    this.nodeText.fills = [
      {
        type: 'SOLID',
        color: {
          r: 16 / 255,
          g: 35 / 255,
          b: 37 / 255,
        },
      },
    ]

    return this.nodeText
  }

  makeNodeIndicator = (rgb: Array<number>) => {
    // Base
    this.nodeIndicator = figma.createEllipse()
    this.nodeIndicator.name = '_indicator'
    this.nodeIndicator.resize(8, 8)
    this.nodeIndicator.fills = [
      {
        type: 'SOLID',
        color: {
          r: rgb[0],
          g: rgb[1],
          b: rgb[2],
        },
      },
    ]
    this.nodeIndicator.strokes = [
      {
        type: 'SOLID',
        color: {
          r: 0,
          g: 0,
          b: 0,
        },
        opacity: 0.1,
      },
    ]

    return this.nodeIndicator
  }

  makeNodeAvatar = (image?: Image | null) => {
    // Base
    this.nodeAvatar = figma.createEllipse()
    this.nodeAvatar.resize(24, 24)
    this.nodeAvatar.name = '_avatar'

    if (image !== null && image !== undefined)
      this.nodeAvatar.fills = [
        {
          type: 'IMAGE',
          scaleMode: 'FILL',
          imageHash: image.hash,
        },
      ]

    return this.nodeAvatar
  }
}
