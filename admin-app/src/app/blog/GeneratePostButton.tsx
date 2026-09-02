"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateBlogPosts } from "@/lib/api";

export function GeneratePostButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateBlogPosts();
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerate} 
      disabled={loading}
      className="h-11 rounded-xl bg-primary px-6 font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      {loading ? "ГЕНЕРАЦИЯ..." : "СОЗДАТЬ 10 СТАТЕЙ"}
    </Button>
  );
}
