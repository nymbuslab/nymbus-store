import { createClient } from "@/lib/supabase/server";
import {
  buildStoreTheme,
  NYMBUS_DEFAULT_PRIMARY,
  NYMBUS_DEFAULT_SECONDARY,
  type StoreTheme,
} from "@/lib/theme/derive";

export async function getStoreTheme(storeId: string): Promise<StoreTheme> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_settings")
    .select("theme_primary_color, theme_secondary_color")
    .eq("store_id", storeId)
    .maybeSingle();

  return buildStoreTheme({
    primary: data?.theme_primary_color ?? NYMBUS_DEFAULT_PRIMARY,
    secondary: data?.theme_secondary_color ?? NYMBUS_DEFAULT_SECONDARY,
  });
}
