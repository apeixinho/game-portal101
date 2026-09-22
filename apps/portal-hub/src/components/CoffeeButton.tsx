interface CoffeeButtonProps {
  readonly variant?: "fixed" | "intro" | "inline";
}

const VARIANT_CLASS: Readonly<Record<NonNullable<CoffeeButtonProps["variant"]>, string>> = {
  fixed: "coffee-btn",
  intro: "coffee-btn coffee-btn--intro",
  inline: "coffee-btn coffee-btn--inline",
};

/**
 * "Gostaste? Oferece-me um café!" — Buy Me a Coffee CTA, lifted verbatim from
 * the original Hub footer.
 */
export function CoffeeButton({ variant = "fixed" }: CoffeeButtonProps): JSX.Element {
  return (
    <a
      className={VARIANT_CLASS[variant]}
      href="https://buymeacoffee.com/ricardojocx"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="coffee-btn__icon" aria-hidden="true">
        ☕
      </span>
      <span>Gostaste? Oferece-me um café!</span>
    </a>
  );
}
