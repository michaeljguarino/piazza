import React, { Component, useEffect, useState, useRef, useCallback } from 'react'
import {Box} from 'grommet'

export default class OnMediaLoaded extends Component {
	constructor(props) {
		super(props)
		this.state = {
			loaded: false,
			loadCounter: 0,
			mediaCount: 0
		}
		this._onLoadEvent = this._onLoadEvent.bind(this)
	}

	timingSetup() {
		const { onWillMount, delay, timeout } = this.props
		onWillMount && onWillMount()
		this._delay = delay || 0
		this._timeout = Math.max(timeout || 7000, this._delay)
	}

	componentWillUnmount() {
		this.mounted = false
    if (this._imgs.length > 0 || this._vids.length > 0)
      this._removeImageEventListeners()
	}

	componentDidMount() {
		const { onLoaded, onDidMount, refreshKey } = this.props
		this.timingSetup()
		this.mounted = true
		this.refreshKey = refreshKey
		this._prepare()
	}

	_prepare() {
		const { onLoaded, onDidMount } = this.props
		this._imgs = this.containerRef.getElementsByTagName('img')
		this._vids = this.containerRef.getElementsByTagName('video')
		if (this._imgs.length === 0 && this._vids.length === 0) {
			if (onLoaded) {
				onLoaded()
			}
		} else {
			onDidMount && onDidMount()
			this._addImageEventListeners()
			this._setOnTimeoutEvent()
		}
	}

	_addImageEventListeners() {
		this.setState({ mediaCount: this._imgs.length + this._vids.length }, () => {
      Array.from(this._imgs).forEach((img) => img.addEventListener('load', this._onLoadEvent))
      Array.from(this._vids).forEach((vid) => vid.addEventListener('loadedmetadata', this._onLoadEvent))
		})
	}

	_removeImageEventListeners() {
    Array.from(this._imgs).forEach((img) => img.removeEventListener('load', this._onLoadEvent))
    Array.from(this._vids).forEach((vid) => vid.removeEventListener('loadedmetadata', this._onLoadEvent))
	}

	_setOnTimeoutEvent() {
		setTimeout(() => {
			this._hasTimedOut && this._runOnTimeoutFunction()
		}, this._timeout)
	}

	_runOnTimeoutFunction() {
		if (this.mounted) {
			const { onTimeout, onLoaded } = this.props
			this.setState({ loaded: true }, () => {
				if (onTimeout) {
					onTimeout()
				} else if (onLoaded) {
					onLoaded()
				}
			})
		}
	}

	_onLoadEvent() {
		if (this.mounted) {
			this.setState({ loadCounter: this.state.loadCounter + 1 }, () => {
				setTimeout(() => {
					this._hasBeenFullyAndProperlyLoaded && this._runOnLoadFunction()
				}, this._delay)
			})
		}
	}

	get _hasBeenFullyAndProperlyLoaded() {
		const { loadCounter, mediaCount, loaded } = this.state
		return this.mounted && (loadCounter >= mediaCount) && !loaded
	}

	get _hasTimedOut() {
		return this.mounted && !this.state.loaded
	}

	_runOnLoadFunction() {
		if (this.mounted) {
			const { onLoaded } = this.props
			this.setState({ loaded: true, timedOut: false }, () => {
				onLoaded && onLoaded()
			})
		}
	}

	render() {
		return (
			<Box ref={(ref) => { this.containerRef = ref}}>
					{this.props.children}
			</Box>
		)
	}
}
