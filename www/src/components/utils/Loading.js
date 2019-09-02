import React from 'react'
import {Box, Clock} from 'grommet'

function Loading(props) {
  return (
    <Box
      height={props.height || "100%"}
      width={props.width}
      direction='column'
      justify='center'
      align='center'>
      <Clock type="digital" />
    </Box>
  )
}

export default Loading