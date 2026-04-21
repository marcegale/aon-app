import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // convertir archivo a base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
        {
        role: "user",
        content: [
            {
            type: "input_text",
            text: `
      Extrae los siguientes campos de esta factura y devuelve SOLO JSON válido.

      Reglas obligatorias:
      - "proveedor": string
      - "fecha": string
      - "numeroFactura": objeto con:
        - "establecimiento": string
        - "puntoExpedicion": string
        - "numero": string
      - "timbrado": string
      - "vencimientoTimbrado": string
      - "total": number
      - "moneda": debe ser SOLO "PYG" o "USD"
      - Si la factura está en guaraníes, aunque aparezca como Gs, GS, Guaranies o variantes similares, devuelve "PYG"
      - Si la factura está en dólares, devuelve "USD"
      - No devuelvas otras monedas
      - "iva5": number
      - "iva10": number
      - "ivaExento": number
      - "ivaTotal": number
      - "actividadesProveedor": lista de strings
      - "items": lista de objetos con:
        - "descripcion": string
        - "monto": number
        - "ivaTipo": string, debe ser SOLO "EXENTO", "5" o "10"

      Reglas adicionales:
      - Si no encuentras claramente el número de factura, devuelve strings vacíos en sus subcampos
      - Si no encuentras claramente el timbrado, devuelve string vacío
      - Si no encuentras claramente el vencimiento del timbrado, devuelve string vacío
      - Si no encuentras actividades del proveedor con suficiente claridad, devuelve []
      - Si no puedes identificar el IVA de un item con suficiente claridad, infiere el valor más probable entre "EXENTO", "5" o "10" según el documento
      - "ivaExento" debe representar el monto exento leído o inferido desde la factura
      - "ivaTotal" debe representar la liquidación total del IVA leída o inferida desde la factura
      - Si un item es exento, su "ivaTipo" debe ser "EXENTO"
      - No devuelvas texto fuera del JSON
      - No uses markdown
      - No uses comillas triples
      - No expliques nada

      Formato exacto esperado:
      {
        "proveedor": "string",
        "fecha": "YYYY-MM-DD o texto original si no puede normalizar",
        "numeroFactura": {
          "establecimiento": "string",
          "puntoExpedicion": "string",
          "numero": "string"
        },
        "timbrado": "string",
        "vencimientoTimbrado": "YYYY-MM-DD o texto original si no puede normalizar",
        "total": 0,
        "moneda": "PYG",
          "iva5": 0,
          "iva10": 0,
          "ivaExento": 0,
          "ivaTotal": 0,
          "actividadesProveedor": [],
          "items": [
            {
              "descripcion": "string",
              "monto": 0,
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

    const text = response.output_text;

    return NextResponse.json({
      success: true,
      raw: text,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}