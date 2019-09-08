import React, {useState} from 'react'
import {Mutation} from 'react-apollo'
import {Box, Text, ThemeContext} from 'grommet'
import {CloudUpload} from 'grommet-icons'
import Modal, {ModalHeader} from '../utils/Modal'
import InputField from '../utils/InputField'
import Button, {SecondaryButton} from '../utils/Button'
import {FilePicker} from 'react-file-picker'
import {CREATE_EMOJI, EMOJI_Q} from './queries'
import {addEmoji} from './utils'

function generatePreview(file, callback) {
  let reader = new FileReader();
  reader.onloadend = () => callback({
    file: file,
    previewUrl: reader.result
  })

  reader.readAsDataURL(file)
}

export function EmojiForm(props) {
  const [image, setImage] = useState(null)
  const [name, setName] = useState(null)

  return (
    <Mutation
      mutation={CREATE_EMOJI}
      variables={{name, image: image && image.file}}
      update={(cache, {data}) => {
        const prev = cache.readQuery({ query: EMOJI_Q })
        cache.writeQuery({query: EMOJI_Q, data: addEmoji(prev, data.createEmoji)})
        props.setOpen(false)
      }}>
    {mutation => (
      <Box gap='small'>
        <Box gap='xsmall'>
          <Box direction='row' gap='xsmall' align='center'>
            <Box border round='xsmall' width='35px' height='35px' pad='xsmall' align='center' justify='center'>
              {image ? <img alt='' width='30px' height='30px' src={image.previewUrl} /> :
                <CloudUpload size='25px' />
              }
            </Box>
            <FilePicker
              extensions={['jpg', 'jpeg', 'png']}
              dims={{minWidth: 100, maxWidth: 500, minHeight: 100, maxHeight: 500}}
              onChange={(file) => generatePreview(file, setImage)}
            >
              <Box style={{cursor: 'pointer'}} pad='xsmall' border round='xsmall'>
                Upload Image
              </Box>
            </FilePicker>
          </Box>
        </Box>
        <Box gap='xsmall'>
          <InputField
            label='name'
            value={name}
            placeholder='my_emoji'
            onChange={(e) => setName(e.target.value)} />
        </Box>
        <Box gap='xsmall' direction='row' fill='horizontal' justify='end'>
          <SecondaryButton round='xsmall' pad='xsmall' label='Cancel' onClick={() => props.setOpen(false)} />
          <Button onClick={mutation} round='xsmall' pad='xsmall' disabled={!image || !name} label='Create' />
        </Box>
      </Box>
    )}
    </Mutation>
  )
}

function EmojiCreator(props) {
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
        <Box width="300px" round='small'>
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

export default EmojiCreator