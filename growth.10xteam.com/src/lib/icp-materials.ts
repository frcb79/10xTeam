import type { GeneratedMaterials, WizardData } from "@/types/icp";

const channelLabels: Record<string, string> = {
  LinkedIn: "LinkedIn",
  Instagram: "Instagram",
  Facebook: "Facebook",
  Email: "Email",
  WhatsApp: "WhatsApp",
  Ads: "Ads",
};

export function generateIcpMaterials(data: WizardData): GeneratedMaterials {
  const icpSummary = `ICP objetivo: ${data.idealRole} en empresas de ${data.industry} (${data.employeeRange}) que hoy sufre "${data.mainPain}" y busca "${data.expectedOutcome}" con meta mensual de ${data.monthlyLeadGoal} leads calificados.`;

  const onePagerOutline = [
    `Problema central: ${data.mainPain}`,
    `Impacto de no actuar: perdida de oportunidades en ${data.industry}`,
    `Resultado prometido: ${data.expectedOutcome}`,
    `Canales prioritarios: ${data.preferredChannels.join(", ")}`,
    `Llamado a accion: agenda diagnostico para ${data.companyName}`,
  ];

  const pitchDeckOutline = [
    "Slide 1: Contexto del mercado y dolor principal",
    "Slide 2: Perfil ICP y por que este segmento compra",
    "Slide 3: Propuesta de valor y mecanismo unico",
    "Slide 4: Flujo de prospeccion + seguimiento",
    "Slide 5: Caso esperado a 90 dias y KPIs",
    "Slide 6: Oferta, alcance y siguiente paso",
  ];

  const callScript = [
    `Apertura: "Hola, trabajo con empresas de ${data.industry} que hoy tienen este reto: ${data.mainPain}."`,
    `Exploracion: "Que pasa hoy cuando un lead muestra interes y no compra en el primer contacto?"`,
    `Reencuadre: "Nuestro foco no es solo generar mas leads; es convertir mejor con seguimiento inteligente."`,
    `Propuesta: "Si te mostramos una ruta para ${data.expectedOutcome}, valdria una sesion de 20 minutos?"`,
    "Cierre: agenda fecha y confirma decisores involucrados.",
  ];

  const channels = Object.fromEntries(
    data.preferredChannels.map((channel) => {
      const label = channelLabels[channel] ?? channel;
      return [
        channel,
        {
          headline: `${label}: Mensaje para ${data.idealRole}`,
          message: `Detectamos que en ${data.industry} muchas empresas pierden conversion por ${data.mainPain}. La propuesta es simple: alinear prospeccion + seguimiento para lograr ${data.expectedOutcome}.`,
          cta: "Agenda diagnostico de 20 minutos",
          assets: [
            "One-pager de objeciones",
            "Caso de uso por industria",
            "Checklist de seguimiento comercial",
          ],
        },
      ];
    })
  );

  const socialPosts = [
    {
      channel: "LinkedIn",
      title: `Tu problema no es volumen, es seguimiento`,
      body: `Si tu equipo ya genera leads pero no cierra, el cuello de botella no es trafico: es proceso. En ${data.industry}, el primer ajuste es construir un flujo que convierta interes en citas reales.`,
    },
    {
      channel: "Instagram",
      title: "3 senales de que tu prospeccion se enfria",
      body: "1) Responden pero no avanzan. 2) No hay siguiente paso claro. 3) El equipo improvisa cada seguimiento.",
    },
    {
      channel: "Facebook",
      title: `Como pasar de ruido a pipeline en ${data.industry}`,
      body: `Cuando defines ICP + mensaje + handoff comercial, la meta de ${data.monthlyLeadGoal} deja de ser una apuesta y se vuelve operacion.`,
    },
  ];

  return {
    icpSummary,
    onePagerOutline,
    pitchDeckOutline,
    callScript,
    channels,
    socialPosts,
  };
}
