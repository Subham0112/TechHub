import path from "path";
import { getSupabase, supabaseBucket } from "../config/supabase";

const buildObjectPath = (originalname: string) => {
  const ext = path.extname(originalname).toLowerCase();
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `products/${unique}${ext}`;
};

export const uploadProductImage = async (
  file: Express.Multer.File
): Promise<string> => {
  const objectPath = buildObjectPath(file.originalname);
  const supabase = getSupabase();

  const { error } = await supabase.storage
    .from(supabaseBucket)
    .upload(objectPath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image to Supabase: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(supabaseBucket)
    .getPublicUrl(objectPath);

  return data.publicUrl;
};

export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) return;

  const marker = `/storage/v1/object/public/${supabaseBucket}/`;
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex === -1) return;

  const objectPath = decodeURIComponent(
    imageUrl.slice(markerIndex + marker.length)
  );

  const { error } = await getSupabase().storage
    .from(supabaseBucket)
    .remove([objectPath]);

  if (error) {
    console.error("Error deleting image from Supabase:", error.message);
  }
};
