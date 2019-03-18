import React, { Component } from 'react';
import { Value, Block } from 'slate'
import { Grommet, grommet, Box } from 'grommet'
import { deepMerge } from "grommet/utils";

import './App.css';
import initialValue from './value.json';
import Editor from './components/Editor';
import Renderer from './components/Renderer';

const theme = deepMerge(grommet, {
  paragraph: {
    medium: {
      maxWidth: "auto"
    }
  }
});

const schema = {
  document: {
    last: { type: 'paragraph' },
    normalize: (editor, { code, node, child }) => {
      switch (code) {
        case 'last_child_type_invalid': {
          const paragraph = Block.create('paragraph')
          return editor.insertNodeByKey(node.key, node.nodes.size, paragraph)
        }
      }
    },
  },
  blocks: {
    image: {
      isVoid: true,
    },
  },
}

class App extends Component {
  state = {
    value: Value.fromJSON(initialValue)
  }

  setValue = ({ value }) => {
    this.setState({ value })
  }

  render() {
    return (
      <>
        <div className="cell">
          <Editor initialValue={Value.fromJSON(initialValue)} onChange={this.setValue} schema={schema} />
        </div>
        <div className="cell">
          <Grommet theme={theme}>
            <Box>
              <Renderer value={this.state.value} />
            </Box>
          </Grommet>
        </div>
      </>
    );
  }
}

export default App;
