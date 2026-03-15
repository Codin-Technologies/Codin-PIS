import { NextRequest } from "next/server";
import { verifyOtp } from "./post";

/**
 * @swagger
 * /api/auth/verifyotp:
 *   post:
 *     summary: Verify OTP
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
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified
 */
export async function POST(request: NextRequest) {
  return verifyOtp(request);
}
