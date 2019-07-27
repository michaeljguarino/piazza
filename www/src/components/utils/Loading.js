import React, {Component} from 'react'
import {Stack, Meter, Box, Text} from 'grommet'

class Loading extends Component {
  state = {
    value: 10
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      const { value } = this.state;
      this.setState({ value: value < 100 ? value + 10 : 100 });
    }, 10);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    return (
      <Box height="100%" direction='column' justify='center' align='center'>
        <Stack anchor="center">
          <Meter
            type="circle"
            background="light-2"
            values={[{ value: this.state.value }]}
            size="xsmall"
            thickness="small"
          />
          <Box direction="row" align="center" pad={{ bottom: "xsmall" }}>
            <Text size="xlarge" weight="bold">
              {this.state.value}
            </Text>
            <Text size="small">%</Text>
          </Box>
        </Stack>
      </Box>
    )
  }
}

export default Loading