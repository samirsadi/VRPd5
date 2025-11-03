class UFO {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.dy = -0.01;
    this.angle = 0;
    this.spinSpeed = 1;

    this.obj = document.createElement("a-entity");

    let lowerDisk = document.createElement("a-cone");
    lowerDisk.setAttribute("radius-bottom", "4");
    lowerDisk.setAttribute("radius-top", "2.5");
    lowerDisk.setAttribute("height", "1");
    lowerDisk.setAttribute("rotation", "180 0 0");
    lowerDisk.setAttribute("color", "gray");
    this.obj.append(lowerDisk);

    let middleRing = document.createElement("a-torus");
    middleRing.setAttribute("radius", "3.2");
    middleRing.setAttribute("radius-tubular", "0.3");
    middleRing.setAttribute("rotation", "90 0 0");
    middleRing.setAttribute("position", "0 0.5 0");
    middleRing.setAttribute("color", "black");
    this.obj.append(middleRing);

    let upperHull = document.createElement("a-cone");
    upperHull.setAttribute("radius-bottom", "3");
    upperHull.setAttribute("radius-top", "0.8");
    upperHull.setAttribute("height", "1.2");
    upperHull.setAttribute("position","0 0.7 0");
    upperHull.setAttribute("color", "gray");
    this.obj.append(upperHull);

    let dome = document.createElement("a-sphere");
    dome.setAttribute("radius", "1");
    dome.setAttribute("position", "0 1.4 0");
    dome.setAttribute("color", "cyan");
    dome.setAttribute("opacity", "0.25");
    this.obj.append(dome);

    let domeFrame = document.createElement("a-torus");
    domeFrame.setAttribute("radius", "1.05");
    domeFrame.setAttribute("radius-tubular", "0.05");
    domeFrame.setAttribute("position", "0 1.4 0");
    domeFrame.setAttribute("rotation", "90 0 0");
    domeFrame.setAttribute("color", "black");
    this.obj.append(domeFrame);

    let underGlow = document.createElement("a-torus");
    underGlow.setAttribute("radius", "1.8");
    underGlow.setAttribute("radius-tubular", "0.1");
    underGlow.setAttribute("rotation", "90 0 0");
    underGlow.setAttribute("position", "0 -0.35 0");
    underGlow.setAttribute("color", "cyan");
    underGlow.setAttribute("opacity", "0.6");
    this.obj.appendChild(underGlow);

    let beam = document.createElement("a-cone");
    beam.setAttribute("position", "0 -15 0");
    beam.setAttribute("rotation", "0 0 0");
    beam.setAttribute("radius-bottom", "5");
    beam.setAttribute("radius-top", "0.3");
    beam.setAttribute("height", "30");
    beam.setAttribute("color", "yellow");
    beam.setAttribute("opacity", "0.25");
    this.obj.append(beam);

    this.obj.setAttribute("position", { x:x, y:y, z:z });
    scene.append(this.obj);
  }
  invade() {
    this.angle += this.spinSpeed;
    this.y += this.dy;
    this.obj.setAttribute("rotation", { x: 0, y: this.angle, z: 0 });
    this.obj.setAttribute("position", { x:this.x, y:this.y, z:this.z });
    if(this.y < 0){
      this.y = rnd(0,30);
      this.x = rnd(-100,100);
    }
  }
}