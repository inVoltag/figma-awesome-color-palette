export default class Tag {
  name: string
  content: string
  fontSize: number
  url: string | null
  nodeTag: FrameNode | null
  nodeTagWithAvatar: FrameNode | null
  nodeTagwithIndicator: FrameNode | null
  nodeText: TextNode | null
  nodeIndicator: EllipseNode | null
  nodeAvatar: EllipseNode | null

  constructor(
    name: string,
    content: string,
    fontSize = 8,
    url: string | null = null
  ) {
    this.name = name
    this.content = content
    this.fontSize = fontSize
    this.url = url
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
        opacity: 0.5,
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ]
    this.nodeTag.cornerRadius = 16

    // Layout
    this.nodeTag.layoutMode = 'HORIZONTAL'
    this.nodeTag.layoutSizingHorizontal = 'HUG'
    this.nodeTag.layoutSizingVertical = 'HUG'
    this.nodeTag.counterAxisAlignItems = 'CENTER'
    this.nodeTag.horizontalPadding = 8
    this.nodeTag.verticalPadding = 4
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
        opacity: 0.5,
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ]
    this.nodeTagwithIndicator.cornerRadius = 16

    // Layout
    this.nodeTagwithIndicator.layoutMode = 'HORIZONTAL'
    this.nodeTagwithIndicator.layoutSizingHorizontal = 'HUG'
    this.nodeTagwithIndicator.layoutSizingVertical = 'HUG'
    this.nodeTagwithIndicator.counterAxisAlignItems = 'CENTER'
    this.nodeTagwithIndicator.horizontalPadding = 8
    this.nodeTagwithIndicator.verticalPadding = 4
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
        opacity: 0.5,
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ]
    this.nodeTagWithAvatar.cornerRadius = 16

    // Layout
    this.nodeTagWithAvatar.layoutMode = 'HORIZONTAL'
    this.nodeTagWithAvatar.layoutSizingHorizontal = 'HUG'
    this.nodeTagWithAvatar.layoutSizingVertical = 'HUG'
    this.nodeTagWithAvatar.counterAxisAlignItems = 'CENTER'
    this.nodeTagWithAvatar.horizontalPadding = 8
    this.nodeTagWithAvatar.verticalPadding = 4
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

    if (image !== null && image !== undefined) {
      this.nodeAvatar.fills = [
        {
          type: 'IMAGE',
          scaleMode: 'FILL',
          imageHash: image.hash,
        },
      ]
    }

    return this.nodeAvatar
  }
}
