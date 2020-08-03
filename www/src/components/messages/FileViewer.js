import React, { useState, useCallback } from 'react'
import { Layer, Box, Stack, Text, ThemeContext } from 'grommet'
import { FileTypes } from './types'
import { FormPrevious, FormNext, FormClose, FormAdd, FormSubtract } from 'grommet-icons'
import { Document, Page } from 'react-pdf'
import fs from 'filesize'
import Repeatable from 'react-repeatable'
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

function RepeatButton({onClick, children}) {
  return (
    <Repeatable
      tag={Box}
      repeatDelay={100}
      repeatInterval={32}
      hoverIndicator='dark-2'
      focusIndicator={false}
      onHold={onClick}
      onClick={onClick}>
      {children}
    </Repeatable>
  )
}

function PdfControls({page, pages, scale, setPage, setScale}) {
  return (
    <Box flex={false} direction='row' pad='xsmall' border={{side: 'between', color: 'light-5'}} background='dark-1'
             elevation='small' round='xsmall' gap='xsmall'>
      <Box direction='row' gap='xsmall' align='center' pad={{horizontal: 'xsmall'}}>
        <Box hoverIndicator='dark-2' focusIndicator={false} onClick={page !== 1 ? () => setPage(page - 1) : null}>
          <FormPrevious color={page === 1 ? 'dark-3' : null} />
        </Box>
        <Box flex={false}>
          <Text size='small'>{page} of {pages}</Text>
        </Box>
        <Box hoverIndicator='dark-2' focusIndicator={false} onClick={page < pages ? () => setPage(page + 1) : null}>
          <FormNext color={page === pages ? 'dark-3' : null} />
        </Box>
      </Box>
      <Box direction='row' gap='xsmall' align='center' pad={{horizontal: 'xsmall'}}>
        <RepeatButton onClick={() => setScale(scale - 10)}>
          <FormSubtract />
        </RepeatButton>
        <Box flex={false}>
          <Text size='small'>{scale}%</Text>
        </Box>
        <RepeatButton onClick={() => setScale(scale + 10)}>
          <FormAdd />
        </RepeatButton>
      </Box>
    </Box>
  )
}

function PdfViewer({file}) {
  const [pages, setPages] = useState(null)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(100)
  const boundedSetScale = useCallback((scale) => setScale(Math.max(Math.min(scale, 250), 10)), [setScale])

  return (
    <Box flex={false} fill pad='24px'>
      <Stack fill anchor='top-left'>
        <Box style={{overflow: 'auto'}} fill flex={false} justify={scale < 100 ? 'center' : null} align='center'>
          <Document file={file.object} onLoadSuccess={({numPages}) => setPages(numPages)}>
            <Page pageNumber={page} scale={scale / 100} />
          </Document>
        </Box>
        <PdfControls
          page={page}
          pages={pages}
          setPage={setPage}
          scale={scale}
          setScale={boundedSetScale} />
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