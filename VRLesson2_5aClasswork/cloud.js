class Cloud{
  constructor(x,y,z){
    // Challenge 1: Create animation variables  x and dx for the Cloud to fly.  Set them to appropriate values.
    this.obj = document.createElement("a-entity");
    let shapes = ["a-dodecahedron","a-icosahedron","a-octahedron","a-tetrahedron"];

    for(let i = -1; i <= 1; i++){
      let r = rnd(0,shapes.length);
      let puff = document.createElement(shapes[r]);
      puff.setAttribute("position",{x:i, y:0, z:0});
      this.obj.append( puff );
    }
    this.obj.setAttribute("position",{x:x, y:y, z:z});
    scene.append( this.obj )
  }
  //Challenge 2: Create a function fly() which increases x by dx and updates the Cloud object to that x position
}