const BrandName = ({ className = "text-4xl" }: { className?: string }) => (
  <span className={`font-bold tracking-tight ${className}`}>
    <span className="text-foreground">HUK</span>
    <span className="text-brand-blue">A</span>
    <span className="text-foreground">M</span>
  </span>
);

export default BrandName;
