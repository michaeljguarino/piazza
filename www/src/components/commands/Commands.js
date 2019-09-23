import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Terminal} from 'grommet-icons'
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
import {mergeAppend} from '../../utils/array'

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
          const {edges, pageInfo} = data.commands
          return (
            <Box>
              <Scroller
                id='commands-viewport'
                edges={edges}
                style={{overflow: 'auto', maxHeight: '80%'}}
                mapper={({node}) => (
                  <CommandListEntry
                    key={node.id} pad={{vertical: 'xsmall', horizontal: 'small'}} command={node} />
                )}
                onLoadMore={() => {
                  if (!pageInfo.hasNextPage)  return
                  fetchMore({
                    variables: {cursor: pageInfo.endCursor},
                    updateQuery: (prev, {fetchMoreResult}) => {
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
                  })
                }}
              />
            </Box>
          )}}
        </Query>
        <Box margin={{top: 'xsmall'}} pad='small' border='top'>
          <Modal target={<SecondaryButton round='xsmall' label='Create more' />}>
          {setOpen => (<CommandCreator setOpen={setOpen} />)}
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
        <Flyout target={<Terminal size='25px' />}>
        {setOpen => (<FlyoutContent setOpen={setOpen} {...props} />)}
        </Flyout>
      </Box>
    </HoveredBackground>
  )
}

export default Commands