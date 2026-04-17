type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <header>
      <p className="text-sm uppercase tracking-[0.22em] text-white/40">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      <p className="mt-2 text-sm text-white/55">
        {description}
      </p>
    </header>
  );
}