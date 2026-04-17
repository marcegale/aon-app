import { DiagnosticBlock } from "./types";

import { block01Direccion } from "./blocks/block-01-direccion";
import { block02Comercial } from "./blocks/block-02-comercial";
import { block03Marketing } from "./blocks/block-03-marketing";
import { block04Cliente } from "./blocks/block-04-cliente";
import { block05Operaciones } from "./blocks/block-05-operaciones";
import { block06Produccion } from "./blocks/block-06-produccion";
import { block07Logistica } from "./blocks/block-07-logistica";
import { block08Tecnologia } from "./blocks/block-08-tecnologia";
import { block09Finanzas } from "./blocks/block-09-finanzas";
import { block10RRHH } from "./blocks/block-10-rrhh";
import { block11Procesos } from "./blocks/block-11-procesos";
import { block12Riesgo } from "./blocks/block-12-riesgo";

export const diagnosticBlocks: DiagnosticBlock[] = [
  block01Direccion,
  block02Comercial,
  block03Marketing,
  block04Cliente,
  block05Operaciones,
  block06Produccion,
  block07Logistica,
  block08Tecnologia,
  block09Finanzas,
  block10RRHH,
  block11Procesos,
  block12Riesgo,
];