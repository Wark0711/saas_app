import { BrandLogo } from "@/components/BrandLogo";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export function Navbar() {
    return (
        <header className="flex py-6 shadow-xl fixed top-0 w-full z-10 bg-background/95">
            <nav className="flex items-center gap-10 container font-semibold">
                <Link href='/' className="mr-auto">
                    <BrandLogo />
                </Link>
                <Link href='/' className="text-lg hidden md:inline">
                    Features
                </Link>
                <Link href='#pricing' className="text-lg hidden md:inline">
                    Pricing
                </Link>
                <Link href='/' className="text-lg hidden md:inline">
                    About
                </Link>
                <span className="text-lg">
                    <SignedIn>
                        <Link href={'/dashboard'}>Dashboard</Link>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton>Login</SignInButton>
                    </SignedOut>
                </span>
            </nav>
        </header>
    )
}