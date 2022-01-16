import React from 'react';
import * as joint from 'jointjs';
import svgPanZoom from 'svg-pan-zoom';
import $ from "jquery";
import { deepMergeObj } from '../../helpers/utils'
import { sharedProp } from '../../helpers/decorator'


@sharedProp('selectedComponentProperties')
class DrawArea extends React.Component {

    constructor(props) {
        super(props)
        this.refDrawArea = React.createRef();
        this.graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
        this.keyActions = {
            39: () => { this.selectedElement.model.translate(this.props.params.grid.gridSize, 0) },
            37: () => { this.selectedElement.model.translate(-this.props.params.grid.gridSize, 0) },
            40: () => { this.selectedElement.model.translate(0, this.props.params.grid.gridSize) },
            38: () => { this.selectedElement.model.translate(0, -this.props.params.grid.gridSize) },
            46: () => {
                this.graph.removeCells([this.selectedElement.model]);
                this.unHighlightLastSelectedElement();
            },
            190: () => { this.selectedElement.model.rotate(-0.5); },
            191: () => { this.selectedElement.model.rotate(0.5); },
            188: () => { this.selectedElement.model.rotate(-45); },
            223: () => { this.selectedElement.model.rotate(45); }
        }
        this.selectedElement = undefined;
        this.selectedPort = undefined;
    }

    componentDidMount = () => {
        const drawarea = this.refDrawArea.current;
        document.addEventListener("keydown", this.onKeyDown);
        this.paper = new joint.dia.Paper({
            cellViewNamespace: joint.shapes,
            el: drawarea,
            width: '100%',
            model: this.graph,
            drawGrid: true,
            gridSize: this.props.params.grid.gridSize,
            clickThreshold: 1,
            snapLinks: { radius: this.props.params.link.snapRadius }, //si les poignées sont magnétiques
            defaultLink: new joint.shapes.standard.Link({
                connector: { name: this.props.params.link.connector },
                router: { name: this.props.params.link.router },
                attrs: this.props.params.link.look
            }),
            allowLink: (linkView, paper) => {
                if (linkView.targetMagnet === null) {
                    return false
                }
                return true
            },
            validateConnection: (cellViewS, magnetS, cellViewT, magnetT, end, linkView) => {
                if (cellViewS === cellViewT) {
                    return false
                };
                const verticesTool = new joint.linkTools.Vertices();
                const segmentsTool = new joint.linkTools.Segments();
                const boundaryTool = new joint.linkTools.Boundary({ padding: 0 });
                const toolsView = new joint.dia.ToolsView({
                    tools: [verticesTool, segmentsTool, boundaryTool]
                });
                linkView.addTools(toolsView);
                linkView.hideTools();
                return true;
            }
        });
        this.setPaperGrid(this.paper, this.props.params.grid.gridSize);
        const svgSelector = '#graph' + this.props.tabKey + ' svg';
        this.svgPanZoom = svgPanZoom(svgSelector, {
            center: false,
            zoomEnabled: true,
            panEnabled: true,
            controlIconsEnabled: false,
            dblClickZoomEnabled: true,
            mouseWheelZoomEnabled: true,
            preventMouseEventsDefault: true,
            fit: false,
            minZoom: this.props.params.grid.zoomMin,
            maxZoom: this.props.params.grid.zoomMax,
            zoomScaleSensitivity: this.props.params.grid.zoomInc,
            onZoom: (scale) => {
                this.setPaperGrid(this.paper, scale * this.props.params.grid.gridSize);
            },
            beforePan: (oldpan, newpan) => {
                this.paper.$el.css('background-position', newpan.x + 'px ' + newpan.y + 'px');
            }
        });
        this.paper.on('link:mouseenter', (linkView) => {
            linkView.showTools();
        });
        this.paper.on('link:mouseleave', (linkView) => {
            linkView.hideTools();
        });
        this.paper.on('cell:pointerdown', (cellView, event, x, y) => {
            this.svgPanZoom.disablePan();
        });
        this.paper.on('blank:pointerclick', (cellView, event, x, y) => {
            this.unHighlightLastSelectedElement();
            this.selectedPort = undefined;
        });
        this.paper.on('link:pointerclick', (cellView, event, x, y) => {
            this.unHighlightLastSelectedElement();
            this.selectedPort = undefined;
        });
        this.paper.on('element:pointerclick', (cellView, event, x, y) => {
            this.unHighlightLastSelectedElement();
            this.highlightElement(cellView);
        })
        this.paper.on('cell:pointerup', () => {
            this.svgPanZoom.enablePan();
        });
        this.paper.on('link:contextmenu', (cellView, event, x, y) => {
            this.graph.removeCells([cellView.model]);
        })
        this.paper.on('element:contextmenu', (cellView, event, x, y) => {
            this.unHighlightLastSelectedElement();
            this.graph.removeCells([cellView.model]);
        })
    }

    componentWillUnmount = () => {
        document.removeEventListener('keydown', this.onKeyDown);
    }

    unHighlightLastSelectedElement = () => {
        if (this.selectedElement) {
            this.selectedElement.unhighlight();
            this.selectedElement = undefined;
        }
        this.props.setSelectedComponentProperties({});

    }

    highlightElement = (el) => {
        this.selectedElement = el;
        this.selectedElement.highlight();
        this.props.setSelectedComponentProperties(el.model.attributes.properties);
    }

    onKeyDown = (event) => {
        const keyCode = event.keyCode.toString();
        if (this.selectedElement) {
            if (Object.keys(this.keyActions).includes(keyCode)) {
                event.preventDefault();
                event.stopPropagation();
                this.keyActions[keyCode]();
            }
        }
    }

    setPaperGrid = (paper, gridSize) => {
        const { gridShape } = this.props.params.grid;
        if (gridShape !== "none") {
            if (this.paper.scale().sx !== gridSize) {
                const canvas = $('<canvas/>')[0];
                canvas.width = gridSize;
                canvas.height = gridSize;
                const ctx = canvas.getContext('2d');
                ctx.beginPath();

                if (gridShape === "grid") {
                    ctx.rect(0, 0, 0.5, gridSize);
                    ctx.rect(0, 0, gridSize, 0.5);
                    ctx.fillStyle = this.props.params.grid.gridColor;
                    ctx.fill();
                } else if (gridShape === "points") {
                    ctx.rect(0, 0, 1, 1);
                    ctx.fillStyle = this.props.params.grid.gridColor;
                    ctx.fill();
                } else if (gridShape === "cross") {
                    ctx.strokeStyle = this.props.params.grid.gridColor;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(0, 0);
                    ctx.lineTo(gridSize, gridSize);
                    ctx.moveTo(0, gridSize)
                    ctx.lineTo(gridSize, 0)
                    ctx.stroke();
                } else if (gridShape === "crossgrid") {
                    ctx.strokeStyle = this.props.params.grid.gridColor;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(0, 0);
                    ctx.lineTo(gridSize, gridSize);
                    ctx.moveTo(0, gridSize)
                    ctx.lineTo(gridSize, 0)
                    ctx.strokeRect(0, 0, gridSize, gridSize)
                    ctx.stroke();
                }

                const gridBackgroundImage = canvas.toDataURL('image/png');
                paper.$el.css('background-image', 'url("' + gridBackgroundImage + '")');
            }
        }

    }

    createStandardJJsShape = (type, props) => {
        if (type === "Rectangle") { return new joint.shapes.standard.Rectangle(props) }
        if (type === "Circle") { return new joint.shapes.standard.Circle(props) }
        if (type === "Path") { return new joint.shapes.standard.Path(props) }
        return new joint.shapes.standard.Rectangle()
    }

    createNodeAtLocation = (svgAsJsonObject, location) => {
        const { format, type, size, attrs, ports, properties } = svgAsJsonObject;
        let globalProp = {
            size: size || {
                x: this.props.params.defaultComponent.size.width,
                y: this.props.params.defaultComponent.size.height
            },
            attrs: deepMergeObj(this.props.params.defaultComponent.look, attrs),
            position: {
                x: location.x,
                y: location.y
            },
            properties: properties
        }
        let fPorts = {}
        if (format === "light") {
            //Dans le format light, les ports sont definis en position absolue par defaut
            fPorts = {
                groups: {
                    'gpAbs': {
                        position: {
                            name: 'absolute'
                        },
                        attrs: this.props.params.defaultComponent.port.look
                    }
                },
                items: ports.map(port => { return { group: 'gpAbs', ...port } })
            }
        } else if (format === "full") {
            fPorts = ports
            for (const gpName in fPorts.groups) {
                fPorts.groups[gpName]['attrs'] = this.props.params.defaultComponent.port.look
            }
        }
        const newNode = this.createStandardJJsShape(type, { ...globalProp, ports: fPorts });
        return newNode
    }

    addNodeAtLocation = (svgAsJsonObject, location) => {
        const newNode = this.createNodeAtLocation(svgAsJsonObject, location);
        this.graph.addCell(newNode);
    }

    onDrop = (e) => {
        if (e.dataTransfer.getData(process.env.REACT_APP_DROP_COMPONENT_KEY) !== 'undefined') {
            e.preventDefault();
            const svgAsJsonObject = JSON.parse(e.dataTransfer.getData(process.env.REACT_APP_DROP_COMPONENT_KEY));
            const { size } = svgAsJsonObject
            const localPoint = this.paper.clientToLocalPoint({ x: e.clientX, y: e.clientY });
            const svgLocation = { x: localPoint.x - size.width / 2, y: localPoint.y - size.height / 2 };
            this.addNodeAtLocation(svgAsJsonObject, svgLocation);
        }
    }

    onDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    }

    render = () => {
        return (
            <>
                <div
                    id={'graph' + this.props.tabKey}
                    ref={this.refDrawArea}
                    onDrop={this.onDrop}
                    onDragOver={this.onDragOver}
                    className="DrawArea"
                />
            </>

        )
    }
}

export default DrawArea
