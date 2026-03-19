'use server';

import { cookies } from 'next/headers';
import { getAuthenticatedUser, AuthenticatedUser, AuthenticatedError } from '@/lib/auth/utils';

const getBaseUrl = () => process.env.API_BASE_URL || 'http://localhost:3000';

async function fetchWithCookies(path: string, payload: any) {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    const res = await fetch(`${getBaseUrl()}${path}`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${res.statusText}`);
    }

    return res.json();
}

export async function sendOtpAction(email: string) {
    if (!email) throw new Error('Email is required');
    return fetchWithCookies('/api/auth/sendotp', { email });
}

export async function verifyOtpAction(email: string, otp: string) {
    if (!email || !otp) throw new Error('Email and OTP are required');
    return fetchWithCookies('/api/auth/verifyotp', { email, otp });
}

export async function resetPasswordAction(username: string, newPassword: string) {
    if (!username || !newPassword) throw new Error('Username and New Password are required');
    return fetchWithCookies('/api/auth/resetpwd', { username, newPassword });
}

export async function changePasswordAction(id: string, oldPassword: string, newPassword: string) {
    if (!id || !oldPassword || !newPassword) throw new Error('Invalid payload');
    
    // Auth Check
    const user = await getAuthenticatedUser();
    if (!user || (user as AuthenticatedError).message || (user as AuthenticatedUser).id !== id) {
        throw new Error('Unauthorized to change password for this user');
    }

    return fetchWithCookies('/api/auth/changepwd', { id, oldPassword, newPassword });
}
