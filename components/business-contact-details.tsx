import type { CmsBusiness } from "@/lib/cms/types";
import { formatBusinessAddress } from "@/lib/cms/utils";
import { cn } from "@/lib/utils";

type BusinessContactDetailsProps = {
  business: CmsBusiness;
  className?: string;
  showAddress?: boolean;
};

export function BusinessContactDetails({
  business,
  className,
  showAddress = true,
}: BusinessContactDetailsProps) {
  const address = formatBusinessAddress(business);
  const phoneDigits = business.phone.replace(/\D/g, "");
  const hasAddress = showAddress && !!address;

  if (!hasAddress && !business.phone && !business.email) {
    return null;
  }

  return (
    <div className={cn("space-y-1 text-sm text-muted", className)}>
      {hasAddress ? <p>{address}</p> : null}
      {business.phone ? (
        <p>
          {phoneDigits ? (
            <a href={`tel:${phoneDigits}`} className="hover:text-white">
              {business.phone}
            </a>
          ) : (
            business.phone
          )}
        </p>
      ) : null}
      {business.email ? (
        <p>
          <a
            href={`mailto:${business.email}`}
            className="break-all hover:text-white"
          >
            {business.email}
          </a>
        </p>
      ) : null}
    </div>
  );
}
