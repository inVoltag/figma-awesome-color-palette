import {
  Button,
  ConsentConfiguration,
  HexModel,
  Message,
  SectionTitle,
} from '@a_ng_d/figmug-ui'
import React from 'react'
import { uid } from 'uid'

import { locals } from '../../content/locals'
import {
  EditorType,
  HoveredColor,
  Language,
  PlanStatus,
  SelectedColor,
} from '../../types/app'
import {
  PresetConfiguration,
  ScaleConfiguration,
  ThemeConfiguration,
} from '../../types/configurations'
import { ThemesMessage } from '../../types/messages'
import { ActionsList, DispatchProcess } from '../../types/models'
import { Identity } from '../../types/user'
import doLightnessScale from '../../utils/doLightnessScale'
import { trackColorThemesManagementEvent } from '../../utils/eventsTracker'
import isBlocked from '../../utils/isBlocked'
import type { AppStates } from '../App'
import ThemeItem from '../components/ThemeItem'
import Actions from '../modules/Actions'
import Dispatcher from '../modules/Dispatcher'

interface ThemesProps {
  preset: PresetConfiguration
  scale: ScaleConfiguration
  themes: Array<ThemeConfiguration>
  identity?: Identity
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  editorType: EditorType
  lang: Language
  figmaUserId: string
  onChangeThemes: React.Dispatch<Partial<AppStates>>
  onSyncLocalStyles: () => void
  onSyncLocalVariables: () => void
  onPublishPalette: () => void
}

interface ThemesStates {
  selectedElement: SelectedColor
  hoveredElement: HoveredColor
}

export default class Themes extends React.Component<ThemesProps, ThemesStates> {
  themesMessage: ThemesMessage
  dispatch: { [key: string]: DispatchProcess }
  listRef: React.RefObject<HTMLUListElement>

  constructor(props: ThemesProps) {
    super(props)
    this.themesMessage = {
      type: 'UPDATE_THEMES',
      data: [],
      isEditedInRealTime: false,
    }
    this.dispatch = {
      themes: new Dispatcher(
        () => parent.postMessage({ pluginMessage: this.themesMessage }, '*'),
        500
      ) as DispatchProcess,
    }
    this.state = {
      selectedElement: {
        id: undefined,
        position: 0,
      },
      hoveredElement: {
        id: undefined,
        hasGuideAbove: false,
        hasGuideBelow: false,
        position: 0,
      },
    }
    this.listRef = React.createRef()
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  // Lifecycle
  componentDidMount = () =>
    document.addEventListener('mousedown', this.handleClickOutside)

  componentWillUnmount = () =>
    document.removeEventListener('mousedown', this.handleClickOutside)

  handleClickOutside = (e: Event) => {
    if (this.listRef.current !== null)
      if (
        this.listRef &&
        !this.listRef.current.contains(e.target as HTMLElement)
      )
        this.setState({
          selectedElement: {
            id: undefined,
            position: 0,
          },
        })
  }

  // Handlers
  themesHandler = (e: any) => {
    let id: string | null
    const element: HTMLElement | null = (e.target as HTMLElement).closest(
        '.list__item'
      ),
      currentElement = e.currentTarget as HTMLInputElement

    element !== null ? (id = element.getAttribute('data-id')) : (id = null)

    this.themesMessage.isEditedInRealTime = false

    const addTheme = () => {
      const hasAlreadyNewUITheme = this.themesMessage.data.filter((color) =>
        color.name.includes('New UI Theme')
      )

      this.themesMessage.data = this.props.themes.map((theme) => {
        theme.isEnabled = false
        return theme
      })
      this.themesMessage.data.push({
        name: `New UI Theme ${hasAlreadyNewUITheme.length + 1}`,
        description: '',
        scale: doLightnessScale(
          this.props.preset.scale,
          this.props.preset.min === undefined ? 10 : this.props.preset.min,
          this.props.preset.max === undefined ? 90 : this.props.preset.max
        ),
        paletteBackground: '#FFFFFF',
        isEnabled: true,
        id: uid(),
        type: 'custom theme',
      })

      this.props.onChangeThemes({
        scale:
          this.themesMessage.data.find((theme) => theme.isEnabled)?.scale ?? {},
        themes: this.themesMessage.data,
        onGoingStep: 'themes changed',
      })

      parent.postMessage({ pluginMessage: this.themesMessage }, '*')
      trackColorThemesManagementEvent(
        this.props.figmaUserId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'ADD_THEME',
        }
      )
    }

    const renameTheme = () => {
      const hasSameName = this.props.themes.filter(
        (color) => color.name === currentElement.value
      )

      this.themesMessage.data = this.props.themes.map((item) => {
        if (item.id === id)
          item.name =
            hasSameName.length > 1
              ? currentElement.value + ' 2'
              : currentElement.value
        return item
      })

      this.props.onChangeThemes({
        scale:
          this.themesMessage.data.find((theme) => theme.isEnabled)?.scale ?? {},
        themes: this.themesMessage.data,
        onGoingStep: 'themes changed',
      })

      if (e.type === 'blur' || e.code === 'Enter') {
        parent.postMessage({ pluginMessage: this.themesMessage }, '*')
        trackColorThemesManagementEvent(
          this.props.figmaUserId,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'RENAME_THEME',
          }
        )
      }
    }

    const updatePaletteBackgroundColor = () => {
      const code: HexModel =
        currentElement.value.indexOf('#') === -1
          ? '#' + currentElement.value
          : currentElement.value

      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(code)) {
        this.themesMessage.data = this.props.themes.map((item) => {
          if (item.id === id) item.paletteBackground = code
          return item
        })

        this.props.onChangeThemes({
          scale:
            this.themesMessage.data.find((theme) => theme.isEnabled)?.scale ??
            {},
          themes: this.themesMessage.data,
          onGoingStep: 'themes changed',
        })
      }

      if (e.type === 'blur') {
        this.dispatch.themes.on.status = false
        parent.postMessage({ pluginMessage: this.themesMessage }, '*')
        trackColorThemesManagementEvent(
          this.props.figmaUserId,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'UPDATE_BACKGROUND',
          }
        )
      } else {
        this.themesMessage.isEditedInRealTime = true
        this.dispatch.themes.on.status = true
      }
    }

    const updateThemeDescription = () => {
      this.themesMessage.data = this.props.themes.map((item) => {
        if (item.id === id) item.description = currentElement.value
        return item
      })

      this.props.onChangeThemes({
        scale:
          this.themesMessage.data.find((theme) => theme.isEnabled)?.scale ?? {},
        themes: this.themesMessage.data,
        onGoingStep: 'themes changed',
      })

      if (e.type === 'blur' || e.key === 'Enter') {
        parent.postMessage({ pluginMessage: this.themesMessage }, '*')
        trackColorThemesManagementEvent(
          this.props.figmaUserId,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'DESCRIBE_THEME',
          }
        )
      }
    }

    const removeTheme = () => {
      this.themesMessage.data = this.props.themes.filter(
        (item) => item.id !== id
      )
      if (this.themesMessage.data.length > 1)
        this.themesMessage.data.filter(
          (item) => item.type === 'custom theme'
        )[0].isEnabled = true
      else {
        const result = this.themesMessage.data.find(
          (item) => item.type === 'default theme'
        )
        if (result !== undefined) result.isEnabled = true
      }

      this.props.onChangeThemes({
        scale:
          this.themesMessage.data.find((theme) => theme.isEnabled)?.scale ?? {},
        themes: this.themesMessage.data,
        onGoingStep: 'themes changed',
      })

      parent.postMessage({ pluginMessage: this.themesMessage }, '*')
      trackColorThemesManagementEvent(
        this.props.figmaUserId,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'REMOVE_THEME',
        }
      )
    }

    const actions: ActionsList = {
      ADD_THEME: () => addTheme(),
      RENAME_THEME: () => renameTheme(),
      UPDATE_PALETTE_BACKGROUND: () => updatePaletteBackgroundColor(),
      UPDATE_DESCRIPTION: () => updateThemeDescription(),
      REMOVE_THEME: () => removeTheme(),
      NULL: () => null,
    }

    return actions[currentElement.dataset.feature ?? 'NULL']?.()
  }

  orderHandler = () => {
    const source: SelectedColor = this.state.selectedElement,
      target: HoveredColor = this.state.hoveredElement,
      themes = this.props.themes.map((el) => el)

    let position: number | undefined

    const colorsWithoutSource = themes.splice(source.position, 1)[0]

    if (target.hasGuideAbove && target.position > source.position)
      position = target.position - 1
    else if (target.hasGuideBelow && target.position > source.position)
      position = target.position
    else if (target.hasGuideAbove && target.position < source.position)
      position = target.position
    else if (target.hasGuideBelow && target.position < source.position)
      position = target.position + 1
    else position = target.position

    themes.splice(position, 0, colorsWithoutSource)
    this.props.onChangeThemes({
      scale: themes.find((theme) => theme.isEnabled)?.scale ?? {},
      themes: themes,
      onGoingStep: 'themes changed',
    })
    parent.postMessage(
      {
        pluginMessage: {
          type: 'UPDATE_THEMES',
          data: themes,
          isEditedInRealTime: false,
        },
      },
      '*'
    )
  }

  selectionHandler: React.MouseEventHandler<HTMLLIElement> &
    React.MouseEventHandler<Element> &
    React.FocusEventHandler<HTMLInputElement> = (e) => {
    const target = e.currentTarget as HTMLElement
    if ((e.target as HTMLElement).dataset.feature !== undefined) return
    this.setState({
      selectedElement: {
        id: target.dataset.id,
        position: parseFloat(target.dataset.position ?? '0'),
      },
    })
  }

  dragHandler = (
    id: string | undefined,
    hasGuideAbove: boolean,
    hasGuideBelow: boolean,
    position: number
  ) => {
    this.setState({
      hoveredElement: {
        id: id,
        hasGuideAbove: hasGuideAbove,
        hasGuideBelow: hasGuideBelow,
        position: position,
      },
    })
  }

  dropOutsideHandler = (e: React.DragEvent<HTMLLIElement>) => {
    const target = e.target,
      parent: ParentNode =
        (target as HTMLElement).parentNode ?? (target as HTMLElement),
      scrollY: number = (parent.parentNode?.parentNode as HTMLElement)
        .scrollTop,
      parentRefTop: number = (parent as HTMLElement).offsetTop,
      parentRefBottom: number =
        parentRefTop + (parent as HTMLElement).clientHeight

    if (e.pageY + scrollY < parentRefTop) this.orderHandler()
    else if (e.pageY + scrollY > parentRefBottom) this.orderHandler()
  }

  // Direct actions
  onAddTheme = () => {
    const hasAlreadyNewUITheme = this.themesMessage.data.filter((color) =>
      color.name.includes('New UI Theme')
    )
    this.themesMessage.data = this.props.themes.map((theme) => {
      theme.isEnabled = false
      return theme
    })
    this.themesMessage.data.push({
      name: `New UI Theme ${hasAlreadyNewUITheme.length + 1}`,
      description: '',
      scale: doLightnessScale(
        this.props.preset.scale,
        this.props.preset.min === undefined ? 10 : this.props.preset.min,
        this.props.preset.max === undefined ? 90 : this.props.preset.max
      ),
      paletteBackground: '#FFFFFF',
      isEnabled: true,
      id: uid(),
      type: 'custom theme',
    })
    this.props.onChangeThemes({
      scale:
        this.themesMessage.data.find((theme) => theme.isEnabled)?.scale ?? {},
      themes: this.themesMessage.data,
      onGoingStep: 'themes changed',
    })

    parent.postMessage({ pluginMessage: this.themesMessage }, '*')
    trackColorThemesManagementEvent(
      this.props.figmaUserId,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'ADD_THEME_FROM_DROPDOWN',
      }
    )
  }

  // Render
  render() {
    return (
      <div className="controls__control">
        <div className="control__block control__block--list">
          <div className="section-controls">
            <div className="section-controls__left-part">
              <SectionTitle
                label={locals[this.props.lang].themes.title}
                indicator={(this.props.themes.length - 1).toString()}
              />
            </div>
            <div className="section-controls__right-part">
              <Button
                type="icon"
                icon="plus"
                isBlocked={isBlocked('THEMES', this.props.planStatus)}
                isDisabled={isBlocked('THEMES', this.props.planStatus)}
                feature="ADD_THEME"
                action={
                  isBlocked('THEMES', this.props.planStatus)
                    ? () => null
                    : this.themesHandler
                }
              />
            </div>
          </div>
          {this.props.themes.length === 1 ? (
            <div className="onboarding__callout--centered">
              <Message
                icon="theme"
                messages={[locals[this.props.lang].themes.callout.message]}
              />
              <div className="onboarding__actions">
                <Button
                  type="primary"
                  feature="ADD_THEME"
                  label={locals[this.props.lang].themes.callout.cta}
                  isBlocked={isBlocked('THEMES', this.props.planStatus)}
                  isDisabled={isBlocked('THEMES', this.props.planStatus)}
                  action={
                    isBlocked('THEMES', this.props.planStatus)
                      ? () => null
                      : this.themesHandler
                  }
                />
              </div>
            </div>
          ) : (
            <ul
              className="list"
              ref={this.listRef}
            >
              {this.props.themes.map((theme, index) => {
                if (theme.type !== 'default theme')
                  return (
                    <ThemeItem
                      key={theme.id}
                      name={theme.name}
                      description={theme.description}
                      index={index}
                      paletteBackground={theme.paletteBackground}
                      uuid={theme.id}
                      selected={
                        this.state.selectedElement.id === theme.id
                          ? true
                          : false
                      }
                      guideAbove={
                        this.state.hoveredElement.id === theme.id
                          ? this.state.hoveredElement.hasGuideAbove
                          : false
                      }
                      guideBelow={
                        this.state.hoveredElement.id === theme.id
                          ? this.state.hoveredElement.hasGuideBelow
                          : false
                      }
                      lang={this.props.lang}
                      onChangeThemes={(e) => this.themesHandler(e)}
                      onChangeSelection={this.selectionHandler}
                      onCancellationSelection={this.selectionHandler}
                      onDragChange={this.dragHandler}
                      onDropOutside={this.dropOutsideHandler}
                      onChangeOrder={this.orderHandler}
                    />
                  )
              })}
            </ul>
          )}
        </div>
        <Actions
          context="DEPLOY"
          {...this.props}
        />
      </div>
    )
  }
}
