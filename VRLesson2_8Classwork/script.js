let target;

window.addEventListener("DOMContentLoaded",function() {
  target = document.querySelector("#target");
  target.a = 0;
  target.da = -1;

  loop();
})

function loop(){
  target.a += target.da;

  target.setAttribute("rotation",{x:target.a, y:0, z: 0});

  window.requestAnimationFrame( loop );
}