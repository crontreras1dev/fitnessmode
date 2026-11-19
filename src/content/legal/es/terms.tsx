import { legalConfig } from "@/lib/legal/config";
import type { LegalDocument } from "@/lib/legal/types";

export const termsDoc: LegalDocument = {
  intro: (
    <p>
      Estos Términos rigen el uso de FitnessMode, un servicio operado por {legalConfig.operatorName}
      . Al navegar por el sitio o crear un perfil, aceptas estos Términos.
    </p>
  ),
  sections: [
    {
      id: "the-service",
      title: "El servicio",
      body: (
        <p>
          FitnessMode es un directorio gratuito donde los entrenadores publican un perfil público y
          los visitantes pueden explorarlo y contactar directamente a los entrenadores. FitnessMode
          no es parte de ningún acuerdo, reserva o contratación entre los entrenadores y sus
          clientes.
        </p>
      ),
    },
    {
      id: "eligibility",
      title: "Elegibilidad",
      body: (
        <p>
          Debes tener al menos 18 años y capacidad legal para aceptar estos Términos. Los
          entrenadores deben contar con el derecho —y las cualificaciones, licencias o permisos
          exigidos en su jurisdicción— para ofrecer los servicios descritos en su perfil.
        </p>
      ),
    },
    {
      id: "accounts",
      title: "Cuentas",
      body: (
        <p>
          Los entrenadores inician sesión mediante un enlace mágico enviado por correo o mediante su
          cuenta de Google. Eres responsable de todo lo que ocurra bajo tu cuenta y de mantener tu
          perfil exacto y actualizado.
        </p>
      ),
    },
    {
      id: "listings-moderation",
      title: "Anuncios y moderación",
      body: (
        <p>
          Los nuevos perfiles se revisan antes de publicarse (pasan de pendientes a activos una vez
          aprobados). Podemos suspender o eliminar perfiles que sean inexactos, estén inactivos,
          sean spam o infrinjan estos Términos, a nuestra discreción.
        </p>
      ),
    },
    {
      id: "your-content",
      title: "Contenido que envías",
      body: (
        <p>
          Conservas la propiedad de las fotos, la biografía, los enlaces y demás contenido que
          envíes. Al publicarlo, nos concedes una licencia no exclusiva, mundial y libre de regalías
          para alojarlo, mostrarlo y distribuirlo como parte del directorio. Confirmas que tienes
          derecho a publicar el contenido y que este no infringe los derechos de terceros.
        </p>
      ),
    },
    {
      id: "prohibited",
      title: "Contenido prohibido",
      body: (
        <p>
          No puedes publicar contenido ilegal, engañoso, infractor o dañino; crear anuncios falsos,
          extraídos o duplicados; acosar a otros usuarios; extraer datos del directorio; ni usar
          indebidamente o interferir con los endpoints de seguimiento y analítica del sitio.
        </p>
      ),
    },
    {
      id: "no-endorsement",
      title: "Sin verificación ni respaldo",
      body: (
        <p>
          Los perfiles son declarados por los propios entrenadores. No verificamos credenciales,
          certificaciones, seguros ni antecedentes, y un anuncio no constituye un respaldo. Los
          visitantes tratan con los entrenadores bajo su propio riesgo y deben comprobar sus
          cualificaciones de forma independiente antes de contratarlos.
        </p>
      ),
    },
    {
      id: "dealings",
      title: "Relaciones entre usuarios",
      body: (
        <p>
          Las sesiones, pagos y comunicaciones son estrictamente entre el cliente y el entrenador.
          No cobramos comisiones y no somos responsables de la calidad, seguridad, legalidad o
          resultado de ningún servicio acordado a través del directorio.
        </p>
      ),
    },
    {
      id: "paid-features",
      title: "Funciones gratuitas y pagas",
      body: (
        <p>
          Publicar un perfil y explorar el directorio son gratuitos. Pueden ofrecerse funciones
          pagas opcionales —como mostrar botones de WhatsApp o llamada, ubicación destacada o una
          insignia de verificación— bajo precios y condiciones independientes que se comunicarán al
          momento de la compra.
        </p>
      ),
    },
    {
      id: "intellectual-property",
      title: "Propiedad intelectual",
      body: (
        <p>
          El sitio, la marca FitnessMode y el software que lo respalda pertenecen a{" "}
          {legalConfig.operatorName}. No puedes copiarlos, reproducirlos ni reutilizarlos, salvo en
          la medida necesaria para usar el servicio según lo previsto.
        </p>
      ),
    },
    {
      id: "disclaimers",
      title: "Descargos de responsabilidad",
      body: (
        <p>
          El servicio se proporciona «tal cual» y «según disponibilidad», sin garantías de ningún
          tipo, expresas o implícitas, incluidas garantías de comerciabilidad, idoneidad para un fin
          particular y no infracción.
        </p>
      ),
    },
    {
      id: "liability",
      title: "Limitación de responsabilidad",
      body: (
        <p>
          En la máxima medida permitida por la ley, no seremos responsables por daños indirectos,
          incidentales, especiales o consecuentes, ni por lucro cesante, pérdida de datos o
          deterioro del fondo de comercio. Nuestra responsabilidad total por cualquier reclamación
          relacionada con el servicio se limita al monto que nos hayas pagado durante los doce meses
          anteriores a la reclamación, o a USD 100 si no pagaste nada.
        </p>
      ),
    },
    {
      id: "termination",
      title: "Terminación",
      body: (
        <p>
          Los entrenadores pueden eliminar su perfil desde el panel en cualquier momento. Podemos
          suspender o terminar cuentas y eliminar anuncios que infrinjan estos Términos, con o sin
          previo aviso cuando corresponda.
        </p>
      ),
    },
    {
      id: "governing-law",
      title: "Ley aplicable",
      body: (
        <p>
          Estos Términos se rigen por las leyes de la República de Colombia, sin consideración a las
          normas sobre conflicto de leyes. Las disputas se resolverán ante los tribunales
          competentes de Bogotá, Colombia, salvo que una norma imperativa disponga otra cosa.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Cambios a estos términos",
      body: (
        <p>
          Podemos actualizar estos Términos ocasionalmente. Los cambios se publican en esta página y
          entran en vigor al publicarse; la fecha de «última actualización» anterior muestra la
          versión actual. Continuar usando el servicio después de un cambio significa que aceptas
          los Términos actualizados.
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
