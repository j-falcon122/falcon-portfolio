import Image from "next/image";
import type { TextBlock as TextBlockType } from "@/lib/cms/types";

export default function AboutBlock({ title, body, image }: TextBlockType) {
  return (
    <section className="max-w-6xl mx-auto py-12">
      <div className="about-grid">
        <div>
          <div className="about__image-wrapper rounded-lg overflow-hidden shadow-lg">
            {image?.src ? (
              <Image src={image.src} alt={image.alt || "About image"} width={900} height={700} className="object-cover w-full h-full" />
            ) : (
              <Image src="/placeholder-work-6.svg" alt="About image" width={900} height={700} className="object-cover w-full h-full" />
            )}
          </div>
        </div>

        <div>
          {title ? <h2 className="text-3xl font-bold mb-4">{title}</h2> : null}
          <div className="prose mb-6" dangerouslySetInnerHTML={{ __html: body }} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="about__card p-6 rounded-lg">
              <div className="text-2xl font-semibold">10+</div>
              <div className="text-sm text-gray-500">Years Experience</div>
            </div>
            <div className="about__card p-6 rounded-lg">
              <div className="text-2xl font-semibold">500+</div>
              <div className="text-sm text-gray-500">Students Taught</div>
            </div>
            <div className="about__card p-6 rounded-lg">
              <div className="text-2xl font-semibold">50+</div>
              <div className="text-sm text-gray-500">Performances</div>
            </div>
            <div className="about__card p-6 rounded-lg">
              <div className="text-2xl font-semibold">100%</div>
              <div className="text-sm text-gray-500">Passion</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
