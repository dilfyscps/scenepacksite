import CategoryPacks from "./CategoryPacks";
import { PAGE_META } from "../config/pages";

export default function Movies() {
  const meta = PAGE_META.movies;

  return (
    <CategoryPacks
      pageTitle={meta.title}
      label={meta.label}
      title={meta.heading}
      highlight={meta.highlight}
      subtitle={meta.subtitle}
      category="Movies"
    />
  );
}
