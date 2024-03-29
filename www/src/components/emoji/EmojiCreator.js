import React, { useState, useContext } from 'react'
import { useMutation } from 'react-apollo'
import { Box, Text, ThemeContext, TextInput } from 'grommet'
import { DocumentImage } from 'grommet-icons'
import { Modal, ModalHeader, Button, SecondaryButton } from 'forge-core'
import {FilePicker} from 'react-file-picker'
import { CREATE_EMOJI } from './queries'
import {addEmoji} from './utils'
import { CONTEXT_Q } from '../login/queries'
import { Conversations } from '../login/MyConversations'

function generatePreview(file, callback) {
  let reader = new FileReader();
  reader.onloadend = () => callback({
    file: file,
    previewUrl: reader.result
  })

  reader.readAsDataURL(file)
}

const MODAL_WIDTH = '400px'

export function EmojiForm({setOpen}) {
  const {workspaceId} = useContext(Conversations)
  const [image, setImage] = useState(null)
  const [name, setName] = useState('')
  const [mutation] = useMutation(CREATE_EMOJI, {
    variables: {name, image: image && image.file},
    update: (cache, {data}) => {
      const {emoji, ...prev} = cache.readQuery({ query: CONTEXT_Q, variables: {workspaceId} })
      if (emoji) {
        cache.writeQuery({
          query: CONTEXT_Q,
          variables: {workspaceId},
          data: {...prev, emoji: addEmoji(emoji, data.createEmoji)}
        })
      }
      setOpen(false)
    }
  })

  return (
    <Box width={MODAL_WIDTH} gap='medium'>
      <Text size='small'>
        <i>Custom emojis can be found in the * section of the emoji picker, or
        while searching using :emoji_name:
        </i>
      </Text>
      <Box gap='small'>
        <Text size='small' weight='bold'>1. Upload an image</Text>
        <Box direction='row' gap='small' align='center' pad={{left: 'medium'}}>
          <Box
            width='60px'
            height='60px'
            background='light-2'
            border
            pad='xsmall'
            align='center'
            justify='center'>
            {image ? <img alt='' width='40px' height='40px' src={image.previewUrl} /> :
              <DocumentImage size='20px' />
            }
          </Box>
          <Box gap='xsmall'>
            <Text size='small'>{image ? image.file.name : 'Select an image'}</Text>
            <FilePicker
              extensions={['jpg', 'jpeg', 'png']}
              dims={{minWidth: 100, maxWidth: 500, minHeight: 100, maxHeight: 500}}
              onChange={(file) => generatePreview(file, setImage)}
            >
              <SecondaryButton round='xsmall' label='Upload' />
            </FilePicker>
          </Box>
        </Box>
      </Box>
      <Box gap='small'>
        <Text size='small' weight='bold'>2. Give it a name</Text>
        <Box pad={{left: 'medium'}} direction='row'>
          <TextInput
            label='name'
            value={name}
            placeholder="emoji_name"
            onChange={(e) => setName(e.target.value)} />
        </Box>
      </Box>
      <Box gap='xsmall' direction='row' fill='horizontal' justify='end'>
        <SecondaryButton round='xsmall' pad='xsmall' label='Cancel' onClick={() => setOpen(false)} />
        <Button onClick={mutation} round='xsmall' pad='xsmall' disabled={!image || !name} label='Create' />
      </Box>
    </Box>
  )
}

export default function EmojiCreator() {
  return (
    <ThemeContext.Extend value={{layer: {zIndex: 30}}}>
      <Modal target={
        <Box
          width='120px'
          align='center'
          justify='center'
          style={{cursor: 'pointer'}}
          pad={{horizontal: 'small', vertical: 'xsmall'}}
          border
          round='xsmall'>
          <Text color='black' size='small'>Create More</Text>
        </Box>
      }>
      {setOpen => (
        <Box width={MODAL_WIDTH} round='small'>
          <ModalHeader text='Create a new emoji' setOpen={setOpen} />
          <Box pad='small'>
            <EmojiForm setOpen={setOpen} />
          </Box>
        </Box>
      )}
      </Modal>
    </ThemeContext.Extend>
  )
}