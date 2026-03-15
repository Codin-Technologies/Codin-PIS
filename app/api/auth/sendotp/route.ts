import { NextRequest } from "next/server";
import { sendOtp } from "./post";

/**
 * @swagger
 * /api/auth/sendotp:
 *   post:
 *     summary: Send OTP for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 */
export async function POST(request: NextRequest) {
  return sendOtp(request);
}
