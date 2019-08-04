import React, {useState} from 'react'
import {Box} from 'grommet'
import Loading from '../utils/Loading'
import {Query, ApolloConsumer} from 'react-apollo'
import {updateUnreadMessages, subscribeToNewConversations} from '../conversation/utils'
import {CONVERSATIONS_Q} from '../conversation/queries'

const POLL_INTERVAL=30000
export const Conversations = React.createContext({
                                currentConversation: null,
                                conversations: null,
                                setCurrentConversation: null
                             })

function MyConversations(props) {
  const [currentConversation, setCurrentConversation] = useState(null)


  return (
    <ApolloConsumer>
    {client => (
      <Query query={CONVERSATIONS_Q} pollInterval={POLL_INTERVAL}>
      {({loading, _error, data, loadMore, subscribeToMore}) => {
        if (loading) return (<Box height="100vh"><Loading /></Box>)
        let current = currentConversation || data.conversations.edges[0].node
        const wrappedSetCurrentConversation = (conv) => {
          if (conv) {
            updateUnreadMessages(client, conv.id, () => 0)
          }
          setCurrentConversation(conv)
        }
        subscribeToNewConversations(subscribeToMore)
        return (
          <Conversations.Provider value={{
            currentConversation: current,
            conversations: data.conversations,
            setCurrentConversation: wrappedSetCurrentConversation,
            loadMore: loadMore
          }}>
            {props.children(current, data.conversations, wrappedSetCurrentConversation, loadMore)}
          </Conversations.Provider>
        )
      }}
      </Query>
    )}
    </ApolloConsumer>
  )
}

export default MyConversations