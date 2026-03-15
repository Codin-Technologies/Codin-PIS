import { NextRequest } from "next/server";
import { loginUser } from "./get";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
// The user requested a get.ts file to "accept username and password".
// Usually login is a POST request, but Next.js export maps exact HTTP methods.
// We provide POST here to handle the JSON body safely.
export async function POST(request: NextRequest) {
  return loginUser(request);
}

// Optionally, we also export GET if the client does a weird GET with body/params.
// export async function GET(request: NextRequest) {
//   return loginUser(request);
// }
