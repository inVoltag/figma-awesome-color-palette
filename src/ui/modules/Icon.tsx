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
          x="8"
          y="4"
          width="112"
          height="120"
          rx="32"
          fill="white"
        />
        <g clipPath="url(#clip0_1975_2917)">
          <rect
            x="47"
            y="12"
            width="34"
            height="34"
            fill="#BEDFE3"
            stroke="#00272F"
            strokeWidth="2"
          />
          <rect
            x="47"
            y="46"
            width="34"
            height="36"
            fill="#E9F4F6"
            stroke="#00272F"
            strokeWidth="2"
          />
          <rect
            x="47"
            y="82"
            width="34"
            height="34"
            fill="#0E8390"
            stroke="#00272F"
            strokeWidth="2"
          />
          <rect
            x="16"
            y="12"
            width="31"
            height="34"
            fill="#003D47"
            stroke="#00272F"
            strokeWidth="2"
          />
          <rect
            x="16"
            y="46"
            width="31"
            height="36"
            fill="#005460"
            stroke="#00272F"
            strokeWidth="2"
          />
          <rect
            x="16"
            y="82"
            width="31"
            height="34"
            fill="#006C79"
            stroke="#00272F"
            strokeWidth="2"
          />
          <rect
            x="81"
            y="12"
            width="31"
            height="34"
            fill="#93C9D0"
            stroke="#00272F"
            strokeWidth="2"
          />
          <rect
            x="81"
            y="46"
            width="31"
            height="36"
            fill="#6AB2BC"
            stroke="#00272F"
            strokeWidth="2"
          />
          <rect
            x="81"
            y="82"
            width="31"
            height="34"
            fill="#419BA7"
            stroke="#00272F"
            strokeWidth="2"
          />
        </g>
        <rect
          width="96"
          height="104"
          rx="24"
          transform="matrix(1 0 0 -1 16 116)"
          stroke="#00272F"
          strokeWidth="4"
        />
        <rect
          x="40"
          y="36"
          width="48"
          height="56"
          rx="6"
          fill="#88EBF9"
          stroke="#00272F"
          strokeWidth="4"
        />
        <defs>
          <clipPath id="clip0_1975_2917">
            <rect
              width="96"
              height="104"
              rx="24"
              transform="matrix(1 0 0 -1 16 116)"
              fill="white"
            />
          </clipPath>
        </defs>
      </svg>
    )
  }
}
