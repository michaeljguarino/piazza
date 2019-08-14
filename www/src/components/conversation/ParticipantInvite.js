import React, {createRef} from 'react'
import {Mutation, ApolloConsumer} from 'react-apollo'
import {Box, Anchor, Text} from 'grommet'
import debounce from 'lodash/debounce';
import {CREATE_PARTICIPANTS, PARTICIPANTS_Q} from './queries'
import TagInput from '../utils/TagInput'
import {mergeAppend} from '../../utils/array'
import {fetchUsers} from '../messages/MentionManager'

function ParticipantInviteButton(props) {
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
          <Anchor onClick={() => mutation({
            variables: {
              handles: props.participants,
              conversationId: props.conversation.id
            }
          })}>
            Invite all
          </Anchor>
        </Text>
      )}
    </Mutation>
  )
}


class ParticipantInvite extends React.Component {
  state = { value: "", q: "", open: false, participants: [], suggestions: [] }
  boxRef = createRef()

  renderSuggestions = debounce(() => {this.setState({...this.state, q: this.state.value})}, 200)

  onRemoveTag = tag => {
    const { participants } = this.state;
    this.setState({
      participants: participants.filter((t) => t !== tag)
    });
  };

  onAddTag = tag => {
    const { participants } = this.state;
    this.setState({
      participants: [...participants, tag.value], suggestions: []
    });
  };

  setSuggestions = (suggestions) => {
    this.setState({suggestions: suggestions})
  }

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
      <ApolloConsumer>
      {client => (
        <Box pad={{left: 'small', right: 'small'}}>
          <TagInput
            placeholder="Search for users by handle..."
            suggestions={this.state.suggestions}
            value={this.state.participants}
            onRemove={this.onRemoveTag}
            onAdd={this.onAddTag}
            onChange={({ target: { value } }) => fetchUsers(client, value, this.setSuggestions)}
          />
          <Box>
            {this.state.participants.length > 0 && (
              <Box pad='small'>
                <ParticipantInviteButton
                  participants={this.state.participants}
                  conversation={this.props.conversation}
                  close={() => this.setState({ value: "", q: "", open: false, participants: [] })} />
              </Box>
            )}
          </Box>
        </Box>
      )}
      </ApolloConsumer>
    )
  }
}

export default ParticipantInvite