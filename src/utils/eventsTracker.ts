import { ConsentConfiguration } from '@a_ng_d/figmug-ui'
import mixpanel from 'mixpanel-figma'

import { userConsentVersion } from '../config'
import {
  ActionEvent,
  ColorThemeEvent,
  EditorEvent,
  ExportEvent,
  ImportEvent,
  PublicationEvent,
  ScaleEvent,
  SettingEvent,
  SourceColorEvent,
  TrialEvent,
} from '../types/events'

const eventsRecurringProperties = {
  Env: process.env.NODE_ENV === 'development' ? 'Dev' : 'Prod',
}

export const trackRunningEvent = (id: string, consent: boolean) => {
  if (!consent) return
  mixpanel.identify(id)
  mixpanel.track('Plugin Run', { ...eventsRecurringProperties })
}

export const trackUserConsentEvent = (consent: Array<ConsentConfiguration>) => {
  mixpanel.track('Consent Proof Sent', {
    'User Consent Version': userConsentVersion,
    Consent: consent.map((c) => {
      return { [c.name]: c.isConsented }
    }),
    ...eventsRecurringProperties,
  })
}

export const trackEditorEvent = (
  id: string,
  consent: boolean,
  options: EditorEvent
) => {
  if (!consent) return
  mixpanel.identify(id)
  mixpanel.track('Editor Run', {
    Editor: options.editor,
    ...eventsRecurringProperties,
  })
}

export const trackSignInEvent = (id: string, consent: boolean) => {
  if (!consent) return
  mixpanel.identify(id)
  mixpanel.track('Signed In', { ...eventsRecurringProperties })
}

export const trackSignOutEvent = (id: string, consent: boolean) => {
  if (!consent) return
  mixpanel.identify(id)
  mixpanel.track('Signed Out', { ...eventsRecurringProperties })
}

export const trackTrialEnablementEvent = (
  id: string,
  consent: boolean,
  options: TrialEvent
) => {
  if (!consent) return
  mixpanel.identify(id)
  mixpanel.track('Trial Enabled', {
    'Trial Start Date': new Date(options.date).toISOString(),
    'Trial End Date': new Date(
      options.date + options.trialTime * 3600 * 1000
    ).toISOString(),
    'Trail Time': options.trialTime + ' hours',
    'Trial Version': '3.2.0',
    ...eventsRecurringProperties,
  })
}

export const trackPurchaseEvent = (id: string, consent: boolean) => {
  if (!consent) return
  mixpanel.identify(id)
  mixpanel.track('Purchase Enabled', { ...eventsRecurringProperties })
}

export const trackPublicationEvent = (
  id: string,
  consent: boolean,
  options: PublicationEvent
) => {
  if (!consent) return
  mixpanel.identify(id)
  mixpanel.track('Palette Managed', {
    Feature: options.feature,
    ...eventsRecurringProperties,
  })
}

export const trackImportEvent = (
  id: string,
  consent: boolean,
  options: ImportEvent
) => {
  if (!consent) return
  mixpanel.identify(id)
  mixpanel.track('Colors Imported', {
    Feature: options.feature,
    ...eventsRecurringProperties,
  })
}

export const trackScaleManagementEvent = (
  id: string,
  consent: boolean,
  options: ScaleEvent
) => {
  if (!consent) return
  mixpanel.identify(id)
  mixpanel.track('Scale Updated', {
    Feature: options.feature,
    ...eventsRecurringProperties,
  })
}

export const trackSourceColorsManagementEvent = (
  id: string,
  consent: boolean,
  options: SourceColorEvent
) => {
  if (!consent) return
  mixpanel.identify(id)
  mixpanel.track('Source Color Updated', {
    Feature: options.feature,
    ...eventsRecurringProperties,
  })
}

export const trackColorThemesManagementEvent = (
  id: string,
  consent: boolean,
  options: ColorThemeEvent
) => {
  if (!consent) return
  mixpanel.identify(id)
  mixpanel.track('Color Theme Updated', {
    Feature: options.feature,
    ...eventsRecurringProperties,
  })
}

export const trackSettingsManagementEvent = (
  id: string,
  consent: boolean,
  options: SettingEvent
) => {
  if (!consent) return
  mixpanel.identify(id)
  mixpanel.track('Setting Updated', {
    Feature: options.feature,
    ...eventsRecurringProperties,
  })
}

export const trackExportEvent = (
  id: string,
  consent: boolean,
  options: ExportEvent
) => {
  if (!consent) return
  mixpanel.identify(id)
  mixpanel.track('Color Shades Exported', {
    Feature: options.feature,
    'Color Space': options.colorSpace ?? 'NC',
    ...eventsRecurringProperties,
  })
}

export const trackActionEvent = (
  id: string,
  consent: boolean,
  options: ActionEvent
) => {
  if (!consent) return
  mixpanel.identify(id)
  mixpanel.track('Action Triggered', {
    Feature: options.feature,
    ...eventsRecurringProperties,
  })
}
