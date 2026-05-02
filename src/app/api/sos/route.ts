import { NextResponse } from "next/server";
import { emergencyServices } from "@/lib/emergency";

export async function GET() {
  return NextResponse.json({ services: emergencyServices });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { serviceId } = body as { serviceId?: string };

  if (serviceId) {
    const service = emergencyServices.find((s) => s.id === serviceId);
    if (service) {
      return NextResponse.json({ service });
    }
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  return NextResponse.json({ services: emergencyServices });
}
