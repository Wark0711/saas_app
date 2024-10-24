import { BrandLogo } from "@/components/BrandLogo";
import Link from "next/link";

export function Nabvar() {
    return (
        <header className="flex py-4 shadow bg-background">
            <nav>
                <Link href={'/dashboard'}>
                    <BrandLogo />
                </Link>
            </nav>
        </header>
    )
}