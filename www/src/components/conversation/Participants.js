import React from 'react'
import {Query} from 'react-apollo'
import {Box, Text} from 'grommet'
import {UserNew} from 'grommet-icons'
import Scroller from '../utils/Scroller'
import Dropdown from '../utils/Dropdown'
import UserListEntry from '../users/UserListEntry'
import {PARTICIPANTS_Q, PARTICIPANT_SUB} from './queries'
import {mergeAppend} from '../../utils/array'
import {BOX_ATTRS} from './ConversationHeader'
import SubscriptionWrapper from '../utils/SubscriptionWrapper'

function addParticipant(participant, prev) {
  const participants = prev.conversation.participants.edges
  const exists = participants.find((edge) => edge.node.id === participant.id);
  if (exists) return prev;

  let participantNode = {node: participant, __typename: "ParticipantEdge"}
  return Object.assign({}, prev, {
    conversation: {
      ...prev.conversation,
      participants: {
        ...prev.conversation.participants,
        edges: [participantNode, ...participants],
      }
    }
  })
}

function deleteParticipant(participant, prev) {
  const participants = prev.conversation.participants.edges.filter((e) => e.node.id !== participant.id)

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

const _subscribeToParticipantDeltas = async (props, subscribeToMore) => {
  return subscribeToMore({
    document: PARTICIPANT_SUB,
    variables: {conversationId: props.conversation.id},
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev
      const participantDelta = subscriptionData.data.participantDelta
      const participant = participantDelta.payload

      switch (participantDelta.delta) {
        case "CREATE":
          return addParticipant(participant, prev)
        case "DELETE":
          return deleteParticipant(participant, prev)
        default:
          return prev
      }
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
          return _subscribeToParticipantDeltas(props, subscribeToMore)
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
        )
      }}
    </Query>
  )
}

export default Participants