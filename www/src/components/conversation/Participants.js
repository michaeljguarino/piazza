import React from 'react'
import { Box, Text } from 'grommet'
import { User } from 'grommet-icons'
import { Scroller, Flyout, FlyoutHeader, FlyoutContainer, useSubscription, Loading } from 'forge-core'
import { PARTICIPANT_SUB, CONVERSATION_CONTEXT } from './queries'
import { mergeAppend } from '../../utils/array'
import { HeaderIcon } from './ConversationHeader'
import ParticipantInvite, { ParticipantInviteButton } from './ParticipantInvite'
import MagicLinkInvite from './MagicLinkInvite'
import { Loader } from './utils'
import { useQuery } from 'react-apollo'
import UserListEntry from '../users/UserListEntry'

function addParticipant(participant, prev) {
  const participants = prev.conversation.participants.edges
  const exists = participants.find((edge) => edge.node.id === participant.id);
  if (exists) return updateParticipant(participant, prev)

  let edge = {node: participant, __typename: "ParticipantEdge"}
  return Object.assign({}, prev, {
    conversation: {
      ...prev.conversation,
      participantCount: prev.conversation.participantCount + 1,
      participants: {
        ...prev.conversation.participants,
        edges: [edge, ...participants],
      }
    }
  })
}

function updateParticipant(participant, prev) {
  const edges = prev.conversation.participants.edges
  return {
    ...prev,
    conversation: {
      ...prev.conversation,
      participants: {
        ...prev.conversation.participants,
        edges: edges.map(e => e.node.id === participant.id ? {...e, node: participant} : e)
      }
    }
  }
}

function deleteParticipant(participant, prev) {
  const exists = prev.conversation.participants.find((edge) => edge.node.id === participant.id);
  if (!exists) return prev

  return {
    ...prev,
    conversation: {
      ...prev.conversation,
      participantCount: prev.conversation.participantCount - 1,
      participants: {
        ...prev.conversation.participants,
        edges: prev.conversation.participants.edges.filter((e) => e.node.id !== participant.id),
      }
    }
  }
}

const doFetchMore = (prev, {fetchMoreResult}) => {
  const edges = fetchMoreResult.conversation.participants.edges
  const pageInfo = fetchMoreResult.conversation.participants.pageInfo

  return {
    ...prev,
    conversation: {
      ...prev.conversation,
      participants: {
        ...prev.conversation.participants,
        pageInfo,
        edges: mergeAppend(edges, prev.conversation.participants.edges, (e) => e.node.id)
      }
    }
  }
}

const _subscribeToParticipantDeltas = (props, subscribeToMore) => {
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
        case "UPDATE":
          return updateParticipant(participant, prev)
        default:
          return prev
      }
    }
  })
}

function FlyoutContent({conversationId, setOpen}) {
  const {data, fetchMore} = useQuery(CONVERSATION_CONTEXT, {variables: {id: conversationId}})

  if (!data) return <Loading width='40vw' />

  const {conversation} = data
  const {participants: {edges, pageInfo}} = conversation

  return (
    <FlyoutContainer width='40vw'>
      <FlyoutHeader text='Participants' setOpen={setOpen} />
      <Box fill margin={{bottom: 'small'}} border='bottom'>
        <Scroller
          style={{overflow: 'auto', height: '100%'}}
          edges={edges}
          mapper={(p) => (<UserListEntry key={p.node.id} margin={{bottom: 'xsmall'}} user={p.node.user} />)}
          onLoadMore={() => {
            pageInfo.hasNextPage && fetchMore({
              variables: {partCursor: pageInfo.endCursor},
              updateQuery: doFetchMore})
          }} />
      </Box>
      <Box flex={false}>
        <Text margin={{left: '10px', bottom: 'small'}}>Add more:</Text>
        <ParticipantInvite
          direction='row'
          conversation={conversation}>
        {(participants, clearInput) => (
          <ParticipantInviteButton
            participants={participants}
            conversation={conversation}
            close={clearInput} />
        )}
        </ParticipantInvite>
        <MagicLinkInvite conversation={conversation} />
      </Box>
    </FlyoutContainer>
  )
}

export default function Participants({loading, data, fetchMore, subscribeToMore, ...props}) {
  useSubscription(
    () => _subscribeToParticipantDeltas(props, subscribeToMore),
    props.conversation.id
  )

  if (loading) return <Loader />
  const {participantCount} = data.conversation

  return (
    <Flyout width='30vw' target={<HeaderIcon icon={User} count={participantCount} />}>
    {setOpen => (<FlyoutContent conversationId={props.conversation.id} setOpen={setOpen} />)}
    </Flyout>
  )
}