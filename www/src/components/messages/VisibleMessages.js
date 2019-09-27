import React, {useState} from 'react'
import moment from 'moment'

export const VisibleMessagesContext = React.createContext({
  visible: {},
  addMessage: null,
  removeMessage: null,
  clear: null
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

function VisibleMessages(props) {
  const [visible, setVisible] = useState({})

  function addMessage(message) {
    visible[message.id] = message
    setVisible({...visible})
  }

  function removeMessage(message) {
    delete visible[message.id]
    setVisible({...visible})
  }

  const clear = () => setVisible({})

  return (
    <VisibleMessagesContext.Provider
      value={{visible, addMessage, removeMessage, clear}}>
      {props.children(visible, clear)}
    </VisibleMessagesContext.Provider>
  )
}

export default VisibleMessages