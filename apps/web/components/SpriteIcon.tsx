export function SpriteIcon({ name, className }: { name: string; className?: string }) {
  return (
    <svg className={className ?? "w-6 h-6"} aria-hidden="true">
      <use href={`/sprite.svg#${name}`} />
    </svg>
  );
}
