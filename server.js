const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/contacto", (req, res) => {
  const body = req.body || {};
  const nombre = normalizeField(body.nombre);
  const email = normalizeField(body.email);
  const telefono = normalizeField(body.telefono);
  const empresa = normalizeField(body.empresa);
  const ciudad = normalizeField(body.ciudad);
  const servicio = normalizeField(body.servicio);
  const mensaje = normalizeField(body.mensaje);
  const errors = {};

  if (!nombre) {
    errors.nombre = "Ingresa tu nombre.";
  }

  if (!email) {
    errors.email = "Ingresa tu email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Ingresa un email valido.";
  }

  if (!mensaje) {
    errors.mensaje = "Cuentanos brevemente que necesitas.";
  }

  if (nombre.length > 120) {
    errors.nombre = "El nombre es demasiado extenso.";
  }

  if (telefono.length > 40) {
    errors.telefono = "El telefono es demasiado extenso.";
  }

  if (empresa.length > 160) {
    errors.empresa = "La empresa es demasiado extensa.";
  }

  if (ciudad.length > 120) {
    errors.ciudad = "La ciudad es demasiado extensa.";
  }

  if (servicio.length > 160) {
    errors.servicio = "El servicio es demasiado extenso.";
  }

  if (mensaje.length > 2000) {
    errors.mensaje = "El mensaje es demasiado extenso.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      ok: false,
      message: "Revisa los campos obligatorios antes de enviar.",
      errors,
    });
  }

  return res.status(200).json({
    ok: true,
    message: "Solicitud recibida correctamente. Pronto nos pondremos en contacto.",
  });
});

app.use((req, res) => {
  if (req.accepts("html")) {
    return res.status(404).sendFile(path.join(__dirname, "public", "index.html"));
  }

  return res.status(404).json({
    ok: false,
    message: "Ruta no encontrada.",
  });
});

app.listen(PORT, () => {
  console.log(`Servidor BIO-REC ejecutándose en puerto ${PORT}`);
});

function normalizeField(value) {
  return typeof value === "string" ? value.trim() : "";
}
