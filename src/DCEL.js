export class DCEL {
    vertices;
    faces;
    hedges;

    constructor() {
        this.vertices = new Set();
        this.faces = new Set();
        this.hedges = new Set();
    }

    addVertex(x, y) {
        this.vertices.add(new Vertex());
        console.log(this.vertices);
    }
}

class Vertex {
    id;
    coordinates;
    incidentEdge;
}

class Face {
    id;
    outerComponent;
    innerComponents;
}

class Hedge {
    id;
    origin;
    twin;
    face;
    next;
    prev;
}