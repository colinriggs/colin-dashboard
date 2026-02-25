import { NextRequest, NextResponse } from "next/server";

const FILES_URL = process.env.FILES_URL || "http://127.0.0.1:18793";
const AUTH_TOKEN = process.env.GATEWAY_TOKEN || "";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");
  const action = request.nextUrl.searchParams.get("action");

  try {
    let url: string;
    if (action === "list") {
      const dir = request.nextUrl.searchParams.get("dir") || "reflections";
      url = `${FILES_URL}/list?dir=${encodeURIComponent(dir)}`;
    } else if (path) {
      url = `${FILES_URL}/read?path=${encodeURIComponent(path)}`;
    } else {
      return NextResponse.json({ error: "path or action required" }, { status: 400 });
    }

    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
