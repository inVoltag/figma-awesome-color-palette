import { Button, ConsentConfiguration, FormItem, HexModel, Input, InputsBar, Message, SectionTitle, SortableList } from '@a_ng_d/figmug-ui';
import chroma from 'chroma-js';
import React from 'react';
import { uid } from 'uid';



import { locals } from '../../content/locals';
import { EditorType, Language, PlanStatus } from '../../types/app';
import { ColorConfiguration } from '../../types/configurations';
import { ColorsMessage } from '../../types/messages';
import { ActionsList, DispatchProcess } from '../../types/models';
import { Identity } from '../../types/user';
import features from '../../utils/config';
import { trackSourceColorsManagementEvent } from '../../utils/eventsTracker';
import isBlocked from '../../utils/isBlocked';
import type { AppStates } from '../App';
import Feature from '../components/Feature';
import Actions from '../modules/Actions';
import Dispatcher from '../modules/Dispatcher';


interface ColorsProps {
  colors: Array<ColorConfiguration>
  editorType: EditorType
  identity?: Identity
  userConsent: Array<ConsentConfiguration>
  planStatus: PlanStatus
  lang: Language
  figmaUserId: string
  onChangeColors: React.Dispatch<Partial<AppStates>>
  onSyncLocalStyles: () => void
  onSyncLocalVariables: () => void
  onPublishPalette: () => void
}

export default class Colors extends React.Component<ColorsProps> {
  colorsMessage: ColorsMessage
  dispatch: { [key: string]: DispatchProcess }

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
  colorsHandler = (e: any) => {
    let id: string | null
    const element: HTMLElement | null = (e.target as HTMLElement).closest(
        '.draggable-item'
      ),
      currentElement: HTMLInputElement = e.currentTarget

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
        this.props.figmaUserId,
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

      if (e.type === 'blur' || e.code === 'Enter') {
        parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
        trackSourceColorsManagementEvent(
          this.props.figmaUserId,
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

      if (e.type === 'blur') {
        this.dispatch.colors.on.status = false
        parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
        trackSourceColorsManagementEvent(
          this.props.figmaUserId,
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
        this.props.figmaUserId,
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
        this.props.figmaUserId,
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
        this.props.figmaUserId,
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
        this.props.figmaUserId,
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
        this.props.figmaUserId,
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

      if (e.type === 'blur') {
        parent.postMessage({ pluginMessage: this.colorsMessage }, '*')
        trackSourceColorsManagementEvent(
          this.props.figmaUserId,
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
        this.props.figmaUserId,
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
      NULL: () => null,
    }

    return actions[currentElement.dataset.feature ?? 'NULL']?.()
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
      this.props.figmaUserId,
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
                action={(e) => this.colorsHandler(e)}
              />
            </div>
          </div>
          {this.props.colors.length === 0 ? (
            <div className="onboarding__callout--centered">
              <Message
                icon="list-tile"
                messages={[locals[this.props.lang].colors.callout.message]}
              />
              <div className="onboarding__actions">
                <Button
                  type="primary"
                  feature="ADD_COLOR"
                  label={locals[this.props.lang].colors.callout.cta}
                  action={(e) => this.colorsHandler(e)}
                />
              </div>
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
                      isActive={
                        features.find(
                          (feature) => feature.name === 'COLORS_NAME'
                        )?.isActive
                      }
                    >
                      <div className="list__item__param--compact">
                        <Input
                          type="TEXT"
                          value={color.name}
                          charactersLimit={24}
                          feature="RENAME_COLOR"
                          onBlur={this.colorsHandler}
                          onConfirm={this.colorsHandler}
                        />
                      </div>
                    </Feature>
                    <Feature
                      isActive={
                        features.find(
                          (feature) => feature.name === 'COLORS_PARAMS'
                        )?.isActive
                      }
                    >
                      <>
                        <div className="list__item__param--compact">
                          <Input
                            type="COLOR"
                            value={hex}
                            feature="UPDATE_HEX"
                            onChange={this.colorsHandler}
                            onBlur={this.colorsHandler}
                          />
                        </div>
                        <InputsBar
                          label={locals[this.props.lang].colors.lch.label}
                          customClassName="list__item__param"
                        >
                          <Input
                            type="NUMBER"
                            value={lch[0].toFixed(0)}
                            min="0"
                            max="100"
                            feature="UPDATE_LIGHTNESS"
                            onBlur={this.colorsHandler}
                            onConfirm={this.colorsHandler}
                          />
                          <Input
                            type="NUMBER"
                            value={lch[1].toFixed(0)}
                            min="0"
                            max="100"
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
                    isActive={
                      features.find(
                        (feature) => feature.name === 'COLORS_HUE_SHIFTING'
                      )?.isActive
                    }
                  >
                    <div className="list__item__param">
                      <FormItem
                        id="hue-shifting"
                        label={locals[this.props.lang].colors.hueShifting.label}
                        isBlocked={isBlocked(
                          'COLORS_CHROMA_SHIFTING',
                          this.props.planStatus
                        )}
                      >
                        <Input
                          id="hue-shifting"
                          type="NUMBER"
                          icon={{ type: 'LETTER', value: 'H' }}
                          unit="°"
                          value={color.hueShifting !== undefined ? color.hueShifting.toString() : '100'}
                          min="-360"
                          max="360"
                          feature="SHIFT_HUE"
                          isBlocked={isBlocked(
                            'COLORS_CHROMA_SHIFTING',
                            this.props.planStatus
                          )}
                          onBlur={this.colorsHandler}
                          onConfirm={this.colorsHandler}
                        />
                      </FormItem>
                    </div>
                  </Feature>
                  <Feature
                    isActive={
                      features.find(
                        (feature) => feature.name === 'COLORS_CHROMA_SHIFTING'
                      )?.isActive
                    }
                  >
                    <div className="list__item__param">
                      <FormItem
                        id="chroma-shifting"
                        label={
                          locals[this.props.lang].colors.chromaShifting.label
                        }
                        isBlocked={isBlocked(
                          'COLORS_CHROMA_SHIFTING',
                          this.props.planStatus
                        )}
                      >
                        <Input
                          id="chroma-shifting"
                          type="NUMBER"
                          icon={{ type: 'LETTER', value: 'C' }}
                          unit="%"
                          value={color.chromaShifting !== undefined ? color.chromaShifting.toString() : '100'}
                          min="0"
                          max="200"
                          feature="SHIFT_CHROMA"
                          isBlocked={isBlocked(
                            'COLORS_CHROMA_SHIFTING',
                            this.props.planStatus
                          )}
                          onBlur={this.colorsHandler}
                          onConfirm={this.colorsHandler}
                        />
                      </FormItem>
                    </div>
                  </Feature>
                  <Feature
                    isActive={
                      features.find(
                        (feature) => feature.name === 'COLORS_DESCRIPTION'
                      )?.isActive
                    }
                  >
                    <div className="list__item__param">
                      <FormItem
                        id="color-description"
                        label={locals[this.props.lang].global.description.label}
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