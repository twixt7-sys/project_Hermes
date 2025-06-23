// circle.js
export class Circle {
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
        const distance = Math.sqrt(dx ** 2 + dy ** 2); // distance formula
        if (distance > 1) {
            const force = { x: (dx / distance) * speed, y: (dy / distance) * speed };
            this.applyForce(force);
        }
    }

    bounce(canvasWidth, canvasHeight, otherCircles) {
        // Bounce off edges
        if (this.pos.x - this.radius < 0 || this.pos.x + this.radius > canvasWidth) {
            this.vel.x *= -1;
            this.pos.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.pos.x));
        }

        if (this.pos.y - this.radius < 0 || this.pos.y + this.radius > canvasHeight) {
            this.vel.y *= -1;
            this.pos.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.pos.y));
        }

        // Bounce off other circles
        otherCircles.forEach((other) => {
            if (this === other) return; // Skip self

            const dx = this.pos.x - other.pos.x;
            const dy = this.pos.y - other.pos.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);
            const minDist = this.radius + other.radius;

            if (distance < minDist) {
                // Collision detected, calculate new velocities
                const angle = Math.atan2(dy, dx);
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);

                // Rotate velocities to collision axis
                const v1 = { x: cos * this.vel.x + sin * this.vel.y, y: cos * this.vel.y - sin * this.vel.x };
                const v2 = { x: cos * other.vel.x + sin * other.vel.y, y: cos * other.vel.y - sin * other.vel.x };

                // Exchange velocities along collision axis (elastic collision)
                const temp = v1.x;
                v1.x = v2.x;
                v2.x = temp;

                // Rotate velocities back to original orientation
                this.vel.x = cos * v1.x - sin * v1.y;
                this.vel.y = cos * v1.y + sin * v1.x;

                other.vel.x = cos * v2.x - sin * v2.y;
                other.vel.y = cos * v2.y + sin * v2.x;

                // Separate overlapping circles
                const overlap = (minDist - distance) / 2;
                this.pos.x += overlap * (dx / distance);
                this.pos.y += overlap * (dy / distance);

                other.pos.x -= overlap * (dx / distance);
                other.pos.y -= overlap * (dy / distance);
            }
        });
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();
    }
}