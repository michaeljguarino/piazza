import React, { useState } from 'react'
import moment from 'moment'

export const VisibleMessagesContext = React.createContext({
  visible: {},
  addMessage: null,
  removeMessage: null,
  clear: null
})

export const EditingMessageContext = React.createContext({
  edited: null,
  setEdited: null
})

export function lastMessage(visible) {
  let min = null
  let minTime = null
  for (const msg of Object.values(visible)) {
    const dt = moment(msg.insertedAt)
    if (!min || dt.isBefore(minTime)) {
      min = msg
      minTime = dt
    }
  }
  return min
}

export default function VisibleMessages({children}) {
  const [visible, setVisible] = useState({})
  const [edited, setEdited] = useState(null)

  function addMessage(message) {
    if (visible[message.id]) return
    visible[message.id] = message
    setVisible({...visible})
  }

  function removeMessage(message) {
    if (!visible[message.id]) return
    delete visible[message.id]
    setVisible({...visible})
  }

  const clear = () => setVisible({})

  return (
    <EditingMessageContext.Provider value={{edited, setEdited}}>
      <VisibleMessagesContext.Provider
        value={{visible, addMessage, removeMessage, clear}}>
        {children(visible, clear)}
      </VisibleMessagesContext.Provider>
    </EditingMessageContext.Provider>
  )
}
