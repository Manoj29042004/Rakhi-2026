/**
 * Queen Honey's Rakshabandhan Memory Tribute Engine
 * Dedicated from Manoj, Danoj, and Sai
 */

document.addEventListener('DOMContentLoaded', () => {
  initPetalCanvas();
  initAudioEngine();
});

/* ==========================================================================
   1. Canvas Petal Engine (Rose & Marigold Petals + Sparkles)
   ========================================================================== */
let particleCanvas, ctx;
let particles = [];
let animFrameId;

function initPetalCanvas() {
  particleCanvas = document.getElementById('particle-canvas');
  if (!particleCanvas) return;
  ctx = particleCanvas.getContext('2d');
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Initial petal shower
  for (let i = 0; i < 40; i++) {
    particles.push(createParticle());
  }
  
  animateParticles();
}

function resizeCanvas() {
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}

function createParticle(x, y, burst = false) {
  const isMarigold = Math.random() > 0.4;
  const isSparkle = Math.random() > 0.75;
  
  return {
    x: x !== undefined ? x : Math.random() * particleCanvas.width,
    y: y !== undefined ? y : Math.random() * particleCanvas.height - particleCanvas.height,
    size: isSparkle ? Math.random() * 4 + 2 : Math.random() * 11 + 7,
    speedY: burst ? (Math.random() - 0.7) * 7 : Math.random() * 1.4 + 0.7,
    speedX: burst ? (Math.random() - 0.5) * 6 : Math.random() * 1 - 0.5,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 2.5,
    color: isSparkle 
      ? '#ffd700' 
      : isMarigold 
        ? ['#ff9933', '#f59e0b', '#ffa733'][Math.floor(Math.random() * 3)] 
        : ['#dc2626', '#e11d48', '#9d174d'][Math.floor(Math.random() * 3)],
    opacity: Math.random() * 0.7 + 0.3,
    isSparkle: isSparkle,
    life: burst ? 120 : Infinity
  };
}

function animateParticles() {
  ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.y += p.speedY;
    p.x += Math.sin(p.y * 0.01) + p.speedX;
    p.rotation += p.rotationSpeed;
    
    if (p.life !== Infinity) {
      p.life--;
      p.opacity *= 0.98;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.globalAlpha = p.opacity;

    if (p.isSparkle) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    if (p.life === Infinity && p.y > particleCanvas.height + 20) {
      particles[i] = createParticle(Math.random() * particleCanvas.width, -20);
    } else if (p.life <= 0 || p.opacity <= 0.02) {
      particles.splice(i, 1);
    }
  }
  
  animFrameId = requestAnimationFrame(animateParticles);
}


/* ==========================================================================
   2. Web Audio Synthesizer (Ambient Festive Melody)
   ========================================================================== */
let audioCtx = null;
let isMuted = false;
let isAudioInitialized = false;
let ambientTimer = null;

function initAudioEngine() {
  const audioBtn = document.getElementById('audio-toggle-btn');
  
  // Auto-attempt sound initialization on first click anywhere
  document.addEventListener('click', autoStartAudio, { once: true });

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      if (!isAudioInitialized) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        isAudioInitialized = true;
        startAmbientLoop();
      }

      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      isMuted = !isMuted;
      updateAudioBtnUI();

      if (!isMuted) {
        playFestiveChime([523.25, 659.25, 783.99, 1046.50]);
      }
    });
  }
}

function autoStartAudio() {
  if (!isAudioInitialized) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      isAudioInitialized = true;
      startAmbientLoop();
    } catch(e) {}
  }
}

function startAmbientLoop() {
  if (ambientTimer) clearInterval(ambientTimer);
  
  // Gently plays background festive chimes every 6 seconds
  ambientTimer = setInterval(() => {
    if (!isMuted && audioCtx && audioCtx.state === 'running') {
      const chords = [
        [523.25, 659.25, 783.99], // C Major
        [587.33, 698.46, 880.00], // D Minor
        [659.25, 783.99, 987.77], // E Minor
        [523.25, 659.25, 783.99, 1046.50]
      ];
      const randomChord = chords[Math.floor(Math.random() * chords.length)];
      playFestiveChime(randomChord);
    }
  }, 6500);
}

function updateAudioBtnUI() {
  const icon = document.querySelector('.audio-icon');
  const text = document.querySelector('.audio-text');
  if (!icon || !text) return;

  if (isMuted) {
    icon.textContent = '🔇';
    text.textContent = 'Soundscape Off';
  } else {
    icon.textContent = '🎵';
    text.textContent = 'Soundscape On';
  }
}

function playFestiveChime(notes = [440, 554.37, 659.25, 880]) {
  if (isMuted || !isAudioInitialized || !audioCtx) return;

  notes.forEach((freq, index) => {
    setTimeout(() => {
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.4);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 1.45);
      } catch (e) {}
    }, index * 140);
  });
}
