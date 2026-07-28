import Image from "next/image";
import { ChevronDown, MapPin, Utensils } from "lucide-react";
import { Button } from "@/components/button";
import { images } from "@/data/images";

export function HeroSection() {
  return (
    <section className="relative isolate min-h-[680px] overflow-hidden lg:min-h-[620px] xl:min-h-[min(88vh,820px)]">
      <Image
        src={images.heroFoodTruck}
        alt="Colorful black food truck with customers lined up at the service window"
        fill
        priority
        className="object-cover object-[85%_center] sm:object-[75%_center] lg:object-[60%_center]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/40" />

      {/* Mobile logo — vertically centered between header and hero copy */}
      <div className="pointer-events-none absolute inset-x-0 top-[68px] z-10 flex h-[min(34vh,260px)] items-center lg:hidden">
        <div className="container-site animate-fade-up w-full">
          <Image
            src="/images/street-crave-logo.png"
            alt="Street Crave Food Truck"
            width={602}
            height={245}
            priority
            className="h-auto w-[min(92vw,420px)] bg-transparent object-contain [filter:drop-shadow(0_2px_3px_rgba(0,0,0,1))_drop-shadow(0_8px_20px_rgba(0,0,0,0.95))_drop-shadow(0_18px_50px_rgba(0,0,0,0.9))]"
          />
        </div>
      </div>

      <div className="container-site relative flex min-h-[680px] flex-col justify-end pb-20 pt-28 lg:min-h-[620px] lg:justify-center lg:pb-24 lg:pt-24 xl:min-h-[min(88vh,820px)]">
        <p className="animate-fade-up mb-3 text-sm font-semibold tracking-[0.25em] text-yellow uppercase">
          Gourmet street food
        </p>
        <h1 className="animate-fade-up delay-100 max-w-3xl font-brush text-fluid-hero">
          <span className="text-white">BOLD FLAVOR.</span>
          <br />
          <span className="text-yellow">ANYWHERE.</span>
        </h1>
        <p className="animate-fade-up delay-200 mt-5 max-w-md text-base text-muted sm:text-lg">
          Gourmet street food made fresh and served with passion.
        </p>
        <div className="animate-fade-up delay-300 mt-8 grid w-full max-w-md grid-cols-2 gap-3 lg:flex lg:max-w-none">
          <Button href="/menu" leftIcon={<Utensils className="h-4 w-4" aria-hidden />}>
            View Menu
          </Button>
          <Button
            href="/locations"
            variant="outline-light"
            leftIcon={<MapPin className="h-4 w-4" aria-hidden />}
          >
            Find Us
          </Button>
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-xs tracking-[0.2em] text-muted uppercase lg:hidden">
        <span>Scroll to explore</span>
        <ChevronDown className="h-4 w-4 animate-bounce" aria-hidden />
      </div>
    </section>
  );
}
