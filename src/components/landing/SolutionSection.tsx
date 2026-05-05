import { ScanSearch, LayoutList, Users } from "lucide-react";

const solutions = [
  {
    icon: ScanSearch,
    step: "01",
    title: "360° Property Scanning",
    description: "We scan properties using high-resolution 360° cameras, capturing every detail of every room with photorealistic precision.",
  },
  {
    icon: LayoutList,
    step: "02",
    title: "Virtual Shortlisting",
    description: "Buyers explore, compare, and shortlist properties remotely — from anywhere in the world, at any time of day.",
  },
  {
    icon: Users,
    step: "03",
    title: "Higher Quality Leads",
    description: "Agencies receive serious, pre-qualified clients who've already toured the property virtually and are ready to commit.",
  },
];

const SolutionSection = () => {
  return (
    <section id="solution" className="py-24" style={{ background: 'hsl(215,66%,10%)' }}>
      <div className="container max-w-6xl">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-4"
            style={{ background: 'hsl(214,80%,40%,0.15)', color: 'hsl(var(--blue-glow))' }}>
            The Solution
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
            How BetView Changes Real Estate
          </h2>
          <p className="max-w-xl mx-auto text-lg" style={{ color: 'hsl(215,30%,65%)' }}>
            A seamless end-to-end platform that transforms how properties are shown, explored, and sold.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {solutions.map((s, i) => (
            <div
              key={s.title}
              className="relative p-8 rounded-2xl group hover:-translate-y-1 transition-all duration-300"
              style={{ background: 'hsl(215,55%,14%)', border: '1px solid hsl(215,40%,22%)' }}
            >
              {/* Step number */}
              <div className="text-5xl font-display font-bold mb-6 select-none"
                style={{ color: 'hsl(214,80%,40%,0.25)' }}>
                {s.step}
              </div>
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                style={{ background: 'hsl(214,80%,40%,0.15)', border: '1px solid hsl(214,80%,40%,0.3)' }}>
                <s.icon className="w-5 h-5" style={{ color: 'hsl(var(--blue-glow))' }} />
              </div>
              <h3 className="font-display font-semibold text-xl text-white mb-3">{s.title}</h3>
              <p style={{ color: 'hsl(215,30%,60%)' }} className="leading-relaxed">{s.description}</p>

              {/* Connector arrow on desktop */}
              {i < solutions.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full gradient-blue flex items-center justify-center shadow-blue">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
