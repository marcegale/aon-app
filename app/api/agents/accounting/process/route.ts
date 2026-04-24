import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    const facturaId = `fac_${crypto.randomUUID()}`;
    const safeFileName = sanitizeFileName(file.name || "invoice");
    const storagePath = `pending/${facturaId}/${safeFileName}`;

    const supabase = createSupabaseAdminClient();

    const { error: uploadError } = await supabase.storage
      .from("invoice-files")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("SUPABASE STORAGE UPLOAD ERROR:", uploadError);
      return NextResponse.json(
        { error: "File upload failed", details: uploadError.message },
        { status: 500 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Extrae los siguientes campos de esta factura paraguaya y devuelve SOLO JSON válido.

IMPORTANTE:
- No expliques nada
- No uses markdown
- No uses comillas triples
- Devuelve solo JSON limpio

========================
DATOS DEL EMISOR
========================
- "razonSocialEmisor": string (obligatorio si aparece)
- "nombreFantasiaEmisor": string (opcional)
- "actividadesEconomicas": lista de strings
- "timbrado": string
- "vencimientoTimbrado": string

REGLAS PARA VENCIMIENTO:
- Buscar textos como "Válido hasta", "Fecha de vigencia", "Vencimiento timbrado"
- NO confundir con fecha de emisión
- Si no aparece claramente, devolver ""

========================
DATOS DE LA FACTURA
========================
- "fechaEmision": string (tomar solo del documento visible, nunca metadata)
- "numeroFactura": objeto con:
  - "establecimiento": string
  - "puntoExpedicion": string
  - "numero": string
- "razonSocialCliente": string
- "rucCliente": string
- "condicion": string ("CONTADO", "CREDITO" o "")

REGLAS PARA NUMERO DE FACTURA:
- Buscar formato paraguayo típico: XXX-XXX-XXXXXXX
- También aceptar formatos con espacios o sin guiones
- Separar correctamente:
  - establecimiento = primeros 3 dígitos
  - puntoExpedicion = siguientes 3 dígitos
  - numero = resto
- NO confundir con número de timbrado
- NO dejar vacío si el patrón está visible

========================
DETALLE DE ITEMS
========================
- "items": lista de objetos con:
  - "cantidad": number
  - "descripcion": string
  - "precioUnitario": number o null
  - "montoTotal": number
  - "ivaTipo": string ("5", "10", "EXENTO")

========================
TOTALES
========================
- "total": number
- "moneda": solo "PYG" o "USD"

REGLAS IMPORTANTES:
- NO calcular IVA total
- NO leer IVA 5, IVA 10, EXENTO desde resumen
- SOLO leer los items y sus categorías
- Si falta un dato, usar null o "" según corresponda
- Si no puedes identificar el IVA de un item, inferir entre "5", "10" o "EXENTO"
- La fecha de emisión debe tomarse exclusivamente del contenido visible de la factura
- Si una fecha parece metadata del archivo o imagen, ignorarla
- Si no puedes identificar claramente la fecha de emisión, devuelve ""
- El montoTotal de cada item debe ser leído del documento; nunca devolver 0 salvo que figure explícitamente
- Si no encuentras el monto de un item, intenta inferirlo con precio unitario x cantidad
- La condición debe ser "CONTADO" o "CREDITO" si aparece; si no aparece claramente, devuelve ""

FORMATO FINAL:
{
  "razonSocialEmisor": "",
  "nombreFantasiaEmisor": "",
  "actividadesEconomicas": [],
  "timbrado": "",
  "vencimientoTimbrado": "",
  "fechaEmision": "",
  "numeroFactura": {
    "establecimiento": "",
    "puntoExpedicion": "",
    "numero": ""
  },
  "razonSocialCliente": "",
  "rucCliente": "",
  "condicion": "",
  "total": 0,
  "moneda": "PYG",
  "items": [
    {
      "cantidad": 0,
      "descripcion": "",
      "precioUnitario": null,
      "montoTotal": 0,
      "ivaTipo": "EXENTO"
    }
  ]
}
`,
            },
            {
              type: "input_image",
              image_url: `data:${file.type};base64,${base64}`,
              detail: "auto",
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      success: true,
      raw: response.output_text,
      facturaId,
      storagePath,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("PROCESSING ERROR:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}