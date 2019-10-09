import React from 'react'
import {Query} from 'react-apollo'
import {Box, Text} from 'grommet'
import {UserNew} from 'grommet-icons'
import Scroller from '../utils/Scroller'
import Flyout, {FlyoutHeader, FlyoutContainer} from '../utils/Flyout'
import Avatar from '../users/Avatar'
import UserHandle from '../users/UserHandle'
import {PARTICIPANTS_Q, PARTICIPANT_SUB} from './queries'
import {mergeAppend} from '../../utils/array'
import {BOX_ATTRS} from './ConversationHeader'
import SubscriptionWrapper from '../utils/SubscriptionWrapper'
import HoveredBackground from '../utils/HoveredBackground'
import WithPresence from '../utils/presence'
import PresenceIndicator from '../users/PresenceIndicator'
import ParticipantInvite, {ParticipantInviteButton} from './ParticipantInvite'
import MagicLinkInvite from './MagicLinkInvite'
import {Loader} from './utils'

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


function Participant(props) {
  return (
    <Box width='300px' direction='row' align='center' pad='xsmall'>
      <Avatar user={props.user} />
      <Box>
        <WithPresence id={props.user.id} >
          {present => (<Text size='small'>{props.user.name} <PresenceIndicator present={present} /></Text>)}
        </WithPresence>
        <Text size='small'><UserHandle user={props.user} align={{right: 'left'}}/></Text>
      </Box>
    </Box>
  )
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

function Participants(props) {
  return (
    <Query query={PARTICIPANTS_Q} variables={{conversationId: props.conversation.id}}>
    {({loading, data, fetchMore, subscribeToMore}) => {
      if (loading) return <Loader />
      let pageInfo = data.conversation.participants.pageInfo
      let edges = data.conversation.participants.edges
      return (
        <SubscriptionWrapper id={props.conversation.id} startSubscription={() => {
          return _subscribeToParticipantDeltas(props, subscribeToMore)
        }}>
          <Flyout width='30vw' target={
            <HoveredBackground>
              <Box {...BOX_ATTRS} accentable>
                <Text height='12px' style={{lineHeight: '12px'}} margin={{right: '3px'}}>
                  <UserNew size='12px' />
                </Text>
                <Text size='xsmall'>{data.conversation.participantCount}</Text>
              </Box>
            </HoveredBackground>
          }>
          {setOpen => (
            <FlyoutContainer width='40vw'>
              <FlyoutHeader text='Participants' setOpen={setOpen} />
              <Box
                pad={{left: "small", right: 'small', bottom: 'small'}}
                gap='small'
                margin={{bottom: 'small'}}
                border='bottom'>
                <Scroller
                  style={{
                    overflow: 'auto',
                    maxHeight: '70%',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexDirection: 'column',
                  }}
                  edges={edges}
                  mapper={(p) => (<Participant key={p.node.id} user={p.node.user} />)}
                  onLoadMore={() => {
                    if (!pageInfo.hasNextPage) return
                    fetchMore({
                      variables: {cursor: pageInfo.endCursor},
                      updateQuery: doFetchMore})
                  }} />
              </Box>
              <Text margin={{left: '10px', bottom: 'small'}}>Add more:</Text>
              <ParticipantInvite
                direction='row'
                conversation={props.conversation}>
              {(participants, clearInput) => (
                <ParticipantInviteButton
                  participants={participants}
                  conversation={props.conversation}
                  close={clearInput} />
              )}
              </ParticipantInvite>
              <MagicLinkInvite conversation={props.conversation} />
            </FlyoutContainer>
          )}
          </Flyout>
        </SubscriptionWrapper>
        )
      }}
    </Query>
  )
}

export default Participants