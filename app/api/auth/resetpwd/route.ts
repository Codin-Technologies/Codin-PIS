import { NextRequest } from "next/server";
import { resetPassword } from "./post";

/**
 * @swagger
 * /api/auth/resetpwd:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
export async function POST(request: NextRequest) {
  return resetPassword(request);
}
