import React from 'react'
import { Box } from 'grommet'
import { useHistory } from 'react-router-dom'
import { Emoji, Keyboard } from 'grommet-icons'
import { Modal, ModalHeader } from 'forge-core'
import { DropdownItem } from '../users/Me'
import { EmojiForm } from '../emoji/EmojiCreator'

export default function Tools() {
  let history = useHistory()
  return (
    <Box pad={{bottom: 'xxsmall'}}>
      <DropdownItem icon={Keyboard} text='structured message creator' onClick={() => history.push("/messageeditor")} />
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