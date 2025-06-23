import { Circle } from "./circle.js";

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size to match the screen
    function resizeCanvas() {
        canvas.width = window.innerWidth; // Set internal resolution
        canvas.height = window.innerHeight; // Set internal resolution
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas(); // Set the initial size

    let mousePos = { x: canvas.width / 2, y: canvas.height / 2 }; // Set mouse position to canvas center

    // Create an array of circles
    const count = 5,
        size = 20,
        x_spacing = 500,
        y_spacing = 0,
        mass = 2;

    const circles = Array.from({ length: count }, (_, i) =>
        new Circle(size, 100 + i * x_spacing, 100 + i * y_spacing, mass)
    );

    // Update mouse position on mousemove
    canvas.addEventListener("mousemove", (event) => {
        const rect = canvas.getBoundingClientRect(); // Account for canvas offset
        mousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    });

    function animate() {
        // Clear canvas with a fading trail effect
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        circles.forEach((circle) => {
            circle.moveTowards(mousePos, 0.5);
            circle.update();
            circle.bounce(canvas.width, canvas.height, circles);
            circle.draw(ctx);
        });

        requestAnimationFrame(animate);
    }

    animate();
});
