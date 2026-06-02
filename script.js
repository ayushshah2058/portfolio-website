// Hamburger menu toggle
const menuIcon = document.getElementById('menu-icon');
const navbar = document.querySelector('.navbar');

menuIcon.addEventListener('click', () => {
    navbar.classList.toggle('active');
    // Toggle icon between menu and close
    if (navbar.classList.contains('active')) {
        menuIcon.classList.replace('bx-menu', 'bx-x');
    } else {
        menuIcon.classList.replace('bx-x', 'bx-menu');
    }
});

// Close menu when a nav link is clicked
document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', () => {
        navbar.classList.remove('active');
        menuIcon.classList.replace('bx-x', 'bx-menu');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && !menuIcon.contains(e.target)) {
        navbar.classList.remove('active');
        menuIcon.classList.replace('bx-x', 'bx-menu');
    }
});

// Active nav link on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.navbar a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.style.color = '';
        link.style.borderBottomColor = 'transparent';
        if (link.getAttribute('href') === '#' + current) {
            link.style.color = 'var(--main-color)';
            link.style.borderBottomColor = 'var(--main-color)';
        }
    });
});

// ═══════════════════════════════════════
// FORM VALIDATION & SUBMISSION
// ✏️ SETUP: Replace these two values:
const WHATSAPP_NUMBER = '9779844444881'; // Your number without + e.g. 97798XXXXXXXX
// Formspree ID is set in the HTML form action attribute
// ═══════════════════════════════════════

const form = document.getElementById('contactForm');
if (form) {
    const fields = {
        fname:    { el: document.getElementById('fname'),    err: document.getElementById('fname-error') },
        femail:   { el: document.getElementById('femail'),   err: document.getElementById('femail-error') },
        fphone:   { el: document.getElementById('fphone'),   err: document.getElementById('fphone-error') },
        fsubject: { el: document.getElementById('fsubject'), err: document.getElementById('fsubject-error') },
        fmessage: { el: document.getElementById('fmessage'), err: document.getElementById('fmessage-error') },
    };

    // ── Validators ──
    function validateName(val) {
        if (!val.trim()) return 'Full name is required.';
        if (val.trim().length < 5) return 'Name must be at least 5 characters.';
        return '';
    }
    function validateEmail(val) {
        if (!val.trim()) return 'Email is required.';
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(val.trim())) return 'Enter a valid email address.';
        return '';
    }
    function validatePhone(val) {
        if (!val.trim()) return 'Phone number is required.';
        // Strip spaces, dashes, parentheses
        const digits = val.replace(/[\s\-\(\)\+]/g, '');
        if (!/^\d+$/.test(digits)) return 'Phone must contain numbers only.';
        if (digits.length < 7 || digits.length > 15) return 'Enter a valid phone number with country code (e.g. +977 98XXXXXXXX).';
        return '';
    }
    function validateSubject(val) {
        if (!val.trim()) return 'Subject is required.';
        return '';
    }
    function validateMessage(val) {
        if (!val.trim()) return 'Message is required.';
        if (val.trim().length < 10) return 'Message must be at least 10 characters.';
        return '';
    }

    const validators = {
        fname: validateName,
        femail: validateEmail,
        fphone: validatePhone,
        fsubject: validateSubject,
        fmessage: validateMessage,
    };

    // ── Show / clear error ──
    function showError(key, msg) {
        const { el, err } = fields[key];
        err.textContent = msg;
        el.classList.add('input-invalid');
        el.classList.remove('input-valid');
    }
    function clearError(key) {
        const { el, err } = fields[key];
        err.textContent = '';
        el.classList.remove('input-invalid');
        el.classList.add('input-valid');
    }

    // ── Live validation on blur ──
    Object.keys(fields).forEach(key => {
        fields[key].el.addEventListener('blur', () => {
            const msg = validators[key](fields[key].el.value);
            msg ? showError(key, msg) : clearError(key);
            updateWhatsAppLink();
        });
        fields[key].el.addEventListener('input', () => {
            if (fields[key].el.classList.contains('input-invalid')) {
                const msg = validators[key](fields[key].el.value);
                msg ? showError(key, msg) : clearError(key);
            }
            updateWhatsAppLink();
        });
    });

    // ── Validate all, return true if all pass ──
    function validateAll() {
        let valid = true;
        Object.keys(fields).forEach(key => {
            const msg = validators[key](fields[key].el.value);
            if (msg) { showError(key, msg); valid = false; }
            else { clearError(key); }
        });
        return valid;
    }

    // ── WhatsApp link builder ──
    function updateWhatsAppLink() {
        const name    = fields.fname.el.value.trim();
        const email   = fields.femail.el.value.trim();
        const phone   = fields.fphone.el.value.trim();
        const subject = fields.fsubject.el.value.trim();
        const message = fields.fmessage.el.value.trim();

        const text = `Hello Ayush! \n\nName: ${name || '—'}\nEmail: ${email || '—'}\nPhone: ${phone || '—'}\nSubject: ${subject || '—'}\n\nMessage:\n${message || '—'}`;
        const encoded = encodeURIComponent(text);
        document.getElementById('whatsappBtn').href =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    }

    // Initialize WhatsApp link
    updateWhatsAppLink();

    // ── Form submit → Formspree ──
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        document.getElementById('form-success').style.display = 'none';
        document.getElementById('form-error-global').style.display = 'none';

        if (!validateAll()) return;

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.value = 'Sending…';
        submitBtn.disabled = true;

        try {
            const data = new FormData(form);
            const res = await fetch(form.action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
                document.getElementById('form-success').style.display = 'block';
                form.reset();
                Object.keys(fields).forEach(k => {
                    fields[k].el.classList.remove('input-valid', 'input-invalid');
                    fields[k].err.textContent = '';
                });
                updateWhatsAppLink();
            } else {
                document.getElementById('form-error-global').style.display = 'block';
            }
        } catch {
            document.getElementById('form-error-global').style.display = 'block';
        } finally {
            submitBtn.value = 'Send Message';
            submitBtn.disabled = false;
        }
    });
}


//Scamble text animation
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const elements = document.querySelectorAll(".scramble-text");

elements.forEach((element) => {
    const originalText = element.textContent;
    let iteration = 0;

    const interval = setInterval(() => {
        element.textContent = originalText
            .split("")
            .map((letter, index) => {
                if (index < iteration) {
                    return originalText[index];
                }
                return letters[Math.floor(Math.random() * 26)];
            })
            .join("");

        if (iteration >= originalText.length) {
            clearInterval(interval);
        }

        iteration += 1 / 3;
    },20 );
});