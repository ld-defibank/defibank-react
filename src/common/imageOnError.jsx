import React, { Component } from 'react';

export default class Image extends Component {
  constructor(props) {
    super(props);

    this.state = {
      picSrc: props.picSrc,
      src: props.src,
      errored: false,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { picSrc } = prevState;
    const { src } = nextProps;
    if (picSrc === src) return null;
    return {
      picSrc: src,
      src,
    };
  }

  onError = () => {
    const { errored } = this.state;
    const { fallbackSrc } = this.props;

    if (!errored) {
      this.setState({
        src: fallbackSrc,
        errored: true,
      });
    }
  }

  render() {
    const { src } = this.state;
    const {
      src: _1,
      fallbackSrc: _2,
      ...props
    } = this.props;

    return (
      <img
        src={src}
        onError={this.onError}
        {...props}
      />
    );
  }
}
