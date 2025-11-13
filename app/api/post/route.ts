import { NextRequest, NextResponse } from "next/server";

interface PostRequest {
  title: string;
  content: string;
  platforms: string[];
}

interface PostResult {
  platform: string;
  success: boolean;
  message: string;
}

// Simulated API posting functions
async function postToTwitter(title: string, content: string): Promise<PostResult> {
  // In production, use Twitter API v2
  // const token = process.env.TWITTER_BEARER_TOKEN;
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    platform: "Twitter/X",
    success: true,
    message: "Posted successfully (demo mode)",
  };
}

async function postToFacebook(title: string, content: string): Promise<PostResult> {
  // In production, use Facebook Graph API
  // const token = process.env.FACEBOOK_ACCESS_TOKEN;
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return {
    platform: "Facebook",
    success: true,
    message: "Posted successfully (demo mode)",
  };
}

async function postToLinkedIn(title: string, content: string): Promise<PostResult> {
  // In production, use LinkedIn API
  // const token = process.env.LINKEDIN_ACCESS_TOKEN;
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    platform: "LinkedIn",
    success: true,
    message: "Posted successfully (demo mode)",
  };
}

async function postToInstagram(title: string, content: string): Promise<PostResult> {
  // In production, use Instagram Graph API
  // const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  await new Promise((resolve) => setTimeout(resolve, 1300));

  return {
    platform: "Instagram",
    success: true,
    message: "Posted successfully (demo mode)",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: PostRequest = await request.json();
    const { title, content, platforms } = body;

    if (!title || !content || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const results: PostResult[] = [];

    // Post to each selected platform
    const postPromises = platforms.map(async (platform) => {
      switch (platform) {
        case "twitter":
          return await postToTwitter(title, content);
        case "facebook":
          return await postToFacebook(title, content);
        case "linkedin":
          return await postToLinkedIn(title, content);
        case "instagram":
          return await postToInstagram(title, content);
        default:
          return {
            platform,
            success: false,
            message: "Unknown platform",
          };
      }
    });

    const platformResults = await Promise.all(postPromises);
    results.push(...platformResults);

    const allSuccessful = results.every((r) => r.success);

    return NextResponse.json({
      success: allSuccessful,
      results,
      message: allSuccessful
        ? "Posted to all platforms successfully"
        : "Some posts failed",
    });
  } catch (error) {
    console.error("Error posting:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
