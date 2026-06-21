import CategoryPacks from "./CategoryPacks";
import { PAGE_META } from "../config/pages";

export default function TvShows() {
  const meta = PAGE_META.tvShows;

  return (
    <CategoryPacks
      pageTitle={meta.title}
      label={meta.label}
      title={meta.heading}
      highlight={meta.highlight}
      subtitle={meta.subtitle}
      category="TV Shows"
    />
  );
}
