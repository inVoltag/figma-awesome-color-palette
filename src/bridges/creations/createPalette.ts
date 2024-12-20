import Palette from '../../canvas/Palette'
import {
  MetaConfiguration,
  PaletteConfiguration,
  SourceColorConfiguration,
  ThemeConfiguration,
} from '../../types/configurations'

interface Msg {
  data: {
    sourceColors: Array<SourceColorConfiguration>
    palette: PaletteConfiguration
    themes?: Array<ThemeConfiguration>
    isRemote?: boolean
    paletteMeta?: MetaConfiguration
  }
}

const createPalette = async (msg: Msg) => {
  const scene: SceneNode[] = []

  const creatorAvatarImg = msg.data.paletteMeta?.creatorIdentity.creatorFullName
    ? await figma
        .createImageAsync(msg.data.paletteMeta.creatorIdentity.creatorAvatar)
        .then(async (image: Image) => image)
        .catch(() => null)
    : null

  const palette = new Palette(
    msg.data.sourceColors,
    msg.data.palette.name,
    msg.data.palette.description,
    msg.data.palette.preset,
    msg.data.palette.scale,
    msg.data.palette.shift,
    msg.data.palette.areSourceColorsLocked,
    msg.data.palette.colorSpace,
    msg.data.palette.visionSimulationMode,
    msg.data.palette.view,
    msg.data.palette.textColorsTheme,
    msg.data.palette.algorithmVersion,
    msg.data.themes,
    msg.data.isRemote,
    msg.data.paletteMeta,
    creatorAvatarImg
  ).makeNode()

  if (palette.children.length !== 0) {
    figma.currentPage.appendChild(palette)
    scene.push(palette)
    palette.x = figma.viewport.center.x - palette.width / 2
    palette.y = figma.viewport.center.y - palette.height / 2
    figma.currentPage.selection = scene
    figma.viewport.scrollAndZoomIntoView(scene)
    return true
  } else palette.remove()
}

export default createPalette
