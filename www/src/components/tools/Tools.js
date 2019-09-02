
import React from 'react'
import {Box} from 'grommet'
import {DropdownItem} from '../users/Me'
import ThemeSelector from './ThemeSelector'
import Modal, {ModalHeader} from '../utils/Modal'
import StructuredMessageTester from './StructuredMessageTester'

function Tools(props) {
  return (
    <>
    <Modal target={<DropdownItem text='structured message creator' />}>
    {setOpen => (
      <Box>
        <ModalHeader text='Structured Message Developer' setOpen={setOpen} />
        <StructuredMessageTester callback={() => setOpen(false)} />
      </Box>
    )}
    </Modal>
    <Modal target={<DropdownItem text='theme selector' />}>
      {setOpen => (
        <Box>
          <ModalHeader text='Select a theme' setOpen={setOpen} />
          <ThemeSelector callback={() => setOpen(false)} />
        </Box>
      )}
    </Modal>
    </>
  )
}

export default Tools