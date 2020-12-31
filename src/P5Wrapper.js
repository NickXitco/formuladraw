import React from "react";
const polygonClipping = require('polygon-clipping');

export class P5Wrapper extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef()

        this.line1 = [];
        this.line2 = [];
        this.drawingLine1 = false;
        this.drawingLine2 = false;

        this.intersections = [];

        this.finished = false;
        this.xor = null;

        this.score = 0;
    }

    Sketch = (p) => {
        p.setup = () => {
            p.createCanvas(window.innerWidth, window.innerHeight);
        };

        p.draw = () => {
            p.background(255);

            this.drawLine(p, this.line1, 'red', p.color(0, 0));
            this.drawLine(p, this.line2, 'blue', p.color(0, 0));

            p.noStroke();
            p.fill('black');
            p.text(`Area 1: ${calculateArea(this.line1)}`, 5, 15);
            p.text(`Area 2: ${calculateArea(this.line2)}`, 5, 25);
            p.text(`Score: ${Math.round(this.score)} (${getGrade(this.score, this.line1).toFixed(2)}%)`, 5, 35);

            if (this.line1.length > 0 && this.line2.length > 0 && !this.drawingLine2 && !this.finished) {
                this.finished = true;
                this.xor = polygonClipping.xor([this.line1], [this.line2]);

                for (const mp of this.xor) {
                    const interior = mp[0];
                    this.score += calculateArea(interior);
                    const exterior = mp.slice(1);
                    for (const ext of exterior) {
                        this.score -= calculateArea(ext);
                    }
                }
            }

            if (this.xor) {
                for (const mp of this.xor) {
                    const interior = mp[0];
                    this.drawLine(p, interior, 'rgba(255, 0, 255, 0.0)', 'rgba(255, 0, 255, 0.25)');
                    const exterior = mp.slice(1);
                    for (const ext of exterior) {
                        this.drawLine(p, ext, 'rgba(0, 255, 255, 0.0)', 'rgba(255, 255, 255, 1)');
                    }
                }
            }
        };

        p.mousePressed = () => {
            if (!this.drawingLine1 && this.line1.length === 0) {
                this.drawingLine1 = true;
            } else if (!this.drawingLine2 && this.line2.length === 0) {
                this.drawingLine2 = true;
            }
        }

        p.mouseDragged = () => {
            if (this.drawingLine1) {
                this.line1.push([p.mouseX, p.mouseY]);
            } else if (this.drawingLine2) {
                this.line2.push([p.mouseX, p.mouseY]);
            }
        }

        p.mouseReleased = () => {
            if (this.drawingLine1) {
                this.drawingLine1 = false;
            } else if (this.drawingLine2) {
                this.drawingLine2 = false;
            }
        }
    }

    drawLine(p, line, strokeColor, fillColor) {
        p.beginShape();
        p.fill(fillColor);
        for (const point of line) {
            p.stroke(strokeColor);
            p.strokeWeight(2);
            p.vertex(point[0], point[1]);
        }
        if (line.length > 0) {
            p.vertex(line[0][0], line[0][1]);
        }
        p.endShape();
    }

    componentDidMount() {
        // eslint-disable-next-line no-undef
        new p5(this.Sketch, this.myRef.current);
    }

    render() {
        return (
            <div ref={this.myRef}/>
        );
    }
}

function calculateArea(line) {
    let area = 0;
    for (let i = 0; i < line.length; i++) {
        area += exteriorProduct(line[i], line[(i + 1) % line.length]);
    }
    return Math.abs(area);
}

function exteriorProduct(u, v) {
    return (u[0] * v[1] - v[0] * u[1]);
}

function getGrade(score, referenceLine) {
    const area = calculateArea(referenceLine);
    return ((area - score * 0.2) / area) * 100;
}