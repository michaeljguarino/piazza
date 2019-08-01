import React from 'react'
import {socket} from '../../helpers/client'
import {Presence} from 'phoenix'

const SUBSCRIPTIONS = {}
const PRESENCE_CACHE = {}
let idCounter = 0

const channel = socket.channel("lobby")
channel.join()
const presence = new Presence(channel)
presence.onSync(() => {
  const ids = presence.list((id) => id)
  for (const id of ids) {
    PRESENCE_CACHE[id] = true
  }
  notifySubscribers(ids)
})
presence.onJoin((id) => {
  PRESENCE_CACHE[id] = true
  notifySubscribers([id])
})
presence.onLeave((id, current) => {
  if (current.metas.length === 0) {
    PRESENCE_CACHE[id] = false
    notifySubscribers([id])
  }
})

function subscribe(id, callback) {
  let callbacks = SUBSCRIPTIONS[id] || {}
  const subscriptionId = ++idCounter;
  callbacks[subscriptionId] = callback
  SUBSCRIPTIONS[id] = callbacks
  return subscriptionId
}

function notifySubscribers(presences) {
  for (const id of presences) {
    const present = PRESENCE_CACHE[id]
    for (const callback of Object.values(SUBSCRIPTIONS[id])) {
      callback(present)
    }
  }
}

function unsubscribe(id, subscriptionId) {
  if (SUBSCRIPTIONS[id] && SUBSCRIPTIONS[id][subscriptionId]) {
    delete SUBSCRIPTIONS[id][subscriptionId]
  }
}

class WithPresence extends React.Component {
  state = {
    present: false,
  }

  componentWillMount() {
    this.subscriptionId = subscribe(this.props.id, (status) => this.setState({present: status}))
    this.setState({present: PRESENCE_CACHE[this.props.id]})
  }

  componentWillUnmount() {
    unsubscribe(this.props.id, this.subscriptionId)
  }

  render() {
    return this.props.children(this.state.present)
  }
}

export default WithPresence