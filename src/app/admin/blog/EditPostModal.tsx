"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function EditPostModal({ post }: { post: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: post.title,
    content: post.content,
    seoTitle: post.seoTitle || "",
    seoDescription: post.seoDescription || "",
  });
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-xl">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-10 font-jakarta">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-3xl font-black tracking-tight uppercase">Редактировать статью</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Заголовок H1</Label>
            <Input 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-14 rounded-xl border-2 text-lg font-bold"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">SEO Title</Label>
              <Input 
                value={formData.seoTitle} 
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                className="h-12 rounded-xl border-2"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">SEO Description</Label>
              <Input 
                value={formData.seoDescription} 
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                className="h-12 rounded-xl border-2"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Содержание (HTML)</Label>
            <Textarea 
              value={formData.content} 
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="min-h-[300px] rounded-2xl border-2 font-medium leading-relaxed"
            />
          </div>
        </div>

        <DialogFooter className="mt-10 pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="rounded-xl h-12 px-6 font-bold"
          >
            ОТМЕНА
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="rounded-xl h-12 bg-primary px-8 font-black shadow-xl shadow-primary/20 transition-all hover:scale-105"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            СОХРАНИТЬ ИЗМЕНЕНИЯ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
