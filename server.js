const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_FIELD_LENGTHS = {
  nombre: 120,
  email: 160,
  telefono: 40,
  empresa: 160,
  ciudad: 120,
  servicio: 160,
  mensaje: 2000,
};
const SMTP_ENV_KEYS = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASS",
  "CONTACT_TO",
  "CONTACT_FROM",
];

app.disable("x-powered-by");

app.use(express.urlencoded({ extended: false, limit: "20kb" }));
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/contacto", async (req, res) => {
  const contactData = normalizeContactData(req.body || {});
  const errors = validateContactData(contactData);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      ok: false,
      message: "Revisa los campos obligatorios antes de enviar.",
      errors,
    });
  }

  const smtpConfig = getSmtpConfig();

  if (!smtpConfig.ok) {
    console.error(`SMTP no configurado para /contacto. Faltan variables: ${smtpConfig.missing.join(", ")}`);
    return res.status(503).json({
      ok: false,
      message: "No se pudo enviar el mensaje. Intenta nuevamente.",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    await transporter.sendMail({
      from: smtpConfig.from,
      to: smtpConfig.to,
      replyTo: contactData.email,
      subject: "Nueva cotización desde sitio web BIO-REC",
      text: buildContactEmail(contactData),
    });

    return res.status(200).json({
      ok: true,
      message: "Mensaje enviado correctamente.",
    });
  } catch (error) {
    const errorMessage = error && error.message ? error.message : "Error desconocido";
    console.error(`Error enviando formulario de contacto BIO-REC: ${errorMessage}`);
    return res.status(500).json({
      ok: false,
      message: "No se pudo enviar el mensaje. Intenta nuevamente.",
    });
  }
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

function normalizeContactData(body) {
  return {
    nombre: normalizeField(body.nombre),
    email: normalizeField(body.email),
    telefono: normalizeField(body.telefono),
    empresa: normalizeField(body.empresa),
    ciudad: normalizeField(body.ciudad),
    servicio: normalizeField(body.servicio),
    mensaje: normalizeField(body.mensaje),
  };
}

function validateContactData(contactData) {
  const errors = {};

  if (!contactData.nombre) {
    errors.nombre = "Ingresa tu nombre.";
  }

  if (!contactData.email) {
    errors.email = "Ingresa tu email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
    errors.email = "Ingresa un email valido.";
  }

  if (!contactData.mensaje) {
    errors.mensaje = "Cuentanos brevemente que necesitas.";
  }

  Object.entries(MAX_FIELD_LENGTHS).forEach(([field, maxLength]) => {
    if (contactData[field].length > maxLength) {
      errors[field] = getMaxLengthMessage(field);
    }
  });

  return errors;
}

function getMaxLengthMessage(field) {
  const messages = {
    nombre: "El nombre es demasiado extenso.",
    email: "El email es demasiado extenso.",
    telefono: "El telefono es demasiado extenso.",
    empresa: "La empresa es demasiado extensa.",
    ciudad: "La ciudad es demasiado extensa.",
    servicio: "El servicio es demasiado extenso.",
    mensaje: "El mensaje es demasiado extenso.",
  };

  return messages[field] || "El campo es demasiado extenso.";
}

function getSmtpConfig() {
  const missing = SMTP_ENV_KEYS.filter((key) => !normalizeField(process.env[key]));
  const port = Number.parseInt(process.env.SMTP_PORT, 10);

  if (!Number.isInteger(port) || port <= 0) {
    missing.push("SMTP_PORT");
  }

  if (missing.length > 0) {
    return {
      ok: false,
      missing: Array.from(new Set(missing)),
    };
  }

  return {
    ok: true,
    host: process.env.SMTP_HOST,
    port,
    secure: normalizeField(process.env.SMTP_SECURE).toLowerCase() === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    to: process.env.CONTACT_TO,
    from: process.env.CONTACT_FROM,
  };
}

function buildContactEmail(contactData) {
  const sentAt = new Intl.DateTimeFormat("es-CL", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(new Date());

  return [
    "Nueva solicitud recibida desde el formulario web de BIO-REC.",
    "",
    `Nombre: ${contactData.nombre}`,
    `Email: ${contactData.email}`,
    `Telefono: ${formatOptionalField(contactData.telefono)}`,
    `Empresa: ${formatOptionalField(contactData.empresa)}`,
    `Ciudad: ${formatOptionalField(contactData.ciudad)}`,
    `Servicio requerido: ${formatOptionalField(contactData.servicio)}`,
    "Mensaje:",
    contactData.mensaje,
    "",
    `Fecha/hora del envio: ${sentAt}`,
    "Origen: sitio web bio-rec.com",
  ].join("\n");
}

function formatOptionalField(value) {
  return value || "No informado";
}
