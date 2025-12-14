import anime from 'animejs';
import type { AnimeParams } from 'animejs';

/**
 * Svelte action to apply anime.js animations to an element.
 * @param node The element to animate
 * @param params The anime.js parameters
 */
export function animate(node: HTMLElement, params: AnimeParams) {
    let animation: anime.AnimeInstance;

    // Helper to run animation
    const run = (currentParams: AnimeParams) => {
        // If targets are not specified, default to the node itself
        const finalParams = {
            targets: node,
            ...currentParams
        };
        animation = anime(finalParams);
    };

    // Run initially
    run(params);

    return {
        update(newParams: AnimeParams) {
            // Stop previous if needed, though animejs usually handles overrides well
            // For simple "play on mount" this might re-trigger, so use carefully.
            // Often we want to trigger on events instead.
            if (animation) animation.pause();
            run(newParams);
        },
        destroy() {
            if (animation) animation.pause();
        }
    };
}

/**
 * Create a timeline animation
 */
export function createTimeline(params?: anime.AnimeTimelineParams) {
    return anime.timeline(params);
}

/**
 * Advanced ripple effect on click
 */
export function rippleEffect(node: HTMLElement) {
    const handleClick = (e: MouseEvent) => {
        const rect = node.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transform: translate(-50%, -50%);
            pointer-events: none;
        `;

        // Ensure node is positioned
        if (getComputedStyle(node).position === 'static') {
            node.style.position = 'relative';
        }
        node.style.overflow = 'hidden';
        node.appendChild(ripple);

        anime({
            targets: ripple,
            width: Math.max(rect.width, rect.height) * 2.5,
            height: Math.max(rect.width, rect.height) * 2.5,
            opacity: [0.6, 0],
            duration: 800,
            easing: 'easeOutExpo',
            complete: () => ripple.remove()
        });
    };

    node.addEventListener('click', handleClick);
    return {
        destroy() {
            node.removeEventListener('click', handleClick);
        }
    };
}

/**
 * Helper to animate on click (e.g. for buttons)
 */
export function clickPulse(node: HTMLElement) {
    const handleClick = () => {
        anime({
            targets: node,
            scale: [
                { value: 0.9, duration: 80, easing: 'easeInOutQuad' },
                { value: 1, duration: 400, easing: 'easeOutElastic(1, .5)' } // Slower release/elastic
            ]
        });
    };

    node.addEventListener('click', handleClick);

    return {
        destroy() {
            node.removeEventListener('click', handleClick);
        }
    };
}

/**
 * Helper to animate entry
 */
export function fadeSlideIn(node: HTMLElement, params?: { delay?: number } | number) {
    const delay = typeof params === 'number' ? params : (params?.delay || 0);

    // Hide initially to prevent flash
    node.style.opacity = '0';
    node.style.transform = 'translateY(20px)';

    anime({
        targets: node,
        translateY: [20, 0],
        opacity: [0, 1],
        delay: delay,
        duration: 800,
        easing: 'easeOutExpo'
    });
}

/**
 * Helper to animate scale on hover
 */
export function hoverScale(node: HTMLElement) {
    const handleEnter = () => {
        anime({
            targets: node,
            scale: 1.05,
            duration: 400,
            easing: 'easeOutElastic(1, .5)'
        });
    };

    const handleLeave = () => {
        anime({
            targets: node,
            scale: 1,
            duration: 300,
            easing: 'easeOutQuad'
        });
    };

    node.addEventListener('mouseenter', handleEnter);
    node.addEventListener('mouseleave', handleLeave);

    return {
        destroy() {
            node.removeEventListener('mouseenter', handleEnter);
            node.removeEventListener('mouseleave', handleLeave);
        }
    };
}

/**
 * Helper to animate staggered children
 * Usage: use:staggerFadeIn on the parent container
 */
export function staggerFadeIn(node: HTMLElement) {
    // Wait for children to be rendered
    const animateChildren = () => {
        const children = node.children;
        // Reset opacity initially
        anime.set(children, { opacity: 0, translateY: 20 });

        anime({
            targets: children,
            translateY: [20, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 800,
            easing: 'easeOutExpo'
        });
    };

    // Use MutationObserver for dynamic content, or just run once?
    // For now, run once on mount (action init)
    // Small delay to ensure children exist
    setTimeout(animateChildren, 50);
}

/**
 * Rotate on hover with spring physics
 */
export function rotateOnHover(node: HTMLElement) {
    const handleEnter = () => {
        anime({
            targets: node,
            rotate: [-2, 2],
            duration: 300,
            direction: 'alternate',
            easing: 'easeInOutQuad',
            loop: 2
        });
    };

    const handleLeave = () => {
        anime({
            targets: node,
            rotate: 0,
            duration: 300,
            easing: 'easeOutQuad'
        });
    };

    node.addEventListener('mouseenter', handleEnter);
    node.addEventListener('mouseleave', handleLeave);

    return {
        destroy() {
            node.removeEventListener('mouseenter', handleEnter);
            node.removeEventListener('mouseleave', handleLeave);
        }
    };
}

/**
 * Bounce entrance animation
 */
export function bounceIn(node: HTMLElement, params?: { delay?: number } | number) {
    const delay = typeof params === 'number' ? params : (params?.delay || 0);

    anime.set(node, { opacity: 0, scale: 0 });

    anime({
        targets: node,
        opacity: [0, 1],
        scale: [0, 1],
        delay: delay,
        duration: 800,
        easing: 'easeOutElastic(1, .8)'
    });
}

/**
 * Slide in from direction
 */
export function slideInFrom(node: HTMLElement, params?: { direction?: 'left' | 'right' | 'top' | 'bottom', delay?: number } | 'left' | 'right' | 'top' | 'bottom') {
    const direction = typeof params === 'string' ? params : (params?.direction || 'left');
    const delay = typeof params === 'object' ? (params.delay || 0) : 0;
    const transforms = {
        left: { translateX: [-100, 0] },
        right: { translateX: [100, 0] },
        top: { translateY: [-100, 0] },
        bottom: { translateY: [100, 0] }
    };

    anime.set(node, { opacity: 0 });

    anime({
        targets: node,
        ...transforms[direction],
        opacity: [0, 1],
        delay: delay,
        duration: 600,
        easing: 'easeOutCubic'
    });
}

/**
 * Pulsing glow effect
 */
export function pulseGlow(node: HTMLElement) {
    anime({
        targets: node,
        boxShadow: [
            { value: '0 0 0px rgba(59, 130, 246, 0)' },
            { value: '0 0 20px rgba(59, 130, 246, 0.6)' },
            { value: '0 0 0px rgba(59, 130, 246, 0)' }
        ],
        duration: 2000,
        easing: 'easeInOutQuad',
        loop: true
    });
}

/**
 * Number counter animation
 */
export function animateNumber(node: HTMLElement, targetValue: number, duration: number = 2000) {
    const obj = { value: 0 };

    anime({
        targets: obj,
        value: targetValue,
        duration: duration,
        easing: 'easeOutExpo',
        round: 1,
        update: () => {
            node.textContent = obj.value.toString();
        }
    });
}

/**
 * Shake animation for errors
 */
export function shake(node: HTMLElement) {
    anime({
        targets: node,
        translateX: [
            { value: -10, duration: 100 },
            { value: 10, duration: 100 },
            { value: -10, duration: 100 },
            { value: 10, duration: 100 },
            { value: 0, duration: 100 }
        ],
        easing: 'easeInOutQuad'
    });
}

/**
 * Float animation (gentle up and down)
 */
export function float(node: HTMLElement) {
    anime({
        targets: node,
        translateY: [-10, 10],
        duration: 3000,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine'
    });
}

/**
 * Morph background gradient
 */
export function morphGradient(node: HTMLElement) {
    let hue = 180;

    anime({
        targets: { hue },
        hue: 360,
        duration: 10000,
        easing: 'linear',
        loop: true,
        update: function() {
            node.style.background = `linear-gradient(135deg,
                hsl(${hue}, 70%, 60%) 0%,
                hsl(${(hue + 60) % 360}, 70%, 50%) 100%)`;
        }
    });
}

/**
 * Stagger from grid
 */
export function staggerGrid(node: HTMLElement) {
    const children = Array.from(node.children);
    anime.set(children, { opacity: 0, scale: 0 });

    anime({
        targets: children,
        opacity: [0, 1],
        scale: [0, 1],
        delay: anime.stagger(50, { grid: [3, 3], from: 'center' }),
        duration: 600,
        easing: 'easeOutExpo'
    });
}

/**
 * Text reveal animation
 */
export function revealText(node: HTMLElement) {
    const text = node.textContent || '';
    node.innerHTML = text.split('').map(char =>
        `<span style="opacity:0">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('');

    anime({
        targets: node.querySelectorAll('span'),
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(30),
        duration: 600,
        easing: 'easeOutExpo'
    });
}

/**
 * Path drawing animation for SVG
 */
export function drawPath(node: SVGPathElement) {
    const pathLength = node.getTotalLength();
    node.style.strokeDasharray = pathLength.toString();
    node.style.strokeDashoffset = pathLength.toString();

    anime({
        targets: node,
        strokeDashoffset: [pathLength, 0],
        duration: 2000,
        easing: 'easeInOutSine'
    });
}

/**
 * Card flip animation
 */
export function flipCard(node: HTMLElement) {
    let isFlipped = false;

    const flip = () => {
        isFlipped = !isFlipped;
        anime({
            targets: node,
            rotateY: isFlipped ? 180 : 0,
            duration: 600,
            easing: 'easeInOutQuad'
        });
    };

    node.addEventListener('click', flip);
    node.style.transformStyle = 'preserve-3d';

    return {
        destroy() {
            node.removeEventListener('click', flip);
        }
    };
}

/**
 * Progress bar animation
 */
export function animateProgress(node: HTMLElement, percentage: number) {
    anime({
        targets: node,
        width: `${percentage}%`,
        duration: 1500,
        easing: 'easeOutExpo'
    });
}

/**
 * Particle burst effect
 */
export function particleBurst(node: HTMLElement, particleCount: number = 20) {
    const particles: HTMLElement[] = [];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
        `;
        node.appendChild(particle);
        particles.push(particle);
    }

    if (getComputedStyle(node).position === 'static') {
        node.style.position = 'relative';
    }

    anime({
        targets: particles,
        translateX: () => anime.random(-150, 150),
        translateY: () => anime.random(-150, 150),
        scale: [1, 0],
        opacity: [1, 0],
        duration: 1500,
        easing: 'easeOutExpo',
        complete: () => particles.forEach(p => p.remove())
    });
}
