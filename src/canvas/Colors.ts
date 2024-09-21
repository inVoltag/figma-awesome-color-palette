import * as blinder from 'color-blind'
import chroma from 'chroma-js'
import { Hsluv } from 'hsluv'

import { lang, locals } from '../content/locals'
import {
  ScaleConfiguration,
  VisionSimulationModeConfiguration,
} from '../types/configurations'
import {
  PaletteData,
  PaletteDataColorItem,
  PaletteDataThemeItem,
} from '../types/data'
import { ActionsList } from '../types/models'
import { PaletteNode } from '../types/nodes'
import Header from './Header'
import Sample from './Sample'
import Signature from './Signature'
import Title from './Title'

export default class Colors {
  parent: PaletteNode
  palette: FrameNode | undefined
  paletteData: PaletteData
  currentScale: ScaleConfiguration
  paletteBackgroundGl: Array<number>
  sampleScale: number
  sampleRatio: number
  sampleSize: number
  gap: number
  nodeRow: FrameNode | null
  nodeRowSource: FrameNode | null
  nodeRowShades: FrameNode | null
  nodeEmpty: FrameNode | null
  nodeShades: FrameNode | null
  node: FrameNode | null

  constructor(parent?: PaletteNode, palette?: FrameNode | undefined) {
    this.parent = parent as PaletteNode
    this.palette = palette
    this.paletteData = {
      name: this.parent.name,
      description: this.parent.description,
      themes: [],
      collectionId: '',
      type: 'palette',
    }
    this.currentScale =
      this.parent.themes.find((theme) => theme.isEnabled)?.scale ?? {}
    this.paletteBackgroundGl = chroma(
      this.parent.themes.find((theme) => theme.isEnabled)?.paletteBackground ??
        '#FFF'
    ).gl()
    this.sampleScale = 1.75
    this.sampleRatio = 3 / 2
    this.sampleSize = 184
    this.gap = 32
    this.nodeRow = null
    this.nodeRowSource = null
    this.nodeRowShades = null
    this.nodeEmpty = null
    this.nodeShades = null
    this.node = null
  }

  getShadeColorFromLch = (
    sourceColor: [number, number, number],
    lightness: number,
    hueShifting: number,
    chromaShifting: number,
    algorithmVersion: string
  ) => {
    const lch = chroma(sourceColor).lch(),
      newColor = chroma
        .lch(
          lightness,
          algorithmVersion === 'v2'
            ? Math.sin((lightness / 100) * Math.PI) *
                lch[1] *
                (chromaShifting / 100)
            : lch[1] * (chromaShifting / 100),
          lch[2] + hueShifting < 0
            ? 0
            : lch[2] + hueShifting > 360
              ? 360
              : lch[2] + hueShifting
        )
        .rgb()

    return this.simulateColorBlind(newColor, this.parent.visionSimulationMode)
  }

  getShadeColorFromOklch = (
    sourceColor: [number, number, number],
    lightness: number,
    hueShifting: number,
    chromaShifting: number,
    algorithmVersion: string
  ) => {
    const oklch = chroma(sourceColor).oklch(),
      newColor = chroma
        .oklch(
          lightness / 100,
          algorithmVersion === 'v2'
            ? Math.sin((lightness / 100) * Math.PI) *
                oklch[1] *
                (chromaShifting / 100)
            : oklch[1] * (chromaShifting / 100),
          oklch[2] + hueShifting < 0
            ? 0
            : oklch[2] + hueShifting > 360
              ? 360
              : oklch[2] + hueShifting
        )
        .rgb()

    return this.simulateColorBlind(newColor, this.parent.visionSimulationMode)
  }

  getShadeColorFromLab = (
    sourceColor: [number, number, number],
    lightness: number,
    hueShifting: number,
    chromaShifting: number,
    algorithmVersion: string
  ) => {
    const labA = chroma(sourceColor).get('lab.a'),
      labB = chroma(sourceColor).get('lab.b'),
      chr = Math.sqrt(labA ** 2 + labB ** 2) * (chromaShifting / 100)
    let h = Math.atan(labB / labA) + hueShifting * (Math.PI / 180)

    if (h > Math.PI) h = Math.PI
    else if (h < -Math.PI) h = Math.PI

    let newLabA = chr * Math.cos(h),
      newLabB = chr * Math.sin(h)

    if (Math.sign(labA) === -1 && Math.sign(labB) === 1) {
      newLabA *= -1
      newLabB *= -1
    }
    if (Math.sign(labA) === -1 && Math.sign(labB) === -1) {
      newLabA *= -1
      newLabB *= -1
    }

    const newColor = chroma
      .lab(
        lightness,
        algorithmVersion === 'v2'
          ? Math.sin((lightness / 100) * Math.PI) * newLabA
          : newLabA,
        algorithmVersion === 'v2'
          ? Math.sin((lightness / 100) * Math.PI) * newLabB
          : newLabB
      )
      .rgb()

    return this.simulateColorBlind(newColor, this.parent.visionSimulationMode)
  }

  getShadeColorFromOklab = (
    sourceColor: [number, number, number],
    lightness: number,
    hueShifting: number,
    chromaShifting: number,
    algorithmVersion: string
  ) => {
    const labA = chroma(sourceColor).get('oklab.a'),
      labB = chroma(sourceColor).get('oklab.b'),
      chr = Math.sqrt(labA ** 2 + labB ** 2) * (chromaShifting / 100)
    let h = Math.atan(labB / labA) + hueShifting * (Math.PI / 180)

    if (h > Math.PI) h = Math.PI
    else if (h < -Math.PI) h = Math.PI

    let newLabA = chr * Math.cos(h),
      newLabB = chr * Math.sin(h)

    if (Math.sign(labA) === -1 && Math.sign(labB) === 1) {
      newLabA *= -1
      newLabB *= -1
    }
    if (Math.sign(labA) === -1 && Math.sign(labB) === -1) {
      newLabA *= -1
      newLabB *= -1
    }

    if (Number.isNaN(newLabA)) newLabA = 0
    if (Number.isNaN(newLabB)) newLabB = 0

    const newColor = chroma
      .oklab(
        lightness / 100,
        algorithmVersion === 'v2'
          ? Math.sin((lightness / 100) * Math.PI) * newLabA
          : newLabA,
        algorithmVersion === 'v2'
          ? Math.sin((lightness / 100) * Math.PI) * newLabB
          : newLabB
      )
      .rgb()

    return this.simulateColorBlind(newColor, this.parent.visionSimulationMode)
  }

  getShadeColorFromHsl = (
    sourceColor: [number, number, number],
    lightness: number,
    hueShifting: number,
    chromaShifting: number,
    algorithmVersion: string
  ) => {
    const hsl = chroma(sourceColor).hsl(),
      newColor = chroma
        .hsl(
          hsl[0] + hueShifting < 0
            ? 0
            : hsl[0] + hueShifting > 360
              ? 360
              : hsl[0] + hueShifting,
          algorithmVersion === 'v2'
            ? Math.sin((lightness / 100) * Math.PI) *
                hsl[1] *
                (chromaShifting / 100)
            : hsl[1] * (chromaShifting / 100),
          lightness / 100
        )
        .rgb()

    return this.simulateColorBlind(newColor, this.parent.visionSimulationMode)
  }

  getShadeColorFromHsluv = (
    sourceColor: [number, number, number],
    lightness: number,
    hueShifting: number,
    chromaShifting: number,
    algorithmVersion: string
  ) => {
    const hsluv = new Hsluv()

    hsluv.rgb_r = sourceColor[0] / 255
    hsluv.rgb_g = sourceColor[1] / 255
    hsluv.rgb_b = sourceColor[2] / 255

    hsluv.rgbToHsluv()

    hsluv.hsluv_l = lightness
    hsluv.hsluv_s =
      algorithmVersion === 'v2'
        ? Math.sin((lightness / 100) * Math.PI) *
          hsluv.hsluv_s *
          (chromaShifting / 100)
        : hsluv.hsluv_s * (chromaShifting / 100)
    hsluv.hsluv_h =
      hsluv.hsluv_h + hueShifting < 0
        ? 0
        : hsluv.hsluv_h + hueShifting > 360
          ? 360
          : hsluv.hsluv_h + hueShifting

    if (Number.isNaN(hsluv.hsluv_s)) hsluv.hsluv_s = 0
    if (Number.isNaN(hsluv.hsluv_h)) hsluv.hsluv_h = 0

    hsluv.hsluvToRgb()

    const newColor: [number, number, number] = [
      hsluv.rgb_r * 255,
      hsluv.rgb_g * 255,
      hsluv.rgb_b * 255,
    ]

    return this.simulateColorBlind(newColor, this.parent.visionSimulationMode)
  }

  simulateColorBlind = (
    sourceColor: [number, number, number],
    visionSimulationMode: VisionSimulationModeConfiguration
  ): [number, number, number] => {
    const actions: ActionsList = {
      NONE: () => sourceColor,
      PROTANOMALY: () =>
        chroma(blinder.protanomaly(chroma(sourceColor).hex())).rgb(false),
      PROTANOPIA: () =>
        chroma(blinder.protanopia(chroma(sourceColor).hex())).rgb(false),
      DEUTERANOMALY: () =>
        chroma(blinder.deuteranomaly(chroma(sourceColor).hex())).rgb(false),
      DEUTERANOPIA: () =>
        chroma(blinder.deuteranopia(chroma(sourceColor).hex())).rgb(false),
      TRITANOMALY: () =>
        chroma(blinder.tritanomaly(chroma(sourceColor).hex())).rgb(false),
      TRITANOPIA: () =>
        chroma(blinder.tritanopia(chroma(sourceColor).hex())).rgb(false),
      ACHROMATOMALY: () =>
        chroma(blinder.achromatomaly(chroma(sourceColor).hex())).rgb(false),
      ACHROMATOPSIA: () =>
        chroma(blinder.achromatopsia(chroma(sourceColor).hex())).rgb(false),
    }

    const result = actions[visionSimulationMode]?.()
    return result !== undefined ? result : [0, 0, 0]
  }

  makeEmptyCase = () => {
    // Base
    this.nodeEmpty = figma.createFrame()
    this.nodeEmpty.name = '_message'
    this.nodeEmpty.resize(100, 48)
    this.nodeEmpty.fills = []

    // Layout
    this.nodeEmpty.layoutMode = 'HORIZONTAL'
    this.nodeEmpty.primaryAxisSizingMode = 'FIXED'
    this.nodeEmpty.layoutSizingVertical = 'FIXED'
    this.nodeEmpty.layoutAlign = 'STRETCH'
    this.nodeEmpty.primaryAxisAlignItems = 'CENTER'

    // Insert
    this.nodeEmpty.appendChild(
      new Sample(
        locals[lang].warning.emptySourceColors,
        null,
        null,
        [255, 255, 255],
        this.parent.colorSpace,
        this.parent.visionSimulationMode,
        this.parent.view,
        this.parent.textColorsTheme
      ).makeNodeName('FILL', 48, 48)
    )

    return this.nodeEmpty
  }

  searchForModeId = (themes: Array<PaletteDataThemeItem>, themeId: string) => {
    const themeMatch = themes.find((record) => record.id === themeId),
      modeId = themeMatch === undefined ? '' : themeMatch.modeId

    return modeId === undefined ? '' : modeId
  }

  searchForShadeVariableId = (
    themes: Array<PaletteDataThemeItem>,
    themeId: string,
    colorId: string,
    shadeName: string
  ) => {
    const themeMatch = themes.find((theme) => theme.id === themeId),
      colorMatch =
        themeMatch === undefined
          ? undefined
          : themeMatch.colors.find((color) => color.id === colorId),
      shadeMatch =
        colorMatch === undefined
          ? undefined
          : colorMatch.shades.find((shade) => shade.name === shadeName),
      variableId = shadeMatch === undefined ? '' : shadeMatch.variableId

    return variableId === undefined ? '' : variableId
  }

  searchForShadeStyleId = (
    themes: Array<PaletteDataThemeItem>,
    themeId: string,
    colorId: string,
    shadeName: string
  ) => {
    const themeMatch = themes.find((theme) => theme.id === themeId),
      colorMatch =
        themeMatch === undefined
          ? undefined
          : themeMatch.colors.find((color) => color.id === colorId),
      shadeMatch =
        colorMatch === undefined
          ? undefined
          : colorMatch.shades.find((shade) => shade.name === shadeName),
      styleId = shadeMatch === undefined ? '' : shadeMatch.styleId

    return styleId === undefined ? '' : styleId
  }

  makePaletteData = (service: string) => {
    let data = this.paletteData
    if (service === 'EDIT') {
      data = JSON.parse(this.palette?.getPluginData('data') ?? '')
      this.paletteData.collectionId = data.collectionId
    }

    this.parent.themes.forEach((theme) => {
      const paletteDataThemeItem: PaletteDataThemeItem = {
        name: theme.name,
        description: theme.description,
        colors: [],
        modeId:
          service === 'EDIT' ? this.searchForModeId(data.themes, theme.id) : '',
        id: theme.id,
        type: theme.type,
      }
      this.parent.colors.forEach((color) => {
        const paletteDataColorItem: PaletteDataColorItem = {
            name: color.name,
            description: color.description,
            shades: [],
            id: color.id,
            type: 'color',
          },
          sourceColor: [number, number, number] = [
            color.rgb.r * 255,
            color.rgb.g * 255,
            color.rgb.b * 255,
          ]

        const sourceHsluv = new Hsluv()
        sourceHsluv.rgb_r = color.rgb.r
        sourceHsluv.rgb_g = color.rgb.g
        sourceHsluv.rgb_b = color.rgb.b
        sourceHsluv.rgbToHsluv()

        paletteDataColorItem.shades.push({
          name: 'source',
          description: 'Source color',
          hex: chroma(sourceColor).hex(),
          rgb: sourceColor,
          gl: chroma(sourceColor).gl(),
          lch: chroma(sourceColor).lch(),
          oklch: chroma(sourceColor).oklch(),
          lab: chroma(sourceColor).lab(),
          oklab: chroma(sourceColor).oklab(),
          hsl: chroma(sourceColor).hsl(),
          hsluv: [
            sourceHsluv.hsluv_h,
            sourceHsluv.hsluv_s,
            sourceHsluv.hsluv_l,
          ],
          variableId:
            service === 'EDIT'
              ? this.searchForShadeVariableId(
                  data.themes,
                  theme.id,
                  color.id,
                  'source'
                )
              : '',
          styleId:
            service === 'EDIT'
              ? this.searchForShadeStyleId(
                  data.themes,
                  theme.id,
                  color.id,
                  'source'
                )
              : '',
          type: 'source color',
        })

        Object.values(theme.scale)
          .reverse()
          .forEach((lightness: number) => {
            let newColor: [number, number, number] = [0, 0, 0]

            if (this.parent.colorSpace === 'LCH')
              newColor = this.getShadeColorFromLch(
                sourceColor,
                lightness,
                color.hueShifting ?? 0,
                color.chromaShifting ?? 100,
                this.parent.algorithmVersion
              )
            else if (this.parent.colorSpace === 'OKLCH')
              newColor = this.getShadeColorFromOklch(
                sourceColor,
                lightness,
                color.hueShifting ?? 0,
                color.chromaShifting ?? 100,
                this.parent.algorithmVersion
              )
            else if (this.parent.colorSpace === 'LAB')
              newColor = this.getShadeColorFromLab(
                sourceColor,
                lightness,
                color.hueShifting ?? 0,
                color.chromaShifting ?? 100,
                this.parent.algorithmVersion
              )
            else if (this.parent.colorSpace === 'OKLAB')
              newColor = this.getShadeColorFromOklab(
                sourceColor,
                lightness,
                color.hueShifting ?? 0,
                color.chromaShifting ?? 100,
                this.parent.algorithmVersion
              )
            else if (this.parent.colorSpace === 'HSL')
              newColor = this.getShadeColorFromHsl(
                sourceColor,
                lightness,
                color.hueShifting ?? 0,
                color.chromaShifting ?? 100,
                this.parent.algorithmVersion
              )
            else if (this.parent.colorSpace === 'HSLUV')
              newColor = this.getShadeColorFromHsluv(
                sourceColor,
                lightness,
                color.hueShifting ?? 0,
                color.chromaShifting ?? 100,
                this.parent.algorithmVersion
              )

            const scaleName: string =
              Object.keys(theme.scale)
                .find((key) => theme.scale[key] === lightness)
                ?.substr(10) ?? '0'

            const newHsluv = new Hsluv()
            newHsluv.rgb_r = newColor[0] / 255
            newHsluv.rgb_g = newColor[1] / 255
            newHsluv.rgb_b = newColor[2] / 255
            newHsluv.rgbToHsluv()

            paletteDataColorItem.shades.push({
              name: scaleName,
              description: `Shade color with ${lightness}% of lightness`,
              hex: chroma(newColor).hex(),
              rgb: chroma(newColor).rgb(),
              gl: chroma(newColor).gl(),
              lch: chroma(newColor).lch(),
              oklch: chroma(newColor).oklch(),
              lab: chroma(newColor).lab(),
              oklab: chroma(newColor).oklab(),
              hsl: chroma(newColor).hsl(),
              hsluv: [newHsluv.hsluv_h, newHsluv.hsluv_s, newHsluv.hsluv_l],
              variableId:
                service === 'EDIT'
                  ? this.searchForShadeVariableId(
                      data.themes,
                      theme.id,
                      color.id,
                      scaleName
                    )
                  : '',
              styleId:
                service === 'EDIT'
                  ? this.searchForShadeStyleId(
                      data.themes,
                      theme.id,
                      color.id,
                      scaleName
                    )
                  : '',
              type: 'color shade',
            })
          })

        paletteDataThemeItem.colors.push(paletteDataColorItem)
      })
      this.paletteData.themes.push(paletteDataThemeItem)
    })

    this.palette?.setPluginData('data', JSON.stringify(this.paletteData))
  }

  makeNodeShades = () => {
    // Base
    this.nodeShades = figma.createFrame()
    this.nodeShades.name = '_shades'
    this.nodeShades.fills = []

    // Layout
    this.nodeShades.layoutMode = 'VERTICAL'
    this.nodeShades.layoutSizingHorizontal = 'HUG'
    this.nodeShades.layoutSizingVertical = 'HUG'

    // Insert
    this.nodeShades.appendChild(
      new Header(
        this.parent as PaletteNode,
        this.parent.view.includes('PALETTE')
          ? this.sampleSize
          : this.sampleSize * this.sampleScale * 4 +
            this.sampleSize * this.sampleRatio +
            this.gap * 4
      ).makeNode()
    )
    this.parent.colors.forEach((color) => {
      const sourceColor: [number, number, number] = [
        color.rgb.r * 255,
        color.rgb.g * 255,
        color.rgb.b * 255,
      ]

      // Base
      this.nodeRow = figma.createFrame()
      this.nodeRowSource = figma.createFrame()
      this.nodeRowShades = figma.createFrame()
      this.nodeRow.name = color.name
      this.nodeRowSource.name = '_source'
      this.nodeRowShades.name = '_shades'
      this.nodeRow.fills =
        this.nodeRowSource.fills =
        this.nodeRowShades.fills =
          []

      // Layout
      this.nodeRow.layoutMode =
        this.nodeRowSource.layoutMode =
        this.nodeRowShades.layoutMode =
          'HORIZONTAL'
      this.nodeRow.layoutSizingHorizontal =
        this.nodeRowSource.layoutSizingHorizontal =
        this.nodeRowShades.layoutSizingHorizontal =
          'HUG'
      this.nodeRow.layoutSizingVertical =
        this.nodeRowSource.layoutSizingVertical =
        this.nodeRowShades.layoutSizingVertical =
          'HUG'
      if (!this.parent.view.includes('PALETTE'))
        this.nodeRow.itemSpacing = this.gap

      // Insert
      this.nodeRowSource.appendChild(
        this.parent.view.includes('PALETTE')
          ? new Sample(
              color.name,
              null,
              null,
              [color.rgb.r * 255, color.rgb.g * 255, color.rgb.b * 255],
              this.parent.colorSpace,
              this.parent.visionSimulationMode,
              this.parent.view,
              this.parent.textColorsTheme
            ).makeNodeShade(
              this.sampleSize,
              this.sampleSize * this.sampleRatio,
              color.name,
              true
            )
          : new Sample(
              color.name,
              null,
              null,
              [color.rgb.r * 255, color.rgb.g * 255, color.rgb.b * 255],
              this.parent.colorSpace,
              this.parent.visionSimulationMode,
              this.parent.view,
              this.parent.textColorsTheme
            ).makeNodeRichShade(
              this.sampleSize * this.sampleRatio,
              this.sampleSize * this.sampleRatio * this.sampleScale,
              color.name,
              true,
              color.description
            )
      )

      Object.values(this.currentScale)
        .reverse()
        .forEach((lightness: number) => {
          let newColor: [number, number, number] = [0, 0, 0]

          if (this.parent.colorSpace === 'LCH')
            newColor = this.getShadeColorFromLch(
              sourceColor,
              lightness,
              color.hueShifting ?? 0,
              color.chromaShifting ?? 100,
              this.parent.algorithmVersion
            )
          else if (this.parent.colorSpace === 'OKLCH')
            newColor = this.getShadeColorFromOklch(
              sourceColor,
              lightness,
              color.hueShifting ?? 0,
              color.chromaShifting ?? 100,
              this.parent.algorithmVersion
            )
          else if (this.parent.colorSpace === 'LAB')
            newColor = this.getShadeColorFromLab(
              sourceColor,
              lightness,
              color.hueShifting ?? 0,
              color.chromaShifting ?? 100,
              this.parent.algorithmVersion
            )
          else if (this.parent.colorSpace === 'OKLAB')
            newColor = this.getShadeColorFromOklab(
              sourceColor,
              lightness,
              color.hueShifting ?? 0,
              color.chromaShifting ?? 100,
              this.parent.algorithmVersion
            )
          else if (this.parent.colorSpace === 'HSL')
            newColor = this.getShadeColorFromHsl(
              sourceColor,
              lightness,
              color.hueShifting ?? 0,
              color.chromaShifting ?? 100,
              this.parent.algorithmVersion
            )
          else if (this.parent.colorSpace === 'HSLUV')
            newColor = this.getShadeColorFromHsluv(
              sourceColor,
              lightness,
              color.hueShifting ?? 0,
              color.chromaShifting ?? 100,
              this.parent.algorithmVersion
            )

          const distance: number = chroma.distance(
            chroma(sourceColor).hex(),
            chroma(newColor).hex(),
            'rgb'
          )

          const scaleName: string =
            Object.keys(this.currentScale)
              .find((key) => this.currentScale[key] === lightness)
              ?.substr(10) ?? '0'

          if (this.parent.view.includes('PALETTE')) {
            this.nodeRowShades?.appendChild(
              new Sample(
                color.name,
                color.rgb,
                scaleName,
                [newColor[0], newColor[1], newColor[2]],
                this.parent.colorSpace,
                this.parent.visionSimulationMode,
                this.parent.view,
                this.parent.textColorsTheme,
                { isClosestToRef: distance < 4 ? true : false }
              ).makeNodeShade(
                this.sampleSize,
                this.sampleSize * this.sampleRatio,
                scaleName
              )
            )
          } else {
            if (this.nodeRowShades !== null) {
              this.nodeRowShades.layoutSizingHorizontal = 'FIXED'
              this.nodeRowShades.layoutWrap = 'WRAP'
              this.nodeRowShades.itemSpacing = this.gap
              this.nodeRowShades.resize(
                this.sampleSize * this.sampleScale * 4 + this.gap * 3,
                100
              )
              this.nodeRowShades.layoutSizingVertical = 'HUG'
              this.nodeRowShades.appendChild(
                new Sample(
                  color.name,
                  color.rgb,
                  scaleName,
                  [newColor[0], newColor[1], newColor[2]],
                  this.parent.colorSpace,
                  this.parent.visionSimulationMode,
                  this.parent.view,
                  this.parent.textColorsTheme,
                  { isClosestToRef: distance < 4 ? true : false }
                ).makeNodeRichShade(
                  this.sampleSize * this.sampleScale,
                  this.sampleSize * this.sampleRatio * this.sampleScale,
                  scaleName
                )
              )
            }
          }
        })

      this.nodeRow.appendChild(this.nodeRowSource)
      this.nodeRow.appendChild(this.nodeRowShades)
      this.nodeShades?.appendChild(this.nodeRow)
    })
    this.makePaletteData(this.parent.service ?? 'EDIT')
    if (this.parent.colors.length === 0)
      this.nodeShades.appendChild(this.makeEmptyCase())

    return this.nodeShades
  }

  makeNode = () => {
    // Base
    this.node = figma.createFrame()
    this.node.name = '_colors﹒do not edit any layer'
    this.node.fills = []
    this.node.locked = true

    // Layout
    this.node.layoutMode = 'VERTICAL'
    this.node.layoutSizingHorizontal = 'HUG'
    this.node.layoutSizingVertical = 'HUG'
    this.node.itemSpacing = 16

    // Insert
    this.node.appendChild(new Title(this.parent).makeNode())
    this.node.appendChild(this.makeNodeShades())
    this.node.appendChild(new Signature().makeNode())

    if (this.palette !== undefined)
      this.palette.fills = [
        {
          type: 'SOLID',
          color: {
            r: this.paletteBackgroundGl[0],
            g: this.paletteBackgroundGl[1],
            b: this.paletteBackgroundGl[2],
          },
        },
      ]

    return this.node
  }
}
