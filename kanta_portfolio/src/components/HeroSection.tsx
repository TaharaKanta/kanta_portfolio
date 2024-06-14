import Image from "next/image";
import Introduction from "./Introduction";
import { useRouter } from "next/router";
export default function HeroSection() {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    return (
        <section className="w-full h-[600px]" aria-label="hero section">
            <div className="flex w-full h-full">
                <div className="w-1/2" aria-label="introduction">
                    <Introduction />
                </div>
                <div className="relative w-1/2 h-full" aria-label="hero image wrapper">
                    <Image src={`${basePath}/hero-image.jpg`} fill={true} objectFit="contain" alt="hero image" />
                </div>
            </div>
        </section>
    );
}