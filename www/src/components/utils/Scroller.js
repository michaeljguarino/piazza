import React, { Component } from "react";
import {lookahead} from '../../utils/array'

class Scroller extends Component {
  UNSAFE_componentDidMount() {
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
      if (elem.scrollTop <= elem.offsetHeight) {
        console.log('scrolling')
        this.props.onLoadMore()
      }
    }
  };

  render() {
    let entries = Array.from(lookahead(this.props.edges, this.props.mapper))
    return (
      <div id={this.props.id} onScroll={this.handleOnScroll} style={this.props.style}>
        {entries.length > 0 ? entries : this.props.emptyState}
      </div>
    );
  }
}

export default Scroller