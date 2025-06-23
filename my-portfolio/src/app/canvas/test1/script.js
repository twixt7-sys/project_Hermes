document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let mousePos = { x: canvas.width / 2, y: canvas.height / 2 };

    class Circle {
        constructor(radius, x, y, mass = 1) {
            this.radius = radius;
            this.pos = { x, y };
            this.vel = { x: 0, y: 0 };
            this.acc = { x: 0, y: 0 };
            this.mass = mass;
            this.friction = 0.998;
        }
        update() {
            this.vel.x *= this.friction;
            this.vel.y *= this.friction;
            this.vel.x += this.acc.x;
            this.vel.y += this.acc.y;
            this.pos.x += this.vel.x;
            this.pos.y += this.vel.y;
            this.acc.x = 0;
            this.acc.y = 0;
        }

        applyForce({ x, y }) {
            this.acc.x += x / this.mass;
            this.acc.y += y / this.mass;
        }

        moveTowards(target, speed) {
            const dx = target.x - this.pos.x;
            const dy = target.y - this.pos.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);
            if (distance > 1) {
                const force = { x: (dx / distance) * speed, y: (dy / distance) * speed };
                this.applyForce(force);
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fill();
        }
    }

    const circles = Array.from({ length: 100 }, (_, i) => new Circle(10, 100 + i * 20, 100));

    canvas.addEventListener("mousemove", (event) => {
        mousePos = { x: event.clientX, y: event.clientY };
    });

    function animate() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // Create a fading trail effect
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        circles.forEach(circle => {
            circle.moveTowards(mousePos, 0.5);
            circle.update();
            circle.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
});
