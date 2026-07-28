import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/button";
import { images } from "@/data/images";

export function CateringSection() {
  return (
    <section id="about" className="bg-background-soft py-14 sm:py-16">
      <div className="container-site grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold tracking-[0.22em] text-yellow uppercase">
            About
          </p>
          <h2 className="mt-2 font-brush text-fluid-section text-white">
            Built for the city craving
          </h2>
          <p className="mt-4 max-w-xl text-muted">
            Street Flavor is a blacked-out Jackson Heights truck cooking bold
            street plates from scratch — tacos, smash burgers, bowls, and sides
            made fresh every service. Catch us around Queens, or book catering
            for parties, offices, and film sets.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/catering">Catering & Events</Button>
            <Button href="/#contact" variant="outline-light">
              Contact the Crew
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted">
            Prefer a full package breakdown?{" "}
            <Link href="/catering#packages" className="text-yellow hover:underline">
              See catering packages
            </Link>
            .
          </p>
        </div>
        <div className="relative aspect-[5/4] overflow-hidden rounded-xl border border-border-dark">
          <Image
            src={images.cateringFood}
            alt="Fresh grilled street food ready for catering"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </div>
      </div>
    </section>
  );
}
