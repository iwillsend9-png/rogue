const canvas =
  document.getElementById("gameCanvas");

const ctx =
  canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;


/* =================================
   UI
================================= */

const startScreen =
  document.getElementById("startScreen");

const gameScreen =
  document.getElementById("gameScreen");

const levelScreen =
  document.getElementById("levelScreen");

const gameOver =
  document.getElementById("gameOver");

const startButton =
  document.getElementById("startButton");

const restartButton =
  document.getElementById("restartButton");

const fullscreenButton =
  document.getElementById("fullscreenButton");

const healthBar =
  document.getElementById("healthBar");

const xpBar =
  document.getElementById("xpBar");

const hpText =
  document.getElementById("hpText");

const levelText =
  document.getElementById("levelText");

const xpText =
  document.getElementById("xpText");

const timeText =
  document.getElementById("timeText");

const killsText =
  document.getElementById("killsText");

const quoteBox =
  document.getElementById("quoteBox");

const upgradeChoices =
  document.getElementById("upgradeChoices");

const finalTime =
  document.getElementById("finalTime");

const finalKills =
  document.getElementById("finalKills");

const finalLevel =
  document.getElementById("finalLevel");


/* =================================
   INPUT
================================= */

const keys = {};

window.addEventListener(
  "keydown",
  event => {

    keys[event.key.toLowerCase()] = true;

    if (
      event.code === "Space"
    ) {

      event.preventDefault();

      rabbitDash();

    }

    if (
      event.key.toLowerCase() === "e"
    ) {

      useSpecial();

    }

  }
);

window.addEventListener(
  "keyup",
  event => {

    keys[event.key.toLowerCase()] = false;

  }
);


/* =================================
   RABBIT
================================= */

const rabbit = {

  x: W / 2,
  y: H / 2,

  size: 22,

  speed: 3.5,

  maxHp: 100,
  hp: 100,

  level: 1,

  xp: 0,

  nextXp: 40,

  damage: 15,

  attackRate: 55,

  attackTimer: 0,

  attackRange: 120,

  projectileSpeed: 5,

  projectileCount: 1,

  moveMultiplier: 1,

  dashCooldown: 0,

  specialCooldown: 0,

  specialPower: 35,

  pickupRange: 80,

  damageReduction: 0

};


/* =================================
   GAME STATE
================================= */

let running = false;

let pausedForLevel = false;

let gameStart = 0;

let survivalTime = 0;

let kills = 0;

let lastFrame = 0;

let spawnTimer = 0;

let enemyId = 0;


/* =================================
   ARRAYS
================================= */

let enemies = [];

let projectiles = [];

let particles = [];

let gems = [];

let effects = [];


/* =================================
   WONDERLAND QUOTES
================================= */

const quotes = [

  "“Curiouser and curiouser!”",

  "“We're all mad here.”",

  "“It's no use going back to yesterday.”",

  "“Who in the world am I?”",

  "“Begin at the beginning.”",

  "“What is the use of a book without pictures?”",

  "“Off with their heads!”",

  "“Why, sometimes I've believed as many as six impossible things before breakfast.”",

  "“I can't go back to yesterday because I was a different person then.”"

];

let quoteTimer = 0;


/* =================================
   CREATURES
================================= */

const creatureTypes = [

  {
    name: "Card Soldier",
    color: "#d64b52",
    hp: 25,
    speed: 1.25,
    damage: 6,
    xp: 7,
    size: 16
  },

  {
    name: "March Hare",
    color: "#a87848",
    hp: 35,
    speed: 1.7,
    damage: 8,
    xp: 9,
    size: 17
  },

  {
    name: "Mad Hatter",
    color: "#7c54a1",
    hp: 55,
    speed: .85,
    damage: 11,
    xp: 13,
    size: 20
  },

  {
    name: "Cheshire Cat",
    color: "#b46bca",
    hp: 45,
    speed: 1.9,
    damage: 9,
    xp: 15,
    size: 18
  },

  {
    name: "Jabberwock",
    color: "#5f3d73",
    hp: 130,
    speed: .65,
    damage: 19,
    xp: 30,
    size: 30
  },

  {
    name: "Queen's Executioner",
    color: "#c33d3d",
    hp: 170,
    speed: .75,
    damage: 23,
    xp: 40,
    size: 32
  }

];


/* =================================
   START
================================= */

function startGame() {

  running = true;

  pausedForLevel = false;

  gameStart =
    performance.now();

  survivalTime = 0;

  kills = 0;

  spawnTimer = 0;

  quoteTimer = 0;

  enemies = [];
  projectiles = [];
  particles = [];
  gems = [];
  effects = [];


  Object.assign(
    rabbit,
    {

      x: W / 2,
      y: H / 2,

      hp: 100,

      maxHp: 100,

      level: 1,

      xp: 0,

      nextXp: 40,

      damage: 15,

      attackRate: 55,

      attackRange: 120,

      projectileSpeed: 5,

      projectileCount: 1,

      moveMultiplier: 1,

      dashCooldown: 0,

      specialCooldown: 0,

      specialPower: 35,

      pickupRange: 80,

      damageReduction: 0

    }
  );


  startScreen.style.display =
    "none";

  gameOver.style.display =
    "none";

  levelScreen.style.display =
    "none";

  gameScreen.style.display =
    "block";


  updateHUD();

}


/* =================================
   MOVEMENT
================================= */

function updateRabbit(dt) {

  let dx = 0;
  let dy = 0;


  if (
    keys["w"] ||
    keys["arrowup"]
  ) {

    dy--;

  }

  if (
    keys["s"] ||
    keys["arrowdown"]
  ) {

    dy++;

  }

  if (
    keys["a"] ||
    keys["arrowleft"]
  ) {

    dx--;

  }

  if (
    keys["d"] ||
    keys["arrowright"]
  ) {

    dx++;

  }


  if (
    dx !== 0 ||
    dy !== 0
  ) {

    const length =
      Math.hypot(dx, dy);

    rabbit.x +=
      dx / length *
      rabbit.speed *
      rabbit.moveMultiplier *
      dt;

    rabbit.y +=
      dy / length *
      rabbit.speed *
      rabbit.moveMultiplier *
      dt;

  }


  /*
    Wrap around the world.
    This makes the arena feel endless.
  */

  if (
    rabbit.x < -20
  ) {

    rabbit.x = W + 20;

  }

  if (
    rabbit.x > W + 20
  ) {

    rabbit.x = -20;

  }

  if (
    rabbit.y < -20
  ) {

    rabbit.y = H + 20;

  }

  if (
    rabbit.y > H + 20
  ) {

    rabbit.y = -20;

  }


  if (
    rabbit.attackTimer > 0
  ) {

    rabbit.attackTimer -= dt;

  }

  if (
    rabbit.dashCooldown > 0
  ) {

    rabbit.dashCooldown -= dt;

  }

  if (
    rabbit.specialCooldown > 0
  ) {

    rabbit.specialCooldown -= dt;

  }

}


/* =================================
   AUTOMATIC ATTACK
================================= */

function automaticAttack() {

  if (
    rabbit.attackTimer > 0 ||
    enemies.length === 0
  ) {

    return;

  }


  let target = null;

  let closest =
    Infinity;


  for (
    const enemy
    of enemies
  ) {

    const distance =
      Math.hypot(
        enemy.x - rabbit.x,
        enemy.y - rabbit.y
      );


    if (
      distance <
      closest &&
      distance <=
      rabbit.attackRange
    ) {

      closest = distance;

      target = enemy;

    }

  }


  if (!target) {

    return;

  }


  rabbit.attackTimer =
    rabbit.attackRate;


  const baseAngle =
    Math.atan2(
      target.y - rabbit.y,
      target.x - rabbit.x
    );


  const spread =
    .18;


  for (
    let i = 0;
    i < rabbit.projectileCount;
    i++
  ) {

    const offset =
      (i -
        (rabbit.projectileCount - 1) / 2) *
      spread;


    projectiles.push({

      x: rabbit.x,

      y: rabbit.y,

      vx:
        Math.cos(
          baseAngle + offset
        ) *
        rabbit.projectileSpeed,

      vy:
        Math.sin(
          baseAngle + offset
        ) *
        rabbit.projectileSpeed,

      damage:
        rabbit.damage,

      life: 120

    });

  }

}


/* =================================
   RABBIT DASH
================================= */

function rabbitDash() {

  if (
    !running ||
    pausedForLevel ||
    rabbit.dashCooldown > 0
  ) {

    return;

  }


  let dx = 0;
  let dy = 0;


  if (keys["w"]) dy--;
  if (keys["s"]) dy++;
  if (keys["a"]) dx--;
  if (keys["d"]) dx++;


  if (
    dx === 0 &&
    dy === 0
  ) {

    dx = 1;

  }


  const length =
    Math.hypot(dx, dy);


  rabbit.x +=
    dx / length * 90;

  rabbit.y +=
    dy / length * 90;


  rabbit.dashCooldown =
    90;


  effects.push({

    type: "dash",

    x: rabbit.x,

    y: rabbit.y,

    life: 25

  });

}


/* =================================
   SPECIAL
================================= */

function useSpecial() {

  if (
    !running ||
    pausedForLevel ||
    rabbit.specialCooldown > 0
  ) {

    return;

  }


  rabbit.specialCooldown =
    300;


  effects.push({

    type: "wonderland",

    x: rabbit.x,

    y: rabbit.y,

    radius: 20,

    life: 45

  });


  for (
    const enemy
    of enemies
  ) {

    const dx =
      enemy.x - rabbit.x;

    const dy =
      enemy.y - rabbit.y;

    const distance =
      Math.hypot(dx, dy);


    if (
      distance < 170
    ) {

      enemy.hp -=
        rabbit.specialPower;

      enemy.x +=
        dx / (distance || 1) *
        35;

      enemy.y +=
        dy / (distance || 1) *
        35;

    }

  }

}


/* =================================
   SPAWN
================================= */

function spawnEnemy() {

  const difficulty =
    1 +
    survivalTime / 45;


  /*
    Stronger creatures become
    available as time passes.
  */

  let available =
    Math.min(
      creatureTypes.length,
      2 +
      Math.floor(
        survivalTime / 35
      )
    );


  available =
    Math.max(
      2,
      available
    );


  const type =
    creatureTypes[
      Math.floor(
        Math.random() *
        available
      )
    ];


  let x;
  let y;


  /*
    Spawn outside the visible
    central area.
  */

  const side =
    Math.floor(
      Math.random() * 4
    );


  if (side === 0) {

    x = -30;
    y = Math.random() * H;

  }

  else if (side === 1) {

    x = W + 30;
    y = Math.random() * H;

  }

  else if (side === 2) {

    x = Math.random() * W;
    y = -30;

  }

  else {

    x = Math.random() * W;
    y = H + 30;

  }


  enemies.push({

    id:
      ++enemyId,

    name:
      type.name,

    x,
    y,

    hp:
      type.hp * difficulty,

    maxHp:
      type.hp * difficulty,

    speed:
      type.speed *
      (1 + survivalTime / 250),

    damage:
      type.damage *
      difficulty,

    xp:
      type.xp,

    size:
      type.size,

    color:
      type.color

  });

}


/* =================================
   ENEMY UPDATE
================================= */

function updateEnemies(dt) {

  for (
    const enemy
    of enemies
  ) {

    const dx =
      rabbit.x - enemy.x;

    const dy =
      rabbit.y - enemy.y;

    const distance =
      Math.hypot(dx, dy) || 1;


    enemy.x +=
      dx / distance *
      enemy.speed *
      dt;

    enemy.y +=
      dy / distance *
      enemy.speed *
      dt;


    /*
      Damage when touching.
    */

    if (
      distance <
      enemy.size +
      rabbit.size
    ) {

      rabbit.hp -=
        Math.max(
          .1,
          enemy.damage *
          .018 *
          dt *
          (1 -
            rabbit.damageReduction)
        );


      if (
        rabbit.hp <= 0
      ) {

        rabbit.hp = 0;

        endGame();

      }

    }

  }

}


/* =================================
   PROJECTILES
================================= */

function updateProjectiles(dt) {

  for (
    const p
    of projectiles
  ) {

    p.x +=
      p.vx * dt;

    p.y +=
      p.vy * dt;

    p.life -= dt;


    for (
      const enemy
      of enemies
    ) {

      const distance =
        Math.hypot(
          p.x - enemy.x,
          p.y - enemy.y
        );


      if (
        distance <
        enemy.size + 7
      ) {

        enemy.hp -=
          p.damage;

        p.life = 0;

        createParticles(
          enemy.x,
          enemy.y,
          enemy.color,
          4
        );

        break;

      }

    }

  }


  projectiles =
    projectiles.filter(
      p =>
        p.life > 0
    );

}


/* =================================
   REMOVE DEAD ENEMIES
================================= */

function cleanupEnemies() {

  for (
    const enemy
    of enemies
  ) {

    if (
      enemy.hp <= 0
    ) {

      kills++;


      gems.push({

        x:
          enemy.x,

        y:
          enemy.y,

        value:
          enemy.xp

      });


      createParticles(
        enemy.x,
        enemy.y,
        "#f4d477",
        12
      );

    }

  }


  enemies =
    enemies.filter(
      enemy =>
        enemy.hp > 0
    );

}


/* =================================
   XP
================================= */

function updateGems(dt) {

  for (
    const gem
    of gems
  ) {

    const dx =
      rabbit.x - gem.x;

    const dy =
      rabbit.y - gem.y;

    const distance =
      Math.hypot(dx, dy);


    if (
      distance <
      rabbit.pickupRange
    ) {

      const speed =
        distance < 30
          ? 6
          : 2.5;


      gem.x +=
        dx / (distance || 1) *
        speed *
        dt;

      gem.y +=
        dy / (distance || 1) *
        speed *
        dt;

    }


    if (
      distance < 18
    ) {

      gainXP(
        gem.value
      );

      gem.collected =
        true;

    }

  }


  gems =
    gems.filter(
      gem =>
        !gem.collected
    );

}


function gainXP(amount) {

  rabbit.xp += amount;


  if (
    rabbit.xp >=
    rabbit.nextXp
  ) {

    rabbit.xp -=
      rabbit.nextXp;

    rabbit.level++;

    rabbit.nextXp =
      Math.floor(
        rabbit.nextXp * 1.35
      );


    showLevelUp();

  }

}


/* =================================
   LEVEL UP
================================= */

const upgrades = [

  {
    icon: "⚔️",
    name: "Sharper Carrots",
    description:
      "+25% attack damage",

    apply() {

      rabbit.damage *= 1.25;

    }

  },

  {
    icon: "🥕",
    name: "Rapid Throws",
    description:
      "Attack 20% faster",

    apply() {

      rabbit.attackRate *= .8;

    }

  },

  {
    icon: "🐇",
    name: "Rabbit Speed",
    description:
      "+20% movement speed",

    apply() {

      rabbit.moveMultiplier *= 1.2;

    }

  },

  {
    icon: "✨",
    name: "Wonderland Reach",
    description:
      "+35 attack range",

    apply() {

      rabbit.attackRange += 35;

    }

  },

  {
    icon: "🎩",
    name: "Mad Hatter's Trick",
    description:
      "Fire one additional projectile",

    apply() {

      rabbit.projectileCount++;

    }

  },

  {
    icon: "❤️",
    name: "Eat Me",
    description:
      "+30 maximum health and heal",

    apply() {

      rabbit.maxHp += 30;

      rabbit.hp += 30;

    }

  },

  {
    icon: "🕳️",
    name: "Down the Rabbit Hole",
    description:
      "Special ability deals +40% damage",

    apply() {

      rabbit.specialPower *= 1.4;

    }

  },

  {
    icon: "🧲",
    name: "Wonderland Magnet",
    description:
      "Collect XP from much farther away",

    apply() {

      rabbit.pickupRange += 90;

    }

  },

  {
    icon: "🛡️",
    name: "Queen's Guard",
    description:
      "Take 15% less damage",

    apply() {

      rabbit.damageReduction =
        Math.min(
          .75,
          rabbit.damageReduction + .15
        );

    }

  }

];


function showLevelUp() {

  pausedForLevel =
    true;


  levelScreen.style.display =
    "flex";


  upgradeChoices.innerHTML =
    "";


  const choices =
    [...upgrades]
      .sort(
        () =>
          Math.random() -
          .5
      )
      .slice(0, 3);


  choices.forEach(
    upgrade => {

      const button =
        document.createElement(
          "button"
        );

      button.className =
        "upgrade";

      button.innerHTML = `

        <div class="upgradeIcon">
          ${upgrade.icon}
        </div>

        <div class="upgradeName">
          ${upgrade.name}
        </div>

        <div class="upgradeDescription">
          ${upgrade.description}
        </div>

      `;


      button.addEventListener(
        "click",
        () => {

          upgrade.apply();

          levelScreen.style.display =
            "none";

          pausedForLevel =
            false;

        }
      );


      upgradeChoices.appendChild(
        button
      );

    }
  );

}


/* =================================
   PARTICLES
================================= */

function createParticles(
  x,
  y,
  color,
  amount
) {

  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const angle =
      Math.random() *
      Math.PI *
      2;

    const speed =
      .5 +
      Math.random() * 2.5;


    particles.push({

      x,
      y,

      vx:
        Math.cos(angle) *
        speed,

      vy:
        Math.sin(angle) *
        speed,

      life:
        20 +
        Math.random() * 25,

      color

    });

  }

}


function updateParticles(dt) {

  for (
    const p
    of particles
  ) {

    p.x +=
      p.vx * dt;

    p.y +=
      p.vy * dt;

    p.life -= dt;

  }


  particles =
    particles.filter(
      p =>
        p.life > 0
    );

}


/* =================================
   EFFECTS
================================= */

function updateEffects(dt) {

  for (
    const effect
    of effects
  ) {

    effect.life -= dt;

    if (
      effect.type ===
      "wonderland"
    ) {

      effect.radius +=
        7 * dt;

    }

  }


  effects =
    effects.filter(
      effect =>
        effect.life > 0
    );

}


/* =================================
   DRAW WORLD
================================= */

function drawWorld() {

  ctx.fillStyle =
    "#294d2d";

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  /*
    Wonderland paths.
  */

  ctx.fillStyle =
    "#5c7140";

  ctx.fillRect(
    0,
    H / 2 - 45,
    W,
    90
  );

  ctx.fillRect(
    W / 2 - 45,
    0,
    90,
    H
  );


  /*
    Checkerboard sections.
  */

  for (
    let x = 0;
    x < W;
    x += 70
  ) {

    for (
      let y = 0;
      y < H;
      y += 70
    ) {

      if (
        (x / 70 +
          y / 70) % 2 === 0
      ) {

        ctx.fillStyle =
          "rgba(255,255,255,.025)";

        ctx.fillRect(
          x,
          y,
          70,
          70
        );

      }

    }

  }


  /*
    Trees.
  */

  for (
    let i = 0;
    i < 28;
    i++
  ) {

    const x =
      (i * 137 + 40) %
      W;

    const y =
      (i * 83 + 30) %
      H;


    if (
      Math.abs(
        x - rabbit.x
      ) < 80 &&
      Math.abs(
        y - rabbit.y
      ) < 80
    ) {

      continue;

    }


    drawTree(
      x,
      y
    );

  }


  /*
    Giant flowers.
  */

  for (
    let i = 0;
    i < 15;
    i++
  ) {

    const x =
      (i * 211) %
      W;

    const y =
      (i * 127) %
      H;


    drawFlower(
      x,
      y
    );

  }

}


/* =================================
   TREE
================================= */

function drawTree(
  x,
  y
) {

  ctx.fillStyle =
    "#553c2b";

  ctx.fillRect(
    x - 7,
    y,
    14,
    35
  );


  ctx.fillStyle =
    "#183c26";

  ctx.fillRect(
    x - 25,
    y - 24,
    50,
    30
  );

  ctx.fillStyle =
    "#315b35";

  ctx.fillRect(
    x - 32,
    y - 5,
    64,
    25
  );

}


/* =================================
   FLOWER
================================= */

function drawFlower(
  x,
  y
) {

  ctx.fillStyle =
    "#75a95a";

  ctx.fillRect(
    x,
    y,
    3,
    18
  );


  const colors = [
    "#d96ba1",
    "#9274cf",
    "#f1ca5c",
    "#69a8d0"
  ];


  ctx.fillStyle =
    colors[
      Math.floor(
        x + y
      ) %
      colors.length
    ];


  ctx.fillRect(
    x - 6,
    y - 5,
    8,
    8
  );

  ctx.fillRect(
    x + 3,
    y - 5,
    8,
    8
  );

}


/* =================================
   DRAW RABBIT
================================= */

function drawRabbit() {

  ctx.save();

  ctx.translate(
    rabbit.x,
    rabbit.y
  );


  /*
    Shadow.
  */

  ctx.fillStyle =
    "rgba(0,0,0,.35)";

  ctx.fillRect(
    -17,
    17,
    34,
    7
  );


  /*
    Body.
  */

  ctx.fillStyle =
    "#eeeae0";

  ctx.fillRect(
    -13,
    -3,
    26,
    27
  );


  /*
    Head.
  */

  ctx.fillStyle =
    "#f5f1e9";

  ctx.fillRect(
    -15,
    -24,
    30,
    25
  );


  /*
    Ears.
  */

  ctx.fillStyle =
    "#eeeae0";

  ctx.fillRect(
    -12,
    -47,
    9,
    25
  );

  ctx.fillRect(
    4,
    -47,
    9,
    25
  );


  /*
    Inner ears.
  */

  ctx.fillStyle =
    "#e69cae";

  ctx.fillRect(
    -9,
    -44,
    4,
    18
  );

  ctx.fillRect(
    7,
    -44,
    4,
    18
  );


  /*
    Eyes.
  */

  ctx.fillStyle =
    "#17101c";

  ctx.fillRect(
    -8,
    -15,
    5,
    5
  );

  ctx.fillRect(
    5,
    -15,
    5,
    5
  );


  /*
    Nose.
  */

  ctx.fillStyle =
    "#d87991";

  ctx.fillRect(
    -2,
    -7,
    5,
    4
  );


  /*
    Red waistcoat.
  */

  ctx.fillStyle =
    "#b93442";

  ctx.fillRect(
    -10,
    0,
    20,
    17
  );


  /*
    Golden pocket watch.
  */

  ctx.fillStyle =
    "#e7c45e";

  ctx.fillRect(
    9,
    5,
    7,
    7
  );


  /*
    Carrot weapon.
  */

  ctx.fillStyle =
    "#e27c35";

  ctx.fillRect(
    14,
    9,
    21,
    6
  );


  ctx.fillStyle =
    "#5e9a51";

  ctx.fillRect(
    32,
    7,
    7,
    5
  );


  ctx.restore();


  /*
    Name.
  */

  ctx.textAlign =
    "center";

  ctx.font =
    "bold 11px monospace";

  ctx.fillStyle =
    "#fff0ad";

  ctx.fillText(
    "WHITE RABBIT",
    rabbit.x,
    rabbit.y - 55
  );

  ctx.textAlign =
    "left";

}


/* =================================
   DRAW CREATURE
================================= */

function drawEnemy(
  enemy
) {

  /*
    Shadow.
  */

  ctx.fillStyle =
    "rgba(0,0,0,.3)";

  ctx.fillRect(
    enemy.x -
      enemy.size,

    enemy.y +
      enemy.size,

    enemy.size * 2,

    6
  );


  ctx.fillStyle =
    enemy.color;


  ctx.fillRect(
    enemy.x -
      enemy.size,

    enemy.y -
      enemy.size,

    enemy.size * 2,

    enemy.size * 2
  );


  /*
    Creature-specific details.
  */

  if (
    enemy.name ===
    "Cheshire Cat"
  ) {

    ctx.fillStyle =
      "#f4e9ff";

    ctx.fillRect(
      enemy.x - 10,
      enemy.y - 5,
      20,
      4
    );

  }

  else if (
    enemy.name ===
    "Card Soldier"
  ) {

    ctx.fillStyle =
      "#fff";

    ctx.fillRect(
      enemy.x - 8,
      enemy.y - 12,
      16,
      8
    );

  }

  else if (
    enemy.name ===
    "Mad Hatter"
  ) {

    ctx.fillStyle =
      "#29202d";

    ctx.fillRect(
      enemy.x - 17,
      enemy.y - 27,
      34,
      9
    );

  }

  else if (
    enemy.name ===
    "Jabberwock"
  ) {

    ctx.fillStyle =
      "#d9b55c";

    ctx.fillRect(
      enemy.x - 15,
      enemy.y - 9,
      7,
      7
    );

    ctx.fillRect(
      enemy.x + 8,
      enemy.y - 9,
      7,
      7
    );

  }


  /*
    Eyes.
  */

  ctx.fillStyle =
    "#ffe67b";

  ctx.fillRect(
    enemy.x - 9,
    enemy.y - 7,
    5,
    5
  );

  ctx.fillRect(
    enemy.x + 5,
    enemy.y - 7,
    5,
    5
  );


  /*
    Health bar.
  */

  ctx.fillStyle =
    "#28151c";

  ctx.fillRect(
    enemy.x - 25,
    enemy.y -
      enemy.size -
      11,
    50,
    5
  );


  ctx.fillStyle =
    "#d44d56";

  ctx.fillRect(
    enemy.x - 25,
    enemy.y -
      enemy.size -
      11,

    50 *
      Math.max(
        0,
        enemy.hp /
          enemy.maxHp
      ),

    5
  );

}


/* =================================
   DRAW XP
================================= */

function drawGems() {

  for (
    const gem
    of gems
  ) {

    ctx.fillStyle =
      "#70c8ff";

    ctx.fillRect(
      gem.x - 5,
      gem.y - 5,
      10,
      10
    );

    ctx.fillStyle =
      "#d9f5ff";

    ctx.fillRect(
      gem.x - 2,
      gem.y - 4,
      4,
      4
    );

  }

}


/* =================================
   DRAW PROJECTILES
================================= */

function drawProjectiles() {

  for (
    const p
    of projectiles
  ) {

    ctx.fillStyle =
      "#f5cf67";

    ctx.fillRect(
      p.x - 5,
      p.y - 5,
      10,
      10
    );

  }

}


/* =================================
   DRAW EFFECTS
================================= */

function drawEffects() {

  for (
    const effect
    of effects
  ) {

    if (
      effect.type ===
      "wonderland"
    ) {

      ctx.strokeStyle =
        `rgba(198,115,245,${effect.life / 45})`;

      ctx.lineWidth =
        5;

      ctx.beginPath();

      ctx.arc(
        effect.x,
        effect.y,
        effect.radius,
        0,
        Math.PI * 2
      );

      ctx.stroke();

    }

    if (
      effect.type ===
      "dash"
    ) {

      ctx.fillStyle =
        `rgba(255,255,255,${effect.life / 25})`;

      ctx.fillRect(
        effect.x - 15,
        effect.y - 15,
        30,
        30
      );

    }

  }

}


/* =================================
   DRAW PARTICLES
================================= */

function drawParticles() {

  for (
    const p
    of particles
  ) {

    ctx.fillStyle =
      p.color;

    ctx.fillRect(
      p.x,
      p.y,
      4,
      4
    );

  }

}


/* =================================
   HUD
================================= */

function updateHUD() {

  healthBar.style.width =
    `${Math.max(
      0,
      rabbit.hp /
        rabbit.maxHp *
        100
    )}%`;


  xpBar.style.width =
    `${Math.min(
      100,
      rabbit.xp /
        rabbit.nextXp *
        100
    )}%`;


  hpText.textContent =
    Math.ceil(
      rabbit.hp
    );

  levelText.textContent =
    rabbit.level;

  xpText.textContent =
    `${Math.floor(
      rabbit.xp
    )}/${rabbit.nextXp}`;

  killsText.textContent =
    kills;


  const seconds =
    Math.floor(
      survivalTime
    );

  const minutes =
    Math.floor(
      seconds / 60
    );

  const remaining =
    seconds % 60;


  timeText.textContent =
    `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;

}


/* =================================
   QUOTES
================================= */

function updateQuotes(dt) {

  quoteTimer -= dt;


  if (
    quoteTimer <= 0
  ) {

    quoteTimer =
      18;


    quoteBox.textContent =
      quotes[
        Math.floor(
          Math.random() *
          quotes.length
        )
      ];

  }

}


/* =================================
   SPAWN CONTROL
================================= */

function updateSpawning(dt) {

  spawnTimer -= dt;


  /*
    More enemies as time passes.
  */

  const spawnRate =
    Math.max(
      8,
      42 -
      survivalTime * .25
    );


  if (
    spawnTimer <= 0
  ) {

    /*
      Spawn groups become larger.
    */

    const amount =
      Math.min(
        5,
        1 +
        Math.floor(
          survivalTime / 45
        )
      );


    for (
      let i = 0;
      i < amount;
      i++
    ) {

      spawnEnemy();

    }


    spawnTimer =
      spawnRate;

  }

}


/* =================================
   GAME OVER
================================= */

function endGame() {

  running = false;

  gameScreen.style.display =
    "none";

  gameOver.style.display =
    "flex";


  const seconds =
    Math.floor(
      survivalTime
    );

  const minutes =
    Math.floor(
      seconds / 60
    );

  const remaining =
    seconds % 60;


  finalTime.textContent =
    `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;

  finalKills.textContent =
    kills;

  finalLevel.textContent =
    rabbit.level;

}


/* =================================
   FULLSCREEN
================================= */

fullscreenButton.addEventListener(
  "click",
  async () => {

    try {

      if (
        !document.fullscreenElement
      ) {

        await document
          .documentElement
          .requestFullscreen();

      }

      else {

        await document
          .exitFullscreen();

      }

    }

    catch (error) {

      console.log(
        "Fullscreen unavailable.",
        error
      );

    }

  }
);


/* =================================
   BUTTONS
================================= */

startButton.addEventListener(
  "click",
  startGame
);

restartButton.addEventListener(
  "click",
  startGame
);


/* =================================
   DRAW
================================= */

function draw() {

  drawWorld();

  drawGems();

  drawEffects();

  drawProjectiles();

  for (
    const enemy
    of enemies
  ) {

    drawEnemy(
      enemy
    );

  }

  drawParticles();

  drawRabbit();

}


/* =================================
   UPDATE
================================= */

function update(dt) {

  if (
    !running ||
    pausedForLevel
  ) {

    return;

  }


  survivalTime +=
    dt / 60;


  updateRabbit(dt);

  automaticAttack();

  updateSpawning(dt);

  updateEnemies(dt);

  updateProjectiles(dt);

  cleanupEnemies();

  updateGems(dt);

  updateParticles(dt);

  updateEffects(dt);

  updateQuotes(dt);

  updateHUD();

}


/* =================================
   MAIN LOOP
================================= */

function loop(time) {

  const dt =
    Math.min(
      2,
      (time - lastFrame) /
      16.67 || 1
    );


  lastFrame =
    time;


  update(dt);

  draw();


  requestAnimationFrame(
    loop
  );

}


requestAnimationFrame(
  loop
);
