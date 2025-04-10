import { Button } from "@/components/ui/button";
import { isAuthenticated, signOut } from "@/lib/actions/auth.action";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

export default async function RootLayout({children}:{children:ReactNode}){

    const isUserAuthenticated = await isAuthenticated();

    if(!isUserAuthenticated) redirect('/sign-in')

    return(
        <>
            <div className="root-layout">
                <nav>
                        <div className="flex items-center justify-between">
                            {/* Logo + Title */}
                            <Link href="/" className="flex items-center gap-2">
                                <Image src="/logo.svg" alt="logo" width={38} height={32} />
                                <h2 className="text-primary-100 text-4xl font-semibold">MockBot</h2>
                            </Link>

                            {/* Logout Button */}
                            <Button  onClick={signOut} className='btn-primary'>Log Out</Button>
                        </div>

                    {children}
                    

                </nav>
            </div>
        </>
    )
}