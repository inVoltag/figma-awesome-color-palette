import Tag from './Tag'

export default class Property {
  private name: string
  private content: string
  private size: number
  private node: FrameNode | null

  constructor(name: string, content: string, size: number) {
    this.name = name
    this.content = content
    this.size = size
    this.node = null
  }

  makeNode = () => {
    // Base
    this.node = figma.createFrame()
    this.node.name = '_property'
    this.node.fills = []

    // Layout
    this.node.layoutMode = 'VERTICAL'
    this.node.counterAxisSizingMode = 'FIXED'
    this.node.layoutAlign = 'STRETCH'
    this.node.primaryAxisSizingMode = 'FIXED'
    this.node.layoutGrow = 1

    // Insert
    this.node.appendChild(
      new Tag({
        name: this.name,
        content: this.content,
        fontSize: this.size,
      }).makeNodeTag()
    )

    return this.node
  }
}
