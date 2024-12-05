import React from 'react'
import { PureComponent } from 'preact/compat'

interface FeatureProps {
  isActive: boolean
  children: React.ReactNode
}

export default class Feature extends PureComponent<FeatureProps> {
  static defaultProps = {
    isActive: false,
    isPro: false,
  }

  // Render
  render() {
    return <>{this.props.isActive && this.props.children}</>
  }
}
