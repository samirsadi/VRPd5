class Rocket{
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
        this.dy = 0.01 + Math.random() * 0.5;
        this.obj = document.createElement("a-entity");

        let tipt = document.createElement("a-sphere");
        tipt.setAttribute("color","white");
        tipt.setAttribute("position","0 2.7 0");
        tipt.setAttribute("radius","0.16");
        this.obj.append( tipt );

        let tip = document.createElement("a-cone");
        tip.setAttribute("color","white");
        tip.setAttribute("position","0 2.4375 0");
        tip.setAttribute("radius-bottom","0.35");
        tip.setAttribute("radius-top","0.15");
        tip.setAttribute("height","0.625");
        this.obj.append( tip );

        let tip1 = document.createElement("a-cone");
        tip1.setAttribute("color","white");
        tip1.setAttribute("position","0 1.8125 0");
        tip1.setAttribute("radius-bottom","0.45");
        tip1.setAttribute("radius-top","0.35");
        tip1.setAttribute("height","0.625");
        this.obj.append( tip1 );

        let tip2 = document.createElement("a-cone");
        tip2.setAttribute("color","white");
        tip2.setAttribute("position","0 1 0");
        tip2.setAttribute("radius-bottom","0.5");
        tip2.setAttribute("radius-top","0.45");
        tip2.setAttribute("height","1");
        this.obj.append( tip2 );

        let base = document.createElement("a-cylinder");
        base.setAttribute("rotation","0 0 0");
        // base.setAttribute("color","brown");
        base.setAttribute("position","0 -0.5 0");
        base.setAttribute("height","2");
        base.setAttribute("radius","0.5");
        base.setAttribute("src","metal-submarine-spaceship-porthole-window-260nw-624510917.webp");
        this.obj.append( base );

        let base1 = document.createElement("a-cylinder");
        base1.setAttribute("rotation","0 0 0");
        // base1.setAttribute("color","brown");
        base1.setAttribute("position","0 -4.5 0");
        base1.setAttribute("height","6");
        base1.setAttribute("radius","0.51");
        base1.setAttribute("src","technology-metal-textures-texture-rocket-body-26238.jpg");
        this.obj.append( base1 );

        let booster = document.createElement("a-cone");
        booster.setAttribute("color","white");
        booster.setAttribute("position","0 -7.5875 0");
        booster.setAttribute("radius-bottom","0.5");
        booster.setAttribute("radius-top","0.45");
        booster.setAttribute("height","0.175");
        booster.setAttribute("src","rocket.jpg");
        this.obj.append( booster );

        let stipt = document.createElement("a-sphere");
        stipt.setAttribute("color","white");
        stipt.setAttribute("position","0.75 -4.4 0");
        stipt.setAttribute("radius","0.145");
        this.obj.append( stipt );

        let stip1 = document.createElement("a-cone");
        stip1.setAttribute("color","white");
        stip1.setAttribute("position","0.75 -4.65 0");
        stip1.setAttribute("radius-bottom","0.25");
        stip1.setAttribute("radius-top","0.15");
        stip1.setAttribute("height","0.5");
        this.obj.append( stip1 );

        let sbase = document.createElement("a-cylinder");
        sbase.setAttribute("color","white");
        sbase.setAttribute("position","0.75 -6.15 0");
        sbase.setAttribute("radius","0.255");
        sbase.setAttribute("height","2.5");
        this.obj.append( sbase );

        let sbooster = document.createElement("a-cone");
        sbooster.setAttribute("color","white");
        sbooster.setAttribute("position","0.75 -7.475 0");
        sbooster.setAttribute("radius-bottom","0.24");
        sbooster.setAttribute("radius-top","0.2");
        sbooster.setAttribute("height","0.15");
        sbooster.setAttribute("src","rocket.jpg");
        this.obj.append( sbooster );

        let stipt2 = document.createElement("a-sphere");
        stipt2.setAttribute("color","white");
        stipt2.setAttribute("position","-0.75 -4.4 0");
        stipt2.setAttribute("radius","0.145");
        this.obj.append( stipt2 );

        let stip2 = document.createElement("a-cone");
        stip2.setAttribute("color","white");
        stip2.setAttribute("position","-0.75 -4.65 0");
        stip2.setAttribute("radius-bottom","0.25");
        stip2.setAttribute("radius-top","0.15");
        stip2.setAttribute("height","0.5");
        this.obj.append( stip2 );

        let sbase2 = document.createElement("a-cylinder");
        sbase2.setAttribute("color","white");
        sbase2.setAttribute("position","-0.75 -6.15 0");
        sbase2.setAttribute("radius","0.255");
        sbase2.setAttribute("height","2.5");
        this.obj.append( sbase2 );

        let sbooster2 = document.createElement("a-cone");
        sbooster2.setAttribute("color","white");
        sbooster2.setAttribute("position","-0.75 -7.475 0");
        sbooster2.setAttribute("radius-bottom","0.24");
        sbooster2.setAttribute("radius-top","0.2");
        sbooster2.setAttribute("height","0.15");
        sbooster2.setAttribute("src","rocket.jpg");
        this.obj.append( sbooster2 );

        let fire3 = document.createElement("a-cone");
        fire3.setAttribute("color","yellow");
        fire3.setAttribute("position","0 -8 0");
        fire3.setAttribute("rotation","-180 0 0");
        fire3.setAttribute("radius-bottom","0.2");
        fire3.setAttribute("radius-top","0");
        fire3.setAttribute("height","3");
        fire3.setAttribute("opacity","0.8");
        this.obj.append( fire3 );

        let fire2 = document.createElement("a-cone");
        fire2.setAttribute("color","orange");
        fire2.setAttribute("position","0 -10 0");
        fire2.setAttribute("rotation","-180 0 0");
        fire2.setAttribute("radius-bottom","0.3");
        fire2.setAttribute("radius-top","0");
        fire2.setAttribute("height","5");
        fire2.setAttribute("opacity","0.6");
        this.obj.append( fire2 );

        let fire = document.createElement("a-cone");
        fire.setAttribute("color","gray");
        fire.setAttribute("position","0 -11.6725 0");
        fire.setAttribute("rotation","-180 0 0");
        fire.setAttribute("radius-bottom","0.5");
        fire.setAttribute("radius-top","0");
        fire.setAttribute("height","8");
        fire.setAttribute("opacity","0.2");
        this.obj.append( fire );
        
        let sfire3 = document.createElement("a-cone");
        sfire3.setAttribute("color","yellow");
        sfire3.setAttribute("position","0.75 -12 0");
        sfire3.setAttribute("rotation","-180 0 0");
        sfire3.setAttribute("radius-bottom","0.05");
        sfire3.setAttribute("radius-top","0");
        sfire3.setAttribute("height","3");
        sfire3.setAttribute("opacity","0.8");
        this.obj.append( fire3 );

        let sfire2 = document.createElement("a-cone");
        sfire2.setAttribute("color","orange");
        sfire2.setAttribute("position","0.75 -12 0");
        sfire2.setAttribute("rotation","-180 0 0");
        sfire2.setAttribute("radius-bottom","0.1");
        sfire2.setAttribute("radius-top","0");
        sfire2.setAttribute("height","5");
        sfire2.setAttribute("opacity","0.6");
        this.obj.append( fire2 );

        let sfire = document.createElement("a-cone");
        sfire.setAttribute("color","gray");
        sfire.setAttribute("position","0.75 -11.6725 0");
        sfire.setAttribute("rotation","-180 0 0");
        sfire.setAttribute("radius-bottom","0.0.2");
        sfire.setAttribute("radius-top","0");
        sfire.setAttribute("height","8");
        sfire.setAttribute("opacity","0.2");
        this.obj.append( sfire );

        this.obj.setAttribute("position",{x:x, y:y, z:z});
        scene.append( this.obj );
    }
    fly(){
        this.y += this.dy;
        this.obj.setAttribute("position",{x:this.x, y:this.y, z:this.z});
    }
}