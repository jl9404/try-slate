import React, { Component } from 'react';
import SlateRenderer from 'slate-fast-renderer'
import { Paragraph, Heading, Box, Anchor, Image } from 'grommet';
import styled from 'styled-components'

const withPreWrap = component => styled(component)`
  white-space: pre-wrap;
`

const PreWrappedParagraph = withPreWrap(Paragraph)
const PreWrappedBox = withPreWrap(Box)

export default class Renderer extends Component {
  renderNode = (props, editor, next) => {
    const { attributes, children, node } = props
    const { data } = node

    switch (node.type) {
      case 'paragraph':
        return <PreWrappedParagraph {...attributes}>{children}</PreWrappedParagraph>
      case 'block-quote':
        return <PreWrappedBox background='light-2' pad='small' {...attributes}>{children}</PreWrappedBox>
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>
      case 'heading-one':
        return <Heading level={1} {...attributes}>{children}</Heading>
      case 'heading-two':
        return <Heading level={2} {...attributes}>{children}</Heading>
      case 'list-item':
        return <li {...attributes}>{children}</li>
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>
      case 'link':
        return <Anchor href={data.get('href')} {...attributes}>{children}</Anchor>
      case 'image':
        return <Image src={data.get('src')} fit="cover" {...attributes} />
      default:
        return next()
    }
  }

  renderMark = (props, editor, next) => {
    const { children, mark, attributes } = props

    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>
      case 'code':
        return <code {...attributes}>{children}</code>
      case 'italic':
        return <em {...attributes}>{children}</em>
      case 'underlined':
        return <u {...attributes}>{children}</u>
      default:
        return next()
    }
  }

  render() {
    return (
      <SlateRenderer {...this.props} renderNode={this.renderNode} renderMark={this.renderMark} />
    )
  }
}