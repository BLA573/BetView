import { Clock, Camera, Globe } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Wasted Time",
    description: "Buyers visit dozens of homes that don't match expectations, losing hours of precious time.",
  },
  {
    icon: Camera,
    title: "Misleading Photos",
    description: "Listings often don't reflect reality. Filters and angles hide flaws that only in-person visits reveal.",
  },
  {
    icon: Globe,
    title: "Diaspora Limitation",
    description: "Investors abroad cannot physically inspect properties, leaving them to rely on uncertain secondhand information.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container max-w-6xl">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-4"
            style={{ background: 'hsl(214,80%,40%,0.08)', color: 'hsl(var(--primary))' }}>
            The Problem
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-navy mb-4">
            The Problem with Traditional <br className="hidden md:block" />Property Viewing
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Real estate in Ethiopia is broken. Buyers, sellers, and agencies all suffer from the same outdated process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((p, i) => (
            <div
              key={p.title}
              className="relative p-8 rounded-2xl border shadow-card group hover:shadow-blue hover:-translate-y-1 transition-all duration-300"
              style={{
                animationDelay: `${i * 150}ms`,
                background: 'hsl(215,40%,98%)',
                borderColor: 'hsl(var(--border))',
              }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl gradient-blue flex items-center justify-center mb-6 shadow-blue group-hover:scale-110 transition-transform">
                <p.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-semibold text-xl text-navy mb-3">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{p.description}</p>

              {/* Accent line */}
              <div className="absolute bottom-0 left-8 right-8 h-0.5 rounded-full gradient-blue opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
