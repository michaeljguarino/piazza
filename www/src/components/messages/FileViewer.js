import React, { useState, useCallback, useEffect } from 'react'
import { Layer, Box, Stack, Text, ThemeContext } from 'grommet'
import { Loading } from 'forge-core'
import useDimensions from "react-use-dimensions"
import { FileTypes } from './types'
import { FormPrevious, FormNext, FormClose, FormAdd, FormSubtract, Add, Subtract } from 'grommet-icons'
import { Document, Page } from 'react-pdf'
import fs from 'filesize'
import Repeatable from 'react-repeatable'
import { Icon } from './File'

function VideoViewer({file: {filename, object}}) {
  return <video alt={filename} src={object} style={{maxHeight: '100%'}} />
}

function ZoomControls({zoomIn, zoomOut, scale}) {
  return (
    <Box
      margin={{left: 'medium'}}
      round='xsmall'
      align='center'
      direction='row'
      gap='xsmall'
      pad={{vertical: 'xsmall', horizontal: 'small'}}
      elevation='small'
      background='dark-1'>
      <RepeatButton onClick={zoomOut}>
        <Subtract size='small' />
      </RepeatButton>
      <Text size='small'>{`${scale}`}%</Text>
      <RepeatButton onClick={zoomIn}>
        <Add size='small' />
      </RepeatButton>
    </Box>
  )
}

function preserveAspectRatio(dims, width, height) {
  if (dims.width < width && dims.height < height) {
    return dims
  }

  const ratio = dims.width / dims.height
  if (dims.width < width && width / ratio) {
    return {width, height: width / ratio}
  }

  if (ratio > 1 && width / ratio <= height) {
    return {width, height: width / ratio}
  }

  return {width: height * ratio, height}
}


function ImageInner({url, width, height, dims}) {
  const [scale, setScale] = useState(100)
  const imgDims  = preserveAspectRatio(dims, width - 24, height - 24)
  const mult = scale / 100
  const w = imgDims.width * mult
  const h = imgDims.height * mult
  const maxScale = Math.max(100, Math.min(Math.ceil((width / imgDims.width) * 200), Math.ceil((height / imgDims.height) * 200), 200))

  return (
    <Stack fill anchor='top-left'>
      <Box fill flex={false} style={{overflow: 'auto'}} align='center' justify='center'>
        <img
          alt=''
          src={url}
          onDoubleClick={() => setScale(100)}
          height={`${h}`}
          width={`${w}`} />
      </Box>
      <ZoomControls
        zoomIn={() => setScale(Math.min(maxScale, scale + 10))}
        zoomOut={() => setScale(Math.max(10, scale - 10))}
        scale={scale} />
    </Stack>
  )
}

function ImageViewer({file}) {
  const [ref, {height, width}] = useDimensions()
  const [dims, setDims] = useState(null)
  useEffect(() => {
    var img = new Image();
    img.onload = () => setDims({height: img.height, width: img.width})
    img.src = file.object;
  }, [file.object])

  return (
    <Box ref={ref} fill flex={false} pad='small'>
      {dims ? <ImageInner
                url={file.object}
                width={width}
                height={height}
                dims={dims} /> : <Loading />}
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