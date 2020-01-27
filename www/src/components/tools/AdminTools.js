import React from 'react'
import { Box } from 'grommet'
import { DropdownItem } from '../users/Me'
import { download } from '../../utils/file'
import { apiHost, secure } from '../../helpers/hostname'
import { Download } from 'grommet-icons'

const HOST_PREFIX = `${secure() ? 'https' : 'http'}://${apiHost()}`

export default function AdminTools({me: {exportToken}}) {
  console.log(`${HOST_PREFIX}/external/export/json?token=${exportToken}`)
  return (
    <Box pad={{bottom: 'xxsmall'}}>
      <DropdownItem icon={Download} text='Export json' onClick={() => {
        download(`${HOST_PREFIX}/external/export/json?token=${exportToken}`, 'workspace.json')
      }} />
    </Box>
  )
}