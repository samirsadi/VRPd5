let rnd = (l,u) => Math.floor(Math.random()*(u-l) + l);
let scene, rockets = [], ufos = [];

window.addEventListener("DOMContentLoaded",function() {
  scene = document.querySelector("a-scene"); 
  for(let i = 0; i < 100; i++){
    let x = rnd(-100,100);
    let z = rnd(-100,100);
    let rocket = new Rocket(x, -3, z);
    rockets.push(rocket);
  }
  for(let i = 0; i < 100; i++){
    let x = rnd(-100,100);
    let z = rnd(-100,100);
    let ufo = new UFO(x, 5, z);
    ufos.push(ufo);
  }
  // ufo = new UFO(0, 0, 0)
  loop();
})

function loop(){
  for(let rocket of rockets){
    rocket.fly();
  }
  for(let ufo of ufos){
    ufo.invade();
  }
  // ufo.invade();
  // rocket.fly();
  
  window.requestAnimationFrame( loop );
}
