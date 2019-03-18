import React from 'react'
import styled from 'styled-components'

export const Button = styled.span`
  cursor: pointer;
  color: ${props =>
    props.reversed
      ? props.active ? 'white' : '#aaa'
      : props.active ? 'black' : '#ccc'};
`

export const Icon = styled(({ children, ...rest }) => {
  return <span>{children}</span>
})`
  font-size: 18px;
  vertical-align: text-bottom;
`

export const Menu = styled.div`
  & > * {
    display: inline-block;
  }
  & > * + * {
    margin-left: 15px;
  }
`

export const Toolbar = styled(Menu)`
  position: relative;
  margin: 0 0 20px 0;
  border-bottom: 2px solid #eee;
`