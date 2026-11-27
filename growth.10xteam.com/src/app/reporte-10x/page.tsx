import type { Metadata } from "next";
import ReportExperience from "./report-experience";
export const metadata: Metadata={
  title:"Reporte Estratégico 10xteam | Tu mapa de crecimiento",
  description:"Explora prioridades, capacidad recuperable y escenarios comerciales para tu negocio.",
  robots:{index:false,follow:false}
};
export default function ReportTenxPage(){return <ReportExperience/>;}
