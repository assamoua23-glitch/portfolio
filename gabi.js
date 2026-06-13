/* ================================================================
   SCRIPT.JS — Portfolio Gabriel Assamoua
   Développeur Web Junior — Abidjan, Côte d'Ivoire 🇨🇮
   ----------------------------------------------------------------
   PLAN DU FICHIER :
   01. Sélection des éléments DOM
   02. Curseur personnalisé (suivi souris)
   03. Navbar — scroll + burger menu mobile
   04. Typewriter effect (texte animé dans le hero)
   05. Reveal au scroll (IntersectionObserver)
   06. Animation des barres de compétences
   07. Filtre des projets
   08. Lien actif selon la section visible
   09. Bouton retour en haut (scroll-top)
   10. Formulaire de contact (validation)
   11. Init globale — exécution au chargement
   ================================================================ */

'use strict';

/* ================================================================
   01. SÉLECTION DES ÉLÉMENTS DOM
   — On sélectionne tous les éléments une seule fois ici.
   — Ainsi, si un élément manque dans le HTML, on le voit vite.
   ================================================================ */

const DOM = {
  // Curseur personnalisé
  cursor:      document.getElementById('cursor'),
  cursorTrail: document.getElementById('cursorTrail'),

  // Navigation
  navbar:      document.getElementById('navbar'),
  burger:      document.getElementById('burger'),
  navLinks:    document.getElementById('navLinks'),
  navOverlay:  document.getElementById('navOverlay'),
  allNavLinks: document.querySelectorAll('.nav-link'),

  // Hero
  typedText:   document.getElementById('typedText'),

  // Sections (pour le lien actif)
  sections:    document.querySelectorAll('section[id]'),

  // Compétences
  skillBars:   document.querySelectorAll('.skill-bar'),

  // Projets
  filterBtns:  document.querySelectorAll('.filter-btn'),
  projectCards:document.querySelectorAll('.project-card'),

  // Bouton scroll-top
  scrollTop:   document.getElementById('scrollTop'),

  // Formulaire
  contactForm: document.getElementById('contactForm'),
  formSuccess: document.getElementById('formSuccess'),
  submitBtn:   document.getElementById('submitBtn'),
};


/* ================================================================
   02. CURSEUR PERSONNALISÉ
   — Un cercle orange plein suit la souris avec precision.
   — Un cercle fantôme suit avec un léger retard (effet "aura").
   — Sur les liens/boutons, les deux s'agrandissent.
   ================================================================ */

/**
 * Initialise le curseur personnalisé.
 * On écoute mousemove pour mettre à jour les positions.
 * On écoute mouseenter/mouseleave sur les éléments cliquables.
 */
function initCursor() {
  // Si pas de curseur dans le DOM (peut arriver), on sort
  if (!DOM.cursor || !DOM.cursorTrail) return;

  // Variables pour stocker la position actuelle du curseur
  let mouseX = 0, mouseY = 0;

  // Position du trail (légèrement en retard)
  let trailX = 0, trailY = 0;

  /* ── Mise à jour de la position au mouvement ──────────────────
     On met à jour le curseur principal directement (rapide)
     Le trail est interpolé dans l'animation frame (lent) */
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Curseur principal suit immédiatement
    DOM.cursor.style.left = mouseX + 'px';
    DOM.cursor.style.top  = mouseY + 'px';
  });

  /* ── Interpolation du trail (effet de retard) ─────────────────
     requestAnimationFrame = boucle synchronisée avec le rendu écran
     Le trail se rapproche de la position de la souris à chaque frame */
  function animateTrail() {
    // Interpolation linéaire — le trail "suit" avec 15% de vitesse
    trailX += (mouseX - trailX) * 0.15;
    trailY += (mouseY - trailY) * 0.15;

    DOM.cursorTrail.style.left = trailX + 'px';
    DOM.cursorTrail.style.top  = trailY + 'px';

    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  /* ── Effet hover sur les éléments interactifs ─────────────────
     On sélectionne tous les liens et boutons
     La classe .cursor-hover agrandit le curseur via CSS */
  const interactiveEls = document.querySelectorAll(
    'a, button, .filter-btn, .value-card, .project-card, input, textarea'
  );

  interactiveEls.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      DOM.cursor.classList.add('cursor-hover');
      DOM.cursorTrail.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      DOM.cursor.classList.remove('cursor-hover');
      DOM.cursorTrail.classList.remove('cursor-hover');
    });
  });

  /* ── Masque le curseur quand il quitte la fenêtre ─────────────
     Évite le bug où le curseur reste visible hors fenêtre */
  document.addEventListener('mouseleave', () => {
    DOM.cursor.style.opacity      = '0';
    DOM.cursorTrail.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    DOM.cursor.style.opacity      = '1';
    DOM.cursorTrail.style.opacity = '0.45';
  });
}


/* ================================================================
   03. NAVBAR — Scroll + Burger Menu Mobile
   ================================================================ */

/**
 * Gère l'effet glassmorphism de la navbar au scroll.
 * La classe .scrolled est ajoutée à partir de 60px de scroll.
 */
function initNavbarScroll() {
  if (!DOM.navbar) return;

  const handler = () => {
    // Toggle la classe selon la position de scroll
    DOM.navbar.classList.toggle('scrolled', window.scrollY > 60);
  };

  // { passive: true } = optimisation performance (on ne bloque pas le scroll)
  window.addEventListener('scroll', handler, { passive: true });

  // Appel immédiat pour gérer le cas où la page est déjà scrollée au rechargement
  handler();
}

/* ── État du menu mobile ────────────────────────────────────────
   Variable globale pour savoir si le menu est ouvert ou fermé */
let menuIsOpen = false;

/**
 * Ouvre le menu drawer mobile.
 * Ajoute les classes .open sur le burger, le drawer et l'overlay.
 * Bloque le scroll du body pour éviter le double-scroll.
 */
function openMenu() {
  menuIsOpen = true;

  // Animation burger → croix
  DOM.burger.classList.add('open');
  DOM.burger.setAttribute('aria-expanded', 'true');
  DOM.burger.setAttribute('aria-label', 'Fermer le menu');

  // Drawer glisse depuis la droite
  DOM.navLinks.classList.add('open');

  // Overlay sombre apparaît
  DOM.navOverlay.classList.add('open');
  DOM.navOverlay.setAttribute('aria-hidden', 'false');

  // Bloque le scroll du body (évite le scroll derrière le menu)
  document.body.style.overflow = 'hidden';
}

/**
 * Ferme le menu drawer mobile.
 * Retire toutes les classes .open et débloque le scroll.
 */
function closeMenu() {
  menuIsOpen = false;

  // Croix → burger
  DOM.burger.classList.remove('open');
  DOM.burger.setAttribute('aria-expanded', 'false');
  DOM.burger.setAttribute('aria-label', 'Ouvrir le menu');

  // Drawer repasse hors écran
  DOM.navLinks.classList.remove('open');

  // Overlay disparaît
  DOM.navOverlay.classList.remove('open');
  DOM.navOverlay.setAttribute('aria-hidden', 'true');

  // Débloque le scroll
  document.body.style.overflow = '';
}

/**
 * Initialise tous les listeners du menu mobile.
 */
function initBurgerMenu() {
  if (!DOM.burger || !DOM.navLinks) return;

  // Clic sur le burger = toggle
  DOM.burger.addEventListener('click', () => {
    menuIsOpen ? closeMenu() : openMenu();
  });

  // Clic sur l'overlay = ferme
  if (DOM.navOverlay) {
    DOM.navOverlay.addEventListener('click', closeMenu);
  }

  // Clic sur un lien de nav = ferme + navigue
  DOM.allNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (menuIsOpen) closeMenu();
    });
  });

  // Touche Échap = ferme le menu (accessibilité clavier)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuIsOpen) closeMenu();
  });
}


/* ================================================================
   04. TYPEWRITER EFFECT — Texte animé dans le hero
   ================================================================ */

/**
 * Liste des mots qui s'écrivent et s'effacent en boucle.
 * Modifie ces valeurs pour changer les titres animés.
 */
const TYPED_WORDS = [
  'Développeur Web 💻',
  'Créateur d\'interfaces ✨',
  'Fan de football ⚽',
  'Catholique engagé ✝️',
  'Fier Ivoirien 🇨🇮',
  'Étudiant ODC 🎓',
];

/**
 * Initialise l'effet typewriter sur l'élément #typedText.
 * Algorithme :
 * 1. Écrit le mot lettre par lettre (typeSpeed)
 * 2. Attend (pauseEnd)
 * 3. Efface lettre par lettre (deleteSpeed)
 * 4. Attend (pauseStart)
 * 5. Passe au mot suivant
 */
function initTypewriter() {
  if (!DOM.typedText) return;

  let wordIndex  = 0;   // Index du mot courant dans TYPED_WORDS
  let charIndex  = 0;   // Index du caractère courant dans le mot
  let isDeleting = false; // Est-on en train d'effacer ?

  // Vitesses en ms
  const typeSpeed   = 90;   // Vitesse d'écriture (ms par lettre)
  const deleteSpeed = 50;   // Vitesse d'effacement (ms par lettre)
  const pauseEnd    = 1800; // Pause après écriture complète
  const pauseStart  = 400;  // Pause avant d'écrire le mot suivant

  function tick() {
    const currentWord = TYPED_WORDS[wordIndex];

    if (!isDeleting) {
      // ── Mode écriture ──
      charIndex++;
      DOM.typedText.textContent = currentWord.slice(0, charIndex);

      if (charIndex === currentWord.length) {
        // Mot complet → on attend puis on efface
        isDeleting = true;
        setTimeout(tick, pauseEnd);
        return;
      }

    } else {
      // ── Mode effacement ──
      charIndex--;
      DOM.typedText.textContent = currentWord.slice(0, charIndex);

      if (charIndex === 0) {
        // Mot effacé → on passe au suivant
        isDeleting = false;
        wordIndex  = (wordIndex + 1) % TYPED_WORDS.length;
        setTimeout(tick, pauseStart);
        return;
      }
    }

    // Délai avant la prochaine lettre
    setTimeout(tick, isDeleting ? deleteSpeed : typeSpeed);
  }

  // Démarre après un court délai (laisse le temps au CSS fade-in)
  setTimeout(tick, 1200);
}


/* ================================================================
   05. REVEAL AU SCROLL — IntersectionObserver
   ================================================================ */

/**
 * Initialise l'animation d'entrée des éléments .reveal.
 * Quand un élément entre dans le viewport, la classe .visible
 * lui est ajoutée → la transition CSS s'enclenche.
 *
 * IntersectionObserver est plus performant que l'écoute du scroll
 * (pas de calcul à chaque frame, géré par le navigateur).
 */
function initReveal() {
  // Sélectionne tous les éléments avec la classe .reveal
  const revealEls = document.querySelectorAll('.reveal');

  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // L'élément est visible → on l'anime
          entry.target.classList.add('visible');

          // On arrête d'observer cet élément (optimisation)
          // Il ne "disparaîtra" plus une fois visible
          observer.unobserve(entry.target);
        }
      });
    },
    {
      // rootMargin : zone de déclenchement
      // "-10% 0px" = se déclenche quand l'élément est 10% dans le viewport
      rootMargin: '-10% 0px',
      threshold: 0.1,  // 10% de l'élément visible pour déclencher
    }
  );

  // On observe chaque élément .reveal
  revealEls.forEach((el) => observer.observe(el));
}


/* ================================================================
   06. ANIMATION DES BARRES DE COMPÉTENCES
   ================================================================ */

/**
 * Anime les barres de progression quand elles entrent dans le viewport.
 * Chaque .bar-fill a un --target en CSS custom property.
 * On ajoute la classe .animate qui déclenche la transition CSS.
 *
 * On utilise un IntersectionObserver séparé pour un meilleur contrôle.
 */
function initSkillBars() {
  if (!DOM.skillBars.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Trouve la barre à l'intérieur de cet élément
          const fill = entry.target.querySelector('.bar-fill');
          if (fill) {
            // Petit délai pour que l'animation soit visible après le reveal
            setTimeout(() => {
              fill.classList.add('animate');
            }, 200);
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '-5% 0px', threshold: 0.2 }
  );

  DOM.skillBars.forEach((bar) => observer.observe(bar));
}


/* ================================================================
   07. FILTRE DES PROJETS
   ================================================================ */

/**
 * Gère le filtrage des cartes projets par catégorie.
 * Quand on clique sur un bouton de filtre :
 * 1. Le bouton reçoit la classe .active
 * 2. Les cartes qui ne correspondent pas reçoivent .hidden
 * 3. Les cartes correspondantes perdent .hidden
 *
 * data-filter sur le bouton correspond à data-category sur la carte.
 */
function initProjectFilter() {
  if (!DOM.filterBtns.length || !DOM.projectCards.length) return;

  DOM.filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {

      // ── Met à jour le bouton actif ──
      DOM.filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // ── Récupère le filtre sélectionné ──
      const filter = btn.dataset.filter; // 'all', 'web', 'ui', 'js'

      // ── Affiche/masque les cartes ──
      DOM.projectCards.forEach((card) => {
        const category = card.dataset.category;

        if (filter === 'all' || category === filter) {
          // Carte visible : retire .hidden avec une animation CSS
          card.classList.remove('hidden');
          // Réanime l'entrée avec un petit fade
          card.style.animation = 'none';
          card.offsetHeight;  // Force le reflow pour relancer l'animation
          card.style.animation = '';
        } else {
          // Carte masquée
          card.classList.add('hidden');
        }
      });
    });
  });
}


/* ================================================================
   08. LIEN ACTIF SELON LA SECTION VISIBLE
   ================================================================ */

/**
 * Met à jour le lien de navigation actif selon la section visible.
 * Utilise IntersectionObserver sur chaque section[id].
 *
 * rootMargin: '-40% 0px -55% 0px' = la section doit être dans
 * la "zone centrale" de l'écran (entre 40% et 55% depuis le haut).
 * Cela donne un effet naturel de changement de section.
 */
function initActiveLink() {
  if (!DOM.sections.length || !DOM.allNavLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Retire .active de tous les liens
          DOM.allNavLinks.forEach((link) => link.classList.remove('active'));

          // Trouve et active le lien correspondant à la section visible
          const id   = entry.target.getAttribute('id');
          const link = document.querySelector(`.nav-link[href="#${id}"]`);
          if (link) link.classList.add('active');
        }
      });
    },
    {
      rootMargin: '-40% 0px -55% 0px',
      threshold: 0,
    }
  );

  DOM.sections.forEach((section) => observer.observe(section));
}


/* ================================================================
   09. BOUTON RETOUR EN HAUT
   ================================================================ */

/**
 * Affiche le bouton "scroll-top" après 300px de scroll.
 * Le clic remonte la page en haut avec scroll-behavior: smooth.
 */
function initScrollTop() {
  if (!DOM.scrollTop) return;

  // Affiche/masque selon la position de scroll
  window.addEventListener('scroll', () => {
    DOM.scrollTop.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });

  // Clic → remonte en haut
  DOM.scrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ================================================================
   10. FORMULAIRE DE CONTACT — Validation et envoi simulé
   ================================================================ */

/**
 * Valide un champ et affiche/masque le message d'erreur.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} field  — Le champ à valider
 * @param {string}                              errorId — ID du span d'erreur
 * @param {string}                              message — Message d'erreur
 * @returns {boolean} — true si valide, false sinon
 */
function validateField(field, errorId, message) {
  const errorEl = document.getElementById(errorId);

  // Retire l'état invalide d'abord
  field.classList.remove('invalid');
  if (errorEl) errorEl.textContent = '';

  // Vérifie si le champ est vide
  if (!field.value.trim()) {
    field.classList.add('invalid');
    if (errorEl) errorEl.textContent = message;
    return false;
  }

  return true;
}

/**
 * Valide spécifiquement le format d'un email.
 *
 * @param {HTMLInputElement} emailField — Le champ email
 * @returns {boolean}
 */
function validateEmail(emailField) {
  const errorEl = document.getElementById('emailError');

  // Regex simple mais suffisante pour un email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  emailField.classList.remove('invalid');
  if (errorEl) errorEl.textContent = '';

  if (!emailField.value.trim()) {
    emailField.classList.add('invalid');
    if (errorEl) errorEl.textContent = 'L\'email est requis.';
    return false;
  }

  if (!emailRegex.test(emailField.value.trim())) {
    emailField.classList.add('invalid');
    if (errorEl) errorEl.textContent = 'Format d\'email invalide.';
    return false;
  }

  return true;
}

/**
 * Initialise la validation et la soumission du formulaire de contact.
 *
 * Note : ici on simule l'envoi (pas de backend réel).
 * Pour un vrai envoi, utilise EmailJS, Formspree, ou une API backend.
 */
function initContactForm() {
  if (!DOM.contactForm) return;

  // Références aux champs
  const nameField    = document.getElementById('name');
  const emailField   = document.getElementById('email');
  const subjectField = document.getElementById('subject');
  const messageField = document.getElementById('message');

  /* ── Validation en temps réel (au blur = quand on quitte un champ) ──
     L'erreur disparaît dès que l'utilisateur commence à corriger */
  if (nameField) {
    nameField.addEventListener('blur', () =>
      validateField(nameField, 'nameError', 'Le prénom / nom est requis.')
    );
    // Au focus, retire l'erreur pour ne pas bloquer l'utilisateur
    nameField.addEventListener('focus', () => {
      nameField.classList.remove('invalid');
      const err = document.getElementById('nameError');
      if (err) err.textContent = '';
    });
  }

  if (emailField) {
    emailField.addEventListener('blur', () => validateEmail(emailField));
    emailField.addEventListener('focus', () => {
      emailField.classList.remove('invalid');
      const err = document.getElementById('emailError');
      if (err) err.textContent = '';
    });
  }

  if (subjectField) {
    subjectField.addEventListener('blur', () =>
      validateField(subjectField, 'subjectError', 'Le sujet est requis.')
    );
    subjectField.addEventListener('focus', () => {
      subjectField.classList.remove('invalid');
      const err = document.getElementById('subjectError');
      if (err) err.textContent = '';
    });
  }

  if (messageField) {
    messageField.addEventListener('blur', () =>
      validateField(messageField, 'messageError', 'Le message est requis.')
    );
    messageField.addEventListener('focus', () => {
      messageField.classList.remove('invalid');
      const err = document.getElementById('messageError');
      if (err) err.textContent = '';
    });
  }

  /* ── Soumission du formulaire ─────────────────────────────────
     On valide tous les champs, puis on simule l'envoi */
  DOM.contactForm.addEventListener('submit', (e) => {
    // Empêche le rechargement de page (comportement natif du <form>)
    e.preventDefault();

    // ── Validation de tous les champs ──
    const isNameValid    = validateField(nameField,    'nameError',    'Le prénom / nom est requis.');
    const isEmailValid   = validateEmail(emailField);
    const isSubjectValid = validateField(subjectField, 'subjectError', 'Le sujet est requis.');
    const isMessageValid = validateField(messageField, 'messageError', 'Le message est requis.');

    // Si un champ est invalide, on s'arrête ici
    if (!isNameValid || !isEmailValid || !isSubjectValid || !isMessageValid) {
      // Scroll vers la première erreur
      const firstInvalid = DOM.contactForm.querySelector('.invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus();
      }
      return;
    }

    // ── Simulation d'envoi ──────────────────────────────────────
    // En prod : remplace ce bloc par fetch() vers ton API / EmailJS / Formspree

    // Affiche un état "envoi en cours..." sur le bouton
    if (DOM.submitBtn) {
      DOM.submitBtn.disabled = true;
      DOM.submitBtn.innerHTML = '<i class="ti ti-loader-2" style="animation: spin 1s linear infinite;"></i> Envoi en cours...';
    }

    // Simule un délai réseau (1.5 secondes)
    setTimeout(() => {

      // ── Succès : réinitialise le form + affiche le message ──
      DOM.contactForm.reset();

      if (DOM.submitBtn) {
        DOM.submitBtn.disabled = false;
        DOM.submitBtn.innerHTML = '<i class="ti ti-send"></i> Envoyer le message';
      }

      if (DOM.formSuccess) {
        // Affiche le message de succès
        DOM.formSuccess.classList.add('visible');

        // Le masque après 5 secondes
        setTimeout(() => {
          DOM.formSuccess.classList.remove('visible');
        }, 5000);
      }

      // ── Log pour débogage (retire en production) ──
      console.log('✅ Formulaire soumis avec succès (simulation).');

    }, 1500);
  });
}


/* ================================================================
   KEYFRAME SPIN — pour l'icône de chargement dans le bouton
   Injectée dynamiquement (évite d'alourdir style.css pour si peu)
   ================================================================ */
(function injectSpinKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
})();


/* ================================================================
   11. INIT GLOBALE
   — On appelle toutes les fonctions d'initialisation au chargement.
   — DOMContentLoaded = le HTML est parsé, avant les images.
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  console.log('🇨🇮 Portfolio Gabriel Assamoua — Chargé avec succès !');

  // ── Initialisation dans l'ordre logique ──────────────────────

  initCursor();           // 02 — Curseur personnalisé
  initNavbarScroll();     // 03a — Effet glassmorphism au scroll
  initBurgerMenu();       // 03b — Menu hamburger mobile
  initTypewriter();       // 04 — Texte animé dans le hero
  initReveal();           // 05 — Animations d'entrée au scroll
  initSkillBars();        // 06 — Barres de progression
  initProjectFilter();    // 07 — Filtre des projets
  initActiveLink();       // 08 — Lien actif dans la navbar
  initScrollTop();        // 09 — Bouton retour en haut
  initContactForm();      // 10 — Validation formulaire

  // ── Petite optimisation : prefers-reduced-motion ──────────────
  // Si l'utilisateur a demandé moins d'animations dans son OS,
  // on désactive le typewriter (remplace par le premier mot statique)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (DOM.typedText) {
      DOM.typedText.textContent = 'Développeur Web 💻';
    }
  }

});

/* ── Note pour la production ────────────────────────────────────
   Quand tu seras prêt à déployer :
   1. Remplace l'email gabriel.assamoua@email.com par le vrai
   2. Connecte le formulaire à EmailJS ou Formspree pour de vrais envois
   3. Mets tes vraies URLs GitHub et LinkedIn dans les liens sociaux
   4. Ajoute ta vraie photo dans image/photo.jpg
   5. Pense à minifier ce fichier avec terser ou esbuild
──────────────────────────────────────────────────────────────── */