import React, {createRef} from 'react'
import {Mutation, ApolloConsumer} from 'react-apollo'
import {Box} from 'grommet'
import debounce from 'lodash/debounce'
import uniqBy from 'lodash/uniqBy'
import {CREATE_PARTICIPANTS, PARTICIPANTS_Q} from './queries'
import TagInput from '../utils/TagInput'
import {mergeAppend} from '../../utils/array'
import {SEARCH_USERS} from '../messages/queries'
import {userSuggestion} from '../messages/MentionManager'
import Button from '../utils/Button'

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
        <Button
          size='small'
          onClick={() => mutation({
            variables: {
              handles: props.participants,
              conversationId: props.conversation.id
            }
          })}
          margin={{left: 'xsmall'}}
          label='Go'
          height='100%'
          width='50px' />
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
    const additional = this.props.additional || []
    const allParticipants = uniqBy([...additional, ...this.state.participants], (u) => u.id)
    return (
      <ApolloConsumer>
      {client => (
        <Box direction={this.props.direction || 'column'} pad={this.props.pad || {left: 'small', right: 'small'}}>
          <TagInput
            placeholder="Search for users by handle..."
            round='xsmall'
            suggestions={this.state.suggestions}
            value={allParticipants.map((u) => u.handle)}
            onRemove={(handle) => {
              this.props.onRemoveParticipant && this.props.onRemoveParticipant(handle)
              this.onRemoveTag(handle)
            }}
            onAdd={(u) => {
              this.props.onAddParticipant && this.props.onAddParticipant(u.value)
              this.onAddTag(u)
            }}
            onChange={({ target: { value } }) => fetchUsers(client, value, this.setSuggestions)}
            button={this.props.children(allParticipants.map(mapper), this.clearInput)}
          />
        </Box>
      )}
      </ApolloConsumer>
    )
  }
}

export default ParticipantInvite