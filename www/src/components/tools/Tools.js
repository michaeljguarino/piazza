import React from 'react'
import { Box } from 'grommet'
import { useHistory } from 'react-router-dom'
import { Emoji, Keyboard } from 'grommet-icons'
import { ModalHeader } from 'forge-core'
import { DropdownItem } from '../users/Me'
import { EmojiForm } from '../emoji/EmojiCreator'

export default function Tools({openModal}) {
  let history = useHistory()
  return (
    <Box pad={{bottom: 'xxsmall'}}>
      <DropdownItem icon={Keyboard} text='structured message creator' onClick={() => history.push("/messageeditor")} />
      <DropdownItem icon={Emoji} text='create emoji' onClick={() => openModal(
        <Box>
          <ModalHeader text='Create an emoji' setOpen={openModal} />
          <Box pad='small'>
            <EmojiForm setOpen={openModal} />
          </Box>
        </Box>
      )} />
    </Box>
  )
}