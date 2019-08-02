import React from 'react'

class SubscriptionWrapper extends React.Component {
  componentDidMount() {
    this.reregister()
  }

  componentWillReceiveProps(props) {
    if (props.id !== this.props.id) {
      if (this.unsubscribe) this._unsubscribe()
      this.reregister()
    }
  }

  componentWillUnmount() {
    this._unsubscribe()
  }

  _unsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }

  reregister() {
    this.unsubscribe = null
    this.props.startSubscription().then((unsub) => {
      this.unsubscribe = unsub
    })
  }

  render() {
    return this.props.children
  }
}

export default SubscriptionWrapper