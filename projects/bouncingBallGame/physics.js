class PhysicsSimulation {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Physics constants
        this.gravity = 500; // pixels/s²
        this.airResistance = 0.001;
        this.bounceDamping = 0.8;
        this.rotationSpeed = 1; // rad/s
        
        // Hexagon properties
        this.hexCenter = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.hexRadius = 200;
        this.hexRotation = 0;
        
        // Ball properties
        this.ball = {
            x: this.hexCenter.x,
            y: this.hexCenter.y - 50,
            vx: 100, // pixels/s
            vy: 0,
            radius: 15,
            mass: 1,
            color: '#ff4444'
        };
        
        // Simulation state
        this.lastTime = 0;
        this.isPaused = false;
        
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }
    
    setupControls() {
        const gravitySlider = document.getElementById('gravitySlider');
        const rotationSlider = document.getElementById('rotationSlider');
        const dampingSlider = document.getElementById('dampingSlider');
        const airResistanceSlider = document.getElementById('airResistanceSlider');
        
        gravitySlider.oninput = (e) => {
            this.gravity = parseFloat(e.target.value);
            document.getElementById('gravityValue').textContent = this.gravity;
        };
        
        rotationSlider.oninput = (e) => {
            this.rotationSpeed = parseFloat(e.target.value);
            document.getElementById('rotationValue').textContent = this.rotationSpeed.toFixed(1);
        };
        
        dampingSlider.oninput = (e) => {
            this.bounceDamping = parseFloat(e.target.value);
            document.getElementById('dampingValue').textContent = this.bounceDamping.toFixed(2);
        };
        
        airResistanceSlider.oninput = (e) => {
            this.airResistance = parseFloat(e.target.value);
            document.getElementById('airResistanceValue').textContent = this.airResistance.toFixed(4);
        };
        
        document.getElementById('resetBtn').onclick = () => this.resetBall();
        document.getElementById('pauseBtn').onclick = () => this.togglePause();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if click is inside hexagon
            if (this.isPointInHexagon(x, y)) {
                this.ball.x = x;
                this.ball.y = y;
                this.ball.vx = (Math.random() - 0.5) * 200;
                this.ball.vy = (Math.random() - 0.5) * 200;
            }
        });
    }
    
    getHexagonVertices() {
        const vertices = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI / 3) + this.hexRotation;
            vertices.push({
                x: this.hexCenter.x + this.hexRadius * Math.cos(angle),
                y: this.hexCenter.y + this.hexRadius * Math.sin(angle)
            });
        }
        return vertices;
    }
    
    isPointInHexagon(x, y) {
        const vertices = this.getHexagonVertices();
        let inside = false;
        
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            if (((vertices[i].y > y) !== (vertices[j].y > y)) &&
                (x < (vertices[j].x - vertices[i].x) * (y - vertices[i].y) / (vertices[j].y - vertices[i].y) + vertices[i].x)) {
                inside = !inside;
            }
        }
        return inside;
    }
    
    update(deltaTime) {
        if (this.isPaused) return;
        
        const dt = deltaTime / 1000; // Convert to seconds
        
        // Update hexagon rotation
        this.hexRotation += this.rotationSpeed * dt;
        
        // Apply rotational forces (centrifugal and Coriolis effects)
        const distFromCenter = Math.sqrt(
            Math.pow(this.ball.x - this.hexCenter.x, 2) + 
            Math.pow(this.ball.y - this.hexCenter.y, 2)
        );
        
        if (distFromCenter > 0) {
            // Centrifugal force (outward)
            const centrifugalForce = this.ball.mass * Math.pow(this.rotationSpeed, 2) * distFromCenter;
            const centrifugalX = (this.ball.x - this.hexCenter.x) / distFromCenter * centrifugalForce;
            const centrifugalY = (this.ball.y - this.hexCenter.y) / distFromCenter * centrifugalForce;
            
            // Coriolis force (perpendicular to velocity)
            const coriolisForce = 2 * this.ball.mass * this.rotationSpeed;
            const coriolisX = -coriolisForce * this.ball.vy;
            const coriolisY = coriolisForce * this.ball.vx;
            
            // Apply rotational forces
            this.ball.vx += (centrifugalX + coriolisX) * dt;
            this.ball.vy += (centrifugalY + coriolisY) * dt;
        }
        
        // Apply gravity
        this.ball.vy += this.gravity * dt;
        
        // Apply air resistance
        const speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
        if (speed > 0) {
            const dragForce = this.airResistance * speed * speed;
            const dragX = -dragForce * (this.ball.vx / speed);
            const dragY = -dragForce * (this.ball.vy / speed);
            
            this.ball.vx += dragX * dt;
            this.ball.vy += dragY * dt;
        }
        
        // Update position
        this.ball.x += this.ball.vx * dt;
        this.ball.y += this.ball.vy * dt;
        
        // Check collisions with hexagon walls
        this.checkHexagonCollisions();
    }

    checkHexagonCollisions() {
        const vertices = this.getHexagonVertices();

        // Check collision with each wall of the hexagon
        for (let i = 0; i < vertices.length; i++) {
            const p1 = vertices[i];
            const p2 = vertices[(i + 1) % vertices.length];

            // Calculate distance from ball center to line segment
            const { distance, closestPoint } = this.distanceToLineSegment(
                this.ball.x, this.ball.y, p1.x, p1.y, p2.x, p2.y
            );

            if (distance < this.ball.radius) {
                // Collision detected
                this.handleWallCollision(p1, p2, closestPoint);
            }
        }
    }

    distanceToLineSegment(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) {
            return {
                distance: Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1)),
                closestPoint: { x: x1, y: y1 }
            };
        }

        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
        const closestX = x1 + t * dx;
        const closestY = y1 + t * dy;

        return {
            distance: Math.sqrt((px - closestX) * (px - closestX) + (py - closestY) * (py - closestY)),
            closestPoint: { x: closestX, y: closestY }
        };
    }

    handleWallCollision(p1, p2, closestPoint) {
        // Calculate wall normal
        const wallDx = p2.x - p1.x;
        const wallDy = p2.y - p1.y;
        const wallLength = Math.sqrt(wallDx * wallDx + wallDy * wallDy);

        // Normal vector (perpendicular to wall, pointing inward)
        let normalX = -wallDy / wallLength;
        let normalY = wallDx / wallLength;

        // Ensure normal points toward hexagon center
        const toCenterX = this.hexCenter.x - closestPoint.x;
        const toCenterY = this.hexCenter.y - closestPoint.y;
        if (normalX * toCenterX + normalY * toCenterY < 0) {
            normalX = -normalX;
            normalY = -normalY;
        }

        // Move ball out of wall
        const penetration = this.ball.radius - Math.sqrt(
            (this.ball.x - closestPoint.x) * (this.ball.x - closestPoint.x) +
            (this.ball.y - closestPoint.y) * (this.ball.y - closestPoint.y)
        );

        this.ball.x += normalX * penetration;
        this.ball.y += normalY * penetration;

        // Calculate relative velocity along normal
        const relativeVelocity = this.ball.vx * normalX + this.ball.vy * normalY;

        // Don't resolve if velocities are separating
        if (relativeVelocity > 0) return;

        // Calculate impulse scalar
        const impulse = -(1 + this.bounceDamping) * relativeVelocity;

        // Apply impulse
        this.ball.vx += impulse * normalX;
        this.ball.vy += impulse * normalY;

        // Add some tangential friction
        const tangentX = -normalY;
        const tangentY = normalX;
        const tangentialVelocity = this.ball.vx * tangentX + this.ball.vy * tangentY;
        const friction = 0.1;

        this.ball.vx -= friction * tangentialVelocity * tangentX;
        this.ball.vy -= friction * tangentialVelocity * tangentY;
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw hexagon
        this.drawHexagon();

        // Draw ball
        this.drawBall();

        // Draw info
        this.drawInfo();
    }

    drawHexagon() {
        const vertices = this.getHexagonVertices();

        // Draw hexagon outline
        this.ctx.strokeStyle = '#00ff88';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(vertices[0].x, vertices[0].y);

        for (let i = 1; i < vertices.length; i++) {
            this.ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        this.ctx.closePath();
        this.ctx.stroke();

        // Draw rotation indicator
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.hexCenter.x, this.hexCenter.y);
        this.ctx.lineTo(vertices[0].x, vertices[0].y);
        this.ctx.stroke();

        // Draw center point
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(this.hexCenter.x, this.hexCenter.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawBall() {
        // Ball shadow/trail effect
        this.ctx.fillStyle = 'rgba(255, 68, 68, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x - this.ball.vx * 0.01, this.ball.y - this.ball.vy * 0.01, this.ball.radius * 0.8, 0, Math.PI * 2);
        this.ctx.fill();

        // Main ball
        this.ctx.fillStyle = this.ball.color;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Ball highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x - 3, this.ball.y - 3, this.ball.radius * 0.3, 0, Math.PI * 2);
        this.ctx.fill();

        // Velocity vector
        if (Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy) > 10) {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.ball.x, this.ball.y);
            this.ctx.lineTo(this.ball.x + this.ball.vx * 0.1, this.ball.y + this.ball.vy * 0.1);
            this.ctx.stroke();
        }
    }

    drawInfo() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';

        const speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
        const energy = 0.5 * this.ball.mass * speed * speed + this.ball.mass * this.gravity * (this.canvas.height - this.ball.y);

        this.ctx.fillText(`Speed: ${speed.toFixed(1)} px/s`, 10, 20);
        this.ctx.fillText(`Energy: ${energy.toFixed(0)} J`, 10, 35);
        this.ctx.fillText(`Rotation: ${(this.hexRotation * 180 / Math.PI % 360).toFixed(1)}°`, 10, 50);

        if (this.isPaused) {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('PAUSED', this.canvas.width - 100, 30);
        }
    }

    resetBall() {
        this.ball.x = this.hexCenter.x;
        this.ball.y = this.hexCenter.y - 50;
        this.ball.vx = 100;
        this.ball.vy = 0;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBtn').textContent = this.isPaused ? 'Resume' : 'Pause';
    }

    animate(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (deltaTime > 0 && deltaTime < 100) { // Cap delta time to prevent large jumps
            this.update(deltaTime);
        }

        this.render();
        requestAnimationFrame((time) => this.animate(time));
    }
}

// Initialize the simulation when the page loads
window.addEventListener('load', () => {
    new PhysicsSimulation();
});
