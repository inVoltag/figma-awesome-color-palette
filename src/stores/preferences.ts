import { atom } from 'nanostores'

export const $isWCAGDisplayed = atom<boolean>(true)
export const $isAPCADisplayed = atom<boolean>(true)
export const $isPaletteDeepSync = atom<boolean>(false)
export const $areVariablesDeepSync = atom<boolean>(false)
export const $areStylesDeepSync = atom<boolean>(false)
