document.addEventListener('DOMContentLoaded', () => {
    // Heading Typing Effect (DYNAMIC — types, pauses, deletes, then retypes)
    const typeHeadings = document.querySelectorAll('.type-heading');

    typeHeadings.forEach(heading => {
        const partsData = Array.from(heading.querySelectorAll('[data-text]')).map(el => ({
            el,
            text: el.getAttribute('data-text')
        }));
        const totalLength = partsData.reduce((sum, p) => sum + p.text.length, 0);

        let index = 0;
        let deleting = false;

        function render(upTo) {
            let remaining = upTo;
            partsData.forEach(p => {
                if (remaining <= 0) {
                    p.el.textContent = '';
                } else if (remaining >= p.text.length) {
                    p.el.textContent = p.text;
                    remaining -= p.text.length;
                } else {
                    p.el.textContent = p.text.substring(0, remaining);
                    remaining = 0;
                }
            });
        }

        function tick() {
            render(index);

            if (!deleting) {
                if (index < totalLength) {
                    index++;
                    setTimeout(tick, 65);
                } else {
                    deleting = true;
                    setTimeout(tick, 1800); // pause at full heading
                }
            } else {
                if (index > 0) {
                    index--;
                    setTimeout(tick, 40);
                } else {
                    deleting = false;
                    setTimeout(tick, 500); // pause before retyping
                }
            }
        }

        tick();
    });

    // Subtitle Typing Effect (STATIC — types once, then stays fixed)
    const typedElements = document.querySelectorAll('.typed-text');

    typedElements.forEach(el => {
        const line = el.getAttribute('data-text') || 'Empowering Minds, Illuminating Futures.';
        let charIndex = 0;

        function typeOnce() {
            if (charIndex <= line.length) {
                el.textContent = line.substring(0, charIndex);
                charIndex++;
                setTimeout(typeOnce, 70);
            } else {
                const cursor = el.parentElement.querySelector('.typed-cursor');
                if (cursor) cursor.style.visibility = 'hidden';
            }
        }

        typeOnce();
    });

    // Multi-Step Admission Form
    const admissionForm = document.getElementById('admissionForm');

    if (admissionForm) {
        const formSteps = document.querySelectorAll('.form-step');
        const indicatorSteps = document.querySelectorAll('.step-indicator .step');

        function goToStep(stepNum) {
            formSteps.forEach(s => {
                s.classList.toggle('active', s.getAttribute('data-step') === String(stepNum));
            });
            indicatorSteps.forEach(s => {
                const sNum = parseInt(s.getAttribute('data-step'));
                s.classList.toggle('active', sNum === stepNum);
                s.classList.toggle('completed', sNum < stepNum);
            });
            admissionForm.closest('.admission-form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', () => {
                const currentStep = btn.closest('.form-step');
                const fields = currentStep.querySelectorAll('input[required], select[required]');
                let firstInvalid = null;

                fields.forEach(field => {
                    if (!field.checkValidity() && !firstInvalid) {
                        firstInvalid = field;
                    }
                });

                if (firstInvalid) {
                    firstInvalid.reportValidity();
                    return;
                }

                const next = parseInt(currentStep.getAttribute('data-step')) + 1;
                goToStep(next);
            });
        });

        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', () => {
                const currentStep = btn.closest('.form-step');
                const prev = parseInt(currentStep.getAttribute('data-step')) - 1;
                goToStep(prev);
            });
        });

        admissionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            goToStep(5);
        });
    }

    // Animated Counting for Stats Section
    const statsSection = document.querySelector('.stats');

    if (statsSection) {
        const statNumbers = statsSection.querySelectorAll('.stat-card h3');
        let hasAnimated = false;

        function animateCounter(el) {
            const text = el.textContent.trim();
            const match = text.match(/^([\d,]+)(.*)$/);
            if (!match) return;

            const target = parseInt(match[1].replace(/,/g, ''), 10);
            const suffix = match[2];
            const duration = 1500;
            const steps = 50;
            const increment = target / steps;
            const stepTime = duration / steps;
            let current = 0;

            el.textContent = '0' + suffix;

            function update() {
                current += increment;
                if (current < target) {
                    el.textContent = Math.floor(current).toLocaleString() + suffix;
                    setTimeout(update, stepTime);
                } else {
                    el.textContent = target.toLocaleString() + suffix;
                }
            }

            update();
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    statNumbers.forEach(animateCounter);
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });

        observer.observe(statsSection);
    }

    // Admission Multi-Step Form Wizard
    const wizardSteps = document.querySelectorAll('.step-content');
    const progressItems = document.querySelectorAll('.step-item');
    const progressLines = document.querySelectorAll('.step-line');

    function goToStep(stepNum) {
        wizardSteps.forEach(step => {
            step.style.display = (parseInt(step.dataset.step) === stepNum) ? 'block' : 'none';
        });
        progressItems.forEach(item => {
            const itemStep = parseInt(item.dataset.step);
            item.classList.remove('active', 'completed');
            if (itemStep === stepNum) item.classList.add('active');
            else if (itemStep < stepNum) item.classList.add('completed');
        });
        progressLines.forEach((line, index) => {
            line.classList.toggle('completed', index < stepNum - 1);
        });
    }

    // Gathers every admission field into one plain object, ready to save to a database.
    function collectAdmissionFormData() {
        const val = (id) => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        };
        return {
            fullName: val('fullName'),
            fatherName: val('fatherName'),
            dob: val('dob'),
            gender: val('gender'),
            email: val('email'),
            phone: val('phone'),
            address: val('address'),
            guardianName: val('guardianName'),
            guardianPhone: val('guardianPhone'),
            guardianRelation: val('guardianRelation'),
            course: val('course'),
            shift: val('shift'),
            submittedAt: new Date().toISOString()
        };
    }

    if (wizardSteps.length > 0) {
        document.querySelectorAll('.wizard-next').forEach(btn => {
            btn.addEventListener('click', () => {
                const currentStep = btn.closest('.step-content');
                const requiredFields = currentStep.querySelectorAll('input[required], select[required]');
                const invalidField = Array.from(requiredFields).find(field => !field.checkValidity());
                if (invalidField) {
                    invalidField.reportValidity();
                    invalidField.focus();
                    return;
                }

                const next = parseInt(currentStep.dataset.step) + 1;

                // Final step (Course & Shift → Complete): the application MUST be saved to the
                // database before we show "Application Received!" — never show success if it wasn't saved.
                if (next === 5) {
                    if (typeof window.saveAdmissionToDatabase !== 'function') {
                        console.error('saveAdmissionToDatabase is missing — is supabase-config.js loaded in admission.html?');
                        alert('Admission system is not available right now. Please contact the institute directly.');
                        return;
                    }

                    const originalHtml = btn.innerHTML;
                    btn.disabled = true;
                    btn.innerHTML = 'Submitting... <i class="fas fa-spinner fa-spin"></i>';

                    window.saveAdmissionToDatabase(collectAdmissionFormData())
                        .then(() => goToStep(next))
                        .catch((err) => {
                            console.error('Admission save failed:', err);
                            if (err && err.code === 'DATABASE_NOT_CONFIGURED') {
                                alert('The admission database is not connected yet, so your application was NOT saved.\n\n(Site owner: paste your Supabase Project URL and anon key into supabase-config.js.)');
                            } else {
                                alert('Something went wrong while submitting your application. Please check your internet connection and try again.');
                            }
                        })
                        .finally(() => {
                            btn.disabled = false;
                            btn.innerHTML = originalHtml;
                        });
                } else {
                    goToStep(next);
                }
            });
        });

        document.querySelectorAll('.wizard-back').forEach(btn => {
            btn.addEventListener('click', () => {
                const currentStep = parseInt(btn.closest('.step-content').dataset.step);
                goToStep(currentStep - 1);
            });
        });

        goToStep(1);
    }

    // Mobile Navigation Toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            const isMobileDropdownToggle = window.innerWidth <= 768 && link.classList.contains('dropdown-toggle');
            if (isMobileDropdownToggle && !link.closest('.nav-dropdown').classList.contains('open')) return;
            navLinks.classList.remove('active');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // Hero Background Slideshow
    const heroSlides = document.querySelectorAll('.hero-bg-slide');

    if (heroSlides.length > 0) {
        let currentHeroSlide = 0;

        setInterval(() => {
            heroSlides[currentHeroSlide].classList.remove('active');
            currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
            heroSlides[currentHeroSlide].classList.add('active');
        }, 4000);
    }

    // Contact Form Submission Handling
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalHtml = submitBtn ? submitBtn.innerHTML : '';
            const courseSelect = document.getElementById('courseSelect');

            const showStatus = (text, ok) => {
                formStatus.style.color = ok ? '#10b981' : '#ef4444';
                formStatus.textContent = text;
            };

            if (typeof window.saveContactMessage !== 'function') {
                console.error('saveContactMessage is missing - is supabase-config.js loaded in contact.html?');
                showStatus('Messaging is not available right now. Please contact the institute directly.', false);
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
            }

            window.saveContactMessage({
                fullName: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                course: courseSelect.options[courseSelect.selectedIndex].text,
                message: document.getElementById('message').value.trim()
            })
                .then(() => {
                    showStatus('Thank you! Your message has been sent. We will contact you soon.', true);
                    contactForm.reset();
                    setTimeout(() => { formStatus.textContent = ''; }, 6000);
                })
                .catch((err) => {
                    console.error('Contact message save failed:', err);
                    if (err && err.code === 'DATABASE_NOT_CONFIGURED') {
                        showStatus('Message was NOT sent: the database is not connected yet.', false);
                    } else {
                        showStatus('Something went wrong and your message was not sent. Please check your internet connection and try again.', false);
                    }
                })
                .finally(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalHtml;
                    }
                });
        });
    }
    // Premium dropdown navigation
    document.querySelectorAll('.nav-dropdown > .dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const parent = toggle.closest('.nav-dropdown');
                const wasOpen = parent.classList.contains('open');

                document.querySelectorAll('.nav-dropdown.open').forEach(item => {
                    if (item !== parent) item.classList.remove('open');
                });

                // On mobile, first tap opens the popup; second tap follows the main page link.
                if (!wasOpen) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    parent.classList.add('open');
                }
            }
        });
    });

    // Close dropdowns when tapping elsewhere on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !e.target.closest('.nav-dropdown')) {
            document.querySelectorAll('.nav-dropdown.open').forEach(item => item.classList.remove('open'));
        }
    });

    // ===== Floating "Connect With Us" Multi-Department Agent Widget =====
    (function () {
        // TODO: replace with the institute's real WhatsApp number (country code, no + or spaces)
        const WHATSAPP_NUMBER = '923001234567';

        // ---- Departments: each has its own icon, status, greeting, quick replies & knowledge base ----
        const DEPARTMENTS = [
            {
                id: 'admission',
                name: 'Admission Desk',
                status: 'Online | Response instant',
                icon: 'fa-user-graduate',
                greeting: "Hello! 👋 I'm from the Admission Desk. Ask me about the admission process, fees, required documents, or deadlines.",
                quickReplies: [
                    { q: 'How do I apply for admission?', label: 'Admission process' },
                    { q: 'What are the fees?', label: 'Fees' },
                    { q: 'What documents do I need?', label: 'Documents' },
                    { q: 'Talk to a human agent', label: 'Talk to human' }
                ],
                waMessage: 'Hi! I want to know more about admissions at Spectrum Institute.',
                kb: [
                    { keywords: ['hi', 'hello', 'salam', 'assalam', 'hey'], reply: "Hello! How can I help with your admission today — process, fees, documents, or deadlines?" },
                    { keywords: ['fee', 'fees', 'price', 'cost', 'kitna', 'kitne', 'charges'], reply: "Fees vary by course and duration, so we share the exact breakdown once you pick a program. Want me to connect you with an agent on WhatsApp for the current fee structure?" },
                    { keywords: ['admission', 'apply', 'enroll', 'enrollment', 'form', 'admit', 'process'], reply: "Admission is simple: fill the 4-step form on the Admission page (Personal Info → Contact Info → Guardian Info → Course & Shift) and our team will contact you to confirm enrollment." },
                    { keywords: ['document', 'documents', 'papers', 'cnic', 'id card', 'certificate copy'], reply: "You'll typically need a CNIC/B-Form copy, recent photographs, and your last academic certificate. Exact requirements can vary slightly by course — happy to confirm on WhatsApp." },
                    { keywords: ['deadline', 'last date', 'close', 'seats'], reply: "Admissions are open on a rolling basis with limited seats per shift, so it's best to apply early to secure your preferred timing." },
                    { keywords: ['time', 'timing', 'timings', 'shift', 'shifts', 'morning', 'evening', 'waqt'], reply: "We offer flexible Morning, Evening, and Weekend shifts, so you can study alongside school, college, or a job." },
                    { keywords: ['thanks', 'thank you', 'shukriya', 'ok', 'okay'], reply: "You're welcome! Anything else about your admission I can help with? 😊" },
                    { keywords: ['human', 'agent', 'insan', 'talk', 'representative', 'call'], reply: "Sure — tap 'Chat on WhatsApp' below and an admission officer will assist you personally." }
                ]
            },
            {
                id: 'academics',
                name: 'Academics Desk',
                status: 'Online | Response within minutes',
                icon: 'fa-laptop-code',
                greeting: "Hi there! 🎓 I'm from the Academics Desk. Ask me about our courses, curriculum, duration, or certification.",
                quickReplies: [
                    { q: 'What courses do you offer?', label: 'Courses' },
                    { q: 'How long are the courses?', label: 'Duration' },
                    { q: 'Do I get a certificate?', label: 'Certification' },
                    { q: 'Why should I choose Spectrum?', label: 'Why Spectrum' }
                ],
                waMessage: 'Hi! I have a question about a course at Spectrum Institute.',
                kb: [
                    { keywords: ['hi', 'hello', 'salam', 'assalam', 'hey'], reply: "Hello! Ask me anything about our courses, curriculum, or certifications." },
                    { keywords: ['course', 'courses', 'program', 'programs', 'kaunse', 'kon se', 'konsa', 'konse'], reply: "We currently offer: Cyber Security, Artificial Intelligence, Web Development, Graphic Designing, DIT (Diploma in IT), ICT, and Digital Marketing. Want details on any specific one?" },
                    { keywords: ['duration', 'long', 'months', 'weeks', 'kitne mahine'], reply: "Course duration ranges from a few weeks for short courses to several months for diplomas like DIT — it depends on the program you choose." },
                    { keywords: ['certificate', 'certification', 'diploma', 'degree'], reply: "Yes — every course ends with a certificate you can add to your resume or portfolio, recognized across the industry." },
                    { keywords: ['instructor', 'teacher', 'faculty', 'ustad'], reply: "All our courses are taught by expert instructors with real industry experience, not just theory." },
                    { keywords: ['why', 'best', 'achha', 'acha', 'choose'], reply: "Spectrum Institute focuses on practical, career-focused training with expert instructors, industry-relevant courses, and flexible timings — built to get you job-ready, not just certified." },
                    { keywords: ['thanks', 'thank you', 'shukriya', 'ok', 'okay'], reply: "Glad to help! Let me know if you'd like info on another course. 😊" },
                    { keywords: ['human', 'agent', 'insan', 'talk', 'representative', 'call'], reply: "Sure — tap 'Chat on WhatsApp' below and a course advisor will help you personally." }
                ]
            },
            {
                id: 'support',
                name: 'Support Desk',
                status: 'Available | Ask general questions',
                icon: 'fa-headset',
                greeting: "Hi! 💬 I'm from the Support Desk. Ask me about our location, contact details, or anything else general.",
                quickReplies: [
                    { q: 'Where are you located?', label: 'Location' },
                    { q: 'How can I contact you?', label: 'Contact info' },
                    { q: 'Talk to a human agent', label: 'Talk to human' }
                ],
                waMessage: 'Hi! I have a general question about Spectrum Institute.',
                kb: [
                    { keywords: ['hi', 'hello', 'salam', 'assalam', 'hey'], reply: "Hello! How can I help you today?" },
                    { keywords: ['location', 'address', 'kahan', 'where', 'campus'], reply: "You can find our full address and campus details on the Contact page — or I can connect you to an agent directly on WhatsApp right now." },
                    { keywords: ['contact', 'phone', 'number', 'email', 'reach'], reply: "You can reach us through the form on our Contact page, or chat with us directly on WhatsApp for a faster response." },
                    { keywords: ['thanks', 'thank you', 'shukriya', 'ok', 'okay'], reply: "You're welcome! Feel free to ask if anything else comes up. 😊" },
                    { keywords: ['human', 'agent', 'insan', 'talk', 'representative', 'call'], reply: "Sure — tap 'Chat on WhatsApp' below and one of our team members will assist you personally." }
                ]
            }
        ];

        const FALLBACK = "I'm not fully sure about that one — but I can connect you with a human agent on WhatsApp who'll answer right away.";

        function findReply(dept, text) {
            const t = text.toLowerCase();
            for (const entry of dept.kb) {
                if (entry.keywords.some(k => t.includes(k))) return entry.reply;
            }
            return FALLBACK;
        }

        // ---- Build widget markup ----
        const widget = document.createElement('div');
        widget.className = 'agent-widget';

        const deptListHtml = DEPARTMENTS.map(d => `
            <button type="button" class="agent-dept-item" data-dept="${d.id}">
                <span class="agent-dept-icon"><i class="fas ${d.icon}"></i></span>
                <span class="agent-dept-info">
                    <span class="agent-dept-name">${d.name}</span>
                    <span class="agent-dept-status">${d.status}</span>
                </span>
            </button>
        `).join('');

        widget.innerHTML = `
            <div class="agent-panel">
                <div class="agent-view agent-view-departments active" id="agentDeptView">
                    <div class="agent-dept-header">
                        <h4>Connect With Us</h4>
                        <span>Select a department to start chat</span>
                    </div>
                    <div class="agent-dept-list">${deptListHtml}</div>
                </div>
                <div class="agent-view agent-view-chat" id="agentChatView">
                    <div class="agent-panel-header">
                        <button type="button" class="agent-back-btn" id="agentBackBtn" aria-label="Back to departments"><i class="fas fa-arrow-left"></i></button>
                        <div class="agent-avatar" id="agentActiveAvatar"><i class="fas fa-headset"></i></div>
                        <div>
                            <h4 id="agentActiveName">Support Desk</h4>
                            <span id="agentActiveStatus">Online</span>
                        </div>
                    </div>
                    <div class="agent-chat-area" id="agentChatArea"></div>
                    <div class="agent-quick-replies" id="agentQuickReplies"></div>
                    <form class="agent-input-row" id="agentInputForm">
                        <input type="text" id="agentInput" placeholder="Type your question..." autocomplete="off">
                        <button type="submit" aria-label="Send"><i class="fas fa-paper-plane"></i></button>
                    </form>
                </div>
            </div>
            <button type="button" class="agent-fab" aria-label="Connect with us">
                <i class="fas fa-comment-dots"></i>
                <i class="fas fa-xmark"></i>
                <span class="agent-badge">${DEPARTMENTS.length}</span>
            </button>
        `;
        document.body.appendChild(widget);

        const panel = widget.querySelector('.agent-panel');
        const deptView = widget.querySelector('#agentDeptView');
        const chatView = widget.querySelector('#agentChatView');
        const chatArea = widget.querySelector('#agentChatArea');
        const inputForm = widget.querySelector('#agentInputForm');
        const input = widget.querySelector('#agentInput');
        const quickReplies = widget.querySelector('#agentQuickReplies');
        const backBtn = widget.querySelector('#agentBackBtn');
        const activeAvatar = widget.querySelector('#agentActiveAvatar');
        const activeName = widget.querySelector('#agentActiveName');
        const activeStatus = widget.querySelector('#agentActiveStatus');

        // Per-department chat state, kept in memory so switching departments doesn't lose history.
        const deptState = {};
        DEPARTMENTS.forEach(d => { deptState[d.id] = { greeted: false, history: [] }; });
        let currentDept = null;

        function addMessage(text, sender, persist = true) {
            const msg = document.createElement('div');
            msg.className = `agent-msg agent-msg-${sender}`;
            msg.innerHTML = text;
            chatArea.appendChild(msg);
            chatArea.scrollTop = chatArea.scrollHeight;
            if (persist && currentDept) deptState[currentDept.id].history.push({ text, sender });
        }

        function addWhatsappCta(dept, persist = true) {
            const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(dept.waMessage)}`;
            const html = `Prefer chatting there directly? <a class="agent-inline-link" href="${waLink}" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Chat on WhatsApp</a>`;
            const cta = document.createElement('div');
            cta.className = 'agent-msg agent-msg-bot';
            cta.innerHTML = html;
            chatArea.appendChild(cta);
            chatArea.scrollTop = chatArea.scrollHeight;
            if (persist) deptState[dept.id].history.push({ text: html, sender: 'bot' });
        }

        function showTyping() {
            const typing = document.createElement('div');
            typing.className = 'agent-msg agent-msg-bot agent-typing';
            typing.id = 'agentTyping';
            typing.innerHTML = '<span></span><span></span><span></span>';
            chatArea.appendChild(typing);
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        function removeTyping() {
            const typing = document.getElementById('agentTyping');
            if (typing) typing.remove();
        }

        function renderQuickReplies(dept) {
            quickReplies.innerHTML = dept.quickReplies.map(qr =>
                `<button type="button" data-q="${qr.q}">${qr.label}</button>`
            ).join('');
        }

        function openDepartment(deptId) {
            const dept = DEPARTMENTS.find(d => d.id === deptId);
            if (!dept) return;
            currentDept = dept;

            activeAvatar.innerHTML = `<i class="fas ${dept.icon}"></i>`;
            activeName.textContent = dept.name;
            activeStatus.textContent = dept.status.split('|')[0].trim();
            renderQuickReplies(dept);

            chatArea.innerHTML = '';
            const state = deptState[dept.id];

            deptView.classList.remove('active');
            chatView.classList.add('active');

            if (!state.greeted) {
                state.greeted = true;
                showTyping();
                setTimeout(() => {
                    removeTyping();
                    addMessage(dept.greeting, 'bot');
                }, 500);
            } else {
                state.history.forEach(m => addMessage(m.text, m.sender, false));
            }
        }

        function goBackToDepartments() {
            chatView.classList.remove('active');
            deptView.classList.add('active');
            currentDept = null;
        }

        function handleUserMessage(text) {
            if (!text.trim() || !currentDept) return;
            const dept = currentDept;
            addMessage(text, 'user');
            input.value = '';
            showTyping();
            const reply = findReply(dept, text);
            const isFallback = reply === FALLBACK;
            setTimeout(() => {
                removeTyping();
                addMessage(reply, 'bot');
                if (isFallback) addWhatsappCta(dept);
            }, 700 + Math.random() * 500);
        }

        widget.querySelectorAll('.agent-dept-item').forEach(btn => {
            btn.addEventListener('click', () => openDepartment(btn.dataset.dept));
        });

        backBtn.addEventListener('click', goBackToDepartments);

        inputForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleUserMessage(input.value);
        });

        quickReplies.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-q]');
            if (btn) handleUserMessage(btn.dataset.q);
        });

        widget.querySelector('.agent-fab').addEventListener('click', () => {
            widget.classList.toggle('open');
            if (widget.classList.contains('open') && !chatView.classList.contains('active') && !deptView.classList.contains('active')) {
                deptView.classList.add('active');
            }
        });

        document.addEventListener('click', (e) => {
            if (widget.classList.contains('open') && !widget.contains(e.target)) {
                widget.classList.remove('open');
            }
        });
    })();

});