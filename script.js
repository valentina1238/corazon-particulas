const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let width;
let height;
let particles = [];

let animationTime = 0;

const PARTICLE_COUNT = 2600;

const STATES = {
    FORMING: 0,
    HEART: 1,
    DISASSEMBLING: 2,
    ORBIT: 3,
    REBUILDING: 4
};

let state = STATES.FORMING;
let stateTime = 0;


// ======================================================
// CANVAS
// ======================================================

function resize() {

    const dpr = window.devicePixelRatio || 1;

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize);
resize();


// ======================================================
// CORAZÓN 3D
// ======================================================

function heartShape(t) {

    const x =
        16 * Math.pow(Math.sin(t), 3);

    const y =
        13 * Math.cos(t)
        - 5 * Math.cos(2 * t)
        - 2 * Math.cos(3 * t)
        - Math.cos(4 * t);

    return {
        x,
        y
    };
}


// ======================================================
// CREAR PARTÍCULAS
// ======================================================

class Particle {

    constructor() {

        this.t = Math.random() * Math.PI * 2;

        const heart = heartShape(this.t);

        // Profundidad
        this.z =
            (Math.random() - 0.5) * 2;

        // Relleno interior
        const fill =
            Math.sqrt(Math.random());

        this.targetX =
            heart.x * fill;

        this.targetY =
            heart.y * fill;

        // Volumen
        this.targetZ =
            this.z * 6;

        this.x =
            (Math.random() - 0.5) * 800;

        this.y =
            (Math.random() - 0.5) * 600;

        this.z =
            (Math.random() - 0.5) * 500;

        // Dirección para cuando se desarme
        const angle =
            Math.random() * Math.PI * 2;

        this.orbitAngle = angle;

        this.orbitRadius =
            180 + Math.random() * 260;

        this.orbitHeight =
            (Math.random() - 0.5) * 300;

        this.orbitSpeed =
            0.004 + Math.random() * 0.012;

        this.size =
            Math.random() * 1.8 + 0.5;

        this.brightness =
            Math.random() * 0.7 + 0.3;

        this.twinkle =
            Math.random() * Math.PI * 2;

        this.twinkleSpeed =
            Math.random() * 0.04 + 0.01;
    }


    update() {

        this.twinkle += this.twinkleSpeed;

        let targetX;
        let targetY;
        let targetZ;


        // ==================================================
        // CORAZÓN FORMADO
        // ==================================================

        if (
            state === STATES.FORMING ||
            state === STATES.HEART
        ) {

            targetX =
                this.targetX * 16;

            targetY =
                -this.targetY * 16;

            targetZ =
                this.targetZ * 18;


            // Movimiento orgánico
            targetX +=
                Math.sin(animationTime * 0.8 + this.t) * 2;

            targetY +=
                Math.cos(animationTime * 0.7 + this.t) * 2;

            // Pulso
            const pulse =
                1 +
                Math.sin(animationTime * 2.4) * 0.035;

            targetX *= pulse;
            targetY *= pulse;

            // Llegar al objetivo suavemente
            this.x +=
                (targetX - this.x) * 0.035;

            this.y +=
                (targetY - this.y) * 0.035;

            this.z +=
                (targetZ - this.z) * 0.035;
        }


        // ==================================================
        // DESARMARSE
        // ==================================================

        if (state === STATES.DISASSEMBLING) {

            const progress =
                Math.min(stateTime / 180, 1);

            this.orbitAngle +=
                this.orbitSpeed * 4;

            const radius =
                this.orbitRadius * progress;

            targetX =
                Math.cos(
                    this.orbitAngle +
                    this.z * 0.01
                ) * radius;

            targetY =
                Math.sin(
                    this.orbitAngle +
                    this.t * 2
                ) * radius * 0.7;

            targetZ =
                Math.sin(
                    this.orbitAngle
                ) * radius;


            // Movimiento adicional
            targetX +=
                Math.sin(this.t * 3) *
                progress *
                100;

            targetY +=
                Math.cos(this.t * 4) *
                progress *
                80;


            this.x +=
                (targetX - this.x) * 0.035;

            this.y +=
                (targetY - this.y) * 0.035;

            this.z +=
                (targetZ - this.z) * 0.035;
        }


        // ==================================================
        // PARTÍCULAS GIRANDO
        // ==================================================

        if (state === STATES.ORBIT) {

            this.orbitAngle +=
                this.orbitSpeed;

            const wobble =
                Math.sin(
                    animationTime * 2 +
                    this.t
                ) * 40;

            const radius =
                this.orbitRadius +
                wobble;


            targetX =
                Math.cos(
                    this.orbitAngle
                ) * radius;

            targetY =
                Math.sin(
                    this.orbitAngle * 1.2
                ) * radius * 0.55;

            targetZ =
                Math.sin(
                    this.orbitAngle
                ) * radius;


            this.x +=
                (targetX - this.x) * 0.08;

            this.y +=
                (targetY - this.y) * 0.08;

            this.z +=
                (targetZ - this.z) * 0.08;
        }


        // ==================================================
        // RECONSTRUCCIÓN
        // ==================================================

        if (state === STATES.REBUILDING) {

            const progress =
                Math.min(stateTime / 220, 1);

            targetX =
                this.targetX * 16;

            targetY =
                -this.targetY * 16;

            targetZ =
                this.targetZ * 18;


            // Primero se acercan girando
            const orbitAmount =
                1 - progress;

            targetX +=
                Math.cos(
                    this.orbitAngle +
                    animationTime
                ) *
                this.orbitRadius *
                orbitAmount;

            targetY +=
                Math.sin(
                    this.orbitAngle +
                    animationTime
                ) *
                this.orbitRadius *
                0.5 *
                orbitAmount;


            this.x +=
                (targetX - this.x) * 0.045;

            this.y +=
                (targetY - this.y) * 0.045;

            this.z +=
                (targetZ - this.z) * 0.045;
        }
    }


    draw(centerX, centerY) {

        // Perspectiva 3D
        const perspective =
            650 /
            (650 + this.z);

        const screenX =
            centerX +
            this.x *
            perspective;

        const screenY =
            centerY +
            this.y *
            perspective;

        const size =
            this.size *
            perspective;


        // Brillo variable
        const glow =
            8 +
            Math.sin(this.twinkle) * 5;


        ctx.beginPath();

        ctx.shadowBlur =
            glow;

        ctx.shadowColor =
            "rgba(0, 150, 255, 0.95)";


        const alpha =
            Math.max(
                0.1,
                Math.min(
                    1,
                    this.brightness *
                    perspective
                )
            );


        ctx.fillStyle =
            `rgba(45, 150, 255, ${alpha})`;


        ctx.arc(
            screenX,
            screenY,
            Math.max(size, 0.4),
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}


// ======================================================
// CREAR TODAS LAS PARTÍCULAS
// ======================================================

for (
    let i = 0;
    i < PARTICLE_COUNT;
    i++
) {

    particles.push(
        new Particle()
    );
}


// ======================================================
// CAMBIAR DE ESTADO
// ======================================================

function changeState(newState) {

    state =
        newState;

    stateTime = 0;
}


// ======================================================
// BASE LUMINOSA
// ======================================================

function drawBase(centerX, centerY) {

    const y =
        centerY + 250;


    // Gran resplandor

    const glow =
        ctx.createRadialGradient(
            centerX,
            y,
            5,
            centerX,
            y,
            180
        );


    glow.addColorStop(
        0,
        "rgba(0, 210, 255, 0.7)"
    );

    glow.addColorStop(
        0.4,
        "rgba(0, 90, 255, 0.25)"
    );

    glow.addColorStop(
        1,
        "rgba(0, 0, 0, 0)"
    );


    ctx.fillStyle =
        glow;

    ctx.beginPath();

    ctx.ellipse(
        centerX,
        y,
        180,
        55,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Anillo

    ctx.beginPath();

    ctx.shadowBlur = 25;

    ctx.shadowColor =
        "rgba(0, 180, 255, 1)";

    ctx.strokeStyle =
        "rgba(40, 190, 255, 0.85)";

    ctx.lineWidth = 4;

    ctx.ellipse(
        centerX,
        y,
        120,
        25,
        0,
        0,
        Math.PI * 2
    );

    ctx.stroke();
}


// ======================================================
// ANIMACIÓN
// ======================================================

function animate() {

    animationTime += 0.03;
    stateTime++;


    // Fondo
    ctx.fillStyle =
    "rgba(0, 0, 0, 0.98)";

ctx.fillRect(
    0,
    0,
    width,
    height
);


    const centerX =
        width / 2;

    const centerY =
        height / 2 - 20;


    // Base
    drawBase(
        centerX,
        centerY
    );


    // Partículas
    particles.forEach(
        particle => {

            particle.update();

            particle.draw(
                centerX,
                centerY
            );
        }
    );


    // ================================================
    // CICLO DE LA ANIMACIÓN
    // ================================================


    // Formándose
    if (
        state === STATES.FORMING &&
        stateTime > 220
    ) {

        changeState(
            STATES.HEART
        );
    }


    // Corazón completo
    if (
        state === STATES.HEART &&
        stateTime > 300
    ) {

        changeState(
            STATES.DISASSEMBLING
        );
    }


    // Desarmándose
    if (
        state === STATES.DISASSEMBLING &&
        stateTime > 180
    ) {

        changeState(
            STATES.ORBIT
        );
    }


    // Orbitando
    if (
        state === STATES.ORBIT &&
        stateTime > 240
    ) {

        changeState(
            STATES.REBUILDING
        );
    }


    // Reconstruyéndose
    if (
        state === STATES.REBUILDING &&
        stateTime > 230
    ) {

        changeState(
            STATES.HEART
        );
    }


    requestAnimationFrame(
        animate
    );
}


animate();