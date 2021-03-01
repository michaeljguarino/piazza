import React, { useState } from 'react'
import { Box, Text, Stack } from 'grommet'
import { Next, Down, Download } from 'grommet-icons'
import FileIcon, { defaultStyles } from 'react-file-icon'
import { Tooltip, HoveredBackground } from 'forge-core'
import moment from 'moment'
import filesize from 'filesize'
import FileViewer from './FileViewer'
import { FileTypes } from './types'
import { download } from '../../utils/file'

const extension = (file) => file.split('.').pop()

function DownloadAffordance({object}) {
  return (
    <Tooltip align={{bottom: 'top'}}>
      <HoveredBackground>
        <Box accentable margin={{right: 'xsmall', top: 'xsmall'}} focusIndicator={false}
          background='#fff' round='xsmall' pad='small' animation={{type: "fadeIn", duration: 200}}
          onClick={(e) => {
            e.preventDefault()
            download(object)
          }} border={{color: 'light-3'}}>
          <Download size='15px' />
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
        <Box focusindicator={false} onClick={() => setOpen(true)}>
          <img style={{
            height: !file.height || file.height === 0 ? 50 : file.height,
            maxHeight: 300,
            // objectFit: 'contain'
          }} src={file.object} alt={file.filename} />
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
        focusindicator={false}
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
        <Box direction='row' align='start'>
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

export function Icon({size, name}) {
  const ext = extension(name)
  const styles = defaultStyles[ext] || {}
  return <FileIcon extension={ext} size={size} {...styles} />
}

const viewableTypes = [FileTypes.IMAGE, FileTypes.VIDEO, FileTypes.PDF]

export function FileEntry({file, next}) {
  const [hover, setHover] = useState(false)
  const [open, setOpen] = useState(false)
  const mediaStyles = {maxWidth: 50, maxHeight: 50}
  const viewable = viewableTypes.find((type) => type === file.mediaType)

  return (
    <>
    <Box
      flex={false}
      focusIndicator={false}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={viewable ? () => setOpen(true) : null}>
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
            {file.mediaType === FileTypes.VIDEO ?
              <video src={file.object} style={mediaStyles} alt={file.filename} /> :
              file.mediaType === FileTypes.IMAGE ?
                <img src={file.object} style={mediaStyles} alt={file.filename} /> :
                <Icon name={file.filename} size={40} />}
          </Box>
          <Box width='100%'>
            <Text size='small'>{file.filename}</Text>
            <Box direction='row' gap='small'>
              <Text size='xsmall' color='dark-5'>{filesize(file.filesize || 0)}</Text>
              <Text size='xsmall'>{moment(file.insertedAt).fromNow()}</Text>
            </Box>
          </Box>
        </Box>
        {hover && (<DownloadAffordance object={file.object} />)}
      </Stack>
    </Box>
    {open && <FileViewer file={file} setOpen={setOpen} />}
    </>
  )
}

const PdfFile = ({file}) => {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const ext = extension(file.filename)
  const styles = defaultStyles[ext] || {}
  return (
    <>
    <Box
      margin={{vertical: 'xsmall'}}
      focusIndicator={false}
      border={hover ? {color: 'focus'} : {color: 'light-5'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      round='xsmall'
      background='white'
      pad='small'
      onClick={() => setOpen(true)}>
      <Box direction='row' align='center' gap='small'>
        <FileIcon extension={ext} size={40} {...styles} />
        <FileDetails file={file} />
      </Box>
    </Box>
    {open && <FileViewer file={file} setOpen={setOpen} />}
    </>
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
        border={hover ? {color: 'focus'} : {color: 'light-5'}}
        background='#fff'
        round='xsmall'
        align="center"
        direction='row'
        pad='small'
        gap='small'
        margin={{vertical: 'xsmall'}}>
        <FileIcon extension={ext} size={40} {...styles} />
        <Box>
          <Text size='small'>{filename}</Text>
          <Box direction='row' gap='small' align='center'>
            <Text size='xsmall' color='dark-5'>{filesize(file.filesize || 0)}</Text>
            <Text size='xsmall'>{moment(insertedAt).fromNow()}</Text>
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