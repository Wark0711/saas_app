import { ReactNode } from "react";
import { Nabvar } from "./_components/Navbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="bg-accent/5 min-h-screen">
            <Nabvar />
            <div className="conatiner py-6">
                {children}
            </div>
        </div>
    )
}