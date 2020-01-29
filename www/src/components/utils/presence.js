import React, { useState, useEffect } from 'react'
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
    if (!SUBSCRIPTIONS[id]) continue
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

export default function WithPresence({id, children}) {
  const [present, setPresent] = useState(false)

  useEffect(() => {
    const sub = subscribe(id, setPresent)
    setPresent(PRESENCE_CACHE[id])

    return () => unsubscribe(id, sub)
  }, [id])

  return children(present)
}

export function WithAnyPresent({ids, children}) {
  const [present, setPresent] = useState({})

  useEffect(() => {
    const subs = ids.map((id) => subscribe(id, (status) => setPresent({...present, [id]: status})))
    let present = {}
    for (const id of ids) {
      present[id] = PRESENCE_CACHE[id]
    }
    setPresent(present)
    return () => ids.map((id, ind) => unsubscribe(id, subs[ind]))
  }, [ids])

  return children(Object.values(present).some((present) => !!present))
}