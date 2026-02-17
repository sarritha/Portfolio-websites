// --- CONFIGURATION ---
const themeColor = '255, 183, 197'; // The Pink Color (R, G, B)
const particleCount = 50; // Number of background dots
const connectionDistance = 150; // Distance to draw lines

const canvas = document.getElementById('magic-waves');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let ripples = [];

// Handle Resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

// --- MOUSE INTERACTION ---
const mouse = { x: null, y: null };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
    
    // Create a new magic wave on every move
    ripples.push(new Ripple(e.x, e.y));
});

window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

// --- CLASS 1: BACKGROUND PARTICLES (NEURAL NETWORK) ---
class Particle {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.dx = (Math.random() * 2) - 1; // Speed X
        this.dy = (Math.random() * 2) - 1; // Speed Y
        this.size = size;
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(${themeColor}, 0.5)`;
        ctx.fill();
    }

    update() {
        if (this.x > canvas.width || this.x < 0) this.dx = -this.dx;
        if (this.y > canvas.height || this.y < 0) this.dy = -this.dy;

        this.x += this.dx;
        this.y += this.dy;
        this.draw();
    }
}

// --- CLASS 2: MAGIC RIPPLES (MOUSE EFFECT) ---
class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 1;
        this.alpha = 1; // Opacity
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.strokeStyle = `rgba(${themeColor}, ${this.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    update() {
        this.radius += 2; // Expand speed
        this.alpha -= 0.02; // Fade speed
        this.draw();
    }
}

// --- INITIALIZE ---
function init() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        let size = (Math.random() * 3) + 1;
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        particles.push(new Particle(x, y, size));
    }
}

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Update & Draw Particles (Background)
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    }
    connectParticles();

    // 2. Update & Draw Ripples (Foreground Magic)
    for (let i = 0; i < ripples.length; i++) {
        ripples[i].update();
        // Remove faded ripples
        if (ripples[i].alpha <= 0) {
            ripples.splice(i, 1);
            i--;
        }
    }
}

// --- DRAW LINES BETWEEN PARTICLES ---
function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
            let dx = particles[a].x - particles[b].x;
            let dy = particles[a].y - particles[b].y;
            let distance = dx * dx + dy * dy;

            if (distance < connectionDistance * connectionDistance) {
                let opacity = 1 - (distance / 20000);
                ctx.strokeStyle = `rgba(${themeColor}, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

init();
animate();


// --- OTHER FEATURES (Typewriter, 3D Tilt, Scroll) ---

// Scroll Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('show-element');
    });
});
document.querySelectorAll('.hidden-element').forEach((el) => observer.observe(el));

// Typewriter
const textElement = document.querySelector('.typewriter-text');
if (textElement) {
    const phrases = ["Saritha B.", "a Data Scientist.", "a Web Developer.", "a Problem Solver."];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function typeWriter() {
        const currentPhrase = phrases[phraseIndex];
        let typeSpeed = isDeleting ? 50 : 150;
        
        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, charIndex--);
        } else {
            textElement.textContent = currentPhrase.substring(0, charIndex++);
        }

        if (!isDeleting && charIndex === currentPhrase.length + 1) {
            isDeleting = true;
            typeSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }
        setTimeout(typeWriter, typeSpeed);
    }
    typeWriter();
}

// 3D Tilt Cards
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.transform = `perspective(1000px) rotateX(${((y - rect.height/2)/rect.height/2)*-10}deg) rotateY(${((x - rect.width/2)/rect.width/2)*10}deg) scale(1.05)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`;
    });
});
// --- SPOTLIGHT REVEAL EFFECT ---
const frame = document.querySelector('.profile-frame');
const revealImage = document.querySelector('.reveal-img');

if (frame && revealImage) {
    frame.addEventListener('mousemove', (e) => {
        const rect = frame.getBoundingClientRect();
        
        // Calculate mouse position inside the image
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Move the "hole" (spotlight) to the mouse
        revealImage.style.clipPath = `circle(70px at ${x}px ${y}px)`;
    });

    // Hide it when mouse leaves
    frame.addEventListener('mouseleave', () => {
        revealImage.style.clipPath = `circle(0px at 50% 50%)`;
    });
}