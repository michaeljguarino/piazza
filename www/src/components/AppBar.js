import React, { Component } from 'react'
import { Box, Heading, Button } from 'grommet';
import { Notification } from 'grommet-icons';

class AppBar extends Component {
  render() {
    return (
      <Box
        tag='header'
        direction='row'
        align='center'
        justify='between'
        background='brand'
        pad={{ left: 'small', right: 'small', vertical: 'small' }}
        elevation='medium'>
        <Heading level='4' margin='none'>Piazza</Heading>
        <Button icon={<Notification />} onClick={() => {}} />
      </Box>)
  }
};

export default AppBar