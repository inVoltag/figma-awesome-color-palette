import { RgbModel } from '../types/models'

export default class LocalStyle {
  private name: string
  private description: string
  private rgb: RgbModel
  private paintStyle: PaintStyle | null

  constructor(name: string, description: string, rgb: RgbModel) {
    this.name = name
    this.description = description
    this.rgb = rgb
    this.paintStyle = null
  }

  makePaintStyle = () => {
    this.paintStyle = figma.createPaintStyle()
    this.paintStyle.name = this.name
    this.paintStyle.description = this.description
    this.paintStyle.paints = [
      {
        type: 'SOLID',
        color: this.rgb,
      },
    ]

    return this.paintStyle
  }
}
