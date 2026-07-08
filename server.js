const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.post('/contacto', (req, res) => {
  const cleanField = (value) => (typeof value === 'string' ? value.trim() : '');

  const contactRequest = {
    nombre: cleanField(req.body.nombre),
    email: cleanField(req.body.email),
    telefono: cleanField(req.body.telefono),
    empresa: cleanField(req.body.empresa),
    ciudad: cleanField(req.body.ciudad),
    servicio: cleanField(req.body.servicio),
    mensaje: cleanField(req.body.mensaje),
  };

  const errors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!contactRequest.nombre) {
    errors.nombre = 'El nombre es obligatorio.';
  }

  if (!contactRequest.email) {
    errors.email = 'El email es obligatorio.';
  } else if (!emailPattern.test(contactRequest.email)) {
    errors.email = 'Ingresa un email válido.';
  }

  if (!contactRequest.mensaje) {
    errors.mensaje = 'El mensaje es obligatorio.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Revisa los campos obligatorios.',
      errors,
    });
  }

  console.log('Nueva solicitud de contacto BIO-REC:', contactRequest);
  // Futuro: integrar envío de correo usando las cuentas configuradas en cPanel.

  return res.json({
    success: true,
    message: 'Solicitud recibida correctamente. Pronto nos pondremos en contacto.',
  });
});

app.listen(port, () => {
  console.log(`BIO-REC LTDA running on http://localhost:${port}`);
});
