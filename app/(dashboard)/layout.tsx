import { Shell } from "@/components/layout/Shell";
import { QueryProvider } from "@/providers/QueryProvider";
import { SessionProvider } from "@/providers/SessionProvider";
import { Toaster } from "sonner";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <QueryProvider>
                <Toaster position="top-right" richColors />
                <Shell>{children}</Shell>
            </QueryProvider>
        </SessionProvider>
    );
}
