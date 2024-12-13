export default class Paragraph {
  private name: string
  private content: string
  private fontSize: number
  private type: 'FILL' | 'FIXED'
  private width?: number
  private nodeText: TextNode | null
  private node: FrameNode | null

  constructor(
    name: string,
    content: string,
    type: 'FILL' | 'FIXED',
    width?: number,
    fontSize = 12
  ) {
    this.name = name
    this.content = content
    this.fontSize = fontSize
    this.type = type
    this.width = width
    this.nodeText = null
    this.node = null
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
      value: 130,
      unit: 'PERCENT',
    })
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

    // Layout
    this.nodeText.layoutGrow = 1

    return this.nodeText
  }

  makeNode() {
    // Base
    this.node = figma.createFrame()
    this.node.name = this.name
    this.node.fills = [
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
    this.node.cornerRadius = 16
    if (this.type === 'FIXED') this.node.resize(this.width ?? 100, 100)

    // Layout
    this.node.layoutMode = 'HORIZONTAL'
    if (this.type === 'FIXED') this.node.layoutSizingHorizontal = 'FIXED'
    else {
      this.node.primaryAxisSizingMode = 'FIXED'
      this.node.layoutAlign = 'STRETCH'
    }
    this.node.layoutSizingVertical = 'HUG'
    this.node.horizontalPadding = 8
    this.node.verticalPadding = 8

    // Insert
    this.node.appendChild(this.makeNodeText())

    return this.node
  }
}
