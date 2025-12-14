<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
    import { themeStore } from '$stores/theme';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let width: number;
	let height: number;
	let animationFrameId: number;
    
    // Configuration
    const particleCount = 60; // Number of particles
    const connectionDistance = 150; // Max distance for lines
    const mouseDistance = 200; // Interaction radius
    
    interface Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
    }

	let particles: Particle[] = [];
    let mouse = { x: -1000, y: -1000 }; // Initially off-screen

	function init() {
		if (!canvas) return;
        width = window.innerWidth;
        height = window.innerHeight;
		canvas.width = width;
		canvas.height = height;
		ctx = canvas.getContext('2d');

		// Create particles
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            });
        }
	}

	function animate() {
        if (!ctx) return;
		ctx.clearRect(0, 0, width, height);

        const isDark = $themeStore === 'dark';
        const color = isDark ? '255, 255, 255' : '0, 0, 0'; // White in dark, Black in light
        const particleOpacity = isDark ? 0.5 : 0.3;
        const lineOpacity = isDark ? 0.15 : 0.1;

		particles.forEach((p, i) => {
            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            // Mouse interaction (gentle repulsion)
            const dxMouse = p.x - mouse.x;
            const dyMouse = p.y - mouse.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            
            if (distMouse < mouseDistance) {
                 const forceDirectionX = dxMouse / distMouse;
                 const forceDirectionY = dyMouse / distMouse;
                 const force = (mouseDistance - distMouse) / mouseDistance;
                 const strength = 0.05;
                 
                 p.vx += forceDirectionX * force * strength;
                 p.vy += forceDirectionY * force * strength;
            }
            
            // Limit speed
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const maxSpeed = 2;
            if (speed > maxSpeed) {
                p.vx = (p.vx / speed) * maxSpeed;
                p.vy = (p.vy / speed) * maxSpeed;
            }


            // Draw particle
            ctx!.beginPath();
            ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx!.fillStyle = `rgba(${color}, ${particleOpacity})`;
            ctx!.fill();

            // Connect particles
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    ctx!.beginPath();
                    ctx!.strokeStyle = `rgba(${color}, ${lineOpacity * (1 - dist / connectionDistance)})`;
                    ctx!.lineWidth = 0.5;
                    ctx!.moveTo(p.x, p.y);
                    ctx!.lineTo(p2.x, p2.y);
                    ctx!.stroke();
                }
            }
            
             // Connect to mouse
             if (distMouse < connectionDistance) {
                ctx!.beginPath();
                ctx!.strokeStyle = `rgba(${color}, ${lineOpacity * (1 - distMouse / connectionDistance)})`;
                ctx!.lineWidth = 0.5;
                ctx!.moveTo(p.x, p.y);
                ctx!.lineTo(mouse.x, mouse.y);
                ctx!.stroke();
             }
		});

		animationFrameId = requestAnimationFrame(animate);
	}

    function handleResize() {
        init();
    }
    
    function handleMouseMove(e: MouseEvent) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }

	onMount(() => {
        if (!browser) return;
		init();
		animate();
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
	});

	onDestroy(() => {
        if (!browser) return;
		cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
	});
</script>

<canvas
	bind:this={canvas}
	class="fixed inset-0 -z-50 pointer-events-none opacity-60"
/>
