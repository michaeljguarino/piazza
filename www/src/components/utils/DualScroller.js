import React, { Component, createRef } from "react";
import {lookahead} from '../../utils/array'

export const DIRECTION = {
  BEFORE: "before",
  AFTER: "after"
}

class DualScroller extends Component {
  scrollRef = createRef()

  UNSAFE_componentDidMount() {
    window.addEventListener("scroll", this.handleOnScroll, false);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleOnScroll);
  }

  handleOnScroll = () => {
    let elem = document.getElementById(this.props.id);
    if (elem.scrollTop >= (elem.scrollHeight - elem.offsetHeight)) {
      this.props.onLoadMore(DIRECTION.AFTER);
    }

    if (elem.scrollTop <= elem.offsetHeight) {
      this.props.onLoadMore(DIRECTION.BEFORE)
    }
  };

  render() {
    let entries = Array.from(lookahead(this.props.edges, (edge, next) => this.props.mapper(edge, next, this.scrollRef)))
    return (
      <div ref={this.scrollRef} id={this.props.id} onScroll={this.handleOnScroll} style={this.props.style}>
        {entries.length > 0 ? entries : this.props.emptyState}
      </div>
    );
  }
}

export default DualScroller