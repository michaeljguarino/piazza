import React, {useState} from 'react'
import { Box, Text, Stack } from 'grommet'
import { Next, Down, Download } from 'grommet-icons'
import FileIcon, { defaultStyles } from 'react-file-icon'
import Tooltip from '../utils/Tooltip'
import HoveredBackground from '../utils/HoveredBackground'
import moment from 'moment'
import filesize from 'filesize'
import FileViewer from './FileViewer'
import { Document, Page } from 'react-pdf'
import { FileTypes } from './types'

const extension = (file) => file.split('.').pop()

function DownloadAffordance({object}) {
  return (
    <Tooltip align={{bottom: 'top'}}>
      <HoveredBackground>
        <Box accentable animation={{type: "fadeIn", duration: 200}} onClick={(e) => e.preventDefault()} >
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
    </Tooltip>
  )
}

function Image({...file}) {
  const [hover, setHover] = useState(false)
  const [open, setOpen] = useState(false)

  return (
    <>
    <Box onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Stack anchor='top-right'>
        <Box style={{cursor: 'pointer'}} onClick={() => setOpen(true)}>
          <img style={{height: !file.height ? null : file.height, maxHeight: 300}} src={file.object} alt={file.filename} />
        </Box>
        {hover && (<DownloadAffordance object={file.object} />)}
      </Stack>
    </Box>
    {open && <FileViewer file={file} setOpen={setOpen} />}
    </>
  )
}

function Video({object, filename}) {
  return <video controls style={{height: 300}} src={object} alt={filename} />
}

function MediaFile({file}) {
  const [expanded, setExpanded] = useState(true)
  const [hover, setHover] = useState(false)
  const {filename, mediaType} = file
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
            <Image {...file} /> :
            <Video {...file} />}
        </Box>
      )}
    </Box>
  )
}

function FileDetails({file}) {
  return (
    <Box width='100%'>
      <Text size='small'>{file.filename}</Text>
      <Box direction='row' gap='small'>
        <Text size='xsmall' color='dark-5'>{filesize(file.filesize || 0)}</Text>
        <Text size='xsmall'>{moment(file.insertedAt).fromNow()}</Text>
      </Box>
    </Box>
  )
}

export function FileEntry({file: {filename, object, insertedAt, mediaType, ...file}, next}) {
  const [hover, setHover] = useState(false)
  const ext = extension(filename)
  const styles = defaultStyles[ext] || {}
  const mediaStyles = {maxWidth: 50, maxHeight: 50}
  return (
    <Box onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Stack anchor='top-right'>
        <Box
          direction='row'
          height='80px'
          border={next.node ? 'top' : 'horizontal'}
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
              <Text size='xsmall' color='dark-5'>{filesize(file.filesize || 0)}</Text>
              <Text size='xsmall'>{moment(insertedAt).fromNow()}</Text>
            </Box>
          </Box>
        </Box>
        {hover && (<DownloadAffordance object={object} />)}
      </Stack>
    </Box>
  )
}

function PdfFile({file}) {
  const ext = extension(file.filename)
  const styles = defaultStyles[ext] || {}
  return (
    <Box border round='small' background='white'>
      <Box direction='row' align='center' gap='small'>
        <FileIcon extension={ext} size={60} {...styles} />
        <FileDetails file={file} />
      </Box>
    </Box>
  )
}

export function StandardFile({file: {filename, object, insertedAt, ...file}}) {
  const [hover, setHover] = useState(false)
  const ext = extension(filename)
  const styles = defaultStyles[ext] || {}
  return (
    <a href={object} download style={{color: 'inherit', textDecoration: 'none'}}>
      <Box
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        border={hover ? {color: 'focus'} : true}
        elevation={hover ? 'small' : 'xsmall'}
        background='#fff'
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
            <Text size='small' color='dark-5'>{filesize(file.filesize || 0)}</Text>
            <Text size='small'>{moment(insertedAt).fromNow()}</Text>
          </Box>
        </Box>
      </Box>
    </a>
  )
}

export default function File({file}) {
  switch (file.mediaType) {
    case FileTypes.OTHER:
      return <StandardFile file={file} />
    case FileTypes.PDF:
      return <PdfFile file={file} />
    default:
      return <MediaFile file={file} />
  }
}