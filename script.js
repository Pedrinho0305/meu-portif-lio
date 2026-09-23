const raiz = document.documentElement;
const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ponteiroFino = window.matchMedia("(pointer: fine)").matches;
const limitar = (v, min, max) => Math.min(max, Math.max(min, v));

// 1. Nome letra por letra (leitores de tela recebem o nome inteiro)
document.querySelectorAll("[data-letras]").forEach(titulo => {
    const oculto = document.createElement("span");
    oculto.className = "oculto";
    oculto.textContent = titulo.textContent.replace(/\s+/g, " ").trim();

    let i = 0;
    titulo.querySelectorAll(".linha").forEach(linha => {
        const palavras = linha.textContent.trim().split(/\s+/);
        linha.textContent = "";
        linha.setAttribute("aria-hidden", "true");

        palavras.forEach((texto, p) => {
            const palavra = document.createElement("span");
            palavra.className = "palavra";
            for (const caractere of texto) {
                const letra = document.createElement("span");
                letra.className = "letra";
                letra.textContent = caractere;
                letra.style.setProperty("--i", i++);
                palavra.appendChild(letra);
            }
            linha.appendChild(palavra);
            if (p < palavras.length - 1) linha.appendChild(document.createTextNode(" "));
        });
        i += 3;
    });
    titulo.prepend(oculto);
});

// 2. Abertura: acende o palco quando a fonte estiver pronta
let aberto = false;
const abrir = () => {
    if (aberto) return;
    aberto = true;
    requestAnimationFrame(() => raiz.classList.add("pronto"));
};
(document.fonts ? document.fonts.ready : Promise.resolve()).then(abrir);
setTimeout(abrir, 1200);

// 3. Texto do "Sobre" que acende palavra por palavra
const acender = document.querySelector(".acender");
let palavrasSobre = [];
if (acender) {
    const palavras = acender.textContent.trim().split(/\s+/);
    acender.textContent = "";
    palavras.forEach((texto, i) => {
        const palavra = document.createElement("span");
        palavra.className = "palavra";
        palavra.textContent = texto;
        acender.appendChild(palavra);
        if (i < palavras.length - 1) acender.appendChild(document.createTextNode(" "));
    });
    palavrasSobre = [...acender.querySelectorAll(".palavra")];
}

// 4. Rolagem: progresso, menu, texto aceso e trilha da formação
const barra = document.querySelector(".progresso");
const nav = document.querySelector(".nav");
const trilha = document.querySelector(".trilha-caixa");
const trilhaLuz = document.querySelector(".trilha-luz");
const etapas = [...document.querySelectorAll(".trilha li")];
let rolagemPendente = false;

function aoRolar() {
    rolagemPendente = false;
    const altura = window.innerHeight;
    const maximo = raiz.scrollHeight - altura;
    barra.style.transform = `scaleX(${maximo > 0 ? window.scrollY / maximo : 0})`;
    nav.classList.toggle("rolou", window.scrollY > 40);

    if (acender) {
        const caixa = acender.getBoundingClientRect();
        const progresso = semMovimento ? 1 : limitar((altura * 0.85 - caixa.top) / (caixa.height + altura * 0.3), 0, 1);
        const acesas = Math.round(progresso * palavrasSobre.length);
        palavrasSobre.forEach((p, i) => p.classList.toggle("acesa", i < acesas));
    }

    if (trilha) {
        const caixa = trilha.getBoundingClientRect();
        const progresso = semMovimento ? 1 : limitar((altura * 0.6 - caixa.top) / caixa.height, 0, 1);
        trilhaLuz.style.setProperty("--prog", progresso);
        etapas.forEach(etapa => {
            const topo = etapa.getBoundingClientRect().top;
            etapa.classList.toggle("acesa", semMovimento || topo < altura * 0.62);
        });
    }
}

window.addEventListener("scroll", () => {
    if (!rolagemPendente) {
        rolagemPendente = true;
        requestAnimationFrame(aoRolar);
    }
}, { passive: true });
window.addEventListener("resize", aoRolar);
aoRolar();

// 5. Menu: indicador desliza até a seção visível
const linksMenu = [...document.querySelectorAll(".nav-links a")];
const indicador = document.querySelector(".nav-indicador");

function moverIndicador(link) {
    linksMenu.forEach(l => l.classList.toggle("ativo", l === link));
    if (!link) {
        indicador.style.opacity = 0;
        return;
    }
    indicador.style.opacity = 1;
    indicador.style.width = `${link.offsetWidth}px`;
    indicador.style.transform = `translateX(${link.parentElement.offsetLeft}px)`;
}

const observadorSecoes = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
            moverIndicador(linksMenu.find(l => l.hash === `#${entrada.target.id}`));
        }
    });
}, { rootMargin: "-45% 0px -50% 0px" });

document.querySelectorAll("#inicio, main section, #contato").forEach(s => observadorSecoes.observe(s));

// 6. Revelação ao rolar
const observadorRevelar = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
            entrada.target.classList.add("visivel");
            observadorRevelar.unobserve(entrada.target);
        }
    });
}, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });

document.querySelectorAll("[data-revelar], .titulo").forEach(el => observadorRevelar.observe(el));

// 7. Grade de contribuições (projeto GitHub)
document.querySelectorAll(".grade-git").forEach(grade => {
    const colunas = 22;
    const fragmento = document.createDocumentFragment();
    for (let i = 0; i < colunas * 7; i++) {
        const celula = document.createElement("i");
        const sorte = Math.random();
        celula.dataset.n = sorte > 0.93 ? 4 : sorte > 0.75 ? 3 : sorte > 0.5 ? 2 : sorte > 0.28 ? 1 : 0;
        celula.style.setProperty("--d", `${(i % colunas) * 0.09 + Math.random() * 0.3}s`);
        fragmento.appendChild(celula);
    }
    grade.appendChild(fragmento);
});

// 8. Copiar e-mail
document.querySelectorAll("[data-copiar]").forEach(botao => {
    const aviso = botao.parentElement.querySelector(".copiar-aviso");
    const original = botao.textContent;
    botao.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(botao.dataset.copiar);
            botao.textContent = "E-mail copiado";
            aviso.textContent = "Pronto, é só colar na sua mensagem.";
        } catch {
            aviso.textContent = "Não deu para copiar. Selecione o e-mail acima.";
        }
        setTimeout(() => {
            botao.textContent = original;
            aviso.textContent = "";
        }, 2600);
    });
});

// Tudo daqui para baixo reage ao mouse
if (!semMovimento && ponteiroFino) {

    // 9. Luz suave que segue o mouse pela página
    const luzPagina = document.querySelector(".luz-pagina");
    window.addEventListener("pointermove", e => {
        luzPagina.style.setProperty("--cx", `${e.clientX}px`);
        luzPagina.style.setProperty("--cy", `${e.clientY}px`);
    }, { passive: true });

    // 10. Bordas que acendem perto do mouse
    document.querySelectorAll("[data-brilho]").forEach(grupo => {
        const cartoes = grupo.querySelectorAll(".brilho");
        grupo.addEventListener("pointermove", e => {
            cartoes.forEach(cartao => {
                const caixa = cartao.getBoundingClientRect();
                cartao.style.setProperty("--mx", `${e.clientX - caixa.left}px`);
                cartao.style.setProperty("--my", `${e.clientY - caixa.top}px`);
            });
        });
    });

    // 11. Projetos inclinam em 3D
    document.querySelectorAll("[data-inclinar]").forEach(cartao => {
        cartao.addEventListener("pointermove", e => {
            const caixa = cartao.getBoundingClientRect();
            const x = (e.clientX - caixa.left) / caixa.width - 0.5;
            const y = (e.clientY - caixa.top) / caixa.height - 0.5;
            cartao.classList.add("inclinando");
            cartao.style.transform = `rotateX(${-y * 7}deg) rotateY(${x * 9}deg)`;
        });
        cartao.addEventListener("pointerleave", () => {
            cartao.classList.remove("inclinando");
            cartao.style.transform = "";
        });
    });

    // 12. Botões magnéticos
    document.querySelectorAll("[data-ima]").forEach(botao => {
        botao.addEventListener("pointermove", e => {
            const caixa = botao.getBoundingClientRect();
            const x = e.clientX - caixa.left - caixa.width / 2;
            const y = e.clientY - caixa.top - caixa.height / 2;
            botao.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
        });
        botao.addEventListener("pointerleave", () => {
            botao.style.transform = "";
        });
    });
}

// 13. Refletor e poeira no palco
const palco = document.querySelector(".palco");
const feixe = palco.querySelector(".feixe");
const tela = palco.querySelector(".poeira");

if (!semMovimento && tela.getContext) {
    const ctx = tela.getContext("2d");
    let largura = 0;
    let altura = 0;
    let particulas = [];
    let alvoAngulo = 0;
    let angulo = 0;
    let visivel = true;
    let rodando = false;

    function medir() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        largura = palco.clientWidth;
        altura = palco.clientHeight;
        tela.width = largura * dpr;
        tela.height = altura * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const total = Math.round(limitar(largura / 12, 50, 130));
        particulas = Array.from({ length: total }, () => ({
            x: Math.random() * largura,
            y: Math.random() * altura,
            r: Math.random() * 1.6 + 0.3,
            vx: (Math.random() - 0.5) * 0.18,
            vy: -(Math.random() * 0.25 + 0.05),
            fase: Math.random() * Math.PI * 2
        }));
    }

    // Centro do feixe e sua meia largura em cada altura do palco
    function feixeEm(y) {
        const larguraFeixe = Math.min(1150, largura * 1.5);
        const topo = -0.08 * altura;
        const t = limitar((y - topo) / (1.18 * altura), 0, 1);
        const radianos = angulo * Math.PI / 180;
        return {
            centro: largura / 2 - (y - topo) * Math.tan(radianos),
            meia: larguraFeixe * (0.05 + 0.45 * t)
        };
    }

    function desenhar(tempo) {
        angulo += (alvoAngulo - angulo) * 0.05;
        feixe.style.setProperty("--ang", `${angulo.toFixed(3)}deg`);

        ctx.clearRect(0, 0, largura, altura);
        for (const p of particulas) {
            p.x += p.vx + Math.sin(tempo / 1800 + p.fase) * 0.08;
            p.y += p.vy;
            if (p.y < -10) { p.y = altura + 10; p.x = Math.random() * largura; }
            if (p.x < -10) p.x = largura + 10;
            if (p.x > largura + 10) p.x = -10;

            const { centro, meia } = feixeEm(p.y);
            const dentro = Math.max(0, 1 - Math.abs(p.x - centro) / meia);
            const brilho = 0.05 + Math.pow(dentro, 1.4) * 0.75;
            const cintilar = 0.75 + Math.sin(tempo / 700 + p.fase) * 0.25;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 228, 185, ${(brilho * cintilar).toFixed(3)})`;
            ctx.fill();
        }

        if (visivel) requestAnimationFrame(desenhar);
        else rodando = false;
    }

    function iniciar() {
        if (rodando) return;
        rodando = true;
        requestAnimationFrame(desenhar);
    }

    new IntersectionObserver(([entrada]) => {
        visivel = entrada.isIntersecting;
        if (visivel) iniciar();
    }).observe(palco);

    if (ponteiroFino) {
        palco.addEventListener("pointermove", e => {
            const caixa = palco.getBoundingClientRect();
            alvoAngulo = (0.5 - (e.clientX - caixa.left) / caixa.width) * 22;
        });
        palco.addEventListener("pointerleave", () => { alvoAngulo = 0; });
    }

    medir();
    window.addEventListener("resize", medir);
    iniciar();
}
