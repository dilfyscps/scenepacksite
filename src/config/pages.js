export const SITE_NAME = "DILFYSCPS";

export const PAGE_META = {
  home: {
    title: "Free Scenepacks for Editors",
  },
  packs: {
    title: "Browse All Scenepacks",
    label: "Catalog",
    heading: "Browse All",
    highlight: "Scenepacks",
    subtitle: "Search, filter, and download from the full library of TV and movie scenepacks.",
  },
  tvShows: {
    title: "TV Show Scenepacks",
    label: "Television",
    heading: "TV Show",
    highlight: "Scenepacks",
    subtitle: "Clips and stills from your favorite series — organized and ready for your edits.",
  },
  movies: {
    title: "Movie Scenepacks",
    label: "Film",
    heading: "Movie",
    highlight: "Scenepacks",
    subtitle: "High-quality film clips and images for fan edits, compilations, and creative projects.",
  },
  request: {
    title: "Request a Scenepack",
    label: "Community",
    heading: "Request a",
    highlight: "Pack",
    subtitle: "Suggest a movie or TV show you'd like to see in the catalog.",
  },
  guide: {
    title: "How to Download",
    label: "Help Center",
    heading: "How to",
    highlight: "Download",
    subtitle: "Step-by-step instructions to find, download, and use scenepacks in your editor.",
  },
  socials: {
    title: "Socials & Community",
    label: "Community",
    heading: "Follow",
    highlight: "Us",
    subtitle: "TikTok, Instagram, and more — stay connected for updates and pack requests.",
  },
  profiles: {
    title: "Editor Profiles",
    label: "Community",
    heading: "Meet the",
    highlight: "editors",
    subtitle: "Editor pages for the community — add your photo, bio, and social links in one place.",
  },
  profileCreate: {
    title: "Create Profile",
  },
  profileEdit: {
    title: "Edit Profile",
  },
  pack: {
    titleSuffix: "Scenepack",
    notFound: "Pack Not Found",
  },
  admin: {
    title: "Download Stats",
    label: "Admin",
    heading: "Download",
    highlight: "Stats",
    subtitle: "Track downloads and manage counts across the catalog.",
  },
  adminLogin: {
    title: "Admin Login",
    label: "Admin",
    heading: "Admin",
    highlight: "Login",
    subtitle: "Sign in to view download stats and manage counts.",
  },
};

export function getPackPageTitle(packTitle) {
  if (!packTitle) return PAGE_META.pack.notFound;
  return `${packTitle} ${PAGE_META.pack.titleSuffix}`;
}
