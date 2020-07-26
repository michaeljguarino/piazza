import React, { useState } from 'react'
import { Layer, Box, Stack, Text, ThemeContext } from 'grommet'
import { FileTypes } from './types'
import { FormPrevious, FormNext, FormClose } from 'grommet-icons'
import { Document, Page } from 'react-pdf'
import fs from 'filesize'
import { Icon } from './File'

function VideoViewer({file: {filename, object}}) {
  return <video alt={filename} src={object} style={{maxHeight: '100%'}} />
}

function ImageViewer({file: {filename, object}}) {
  return <img alt={filename} src={object} style={{maxHeight: '100%'}} />
}

function HoverContainer({children, ...props}) {
  return (
    <Box
      focusIndicator={false}
      pad='small'
      hoverIndicator='light-3'
      {...props}>
      {children}
    </Box>
  )
}

function PdfViewer({file}) {
  const [pages, setPages] = useState(null)
  const [page, setPage] = useState(1)
  return (
    <Box fill align='center' justify='center'>
      <Stack anchor='top-right'>
        <Box fill style={{overflow: 'auto'}}>
          <Document
            file={file.object}
            onLoadSuccess={({numPages}) => setPages(numPages)}
            onLoadError={console.log}>
            <Page pageNumber={page} />
          </Document>
        </Box>
        <Box
          flex={false}
          margin={{bottom: '-25px'}}
          direction='row'
          align='center'
          background='white'
          border={{color: 'light-3'}}
          elevation='small'>
          <HoverContainer onClick={page !== 1 ? () => setPage(page - 1) : null}>
            <FormPrevious color={page === 1 ? 'dark-3' : null} />
          </HoverContainer>
          <Box pad='small' flex={false}>
            <Text size='small'>{page} of {pages}</Text>
          </Box>
          <HoverContainer onClick={page < pages ? () => setPage(page + 1) : null}>
            <FormNext color={page === pages ? 'dark-3' : null} />
          </HoverContainer>
        </Box>
      </Stack>
    </Box>
  )
}

function FileViewerInner({file}) {
  switch (file.mediaType) {
    case FileTypes.VIDEO:
      return <VideoViewer file={file} />
    case FileTypes.AUDIO:
      return <VideoViewer file={file} />
    case FileTypes.IMAGE:
      return <ImageViewer file={file} />
    case FileTypes.PDF:
      return <PdfViewer file={file} />
    default:
      return null
  }
}

function Header({file, setOpen}) {
  return (
    <Box flex={false} direction='row' align='center' pad='small' border='bottom'>
      <Box direction='row' gap='small' fill='horizontal' align='center'>
        <Icon size={50} name={file.filename} />
        <Box>
          <Text size='small' weight={500}>{file.filename}</Text>
          <Text size='small' color='dark-3'>{fs(file.filesize)}</Text>
        </Box>
      </Box>
      <Box
        focusIndicator={false}
        hoverIndicator='light-3'
        round='xsmall'
        flex={false}
        pad='xsmall'
        align='center'
        justify='center'
        onClick={() => setOpen(false)}>
        <FormClose size='30px' />
      </Box>
    </Box>
  )
}

export default function FileViewer({file, setOpen}) {
  return (
    <ThemeContext.Extend value={{layer: {zIndex: 21}}}>
      <Layer plain full onEsc={() => setOpen(false)}>
        <Box fill background='white'>
          <Header file={file} setOpen={setOpen} />
          <Box fill pad='medium' align='center' justify='center'>
            <FileViewerInner file={file} />
          </Box>
        </Box>
      </Layer>
    </ThemeContext.Extend>
  )
}