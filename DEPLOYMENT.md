# Despliegue BIO-REC en cPanel con Node.js

Esta guia resume el despliegue real del sitio BIO-REC en cPanel como aplicacion Node.js.

Configuracion definida en el hosting:

- Dominio: `bio-rec.com`
- Application root: `biorec-app`
- Startup file: `server.js`
- Node.js: `20.20.2`
- Modo: `Production`
- Variable de entorno: `NODE_ENV=production`
- Base de datos: no aplica
- Correos: no integrados todavia en la aplicacion

## A. Preparacion local

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Verificar que la aplicacion inicie:

   ```bash
   npm start
   ```

3. Abrir el sitio local de prueba:

   ```text
   http://localhost:3000
   ```

4. Revisar que no existan errores en la consola del servidor ni del navegador.
5. Revisar navegacion, imagenes, mapa, footer, responsive y formulario.
6. Confirmar que no se suban archivos sensibles:

   ```bash
   git status
   ```

7. Hacer commit y push a GitHub solo si la validacion local esta correcta. No hacer force push.

   ```bash
   git add .
   git commit -m "Prepare BIO-REC for cPanel Node.js deployment"
   git push
   ```

## B. Configuracion en hosting/cPanel

1. Entrar a cPanel.
2. Abrir la seccion de aplicaciones Node.js, Node.js App o Setup Node.js App.
3. Crear o revisar la aplicacion Node.js del sitio.
4. Confirmar la version de Node.js:

   ```text
   20.20.2
   ```

5. Confirmar el modo:

   ```text
   Production
   ```

6. Confirmar el Application root:

   ```text
   biorec-app
   ```

7. Confirmar el Startup file:

   ```text
   server.js
   ```

8. Confirmar la variable de entorno:

   ```text
   NODE_ENV=production
   ```

9. Clonar el repositorio dentro de `biorec-app` o subir ahi los archivos del proyecto:

   ```bash
   git clone https://github.com/raptor-girl/Bio-rec-web.git .
   ```

   Si la carpeta no esta vacia, usar el flujo de Git indicado por el hosting o subir los archivos manualmente, cuidando que `server.js`, `package.json`, `package-lock.json` y `public/` queden en la raiz de `biorec-app`.

10. Desde la terminal del hosting, entrar a `biorec-app` y ejecutar:

   ```bash
   npm install --omit=dev
   ```

11. Reiniciar la aplicacion Node.js desde cPanel.
12. Abrir el dominio para confirmar que la app responde:

   ```text
   https://bio-rec.com
   ```

## C. Configuracion de dominio

1. Confirmar que `bio-rec.com` apunta al hosting mediante los nameservers o registros DNS indicados por el proveedor.
2. Confirmar que `www.bio-rec.com` apunta al mismo hosting.
3. Verificar que el dominio principal resuelva correctamente:

   ```text
   https://bio-rec.com
   ```

4. Verificar que `www` tambien resuelva correctamente:

   ```text
   https://www.bio-rec.com
   ```

5. Activar SSL gratis desde cPanel o desde el panel del hosting.
6. Forzar HTTPS si el hosting entrega esa opcion.
7. Esperar la propagacion DNS si el dominio fue creado o modificado recientemente.

## D. Validaciones posteriores

1. Abrir `https://bio-rec.com`.
2. Abrir `https://www.bio-rec.com`.
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

10. Confirmar que la aplicacion no usa base de datos.
11. Confirmar que no se subieron `.env` ni `node_modules`.

## Checklist de seguridad inicial

- SSL activo.
- HTTP redirige a HTTPS.
- No existe `.env` publico.
- No se subio `node_modules`.
- No hay credenciales en GitHub.
- No hay rutas locales del computador en HTML, CSS, JavaScript o servidor.
- No se usa base de datos.
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
