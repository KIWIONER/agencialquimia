document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');

    // --- LÓGICA DEL AGENTE IA (CHAT) ---
    const chatTrigger = document.getElementById('chat-trigger');
    const chatWindow = document.getElementById('chat-window');
    const closeChatBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const chatInput = document.getElementById('user-input');
    const chatHistoryDiv = document.getElementById('chat-history');

    // Estado del chat (Memoria a corto plazo)
    let chatHistory = [];

    // Abrir/Cerrar
    if (chatTrigger) {
        chatTrigger.addEventListener('click', () => {
            chatWindow.classList.toggle('hidden');
            if (!chatWindow.classList.contains('hidden')) chatInput.focus();
        });
    }
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => chatWindow.classList.add('hidden'));
    }

    // Hero button opens chat
    const startAgentBtn = document.getElementById('start-agent-btn');
    if (startAgentBtn) {
        startAgentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (chatWindow && chatWindow.classList.contains('hidden')) {
                chatWindow.classList.remove('hidden');
                if (chatInput) chatInput.focus();
            }
        });
    }

    // Nav chat button opens chat
    const navChatBtn = document.getElementById('nav-chat-btn');
    if (navChatBtn) {
        navChatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (chatWindow) {
                chatWindow.classList.toggle('hidden');
                if (!chatWindow.classList.contains('hidden') && chatInput) chatInput.focus();
            }
        });
    }

    // Enviar Mensaje
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // 1. Mostrar mensaje usuario
        addMessageToUI(text, 'user');
        chatInput.value = '';
        chatHistory.push({ role: 'user', content: text });

        // 2. Indicador de "Escribiendo..."
        const loadingId = addMessageToUI('Analizando...', 'bot', true);

        // Nueva ruta directa y segura de producción (sin proxy)
        const webhookUrl = "https://n8n.agencialquimia.com/webhook/audit";

        try {
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // JSON completo y exacto para el Cerebro n8n / Gemini
                body: JSON.stringify({
                    cliente_nombre: "Usuario Web (Chat IA)",
                    cliente_telefono: "No provisto",
                    chatInput: text
                })
            });

            // n8n parece estar enviando la respuesta directamente como texto (String)
            // en lugar de un JSON estructurado. Leemos como texto puro:
            const responseText = await response.text();

            // Si por alguna razón envía JSON (ej: si cambias la conf. en n8n), 
            // intentamos extraer el texto principal, sino, usamos el texto puro devuelto.
            let botReply = responseText;
            try {
                const data = JSON.parse(responseText);
                botReply = data.output || data.text || responseText;
            } catch (e) {
                // Era un texto plano, lo dejamos tal cual (ej: "¡Hola! ¿Lidias con...")
            }

            removeMessage(loadingId);
            addMessageToUI(botReply, 'bot');
            chatHistory.push({ role: 'assistant', content: botReply });

        } catch (error) {
            console.error("Error en el Agente:", error);
            removeMessage(loadingId);
            addMessageToUI("Lo siento, mi conexión neuronal está saturada. Prueba de nuevo en unos segundos.", 'bot');
        }
    }

    // Helpers UI
    function addMessageToUI(text, sender, isLoading = false) {
        const div = document.createElement('div');
        div.classList.add('message', sender === 'bot' ? 'bot-message' : 'user-message');
        div.innerText = text;
        if (isLoading) {
            div.id = 'loading-msg';
            div.style.opacity = '0.7';
            div.style.fontStyle = 'italic';
        }
        chatHistoryDiv.appendChild(div);
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
        return div.id;
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // Chat Listeners
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
            // Close mobile menu after clicking a link
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburgerBtn.classList.remove('active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // --- Hamburger Menu ---
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('active');
            hamburgerBtn.classList.toggle('active');
            hamburgerBtn.setAttribute('aria-expanded', isOpen);
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !hamburgerBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                hamburgerBtn.classList.remove('active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

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
            const correo = document.getElementById('email').value;
            const sector = document.getElementById('sector').value;
            const telefono = document.getElementById('phone').value;
            const mensaje = document.getElementById('process').value;

            // Datos estructurados para n8n > Supabase
            const formData = {
                cliente_nombre: nombre,
                cliente_telefono: telefono,
                motivo: mensaje, // Mapeamos el campo proceso/mensaje aquí
                chatInput: `[NUEVO LEAD - Agencia Alquimia]\nNombre: ${nombre}\nCorreo: ${correo}\nSector: ${sector}\nTeléfono: ${telefono}\nMensaje/Necesidad: ${mensaje}\nFecha: ${new Date().toISOString()}`
            };

            // Nueva función de integración hacia el cerebro n8n
            async function enviarCerebroN8n(datosCliente) {
                // Ruta directa y segura de producción (HTTPS) hacia el cerebro n8n
                const webhookUrl = 'https://n8n.agencialquimia.com/webhook/audit';

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
});
