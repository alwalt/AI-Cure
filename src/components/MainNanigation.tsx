import SkipLink from "./SkipLink";

export default function MainNavigation() {
  return (
    <header className="top-0">
      <SkipLink targetId="main-content">Skip to main content</SkipLink>
      <nav>{/*Main Navigation goes here*/}</nav>
    </header>
  );
}
