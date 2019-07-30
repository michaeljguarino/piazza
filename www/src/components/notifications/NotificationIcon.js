import React from 'react'
import {Box} from 'grommet'
import {Notification} from 'grommet-icons'
import Dropdown from '../utils/Dropdown'
import NotificationList from './NotificationList'

function NotificationIcon(props) {
  return (
    <Box width='50px' align='center' justify='center'>
      <Dropdown>
        <Notification size='20px' />
        <Box pad='small' align='center' justify='center' width='300px'>
          <NotificationList {...props} />
        </Box>
      </Dropdown>
    </Box>
  )
}

export default NotificationIcon