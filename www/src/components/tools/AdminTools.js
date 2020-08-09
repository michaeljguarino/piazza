import React from 'react'
import { useHistory } from 'react-router-dom'
import { Modal, ModalHeader } from 'forge-core'
import { Box } from 'grommet'
import { DropdownItem } from '../users/Me'
import { download } from '../../utils/file'
import { apiHost, secure } from '../../helpers/hostname'
import { Download, Iteration, Group } from 'grommet-icons'
import ThemeSelector from '../workspace/ThemeSelector'

const HOST_PREFIX = `${secure() ? 'https' : 'http'}://${apiHost()}`

function ExportLink({exportToken, path, name, text}) {
  return (
    <DropdownItem icon={Download} text={text} onClick={() => {
      download(`${HOST_PREFIX}/external/export/${path}?token=${exportToken}`, name)
    }} />
  )
}

function BrandThemeModal({setOpen}) {
  return (
    <Box>
      <ModalHeader text="Choose a brand theme" setOpen={setOpen} />
      <Box width='500px' pad='small'>
        <ThemeSelector brand />
      </Box>
    </Box>
  )
}

export default function AdminTools({me: {exportToken}, openModal}) {
  const history = useHistory()
  return (
    <Box pad={{bottom: 'xxsmall'}}>
      <DropdownItem icon={Group} text='user directory' onClick={() => history.push('/directory')} />
      <DropdownItem
        icon={Iteration}
        text='update branding'
        onClick={() => openModal(<BrandThemeModal setOpen={openModal} />)} />
      <ExportLink exportToken={exportToken} text='export json' path='json' name='workspace.json' />
      <ExportLink exportToken={exportToken} text='export participants' path='participants' name='participants.csv' />
    </Box>
  )
}