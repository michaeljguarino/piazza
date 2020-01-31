import React from 'react'
import { Box } from 'grommet'
import { DropdownItem } from '../users/Me'
import { download } from '../../utils/file'
import { apiHost, secure } from '../../helpers/hostname'
import { Download, Iteration } from 'grommet-icons'
import ThemeSelector from '../themes/ThemeSelector'
import Modal, { ModalHeader } from '../utils/Modal'

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

export default function AdminTools({me: {exportToken}}) {
  return (
    <Box pad={{bottom: 'xxsmall'}}>
      <Modal target={<DropdownItem icon={Iteration} text='update branding' />}>
      {setOpen => (<BrandThemeModal setOpen={setOpen} />)}
      </Modal>
      <ExportLink exportToken={exportToken} text='export json' path='json' name='workspace.json' />
      <ExportLink exportToken={exportToken} text='export participants' path='participants' name='participants.csv' />
    </Box>
  )
}