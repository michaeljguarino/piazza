import React from 'react'
import { Box, Text, Stack } from 'grommet'
import WithPresence from '../utils/presence'
import PresenceIndicator from './PresenceIndicator'

const DEFAULT_BACKGROUND = '#103A50'
const DEFAULT_SIZE = '40px'

export class AvatarContainer extends React.PureComponent {
  render() {
    const {background, img, text, size, rightMargin} = this.props
    const boxSize = size || DEFAULT_SIZE

    return (
      <Box border={{style: 'hidden'}} round='xsmall' align='center' justify='center'
        background={img ? null : (background || DEFAULT_BACKGROUND)}
        width={boxSize} height={boxSize} margin={{right: rightMargin || '5px'}}>
        {img ?
          <img alt='' height={boxSize} width={boxSize} style={{borderRadius: '6px'}} src={img}/> :
          <Text>{text.charAt(0).toUpperCase()}</Text>
        }
      </Box>
    )
  }
}

export default React.memo(({withPresence, user, size, rightMargin}) => {
  if (withPresence) {
    return (
      <Stack anchor='top-right'>
        <AvatarContainer
          img={user.avatar}
          text={user.handle}
          background={user.backgroundColor}
          size={size}
          rightMargin={rightMargin} />
        <WithPresence id={user.id}>
        {present => (
          <Box margin={{top: '-2px', right: '-2px'}}>
            <PresenceIndicator present={present} />
          </Box>
        )}
        </WithPresence>
      </Stack>
    )
  }

  return (
    <AvatarContainer
      img={user.avatar}
      text={user.handle}
      background={user.backgroundColor}
      size={size}
      rightMargin={rightMargin} />
  )
}, ({user: {id, avatar, handle, background}, size, rightMargin, withPresence}, next) => (
  next.user.id === id && next.user.avatar === avatar && next.user.handle === handle && next.user.background === background && size === next.size && rightMargin === next.rightMargin && withPresence === next.withPresence
))
