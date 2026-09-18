import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function SectionHeading({ eyebrow, title, href }: { eyebrow?: string; title: string; href?: string }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="text-xl md:text-3xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="section-link">
          استكشف المزيد <ArrowLeft size={15} />
        </Link>
      )}
    </div>
  );
}
