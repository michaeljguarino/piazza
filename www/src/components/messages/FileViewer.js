import React, { useState } from 'react'
import { Layer, Box, Stack, Text } from 'grommet'
import { FileTypes } from './types'
import { Document, Page } from 'react-pdf/dist/entry.webpack'
import useDimensions from "react-use-dimensions"
import { FormPrevious, FormNext, FormClose } from 'grommet-icons'
import fs from 'filesize'

function VideoViewer({file: {filename, object}}) {
  return <video alt={filename} src={object} style={{maxHeight: '100%'}} />
}

function ImageViewer({file: {filename, object}}) {
  return <img alt={filename} src={object} style={{maxHeight: '100%'}} />
}

function PdfViewer({file}) {
  const [pages, setPages] = useState(null)
  const [page, setPage] = useState(1)
  const [ref, {height}] = useDimensions()
  return (
    <Box ref={ref} fill margin='medium' align='center' justify='center'>
      <Stack anchor='bottom'>
        <Document
          file={file.object}
          onLoadSuccess={({numPages}) => setPages(numPages)}>
          <Page pageNumber={page} height={height} />
        </Document>
        <Box
          flex={false}
          margin={{bottom: '-25px'}}
          direction='row'
          align='center'
          background='white'
          border={{color: 'light-3'}}
          elevation='small'>
          <Box pad='small' hoverIndicator='light-3' onClick={page !== 1 ? () => setPage(page - 1) : null}>
            <FormPrevious color={page === 1 ? 'dark-3' : null} />
          </Box>
          <Box pad='small' flex={false}>
            <Text size='small'>{page} of {pages}</Text>
          </Box>
          <Box pad='small' hoverIndicator='light-3' onClick={page < pages ? () => setPage(page + 1) : null}>
            <FormNext color={page === pages ? 'dark-3' : null} />
          </Box>
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
  const [hover, setHover] = useState(false)
  return (
    <Box flex={false} direction='row' align='center' pad='small' border='bottom'>
      <Box fill='horizontal'>
        <Text size='small' weight={500}>{file.filename}</Text>
        <Text size='small' color='dark-3'>{fs(file.filesize)}</Text>
      </Box>
      <Box
        style={{cursor: 'pointer'}}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        background={hover ? 'light-3' : null}
        round='small'
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
    <Layer plain full onEsc={() => setOpen(false)}>
      <Box fill background='white'>
        <Header file={file} setOpen={setOpen} />
        <Box fill pad='medium' align='center' justify='center'>
          <FileViewerInner file={file} />
        </Box>
      </Box>
    </Layer>
  )
}