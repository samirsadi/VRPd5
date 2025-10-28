class Snowman{
  constructor(x,z){
    this.a = 0;
    this.da = 1;
    
    this.obj = document.createElement("a-entity")
    for(let i = 0; i < 3; i++){
      let body = document.createElement("a-sphere");
      body.setAttribute("position",{x:0,y:0.5 + 1.5 * i,z:0});
      body.setAttribute("radius",1.25 - 0.20 * i);
      this.obj.append(body)
    }
    for(let i = 0; i < 2; i++){
      let eye = document.createElement("a-sphere");
      eye.setAttribute("position",{x:-0.25 + 0.50 * i,y:3.5,z:0.85});
      eye.setAttribute("radius",0.15);
      eye.setAttribute("color","black")
      this.obj.append(eye)
    }
    let nose = document.createElement("a-cone")
    nose.setAttribute("position",{x:0,y:3.25,z:1});
    nose.setAttribute("rotation",{x:90,y:0,z:0});
    nose.setAttribute("radius-bottom",0.1);
    nose.setAttribute("radius-top",0.01);
    nose.setAttribute("color","tomato");
    nose.setAttribute("height",0.5);
    this.obj.append(nose)
    for(let i = 0; i < 2; i++){
      let arm = document.createElement("a-cylinder");
      arm.setAttribute("position",{x:-1.25 + 2 * i,y:2.75,z:0.5});
      arm.setAttribute("rotation",{x:0,y:0,z:60 - 120 * i});
      arm.setAttribute("radius",0.15);
      arm.setAttribute("color","#A52A2A")
      arm.setAttribute("height",2);
      this.obj.append(arm)
    }
    this.obj.setAttribute("position",{x:x,y:0,z:z});
    scene.append(this.obj);
  }
  spin(){
    this.a += this.da;
    this.obj.setAttribute("rotation",{x:0, y:this.a, z:0});
  }
}