import React, {useState} from 'react'
import {Box, Text, Stack} from 'grommet'
import {Next, Down, Download} from 'grommet-icons'
import FileIcon, {defaultStyles} from 'react-file-icon'
import Tooltip from '../utils/Tooltip'
import HoveredBackground from '../utils/HoveredBackground'
import filesize from 'filesize'
import moment from 'moment'

const extension = (file) => file.split('.').pop()

function DownloadAffordance(props) {
  return (
    <Tooltip align={{bottom: 'top'}}>
      <HoveredBackground>
        <Box accentable animation={{type: "fadeIn", duration: 200}} >
          <a href={props.object} download>
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
    </Tooltip>
  )
}

function Image({object, filename}) {
  const [hover, setHover] = useState(false)

  return <Box onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
    <Stack anchor='top-right'>
      <img style={{maxHeight: 300, maxWidth: 300}} src={object} alt={filename} />
      {hover && (<DownloadAffordance object={object} />)}
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

export function FileEntry(props) {
  const [hover, setHover] = useState(false)
  const {filename, object, insertedAt, mediaType} = props.file
  const ext = extension(filename)
  const styles = defaultStyles[ext] || {}
  const mediaStyles = {maxWidth: 50, maxHeight: 50}
  return (
    <Box onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Stack anchor='top-right'>
        <Box
          direction='row'
          height='80px'
          border={props.next.node ? 'top' : 'horizontal'}
          align='center'
          gap='small'
          pad={{left: 'small'}}
          background={hover ? 'light-2' : null}>
          <Box width='60px' height='60px' align='center' justify='center'>
            {mediaType === "VIDEO" ?
              <video src={object} style={mediaStyles} alt={filename} /> :
              mediaType === "OTHER" ?
                <FileIcon extension={ext} size={60} {...styles} /> :
                  <img src={object} style={mediaStyles} alt={filename} />}
          </Box>
          <Box width='100%'>
            <Text size='small'>{filename}</Text>
            <Box direction='row' gap='small'>
              <Text size='xsmall' color='dark-5'>{filesize(props.file.filesize || 0)}</Text>
              <Text size='xsmall'>{moment(insertedAt).fromNow()}</Text>
            </Box>
          </Box>
        </Box>
        {hover && (<DownloadAffordance object={object} />)}
      </Stack>
    </Box>
  )
}

export function StandardFile(props) {
  const [hover, setHover] = useState(false)
  const {filename, object, insertedAt} = props.file
  const ext = extension(filename)
  const styles = defaultStyles[ext] || {}
  return (
    <a href={object} download style={{color: 'inherit', textDecoration: 'none'}}>
      <Box
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        border={hover ? {color: 'focus'} : true}
        elevation={hover ? 'small' : 'xsmall'}
        background={hover ? null : '#fff'}
        round='xsmall'
        align="center"
        direction='row'
        pad='small'
        gap='small'
        margin={{vertical: 'xsmall'}}>
        <FileIcon extension={ext} size={40} {...styles} />
        <Box gap='xsmall'>
          <Text size='small'>{filename}</Text>
          <Box direction='row' gap='small'>
            <Text size='small' color='dark-5'>{filesize(props.file.filesize || 0)}</Text>
            <Text size='small'>{moment(insertedAt).fromNow()}</Text>
          </Box>
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