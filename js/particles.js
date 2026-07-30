var pJS = function(tag_id, params){
  var canvas_el = document.querySelector('#'+tag_id+' > .particles-js-canvas-el');
  this.pJS = {
    canvas: { el: canvas_el, w: canvas_el.offsetWidth, h: canvas_el.offsetHeight },
    particles: {
      number: { value: 400, density: { enable: true, value_area: 800 } },
      color: { value: '#fff' },
      shape: { type: 'circle', stroke: { width: 0, color: '#ff0000' } },
      opacity: { value: 1, random: false, anim: { enable: false, speed: 2, opacity_min: 0, sync: false } },
      size: { value: 20, random: false, anim: { enable: false, speed: 20, size_min: 0, sync: false } },
      line_linked: { enable: true, distance: 100, color: '#fff', opacity: 1, width: 1 },
      move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false, attract: { enable: false, rotateX: 3000, rotateY: 3000 } },
      array: []
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
      modes: { grab: { distance: 100, line_linked: { opacity: 1 } }, bubble: { distance: 200, size: 80, duration: 0.4, opacity: 8, speed: 3 }, repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 4 }, remove: { particles_nb: 2 } },
      mouse: {}
    },
    retina_detect: false,
    fn: { interact: {}, modes: {}, vendors: {} },
    tmp: {}
  };

  var pJS = this.pJS;

  if(params){ Object.deepExtend(pJS, params); }

  pJS.tmp.obj = {
    size_value: pJS.particles.size.value,
    line_linked_distance: pJS.particles.line_linked.distance,
    line_linked_width: pJS.particles.line_linked.width,
    move_speed: pJS.particles.move.speed
  };

  pJS.fn.retinaInit = function(){
    if(pJS.retina_detect && window.devicePixelRatio > 1){
      pJS.canvas.pxratio = window.devicePixelRatio;
      pJS.tmp.retina = true;
    } else {
      pJS.canvas.pxratio = 1;
      pJS.tmp.retina = false;
    }
    pJS.canvas.w = pJS.canvas.el.offsetWidth * pJS.canvas.pxratio;
    pJS.canvas.h = pJS.canvas.el.offsetHeight * pJS.canvas.pxratio;
    pJS.particles.size.value = pJS.tmp.obj.size_value * pJS.canvas.pxratio;
    pJS.particles.line_linked.distance = pJS.tmp.obj.line_linked_distance * pJS.canvas.pxratio;
    pJS.particles.line_linked.width = pJS.tmp.obj.line_linked_width * pJS.canvas.pxratio;
    pJS.particles.move.speed = pJS.tmp.obj.move_speed * pJS.canvas.pxratio;
  };

  pJS.fn.canvasInit = function(){
    pJS.canvas.ctx = pJS.canvas.el.getContext('2d');
  };

  pJS.fn.canvasSize = function(){
    pJS.canvas.el.width = pJS.canvas.w;
    pJS.canvas.el.height = pJS.canvas.h;
    if(pJS && pJS.interactivity.events.resize){
      window.addEventListener('resize', function(){
        pJS.canvas.w = pJS.canvas.el.offsetWidth;
        pJS.canvas.h = pJS.canvas.el.offsetHeight;
        if(pJS.tmp.retina){
          pJS.canvas.w *= pJS.canvas.pxratio;
          pJS.canvas.h *= pJS.canvas.pxratio;
        }
        pJS.canvas.el.width = pJS.canvas.w;
        pJS.canvas.el.height = pJS.canvas.h;
        if(!pJS.particles.move.enable){
          pJS.fn.particlesEmpty();
          pJS.fn.particlesCreate();
          pJS.fn.particlesDraw();
          pJS.fn.densityAutoParticles();
        }
        pJS.fn.densityAutoParticles();
      });
    }
  };

  pJS.fn.canvasPaint = function(){
    pJS.canvas.ctx.clearRect(0, 0, pJS.canvas.w, pJS.canvas.h);
  };

  pJS.fn.particle = function(color, opacity, position){
    this.radius = (pJS.particles.size.random ? Math.random() : 1) * pJS.particles.size.value;
    if(pJS.particles.size.anim.enable){
      this.size_status = false;
      this.vs = pJS.particles.size.anim.speed / 100;
      if(!pJS.particles.size.anim.sync){ this.vs = this.vs * Math.random(); }
    }
    this.x = position ? position.x : Math.random() * pJS.canvas.w;
    this.y = position ? position.y : Math.random() * pJS.canvas.h;
    if(this.x > pJS.canvas.w - this.radius * 2) this.x = this.x - this.radius;
    else if(this.x < this.radius * 2) this.x = this.x + this.radius;
    if(this.y > pJS.canvas.h - this.radius * 2) this.y = this.y - this.radius;
    else if(this.y < this.radius * 2) this.y = this.y + this.radius;

    this.color = {};
    if(typeof(color.value) == 'object'){
      if(color.value instanceof Array){
        var color_selected = color.value[Math.floor(Math.random() * color.value.length)];
        this.color.rgb = hexToRgb(color_selected);
      }else{
        if(color.value.r != undefined && color.value.g != undefined && color.value.b != undefined){
          this.color.rgb = { r: color.value.r, g: color.value.g, b: color.value.b };
        }
        if(color.value.h != undefined && color.value.s != undefined && color.value.l != undefined){
          this.color.hsl = { h: color.value.h, s: color.value.s, l: color.value.l };
        }
      }
    }else if(color.value == 'random'){
      this.color.rgb = { r: (Math.floor(Math.random() * 256)), g: (Math.floor(Math.random() * 256)), b: (Math.floor(Math.random() * 256)) };
    }else if(typeof(color.value) == 'string'){
      this.color.rgb = hexToRgb(color.value);
    }

    this.opacity = (pJS.particles.opacity.random ? Math.random() : 1) * pJS.particles.opacity.value;

    var dir_x = pJS.particles.move.direction.indexOf('right') !== -1 ? 1 : pJS.particles.move.direction.indexOf('left') !== -1 ? -1 : 0;
    var dir_y = pJS.particles.move.direction.indexOf('bottom') !== -1 ? 1 : pJS.particles.move.direction.indexOf('top') !== -1 ? -1 : 0;

    this.vx = dir_x + (pJS.particles.move.random ? (Math.random() - 0.5) : 0);
    this.vy = dir_y + (pJS.particles.move.random ? (Math.random() - 0.5) : 0);

    if(pJS.particles.move.straight){
      this.vx = (dir_x === 0 ? 0 : this.vx);
      this.vy = (dir_y === 0 ? 0 : this.vy);
    }
  };

  pJS.fn.particle.prototype.draw = function(){
    var p = this;
    var radius = p.radius;
    var opacity = p.opacity;
    var color_value = p.color.rgb ? 'rgba('+p.color.rgb.r+','+p.color.rgb.g+','+p.color.rgb.b+','+opacity+')' : 'hsla('+p.color.hsl.h+','+p.color.hsl.s+'%,'+p.color.hsl.l+'%,'+opacity+')';

    pJS.canvas.ctx.fillStyle = color_value;
    pJS.canvas.ctx.beginPath();
    pJS.canvas.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2, false);
    pJS.canvas.ctx.closePath();
    pJS.canvas.ctx.fill();
  };

  pJS.fn.particlesCreate = function(){
    for(var i = 0; i < pJS.particles.number.value; i++){
      pJS.particles.array.push(new pJS.fn.particle(pJS.particles.color, pJS.particles.opacity.value));
    }
  };

  pJS.fn.particlesUpdate = function(){
    for(var i = 0; i < pJS.particles.array.length; i++){
      var p = pJS.particles.array[i];

      if(pJS.particles.move.enable){
        var ms = pJS.particles.move.speed / 2;
        p.x += p.vx * ms;
        p.y += p.vy * ms;
      }

      if(pJS.particles.move.out_mode == 'bounce'){
        var ax = p.x + p.radius, ay = p.y + p.radius, bx = p.x - p.radius, by = p.y - p.radius;
        if(ax >= pJS.canvas.w || bx <= 0) p.vx = -p.vx;
        if(ay >= pJS.canvas.h || by <= 0) p.vy = -p.vy;
      } else {
        if(p.x - p.radius > pJS.canvas.w) p.x = -p.radius;
        else if(p.x + p.radius < 0) p.x = pJS.canvas.w + p.radius;
        if(p.y - p.radius > pJS.canvas.h) p.y = -p.radius;
        else if(p.y + p.radius < 0) p.y = pJS.canvas.h + p.radius;
      }
    }
  };

  pJS.fn.particlesDraw = function(){
    pJS.canvas.ctx.clearRect(0, 0, pJS.canvas.w, pJS.canvas.h);
    pJS.fn.particlesUpdate();
    for(var i = 0; i < pJS.particles.array.length; i++){
      pJS.particles.array[i].draw();
    }
  };

  pJS.fn.particlesEmpty = function(){
    pJS.particles.array = [];
  };

  pJS.fn.densityAutoParticles = function(){
    if(pJS.particles.number.density.enable){
      var area = pJS.canvas.el.width * pJS.canvas.el.height / 1000;
      if(pJS.tmp.retina){ area = area / (pJS.canvas.pxratio * 2); }
      var nb_particles = area * pJS.particles.number.value / pJS.particles.number.density.value_area;
      var missing_particles = pJS.particles.array.length - nb_particles;
      if(missing_particles < 0){
        for(var i = 0; i < Math.abs(missing_particles); i++){
          pJS.particles.array.push(new pJS.fn.particle(pJS.particles.color, pJS.particles.opacity.value));
        }
      }else{
        pJS.particles.array.splice(0, missing_particles);
      }
    }
  };

  pJS.fn.vendors.start = function(){
    pJS.fn.retinaInit();
    pJS.fn.canvasInit();
    pJS.fn.canvasSize();
    pJS.fn.canvasPaint();
    pJS.fn.particlesCreate();
    pJS.fn.densityAutoParticles();
    pJS.fn.vendors.animate();
  };

  pJS.fn.vendors.animate = function(){
    pJS.fn.particlesDraw();
    pJS.fn.requestAnimFrame = requestAnimationFrame(pJS.fn.vendors.animate);
  };

  pJS.fn.vendors.start();
};

function hexToRgb(hex){
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

Object.deepExtend = function(destination, source) {
  for (var property in source) {
    if (source[property] && source[property].constructor === Object) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

window.particlesJS = function(tag_id, params){
  if(typeof(tag_id) != 'string'){
    params = tag_id;
    tag_id = 'particles-js';
  }
  if(!tag_id){
    tag_id = 'particles-js';
  }
  var pContainer = document.getElementById(tag_id);
  var pClass = 'particles-js-canvas-el';
  var pCanvas = pContainer.getElementsByClassName(pClass);
  if(pCanvas.length){
    while(pCanvas.length > 0){
      pContainer.removeChild(pCanvas[0]);
    }
  }
  var canvas_el = document.createElement('canvas');
  canvas_el.className = pClass;
  canvas_el.style.width = "100%";
  canvas_el.style.height = "100%";
  var canvas = pContainer.appendChild(canvas_el);
  if(canvas != null){
    new pJS(tag_id, params);
  }
};
