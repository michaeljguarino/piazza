import React, {useState} from 'react'
import {Box, Text, Anchor} from 'grommet'
import {Copy, Close} from 'grommet-icons'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import Pill from './Pill'

const MAX_LINK_LENGTH = 40

function trimmed(link, trimTo) {
  const len = trimTo || MAX_LINK_LENGTH
  if (link.length > len) {
    return `${link.substring(0, len)}...`
  }
  return link
}

function Copyable({text, pillText, displayText, trimSize}) {
  const [display, setDisplay] = useState(false)
  const [hover, setHover] = useState(false)
  return (
    <>
    <CopyToClipboard text={text} onCopy={() =>  setDisplay(true)}>
      <Box
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{cursor: 'pointer'}}
        direction='row'
        align='center'
        round='xsmall'
        gap='xsmall'>
        <Anchor size='small'>{trimmed(displayText || text, trimSize)}</Anchor>
        {hover && (
          <Box animation={{type: 'fadeIn', duration: 200}}>
            <Copy size='12px' />
          </Box>
        )}
      </Box>
    </CopyToClipboard>
    {display && (
      <Pill background='status-ok' onClose={() => setDisplay(false)}>
        <Box direction='row' align='center' gap='small'>
          <Text>{pillText}</Text>
          <Close style={{cursor: 'pointer'}} size='15px' onClick={() => setDisplay(false)} />
        </Box>
      </Pill>
    )}
    </>
  )
}

export default Copyable