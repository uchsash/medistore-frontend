import { DashboardShell } from "@/components/modules/dashboard/dashboard-shell";
import { getCurrentUser } from "@/lib/current-user";


export default async function DashboardLayout({
    children,
    admin,
    seller,
    customer,
}: {
    children: React.ReactNode;
    admin: React.ReactNode;
    seller: React.ReactNode;
    customer: React.ReactNode;
}) {
    const userInfo = await getCurrentUser();

    // choose default when not logged in (your choice)
    const role = userInfo?.role ?? "customer";

    let content: React.ReactNode;

    switch (role) {
        case "admin":
            content = admin;
            break;
        case "seller":
            content = seller;
            break;
        default:
            content = customer;
    }

    return (
        <DashboardShell role={role}>
            {children}
            {content}
        </DashboardShell>
    );
}