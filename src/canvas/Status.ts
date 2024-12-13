import { lang, locals } from '../content/locals'
import Tag from './Tag'

export default class Status {
  private status: { isClosestToRef: boolean }
  private source: { [key: string]: number }
  private node: FrameNode | null

  constructor(
    status: { isClosestToRef: boolean },
    source: { [key: string]: number }
  ) {
    this.status = status
    this.source = source
    this.node = null
  }

  makeNode = () => {
    // Base
    this.node = figma.createFrame()
    this.node.name = '_status'
    this.node.fills = []

    // Layout
    this.node.layoutMode = 'HORIZONTAL'
    this.node.primaryAxisSizingMode = 'FIXED'
    this.node.layoutAlign = 'STRETCH'
    this.node.layoutSizingVertical = 'HUG'

    if (this.status.isClosestToRef)
      this.node.appendChild(
        new Tag({
          name: '_close',
          content: locals[lang].paletteProperties.closest,
          fontSize: 10,
        }).makeNodeTagwithIndicator([
          this.source.r,
          this.source.g,
          this.source.b,
          1,
        ])
      )

    return this.node
  }
}
