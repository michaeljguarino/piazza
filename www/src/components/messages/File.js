import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Next, Down} from 'grommet-icons'
import FileIcon, {defaultStyles} from 'react-file-icon'

const extension = (file) => file.split('.').pop()

function MediaFile(props) {
  const [expanded, setExpanded] = useState(true)
  const {filename, object, mediaType} = props.file
  return (
    <Box gap='xsmall'>
      <Box
        style={{cursor: 'pointer'}}
        direction='row'
        align='center'
        gap='xsmall'
        onClick={() => setExpanded(!expanded)}>
        <Text size='xsmall' color='dark-6'>{filename}</Text>
        {expanded ? <Down color='dark-6' size='10px' /> : <Next color='dark-6' size='10px' />}
      </Box>
      {expanded && (
        <Box>
          {mediaType === 'IMAGE' ?
            <img style={{maxHeight: 300, maxWidth: 300}} src={object} alt={filename} /> :
            <video controls style={{maxHeight: 300, maxWidth: 500}} src={object} alt={filename} />}
        </Box>
      )}
    </Box>
  )
}

function StandardFile(props) {
  const [hover, setHover] = useState(false)
  const {filename, object} = props.file
  const ext = extension(filename)
  const styles = defaultStyles[ext] || {}
  return (
    <a href={object} download style={{color: 'inherit', textDecoration: 'none'}}>
      <Box
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        border
        elevation={hover ? 'small' : 'xsmall'}
        background={hover ? null : '#fff'}
        round='xsmall'
        align="center"
        direction='row'
        pad='xsmall'
        gap='small'
        margin={{vertical: 'xsmall'}}>
        <FileIcon extension={ext} size={40} {...styles} />
        <Box>
          <Text size='small'>{filename}</Text>
        </Box>
      </Box>
    </a>
  )
}

function File({file}) {
  switch (file.mediaType) {
    case "OTHER":
      return <StandardFile file={file} />
    default:
      return <MediaFile file={file} />
  }
}

export default File