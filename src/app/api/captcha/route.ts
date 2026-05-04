import { NextResponse } from "next/server";
import { generateCaptcha, storeCaptcha } from "@/lib/captcha";

export async function GET() {
  const captcha = generateCaptcha();
  storeCaptcha(captcha);

  return NextResponse.json({
    id: captcha.id,
    display: captcha.display,
    type: captcha.type,
  });
}
