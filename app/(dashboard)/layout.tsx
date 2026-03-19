import { Shell } from "@/components/layout/Shell";
import { QueryProvider } from "@/providers/QueryProvider";
import { SessionProvider } from "@/providers/SessionProvider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <QueryProvider>
                <Shell>{children}</Shell>
            </QueryProvider>
        </SessionProvider>
    );
}
