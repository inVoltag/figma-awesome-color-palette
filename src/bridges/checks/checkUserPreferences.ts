const checkUserPreferences = async () => {
  const isWCAGDisplayed =
    await figma.clientStorage.getAsync('is_wcag_displayed')
  const isAPCADisplayed =
    await figma.clientStorage.getAsync('is_apca_displayed')
  const canDeepSyncPalette = await figma.clientStorage.getAsync(
    'can_deep_sync_palette'
  )
  const canDeepSyncVariables = await figma.clientStorage.getAsync(
    'can_deep_sync_variables'
  )
  const canDeepSyncStyles = await figma.clientStorage.getAsync(
    'can_deep_sync_styles'
  )
  const isVsCodeMessageDisplayed = await figma.clientStorage.getAsync(
    'is_vs_code_displayed'
  )

  if (isWCAGDisplayed === undefined)
    await figma.clientStorage.setAsync('is_wcag_displayed', true)

  if (isAPCADisplayed === undefined)
    await figma.clientStorage.setAsync('is_apca_displayed', true)

  if (canDeepSyncPalette === undefined)
    await figma.clientStorage.setAsync('can_deep_sync_palette', false)

  if (canDeepSyncVariables === undefined)
    await figma.clientStorage.setAsync('can_deep_sync_variables', false)

  if (canDeepSyncStyles === undefined)
    await figma.clientStorage.setAsync('can_deep_sync_styles', false)

  if (isVsCodeMessageDisplayed === undefined)
    await figma.clientStorage.setAsync('is_vs_code_displayed', true)

  figma.ui.postMessage({
    type: 'CHECK_USER_PREFERENCES',
    data: {
      isWCAGDisplayed: isWCAGDisplayed ?? true,
      isAPCADisplayed: isAPCADisplayed ?? true,
      canDeepSyncPalette: canDeepSyncPalette ?? false,
      canDeepSyncVariables: canDeepSyncVariables ?? false,
      canDeepSyncStyles: canDeepSyncStyles ?? false,
      isVsCodeMessageDisplayed: isVsCodeMessageDisplayed ?? true,
    },
  })

  return true
}

export default checkUserPreferences
