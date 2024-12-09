import { lang, locals } from '../content/locals'
import { windowSize } from '../types/app'
import { ActionsList } from '../types/models'
import checkEditorType from './checks/checkEditorType'
import checkHighlightStatus from './checks/checkHighlightStatus'
import checkPlanStatus from './checks/checkPlanStatus'
import checkUserConsent from './checks/checkUserConsent'
import createLocalStyles from './creations/createLocalStyles'
import createLocalVariables from './creations/createLocalVariables'
import createPalette from './creations/createPalette'
import enableTrial from './enableTrial'
import exportCss from './exports/exportCss'
import exportCsv from './exports/exportCsv'
import exportJson from './exports/exportJson'
import exportJsonAmznStyleDictionary from './exports/exportJsonAmznStyleDictionary'
import exportJsonTokensStudio from './exports/exportJsonTokensStudio'
import exportKt from './exports/exportKt'
import exportSwiftUI from './exports/exportSwiftUI'
import exportTailwind from './exports/exportTailwind'
import exportUIKit from './exports/exportUIKit'
import exportXml from './exports/exportXml'
import getPalettesOnCurrentPage from './getPalettesOnCurrentPage'
import getProPlan from './getProPlan'
import processSelection from './processSelection'
import updateColors from './updates/updateColors'
import updateGlobal from './updates/updateGlobal'
import updateLocalStyles from './updates/updateLocalStyles'
import updateLocalVariables from './updates/updateLocalVariables'
import updateScale from './updates/updateScale'
import updateSettings from './updates/updateSettings'
import updateThemes from './updates/updateThemes'
import updateView from './updates/updateView'

const loadUI = async () => {
  const windowSize: windowSize = {
    w: (await figma.clientStorage.getAsync('plugin_window_width')) ?? 640,
    h: (await figma.clientStorage.getAsync('plugin_window_height')) ?? 320,
  }

  figma.showUI(__html__, {
    width: windowSize.w,
    height: windowSize.h,
    title: locals[lang].name,
    themeColors: true,
  })

  // Checks
  checkUserConsent()
    .then(() => checkEditorType())
    .then(() => checkPlanStatus())
    .then(() => processSelection())

  // Canvas > UI
  figma.ui.postMessage({
    type: 'CHECK_USER_AUTHENTICATION',
    id: figma.currentUser?.id,
    fullName: figma.currentUser?.name,
    avatar: figma.currentUser?.photoUrl,
    data: {
      accessToken: await figma.clientStorage.getAsync('supabase_access_token'),
      refreshToken: await figma.clientStorage.getAsync(
        'supabase_refresh_token'
      ),
    },
  })

  // UI > Canvas
  figma.ui.onmessage = async (msg) => {
    const palette = figma.currentPage.selection[0] as FrameNode

    const actions: ActionsList = {
      RESIZE_UI: async () => {
        const scaleX = Math.abs(msg.origin.x - msg.cursor.x - msg.shift.x),
          scaleY = Math.abs(msg.origin.y - msg.cursor.y - msg.shift.y)

        if (scaleX > 540) windowSize.w = scaleX
        else windowSize.w = 540
        if (scaleY > 300) windowSize.h = scaleY
        else windowSize.h = 300

        await figma.clientStorage.setAsync('plugin_window_width', windowSize.w)
        await figma.clientStorage.setAsync('plugin_window_height', windowSize.h)

        figma.ui.resize(windowSize.w, windowSize.h)
      },
      //
      CHECK_USER_CONSENT: () => checkUserConsent(),
      CHECK_HIGHLIGHT_STATUS: () => checkHighlightStatus(msg.version),
      //
      CREATE_PALETTE: () => createPalette(msg),
      UPDATE_SCALE: () => updateScale(msg),
      UPDATE_VIEW: () => updateView(msg),
      UPDATE_COLORS: () => updateColors(msg),
      UPDATE_THEMES: () => updateThemes(msg),
      UPDATE_GLOBAL: () => updateGlobal(msg),
      SYNC_LOCAL_STYLES: async () =>
        createLocalStyles(palette)
          .then(async (message) => [message, await updateLocalStyles(palette)])
          .then((messages) => figma.notify(messages.join('・')))
          .catch((error) => {
            figma.notify(locals[lang].error.generic)
            throw error
          }),
      SYNC_LOCAL_VARIABLES: () =>
        createLocalVariables(palette)
          .then(async (message) => [
            message,
            await updateLocalVariables(palette),
          ])
          .then((messages) => figma.notify(messages.join('・')))
          .catch((error) => {
            figma.notify(locals[lang].error.generic)
            throw error
          }),
      EXPORT_PALETTE: () => {
        msg.export === 'TOKENS_GLOBAL' && exportJson(palette)
        msg.export === 'TOKENS_AMZN_STYLE_DICTIONARY' &&
          exportJsonAmznStyleDictionary(palette)
        msg.export === 'TOKENS_TOKENS_STUDIO' && exportJsonTokensStudio(palette)
        msg.export === 'CSS' && exportCss(palette, msg.colorSpace)
        msg.export === 'TAILWIND' && exportTailwind(palette)
        msg.export === 'APPLE_SWIFTUI' && exportSwiftUI(palette)
        msg.export === 'APPLE_UIKIT' && exportUIKit(palette)
        msg.export === 'ANDROID_COMPOSE' && exportKt(palette)
        msg.export === 'ANDROID_XML' && exportXml(palette)
        msg.export === 'CSV' && exportCsv(palette)
      },
      UPDATE_SETTINGS: () => updateSettings(msg),
      //
      OPEN_IN_BROWSER: () => figma.openExternal(msg.url),
      //
      SEND_MESSAGE: () => figma.notify(msg.message),
      SET_ITEMS: () => {
        msg.items.forEach(
          async (item: { key: string; value: string }) =>
            await figma.clientStorage.setAsync(item.key, item.value)
        )
      },
      DELETE_ITEMS: () =>
        msg.items.forEach(
          async (item: string) => await figma.clientStorage.deleteAsync(item)
        ),
      //
      SET_DATA: () =>
        msg.items.forEach((item: { key: string; value: string }) =>
          palette.setPluginData(item.key, item.value)
        ),
      UPDATE_SCREENSHOT: async () =>
        figma.ui.postMessage({
          type: 'UPDATE_SCREENSHOT',
          data: await palette
            .exportAsync({
              format: 'PNG',
              constraint: { type: 'SCALE', value: 0.25 },
            })
            .catch(() => null),
        }),
      UPDATE_PALETTE_DATE: async () =>
        figma.ui.postMessage({
          type: 'UPDATE_SCREENSHOT',
          data: msg.data,
        }),
      GET_PALETTES: async () => await getPalettesOnCurrentPage(),
      JUMP_TO_PALETTE: async () => {
        const scene: Array<SceneNode> = []
        const palette = await figma.currentPage
          .loadAsync()
          .then(() => figma.currentPage.findOne((node) => node.id === msg.id))
          .catch((error) => {
            figma.notify(locals[lang].error.generic)
            throw error
          })
        palette !== null && scene.push(palette)
        figma.currentPage.selection = scene
      },
      //
      GET_PRO_PLAN: async () => await getProPlan(),
      ENABLE_TRIAL: async () => {
        await enableTrial()
        await checkPlanStatus()
      },
      //
      SIGN_OUT: () =>
        figma.ui.postMessage({
          type: 'SIGN_OUT',
          data: {
            connectionStatus: 'UNCONNECTED',
            userFullName: '',
            userAvatar: '',
            userId: undefined,
            accessToken: undefined,
            refreshToken: undefined,
          },
        }),
    }

    return actions[msg.type]?.()
  }

  // Listeners
  figma.on('currentpagechange', () => getPalettesOnCurrentPage())
}

export default loadUI
