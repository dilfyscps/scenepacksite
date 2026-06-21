import { previewImagesToInput } from "../../utils/packUtils";

export function packToForm(pack) {
  return {
    title: pack.title,
    img: pack.img,
    category: pack.category,
    date: pack.date,
    description: pack.description,
    download: pack.download || "",
    creator: pack.creator,
    published: pack.published !== false,
    fileSize: pack.fileSize || "",
    clipCount: pack.clipCount ?? "",
    previewImages: previewImagesToInput(pack.previewImages),
  };
}
