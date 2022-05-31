import React from 'react';
import { ReactNodeLike, Requireable } from 'prop-types';

// @ts-nocheck
// type PropsType = {
//   collapsed: boolean
//   className: string,
//   itemClassName = '',
//   treeViewClassName = '',
//   childrenClassName = '',
//   nodeLabel,
//   children,
//   defaultCollapsed,
// }

// type StateType = {
//   collapsed: boolean = false
// }

class TreeView extends React.PureComponent<any, any> {
  propTypes: {
    collapsed: Requireable<boolean>,
    defaultCollapsed: Requireable<boolean>,
    nodeLabel: Requireable<ReactNodeLike>,
    className: Requireable<string>,
    itemClassName: Requireable<string>,
    childrenClassName: Requireable<string>,
    treeViewClassName: Requireable<string>,
  }

  constructor(props) {
    super(props);

    this.state = {
      collapsed: props.defaultCollapsed
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(...args) {
    this.setState({ collapsed: !this.state.collapsed });
    if (this.props.onClick) {
      this.props.onClick(...args);
    }
  }

  render() {
    const {
      collapsed = this.state.collapsed,
      className = '',
      itemClassName = '',
      treeViewClassName = '',
      childrenClassName = '',
      nodeLabel,
      children,
      defaultCollapsed,
      ...rest
    } = this.props;

    let arrowClassName = 'tree-view_arrow';
    let containerClassName = 'tree-view_children';
    if (collapsed) {
      arrowClassName += ' tree-view_arrow-collapsed';
      containerClassName += ' tree-view_children-collapsed';
    }

    const arrow = (
      <div
        {...rest}
        className={className + ' ' + arrowClassName}
        onClick={this.handleClick}
      >{collapsed ? '>' : 'v'} {nodeLabel}</div>
    );

    return (
      <div className={'tree-view ' + treeViewClassName}>
        <div className={'tree-view_item ' + itemClassName}>
          {arrow}
          {/* {nodeLabel} */}
        </div>
        <div className={containerClassName + ' ' + childrenClassName}>
          {collapsed ? null : children}
        </div>
      </div>
    );
  }
}

export default TreeView;
