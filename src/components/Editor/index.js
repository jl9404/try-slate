import React, { Component } from 'react';
import { Editor as SlateEditor } from 'slate-react'

import { Button, Toolbar } from './components'
import { Link, Bold, Italic, OrderedList, UnorderedList, Underline, Code, BlockQuote, Image } from 'grommet-icons';

const DEFAULT_NODE = 'paragraph'

function wrapLink(editor, href) {
  editor.wrapInline({
    type: 'link',
    data: { href },
  })

  editor.moveToEnd()
}

function unwrapLink(editor) {
  editor.unwrapInline('link')
}

function insertImage(editor, src, target) {
  if (target) {
    editor.select(target)
  }

  editor.insertBlock({
    type: 'image',
    data: { src },
  })
}

export default class Editor extends Component {
  editor = React.createRef()

  constructor(props) {
    super()
    this.state = {
      value: props.initialValue
    }
  }

  hasMark = type => {
    const { value } = this.state
    return value.activeMarks.some(mark => mark.type === type)
  }

  hasBlock = type => {
    const { value } = this.state
    return value.blocks.some(node => node.type === type)
  }

  hasLinks = () => {
    const { value } = this.state
    return value.inlines.some(inline => inline.type === 'link')
  }

  renderMarkButton = (type, icon) => {
    const isActive = this.hasMark(type)

    return (
      <Button
        active={isActive}
        onMouseDown={event => this.onClickMark(event, type)}
      >
        {icon}
      </Button>
    )
  }

  renderBlockButton = (type, icon) => {
    let isActive = this.hasBlock(type)

    if (['numbered-list', 'bulleted-list'].includes(type)) {
      const { value: { document, blocks } } = this.state

      if (blocks.size > 0) {
        const parent = document.getParent(blocks.first().key)
        isActive = this.hasBlock('list-item') && parent && parent.type === type
      }
    }

    return (
      <Button
        active={isActive}
        onMouseDown={event => this.onClickBlock(event, type)}
      >
        {icon}
      </Button>
    )
  }

  renderNode = (props, editor, next) => {
    const { attributes, children, node } = props

    switch (node.type) {
      case 'paragraph':
        return <p {...attributes}>{children}</p>
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>
      case 'list-item':
        return <li {...attributes}>{children}</li>
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>
      case 'link':
        const { data } = node
        const href = data.get('href')
        return (
          <a {...attributes} href={href}>
            {children}
          </a>
        )
      case 'image':
        const src = node.data.get('src')
        return <img {...attributes} width="200" src={src}  />
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

  onChange = ({ value }) => {
    if (value.document != this.state.value.document) {
      console.log(JSON.stringify(value.toJSON()))
    }
    this.setState({ value })
    this.props.onChange && this.props.onChange({ value })
  }

  onClickMark = (event, type) => {
    event.preventDefault()
    this.editor.current.toggleMark(type)
  }

  onClickBlock = (event, type) => {
    event.preventDefault()

    const { editor: { current: editor } } = this
    const { value } = editor
    const { document } = value

    // Handle everything but list buttons.
    if (type !== 'bulleted-list' && type !== 'numbered-list' && type !== 'link' && type !== 'image') {
      const isActive = this.hasBlock(type)
      const isList = this.hasBlock('list-item')

      if (isList) {
        editor
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      } else {
        editor.setBlocks(isActive ? DEFAULT_NODE : type)
      }
    } else if (type === 'image') {
      const src = window.prompt('Enter the URL of the image:')
      if (!src) return
      editor.command(insertImage, src)
    } else if (type === 'link') {
      const hasLinks = this.hasLinks()

      if (hasLinks) {
        editor.command(unwrapLink)
      } else if (value.selection.isExpanded) {
        const href = window.prompt('Enter the URL of the link:')

        if (href == null) {
          return
        }

        editor.command(wrapLink, href)
      } else {
        const href = window.prompt('Enter the URL of the link:')

        if (href == null) {
          return
        }

        const text = window.prompt('Enter the text for the link:')

        if (text == null) {
          return
        }

        editor
          .insertText(text)
          .moveFocusBackward(text.length)
          .command(wrapLink, href)
      }
    } else {
      // Handle the extra wrapping required for list buttons.
      const isList = this.hasBlock('list-item')
      const isType = value.blocks.some(block => {
        return !!document.getClosest(block.key, parent => parent.type === type)
      })

      if (isList && isType) {
        editor
          .setBlocks(DEFAULT_NODE)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      } else if (isList) {
        editor
          .unwrapBlock(
            type === 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
          )
          .wrapBlock(type)
      } else {
        value.blocks.forEach(node => {
          node.nodes.forEach(({ key }) => {
            editor.wrapBlockByKey(key, type);
            editor.wrapBlockByKey(key, 'list-item');
          })
        })
      }
    }
  }

  render() {
    const { initialValue, onChange, ...restProps } = this.props

    if (this.state.value === undefined) {
      return null
    }

    return (
      <>
        <Toolbar>
          {this.renderMarkButton('bold', <Bold />)}
          {this.renderMarkButton('italic', <Italic />)}
          {this.renderMarkButton('underlined', <Underline />)}
          {this.renderMarkButton('code', <Code />)}
          {this.renderBlockButton('heading-one', 'H1')}
          {this.renderBlockButton('heading-two', 'H2')}
          {this.renderBlockButton('block-quote', <BlockQuote />)}
          {this.renderBlockButton('numbered-list', <OrderedList />)}
          {this.renderBlockButton('bulleted-list', <UnorderedList />)}
          {this.renderBlockButton('link', <Link />)}
          {this.renderBlockButton('image', <Image />)}
        </Toolbar>
        <SlateEditor
          spellCheck
          autoFocus
          placeholder="Enter some rich text..."
          ref={this.editor}
          value={this.state.value}
          onChange={this.onChange}
          renderNode={this.renderNode}
          renderMark={this.renderMark}
          {...restProps}
        />
      </>
    )
  }
}
