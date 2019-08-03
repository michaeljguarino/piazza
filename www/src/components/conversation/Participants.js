import React from 'react'
import {Query} from 'react-apollo'
import {Box, Text} from 'grommet'
import {UserNew} from 'grommet-icons'
import Scroller from '../Scroller'
import Dropdown from '../utils/Dropdown'
import UserListEntry from '../users/UserListEntry'
import {PARTICIPANTS_Q, NEW_PARTICIPANTS_SUB, DELETED_PARTICIPANTS_SUB} from './queries'
import {mergeAppend} from '../../utils/array'
import {BOX_ATTRS} from './ConversationHeader'
import SubscriptionWrapper from '../utils/SubscriptionWrapper'

const _subscribeToNewParticipants = async (props, subscribeToMore) => {
  return subscribeToMore({
    document: NEW_PARTICIPANTS_SUB,
    variables: {conversationId: props.conversation.id},
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev
      const newParticipant = subscriptionData.data.newParticipants
      const participants = prev.conversation.participants.edges
      const exists = participants.find((edge) => edge.node.id === newParticipant.id);
      if (exists) return prev;

      let newParticipantNode = {node: newParticipant, __typename: "ParticipantEdge"}
      return Object.assign({}, prev, {
        conversation: {
          ...prev.conversation,
          participants: {
            ...prev.conversation.participants,
            edges: [newParticipantNode, ...participants],
          }
        }
      })
    }
  })
}

const _subscribeToDeletedParticipants = async (props, subscribeToMore) => {
  return subscribeToMore({
    document: DELETED_PARTICIPANTS_SUB,
    variables: {conversationId: props.conversation.id},
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev
      const deleted = subscriptionData.data.deletedParticipants
      const participants = prev.conversation.participants.edges.filter((e) => e.node.id !== deleted.id)

      return Object.assign({}, prev, {
        conversation: {
          ...prev.conversation,
          participants: {
            ...prev.conversation.participants,
            edges: participants,
          }
        }
      })
    }
  })
}

function Participants(props) {
  return (
    <Query query={PARTICIPANTS_Q} variables={{conversationId: props.conversation.id}}>
    {({loading, data, fetchMore, subscribeToMore}) => {
      if (loading) return (<Box direction='row'>...</Box>)
      let pageInfo = data.conversation.participants.pageInfo
      let edges = data.conversation.participants.edges
      return (
        <SubscriptionWrapper id={props.conversation.id} startSubscription={() => {
          return _subscribeToNewParticipants(props, subscribeToMore)
        }}>
          <SubscriptionWrapper id={"deleted-" + props.conversation.id} startSubscription={() => {
            return _subscribeToDeletedParticipants(props, subscribeToMore)
          }}>
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
                        const edges = fetchMoreResult.conversation.participants.edges
                        const pageInfo = fetchMoreResult.conversation.participants.pageInfo

                        return edges.length ? {
                          ...prev,
                          conversation: {
                            ...prev.conversation,
                            participants: {
                              ...prev.conversation.participants,
                              pageInfo,
                              edges: mergeAppend(edges, prev.conversation.participants.edges, (e) => e.node.id)
                            }
                          }
                        } : prev;
                      }
                    })
                  }} />
              </Box>
            </Dropdown>
          </SubscriptionWrapper>
        </SubscriptionWrapper>
        )
      }}
    </Query>
  )
}

export default Participants