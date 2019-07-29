import React, { Component } from "react";
import {rollup} from '../utils/array'

class Scroller extends Component {
  componentDidMount() {
    window.addEventListener("scroll", this.handleOnScroll, false);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleOnScroll);
  }

  handleOnScroll = () => {
    let direction = this.props.direction || 'down'
    if (direction === 'down') {
      let elem = document.getElementById(this.props.id);
      if (elem.scrollTop >= (elem.scrollHeight - elem.offsetHeight)) {
        this.props.onLoadMore();
      }
    } else {
      let elem = document.getElementById(this.props.id);
      console.log(elem.scrollTop)
      if (elem.scrollTop <= 0) {
        this.props.onLoadMore()
      }
    }
  };

  render() {
    return (
      <div id={this.props.id} onScroll={this.handleOnScroll} style={this.props.style}>
        {Array.from(rollup(this.props.edges, this.props.mapper))}
      </div>
    );
  }
}

export default Scroller