const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const resetBtn = document.getElementById("reset-btn");

let gameActive = true;
let keys = {};
let dashOnCooldown = false;
let punchOnCooldown = false;
const COOLDOWN_TIME = 1200;

let player = {
    x: 100,
    y: 200,
    size: 20,
    speed: 3,
    health: 100,
    hasHealCharge: false,
    color: "#00ff7f"
};

let killer = {
    x: 500,
    y: 200,
    size: 24,
    speed: 2.2,
    color: "#ff007f",
    isStunned: false,
    stunTimer: 0
};

document.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (!gameActive) return;

    if (e.key.toLowerCase() === "e") dashPlayer();
    if (e.key.toLowerCase() === "r") punchKiller();
    if (e.key.toLowerCase() === "q") healPlayer();
});

document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

resetBtn.addEventListener("click", resetGame);

function resetGame() {
    player.x = 100;
    player.y = 200;
    player.health = 100;
    player.hasHealCharge = false;

    killer.x = 500;
    killer.y = 200;
    killer.isStunned = false;
    killer.stunTimer = 0;

    dashOnCooldown = false;
    punchOnCooldown = false;
    keys = {};
    gameActive = true;

    document.getElementById("hp-display").innerText = "100";
    document.getElementById("heal-display").innerText = "NO";
    document.getElementById("chaser-display").innerText = "Chasing";
    document.getElementById("chaser-display").style.color = "#ff9500";
}

function clampPlayer() {
    player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
}

function updateMovement() {
    if (keys["w"] || keys["arrowup"]) player.y -= player.speed;
    if (keys["s"] || keys["arrowdown"]) player.y += player.speed;
    if (keys["a"] || keys["arrowleft"]) player.x -= player.speed;
    if (keys["d"] || keys["arrowright"]) player.x += player.speed;
    clampPlayer();
}

function updateKiller() {
    const chaserDisplay = document.getElementById("chaser-display");

    if (killer.isStunned) {
        killer.stunTimer--;
        chaserDisplay.innerText = `STUNNED`;
        chaserDisplay.style.color = "#5ac8fa";
        if (killer.stunTimer <= 0) killer.isStunned = false;
        return;
    }

    chaserDisplay.innerText = "Chasing";
    chaserDisplay.style.color = "#ff9500";

    let dx = player.x - killer.x;
    let dy = player.y - killer.y;
    let dist = Math.hypot(dx, dy);

    if (dist > 0) {
        killer.x += (dx / dist) * killer.speed;
        killer.y += (dy / dist) * killer.speed;
    }

    if (dist < 18) {
        player.health = Math.max(0, player.health - 0.5);
        document.getElementById("hp-display").innerText = Math.floor(player.health);
        if (player.health <= 0) gameActive = false;
    }
}

function dashPlayer() {
    if (dashOnCooldown) return;

    const dashDist = 70;
    if (keys["w"] || keys["arrowup"]) player.y -= dashDist;
    if (keys["s"] || keys["arrowdown"]) player.y += dashDist;
    if (keys["a"] || keys["arrowleft"]) player.x -= dashDist;
    if (keys["d"] || keys["arrowright"]) player.x += dashDist;
    clampPlayer();

    dashOnCooldown = true;
    setTimeout(() => dashOnCooldown = false, COOLDOWN_TIME);
}

function punchKiller() {
    if (punchOnCooldown) return;

    let dx = player.x - killer.x;
    let dy = player.y - killer.y;
    let dist = Math.hypot(dx, dy);

    if (dist < 60) {
        killer.isStunned = true;
        killer.stunTimer = 180;
        player.hasHealCharge = true;
        document.getElementById("heal-display").innerText = "YES";
    }

    punchOnCooldown = true;
    setTimeout(() => punchOnCooldown = false, COOLDOWN_TIME);
}

function healPlayer() {
    if (!player.hasHealCharge) return;
    player.health = Math.min(100, player.health + 25);
    player.hasHealCharge = false;
    document.getElementById("heal-display").innerText = "NO";
    document.getElementById("hp-display").innerText = Math.floor(player.health);
}

function drawEntity(x, y, size, color, isCircle = false) {
    ctx.fillStyle = color;
    if (isCircle) {
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillRect(x, y, size, size);
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameActive) {
        updateMovement();
        updateKiller();
        document.getElementById("hp-display").innerText = Math.floor(player.health);
    }

    drawEntity(player.x, player.y, player.size, player.color);
    drawEntity(killer.x, killer.y, killer.size, killer.isStunned ? "#5ac8fa" : killer.color, true);

    if (!gameActive) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "30px Courier New";
        ctx.fillText("GAME OVER", canvas.width / 2 - 80, canvas.height / 2);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
