class Snowflake{
  constructor(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
    this.dy = 0.1;
    this.obj = document.createElement("a-sphere");
    this.obj.setAttribute("radius",0.1);
    this.obj.setAttribute("opacity",0.65);
    this.obj.setAttribute("position",{x:x,y:y,z:z});
    scene.append( this.obj );
  }

  fall(){
    this.y -= this.dy;
    this.obj.setAttribute("position",{x:this.x, y:this.y, z:this.z})
    if(this.y < 0){
      this.y = rnd(10,20);
    }
  }
}