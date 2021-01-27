import React, { Component } from 'react';
import G6 from "@antv/g6";
import { equalsObj } from '@utils/helper';
import CanvasZoom from '@components/CanvasZoom';
import { LEVER_NAME, LEVER_MAP, LEVER_COLOR } from '@shared/ReceiptConfig';
import P0 from '@assets/P0.png';
import P1 from '@assets/P1.png';
import P2 from '@assets/P2.png';
import objective from '@assets/objective.png';
import krImg from '@assets/kr.png';
import dueDateImg from '@assets/dueDate.png';
import productImg from '@assets/product.png';
import projectImg from '@assets/project.png';

import NodeTip from './node_tip';

let graph = null;

const LEVER_ICON = {
  [LEVER_MAP.P0]: P0,
  [LEVER_MAP.P1]: P1,
  [LEVER_MAP.P2]: P2,
};

const getContainerStyle = () => {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: "calc(100vh - 230px)"
  };
};

const defaultStateStyles = {
  hover: {
    stroke: "#D5DAE2",
    lineWidth: 2
  }
};

const defaultEdgeStyle = {
  stroke: "#B9BEC8", // @color-black-5
};

const defaultLayout = {
  type: "compactBox",
  direction: "LR",
  getId: function getId(d) {
    return d.id;
  },
  getHeight: () => {
    return 20;
  },
  getWidth: () => {
    return 40;
  },
  getVGap: () => { // 节点纵向间距的回调函数
    return 50;
  },
  getHGap: (d) => { // 节点横向间距的回调函数
    return 180;
  }
};

class index extends Component {
  state = {
    zoom: 0, // 缩放比例
    width: 0, // 画布宽
    height: 0, // 画布高
    tipX: 0, // key result x
    tipY: 0,
    showTip: false,
    keyResult: [],
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

  handleOutputImage = () => {
    graph.downloadFullImage('tree', 'image/png', {
      backgroundColor: '#F1F3F5',
      padding: 20
    });
  }

  getTreeCharts = (dd) => {
    const { issueKey } = this.props;
    const data = dd;

    if (data && Object.keys(data).length) {
      graph = null;
      let width = document.getElementById("treeContainer").scrollWidth;
      let height = document.getElementById("treeContainer").scrollHeight || "80vh";
      this.setState({
        width,
        height,
      });

      G6.registerNode(
        "dom-node",
        {
          draw: (cfg, group) => {
            const { collapsed, id, name, responseUser, level, keyResult,
              dueDate, department, productId, projectId } = cfg;
            const responseName = responseUser.name;
            const lastTwoWord = responseName && responseName.slice(responseName.length - 2);
            const sliceArr = department.map(it => it.length > 5 ? `${it.slice(0, 5)}...` : it);

            let shape;
            if (!id.includes('hidden') && !id.includes('virtual')) {
              // 容器
              shape = group.addShape('rect', {
                attrs: {
                  x: 0,
                  y: 0,
                  width: 300,
                  height: 100,
                  fill: '#ffffff'
                },
                name: 'main-box',
              });

              // 第一行rect
              group.addShape('rect', {
                attrs: {
                  x: 0,
                  y: 0,
                  width: 300,
                  height: 30,
                },
                name: 'firstLine-box',
              });

              // 目标icon
              group.addShape('image', {
                attrs: {
                  x: 4,
                  y: 6,
                  height: 16,
                  width: 16,
                  cursor: 'pointer',
                  img: objective,
                },
                name: 'objective-icon',
              });

              // 目标标题
              group.addShape('text', {
                attrs: {
                  textBaseline: 'top',
                  y: 8,
                  x: 25,
                  lineHeight: 20,
                  text: name.length > 18 ? `${name.slice(0, 18)}...` : name,
                  fill: '#000000',
                },
                name: 'title',
              });

              if (productId || projectId) {
                group.addShape('image', {
                  attrs: {
                    x: -8,
                    y: -8,
                    width: 32,
                    height: 24,
                    cursor: 'pointer',
                    img: productId ? productImg : projectImg,
                  },
                  name: 'product-project-rect',
                });
              }

              // 负责人rect
              group.addShape('rect', {
                attrs: {
                  x: 260,
                  y: 4,
                  width: 35,
                  height: 20,
                  fill: '#008CFF',
                  radius: [2, 2, 2, 2],
                },
                name: 'response-rect',
              });

              // 负责人名称
              group.addShape('text', {
                attrs: {
                  textBaseline: 'top',
                  y: 8,
                  x: 265,
                  lineHeight: 20,
                  text: lastTwoWord,
                  fill: '#ffffff',
                },
                name: 'response-name',
              });

              // 第二行rect
              group.addShape('rect', {
                attrs: {
                  x: 0,
                  y: 30,
                  width: 300,
                  height: 30,
                },
                name: 'secondLine-box',
              });

              // 优先级-icon
              group.addShape('image', {
                attrs: {
                  x: 4,
                  y: 34,
                  height: 20,
                  width: 20,
                  cursor: 'pointer',
                  img: LEVER_ICON[level],
                },
                name: 'level',
              });

              // 优先级-name
              group.addShape('text', {
                attrs: {
                  textBaseline: 'top',
                  y: 38,
                  x: 30,
                  lineHeight: 20,
                  text: LEVER_NAME[level],
                  fill: LEVER_COLOR[level],
                },
                name: 'response-name',
              });

              // keyResult-icon
              group.addShape('image', {
                attrs: {
                  x: 50,
                  y: 37,
                  height: 14,
                  width: 14,
                  cursor: 'pointer',
                  img: krImg,
                },
                name: 'keyResult-icon',
              });

              // keyResult-text
              group.addShape('text', {
                attrs: {
                  textBaseline: 'top',
                  y: 38,
                  x: 72,
                  lineHeight: 20,
                  text: keyResult.length,
                  fill: '#008CFF'
                },
                name: 'keyResult-num',
              });

              // dueDate-icon
              group.addShape('image', {
                attrs: {
                  x: 90,
                  y: 37,
                  height: 14,
                  width: 14,
                  cursor: 'pointer',
                  img: dueDateImg,
                },
                name: 'keyResult-icon',
              });

              // dueDate-text
              group.addShape('text', {
                attrs: {
                  textBaseline: 'top',
                  y: 38,
                  x: 112,
                  lineHeight: 20,
                  text: dueDate,
                  fill: '#475669'
                },
                name: 'keyResult-num',
              });

              // 分割rect
              group.addShape('rect', {
                attrs: {
                  x: 0,
                  y: 62,
                  width: 300,
                  height: 1,
                  fill: '#E8EAEC'
                },
                name: 'fenge',
              });

              // 部门
              group.addShape('text', {
                attrs: {
                  textBaseline: 'top',
                  y: 75,
                  x: 4,
                  lineHeight: 20,
                  text: sliceArr.join('/'),
                  fill: '#475669'
                },
                name: 'keyResult-num',
              });

            } else if (id.includes('virtual')) {
              shape = group.addShape('rect', {
                attrs: {
                  x: 0,
                  y: 0,
                  width: 300,
                  height: 100,
                  fill: '#F1F3F5'
                },
                name: 'main-box',
              });

              group.addShape('rect', {
                attrs: {
                  x: 0,
                  y: 50,
                  width: 300,
                  height: 1,
                  fill: '#B9BEC8'
                },
                name: 'virtual',
              });
            } else {
              shape = group.addShape('rect', {
                attrs: {
                  x: 0,
                  y: 0,
                  width: 300,
                  height: 100,
                  fill: '#F1F3F5'
                  // fill: '#fff'
                },
                name: 'main-box',
              });
            }
            const grey = '#CED4D9';
            const collapseRectConfig = {
              width: 202,
              height: 60,
              lineWidth: 1,
              fontSize: 12,
              fill: '#fff',
              radius: 4,
              stroke: grey,
              opacity: 1,
            };

            if (cfg.children && cfg.children.length && !id.includes('hidden') && !id.includes('virtual')) {
              group.addShape('rect', {
                attrs: {
                  x: collapseRectConfig.width + 98,
                  y: 42,
                  width: 16,
                  height: 16,
                  stroke: 'rgba(0, 0, 0, 0.25)',
                  cursor: 'pointer',
                  fill: '#ffffff',
                },
                name: 'collapse-back',
                modelId: cfg.id,
              });

              // collpase text
              group.addShape('text', {
                attrs: {
                  x: collapseRectConfig.width + 106,
                  y: 48,
                  textAlign: 'center',
                  textBaseline: 'middle',
                  text: collapsed ? '+' : '-',
                  fontSize: 16,
                  cursor: 'pointer',
                  fill: 'rgba(0, 0, 0, 0.25)',
                },
                name: 'collapse-text',
                modelId: cfg.id,
              });
            }
            return shape;
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

      G6.registerEdge(
        "flow-line",
        {
          draw(cfg, group) {
            const startPoint = cfg.startPoint;
            const endPoint = cfg.endPoint;
            const { style } = cfg;
            return group.addShape("path", {
              attrs: {
                stroke: '#fff',
                endArrow: style.endArrow,
                // path: [],
                path: [
                  ["M", startPoint.x, startPoint.y],
                  ["L", startPoint.x, (startPoint.y + endPoint.y) / 2],
                  ["L", endPoint.x, (startPoint.y + endPoint.y) / 2],
                  ["L", endPoint.x, endPoint.y]
                ]
              }
            });
          },
          getPath: function getPath(points, data) {
            const { source, target } = data;
            const sourceId = source._cfg.id;
            const targetId = target._cfg.id;
            // console.log('sourceId', sourceId);
            // console.log('targetId', targetId)
            var startPoint = points[0];
            var endPoint = points[1];
            return [
              ["M", startPoint.x, startPoint.y],
              ["L", (startPoint.x + endPoint.x) / 2, startPoint.y],
              ["L", (startPoint.x + endPoint.x) / 2, endPoint.y],
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
          fitView: true,
          modes: {
            default: [
              "drag-canvas",
              "zoom-canvas",
            ]
          },
          defaultNode: {
            type: "dom-node",
            size: [300, 100]
          },
          defaultEdge: {
            type: "flow-line", //polyline
            style: defaultEdgeStyle,
          },
          nodeStateStyles: defaultStateStyles,
          edgeStateStyles: defaultStateStyles,
          layout: defaultLayout
        });
      }

      // 覆盖边的样式，必须在render前，否则可能不生效
      graph && graph.edge((edge) => {
        return {
          id: edge.id,
          style: {
            stroke: edge.id.includes('hidden') ? '#F1F3F5' : '#B9BEC8'
          },
        };
      });

      G6.Util.traverseTreeUp(data, (subTree) => {
        if (!subTree.id.includes('hidden') && !subTree.id.includes('virtual') && subTree.children && !!subTree.children.length) {
          subTree.collapsed = true;
        }
        return true;
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
      // this.setState({ zoom: 1.0 });
      // graph.zoomTo(1.0, { x: width / 2, y: height / 2 });


      const handleCollapse = (e) => {
        const target = e.target;
        const id = target.get('modelId');
        const item = graph.findById(id);
        const nodeModel = item.getModel();
        nodeModel.collapsed = !nodeModel.collapsed;
        graph.setItemState(item, 'collapse', nodeModel.collapsed);
        graph.layout();
      };

      graph.on("node:mouseenter", evt => {
        const { item, target } = evt;
        const model = item.getModel();
        const { x, y, keyResult } = model;
        const point = graph.getCanvasByPoint(x, y);
        if (keyResult.length) {
          this.setState({
            tipX: point.x + 40,
            tipY: point.y + 105,
            showTip: true,
            keyResult,
          });
        }
      });

      graph.on("node:mouseleave", evt => {
        this.setState({ showTip: false, keyResult: [] });
      });

      graph.on("node:click", (evt) => {
        const { item, target } = evt;
        const { _cfg } = item;
        const id = _cfg.id;
        const name = target.get('name');
        if (name === 'collapse-text' || name === 'collapse-back') {
          handleCollapse(evt);
        } else if (name === 'product-project-rect' || name === 'product-project-text') {
          this.props.dispatch({ type: 'receipt/saveDrawerIssueId', payload: id });
        }
      });

      graph.on('wheelzoom', e => {
        const newZoom = graph.getZoom();
        this.setState({ zoom: newZoom });
      });
    }
  }

  render() {
    const { zoom, showTip, tipX, tipY, keyResult } = this.state;

    return (<div>
      <div onClick={() => this.handleOutputImage()}>导出图片</div>
      <div id="treeContainer" style={getContainerStyle()}>
        {showTip && <NodeTip x={tipX} y={tipY} keyResult={keyResult} />}
      </div>
      <div>
        <CanvasZoom
          handleBig={this.handleBig}
          handleSmall={this.handleSmall}
          zoom={zoom}
        />
      </div>
    </div>);
  }
}

export default index;
