import chroma from 'chroma-js';

export default class Caption {

  name: string;
  rgb: Array<number>;
  hex: string;
  lch: Array<number>;
  node: TextNode;

  constructor(name, rgb) {
    this.name = name;
    this.rgb = rgb;
    this.hex = chroma(rgb).hex();
    this.lch = chroma(rgb).lch();
    this.node = figma.createText();
  }

  getContrast() {
    return Math.max(chroma.contrast(this.rgb, '#FFF'), chroma.contrast(this.rgb, '#000'))
  }

  getLevel() {
    return this.getContrast() < 4.5 ? 'A'
         : this.getContrast() >= 4.5 && this.getContrast() < 7 ? 'AA'
         : 'AAA'
  }

  getCaptionColor() {
    return chroma.contrast(this.rgb, '#FFF') < chroma.contrast(this.rgb, '#000') ? [0, 0, 0] : [1, 1, 1];
  }

  doContent() {
    return `${this.name}\n${this.hex.toUpperCase()}\nR ${Math.floor(this.rgb[0])}﹒G ${Math.floor(this.rgb[1])}﹒B ${Math.floor(this.rgb[2])}\nL ${Math.floor(this.lch[0])}﹒C ${Math.floor(this.lch[1])}﹒H ${Math.floor(this.lch[2])}\n${this.getLevel()}﹒${this.getContrast().toFixed(2)} : 1`
  }

  makeNode() {
    this.node.name = 'caption';
    this.node.characters = this.doContent();
    this.node.fontSize = 10;
    this.node.textAlignVertical = 'CENTER';
    this.node.fills = [{
      type: 'SOLID',
      color: {
        r: this.getCaptionColor()[0],
        g: this.getCaptionColor()[1],
        b: this.getCaptionColor()[2]
      }
    }];
    this.node.layoutGrow = 1;
    this.node.locked = true;

    return this.node
  }

}
