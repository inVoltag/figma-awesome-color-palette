import { atom } from 'nanostores'

export const $isWCAGDisplayed = atom<boolean>(true)
export const $isAPCADisplayed = atom<boolean>(true)
export const $canPaletteDeepSync = atom<boolean>(false)
export const $canVariablesDeepSync = atom<boolean>(false)
export const $canStylesDeepSync = atom<boolean>(false)
export const $isVsCodeMessageDisplayed = atom<boolean>(true)
