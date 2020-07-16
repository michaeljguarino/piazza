import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Terminal} from 'grommet-icons'
import { useQuery } from 'react-apollo'
import CommandListEntry from './CommandListEntry'
import CommandCreator from './CommandCreator'
import InstallableCommands from './InstallableCommands'
import Scroller from '../utils/Scroller'
import HoveredBackground from '../utils/HoveredBackground'
import {COMMANDS_Q} from './queries'
import Flyout, {FlyoutHeader, FlyoutContainer} from '../utils/Flyout'
import Modal from '../utils/Modal'
import Expander from '../utils/Expander'
import {SecondaryButton} from '../utils/Button'
import {mergeAppend} from '../../utils/array'
import {ICON_HEIGHT, ICON_SPREAD} from '../Piazza'

const onFetchMore = (prev, {fetchMoreResult}) => {
  const {edges, pageInfo} = fetchMoreResult.commands

  return edges.length ? {
    ...prev,
    commands: {
      ...prev.commands,
      pageInfo,
      edges: mergeAppend(edges, prev.commands.edges, ({node}) => node.id)
    }
  } : prev
}

function FlyoutContent() {
  const [expanded, setExpanded] = useState(false)
  const {loading, data, fetchMore} = useQuery(COMMANDS_Q)
  if (loading) return null
  const {edges, pageInfo} = data.commands

  return (
    <>
      {!expanded && (
        <>
        <Box pad='small' flex={false}>
          <Text size='small'>
            <i>
              Commands can automate basic tasks.  They support a message webhook, and
              an incoming webhook to send messages ad hoc.
            </i>
          </Text>
        </Box>
        <Box fill>
          <Scroller
            id='commands-viewport'
            edges={edges}
            style={{overflow: 'auto', maxHeight: '100%'}}
            mapper={({node}) => (
              <CommandListEntry
                key={node.id} pad={{vertical: 'xsmall', horizontal: 'small'}} command={node} />
            )}
            onLoadMore={() => pageInfo.hasNextPage && fetchMore({
              variables: {cursor: pageInfo.endCursor},
              updateQuery: onFetchMore
            })}
          />
        </Box>
        <Box flex={false} margin={{top: 'xsmall'}} pad='small' border='top'>
          <Modal target={<SecondaryButton round='xsmall' label='Create more' />}>
          {setOpen => (<CommandCreator setOpen={setOpen} />)}
          </Modal>
        </Box>
        </>
      )}
      <Box flex={false}>
        <Box onClick={() => setExpanded(!expanded)}>
          <Expander text='Browse installable commands' expanded={expanded} />
        </Box>
        {expanded && (<InstallableCommands />)}
      </Box>
    </>
  )
}

export function CommandFlyout({setOpen, ...props}) {
  return (
    <FlyoutContainer width='30vw'>
      <FlyoutHeader text='Bots' setOpen={setOpen} />
      <FlyoutContent setOpen={setOpen} {...props} />
    </FlyoutContainer>
  )
}

export default function Commands(props) {
  return (
    <HoveredBackground>
      <Box
        accentable
        style={{cursor: 'pointer'}}
        margin={{horizontal: ICON_SPREAD}}
        align='center'
        justify='center'>
        <Flyout target={<Terminal size={ICON_HEIGHT} />}>
        {setOpen => (<CommandFlyout setOpen={setOpen} {...props} />)}
        </Flyout>
      </Box>
    </HoveredBackground>
  )
}