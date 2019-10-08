import React, {useState} from 'react'
import {Box, Text, Stack} from 'grommet'
import {Next, Down, Download} from 'grommet-icons'
import FileIcon, {defaultStyles} from 'react-file-icon'
import Tooltip from '../utils/Tooltip'
import HoveredBackground from '../utils/HoveredBackground'

const extension = (file) => file.split('.').pop()

function Image({object, filename}) {
  const [hover, setHover] = useState(false)

  return <Box onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
    <Stack anchor='top-right'>
      <img style={{maxHeight: 300, maxWidth: 300}} src={object} alt={filename} />
      {hover && (
        <Tooltip align={{bottom: 'top'}}>
          <HoveredBackground>
            <Box accentable animation={{type: "fadeIn", duration: 200}} >
              <a href={object} download>
                <Box
                  margin={{right: 'xsmall', top: 'xsmall'}}
                  style={{cursor: 'pointer'}}
                  background='#fff'
                  round='xsmall'
                  pad='small'>
                  <Download size='15px' />
                </Box>
              </a>
            </Box>
          </HoveredBackground>
          <Text size='small'>download</Text>
        </Tooltip>)}
    </Stack>
  </Box>
}

function Video({object, filename}) {
  return <video controls style={{maxHeight: 300, maxWidth: 500}} src={object} alt={filename} />
}

function MediaFile(props) {
  const [expanded, setExpanded] = useState(true)
  const [hover, setHover] = useState(false)
  const {filename, mediaType} = props.file
  const color = hover ? 'dark-2' : 'dark-6'
  return (
    <Box gap='xsmall'>
      <Box
        style={{cursor: 'pointer'}}
        direction='row'
        align='center'
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => setExpanded(!expanded)}
        gap='xsmall'>
        <Text size='xsmall' color={color}>
          {filename}
        </Text>
        {expanded ? <Down color={color} size='10px' /> : <Next color={color} size='10px' />}
      </Box>
      {expanded && (
        <Box>
          {mediaType === 'IMAGE' ?
            <Image {...props.file} /> :
            <Video {...props.file} />}
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