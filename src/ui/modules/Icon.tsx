import { PureComponent } from 'preact/compat'
import React from 'react'

interface IconProps {
  size: number
}

export default class Icon extends PureComponent<IconProps> {
  render() {
    return (
      <svg
        width={this.props.size}
        height={this.props.size}
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="128"
          height="128"
          rx="24"
          fill="#88EBF9"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M41.7143 18.5C30.6546 18.5 21.75 27.5554 21.75 38.65V89.35C21.75 100.445 30.6546 109.5 41.7143 109.5H86.2857C97.3454 109.5 106.25 100.445 106.25 89.35V38.65C106.25 27.5554 97.3454 18.5 86.2857 18.5H41.7143ZM28.25 38.65C28.25 31.0774 34.3119 25 41.7143 25H49.375V41.25C46.6826 41.25 44.5 43.4326 44.5 46.125V49.375H28.25V38.65ZM44.5 52.625H28.25V75.375H44.5V52.625ZM44.5 78.625H28.25V89.35C28.25 96.9226 34.3119 103 41.7143 103H49.375V86.75C46.6826 86.75 44.5 84.5674 44.5 81.875V78.625ZM52.625 86.75V103H75.375V86.75H52.625ZM52.625 41.25H75.375V25H52.625V41.25ZM78.625 41.25C81.3174 41.25 83.5 43.4326 83.5 46.125V49.375H99.75V38.65C99.75 31.0774 93.6881 25 86.2857 25H78.625V41.25ZM83.5 52.625V75.375H99.75V52.625H83.5ZM83.5 78.625V81.875C83.5 84.5674 81.3174 86.75 78.625 86.75V103H86.2857C93.6881 103 99.75 96.9226 99.75 89.35V78.625H83.5Z"
          fill="#00272F"
        />
      </svg>
    )
  }
}
