import { useAuth } from "../../contexts/auth";
import { Jobs, Notifications } from "../../services/store";
import { Section } from "@/components/ui-bits";
import { Star, MessageSquareCode, ThumbsUp, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { apiRequest } from "../../api/api";

export function Feedback() {
  const { session } = useAuth();
  const jobs = Jobs.all();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [tick, setTick] = useState(0);

  const reviews = useMemo(() => {
    return jobs
      .filter(j => j.rating)
      .map(j => ({
        id: j.id,
        customerName: j.customerName,
        device: `${j.brand} ${j.model}`,
        stars: j.rating!.stars,
        comment: j.rating!.comment,
        date: j.completedAt || j.jobDate,
      }));
  }, [jobs, tick]);

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error("Please enter a comment");

    try {
      await apiRequest("/api/customers/feedback/", {
        method: "POST",
        body: JSON.stringify({ rating, comment }),
      });

      await Notifications.push({
        type: "feedback_submitted",
        title: "New Shop Feedback",
        message: `${session?.name || "Customer"} submitted a ${rating}-star feedback.`,
        actorName: session?.name,
        actorRole: session?.role,
      });

      toast.success("Thank you for your valuable feedback!");
      setComment("");
      setRating(5);
      setTick(t => t + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit feedback");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Feedback & Reviews</h1>
        <p className="text-sm text-muted-foreground">What our valued clients say about Amit Mobile World</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column: Feedbacks */}
        <div className="md:col-span-2 space-y-4">
          <Section title="Recent Testimonials">
            <div className="space-y-4">
              {reviews.map(rev => (
                <div key={rev.id} className="p-4 rounded-xl border border-border bg-card/60 space-y-2 hover:shadow-card transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-sm">{rev.customerName}</div>
                      <div className="text-xs text-muted-foreground">{rev.device}</div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`size-3.5 ${rev.stars >= star ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic font-medium">"{rev.comment}"</p>
                  <div className="text-[10px] text-muted-foreground">{new Date(rev.date).toLocaleDateString("en-IN")}</div>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">No customer testimonials recorded.</div>
              )}
            </div>
          </Section>
        </div>

        {/* Right column: Leave feedback form */}
        <div className="space-y-4">
          <Section title="Submit Shop Feedback">
            <form onSubmit={submitFeedback} className="space-y-4">
              <div className="flex justify-center gap-1.5 my-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                    <Star className={`size-7 ${rating >= star ? "fill-yellow-500 text-yellow-500 scale-110" : "text-muted-foreground"} transition-transform`} />
                  </button>
                ))}
              </div>
              <div>
                <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Tell us about your experience..." rows={4} required />
              </div>
              <Button type="submit" className="w-full"><Send className="size-4" /> Send Testimonial</Button>
            </form>
          </Section>
        </div>
      </div>
    </div>
  );
}
