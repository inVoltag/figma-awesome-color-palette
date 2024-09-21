import { Easing, EditorType } from './app'
import {
  ColorSpaceConfiguration,
  NamingConventionConfiguration,
} from './configurations'

export interface EditorEvent {
  editor: EditorType
}

export interface TrialEvent {
  date: number
  trialTime: number
}

export interface PublicationEvent {
  feature:
    | 'PUBLISH_PALETTE'
    | 'UNPUBLISH_PALETTE'
    | 'PUSH_PALETTE'
    | 'PULL_PALETTE'
    | 'REUSE_PALETTE'
    | 'SYNC_PALETTE'
    | 'REVERT_PALETTE'
    | 'DETACH_PALETTE'
    | 'ADD_PALETTE'
    | 'SHARE_PALETTE'
}

export interface ImportEvent {
  feature: 'IMPORT_COOLORS' | 'IMPORT_REALTIME_COLORS' | 'IMPORT_COLOUR_LOVERS'
}

export interface ScaleEvent {
  feature:
    | 'SWITCH_MATERIAL'
    | 'SWITCH_MATERIAL_3'
    | 'SWITCH_TAILWIND'
    | 'SWITCH_ANT'
    | 'SWITCH_ADS'
    | 'SWITCH_ADS_NEUTRAL'
    | 'SWITCH_CARBON'
    | 'SWITCH_BASE'
    | 'SWITCH_CUSTOM'
    | 'OPEN_KEYBOARD_SHORTCUTS'
    | NamingConventionConfiguration
    | Easing
}

export interface SourceColorEvent {
  feature:
    | 'RENAME_COLOR'
    | 'REMOVE_COLOR'
    | 'ADD_COLOR'
    | 'UPDATE_HEX'
    | 'UPDATE_LCH'
    | 'SHIFT_HUE'
    | 'SHIFT_CHROMA'
    | 'DESCRIBE_COLOR'
    | 'REORDER_COLOR'
}

export interface ColorThemeEvent {
  feature:
    | 'RENAME_THEME'
    | 'REMOVE_THEME'
    | 'ADD_THEME'
    | 'ADD_THEME_FROM_DROPDOWN'
    | 'UPDATE_BACKGROUND'
    | 'DESCRIBE_THEME'
    | 'REORDER_THEME'
}

export interface ExportEvent {
  feature:
    | 'TOKENS_GLOBAL'
    | 'TOKENS_AMZN_STYLE_DICTIONARY'
    | 'TOKENS_TOKENS_STUDIO'
    | 'CSS'
    | 'TAILWIND'
    | 'APPLE_SWIFTUI'
    | 'APPLE_UIKIT'
    | 'ANDROID_COMPOSE'
    | 'ANDROID_XML'
    | 'CSV'
  colorSpace?: ColorSpaceConfiguration
}

export interface SettingEvent {
  feature:
    | 'RENAME_PALETTE'
    | 'DESCRIBE_PALETTE'
    | 'UPDATE_VIEW'
    | 'UPDATE_COLOR_SPACE'
    | 'UPDATE_VISION_SIMULATION_MODE'
    | 'UPDATE_ALGORITHM'
    | 'UPDATE_TEXT_COLORS_THEME'
}

export interface ActionEvent {
  feature: 'CREATE_PALETTE' | 'SYNC_STYLES' | 'SYNC_VARIABLES'
}
