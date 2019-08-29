import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Next} from 'grommet-icons'

export const FlyoutContext = React.createContext({
  flyoutContent: null,
  setFlyoutContent: null,
  open: false,
  setOpen: null
})

function FlyoutContent(props) {
  return (
    <Box border='left' height='100%'>
      {props.content}
    </Box>
  )
}

export function FlyoutProvider(props) {
  const [flyoutContent, setFlyoutContent] = useState(null)
  function setOpen(open) {
    if (!open) setFlyoutContent(null)
  }

  return (
    <FlyoutContext.Provider value={{
      flyoutContent,
      setOpen,
      setFlyoutContent
    }}>
      {props.children(<FlyoutContent content={flyoutContent} />, setFlyoutContent)}
    </FlyoutContext.Provider>
  )
}

export function FlyoutHeader(props) {
  return (
    <Box height='40px' direction='row' border='bottom' pad='small' margin={{bottom: 'small'}}>
      <Box width='100%' direction='row' justify='start' align='center'>
        <Text size='small'>{props.text.toUpperCase()}</Text>
      </Box>
      <Box style={{cursor: 'pointer'}} align='center' justify='center' onClick={() => props.setOpen(false)}>
        <Next size='15px' />
      </Box>
    </Box>
  )
}

function Flyout(props) {
  return (
    <FlyoutContext.Consumer>
    {({setFlyoutContent, setOpen}) => {
      return (
        <span style={{lineHeight: '0px'}}>
          <span onClick={() => {
            props.onOpen && props.onOpen()
            setFlyoutContent(props.children(setOpen))
          }}>
          {props.target}
          </span>
        </span>
      )
    }}
    </FlyoutContext.Consumer>
  )
}

export default Flyout