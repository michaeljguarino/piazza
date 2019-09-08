import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Code} from 'grommet-icons'
import { Query } from 'react-apollo'
import CommandListEntry from './CommandListEntry'
import CommandCreator from './CommandCreator'
import InstallableCommands from './InstallableCommands'
import Scroller from '../utils/Scroller'
import HoveredBackground from '../utils/HoveredBackground'
import {COMMANDS_Q} from './queries'
import Flyout, {FlyoutHeader} from '../utils/Flyout'
import Modal from '../utils/Modal'
import Expander from '../utils/Expander'
import {SecondaryButton} from '../utils/Button'

function FlyoutContent(props) {
  const [expanded, setExpanded] = useState(false)
  return (
    <Box>
      <FlyoutHeader text='Commands' setOpen={props.setOpen} />
      {!expanded && (
        <>
        <Box pad='small' style={{maxWidth: '30vw'}}>
          <Text size='small'>
            <i>
              Commands can automate basic tasks.  They support a message webhook, and
              an incoming webhook to send messages ad hoc.
            </i>
          </Text>
        </Box>
        <Query query={COMMANDS_Q}>
        {({loading, data, fetchMore}) => {
          if (loading) return null
          let commandEdges = data.commands.edges
          let pageInfo = data.commands.pageInfo
          return (
            <Box>
              <Scroller
                id='message-viewport'
                edges={commandEdges}
                style={{overflow: 'auto', maxHeight: '80%'}}
                mapper={(edge) => (
                  <CommandListEntry
                    key={edge.node.id}
                    pad={{vertical: 'xsmall', horizontal: 'small'}}
                    command={edge.node}
                    color={props.color} />
                )}
                onLoadMore={() => {
                  if (!pageInfo.hasNextPage) {
                    return
                  }
                  fetchMore({
                    variables: {cursor: pageInfo.endCursor},
                    updateQuery: (prev, {fetchMoreResult}) => {
                      const edges = fetchMoreResult.commands.edges
                      const pageInfo = fetchMoreResult.commands.pageInfo
                      if (commandEdges.find((edge) => edge.node.id === edges[0].node.id)) {
                        return prev;
                      }
                      return edges.length ? {
                        commands: {
                          ...prev,
                          edges: [...prev.commands.edges, ...edges],
                          pageInfo
                        }
                      } : prev;
                    }
                  })
                }}
              />
            </Box>
          )}}
        </Query>
        <Box margin={{top: 'xsmall'}} pad='small' border='top'>
          <Modal target={<SecondaryButton label='Create more' />}>
          {setOpen => (
            <CommandCreator setOpen={setOpen} />
          )}
          </Modal>
        </Box>
        </>
      )}
      <Box>
        <Box onClick={() => setExpanded(!expanded)}>
          <Expander text='Browse installable commands' expanded={expanded} />
        </Box>
        {expanded && (<InstallableCommands />)}
      </Box>
    </Box>
  )
}

function Commands(props) {
  return (
    <HoveredBackground>
      <Box
        accentable
        style={{cursor: 'pointer'}}
        margin={{horizontal: '10px'}}
        align='center'
        justify='center'>
        <Flyout target={<Code size='25px' />}>
        {setOpen => (
          <FlyoutContent setOpen={setOpen} {...props} />
        )}
        </Flyout>
      </Box>
    </HoveredBackground>
  )
}

export default Commands