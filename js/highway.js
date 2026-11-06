/**
 * GeminiTA6 - Vice City Coastal Highway & Traffic Simulator
 * High-performance HTML5 Canvas simulation of cars driving through Vice City
 */

class HighwaySimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Simulation states
    this.timeOfDay = 'sunset'; // 'sunset', 'midnight', 'golden'
    this.trafficDensity = 'normal'; // 'light', 'normal', 'rush'
    this.cars = [];
    this.particles = [];
    this.stars = [];
    this.skyscrapers = [];
    this.palmTrees = [];
    this.lights = [];
    this.lastTime = performance.now();
    this.spawnTimer = 0;
    this.policeChaseActive = false;

    // Road geometry
    this.roadY = 0;
    this.roadHeight = 0;
    this.lanes = [];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Generate static environmental assets
    this.generateStars();
    this.generateSkyline();
    this.generatePalms();

    // Seed initial traffic
    this.seedTraffic(8);

    // Highway click interaction: spawn fast car or police chase
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      if (clickY > this.roadY - 50) {
        this.spawnStuntCar(e.clientX - rect.left);
      }
    });

    // Start render loop
    requestAnimationFrame((t) => this.loop(t));
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // Compute road boundaries: occupies the bottom 32% of viewport
    this.roadHeight = Math.max(160, Math.min(260, this.height * 0.32));
    this.roadY = this.height - this.roadHeight + 20;

    // 4 traffic lanes: 0,1 going left; 2,3 going right
    const laneHeight = this.roadHeight / 4.2;
    this.lanes = [
      { y: this.roadY + laneHeight * 0.45, dir: -1, scale: 0.75, speedBase: 3.2 },
      { y: this.roadY + laneHeight * 1.35, dir: -1, scale: 0.85, speedBase: 4.0 },
      { y: this.roadY + laneHeight * 2.30, dir: 1,  scale: 0.95, speedBase: 3.8 },
      { y: this.roadY + laneHeight * 3.25, dir: 1,  scale: 1.08, speedBase: 4.8 }
    ];

    this.generateSkyline();
    this.generatePalms();
  }

  generateStars() {
    this.stars = [];
    const count = 90;
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.5),
        radius: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01
      });
    }
  }

  generateSkyline() {
    this.skyscrapers = [];
    const count = Math.ceil(this.width / 45) + 8;
    let curX = -20;

    const buildingTypes = ['tower', 'artdeco', 'hotel', 'antenna', 'stepped'];

    for (let i = 0; i < count; i++) {
      const bWidth = Math.random() * 55 + 35;
      const bHeight = Math.random() * (this.height * 0.35) + (this.height * 0.12);
      const bType = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];

      // Windows grid
      const windows = [];
      const rows = Math.floor(bHeight / 14);
      const cols = Math.floor(bWidth / 10);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.4) {
            windows.push({
              r, c,
              lit: Math.random() > 0.35,
              color: Math.random() > 0.5 ? '#ffd166' : (Math.random() > 0.5 ? '#00f0ff' : '#ff3b94')
            });
          }
        }
      }

      this.skyscrapers.push({
        x: curX,
        y: this.roadY - bHeight - 15,
        width: bWidth,
        height: bHeight,
        type: bType,
        windows,
        neonSign: (i % 6 === 0) ? this.getRandomSign() : null
      });

      curX += bWidth - (Math.random() * 10 + 2);
    }
  }

  getRandomSign() {
    const signs = ['MALIBU', 'OCEAN DR', 'GEMINI', 'VICE ROYALE', 'STARFISH', 'NEON 86'];
    const colors = ['#ff007f', '#00f0ff', '#ffb703', '#9d4edd'];
    return {
      text: signs[Math.floor(Math.random() * signs.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      flicker: Math.random() > 0.3
    };
  }

  generatePalms() {
    this.palmTrees = [];
    const count = Math.ceil(this.width / 110) + 4;
    for (let i = 0; i < count; i++) {
      this.palmTrees.push({
        x: (i * 110) + (Math.random() * 30 - 15),
        y: this.roadY - 10,
        height: Math.random() * 60 + 80,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.02 + 0.015,
        tilt: (Math.random() - 0.5) * 16
      });
    }
  }

  seedTraffic(count) {
    this.cars = [];
    const models = ['testarossa', 'banshee', 'sabre', 'taxi', 'cruiser', 'convertible'];

    for (let i = 0; i < count; i++) {
      const laneIdx = Math.floor(Math.random() * this.lanes.length);
      const lane = this.lanes[laneIdx];
      const model = models[Math.floor(Math.random() * models.length)];
      const x = Math.random() * (this.width + 400) - 200;

      this.cars.push(this.createCar(x, laneIdx, model));
    }
  }

  createCar(x, laneIdx, model) {
    const lane = this.lanes[laneIdx];
    const baseSpeed = lane.speedBase * (lane.dir);
    const speedVariation = (Math.random() * 1.6 - 0.8);
    const finalSpeed = baseSpeed + (lane.dir > 0 ? speedVariation : -speedVariation);

    const colors = {
      testarossa: ['#f8f9fa', '#e63946', '#ffd166'],
      banshee: ['#00f0ff', '#7209b7', '#ff007f'],
      sabre: ['#4a0e4e', '#d90429', '#1d3557'],
      taxi: ['#ffb703'],
      cruiser: ['#ffffff'],
      convertible: ['#ff3b94', '#06d6a0', '#f72585']
    };

    const colorChoices = colors[model] || ['#ffffff'];
    const bodyColor = colorChoices[Math.floor(Math.random() * colorChoices.length)];

    return {
      x,
      laneIdx,
      model,
      color: bodyColor,
      dir: lane.dir,
      speed: finalSpeed,
      scale: lane.scale,
      width: (model === 'cruiser' || model === 'sabre' ? 88 : 80) * lane.scale,
      height: 28 * lane.scale,
      underglow: model === 'banshee' ? '#00f0ff' : (model === 'testarossa' ? '#ff007f' : null),
      strobePhase: 0,
      boost: false,
      tailTrail: []
    };
  }

  spawnStuntCar(targetX) {
    // Spawn a screaming fast sports car
    const laneIdx = Math.random() > 0.5 ? 2 : 3;
    const lane = this.lanes[laneIdx];
    const car = this.createCar(lane.dir > 0 ? -120 : this.width + 120, laneIdx, 'banshee');
    car.speed = lane.dir * (Math.random() * 3 + 8.5);
    car.boost = true;
    car.color = '#ff0055';
    car.underglow = '#00ffff';
    this.cars.push(car);

    if (window.soundEngine) {
      window.soundEngine.playCarRoar(true);
    }

    // Sometimes spawn police car chasing it!
    setTimeout(() => {
      this.spawnPolicePursuit(laneIdx, lane.dir);
    }, 450);
  }

  spawnPolicePursuit(laneIdx, dir) {
    const car = this.createCar(dir > 0 ? -140 : this.width + 140, laneIdx, 'cruiser');
    car.speed = dir * (Math.random() * 2 + 7.8);
    car.boost = true;
    this.cars.push(car);

    if (window.soundEngine) {
      window.soundEngine.playPoliceSiren(3.5);
    }
  }

  // Animation Loop
  loop(time) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    this.update(dt, time);
    this.render(time);

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt, time) {
    // Traffic spawning
    const targetCount = this.trafficDensity === 'rush' ? 14 : (this.trafficDensity === 'light' ? 5 : 9);
    this.spawnTimer += dt;
    if (this.cars.length < targetCount && this.spawnTimer > 1.2) {
      this.spawnTimer = 0;
      const laneIdx = Math.floor(Math.random() * this.lanes.length);
      const lane = this.lanes[laneIdx];
      const models = ['testarossa', 'banshee', 'sabre', 'taxi', 'convertible'];
      if (Math.random() < 0.15) models.push('cruiser');
      const model = models[Math.floor(Math.random() * models.length)];

      const spawnX = lane.dir > 0 ? -120 : this.width + 120;
      this.cars.push(this.createCar(spawnX, laneIdx, model));
    }

    // Update cars
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const car = this.cars[i];
      car.x += car.speed * 60 * dt;

      // Strobe for police cruisers
      if (car.model === 'cruiser') {
        car.strobePhase = (car.strobePhase + dt * 14) % (Math.PI * 2);
      }

      // Record taillight streak history
      if (car.tailTrail.length > 8) car.tailTrail.shift();
      car.tailTrail.push({ x: car.x, y: this.lanes[car.laneIdx].y });

      // Boost particles
      if (car.boost && Math.random() < 0.4) {
        const exhaustX = car.dir > 0 ? car.x - car.width * 0.45 : car.x + car.width * 0.45;
        this.particles.push({
          x: exhaustX,
          y: this.lanes[car.laneIdx].y + 6,
          vx: -car.dir * (Math.random() * 2 + 3),
          vy: (Math.random() - 0.5) * 1.5,
          color: Math.random() > 0.5 ? '#00f0ff' : '#ff007f',
          radius: Math.random() * 3 + 2,
          life: 0.35,
          maxLife: 0.35
        });
      }

      // Despawn offscreen
      if ((car.dir > 0 && car.x > this.width + 180) || (car.dir < 0 && car.x < -180)) {
        this.cars.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(time) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Sky & Sun/Moon
    this.drawSky();
    this.drawStars(time);
    this.drawRetroSun(time);

    // 2. City Skyline
    this.drawSkyline(time);

    // 3. Water & Ocean Bay Reflections
    this.drawOceanBay(time);

    // 4. Palms in background
    this.drawPalms(time);

    // 5. Road Surface & Markings
    this.drawRoad();

    // 6. Traffic Lanes & Cars
    this.drawCars(time);

    // 7. Particles (sparks, nitro flames)
    this.drawParticles();

    // 8. Atmospheric Bloom / Cinematic Vignette
    this.drawVignette();
  }

  drawSky() {
    const ctx = this.ctx;
    const grad = ctx.createLinearGradient(0, 0, 0, this.roadY);

    if (this.timeOfDay === 'sunset') {
      grad.addColorStop(0.0, '#0c0728'); // Deep indigo
      grad.addColorStop(0.3, '#2a0845'); // Royal purple
      grad.addColorStop(0.6, '#b5179e'); // Neon magenta
      grad.addColorStop(0.85, '#ff477e'); // Hot pink
      grad.addColorStop(1.0, '#ffaa00'); // Sunset amber
    } else if (this.timeOfDay === 'midnight') {
      grad.addColorStop(0.0, '#03001e');
      grad.addColorStop(0.4, '#100b32');
      grad.addColorStop(0.75, '#1e1b4b');
      grad.addColorStop(1.0, '#002b5b');
    } else { // 'golden'
      grad.addColorStop(0.0, '#1f1a3a');
      grad.addColorStop(0.4, '#7b2cbf');
      grad.addColorStop(0.7, '#ff5400');
      grad.addColorStop(1.0, '#ffe169');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.roadY);
  }

  drawStars(time) {
    const ctx = this.ctx;
    ctx.save();
    for (const star of this.stars) {
      const alpha = Math.sin(time * 0.002 + star.twinkleSpeed * 100) * 0.35 + star.alpha;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, alpha)})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawRetroSun(time) {
    const ctx = this.ctx;
    const sunX = this.width * 0.68;
    const sunY = this.roadY - 110;
    const sunRadius = Math.min(this.width * 0.12, 110);

    ctx.save();
    // Sun outer glow
    const sunGlow = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.2, sunX, sunY, sunRadius * 2.2);
    sunGlow.addColorStop(0, this.timeOfDay === 'sunset' ? 'rgba(255, 80, 160, 0.45)' : 'rgba(0, 240, 255, 0.35)');
    sunGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Clip sun to draw horizontal scanlines
    ctx.save();
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.clip();

    const sunGrad = ctx.createLinearGradient(sunX, sunY - sunRadius, sunX, sunY + sunRadius);
    if (this.timeOfDay === 'sunset') {
      sunGrad.addColorStop(0.0, '#fffb96');
      sunGrad.addColorStop(0.4, '#ff70a6');
      sunGrad.addColorStop(1.0, '#7000ff');
    } else if (this.timeOfDay === 'midnight') {
      sunGrad.addColorStop(0.0, '#e0aaff');
      sunGrad.addColorStop(0.5, '#5a189a');
      sunGrad.addColorStop(1.0, '#00f0ff');
    } else {
      sunGrad.addColorStop(0.0, '#ffffff');
      sunGrad.addColorStop(0.5, '#ffd166');
      sunGrad.addColorStop(1.0, '#ff4800');
    }
    ctx.fillStyle = sunGrad;
    ctx.fillRect(sunX - sunRadius, sunY - sunRadius, sunRadius * 2, sunRadius * 2);

    // Horizontal synthwave lines through sun
    ctx.fillStyle = '#0c0728';
    const numLines = 8;
    for (let i = 0; i < numLines; i++) {
      const lineH = (i + 1) * 2.5;
      const curY = sunY + (i / numLines) * sunRadius;
      ctx.fillRect(sunX - sunRadius, curY, sunRadius * 2, lineH);
    }
    ctx.restore();
    ctx.restore();
  }

  drawSkyline(time) {
    const ctx = this.ctx;
    ctx.save();

    for (const b of this.skyscrapers) {
      // Silhouette gradient
      const bGrad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.height);
      bGrad.addColorStop(0, '#1f1338');
      bGrad.addColorStop(1, '#090518');
      ctx.fillStyle = bGrad;
      ctx.fillRect(b.x, b.y, b.width, b.height);

      // Antenna with blinking red warning light
      if (b.type === 'antenna') {
        ctx.strokeStyle = '#4a2f6d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.x + b.width / 2, b.y);
        ctx.lineTo(b.x + b.width / 2, b.y - 25);
        ctx.stroke();

        const blink = Math.sin(time * 0.005) > 0;
        ctx.fillStyle = blink ? '#ff0033' : '#440000';
        ctx.beginPath();
        ctx.arc(b.x + b.width / 2, b.y - 25, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Windows
      for (const w of b.windows) {
        if (!w.lit) continue;
        const wx = b.x + 4 + w.c * 10;
        const wy = b.y + 8 + w.r * 14;
        if (wx < b.x + b.width - 6 && wy < b.y + b.height - 10) {
          ctx.fillStyle = w.color;
          ctx.globalAlpha = 0.65;
          ctx.fillRect(wx, wy, 5, 7);
        }
      }
      ctx.globalAlpha = 1.0;

      // Neon sign on building
      if (b.neonSign) {
        const sign = b.neonSign;
        const flicker = sign.flicker && Math.sin(time * 0.02 + b.x) < -0.8;
        if (!flicker) {
          ctx.save();
          ctx.font = 'bold 9px "Montserrat", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = sign.color;
          ctx.shadowColor = sign.color;
          ctx.shadowBlur = 10;
          ctx.fillText(sign.text, b.x + b.width / 2, b.y + 20);
          ctx.restore();
        }
      }
    }
    ctx.restore();
  }

  drawOceanBay(time) {
    const ctx = this.ctx;
    const waterY = this.roadY - 35;
    const waterHeight = 35;

    ctx.save();
    const waterGrad = ctx.createLinearGradient(0, waterY, 0, this.roadY);
    waterGrad.addColorStop(0, '#100b2e');
    waterGrad.addColorStop(1, '#060314');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, waterY, this.width, waterHeight);

    // Shimmering reflection waves
    ctx.fillStyle = this.timeOfDay === 'sunset' ? 'rgba(255, 80, 160, 0.25)' : 'rgba(0, 240, 255, 0.2)';
    for (let i = 0; i < 7; i++) {
      const wy = waterY + 4 + i * 4.5;
      const waveOffset = Math.sin(time * 0.003 + i) * 30;
      ctx.fillRect(this.width * 0.55 + waveOffset - (7 - i) * 15, wy, 140 + i * 25, 1.8);
    }
    ctx.restore();
  }

  drawPalms(time) {
    const ctx = this.ctx;
    ctx.save();
    for (const p of this.palmTrees) {
      const sway = Math.sin(time * p.swaySpeed + p.swayPhase) * 6;
      const topX = p.x + p.tilt + sway;
      const topY = p.y - p.height;

      // Trunk
      ctx.strokeStyle = '#090514';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(p.x + p.tilt * 0.5, p.y - p.height * 0.5, topX, topY);
      ctx.stroke();

      // Fronds / Palm leaves
      ctx.fillStyle = '#090514';
      const leafCount = 7;
      for (let j = 0; j < leafCount; j++) {
        const angle = (j / leafCount) * Math.PI * 1.4 - 0.2;
        const leafLen = 32 + (j % 2) * 8;
        const lx = topX + Math.cos(angle) * leafLen;
        const ly = topY - Math.sin(angle) * (leafLen * 0.45);

        ctx.beginPath();
        ctx.moveTo(topX, topY);
        ctx.quadraticCurveTo(topX + Math.cos(angle) * (leafLen * 0.6), topY - 14, lx, ly);
        ctx.lineTo(topX, topY);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawRoad() {
    const ctx = this.ctx;
    ctx.save();

    // Road asphalt gradient
    const asphaltGrad = ctx.createLinearGradient(0, this.roadY, 0, this.height);
    asphaltGrad.addColorStop(0.0, '#1a1824');
    asphaltGrad.addColorStop(0.5, '#12101a');
    asphaltGrad.addColorStop(1.0, '#0a0910');

    ctx.fillStyle = asphaltGrad;
    ctx.fillRect(0, this.roadY, this.width, this.height - this.roadY);

    // Top curb / guard rail with neon pink/cyan edge
    const curbGrad = ctx.createLinearGradient(0, 0, this.width, 0);
    curbGrad.addColorStop(0, '#ff3b94');
    curbGrad.addColorStop(0.5, '#00f0ff');
    curbGrad.addColorStop(1, '#ff3b94');
    ctx.fillStyle = curbGrad;
    ctx.fillRect(0, this.roadY - 2, this.width, 3);

    // Lane markings
    // Center divider (double yellow lines)
    const midY = (this.lanes[1].y + this.lanes[2].y) / 2;
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(0, midY - 3, this.width, 2);
    ctx.fillRect(0, midY + 1, this.width, 2);

    // Dashed white lines for lanes 0-1 and lanes 2-3
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const dashY1 = (this.lanes[0].y + this.lanes[1].y) / 2;
    const dashY2 = (this.lanes[2].y + this.lanes[3].y) / 2;

    const dashLen = 35;
    const gapLen = 45;
    const totalSegment = dashLen + gapLen;
    for (let x = 0; x < this.width; x += totalSegment) {
      ctx.fillRect(x, dashY1, dashLen, 2);
      ctx.fillRect(x, dashY2, dashLen, 2.5);
    }

    ctx.restore();
  }

  drawCars(time) {
    const ctx = this.ctx;

    // Sort cars by lane index so near cars occlude far cars
    const sortedCars = [...this.cars].sort((a, b) => a.laneIdx - b.laneIdx);

    for (const car of sortedCars) {
      ctx.save();
      const lane = this.lanes[car.laneIdx];
      const cx = car.x;
      const cy = lane.y;

      // 1. Underglow lighting
      if (car.underglow) {
        ctx.save();
        ctx.shadowColor = car.underglow;
        ctx.shadowBlur = 18;
        ctx.fillStyle = car.underglow;
        ctx.globalAlpha = 0.55;
        ctx.fillRect(cx - car.width * 0.4, cy - 2, car.width * 0.8, 8);
        ctx.restore();
      }

      // 2. Headlight Beams illuminating the road
      const lightDir = car.dir;
      const beamLen = 140 * car.scale;
      const beamX = lightDir > 0 ? cx + car.width * 0.48 : cx - car.width * 0.48;

      ctx.save();
      const beamGrad = ctx.createLinearGradient(beamX, cy, beamX + lightDir * beamLen, cy);
      beamGrad.addColorStop(0, 'rgba(255, 250, 220, 0.55)');
      beamGrad.addColorStop(0.4, 'rgba(255, 240, 180, 0.25)');
      beamGrad.addColorStop(1, 'rgba(255, 240, 180, 0)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(beamX, cy - 4);
      ctx.lineTo(beamX + lightDir * beamLen, cy - 14);
      ctx.lineTo(beamX + lightDir * beamLen, cy + 14);
      ctx.lineTo(beamX, cy + 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 3. Taillight Red Streak Trails
      const tailX = lightDir > 0 ? cx - car.width * 0.48 : cx + car.width * 0.48;
      ctx.save();
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = 'rgba(255, 10, 50, 0.7)';
      ctx.lineWidth = 3 * car.scale;
      ctx.beginPath();
      ctx.moveTo(tailX, cy - 2);
      ctx.lineTo(tailX - lightDir * (car.boost ? 55 : 22), cy - 2);
      ctx.stroke();
      ctx.restore();

      // 4. Car Body Rendering
      this.renderCarBody(car, cx, cy);

      // 5. Police Strobe Lights
      if (car.model === 'cruiser') {
        const isRed = Math.sin(car.strobePhase) > 0;
        const roofY = cy - 20 * car.scale;

        ctx.save();
        ctx.shadowBlur = 22;
        ctx.shadowColor = isRed ? '#ff0033' : '#00a6ff';
        ctx.fillStyle = isRed ? '#ff0033' : '#00a6ff';
        ctx.beginPath();
        ctx.arc(cx - 6 * car.scale, roofY, 4 * car.scale, 0, Math.PI * 2);
        ctx.arc(cx + 6 * car.scale, roofY, 4 * car.scale, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing ambient flash
        ctx.fillStyle = isRed ? 'rgba(255,0,50,0.18)' : 'rgba(0,180,255,0.18)';
        ctx.beginPath();
        ctx.arc(cx, cy, 70 * car.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  renderCarBody(car, cx, cy) {
    const ctx = this.ctx;
    const w = car.width;
    const h = car.height;
    const dir = car.dir;

    ctx.save();
    ctx.translate(cx, cy);
    if (dir < 0) ctx.scale(-1, 1);

    // Car shadow
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.beginPath();
    ctx.ellipse(0, h * 0.35, w * 0.5, 6 * car.scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#111';
    ctx.fillRect(-w * 0.36, h * 0.1, w * 0.16, h * 0.35);
    ctx.fillRect(w * 0.22, h * 0.1, w * 0.16, h * 0.35);

    // Chrome rims
    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.arc(-w * 0.28, h * 0.26, 4.5 * car.scale, 0, Math.PI * 2);
    ctx.arc(w * 0.30, h * 0.26, 4.5 * car.scale, 0, Math.PI * 2);
    ctx.fill();

    // Main Chassis
    ctx.fillStyle = car.color;
    ctx.beginPath();
    if (car.model === 'testarossa') {
      // 80s wedge shape
      ctx.moveTo(-w * 0.46, h * 0.2);
      ctx.lineTo(-w * 0.42, -h * 0.1);
      ctx.lineTo(-w * 0.15, -h * 0.38);
      ctx.lineTo(w * 0.1, -h * 0.38);
      ctx.lineTo(w * 0.38, -h * 0.05);
      ctx.lineTo(w * 0.48, h * 0.05);
      ctx.lineTo(w * 0.46, h * 0.25);
    } else if (car.model === 'banshee') {
      // Aerodynamic curve & spoiler
      ctx.moveTo(-w * 0.48, -h * 0.25); // high spoiler
      ctx.lineTo(-w * 0.44, h * 0.2);
      ctx.lineTo(-w * 0.2, -h * 0.35);
      ctx.lineTo(w * 0.12, -h * 0.35);
      ctx.lineTo(w * 0.42, -h * 0.02);
      ctx.lineTo(w * 0.48, h * 0.2);
    } else {
      // Standard coupe / sedan
      ctx.moveTo(-w * 0.45, h * 0.2);
      ctx.lineTo(-w * 0.38, -h * 0.1);
      ctx.lineTo(-w * 0.18, -h * 0.4);
      ctx.lineTo(w * 0.15, -h * 0.4);
      ctx.lineTo(w * 0.35, -h * 0.08);
      ctx.lineTo(w * 0.47, h * 0.08);
      ctx.lineTo(w * 0.45, h * 0.25);
    }
    ctx.closePath();
    ctx.fill();

    // Side windows (tinted dark glass)
    ctx.fillStyle = '#0a0d18';
    ctx.beginPath();
    ctx.moveTo(-w * 0.14, -h * 0.34);
    ctx.lineTo(w * 0.1, -h * 0.34);
    ctx.lineTo(w * 0.25, -h * 0.08);
    ctx.lineTo(-w * 0.22, -h * 0.08);
    ctx.closePath();
    ctx.fill();

    // Headlight glass
    ctx.fillStyle = '#fffda8';
    ctx.fillRect(w * 0.42, -h * 0.02, 4, 6);

    // Taillight bar
    ctx.fillStyle = '#ff1a35';
    ctx.shadowColor = '#ff0033';
    ctx.shadowBlur = 8;
    ctx.fillRect(-w * 0.46, -h * 0.05, 4, 6);

    // Taxi roof sign
    if (car.model === 'taxi') {
      ctx.fillStyle = '#ffe600';
      ctx.fillRect(-w * 0.06, -h * 0.52, w * 0.14, 5);
    }

    ctx.restore();
  }

  drawParticles() {
    const ctx = this.ctx;
    ctx.save();
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawVignette() {
    const ctx = this.ctx;
    ctx.save();
    const vig = ctx.createRadialGradient(
      this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.4,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.8
    );
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(6, 4, 15, 0.6)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }

  setTimeOfDay(timeStr) {
    this.timeOfDay = timeStr;
  }

  setTrafficDensity(densityStr) {
    this.trafficDensity = densityStr;
  }
}

// Global highway instance
window.HighwaySimulator = HighwaySimulator;
