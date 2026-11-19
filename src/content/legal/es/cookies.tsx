import { legalConfig } from "@/lib/legal/config";
import type { LegalDocument } from "@/lib/legal/types";

export const cookiesDoc: LegalDocument = {
  intro: (
    <p>
      Este aviso explica cómo FitnessMode usa cookies y almacenamiento similar del navegador. Solo
      utilizamos cookies estrictamente necesarias —el sitio funciona sin cookies de publicidad ni
      analítica de terceros—, por lo que no se requiere un banner de consentimiento.
    </p>
  ),
  sections: [
    {
      id: "cookies-we-use",
      title: "Cookies que usamos",
      body: (
        <>
          <p>El sitio utiliza únicamente estas cookies:</p>
          <ul>
            <li>
              <strong>Cookie de sesión de autenticación.</strong> Supabase la instala cuando un
              entrenador inicia sesión; mantiene la sesión activa entre páginas. Es estrictamente
              necesaria: el inicio de sesión no funciona sin ella.
            </li>
            <li>
              <strong>Cookie de idioma.</strong> Recuerda si navegas en inglés o español para poder
              mostrarte el sitio en tu idioma. Es estrictamente necesaria para conservar tu
              preferencia.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "local-storage",
      title: "Almacenamiento del navegador",
      body: (
        <p>
          Tu lista de favoritos se guarda en el localStorage de tu navegador. Permanece en tu
          dispositivo, nunca se envía a nuestros servidores y puedes borrarla en cualquier momento
          desde la configuración de tu navegador.
        </p>
      ),
    },
    {
      id: "no-tracking",
      title: "Sin cookies de seguimiento",
      body: (
        <p>
          No usamos cookies de publicidad, rastreadores de redes sociales ni cookies de analítica de
          terceros. Las estadísticas de visitas y clics que se muestran en los perfiles de los
          entrenadores se registran como datos de primera parte y no contienen direcciones IP.
        </p>
      ),
    },
    {
      id: "managing",
      title: "Gestión de cookies",
      body: (
        <p>
          Puedes bloquear o eliminar las cookies desde la configuración de tu navegador. Ten en
          cuenta que bloquear la cookie de sesión impedirá que los entrenadores inicien sesión, y
          bloquear la cookie de idioma hará que tu preferencia de idioma no se recuerde.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Cambios a este aviso",
      body: (
        <p>
          Podemos actualizar este aviso ocasionalmente. Los cambios se publican en esta página y
          entran en vigor al publicarse; la fecha de «última actualización» anterior muestra la
          versión actual.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contacto",
      body: (
        <p>
          {legalConfig.operatorName} —{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>
        </p>
      ),
    },
  ],
};
