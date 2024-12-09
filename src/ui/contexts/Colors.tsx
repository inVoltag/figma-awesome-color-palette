import {
  Button,
  ConsentConfiguration,
  FormItem,
  HexModel,
  Input,
  InputsBar,
  SectionTitle,
  SemanticMessage,
  SortableList,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import chroma from 'chroma-js'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { uid } from 'uid'

import { locals } from '../../content/locals'
import { EditorType, Language, PlanStatus } from '../../types/app'
import {
  ColorConfiguration,
  UserConfiguration,
} from '../../types/configurations'
import { ColorsMessage } from '../../types/messages'
import { ActionsList, DispatchProcess } from '../../types/models'
import features from '../../config'
import { trackSourceColorsManagementEvent } from '../../utils/eventsTracker'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import Actions from '../modules/Actions'
import Dispatcher from '../modules/Dispatcher'

interface ColorsProps {
  colors: Array<ColorConfiguration>
  editorType: EditorType
  userIdentity: UserConfiguration
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  lang: Language
  onChangeColors: React.Dispatch<Partial<AppStates>>
  onSyncLocalStyles: () => void
  onSyncLocalVariables: () => void
  onPublishPalette: () => void
}

export default class Colors extends PureComponent<ColorsProps> {
  colorsMessage: ColorsMessage
  dispatch: { [key: string]: DispatchProcess }

  static features = (planStatus: PlanStatus) => ({
    COLORS_NAME: new FeatureStatus({
      features: features,
      featureName: 'COLORS_NAME',
      planStatus: planStatus,
    }),
    COLORS_PARAMS: new FeatureStatus({
      features: features,
      featureName: 'COLORS_PARAMS',
      planStatus: planStatus,
    }),
    COLORS_HUE_SHIFTING: new FeatureStatus({
      features: features,
      featureName: 'COLORS_HUE_SHIFTING',
      planStatus: planStatus,
    }),
    COLORS_CHROMA_SHIFTING: new FeatureStatus({
      features: features,
      featureName: 'COLORS_CHROMA_SHIFTING',
      planStatus: planStatus,
    }),
    COLORS_DESCRIPTION: new FeatureStatus({
      features: features,
      featureName: 'COLORS_DESCRIPTION',
      planStatus: planStatus,
    }),
  })

  constructor(props: ColorsProps) {
    super(props)
    this.colorsMessage = {
      type: 'UPDATE_COLORS',
      data: [],
      isEditedInRealTime: false,
    }
    this.dispatch = {
      colors: new Dispatcher(
        () => parent.postMessage({ pluginMessage: this.colorsMessage }, '*'),
        500
      ) as DispatchProcess,
    }
  }

  // Handlers
  colorsHandler = (e: Event) => {
    let id: string | null
    const element: HTMLElement | null = (e.target as HTMLElement).closest(
        '.draggable-item'
      ),
      currentElement = e.currentTarget as HTMLInputElement

    element !== null ? (id = element.getAttribute('data-id')) : (id = null)

    this.colorsMessage.isEditedInRealTime = false

    const addColor = () => {
      const hasAlreadyNewUIColor = this.props.colors.filter((color) =>
        color.name.includes(locals[this.props.lang].colors.new)
      )

      this.colorsMessage.data = this.props.colors
      this.colorsMessage.data.push({
        name: `${locals[this.props.lang].colors.new} ${hasAlreadyNewUIColor.length + 1}`,
        description: '',
        rgb: {
          r: 0.53,
          g: 0.92,
          b: 0.97,
        },
        id: uid(),
        oklch: false,
        hueShifting: 0,
        chromaShifting: 100,
      })

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'ADD_COLOR',
        }
      )
    }

    const renameColor = () => {
      const hasSameName = this.props.colors.filter(
        (color) => color.name === currentElement.value
      )

      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id)
          item.name =
            hasSameName.length > 1
              ? currentElement.value + ' 2'
              : currentElement.value
        return item
      })

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      if (e.type === 'focusout' || (e as KeyboardEvent).key === 'Enter') {
        parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
        trackSourceColorsManagementEvent(
          this.props.userIdentity.id,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'RENAME_COLOR',
          }
        )
      }
    }

    const updateHexCode = () => {
      const code: HexModel =
        currentElement.value.indexOf('#') === -1
          ? '#' + currentElement.value
          : currentElement.value

      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(code)) {
        this.colorsMessage.data = this.props.colors.map((item) => {
          const rgb = chroma(
            currentElement.value.indexOf('#') === -1
              ? '#' + currentElement.value
              : currentElement.value
          ).rgb()
          if (item.id === id)
            item.rgb = {
              r: rgb[0] / 255,
              g: rgb[1] / 255,
              b: rgb[2] / 255,
            }
          return item
        })

        this.props.onChangeColors({
          colors: this.colorsMessage.data,
          onGoingStep: 'colors changed',
        })
      }

      if (e.type === 'focusout') {
        this.dispatch.colors.on.status = false
        parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
        trackSourceColorsManagementEvent(
          this.props.userIdentity.id,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'UPDATE_HEX',
          }
        )
      } else {
        this.colorsMessage.isEditedInRealTime = true
        this.dispatch.colors.on.status = true
      }
    }

    const updateLightnessProp = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        const rgb = chroma(item.rgb.r * 255, item.rgb.g * 255, item.rgb.b * 255)
          .set('lch.l', currentElement.value)
          .rgb()
        if (item.id === id)
          item.rgb = {
            r: rgb[0] / 255,
            g: rgb[1] / 255,
            b: rgb[2] / 255,
          }
        return item
      })

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_LCH',
        }
      )
    }

    const updateChromaProp = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        const rgb = chroma(item.rgb.r * 255, item.rgb.g * 255, item.rgb.b * 255)
          .set('lch.c', currentElement.value)
          .rgb()
        if (item.id === id)
          item.rgb = {
            r: rgb[0] / 255,
            g: rgb[1] / 255,
            b: rgb[2] / 255,
          }
        return item
      })

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_LCH',
        }
      )
    }

    const updateHueProp = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        const rgb = chroma(item.rgb.r * 255, item.rgb.g * 255, item.rgb.b * 255)
          .set('lch.h', currentElement.value)
          .rgb()
        if (item.id === id)
          item.rgb = {
            r: rgb[0] / 255,
            g: rgb[1] / 255,
            b: rgb[2] / 255,
          }
        return item
      })

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_LCH',
        }
      )
    }

    const setHueShifting = () => {
      const max = parseFloat(currentElement.max),
        min = parseFloat(currentElement.min)
      let value = parseFloat(currentElement.value)

      if (value >= max) value = max
      if (value <= min) value = min

      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) item.hueShifting = value
        return item
      })

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SHIFT_HUE',
        }
      )
    }

    const setChromaShifting = () => {
      const max = parseFloat(currentElement.max),
        min = parseFloat(currentElement.min)
      let value = parseFloat(currentElement.value)

      if (value >= max) value = max
      if (value <= min) value = min

      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) item.chromaShifting = value
        return item
      })

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SHIFT_CHROMA',
        }
      )
    }

    const updateColorDescription = () => {
      this.colorsMessage.data = this.props.colors.map((item) => {
        if (item.id === id) item.description = currentElement.value
        return item
      })

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      if (e.type === 'focusout') {
        parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
        trackSourceColorsManagementEvent(
          this.props.userIdentity.id,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'DESCRIBE_COLOR',
          }
        )
      }
    }

    const removeColor = () => {
      this.colorsMessage.data = this.props.colors.filter(
        (item) => item.id !== id
      )

      this.props.onChangeColors({
        colors: this.colorsMessage.data,
        onGoingStep: 'colors changed',
      })

      parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
      trackSourceColorsManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'REMOVE_COLOR',
        }
      )
    }

    const actions: ActionsList = {
      ADD_COLOR: () => addColor(),
      UPDATE_HEX: () => updateHexCode(),
      RENAME_COLOR: () => renameColor(),
      UPDATE_LIGHTNESS: () => updateLightnessProp(),
      UPDATE_CHROMA: () => updateChromaProp(),
      UPDATE_HUE: () => updateHueProp(),
      SHIFT_HUE: () => setHueShifting(),
      SHIFT_CHROMA: () => setChromaShifting(),
      UPDATE_DESCRIPTION: () => updateColorDescription(),
      REMOVE_ITEM: () => removeColor(),
      DEFAULT: () => null,
    }

    return actions[currentElement.dataset.feature ?? 'DEFAULT']?.()
  }

  // Direct actions
  onChangeOrder = (colors: Array<ColorConfiguration>) => {
    this.colorsMessage.data = colors

    this.props.onChangeColors({
      colors: this.colorsMessage.data,
      onGoingStep: 'colors changed',
    })

    parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
    trackSourceColorsManagementEvent(
      this.props.userIdentity.id,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'REORDER_COLOR',
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
                label={locals[this.props.lang].colors.title}
                indicator={this.props.colors.length.toString()}
              />
            </div>
            <div className="section-controls__right-part">
              <Button
                type="icon"
                icon="plus"
                feature="ADD_COLOR"
                action={(e: Event) => this.colorsHandler(e)}
              />
            </div>
          </div>
          {this.props.colors.length === 0 ? (
            <div className="callout--centered">
              <SemanticMessage
                type="NEUTRAL"
                message={locals[this.props.lang].colors.callout.message}
                orientation="VERTICAL"
                actionsSlot={
                  <Button
                    type="primary"
                    feature="ADD_COLOR"
                    label={locals[this.props.lang].colors.callout.cta}
                    action={(e: Event) => this.colorsHandler(e)}
                  />
                }
              />
            </div>
          ) : (
            <SortableList<ColorConfiguration>
              data={this.props.colors}
              primarySlot={this.props.colors.map((color) => {
                const hex = chroma([
                    color.rgb.r * 255,
                    color.rgb.g * 255,
                    color.rgb.b * 255,
                  ]).hex(),
                  lch = chroma([
                    color.rgb.r * 255,
                    color.rgb.g * 255,
                    color.rgb.b * 255,
                  ]).lch()

                return (
                  <>
                    <Feature
                      isActive={Colors.features(
                        this.props.planStatus
                      ).COLORS_NAME.isActive()}
                    >
                      <div className="draggable-list__param--compact">
                        <Input
                          type="TEXT"
                          value={color.name}
                          charactersLimit={24}
                          feature="RENAME_COLOR"
                          isBlocked={Colors.features(
                            this.props.planStatus
                          ).COLORS_NAME.isBlocked()}
                          isNew={Colors.features(
                            this.props.planStatus
                          ).COLORS_NAME.isNew()}
                          onBlur={this.colorsHandler}
                          onConfirm={this.colorsHandler}
                        />
                      </div>
                    </Feature>
                    <Feature
                      isActive={Colors.features(
                        this.props.planStatus
                      ).COLORS_PARAMS.isActive()}
                    >
                      <>
                        <div className="draggable-list__param--compact">
                          <Input
                            type="COLOR"
                            value={hex}
                            feature="UPDATE_HEX"
                            isBlocked={Colors.features(
                              this.props.planStatus
                            ).COLORS_PARAMS.isBlocked()}
                            isNew={Colors.features(
                              this.props.planStatus
                            ).COLORS_PARAMS.isNew()}
                            onChange={this.colorsHandler}
                            onBlur={this.colorsHandler}
                          />
                        </div>
                        <InputsBar
                          label={locals[this.props.lang].colors.lch.label}
                          customClassName="draggable-list__param"
                        >
                          <Input
                            type="NUMBER"
                            value={lch[0].toFixed(0)}
                            min="0"
                            max="100"
                            isBlocked={Colors.features(
                              this.props.planStatus
                            ).COLORS_PARAMS.isBlocked()}
                            feature="UPDATE_LIGHTNESS"
                            onBlur={this.colorsHandler}
                            onConfirm={this.colorsHandler}
                          />
                          <Input
                            type="NUMBER"
                            value={lch[1].toFixed(0)}
                            min="0"
                            max="100"
                            isBlocked={Colors.features(
                              this.props.planStatus
                            ).COLORS_PARAMS.isBlocked()}
                            feature="UPDATE_CHROMA"
                            onBlur={this.colorsHandler}
                            onConfirm={this.colorsHandler}
                          />
                          <Input
                            type="NUMBER"
                            value={
                              lch[2].toFixed(0) === 'NaN'
                                ? '0'
                                : lch[2].toFixed(0)
                            }
                            min="0"
                            max="360"
                            isBlocked={Colors.features(
                              this.props.planStatus
                            ).COLORS_PARAMS.isBlocked()}
                            feature="UPDATE_HUE"
                            onBlur={this.colorsHandler}
                            onConfirm={this.colorsHandler}
                          />
                        </InputsBar>
                      </>
                    </Feature>
                  </>
                )
              })}
              secondarySlot={this.props.colors.map((color) => (
                <>
                  <Feature
                    isActive={Colors.features(
                      this.props.planStatus
                    ).COLORS_HUE_SHIFTING.isActive()}
                  >
                    <div className="draggable-list__param">
                      <FormItem
                        id="hue-shifting"
                        label={locals[this.props.lang].colors.hueShifting.label}
                        isBlocked={Colors.features(
                          this.props.planStatus
                        ).COLORS_HUE_SHIFTING.isBlocked()}
                      >
                        <Input
                          id="hue-shifting"
                          type="NUMBER"
                          icon={{ type: 'LETTER', value: 'H' }}
                          unit="°"
                          value={
                            color.hueShifting !== undefined
                              ? color.hueShifting.toString()
                              : '100'
                          }
                          min="-360"
                          max="360"
                          feature="SHIFT_HUE"
                          isBlocked={Colors.features(
                            this.props.planStatus
                          ).COLORS_HUE_SHIFTING.isBlocked()}
                          isNew={Colors.features(
                            this.props.planStatus
                          ).COLORS_HUE_SHIFTING.isNew()}
                          onBlur={this.colorsHandler}
                          onConfirm={this.colorsHandler}
                        />
                      </FormItem>
                    </div>
                  </Feature>
                  <Feature
                    isActive={Colors.features(
                      this.props.planStatus
                    ).COLORS_CHROMA_SHIFTING.isActive()}
                  >
                    <div className="draggable-list__param">
                      <FormItem
                        id="chroma-shifting"
                        label={
                          locals[this.props.lang].colors.chromaShifting.label
                        }
                        isBlocked={Colors.features(
                          this.props.planStatus
                        ).COLORS_CHROMA_SHIFTING.isBlocked()}
                      >
                        <Input
                          id="chroma-shifting"
                          type="NUMBER"
                          icon={{ type: 'LETTER', value: 'C' }}
                          unit="%"
                          value={
                            color.chromaShifting !== undefined
                              ? color.chromaShifting.toString()
                              : '100'
                          }
                          min="0"
                          max="200"
                          feature="SHIFT_CHROMA"
                          isBlocked={Colors.features(
                            this.props.planStatus
                          ).COLORS_CHROMA_SHIFTING.isBlocked()}
                          isNew={Colors.features(
                            this.props.planStatus
                          ).COLORS_CHROMA_SHIFTING.isNew()}
                          onBlur={this.colorsHandler}
                          onConfirm={this.colorsHandler}
                        />
                      </FormItem>
                    </div>
                  </Feature>
                  <Feature
                    isActive={Colors.features(
                      this.props.planStatus
                    ).COLORS_DESCRIPTION.isActive()}
                  >
                    <div className="draggable-list__param">
                      <FormItem
                        id="color-description"
                        label={locals[this.props.lang].global.description.label}
                        isBlocked={Colors.features(
                          this.props.planStatus
                        ).COLORS_DESCRIPTION.isBlocked()}
                      >
                        <Input
                          id="color-description"
                          type="LONG_TEXT"
                          value={color.description}
                          placeholder={
                            locals[this.props.lang].global.description
                              .placeholder
                          }
                          feature="UPDATE_DESCRIPTION"
                          isBlocked={Colors.features(
                            this.props.planStatus
                          ).COLORS_DESCRIPTION.isBlocked()}
                          isNew={Colors.features(
                            this.props.planStatus
                          ).COLORS_DESCRIPTION.isNew()}
                          isGrowing={true}
                          onBlur={this.colorsHandler}
                          onConfirm={this.colorsHandler}
                        />
                      </FormItem>
                    </div>
                  </Feature>
                </>
              ))}
              isScrollable={true}
              onChangeSortableList={this.onChangeOrder}
              onRemoveItem={this.colorsHandler}
            />
          )}
        </div>
        <Actions
          {...this.props}
          context="DEPLOY"
        />
      </div>
    )
  }
}
