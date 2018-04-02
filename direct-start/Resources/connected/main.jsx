import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import applyHOCs from "direct-core/applyHOCs";
import withSocket from "direct-core/withSocket";

import * as _thisActionGroup from "actions";

import style from "style";


class ConnectedName extends React.PureComponent {
  static defaultProps = {

  }
  state = {

  }

  render() {
    const { socket } = this.props;
    return (
      <div className="fullSpaceBFC">

      </div>
      // or
      <React.Fragment>

      </React.Fragment>
    );
  }
};


export default applyHOCs([
  withSocket,
  connect(
    state => ({
      props1: state.ConnectedName.someProp,
      props2: someFunc( state.ConnectedName.anotherProp ) // someFunc is a selector
    }),
    dispatch => bindActionCreators( _thisActionGroup , dispatch )
    /*more than one group
    dispatch => bindActionCreators({
      ..._thisActionGroup,
      ...anotherGroup
    } , dispatch )
    */
  )
] , ConnectedName );