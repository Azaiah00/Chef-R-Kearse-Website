import Reveal from "@/components/Reveal";
import BladeRule from "@/components/BladeRule";
import { processSteps } from "@/lib/experiences";

export default function ProcessSteps() {
  return (
    <ol className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
      {processSteps.map((s, i) => (
        <Reveal as="li" key={s.n} delay={i * 0.07} className="flex flex-col">
          <span className="t-serif-italic text-5xl text-accent">{s.n}</span>
          <div className="mt-5">
            <BladeRule />
          </div>
          <h3 className="t-h3 mt-6">{s.title}</h3>
          <p className="t-small mt-3 max-w-[34ch] text-muted">{s.body}</p>
        </Reveal>
      ))}
    </ol>
  );
}
