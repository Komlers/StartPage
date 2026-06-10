/* ============================================================
   Click Effect - 鼠标点击彩色粒子特效
   Optimized version, extracted from main.js
   ============================================================ */

(function () {
  'use strict';

  var colours = ['#0C2875', '#05688D', '#028090', '#00A896', '#02C39A'];
  var MAX_BALLS = 250;
  var balls = [];
  var longPressed = false;
  var longPressTimer = null;
  var multiplier = 0;
  var width, height;

  // --- Canvas setup ---
  var canvas = document.createElement('canvas');
  canvas.style.cssText =
    'width:100%;height:100%;top:0;left:0;z-index:99999;position:fixed;pointer-events:none;';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resize);
  resize();

  // --- Ball constructor (no class syntax for IE compatibility) ---
  function Ball(x, y) {
    this.x = x;
    this.y = y;
    var angle = Math.PI * 2 * Math.random();
    var speed = longPressed
      ? randBetween(14 + multiplier, 15 + multiplier)
      : randBetween(6, 12);
    this.vx = (speed + Math.random() * 0.5) * Math.cos(angle);
    this.vy = (speed + Math.random() * 0.5) * Math.sin(angle);
    this.r = randBetween(8, 12) + 3 * Math.random();
    this.color = colours[Math.floor(Math.random() * colours.length)];
  }

  Ball.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.96;
    this.vy *= 0.96;
    this.r -= 0.3;
  };

  // --- Helpers ---
  function randBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pushBalls(count, x, y) {
    var remaining = MAX_BALLS - balls.length;
    count = Math.min(count, remaining);
    for (var i = 0; i < count; i++) {
      balls.push(new Ball(x, y));
    }
  }

  // --- Main loop ---
  function loop() {
    ctx.clearRect(0, 0, width, height);

    // Filter out dead balls while updating (single pass)
    var alive = [];
    for (var i = 0; i < balls.length; i++) {
      var b = balls[i];
      b.update();
      if (
        b.r > 0 &&
        b.x + b.r > 0 &&
        b.x - b.r < width &&
        b.y + b.r > 0 &&
        b.y - b.r < height
      ) {
        alive.push(b);
      }
    }
    balls = alive;

    // Draw
    for (var j = 0; j < balls.length; j++) {
      var ball = balls[j];
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, Math.max(0, ball.r), 0, Math.PI * 2);
      ctx.fill();
    }

    if (longPressed) {
      multiplier += 0.2;
    } else if (multiplier > 0) {
      multiplier = Math.max(0, multiplier - 0.4);
    }

    requestAnimationFrame(loop);
  }

  // --- Event listeners ---
  window.addEventListener('mousedown', function (e) {
    pushBalls(randBetween(10, 20), e.clientX, e.clientY);
    longPressTimer = setTimeout(function () {
      longPressed = true;
    }, 500);
  });

  window.addEventListener('mouseup', function (e) {
    clearTimeout(longPressTimer);
    if (longPressed) {
      pushBalls(
        randBetween(50 + Math.ceil(multiplier), 100 + Math.ceil(multiplier)),
        e.clientX,
        e.clientY
      );
      longPressed = false;
    }
  });

  // Touch support for mobile
  window.addEventListener(
    'touchstart',
    function (e) {
      var touch = e.touches[0];
      pushBalls(randBetween(10, 20), touch.clientX, touch.clientY);
    },
    { passive: true }
  );

  // Start loop
  loop();
})();
