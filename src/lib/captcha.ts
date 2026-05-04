const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export interface CaptchaChallenge {
  id: string;
  display: string;
  answer: string;
  type: "text" | "math";
}

function generateRandomString(length: number): string {
  let result = "";
  const hasUpper = false;
  const hasLower = false;
  const hasDigit = false;

  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }

  if (!hasUpper || !hasLower || !hasDigit) {
    const arr = result.split("");
    if (!arr.some((c) => /[A-Z]/.test(c))) arr[0] = CHARS.charAt(Math.floor(Math.random() * 26));
    if (!arr.some((c) => /[a-z]/.test(c))) arr[1] = CHARS.charAt(26 + Math.floor(Math.random() * 26));
    if (!arr.some((c) => /[0-9]/.test(c))) arr[2] = CHARS.charAt(52 + Math.floor(Math.random() * 10));
    result = arr.join("");
  }

  return result;
}

function generateMathChallenge(): { display: string; answer: string } {
  const ops = ["+", "-", "*"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;

  switch (op) {
    case "+":
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      answer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * a);
      answer = a - b;
      break;
    case "*":
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
      answer = a * b;
      break;
    default:
      a = 1;
      b = 1;
      answer = 2;
  }

  return {
    display: `${a} ${op} ${b} = ?`,
    answer: answer.toString(),
  };
}

export function generateCaptcha(): CaptchaChallenge {
  const isMath = Math.random() < 0.3;
  const id = crypto.randomUUID();

  if (isMath) {
    const { display, answer } = generateMathChallenge();
    return { id, display, answer, type: "math" };
  }

  const text = generateRandomString(8);
  return { id, display: text, answer: text, type: "text" };
}

const captchaStore = new Map<string, { answer: string; expires: number }>();

export function storeCaptcha(captcha: CaptchaChallenge): void {
  captchaStore.set(captcha.id, {
    answer: captcha.answer,
    expires: Date.now() + 5 * 60 * 1000,
  });

  for (const [key, value] of captchaStore.entries()) {
    if (value.expires < Date.now()) captchaStore.delete(key);
  }
}

export function verifyCaptcha(id: string, answer: string): boolean {
  const stored = captchaStore.get(id);
  if (!stored) return false;
  if (stored.expires < Date.now()) {
    captchaStore.delete(id);
    return false;
  }
  const isValid = stored.answer === answer;
  captchaStore.delete(id);
  return isValid;
}
