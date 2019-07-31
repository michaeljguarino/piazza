import React, {useState} from 'react'
import { Query, Mutation } from 'react-apollo'
import {Box, Text, Markdown} from 'grommet'
import {UserNew, Trash} from 'grommet-icons'
import Dropdown from '../utils/Dropdown'
import UserListEntry from '../users/UserListEntry'
import {PARTICIPANTS_Q, DELETE_CONVERSATION, UPDATE_CONVERSATION, CONVERSATIONS_Q} from './queries'
import ConversationEditForm from './ConversationEditForm'
import NotificationIcon from '../notifications/NotificationIcon'
import Scroller from '../Scroller'
import {mergeAppend} from '../../utils/array'

const BOX_ATTRS = {
  direction: "row",
  align: "center",
  style: {cursor: 'pointer', lineHeight: '15px'},
  pad: {right: '5px', left: '5px'},
  border: 'right'
}

function ConversationDelete(props) {
  return (
    <Mutation
      mutation={DELETE_CONVERSATION}
      variables={{id: props.conversation.id}}
      update={(cache, {data: {deleteConversation}}) => {
      props.setCurrentConversation(null)
        const {conversations} = cache.readQuery({ query: CONVERSATIONS_Q });
        const newData = {
          conversations: {
            ...conversations,
            edges: conversations.edges.filter((edge) => edge.node.id !== deleteConversation.id),
        }}

        cache.writeQuery({
          query: CONVERSATIONS_Q,
          data: newData
        });
      }}>
      {(mutation) => (
        <Trash size="15px" onClick={mutation} />
      )}
    </Mutation>
  )
}

function ConversationUpdate(props) {
  const [attributes, setAttributes] = useState({
    name: props.conversation.name,
    topic: props.conversation.topic
  })
  const [open, setOpen] = useState(false)
  return (
    <Mutation
      mutation={UPDATE_CONVERSATION}
      variables={{id: props.conversation.id, attributes: attributes}}
      update={(cache, {data: {updateConversation}}) => {
        const {conversations} = cache.readQuery({ query: CONVERSATIONS_Q });
        const newData = {
          conversations: {
            ...conversations,
            edges: conversations.edges.map((edge) => {
              if (edge.node.id !== updateConversation.id) return edge

              return {
                ...edge,
                node: updateConversation
              }
            })
          }
        }

        cache.writeQuery({
          query: CONVERSATIONS_Q,
          data: newData
        });
        setOpen(false)
      }} >
      {(mutation) => (
        <Dropdown open={open}>
          <Text syle={{lineHeight: '15px'}} size='xsmall' margin={{right: '3px'}}>
            <Markdown>{props.conversation.topic || "Add a description"}</Markdown>
          </Text>
          <Box align='center' justify='center' pad='small'>
            <Text>Update #{props.conversation.name}</Text>
          </Box>
          <ConversationEditForm
            state={{name: props.conversation.name, topic: props.conversation.topic}}
            mutation={mutation}
            onStateChange={(update) => setAttributes({...attributes, ...update})}
            open={open}
            action='update' />
        </Dropdown>
      )}
    </Mutation>
  )
}

function ConversationHeader(props) {
  const [editing, setEditing] = useState(false)
  return (
    <Box direction='row' border='bottom' pad={{left: '20px', top: '10px'}} margin={{bottom: '10px'}}>
      <Box fill='horizontal' direction='column'>
        <Text weight='bold' margin={{bottom: '5px'}}>#{props.conversation.name}</Text>
        <Query query={PARTICIPANTS_Q} variables={{conversationId: props.conversation.id}}>
          {({loading, data, fetchMore}) => {
            if (loading) return (<Box direction='row'>...</Box>)
            let pageInfo = data.conversation.participants.pageInfo
            let edges = data.conversation.participants.edges
            return (
              <Box height='25px' direction='row' align='end' justify='start' pad={{top: '5px', bottom: '5px'}}>
                <Dropdown>
                  <Box {...BOX_ATTRS}>
                    <Text height='15px' style={{lineHeight: '15px'}} margin={{right: '3px'}}><UserNew size='15px' /></Text>
                    <Text size='xsmall'>{data.conversation.participants.edges.length}</Text>
                  </Box>
                  <Box pad="small" gap='small' style={{maxHeight: '300px'}}>
                    <Text size='small' weight='bold'>Participants</Text>
                    <Scroller
                      edges={edges}
                      mapper={(p) => (<UserListEntry key={p.node.id} user={p.node.user} color='normal' />)}
                      onLoadMore={() => {
                        if (!pageInfo.hasNextPage) return
                        fetchMore({
                          variables: {cursor: pageInfo.endCursor},
                          updateQuery: (prev, {fetchMoreResult}) => {
                            const edges = fetchMoreResult.notifications.participants.edges
                            const pageInfo = fetchMoreResult.notifications.participants.pageInfo

                            return edges.length ? {
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                participants: {
                                  ...prev.notifications.participants,
                                  pageInfo,
                                  edges: mergeAppend(edges, prev.notifications.participants.edges, (e) => e.node.id)
                                }
                              }
                            } : prev;
                          }
                        })
                      }} />
                  </Box>
                </Dropdown>
                <Box {...BOX_ATTRS} align='center' justify='center' border={null} onMouseOver={() => setEditing(true)} onMouseOut={() => setEditing(false)}>
                  <ConversationUpdate editing={editing} {...props} />
                  <Text style={editing ? {lineHeight: '15px'} : {lineHeight: '15px', visibility: 'hidden'}}>
                    <ConversationDelete {...props} />
                  </Text>
                </Box>
              </Box>
            )
          }}
        </Query>
      </Box>
      <NotificationIcon {...props} />
    </Box>
  )
}

export default ConversationHeader