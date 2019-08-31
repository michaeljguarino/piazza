import React from 'react'
import HoveredBackground from './HoveredBackground'
import {Box} from 'grommet'

const ITEM_PADDING = {vertical: 'xsmall', left: 'small', right: 'xsmall'}

export function MenuItem(props) {
  const {onClick, children, ...rest} = props
  return (
    <HoveredBackground>
      <Box
        hoverable
        style={{cursor: 'pointer'}}
        pad={ITEM_PADDING}
        onClick={() => onClick && onClick()}
        {...rest}>
        {children}
      </Box>
    </HoveredBackground>
  )
}

export default MenuItem