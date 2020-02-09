import React, { useState } from 'react'
import { Box, Text } from 'grommet'
import ThemeSelector from './ThemeSelector'
import ThemeCreator from './ThemeCreator'
import InterchangeableBox from '../utils/InterchangeableBox'
import {ModalHeader} from '../utils/Modal'
import Button, { SecondaryButton } from '../utils/Button'

export default function Themes({setOpen, brand}) {
  const [header, setHeader] = useState('Select a theme')
  function withHeaderUpdate(fun, header) {
    return () => {
      setHeader(header)
      fun()
    }
  }

  return (
    <Box>
      <ModalHeader text={header} setOpen={setOpen} />
      <InterchangeableBox noWrap>
      {setAlternate => (
        <Box width='500px' pad='small'>
          <Box>
            <Text size='small' weight='bold'>Available themes</Text>
          </Box>
          <ThemeSelector brand={brand} />
          <Box direction='row' gap='xsmall' justify='end' margin={{top: 'small'}}>
            <SecondaryButton round='xsmall' label='Cancel' onClick={() => setOpen(false)} />
            <Button round='xsmall' label='Create More' onClick={withHeaderUpdate(() => (
              setAlternate(<ThemeCreator cancel={withHeaderUpdate(() => setAlternate(null), 'Select a theme')} />)
            ), 'Create or Update a theme')} />
          </Box>
        </Box>
      )}
      </InterchangeableBox>
    </Box>
  )
}