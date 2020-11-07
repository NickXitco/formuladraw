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
        this.shapes = [];
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

            if (this.line1.length > 0 && this.line2.length > 0 && !this.drawingLine2 && this.intersections.length === 0) {
                setIntersections(this.line1, this.line2);
                this.intersections = getIntersections(this.line1, this.line2);

                const chains1 = getChains(this.line1);
                const chains2 = getChains(this.line2);
                this.shapes = shapesFromChains(chains1, chains2);
                for (let i = 0; i < this.shapes.length; i++) {
                    this.shapes[i].color = p.color(Math.random() * 255, Math.random() * 255, Math.random() * 255, 255);
                }
            }

            for (const point of this.intersections) {
                p.noFill();
                p.stroke('black');
                p.circle(point.x, point.y, 10);
            }

            if (p.frameCount % 10 === 0) {
                this.shapes = shuffle(this.shapes);
            }

            for (const shape of this.shapes) {
                this.drawLine(p, shape, 'purple', shape.color);
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

    drawLine(p, line, strokeColor, fillColor) {
        p.beginShape();
        p.fill(fillColor);
        for (const point of line) {
            p.stroke(strokeColor);
            p.strokeWeight(2);
            p.vertex(point.x, point.y);
        }
        if (line.length > 0) {
            p.vertex(line[0].x, line[0].y);
        }
        p.endShape();
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

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}


//TODO analyse two rings problem, should only take two of the four shapes given.
function shapesFromChains(chains1, chains2) {
    //for every chain in chains1
    //check if any chain in chains2 has the same beginning and end as the chains1 chain
    //you have to check if they're reversed
    let shapes = [];

    for (const a of chains1) {
        const aU = a[0];
        const aV = a[a.length - 1];
        for (const b of chains2) {
            const bU = b[0];
            const bV = b[b.length - 1];
            let shape = [...a];
            if (aU === bU && aV === bV) {
                //create shape from chains
                for (let i = b.length - 2; i > 0; i--) {
                    shape.push(b[i]);
                }
                shapes.push(shape);
            } else if (aU === bV && aV === bU) {
                //create shape from chains
                for (let i = 1; i < b.length - 1; i++) {
                    shape.push(b[i]);
                }
                shapes.push(shape);
            }
        }
    }

    return shapes;
}

function setIntersections(line1, line2) {
    //Naive O(n^2) intersection algorithm
    for (let i = 0; i < line1.length; i++) {
        for (let j = 0; j < line2.length; j++) {
            if (line1[i].intersection || line1[(i + 1) % (line1.length)].intersection || line2[j].intersection || line2[(j + 1) % (line2.length)].intersection) continue;
            let intersection = getLineIntersection(line1[i], line1[(i + 1) % (line1.length)], line2[j], line2[(j + 1) % (line2.length)]);
            if (intersection) {
                line1.splice((i + 1) % (line1.length), 0, intersection);
                line2.splice((j + 1) % (line2.length), 0, intersection);
            }
        }
    }
}

function getIntersections(line1, line2) {
    let intersections = [];
    for (const point of line1) {
        if (point.intersection) {
            intersections.push(point);
        }
    }
    return intersections;
}

function getChains(line) {
    let chains = [];
    let currentChain = [];
    let startIndex = 0;

    //Find first intersection
    for (let i = 0; i < line.length; i++) {
        if (line[i].intersection) {
            startIndex = i + 1;
            currentChain.push(line[i]);
            break;
        }
    }

    for (let i = 0; i <= line.length; i++) {
        const _i = (startIndex + i) % line.length;
        currentChain.push(line[_i]);
        if (line[_i].intersection) {
            chains.push(currentChain);
            currentChain = [line[_i]];
        }
    }
    return chains;
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
        return {x: u1.x + (t * s1_x), y: u1.y + (t * s1_y), intersection: true};
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