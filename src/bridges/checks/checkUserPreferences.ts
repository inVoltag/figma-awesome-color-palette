const checkUserPreferences = async () => {
  const canDeepSyncPalette = await figma.clientStorage.getAsync(
    'can_deep_sync_palette'
  )
  const canDeepSyncVariables = await figma.clientStorage.getAsync(
    'can_deep_sync_variables'
  )
  const canDeepSyncStyles = await figma.clientStorage.getAsync(
    'can_deep_sync_styles'
  )

  if (canDeepSyncPalette === undefined)
    await figma.clientStorage.setAsync('can_deep_sync_palette', false)

  if (canDeepSyncVariables === undefined)
    await figma.clientStorage.setAsync('can_deep_sync_variables', false)

  if (canDeepSyncStyles === undefined)
    await figma.clientStorage.setAsync('can_deep_sync_styles', false)

  figma.ui.postMessage({
    type: 'CHECK_USER_PREFERENCES',
    data: {
      canDeepSyncPalette: canDeepSyncPalette ?? false,
      canDeepSyncVariables: canDeepSyncVariables ?? false,
      canDeepSyncStyles: canDeepSyncStyles ?? false,
    },
  })

  return true
}

export default checkUserPreferences
