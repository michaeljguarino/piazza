import React, {createRef} from 'react'
import {Mutation, ApolloConsumer} from 'react-apollo'
import {Box, Anchor, Text} from 'grommet'
import debounce from 'lodash/debounce'
import {CREATE_PARTICIPANTS, PARTICIPANTS_Q} from './queries'
import TagInput from '../utils/TagInput'
import {mergeAppend} from '../../utils/array'
import {SEARCH_USERS} from '../messages/queries'
import {userSuggestion} from '../messages/MentionManager'

function fetchUsers(client, query, callback) {
  if (!query) return

  client.query({
    query: SEARCH_USERS,
    variables: {name: query}})
  .then(({data}) => {
    return data.searchUsers.edges.map(edge => ({
      value: edge.node,
      label: userSuggestion(edge.node)
    }))
  }).then(callback)
}

export function ParticipantInviteButton(props) {
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
    const { participants } = this.state
    this.setState({
      participants: participants.filter((t) => t.handle !== tag)
    })
  }

  onAddTag = tag => {
    const { participants } = this.state
    this.setState({
      participants: [...participants, tag.value], suggestions: []
    })
  }

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

  clearInput = () => {
    this.setState({ value: "", q: "", open: false, participants: [], suggestions: [] })
  }

  render() {
    const mapper = this.props.mapper || ((p) => p.handle)
    return (
      <ApolloConsumer>
      {client => (
        <Box direction={this.props.direction || 'column'} pad={this.props.pad || {left: 'small', right: 'small'}}>
          <TagInput
            placeholder="Search for users by handle..."
            suggestions={this.state.suggestions}
            value={this.state.participants.map((u) => u.handle)}
            onRemove={this.onRemoveTag}
            onAdd={this.onAddTag}
            onChange={({ target: { value } }) => fetchUsers(client, value, this.setSuggestions)}
          />
          {this.props.children(this.state.participants.map(mapper), this.clearInput)}
        </Box>
      )}
      </ApolloConsumer>
    )
  }
}

export default ParticipantInvite