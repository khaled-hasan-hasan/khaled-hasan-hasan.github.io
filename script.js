/* Progressive enhancement only. Content, navigation and direct email work without JS. */
(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  if (toggle && navigation) {
    const mobile = window.matchMedia('(max-width: 620px)');
    const setOpen = (open) => {
      navigation.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    document.documentElement.classList.add('js-menu');
    toggle.hidden = false;
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    mobile.addEventListener('change', () => setOpen(false));
    // The menu toggle is useful only on small screens; CSS also keeps it out of desktop layout.
    const updateToggle = () => { toggle.hidden = !mobile.matches; };
    updateToggle();
    mobile.addEventListener('change', updateToggle);
  }

  const filters = document.querySelector('.filters');
  if (filters) {
    const cards = Array.from(document.querySelectorAll('#project-grid [data-category]'));
    const count = document.querySelector('#project-count');
    const status = document.querySelector('#filter-status');
    filters.hidden = false;
    filters.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      const selected = button.dataset.filter;
      let visible = 0;
      cards.forEach((card) => {
        card.hidden = selected !== 'all' && card.dataset.category !== selected;
        if (!card.hidden) visible += 1;
      });
      filters.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      count.textContent = String(visible);
      status.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'} shown. Filter: ${button.textContent}.`;
    });
  }

  const copyButton = document.querySelector('.copy-email');
  if (copyButton && navigator.clipboard && window.isSecureContext) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      const status = document.querySelector('#copy-status');
      try {
        await navigator.clipboard.writeText(copyButton.dataset.email);
        status.textContent = 'Email address copied.';
      } catch {
        status.textContent = 'Copy was unavailable. Select and copy the email address above.';
      }
    });
  }

  const composer = document.querySelector('#email-composer');
  const form = document.querySelector('#inquiry-form');
  if (composer && form) {
    composer.hidden = false;
    const draft = document.querySelector('#email-draft');
    const status = document.querySelector('#draft-status');
    form.addEventListener('input', () => {
      draft.hidden = true;
      draft.removeAttribute('href');
      status.textContent = '';
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const service = form.elements.service.value;
      const timeline = form.elements.timeline.value.trim();
      const brief = form.elements.brief.value.trim();
      if (brief.length < 15) {
        status.textContent = 'Please include at least 15 characters of project context.';
        form.elements.brief.focus();
        return;
      }
      const body = `Hi Khaled,\n\nI would like to discuss ${service.toLowerCase()}.\n\n${brief}\n\nTarget date: ${timeline || 'To be discussed'}\n\nThanks,`;
      draft.href = `mailto:khaled.habdo@gmail.com?subject=${encodeURIComponent(`Project inquiry — ${service}`)}&body=${encodeURIComponent(body)}`;
      draft.hidden = false;
      status.textContent = 'Draft prepared below. Open it in your email app to review and send. Nothing has been submitted.';
      draft.focus();
    });
  }
})();
