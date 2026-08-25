import { readCms } from "@/lib/cms/store";
import { instagramHandleFromUrl } from "@/lib/cms/utils";

export type InstagramMediaItem = {
  id: string;
  image: string;
  alt: string;
  permalink: string;
};

type GraphMedia = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
};

type WebTimelineNode = {
  id?: string;
  shortcode?: string;
  is_video?: boolean;
  display_url?: string;
  thumbnail_src?: string;
  accessibility_caption?: string | null;
  edge_media_to_caption?: {
    edges?: Array<{ node?: { text?: string } }>;
  };
};

function usernameFromInstagramUrl(url: string) {
  const handle = instagramHandleFromUrl(url, "");
  return handle.replace(/^@/, "").trim().toLowerCase();
}

function mapGraphMedia(items: GraphMedia[], limit: number): InstagramMediaItem[] {
  const mapped: InstagramMediaItem[] = [];

  for (const item of items) {
    if (mapped.length >= limit) break;
    const type = (item.media_type ?? "").toUpperCase();
    const image =
      type === "VIDEO" || type === "REELS"
        ? item.thumbnail_url || item.media_url
        : item.media_url || item.thumbnail_url;
    if (!image) continue;

    mapped.push({
      id: item.id,
      image,
      alt: (item.caption ?? "").trim().slice(0, 120) || "Instagram post",
      permalink: item.permalink || "",
    });
  }

  return mapped;
}

function mapWebTimeline(
  edges: Array<{ node?: WebTimelineNode }>,
  limit: number,
): InstagramMediaItem[] {
  const mapped: InstagramMediaItem[] = [];

  for (const edge of edges) {
    if (mapped.length >= limit) break;
    const node = edge.node;
    if (!node?.id) continue;
    const image = node.display_url || node.thumbnail_src;
    if (!image) continue;
    const caption =
      node.edge_media_to_caption?.edges?.[0]?.node?.text?.trim() ||
      node.accessibility_caption?.trim() ||
      "";

    mapped.push({
      id: node.id,
      image,
      alt: caption.slice(0, 120) || "Instagram post",
      permalink: node.shortcode
        ? `https://www.instagram.com/p/${node.shortcode}/`
        : "",
    });
  }

  return mapped;
}

async function fetchViaGraphApi(limit: number): Promise<InstagramMediaItem[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!token) return [];

  const userId = process.env.INSTAGRAM_USER_ID?.trim() || "me";
  const fields =
    "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
  const endpoints = [
    `https://graph.instagram.com/v21.0/${userId}/media?fields=${fields}&limit=${Math.max(limit * 2, 10)}&access_token=${encodeURIComponent(token)}`,
    `https://graph.facebook.com/v21.0/${userId}/media?fields=${fields}&limit=${Math.max(limit * 2, 10)}&access_token=${encodeURIComponent(token)}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 1800, tags: ["instagram-feed"] },
      });
      if (!res.ok) continue;
      const json = (await res.json()) as { data?: GraphMedia[] };
      const items = mapGraphMedia(json.data ?? [], limit);
      if (items.length) return items;
    } catch {
      /* try next */
    }
  }

  return [];
}

/** Public web profile endpoint — works for public business profiles without Meta app tokens. */
async function fetchViaWebProfile(
  username: string,
  limit: number,
): Promise<InstagramMediaItem[]> {
  if (!username) return [];

  try {
    const res = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          "X-IG-App-ID": "936619743392459",
          "X-ASBD-ID": "129477",
          "X-Requested-With": "XMLHttpRequest",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          Referer: `https://www.instagram.com/${username}/`,
          Origin: "https://www.instagram.com",
        },
        next: { revalidate: 1800, tags: ["instagram-feed"] },
      },
    );

    if (!res.ok) {
      console.error("[instagram] web_profile_info", res.status);
      return [];
    }

    const json = (await res.json()) as {
      data?: {
        user?: {
          edge_owner_to_timeline_media?: {
            edges?: Array<{ node?: WebTimelineNode }>;
          };
        };
      };
    };

    return mapWebTimeline(
      json.data?.user?.edge_owner_to_timeline_media?.edges ?? [],
      limit,
    );
  } catch (error) {
    console.error("[instagram] web_profile_info failed", error);
    return [];
  }
}

/**
 * Live Instagram media for the homepage gallery.
 * Prefer Graph API token when configured; otherwise fetch the public profile
 * for the Instagram URL saved in Settings.
 */
export async function getInstagramFeed(
  limit = 5,
  usernameHint?: string,
): Promise<InstagramMediaItem[]> {
  const fromGraph = await fetchViaGraphApi(limit);
  if (fromGraph.length) return fromGraph;

  let username = usernameHint?.trim().toLowerCase() ?? "";
  if (!username) {
    try {
      const cms = await readCms();
      username = usernameFromInstagramUrl(cms.business.instagram);
    } catch {
      username = "";
    }
  }

  return fetchViaWebProfile(username, limit);
}

export function instagramUsernameFromBusinessUrl(url: string) {
  return usernameFromInstagramUrl(url);
}
