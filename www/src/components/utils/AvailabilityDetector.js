import React, { useState, useEffect } from 'react'
import { Detector } from 'react-detect-offline'

const SLEEP_INTERVAL = 10000

const epochTime = () => (new Date()).getTime()

function ToggleIgnore({current, setIgnore}) {
  const [initial] = useState(current)

  useEffect(() => {
    if (initial !== current) setIgnore(false)
  }, [current, initial])

  return null
}

export default function AvailabilityDetector({children}) {
  const [ignore, setIgnore] = useState(true)
  const [awake, setAwake] = useState(false)

  useEffect(() => {
    var last = epochTime()
    const interval = setInterval(() => {
      const current = epochTime()
      if (current > last + SLEEP_INTERVAL * 2) {
        setAwake(true)
      } else {
        setAwake(false)
      }

      last = current
    }, SLEEP_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  return <Detector render={({online}) => (
      ignore ? <ToggleIgnore current={online} setIgnore={setIgnore} /> :
               children((awake || online))
  )} />
}