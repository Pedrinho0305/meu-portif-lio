// 1. Efeito de Digitação no Título (Typewriter)
const textPhrases = [
    "Técnico em TI pelo UNASP SP",
    "Especialista em Lógica e Soluções",
    "Desenvolvedor C, C++, Java e Web",
    "Aprovado no Exame Cambridge de Inglês"
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typewriterTarget = document.getElementById("typewriter");

function typeWriterEffect() {
    const currentPhrase = textPhrases[phraseIndex];

    if (isDeleting) {
        typewriterTarget.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typewriterTarget.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }

    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentPhrase.length) {
        speed = 2200; // Tempo de pausa com a frase completa
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % textPhrases.length;
        speed = 400;
    }

    setTimeout(typeWriterEffect, speed);
}

document.addEventListener("DOMContentLoaded", () => {
    if (textPhrases.length) setTimeout(typeWriterEffect, 600);
});

// 2. Animação de Revelação de Elementos ao Rolar (Scroll Reveal)
const observerOptions = {
    root: null,
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(element => {
    observer.observe(element);
});