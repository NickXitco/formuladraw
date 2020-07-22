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

            if (this.line1.length > 0 && this.line2.length > 0 && !this.drawingLine2 && this.intersections.length === 0) {
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

function getIntersections(line1, line2) {
    for (let i = 0; i < line1.length; i++) {
        line1[i].line = 1;
        line1[i].next = line1[(i + 1) % (line1.length)];
    }

    for (let i = 0; i < line2.length; i++) {
        line2[i].line = 1;
        line2[i].next = line2[(i + 1) % (line2.length)];
    }

    //Naive O(n^2) intersection algorithm
    let intersections = [];
    let points = [...line1].concat(line2);

    for (const u1 of points) {
        for (const u2 of points) {
            if (u1 === u2 || u2 === u1.next || u2.next === u1) continue;
            let intersection = getLineIntersection(u1, u1.next, u2, u2.next);
            if (intersection) {
                intersections.push(intersection)
            }
        }
    }

    return intersections;
}

function getLineIntersection(u1, v1, u2, v2) {
    let s1_x, s1_y, s2_x, s2_y;
    s1_x = v1.x - u1.x;     s1_y = v1.y - u1.y;
    s2_x = v2.x - u2.x;     s2_y = v2.y - u2.y;

    let s, t;
    s = (-s1_y * (u1.x - u2.x) + s1_x * (u1.y - u2.y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (u1.y - u2.y) - s2_y * (u1.x - u2.x)) / (-s2_x * s1_y + s1_x * s2_y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
        // Collision detected
        return {x: u1.x + (t * s1_x), y: u1.y + (t * s1_y)};
    }

    return null; // No collision
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