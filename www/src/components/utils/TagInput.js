import React, {Component, createRef} from 'react'
import {Box, Text, Keyboard, TextInput, Button} from 'grommet'
import {FormClose} from 'grommet-icons'

const Tag = ({ children, onRemove, ...rest }) => {
  const tag = (
    <Box
      direction="row"
      align="center"
      background="brand"
      pad={{ horizontal: "xsmall", vertical: "xxsmall" }}
      margin={{ vertical: "xxsmall" }}
      round="medium"
      {...rest}
    >
      <Text size="xsmall" margin={{ right: "xxsmall" }}>
        {children}
      </Text>
      {onRemove && <FormClose size="small" color="white" />}
    </Box>
  );

  if (onRemove) {
    return <Button onClick={onRemove}>{tag}</Button>;
  }
  return tag;
};

class TagInput extends Component {
  state = {
    currentTag: ""
  };

  boxRef = createRef();

  UNSAFE_componentDidMount() {
    this.forceUpdate();
  }

  updateCurrentTag = event => {
    const { onChange } = this.props;
    this.setState({ currentTag: event.target.value });
    if (onChange) {
      onChange(event);
    }
  };

  onAddTag = tag => {
    const { onAdd } = this.props;
    if (onAdd) {
      onAdd(tag);
    }
    this.setState({currentTag: ""})
  };

  onEnter = () => {
    const { currentTag } = this.state;
    if (currentTag.length) {
      this.onAddTag(currentTag);
      this.setState({ currentTag: "" });
    }
  };

  renderValue = () => {
    const { value, onRemove } = this.props;

    return value.map((v, index) => (
      <Tag margin="xxsmall" key={`${v}${index}`} onRemove={() => onRemove(v)}>
        {v}
      </Tag>
    ));
  };

  render() {
    const { value = [], onAdd, onRemove, onChange, ...rest } = this.props;
    const { currentTag } = this.state;
    return (
      <Keyboard onEnter={this.onEnter}>
        <Box
          direction="row"
          align="center"
          pad={{ horizontal: "xsmall" }}
          border="all"
          ref={this.boxRef}
          wrap
        >
          {value.length > 0 && this.renderValue()}
          <Box flex style={{ minWidth: "120px" }}>
            <TextInput
              type="search"
              plain
              dropTarget={this.boxRef.current}
              {...rest}
              onChange={this.updateCurrentTag}
              value={currentTag}
              onSelect={event => {
                event.stopPropagation();
                this.onAddTag(event.suggestion);
              }}
            />
          </Box>
        </Box>
      </Keyboard>
    );
  }
}

export default TagInput