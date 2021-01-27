import React, { Component } from 'react';
import G6 from "@antv/g6";
import { equalsObj, deepCopy } from '@utils/helper';
import { getIssueCard, getClassifyCard } from '@pages/receipt/components/origin_dom_card';
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
    stroke: "#D5DAE2", // @color-black-4
    lineWidth: 2
  }
};

const defaultEdgeStyle = {
  stroke: "#D5DAE2", // @color-black-4
};

const defaultLayout = {
  type: "compactBox",
  direction: "LR",
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
    return 180;
  }
};

class index extends Component {
  state = {
    zoom: 0, // 画布缩放比
    width: 0, // 画布宽度
    height: 0, // 画布高度
  }

  componentDidMount() {
    const { data } = this.props;
    if (data && data.id) {
      this.getTreeCharts(data);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!equalsObj(this.props.data, nextProps.data)) {
      graph && graph.destroy();
      graph = null;
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
    const data = deepCopy(dd);
    if (data && Object.keys(data).length) {
      graph = null;
      let width = document.getElementById("treeContainer").scrollWidth;
      let height = document.getElementById("treeContainer").scrollHeight || 500;
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
                html:
                  cfg.issueType !== 'classify'
                    ?
                    getIssueCard(cfg, issueKey)
                    :
                    getClassifyCard(cfg)
              }
            });
          }
        },
        "single-node"
      );

      G6.registerEdge(
        "line-arrow",
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
              }
            });
          },
          getPath: function getPath(points) {
            var startPoint = points[0];
            var endPoint = points[1];
            return [
              ["M", startPoint.x, startPoint.y],
              ["L", endPoint.x / 3 + (2 / 3) * startPoint.x, startPoint.y],
              ["L", endPoint.x / 3 + (2 / 3) * startPoint.x, endPoint.y],
              ["L", endPoint.x, endPoint.y]
            ];
          },
        },
        "line"
      );

      if (!graph) {
        graph = new G6.TreeGraph({
          container: "treeContainer",
          width,
          height,
          linkCenter: true,
          renderer: 'svg',
          fitView: true,
          modes: {
            default: [
              "drag-canvas",
              "zoom-canvas",
            ]
          },
          defaultNode: {
            type: "dom-node",
            size: [250, 100]
          },
          defaultEdge: {
            shape: "line-arrow", //polyline
            style: defaultEdgeStyle
          },
          nodeStateStyles: defaultStateStyles,
          edgeStateStyles: defaultStateStyles,
          layout: defaultLayout
        });
      }

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

      graph.on("node:click", (evt) => {
        // const { item, target } = evt;
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
