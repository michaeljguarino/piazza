import React, {useState} from 'react'
import {Box, Text, Anchor} from 'grommet'
import {Code} from 'grommet-icons'
import { Query } from 'react-apollo'
import CommandListEntry from './CommandListEntry'
import CommandCreator from './CommandCreator'
import Scroller from '../utils/Scroller'
import {COMMANDS_Q} from './queries'
import Flyout, {FlyoutHeader} from '../utils/Flyout'
import Modal from '../utils/Modal'

function Commands(props) {
  const [hover, setHover] = useState(false)
  const color = hover ? 'accent-1' : null
  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{cursor: 'pointer'}}
      margin={{horizontal: '10px'}}
      align='center'
      justify='center'>
      <Flyout
        target={<Code color={color} size='25px' />}
        onOpen={() => setHover(false)}>
      {setOpen => (
        <Box>
          <FlyoutHeader text='Commands' setOpen={setOpen} />
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
              <Box pad='small'>
                <Scroller
                  id='message-viewport'
                  edges={commandEdges}
                  style={{
                    overflow: 'auto',
                    maxHeight: '80%'
                  }}
                  mapper={(edge) => (
                    <CommandListEntry
                      key={edge.node.id}
                      pad={{bottom: 'small'}}
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
          <Box pad='small' border='top'>
            <Modal target={<Anchor size='small'>Create more</Anchor>}>
            {setOpen => (
              <CommandCreator setOpen={setOpen} />
            )}
            </Modal>
          </Box>
        </Box>
      )}
      </Flyout>
    </Box>
  )
}

export default Commands