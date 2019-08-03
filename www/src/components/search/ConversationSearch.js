import React, {createRef} from 'react'
import {Query, ApolloConsumer} from 'react-apollo'
import {TextInput, Drop, Box, Anchor} from 'grommet'
import {Search} from 'grommet-icons'
import debounce from 'lodash/debounce';
import {SEARCH_Q} from './queries'
import {CONVERSATIONS_Q} from '../conversation/queries'

function addConversation(client, conversation) {
  const {conversations} = client.readQuery({ query: CONVERSATIONS_Q });
  if (conversations.edges.find((e) => e.node.id === conversation.id))
    return

  client.writeQuery({
    query: CONVERSATIONS_Q,
    data: {
      conversations: {
        ...conversations,
        edges: [{__typename: "ConversationEdge", node: conversation}, ...conversations.edges],
    }}
  });
}


function ConversationSuggestions(props) {
  if (props.q.length === 0 || !props.open)
      return (<span></span>)

  function _wrappedSetCurrentConversation(conversation) {
    addConversation(props.client, conversation)
    props.setCurrentConversation(conversation)
  }

  return (
    <Query query={SEARCH_Q} variables={{q: props.q}}>
      {({data, loading}) => {
        if (loading) return (<span></span>)

        return (
          <Drop
            align={{ top: "bottom"}}
            target={props.targetRef.current}
            onClickOutside={() => props.setOpen(false)}
            onEsc={() => props.setOpen(false)}
          >
            {data.searchConversations.edges.map((e, index, list) => (
              <ConversationResult
                node={e.node}
                name={e.node.name}
                index={index}
                list={list}
                setCurrentConversation={_wrappedSetCurrentConversation} />
            ))}
          </Drop>
        )
      }}
    </Query>
  )
}

function ConversationResult(props) {
  return (
    <Box
      direction="row"
      align="center"
      gap="small"
      border={props.index < props.list.length - 1 ? "bottom" : undefined}
      pad="small">
      <Anchor size='small' onClick={() => props.setCurrentConversation(props.node)}># {props.name}</Anchor>
    </Box>
  )
}


class ConversationSearch extends React.Component {
  state = { value: "", q: "", open: true}
  boxRef = createRef()

  renderSuggestions = debounce(() => {this.setState({q: this.state.value})}, 200)

  render() {
    return (
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
          <ConversationSuggestions
            q={this.state.q}
            setOpen={(open) => this.setState({open: open})}
            targetRef={this.boxRef}
            open={this.state.open}
            {...this.props}
          />
        </Box>
      </Box>
    )
  }
}

function WrappedConvSearch(props) {
  return (
    <ApolloConsumer>
      {client => (<ConversationSearch client={client} {...props} />)}
    </ApolloConsumer>
  )
}

export default WrappedConvSearch