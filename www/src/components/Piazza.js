import React from 'react'
import { Query } from 'react-apollo'
import { Redirect } from 'react-router'
import gql from 'graphql-tag'
import MessageList from './conversation/MessageList'
import MessageInput from './conversation/MessageInput'
import Conversations from './conversation/Conversations'

const ME_Q=gql`
query {
  me {
    id
  }
}
`
const CONVERSATIONS_Q = gql`
{
  conversations(public: true, first: 20) {
    edges {
      node {
        id
        name
      }
    }
  }
}
`

const Piazza = () => (
  <Query query={ME_Q}>
    { ({loading, error, data}) => {
      console.log(loading)
      console.log(error)
      console.log(data)
      if (loading) {
        return (<div>Loading...</div>)
      }
      if (error || !data.me || !data.me.id) {
        return (<Redirect to='/login'/>)
      }

      return (
        <Query query={CONVERSATIONS_Q}>
          {({loading, _error, data}) => {
            if (loading) return <div>Loading...</div>
            let first = data.conversations.edges[0].node
            return (
              <div>
                <Conversations conversations={data.conversations.edges} />
                <MessageList conversation={first} />
                <MessageInput conversation={first} />
              </div>
            )
          }}
        </Query>
      )
    }}
  </Query>
)

export default Piazza