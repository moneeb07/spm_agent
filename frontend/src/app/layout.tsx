import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "SPM Agent | AI Software Product Manager",
    description: "An agentic AI system that helps solo developers plan, execute, and track software projects intelligently.",
    generator: "v0.app",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className="font-sans antialiased bg-background text-foreground">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    )
}
