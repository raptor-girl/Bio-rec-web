document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('#nav-menu');
  const navLinks = document.querySelectorAll('a[href^="#"]');
  const contactForm = document.querySelector('#contact-form');
  const formStatus = document.querySelector('#form-status');

  const initChileMap = () => {
    const map = document.querySelector('[data-chile-map]');
    const status = document.querySelector('[data-map-status]');

    if (!map) {
      return;
    }

    const regions = Array.from(map.querySelectorAll('.map-region.is-active[data-map-key], .map-marker[data-map-key]'));
    const rows = Array.from(document.querySelectorAll('[data-map-row]'));
    let selectedKey = null;

    if (regions.length === 0 || rows.length === 0) {
      return;
    }

    const getRegionByKey = (key) => regions.find((region) => region.dataset.mapKey === key);
    const getRowByKey = (key) => rows.find((row) => row.dataset.mapRow === key);

    const updateStatus = (key) => {
      if (!status) {
        return;
      }

      const region = getRegionByKey(key);

      if (!region) {
        status.textContent = '';
        return;
      }

      status.textContent = `${region.dataset.region}: ${region.dataset.detail}`;
    };

    const setActive = (key, persist = false) => {
      if (!key) {
        return;
      }

      regions.forEach((region) => {
        region.classList.toggle('is-selected', region.dataset.mapKey === key);
      });

      rows.forEach((row) => {
        const isActive = row.dataset.mapRow === key;

        row.classList.toggle('is-active', isActive);
        row.setAttribute('aria-pressed', String(persist && isActive));
      });

      updateStatus(key);
    };

    const clearActive = (force = false) => {
      if (selectedKey && !force) {
        setActive(selectedKey, true);
        return;
      }

      selectedKey = null;

      regions.forEach((region) => {
        region.classList.remove('is-selected');
      });

      rows.forEach((row) => {
        row.classList.remove('is-active');
        row.setAttribute('aria-pressed', 'false');
      });

      if (status) {
        status.textContent = '';
      }
    };

    const toggleSelected = (key) => {
      if (selectedKey === key) {
        clearActive(true);
        return;
      }

      selectedKey = key;
      setActive(key, true);
    };

    regions.forEach((region) => {
      const key = region.dataset.mapKey;

      region.addEventListener('mouseenter', () => {
        if (!selectedKey) {
          setActive(key);
        }
      });

      region.addEventListener('mouseleave', () => {
        clearActive();
      });

      region.addEventListener('focus', () => {
        setActive(key);
      });

      region.addEventListener('blur', () => {
        clearActive();
      });

      region.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleSelected(key);
      });
    });

    rows.forEach((row) => {
      const key = row.dataset.mapRow;

      row.addEventListener('mouseenter', () => {
        if (!selectedKey) {
          setActive(key);
        }
      });

      row.addEventListener('mouseleave', () => {
        clearActive();
      });

      row.addEventListener('focus', () => {
        setActive(key);
      });

      row.addEventListener('blur', () => {
        clearActive();
      });

      row.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleSelected(key);
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        clearActive(true);
      }
    });

    document.addEventListener('click', (event) => {
      const clickedMap = map.contains(event.target);
      const clickedRow = rows.some((row) => row.contains(event.target));

      if (!clickedMap && !clickedRow) {
        clearActive(true);
      }
    });
  };

  initChileMap();

  const closeMenu = () => {
    if (!menuToggle || !navMenu) {
      return;
    }

    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
  };

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');

      menuToggle.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');

      if (!targetId || targetId === '#') {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();
      closeMenu();

      if (targetId === '#inicio') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        return;
      }

      const headerHeight = header ? header.offsetHeight : 0;
      const scrollTarget = target.querySelector('.container') || target;
      const targetPosition = Math.max(
        0,
        scrollTarget.getBoundingClientRect().top + window.scrollY - headerHeight
      );

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    });
  });

  if (!contactForm || !formStatus) {
    return;
  }

  const requiredMessages = {
    nombre: 'Ingresa tu nombre.',
    email: 'Ingresa tu email.',
    mensaje: 'Cuéntanos brevemente qué necesitas.',
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fieldNames = ['nombre', 'email', 'telefono', 'empresa', 'ciudad', 'servicio', 'mensaje'];
  const getField = (name) => contactForm.elements.namedItem(name);

  const setFieldError = (name, message = '') => {
    const field = getField(name);
    const error = document.querySelector(`#${name}-error`);

    if (!field || !error) {
      return;
    }

    field.classList.toggle('is-invalid', Boolean(message));
    field.setAttribute('aria-invalid', String(Boolean(message)));
    error.textContent = message;
  };

  const clearStatus = () => {
    formStatus.textContent = '';
    formStatus.className = 'form-status';
  };

  const showStatus = (message, type) => {
    formStatus.textContent = message;
    formStatus.className = `form-status is-visible is-${type}`;
  };

  const validateForm = () => {
    const errors = {};
    const nombre = getField('nombre').value.trim();
    const email = getField('email').value.trim();
    const mensaje = getField('mensaje').value.trim();

    if (!nombre) {
      errors.nombre = requiredMessages.nombre;
    }

    if (!email) {
      errors.email = requiredMessages.email;
    } else if (!emailPattern.test(email)) {
      errors.email = 'Ingresa un email válido.';
    }

    if (!mensaje) {
      errors.mensaje = requiredMessages.mensaje;
    }

    fieldNames.forEach((name) => {
      setFieldError(name, errors[name]);
    });

    return errors;
  };

  contactForm.addEventListener('input', (event) => {
    const field = event.target;

    if (!field.name) {
      return;
    }

    setFieldError(field.name);
    clearStatus();
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearStatus();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      showStatus('Revisa los campos obligatorios antes de enviar.', 'error');
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    try {
      const response = await fetch('/contacto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.errors) {
          Object.entries(result.errors).forEach(([name, message]) => {
            setFieldError(name, message);
          });
        }

        showStatus(result.message || 'No pudimos enviar la solicitud. Revisa los datos e intenta nuevamente.', 'error');
        return;
      }

      showStatus(result.message, 'success');
      contactForm.reset();
    } catch (error) {
      showStatus('No pudimos conectar con el servidor. Intenta nuevamente en unos minutos.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
});
