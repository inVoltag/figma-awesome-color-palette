import { Context } from './app'

export interface SelectedColor {
  id: string | undefined
  position: number
}

export interface HoveredColor extends SelectedColor {
  hasGuideAbove: boolean
  hasGuideBelow: boolean
}

export type PriorityContext =
  | 'EMPTY'
  | 'FEEDBACK'
  | 'TRIAL_FEEDBACK'
  | 'HIGHLIGHT'
  | 'WELCOME_TO_PRO'
  | 'WELCOME_TO_TRIAL'
  | 'TRY'
  | 'ABOUT'
  | 'PUBLICATION'
  | 'REPORT'

export type ThirdParty = 'COOLORS' | 'REALTIME_COLORS' | 'COLOUR_LOVERS'

export type Easing = 'LINEAR' | 'EASE_IN' | 'EASE_OUT' | 'EASE_IN_OUT'

export interface ImportUrl {
  value: string
  state: 'DEFAULT' | 'ERROR' | undefined
  canBeSubmitted: boolean
  helper:
    | {
        type: 'INFO' | 'ERROR'
        message: string
      }
    | undefined
}

export interface ContextItem {
  label: string
  id: Context
  isUpdated: boolean
  isActive: boolean
}

export type FetchStatus =
  | 'UNLOADED'
  | 'LOADING'
  | 'LOADED'
  | 'ERROR'
  | 'EMPTY'
  | 'COMPLETE'
  | 'SIGN_IN_FIRST'
  | 'NO_RESULT'

export type HighlightStatus =
  | 'NO_HIGHLIGHT'
  | 'DISPLAY_HIGHLIGHT_NOTIFICATION'
  | 'DISPLAY_HIGHLIGHT_DIALOG'
