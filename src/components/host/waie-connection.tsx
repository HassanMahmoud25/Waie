import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { hosts } from "@/data/hosts";
import { Reveal } from "@/components/shared/reveal";

/**
 * Closing section: ties the three individual profiles above back to Waie
 * itself. The portraits are pulled into one overlapping cluster inside a
 * shared glow — standing in for an explicit "connector" graphic — above the
 * channel's own bio line ("بودكاست وعي مع حازم الصديق، أحمد عامر وشريف علي")
 * quoted as-is rather than paraphrased.
 */
export function WaieConnection() {
  return (
    <section className="section pt-0">
      <div className="container">
        <Reveal className="waie-connection px-6 py-16 text-center sm:px-14 sm:py-20">
          <span className="waie-connection__glow" aria-hidden="true" />

          <p className="eyebrow-pill eyebrow-pill--on-dark mx-auto w-fit">من ثلاثة إلى وعي</p>

          <div className="waie-connection__cluster mt-9">
            {hosts.map((host) => (
              <span
                className="relative block size-20 overflow-hidden rounded-full shadow-[var(--shadow-lg)] sm:size-28"
                style={{ boxShadow: "0 0 0 4px var(--cinematic), var(--shadow-lg)" }}
                key={host.id}
              >
                <Image src={host.photoUrl} alt={host.name} fill sizes="112px" className="object-cover" />
              </span>
            ))}
          </div>

          <h2 className="mx-auto mt-9 max-w-2xl text-xl font-black leading-snug tracking-[-.02em] text-white sm:text-3xl">
            ثلاثة صنّاع محتوى، لكل منهم قناته ورحلته — يجتمعون أسبوعيًا خلف ميكروفون واحد باسم وعي.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[.95rem] leading-8 text-[var(--on-brand-soft)]">
            وعي ليس امتدادًا لأي قناة من قنواتهم الثلاث، بل مساحة يصنعونها معًا: حوار مشترك حول القرآن والحياة والمعنى، بلا
            توزيع أدوار معلن — كل واحد منهم يحضر بأسلوبه الذي بناه على قناته الخاصة على مدى سنوات.
          </p>

          <Link href="/" className="btn btn-glass--solid mt-8">
            استمع لأحدث حلقات وعي <ArrowLeft size={16} aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
