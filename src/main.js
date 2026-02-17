/**
 * Main Application — Portfolio
 * Orchestrates Three.js scenes, GSAP animations, navigation, and tilt effects.
 */
import { initHeroScene } from './three-hero.js';
import { initThesisScene } from './three-thesis.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- Initialize Three.js Scenes ---
const heroCanvas = document.getElementById('hero-canvas');
if (heroCanvas) initHeroScene(heroCanvas);

const thesisCanvas = document.getElementById('thesis-canvas');
if (thesisCanvas) initThesisScene(thesisCanvas);

// --- Scroll Reveal Animations (GSAP + ScrollTrigger) ---
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.anim-reveal');

    reveals.forEach((el, i) => {
        // Check if element is in the hero (don't use ScrollTrigger for hero elements)
        const isHero = el.closest('.hero');

        if (isHero) {
            // Hero elements: simple staggered entrance
            gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 1,
                delay: 0.3 + i * 0.15,
                ease: 'power3.out',
            });
        } else {
            // Scroll-triggered elements
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                },
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power3.out',
            });
        }
    });
}

initScrollAnimations();

// --- Navbar Scroll Effect ---
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// --- Smooth Scroll Navigation ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = navbar.offsetHeight;
            const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top: targetPos, behavior: 'smooth' });

            // Close mobile menu if open
            const navLinks = document.getElementById('nav-links');
            const navToggle = document.getElementById('nav-toggle');
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
});

// --- Mobile Menu Toggle ---
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// --- 3D Tilt Effect on Cards ---
function initTiltEffect() {
    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / centerY * -4;
            const rotateY = (x - centerX) / centerX * 4;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.transition = 'transform 0.1s ease';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    });
}

initTiltEffect();

// --- Liquid Button Hover Effect ---
function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            btn.style.setProperty('--mx', `${x}px`);
            btn.style.setProperty('--my', `${y}px`);
        });
    });
}

initButtonEffects();
