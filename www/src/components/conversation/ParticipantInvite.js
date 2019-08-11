import React, {createRef} from 'react'
import {Query, Mutation} from 'react-apollo'
import {TextInput, Drop, Box, Button, Text} from 'grommet'
import {Search, Trash} from 'grommet-icons'
import debounce from 'lodash/debounce';
import {CREATE_PARTICIPANTS, PARTICIPANTS_Q} from './queries'
import {SEARCH_USERS} from '../messages/queries'
import UserListEntry from '../users/UserListEntry'
import {mergeAppend} from '../../utils/array'


function ParticipantSuggestions(props) {
  if (props.q.length === 0 || !props.open)
      return (<span></span>)

  return (
    <Query query={SEARCH_USERS} variables={{name: props.q}}>
      {({data, loading}) => {
        if (loading) return (<span></span>)

        return (
          <Drop
            align={{ top: "bottom"}}
            target={props.targetRef.current}
            onClickOutside={() => props.setOpen(false)}
            onEsc={() => props.setOpen(false)}
          >
            <Box pad='small' gap='xsmall'>
              {data.searchUsers.edges.map((e) => (
                <Box onClick={() => {
                  props.clearValue()
                  props.setOpen(false)
                  props.addParticipant(e.node)
                }}>
                  <UserListEntry
                    key={e.node.id}
                    user={e.node} />
                </Box>
              ))}
            </Box>
          </Drop>
        )
      }}
    </Query>
  )
}

function ParticipantInviteRow(props) {
  return (
    <Box direction='row' justify='end' align='center' pad={{left: '10px', right: '10px'}}>
      <Box width='100%'><UserListEntry user={props.user} /></Box>
      <Trash style={{cursor: 'pointer'}} onClick={() => props.removeParticipant(props.user)} size='15px' />
    </Box>
  )
}

function ParticipantInviteButton(props) {
  const handles = props.participants.map((u) => u.handle)
  return (
    <Mutation
      mutation={CREATE_PARTICIPANTS}
      update={(cache, {data: {createParticipants}}) => {
        const prev = cache.readQuery({query: PARTICIPANTS_Q, variables: {conversationId: props.conversation.id}})
        const edges = prev.conversation.participants.edges
        let newEdges = createParticipants.map((p) => ({node: p, __typename: "ParticipantEdge"}))
        cache.writeQuery({
          query: PARTICIPANTS_Q,
          variables: {conversationId: props.conversation.id},
          data: {
            ...prev,
            conversation: {
              ...prev.conversation,
              participants: {
                ...prev.conversation.participants,
                edges: mergeAppend(edges, newEdges, (e) => e.node.id)
              }
            }
          }
        })
        props.close()
      }}>
      {mutation => (
        <Text size='small'>
          <Button label="Invite all" onClick={() => mutation({
            variables: {
              handles: handles,
              conversationId: props.conversation.id
            }
          })} />
        </Text>
      )}
    </Mutation>
  )
}


class ParticipantInvite extends React.Component {
  state = { value: "", q: "", open: false, participants: [] }
  boxRef = createRef()

  renderSuggestions = debounce(() => {this.setState({...this.state, q: this.state.value})}, 200)
  addParticipant = (user) => {
    if (this.state.participants.find((u) => u.id === user.id)) return

    this.state.participants.push(user)
    this.setState({...this.state, participants: this.state.participants})
  }

  removeParticipant = (user) => {
    this.setState({
      ...this.state,
      participants: this.state.participants.filter((u) => u.id !== user.id)
    })
  }

  render() {
    return (
      <Box>
        <Box
          height='30px'
          fill='horizontal'
          pad={{right: '10px', left: '10px'}}
          margin={{bottom: 'small'}}
        >
          <Box
            ref={this.boxRef}
            direction='row'
            align='center'
            round="xsmall"
            placeholder='search for conversa'
            pad={{left: '10px', right: '10px'}}
            border={{side: "all", color: "border"}}>
            <Search size='15px' />
            <TextInput
              type="search"
              plain
              value={this.state.value}
              onChange={(event) => {
                this.setState({value: event.target.value, open: true })
                this.renderSuggestions()
              }}
            />
            <ParticipantSuggestions
              q={this.state.q}
              setOpen={(open) => this.setState({...this.state, open: open})}
              clearValue={() => this.setState({...this.state, value: ''})}
              targetRef={this.boxRef}
              open={this.state.open}
              addParticipant={this.addParticipant}
              {...this.props}
            />
          </Box>
        </Box>
        <Box gap='xsmall'>
          {this.state.participants.map((user) => (
            <ParticipantInviteRow key={user.id} user={user} removeParticipant={this.removeParticipant} />
          ))}
          {this.state.participants.length > 0 && (
            <Box pad='small' width='50%'>
              <ParticipantInviteButton
                participants={this.state.participants}
                conversation={this.props.conversation}
                close={() => this.setState({ value: "", q: "", open: false, participants: [] })} />
            </Box>
          )}
        </Box>
      </Box>
    )
  }
}

export default ParticipantInvite