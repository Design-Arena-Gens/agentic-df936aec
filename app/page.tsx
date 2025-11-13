"use client";

import { useState } from "react";
import { Send, Twitter, Facebook, Linkedin, Instagram, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface Post {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  status: "pending" | "posting" | "success" | "failed";
  timestamp: Date;
  results: { platform: string; success: boolean; message: string }[];
}

export default function Home() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  const platforms = [
    { id: "twitter", name: "Twitter/X", icon: Twitter, color: "bg-blue-500" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "bg-blue-600" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "bg-blue-700" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-pink-500" },
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePost = async () => {
    if (!title || !content || selectedPlatforms.length === 0) {
      alert("Please fill in all fields and select at least one platform");
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      title,
      content,
      platforms: selectedPlatforms,
      status: "posting",
      timestamp: new Date(),
      results: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    setIsPosting(true);

    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          platforms: selectedPlatforms,
        }),
      });

      const data = await response.json();

      setPosts((prev) =>
        prev.map((p) =>
          p.id === newPost.id
            ? {
                ...p,
                status: data.success ? "success" : "failed",
                results: data.results,
              }
            : p
        )
      );

      if (data.success) {
        setTitle("");
        setContent("");
        setSelectedPlatforms([]);
      }
    } catch (error) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === newPost.id
            ? {
                ...p,
                status: "failed",
                results: [{ platform: "all", success: false, message: "Network error" }],
              }
            : p
        )
      );
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Social Media Blog Automation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Post your blog content to multiple platforms simultaneously
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Composer */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Create New Post
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Post Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your blog post title..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Post Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog post content here..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Platforms
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? `${platform.color} text-white border-transparent`
                            : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{platform.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handlePost}
                disabled={isPosting}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-5 h-5" />
                {isPosting ? "Posting..." : "Post to Selected Platforms"}
              </button>
            </div>
          </div>

          {/* Posts History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Post History
            </h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {posts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No posts yet. Create your first post!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {post.title}
                      </h3>
                      {post.status === "success" && (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                      {post.status === "failed" && (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                      {post.status === "posting" && (
                        <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 animate-spin" />
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {post.content}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {post.platforms.map((platformId) => {
                        const platform = platforms.find((p) => p.id === platformId);
                        if (!platform) return null;
                        const Icon = platform.icon;
                        return (
                          <span
                            key={platformId}
                            className={`${platform.color} text-white text-xs px-2 py-1 rounded flex items-center gap-1`}
                          >
                            <Icon className="w-3 h-3" />
                            {platform.name}
                          </span>
                        );
                      })}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {format(post.timestamp, "MMM d, yyyy 'at' h:mm a")}
                    </p>

                    {post.results.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Results:
                        </p>
                        <div className="space-y-1">
                          {post.results.map((result, idx) => (
                            <div
                              key={idx}
                              className="text-xs flex items-center gap-2"
                            >
                              {result.success ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : (
                                <XCircle className="w-3 h-3 text-red-500" />
                              )}
                              <span className="text-gray-600 dark:text-gray-400">
                                {result.platform}: {result.message}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            Configure your API keys in the environment variables to enable posting
          </p>
          <p className="text-xs">
            Supports: Twitter/X API, Facebook Graph API, LinkedIn API, Instagram Graph API
          </p>
        </footer>
      </div>
    </div>
  );
}
