import React from "react";

export class P5Wrapper extends React.Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef()

        this.line1 = [];
        this.line2 = [];
        this.drawingLine1 = false;
        this.drawingLine2 = false;

        this.intersections = [];
        this.lineT = 0;
    }

    Sketch = (p) => {
        p.setup = () => {
            p.createCanvas(window.innerWidth, window.innerHeight);
        };

        p.draw = () => {
            p.background(255);

            p.beginShape();
            for (const point of this.line1) {
                p.noFill();
                p.stroke('red')
                p.vertex(point.x, point.y);
            }
            if (this.line1.length > 0) {
                p.vertex(this.line1[0].x, this.line1[0].y);
            }
            p.endShape();


            p.beginShape();
            for (const point of this.line2) {
                p.noFill();
                p.stroke('blue')
                p.vertex(point.x, point.y);
            }
            if (this.line2.length > 0) {
                p.vertex(this.line2[0].x, this.line2[0].y);
            }
            p.endShape();

            p.noStroke();
            p.fill('black');
            p.text(`Area 1: ${calculateArea(this.line1)}`, 5, 15);
            p.text(`Area 2: ${calculateArea(this.line2)}`, 5, 25);

            if (this.line1.length > 0 && this.line2.length > 0 && !this.drawingLine2) {
                this.intersections = getIntersections(this.line1, this.line2);
            }

            if (this.intersections.length > 0) {
                for (let i = 0; i < this.lineT && i < this.intersections.length; i++) {
                    p.circle(this.intersections[i].x, this.intersections[i].y, 10);
                }
                this.lineT++;
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
                this.line1.push({
                    x: p.mouseX,
                    y: p.mouseY
                });
            } else if (this.drawingLine2) {
                this.line2.push({
                    x: p.mouseX,
                    y: p.mouseY
                });
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

    componentDidMount() {
        // eslint-disable-next-line no-undef
        new p5(this.Sketch, this.myRef.current);
    }

    render() {
        return (
            <div ref={this.myRef}>

            </div>
        );
    }
}

//Bentley-Ottmann
function getIntersections(line1, line2) {
    let points = [];
    for (const point of line1) {
        points.push({x: point.x, y: point.y, line: 1});
    }

    for (const point of line2) {
        points.push({x: point.x, y: point.y, line: 2});
    }

    points.sort((a, b) => {
       return (a.x === b.x) ? (a.y - b.y) : (a.x - b.x)
    });

    return points;
}


function calculateArea(line) {
    let area = 0;
    for (let i = 0; i < line.length; i++) {
        area += exteriorProduct(line[i], line[(i + 1) % line.length]);
    }
    return area;
}

function exteriorProduct(u, v) {
    return (u.x * v.y - v.x * u.y);
}