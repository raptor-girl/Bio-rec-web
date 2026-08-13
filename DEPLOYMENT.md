# Despliegue BIO-REC en hosting Node.js

Esta guia prepara el sitio BIO-REC para un hosting compartido con soporte de App Node.js, terminal, SSL gratis, dominio nuevo y correos gestionados desde cPanel o un panel similar.

## A. Preparacion local

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Verificar que la aplicacion inicie:

   ```bash
   npm start
   ```

3. Abrir el sitio local:

   ```text
   http://localhost:3000
   ```

4. Revisar que no existan errores en consola del navegador.
5. Revisar navegacion, imagenes, mapa, footer, responsive y formulario.
6. Confirmar que no se suban archivos sensibles:

   ```bash
   git status
   ```

7. Hacer commit y push a GitHub solo si la validacion local esta correcta:

   ```bash
   git add .
   git commit -m "Prepare project for Node.js hosting deployment"
   git push
   ```

## B. Configuracion en hosting/cPanel

1. Entrar al panel del hosting.
2. Abrir la seccion de aplicaciones Node.js, Node.js App o Setup Node.js App.
3. Crear una nueva aplicacion Node.js.
4. Seleccionar una version estable de Node.js. Idealmente usar Node 20 LTS o la version LTS mas reciente disponible en el hosting.
5. Definir el modo de la aplicacion como produccion si el panel lo permite.
6. Definir la carpeta raiz de la app apuntando al directorio donde se subira el repositorio.
7. Definir el archivo de inicio:

   ```text
   server.js
   ```

8. Configurar variables de entorno:

   ```text
   NODE_ENV=production
   ```

   No subir ni publicar un archivo `.env` con credenciales.

9. Desde la terminal del hosting, entrar a la carpeta raiz de la app y ejecutar:

   ```bash
   npm install
   ```

10. Reiniciar la aplicacion Node.js desde el panel.
11. Abrir la URL temporal o el dominio configurado para confirmar que la app responde.

## C. Configuracion de dominio

1. Registrar o asociar el dominio nuevo al hosting.
2. Apuntar el dominio al hosting usando los nameservers o registros DNS indicados por el proveedor.
3. Verificar que el dominio principal resuelva correctamente:

   ```text
   https://dominio.cl
   ```

4. Verificar que `www` tambien resuelva correctamente:

   ```text
   https://www.dominio.cl
   ```

5. Activar SSL gratis desde cPanel o desde el panel del hosting.
6. Forzar HTTPS si el hosting entrega esa opcion.
7. Esperar la propagacion DNS si el dominio fue creado o modificado recientemente.

## D. Validaciones posteriores

1. Abrir `https://dominio.cl`.
2. Abrir `https://www.dominio.cl`.
3. Revisar que carguen todas las imagenes.
4. Revisar que el formulario responda correctamente, sin enviar correos reales todavia.
5. Revisar la navegacion principal.
6. Revisar footer, mapa y secciones internas.
7. Revisar responsive en movil y escritorio.
8. Revisar la consola del navegador y corregir cualquier error visible.
9. Confirmar que el endpoint del formulario responda JSON:

   ```text
   POST /contacto
   ```

## Checklist de seguridad inicial

- SSL activo.
- HTTP redirige a HTTPS.
- No existe `.env` publico.
- No se subio `node_modules`.
- No hay credenciales en GitHub.
- Formulario valida datos en frontend y backend.
- Correos configurados con SPF, DKIM y DMARC desde cPanel.
- DMARC inicial recomendado en modo `p=none` para monitoreo.
- Contrasenas seguras para cuentas de correo.
- No usar correos corporativos para envios masivos.

## Estructura esperada en produccion

```text
server.js
package.json
package-lock.json
.env.example
DEPLOYMENT.md
public/
  index.html
  contacto.html
  nosotros.html
  operacion.html
  servicios.html
  css/
    styles.css
  js/
    main.js
  img/
```
