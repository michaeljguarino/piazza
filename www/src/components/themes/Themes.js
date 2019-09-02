import React from 'react'
import {Box, Text} from 'grommet'
import ThemeSelector from './ThemeSelector'
import ThemeCreator from './ThemeCreator'
import InterchangeableBox from '../utils/InterchangeableBox'
import Button, {SecondaryButton} from '../utils/Button'

function Themes(props) {
  return (
    <InterchangeableBox noWrap>
    {setAlternate => (
      <Box width='300px' pad='small'>
        <Box>
          <Text size='small' weight='bold'>Available themes</Text>
        </Box>
        <ThemeSelector {...props} />
        <Box direction='row' gap='xsmall' justify='end' margin={{top: 'small'}}>
          <SecondaryButton round='xsmall' label='Cancel' onClick={() => props.setOpen(false)} />
          <Button round='xsmall' label='Create More' onClick={() => setAlternate(
            <ThemeCreator cancel={() => setAlternate(null)} />
          )} />
        </Box>
      </Box>
    )}
    </InterchangeableBox>
  )
}

export default Themes