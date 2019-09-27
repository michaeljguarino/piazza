
import React from 'react'
import {Box} from 'grommet'
import {Emoji, Iteration, Keyboard} from 'grommet-icons'
import {DropdownItem} from '../users/Me'
import Themes from '../themes/Themes'
import Modal, {ModalHeader} from '../utils/Modal'
import StructuredMessageTester from './StructuredMessageTester'
import {EmojiForm} from '../emoji/EmojiCreator'

function Tools(props) {
  return (
    <Box pad={{bottom: 'xxsmall'}}>
      <Modal target={<DropdownItem icon={Keyboard} text='structured message creator' />}>
      {setOpen => (
        <Box>
          <ModalHeader text='Structured Message Developer' setOpen={setOpen} />
          <StructuredMessageTester callback={() => setOpen(false)} />
        </Box>
      )}
      </Modal>
      <Modal target={<DropdownItem icon={Iteration} text='theme selector' />}>
        {setOpen => (
          <Box>
            <ModalHeader text='Select a theme' setOpen={setOpen} />
            <Themes setOpen={setOpen} />
          </Box>
        )}
      </Modal>
      <Modal target={<DropdownItem icon={Emoji} text='create emoji' />}>
        {setOpen => (
          <Box>
            <ModalHeader text='Create an emoji' setOpen={setOpen} />
            <Box pad='small'>
              <EmojiForm setOpen={setOpen} />
            </Box>
          </Box>
        )}
      </Modal>
    </Box>
  )
}

export default Tools