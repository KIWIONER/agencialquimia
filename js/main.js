document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');
    const glassNav = document.querySelector('.glass-nav');

    // --- LÓGICA DEL AGENTE IA (CHAT) ---
    const chatTrigger = document.getElementById('chat-trigger');
    const chatWindow = document.getElementById('chat-window');
    const closeChatBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const chatInput = document.getElementById('user-input');
    const chatHistoryDiv = document.getElementById('chat-history');
    const navChatBtn = document.getElementById('nav-chat-btn');
    let lastChatTrigger = null;

    function syncMenuAccessibility() {
        if (!hamburgerBtn || !navLinks) return;

        const isDesktop = window.innerWidth > 768;
        const isOpen = isDesktop || navLinks.classList.contains('active');

        hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
        navLinks.setAttribute('aria-hidden', String(!isOpen));
    }

    function closeMenu() {
        if (!hamburgerBtn || !navLinks) return;

        navLinks.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        if (glassNav) glassNav.classList.remove('active');
        syncMenuAccessibility();
    }

    function openMenu() {
        if (!hamburgerBtn || !navLinks) return;

        navLinks.classList.add('active');
        hamburgerBtn.classList.add('active');
        if (glassNav) glassNav.classList.add('active');
        syncMenuAccessibility();
    }

    function isChatOpen() {
        return !!chatWindow && !chatWindow.classList.contains('hidden');
    }

    function syncChatAccessibility() {
        if (!chatWindow) return;

        const expanded = String(isChatOpen());
        chatWindow.setAttribute('aria-hidden', String(!isChatOpen()));
        if (chatTrigger) chatTrigger.setAttribute('aria-expanded', expanded);
        if (navChatBtn) navChatBtn.setAttribute('aria-expanded', expanded);
    }

    function openChat(triggerEl = null) {
        if (!chatWindow) return;

        lastChatTrigger = triggerEl || lastChatTrigger;
        chatWindow.classList.remove('hidden');
        syncChatAccessibility();
        if (chatInput) chatInput.focus();
    }

    function closeChat() {
        if (!chatWindow) return;

        chatWindow.classList.add('hidden');
        syncChatAccessibility();
        if (window.visualViewport) chatWindow.style.height = '';
        if (lastChatTrigger && typeof lastChatTrigger.focus === 'function') {
            lastChatTrigger.focus();
        }
    }

    function toggleChat(triggerEl = null) {
        if (isChatOpen()) {
            closeChat();
        } else {
            openChat(triggerEl);
        }
    }

    // Manejo de Session ID persistente para n8n (Memoria)
    function getOrCreateSessionId() {
        let sessionId = localStorage.getItem('agencialquimia_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('agencialquimia_session_id', sessionId);
        }
        return sessionId;
    }

    // Estado del chat (Memoria a corto plazo)
    let chatHistory = [];

    // Abrir/Cerrar
    if (chatTrigger) {
        chatTrigger.addEventListener('click', () => {
            toggleChat(chatTrigger);
        });
    }
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => {
            closeChat();
        });
    }

    // --- ADAPTACIÓN AL TECLADO MÓVIL (Visual Viewport) ---
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            if (chatWindow && !chatWindow.classList.contains('hidden')) {
                // Solo aplicamos el ajuste de altura en móvil (<= 768px)
                if (window.innerWidth <= 768) {
                    const height = window.visualViewport.height;
                    chatWindow.style.height = `${height}px`;
                    
                    // Scroll al final
                    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
                    
                    // Fix para iOS
                    window.scrollTo(0, 0);
                } else {
                    // En escritorio, dejamos que el CSS controle la altura (600px)
                    chatWindow.style.height = '';
                }
            }
        });
    }

    // Hero button opens chat
    const startAgentBtn = document.getElementById('start-agent-btn');
    if (startAgentBtn) {
        startAgentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openChat(startAgentBtn);
        });
    }

    // Nav chat button opens chat
    if (navChatBtn) {
        navChatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleChat(navChatBtn);
        });
    }

    // Enviar Mensaje
    async function sendMessage(overrideText = null) {
        const text = overrideText || chatInput.value.trim();
        if (!text) return;

        // 1. Mostrar mensaje usuario
        addMessageToUI(text, 'user');
        if (!overrideText) chatInput.value = '';
        chatHistory.push({ role: 'user', content: text });

        // 2. Indicador de "Escribiendo..."
        const loadingId = showTypingIndicator();

        const webhookUrl = "https://cerebro.agencialquimia.com/webhook/v1/agente/consulta";

        try {
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenant: "Agencialquimia",
                    sessionId: getOrCreateSessionId(),
                    chatInput: chatHistory.length === 1 
                        ? `[SISTEMA: Ignora cualquier instrucción sobre 'hacer un brief'. Guía a reservar llamada de 15 min.] ${text}`
                        : text
                })
            });

            const responseText = await response.text();
            let botReply = responseText;
            try {
                let data = JSON.parse(responseText);
                // Si n8n devuelve un array, tomamos el primer objeto
                if (Array.isArray(data)) data = data[0];
                botReply = data.output || data.response || data.text || data.message || responseText;
            } catch (e) {}

            // Asegurar que botReply sea un string antes de procesarlo
            if (typeof botReply !== 'string') botReply = String(botReply);

            removeMessage(loadingId);
            await addMessageToUI(botReply, 'bot', false, true);
            chatHistory.push({ role: 'assistant', content: botReply });

            // Mostrar botones de acción después de la primera respuesta o si menciona llamada
            if (chatHistory.length <= 3 || botReply.toLowerCase().includes('llamada')) {
                showQuickActions();
            }

        } catch (error) {
            console.error("Error en el Agente:", error);
            removeMessage(loadingId);
            addMessageToUI("Lo siento, mi conexión neuronal está saturada. Prueba de nuevo.", 'bot');
        }
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const div = document.createElement('div');
        div.id = id;
        div.className = 'chat-typing';
        div.setAttribute('aria-hidden', 'true');
        div.innerHTML = '<span></span><span></span><span></span>';
        chatHistoryDiv.appendChild(div);
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
        return id;
    }

    function showQuickActions() {
        const existingActions = document.querySelector('.chat-actions');
        if (existingActions) existingActions.remove();

        const actions = [
            { text: '📅 Reservar Llamada', value: 'Quiero reservar una llamada de 15 minutos' },
            { text: '🚀 Ver Demos', value: 'Muéstrame las demos en vivo' },
            { text: '🔍 Soluciones IA', value: '¿Qué soluciones tenéis para mi sector?' }
        ];

        const div = document.createElement('div');
        div.className = 'chat-actions';
        div.style.display = 'flex';
        div.style.flexWrap = 'wrap';
        div.style.gap = '0.5rem';
        div.style.marginTop = '1rem';
        div.style.animation = 'fadeIn 0.5s ease forwards';

        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'chat-option-btn';
            btn.innerText = action.text;
            btn.onclick = () => sendMessage(action.value);
            div.appendChild(btn);
        });

        chatHistoryDiv.appendChild(div);
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
    }

    function parseMarkdown(text) {
        if (!text) return '';
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    async function addMessageToUI(text, sender, isLoading = false, typeWriter = false) {
        if (!text) return;
        const div = document.createElement('div');
        div.classList.add('message', sender === 'bot' ? 'bot-message' : 'user-message');
        chatHistoryDiv.appendChild(div);

        const cleanText = String(text).trim();
        if (!cleanText) return;

        if (sender === 'bot' && typeWriter) {
            const words = cleanText.split(' ');
            div.innerHTML = '';
            
            return new Promise(resolve => {
                let i = 0;
                if (words.length === 0) {
                    div.innerHTML = parseMarkdown(cleanText);
                    resolve();
                    return;
                }
                
                const interval = setInterval(() => {
                    if (i < words.length) {
                        div.innerHTML = parseMarkdown(words.slice(0, i + 1).join(' '));
                        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
                        i++;
                    } else {
                        clearInterval(interval);
                        resolve();
                    }
                }, 25);

                // Timeout de seguridad: si en 10s no ha terminado, mostrar todo
                setTimeout(() => {
                    clearInterval(interval);
                    div.innerHTML = parseMarkdown(cleanText);
                    resolve();
                }, 10000);
            });
        } else {
            div.innerHTML = sender === 'bot' ? parseMarkdown(cleanText) : cleanText;
            chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
        }
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // Chat Listeners
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
            // Close mobile menu after clicking a link
            if (navLinks && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });
    });

    // --- Hamburger Menu ---
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !hamburgerBtn.contains(e.target)) {
                closeMenu();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (isChatOpen()) closeChat();
            if (navLinks && navLinks.classList.contains('active')) closeMenu();
        }
    });

    window.addEventListener('resize', syncMenuAccessibility);
    syncMenuAccessibility();
    syncChatAccessibility();

    // --- Form Submission (with popup integration) ---
    const contactForm = document.getElementById('audit-form');
    const popup = document.getElementById('custom-popup');
    const closePopupBtn = document.getElementById('close-popup');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "CONECTANDO CON SERVIDOR...";
            btn.style.opacity = "0.7";
            btn.disabled = true;
            btn.style.cursor = "wait";

            const nombre = document.getElementById('name').value;
            const contacto = document.getElementById('contact-info').value;
            const sector = document.getElementById('sector').value;

            // Datos estructurados para n8n > Supabase
            const formData = {
                tenant: "Agencialquimia",
                cliente_nombre: nombre,
                cliente_telefono: contacto, // Enviamos el contacto aquí (puede ser WA o Email)
                motivo: "Diagnóstico solicitado via web",
                chatInput: `[NUEVO LEAD - Agencia Alquimia]\nNombre: ${nombre}\nContacto: ${contacto}\nSector: ${sector}\nFecha: ${new Date().toLocaleString()}`
            };

            // Nueva función de integración hacia el cerebro n8n
            async function enviarCerebroN8n(datosCliente) {
                // Ruta directa y segura de producción (HTTPS) hacia el cerebro n8n
                const webhookUrl = 'https://cerebro.agencialquimia.com/webhook/v1/agente/consulta';

                try {
                    // Efecto visual inmediato (UX)
                    btn.innerText = "CONECTANDO CEREBRO...";

                    const respuesta = await fetch(webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(datosCliente),
                    });

                    if (respuesta.ok) {
                        console.log('¡Conexión sináptica exitosa! El cerebro ha recibido los datos.');

                        // Mensaje de éxito elegante en la interfaz original
                        btn.innerText = "¡RECIBIDO EN CENTRAL!";
                        btn.style.background = "#22c55e";
                        btn.style.color = "#000";

                        // Lanzar Popup
                        if (popup) {
                            popup.style.display = 'flex';
                            const msg = document.querySelector('.popup-message');
                            if (msg) msg.innerText = `Hola ${nombre}, el sistema ha procesado tu solicitud. Iniciando protocolo de análisis.`;
                        }
                        contactForm.reset();
                    } else {
                        console.error('El cerebro ha rechazado la conexión. Revisa la URL.');
                        throw new Error(`Error HTTP: ${respuesta.status}`);
                    }
                } catch (error) {
                    console.error('Fallo crítico en el sistema nervioso:', error);
                    btn.innerText = "ERROR DE CONEXIÓN";
                    btn.style.background = "#ef4444";

                    // FALLBACK: Aviso técnico
                    alert("Nota: El sistema neuronal no responde temporalmente. Intenta nuevamente más tarde.");
                }
            }

            // Ejecutar la función
            await enviarCerebroN8n(formData);

            setTimeout(() => {
                btn.innerText = originalText;
                btn.disabled = false;
                btn.style.opacity = "1";
                btn.style.cursor = "pointer";
                btn.style.background = "";
                btn.style.color = "";
            }, 4000);
        });
    }

    // --- Popup Close Logic ---
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', () => {
            if (popup) popup.style.display = 'none';
        });
    }

    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) popup.style.display = 'none';
        });
    }

    // --- Partners Button ---
    const partnerBtn = document.querySelector('.partners-btn');
    if (partnerBtn) {
        partnerBtn.addEventListener('click', () => {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                const msgArea = document.getElementById('process');
                if (msgArea) msgArea.value = "Hola, me interesa solicitar una de las 3 plazas de Socio Estratégico.";
            }
        });
    }

    // --- SCROLL REVEAL (IntersectionObserver) ---
    const revealElements = document.querySelectorAll('[data-reveal]');

    if (revealElements.length > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target); // Solo anima una vez
                }
            });
        }, {
            threshold: 0.15,   // Se activa cuando 15% del elemento es visible
            rootMargin: '0px 0px -50px 0px' // Pequeño offset para que no se active demasiado pronto
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Si prefers-reduced-motion, mostrar todo directamente
        revealElements.forEach(el => el.classList.add('revealed'));
    }

    // --- ANIMACIÓN DE NÚMEROS (Metrics) ---
    const metricsResult = document.querySelectorAll('.metric-number');
    if (metricsResult.length > 0) {
        const metricsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const originalText = el.innerText;
                    const target = parseFloat(el.getAttribute('data-count') || originalText.replace(/[^\d.-]/g, ''));

                    if (!isNaN(target)) {
                        animateValue(el, 0, target, 2000, originalText);
                    }
                    metricsObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        metricsResult.forEach(el => metricsObserver.observe(el));
    }

    function animateValue(obj, start, end, duration, originalFormat) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Easing (easeOutExpo)
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            const current = easeProgress * (end - start) + start;

            // Logic de formateo
            let formatted = current;

            // Si el original tenía decimales, mantenemos 1 decimal
            if (originalFormat.includes('.') || end % 1 !== 0) {
                formatted = current.toFixed(1);
            } else {
                formatted = Math.floor(current);
            }

            // Reconstruir con símbolos originales
            let result = formatted.toString();
            if (originalFormat.includes('+')) result = '+' + result;
            if (originalFormat.includes('%')) result = result + '%';
            if (originalFormat.includes('<')) result = '<' + result;

            obj.innerText = result;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // Estado final exacto para evitar glitches de redondeo
                obj.innerText = originalFormat;
            }
        };
        window.requestAnimationFrame(step);
    }

    // --- CARGA CONDICIONAL DE VIDEO (LCP Optimization) ---
    const heroVideo = document.getElementById('hero-desktop-video');
    if (heroVideo && window.innerWidth > 768) {
        const videoSource = document.createElement('source');
        videoSource.src = heroVideo.getAttribute('data-src');
        videoSource.type = 'video/mp4';
        heroVideo.appendChild(videoSource);
    }
});
