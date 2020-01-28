import React from 'react'
import { Box } from 'grommet'
import { DropdownItem } from '../users/Me'
import { download } from '../../utils/file'
import { apiHost, secure } from '../../helpers/hostname'
import { Download } from 'grommet-icons'

const HOST_PREFIX = `${secure() ? 'https' : 'http'}://${apiHost()}`

function ExportLink({exportToken, path, name, text}) {
  return (
    <DropdownItem icon={Download} text={text} onClick={() => {
      download(`${HOST_PREFIX}/external/export/${path}?token=${exportToken}`, name)
    }} />
  )
}

export default function AdminTools({me: {exportToken}}) {
  return (
    <Box pad={{bottom: 'xxsmall'}}>
      <ExportLink exportToken={exportToken} text='export json' path='json' name='workspace.json' />
      <ExportLink exportToken={exportToken} text='export participants' path='participants' name='participants.csv' />
    </Box>
  )
}