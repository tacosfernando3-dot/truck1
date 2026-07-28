import { Beef } from "lucide-react";
import { Button } from "@/components/button";

export function CallToActionBanner() {
  return (
    <section className="bg-yellow py-10 text-background sm:py-12">
      <div className="container-site flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background text-yellow">
            <Beef className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 className="font-brush text-3xl sm:text-4xl">
              HUNGRY? WE GOT YOU.
            </h2>
            <p className="mt-1 text-background/80">
              Order ahead and skip the line.
            </p>
          </div>
        </div>
        <Button href="/menu" variant="secondary" className="w-full md:w-auto">
          Order Now
        </Button>
      </div>
    </section>
  );
}
