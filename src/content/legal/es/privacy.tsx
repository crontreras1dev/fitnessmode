import { legalConfig } from "@/lib/legal/config";
import type { LegalDocument } from "@/lib/legal/types";

export const privacyDoc: LegalDocument = {
  intro: (
    <p>
      FitnessMode es un directorio gratuito en línea donde los entrenadores publican un perfil
      público y los visitantes pueden explorarlo y contactarlos directamente. Es operado por{" "}
      {legalConfig.operatorName}. Esta política explica qué datos personales recopilamos cuando usas
      el sitio, por qué los recopilamos y las opciones que tienes.
    </p>
  ),
  sections: [
    {
      id: "who-we-are",
      title: "Quiénes somos",
      body: (
        <p>
          {legalConfig.operatorName} es el responsable del tratamiento de los datos personales
          descritos en esta política (el &quot;responsable del tratamiento&quot; según la ley
          colombiana). Puedes escribirnos a{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a> ante
          cualquier pregunta o solicitud relacionada con privacidad.
        </p>
      ),
    },
    {
      id: "data-we-collect",
      title: "Datos que recopilamos",
      body: (
        <>
          <p>Recopilamos las siguientes categorías de datos:</p>
          <ul>
            <li>
              <strong>Datos de cuenta.</strong> Cuando un entrenador crea una cuenta, guardamos su
              correo electrónico para permitirle iniciar sesión (mediante enlace mágico o Google
              OAuth).
            </li>
            <li>
              <strong>Contenido del perfil.</strong> La información que los entrenadores publican en
              su perfil: nombre visible, titular, biografía, ciudad o ubicación personalizada,
              tarifas, categorías, modalidades y especialidades, idiomas, formación, avatar, fotos
              de galería y enlaces a Instagram, TikTok o un sitio web personal.
            </li>
            <li>
              <strong>Canales de contacto.</strong> Los números de WhatsApp y teléfono se guardan
              para todos los perfiles, pero se muestran públicamente únicamente en perfiles pagos
              (Pro).
            </li>
            <li>
              <strong>Analítica de uso.</strong> Registramos eventos de visitas y clics de primera
              parte en los perfiles de los entrenadores (tipo de evento, destino del clic, dominio
              de referencia y fecha) para alimentar el panel de estadísticas de cada entrenador.
              Estos eventos no contienen direcciones IP, rastreadores de terceros ni cookies de
              analítica.
            </li>
            <li>
              <strong>Datos en el dispositivo.</strong> La lista de favoritos se guarda en el
              localStorage del navegador del visitante y nunca llega a nuestros servidores.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "how-we-use-data",
      title: "Cómo usamos los datos",
      body: (
        <p>
          Usamos los datos anteriores para operar el directorio, mostrar públicamente los perfiles
          de los entrenadores, autenticar las cuentas, generar el panel de estadísticas de cada
          entrenador, prevenir abusos y spam, y operar, mantener y mejorar el servicio.
        </p>
      ),
    },
    {
      id: "legal-bases",
      title: "Bases legales",
      body: (
        <p>
          Cuando la ley exige una base legal (por ejemplo, bajo el GDPR para visitantes de la UE/EEE
          o la Ley 1581 de 2012 en Colombia), tratamos los datos con fundamento en: la ejecución del
          contrato con los entrenadores que crean un perfil; nuestro interés legítimo en operar,
          proteger y mejorar el directorio; y el consentimiento cuando corresponda, el cual puedes
          retirar en cualquier momento.
        </p>
      ),
    },
    {
      id: "sharing",
      title: "Encargados y terceros con quienes compartimos datos",
      body: (
        <>
          <p>Compartimos datos únicamente con los servicios que los procesan en nuestro nombre:</p>
          <ul>
            <li>Supabase — base de datos, autenticación y almacenamiento de imágenes</li>
            <li>Nuestro proveedor de hosting — sirve el sitio y procesa las solicitudes</li>
            <li>Google — inicio de sesión opcional mediante OAuth para entrenadores</li>
            <li>
              Mapbox — búsqueda opcional de ciudades mediante geocodificación, que recibe el texto
              de búsqueda que escribes
            </li>
            <li>Proveedor de correo electrónico — envía los enlaces mágicos de inicio de sesión</li>
          </ul>
          <p>
            No vendemos datos personales ni los compartimos con anunciantes o intermediarios de
            datos.
          </p>
        </>
      ),
    },
    {
      id: "international-transfers",
      title: "Transferencias internacionales",
      body: (
        <p>
          Algunos de los proveedores anteriores procesan datos en países distintos al tuyo, incluido
          Estados Unidos. Cuando sea necesario, estas transferencias se apoyan en las garantías
          ofrecidas por esos proveedores (como cláusulas contractuales tipo o mecanismos
          equivalentes dentro de sus programas de privacidad).
        </p>
      ),
    },
    {
      id: "retention",
      title: "Conservación",
      body: (
        <p>
          Conservamos los datos de cuenta, perfil y analítica mientras el perfil o la cuenta estén
          activos y según sea necesario para los fines descritos anteriormente. Cuando un entrenador
          elimina su perfil, el perfil y sus fotos se eliminan; la cuenta de inicio de sesión
          subyacente puede conservarse por razones de seguridad, prevención de fraude u obligaciones
          legales. Las estadísticas agregadas que ya no permiten identificar a una persona pueden
          conservarse indefinidamente.
        </p>
      ),
    },
    {
      id: "your-rights",
      title: "Tus derechos",
      body: (
        <p>
          Según el lugar donde vivas, puedes tener derechos de acceso, corrección, eliminación o
          portabilidad de tus datos personales, de oposición o limitación del tratamiento y de
          retiro del consentimiento. En Colombia, estos incluyen los derechos de consulta,
          actualización, rectificación, supresión y revocatoria previstos en la Ley 1581 de 2012.
          Los entrenadores pueden editar o eliminar su perfil directamente desde el panel; para
          cualquier otra solicitud, escríbenos a{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>.
        </p>
      ),
    },
    {
      id: "children",
      title: "Menores de edad",
      body: (
        <p>
          El servicio no está dirigido a menores de edad. Debes tener al menos 18 años para crear
          una cuenta, y no recopilamos deliberadamente datos personales de menores. Si crees que un
          menor nos ha proporcionado datos personales, contáctanos y los eliminaremos.
        </p>
      ),
    },
    {
      id: "security",
      title: "Seguridad",
      body: (
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger los datos personales,
          incluido el cifrado en tránsito y el acceso restringido a nuestros sistemas. Sin embargo,
          ningún método de transmisión o almacenamiento es completamente seguro, por lo que no
          podemos garantizar seguridad absoluta.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Cambios a esta política",
      body: (
        <p>
          Podemos actualizar esta política ocasionalmente. Los cambios se publican en esta página y
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
