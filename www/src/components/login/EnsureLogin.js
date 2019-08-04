import React from 'react'
import {Redirect} from 'react-router-dom'
import {Box} from 'grommet'
import {Query} from 'react-apollo'
import Loading from '../utils/Loading'
import {ME_Q} from '../users/queries'
import {wipeToken} from '../../helpers/authentication'

// const POLL_INTERVAL=30000
export const CurrentUserContext = React.createContext({})

function CurrentUser(props) {
  return (
    <Query query={ME_Q}>
      { ({loading, error, data}) => {
        if (loading) {
          return (<Box height='100vh'><Loading/></Box>)
        }
        if (error || !data.me || !data.me.id) {
          wipeToken()
          return (<Redirect to='/login'/>)
        }
        let me = data.me
        return (
          <CurrentUserContext.Provider value={me}>
            {props.children(me)}
          </CurrentUserContext.Provider>
        )
      }}
    </Query>
  )
}

export default CurrentUser