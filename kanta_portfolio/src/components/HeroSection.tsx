import Image from "next/image";
import Introduction from "./Introduction";
export default function HeroSection() {
    return (
        <section className="w-full h-[600px]" aria-label="hero section">
            <div className="flex w-full h-full">
                <div className="w-1/2" aria-label="introduction">
                    <Introduction />
                </div>
                <div className="relative w-1/2 h-full" aria-label="hero image wrapper">
                    <Image src={`/hero-image.jpg`} fill={true} objectFit="contain" alt="hero image" />
                </div>
            </div>
        </section>
    );
}