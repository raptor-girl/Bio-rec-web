document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('#nav-menu');
  const navLinks = document.querySelectorAll('a[href^="#"]');
  const contactForm = document.querySelector('#contact-form');
  const formStatus = document.querySelector('#form-status');

  const initChileMap = () => {
    const strip = document.querySelector('.presence-strip');
    const map = document.querySelector('[data-chile-map]');
    const status = document.querySelector('[data-map-status]');

    if (!strip || !map) {
      return;
    }

    const regions = Array.from(map.querySelectorAll('.has-presence[data-map-key]'));
    const rows = Array.from(document.querySelectorAll('[data-map-row]'));
    let selectedKey = null;

    if (regions.length === 0 || rows.length === 0) {
      return;
    }

    const getRegionByKey = (key) => regions.find((region) => region.dataset.mapKey === key);
    const getRowByKey = (key) => rows.find((row) => row.dataset.mapRow === key);

    // Líneas segmentadas que conectan cada región con presencia a su fila de cobertura.
    const svgNS = 'http://www.w3.org/2000/svg';
    const overlay = document.createElementNS(svgNS, 'svg');
    const links = new Map();

    overlay.classList.add('map-links');
    overlay.setAttribute('aria-hidden', 'true');

    regions.forEach((region) => {
      const line = document.createElementNS(svgNS, 'path');
      const dot = document.createElementNS(svgNS, 'circle');

      line.classList.add('map-link');
      dot.classList.add('map-link-dot');
      dot.setAttribute('r', '3');
      overlay.append(line, dot);
      links.set(region.dataset.mapKey, { line, dot });
    });

    strip.appendChild(overlay);

    const drawLinks = () => {
      if (getComputedStyle(overlay).display === 'none') {
        return;
      }

      const stripRect = strip.getBoundingClientRect();

      overlay.setAttribute('viewBox', `0 0 ${stripRect.width} ${stripRect.height}`);

      regions.forEach((region) => {
        const key = region.dataset.mapKey;
        const row = getRowByKey(key);
        const link = links.get(key);

        if (!row || !link) {
          return;
        }

        const regionRect = region.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();
        const x1 = regionRect.right - stripRect.left + 4;
        const y1 = regionRect.top + regionRect.height / 2 - stripRect.top;
        const x2 = rowRect.left - stripRect.left + 6;
        const y2 = rowRect.top + rowRect.height / 2 - stripRect.top;

        // Codo estilo diagrama de tablas SQL: tramo horizontal, vertical y
        // horizontal. Las verticales se escalonan según el orden de las filas
        // (la fila más alta lleva la vertical más a la derecha) para que las
        // líneas queden anidadas y nunca se crucen entre sí.
        const rowIndex = rows.indexOf(row);
        const midX = x1 + (x2 - x1) * 0.5 + ((rows.length - 1) / 2 - rowIndex) * 14;

        link.line.setAttribute('d', `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`);
        link.dot.setAttribute('cx', x1);
        link.dot.setAttribute('cy', y1);
      });
    };

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
        const isActive = region.dataset.mapKey === key;

        region.classList.toggle('is-selected', isActive);
        region.setAttribute('aria-pressed', String(persist && isActive));

        // Traer la región al frente para que al agrandarse no quede tapada
        // por las regiones vecinas dibujadas después.
        if (isActive && region.parentNode) {
          region.parentNode.appendChild(region);
        }
      });

      rows.forEach((row) => {
        const isActive = row.dataset.mapRow === key;

        row.classList.toggle('is-active', isActive);
        row.setAttribute('aria-pressed', String(persist && isActive));
      });

      links.forEach((link, linkKey) => {
        const isActive = linkKey === key;

        link.line.classList.toggle('is-active', isActive);
        link.dot.classList.toggle('is-active', isActive);
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
        region.setAttribute('aria-pressed', 'false');
      });

      rows.forEach((row) => {
        row.classList.remove('is-active');
        row.setAttribute('aria-pressed', 'false');
      });

      links.forEach((link) => {
        link.line.classList.remove('is-active');
        link.dot.classList.remove('is-active');
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

      region.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleSelected(key);
        }
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

    drawLinks();
    // Redibujar cuando termina la animación de entrada (fadeUp) y en cambios de tamaño.
    window.addEventListener('load', drawLinks);
    window.setTimeout(drawLinks, 1000);
    strip.addEventListener('animationend', drawLinks, true);
    window.addEventListener('resize', () => {
      window.requestAnimationFrame(drawLinks);
    });

    if ('ResizeObserver' in window) {
      new ResizeObserver(() => drawLinks()).observe(strip);
    }
  };

  initChileMap();

  // Mapa interactivo de la zona central en "Trabajando codo a codo".
  const initRmMap = () => {
    const panel = document.querySelector('[data-rm-map]');

    if (!panel) {
      return;
    }

    const svg = panel.querySelector('.rm-map-svg');
    const stage = panel.querySelector('.rm-map-stage');
    const tooltip = panel.querySelector('[data-rm-tooltip]');
    const status = panel.querySelector('[data-rm-status]');
    const comunas = Array.from(panel.querySelectorAll('.rm-comuna[data-map-key]'));
    const markers = Array.from(panel.querySelectorAll('.rm-marker[data-map-key]'));
    const chips = Array.from(panel.querySelectorAll('[data-map-chip]'));

    if (!svg || comunas.length === 0) {
      return;
    }

    const comunaByKey = (key) => comunas.find((c) => c.dataset.mapKey === key);
    const nameByKey = (key) => {
      const comuna = comunaByKey(key);
      return comuna ? comuna.dataset.name : '';
    };

    let pinnedKey = null;

    // Posiciona el tooltip sobre el centroide de la comuna, convirtiendo
    // las coordenadas del viewBox a píxeles dentro del contenedor.
    const positionTooltip = (comuna) => {
      if (!tooltip || !comuna || !svg.getScreenCTM) {
        return;
      }

      const ctm = svg.getScreenCTM();

      if (!ctm) {
        return;
      }

      const point = svg.createSVGPoint();
      point.x = parseFloat(comuna.dataset.cx);
      point.y = parseFloat(comuna.dataset.cy);

      const screen = point.matrixTransform(ctm);
      const stageRect = stage.getBoundingClientRect();

      tooltip.style.left = `${screen.x - stageRect.left}px`;
      tooltip.style.top = `${screen.y - stageRect.top}px`;
    };

    const apply = (key) => {
      comunas.forEach((comuna) => {
        comuna.classList.toggle('is-active', comuna.dataset.mapKey === key);
        comuna.setAttribute('aria-pressed', String(pinnedKey === comuna.dataset.mapKey));
      });

      markers.forEach((marker) => {
        marker.classList.toggle('is-active', marker.dataset.mapKey === key);
      });

      chips.forEach((chip) => {
        const isActive = chip.dataset.mapChip === key;
        chip.classList.toggle('is-active', isActive);
        chip.setAttribute('aria-pressed', String(pinnedKey === chip.dataset.mapChip));
      });

      // Trae la comuna activa al frente para que su realce no quede tapado.
      const active = comunaByKey(key);

      if (active && active.parentNode) {
        active.parentNode.appendChild(active);
      }

      if (key && tooltip) {
        tooltip.textContent = nameByKey(key);
        positionTooltip(active);
        tooltip.classList.add('is-visible');
      } else if (tooltip) {
        tooltip.classList.remove('is-visible');
      }

      if (status) {
        status.textContent = key ? `${nameByKey(key)}: comuna con experiencia BIO-REC` : '';
      }
    };

    const hoverIn = (key) => {
      if (!pinnedKey) {
        apply(key);
      }
    };

    const hoverOut = () => {
      if (!pinnedKey) {
        apply(null);
      }
    };

    const toggle = (key) => {
      if (pinnedKey === key) {
        pinnedKey = null;
        apply(null);
      } else {
        pinnedKey = key;
        apply(key);
      }
    };

    comunas.forEach((comuna) => {
      const key = comuna.dataset.mapKey;

      comuna.addEventListener('mouseenter', () => hoverIn(key));
      comuna.addEventListener('mouseleave', hoverOut);
      comuna.addEventListener('focus', () => hoverIn(key));
      comuna.addEventListener('blur', hoverOut);
      comuna.addEventListener('click', () => toggle(key));
      comuna.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle(key);
        }
      });
    });

    chips.forEach((chip) => {
      const key = chip.dataset.mapChip;

      chip.addEventListener('mouseenter', () => hoverIn(key));
      chip.addEventListener('mouseleave', hoverOut);
      chip.addEventListener('focus', () => hoverIn(key));
      chip.addEventListener('blur', hoverOut);
      chip.addEventListener('click', () => toggle(key));
    });

    // Al hacer clic fuera del panel se cancela la selección fijada.
    document.addEventListener('click', (event) => {
      if (pinnedKey && !panel.contains(event.target)) {
        pinnedKey = null;
        apply(null);
      }
    });

    window.addEventListener('resize', () => {
      const key = pinnedKey;

      if (key) {
        window.requestAnimationFrame(() => positionTooltip(comunaByKey(key)));
      }
    });
  };

  initRmMap();

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

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearStatus();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      showStatus('Revisa los campos obligatorios antes de enviar.', 'error');
      return;
    }

    // Sitio estático sin backend: para recibir las solicitudes, integrar un
    // servicio de formularios (Formspree, cPanel forms) o un enlace mailto
    // cuando exista una casilla de correo corporativa definida.
    showStatus('Solicitud recibida correctamente. Pronto nos pondremos en contacto.', 'success');
    contactForm.reset();
  });
});
