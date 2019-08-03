import React, {Component} from 'react'
import {Box, Clock} from 'grommet'

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
      <Box height={this.props.height || "100%"} direction='column' justify='center' align='center'>
        <Clock type="digital" />
      </Box>
    )
  }
}

export default Loading