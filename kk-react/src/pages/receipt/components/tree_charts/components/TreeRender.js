import React, { Component } from 'react';
import G6 from "@antv/g6";
import { equalsObj, deepCopy } from '@utils/helper';
import { getIssueCard } from '@pages/receipt/components/origin_dom_card';
import CanvasZoom from '@components/CanvasZoom';

let graph = null;

const getContainerStyle = () => {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 500
  };
};

const defaultStateStyles = {
  hover: {
    stroke: "#008CFF", // @color-blue-6
    fill: '#edf5fe', // @color-blue-1
    lineWidth: 2
  }
};

const defaultEdgeStyle = {
  stroke: "#D5DAE2", // @color-black-4
};

const defaultLayout = {
  type: "compactBox",
  direction: "TB",
  getId: function getId(d) {
    return d.id;
  },
  getHeight: function getHeight() {
    return 50;
  },
  getWidth: function getWidth() {
    return 50;
  },
  getVGap: function getVGap() {
    return 60;
  },
  getHGap: function getHGap() {
    return 200;
  }
};

class index extends Component {
  state = {
    zoom: 0,
  }

  componentDidMount() {
    const { data } = this.props;
    if (data && Object.keys(data).length) {
      this.getTreeCharts(data);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.data, nextProps.data)) {
      graph && graph.destroy();
      this.getTreeCharts(nextProps.data);
    }
  }

  componentWillUnmount() {
    graph && graph.destroy();
    graph = null;
  }

  handleBig = () => {
    const { width, height } = this.state;
    const newZoom = graph.getZoom() + 0.1;
    this.setState({ zoom: newZoom });
    graph && graph.zoomTo(newZoom, { x: width / 2, y: height / 2 });
  }

  handleSmall = () => {
    const { width, height } = this.state;
    const newZoom = graph.getZoom() - 0.1;
    this.setState({ zoom: newZoom });
    graph && graph.zoomTo(newZoom, { x: width / 2, y: height / 2 });
  }

  getTreeCharts = (dd) => {
    const { issueKey } = this.props;
    let data = deepCopy(dd);

    if (data && Object.keys(data).length) {
      graph = null;
      let width = document.getElementById("treeContainer").scrollWidth;
      let height = document.getElementById("treeContainer").scrollHeight || "calc(100vh - 150px)";
      this.setState({
        width,
        height,
      });
      G6.registerNode(
        "dom-node",
        {
          draw: (cfg, group) => {
            return group.addShape("dom", {
              attrs: {
                width: cfg.size[0],
                height: cfg.size[1],
                // 传入 DOM 的 html
                html: getIssueCard(cfg, issueKey, (id) => this.handleCollapse(id))
              }
            });
          },
          setState(name, value, item) {
            if (name === 'collapse') {
              const group = item.getContainer();
              const collapseText = group.find((e) => e.get('name') === 'collapse-text');
              if (collapseText) {
                if (!value) {
                  collapseText.attr({
                    text: '-',
                  });
                } else {
                  collapseText.attr({
                    text: '+',
                  });
                }
              }
            }
          },
        },
        "single-node"
      );

      if (!graph) {
        graph = new G6.TreeGraph({
          container: "treeContainer",
          width: width,
          height: height,
          linkCenter: true,
          renderer: 'svg',
          fitView: true,
          modes: {
            default: [
              "drag-canvas",
              "zoom-canvas"]
          },
          defaultNode: {
            type: "dom-node",
            size: [250, 100]
          },
          defaultEdge: {
            type: "flow-line", //polyline
            style: defaultEdgeStyle
          },
          nodeStateStyles: defaultStateStyles,
          edgeStateStyles: defaultStateStyles,
          layout: defaultLayout
        });
      }

      G6.registerEdge(
        "flow-line",
        {
          draw(cfg, group) {
            const startPoint = cfg.startPoint;
            const endPoint = cfg.endPoint;
            const { style } = cfg;
            return group.addShape("path", {
              attrs: {
                stroke: style.stroke,
                endArrow: style.endArrow,
                path: [
                  ["M", startPoint.x, startPoint.y],
                  ["L", startPoint.x, (startPoint.y + endPoint.y) / 2],
                  ["L", endPoint.x, (startPoint.y + endPoint.y) / 2],
                  ["L", endPoint.x, endPoint.y]
                ]
              },
              name: 'path-shape',
            });
          },
        });
      graph.data(data);
      graph.render();
      graph.fitView();

      if (!data.children || !data.children.length) {
        graph.zoomTo(1.0, { x: width / 2, y: height / 2 });
        this.setState({ zoom: 1.0 });
      } else {
        this.setState({ zoom: graph.getZoom() });
      }

      graph.on("node:mouseenter", evt => {
        const { item } = evt;
        graph.setItemState(item, "hover", true);
      });

      graph.on("node:mouseleave", evt => {
        const { item } = evt;
        graph.setItemState(item, "hover", false);
      });

      graph.on('wheelzoom', e => {
        const newZoom = graph.getZoom();
        this.setState({ zoom: newZoom });
      });
    }
  }

  render() {
    const { zoom } = this.state;

    return (<div>
      <div id="treeContainer" style={getContainerStyle()}>
      </div>
      <div>
        <CanvasZoom handleBig={this.handleBig} handleSmall={this.handleSmall} zoom={zoom} />
      </div>
    </div>);
  }
}

export default index;
