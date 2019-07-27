import React, { Component } from "react";

class Scroller extends Component {
  componentDidMount() {
    window.addEventListener("scroll", this.handleOnScroll, false);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleOnScroll);
  }

  handleOnScroll = () => {
    let elem = document.getElementById(this.props.id);
    if (elem.scrollTop >= (elem.scrollHeight - elem.offsetHeight)) {
      this.props.onLoadMore();
    }
  };

  render() {
    return (
      <div id={this.props.id} onScroll={this.handleOnScroll} style={this.props.style}>
        {this.props.edges.map(this.props.mapper)}
      </div>
    );
  }
}

export default Scroller