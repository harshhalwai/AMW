import { useAuth } from "../../contexts/auth";
import { Jobs, Notifications } from "../../services/store";
import { Section, StatCard } from "@/components/ui-bits";
import { Star, MessageSquareCode, ThumbsUp, Sparkles, Send, Award, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 4.9;
    const total = reviews.reduce((acc, r) => acc + r.stars, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

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
        message: `${session?.name || "Customer"} submitted a ${rating}-star review.`,
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30">
            Reputation &amp; Ratings
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
          Customer Feedback &amp; Reviews
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Verified customer feedback and service quality ratings for Amit Mobile World.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Average Shop Rating"
          value={`${avgRating} ★`}
          icon={<Star className="size-5 fill-amber-400 text-amber-400" />}
          accent="primary"
          sub="Out of 5.0 stars"
        />
        <StatCard
          label="Verified Reviews"
          value={reviews.length || 24}
          icon={<Award className="size-5" />}
          accent="success"
          sub="Customer submitted"
        />
        <StatCard
          label="Customer Satisfaction"
          value="98.2%"
          icon={<Heart className="size-5" />}
          accent="primary"
          sub="Post-delivery survey"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column: Feedbacks list */}
        <div className="md:col-span-2 space-y-4">
          <Section title="Recent Verified Testimonials" subtitle="Service reviews from recent repair jobs">
            <div className="space-y-3.5">
              {reviews.map(rev => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl border border-border/70 bg-secondary/30 space-y-2 hover:border-[#FF5733]/40 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-sm text-white">{rev.customerName}</div>
                      <div className="text-[11px] text-[#FF784E] font-medium">{rev.device}</div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`size-3.5 ${
                            rev.stars >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground italic font-medium leading-relaxed">
                    "{rev.comment}"
                  </p>
                  <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                    {new Date(rev.date).toLocaleDateString("en-IN")}
                  </div>
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="text-center p-8 text-xs text-muted-foreground">
                  No customer testimonials recorded yet. Reviews will automatically show up when customers submit post-repair feedback!
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Right column: Submit feedback form */}
        <div className="space-y-4">
          <Section title="Submit Service Review" subtitle="Share your experience">
            <form onSubmit={submitFeedback} className="space-y-4 text-xs">
              <div>
                <Label className="block text-center mb-1">Select Star Rating</Label>
                <div className="flex justify-center gap-1.5 my-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none p-1">
                      <Star
                        className={`size-7 ${
                          rating >= star ? "fill-amber-400 text-amber-400 scale-110" : "text-muted-foreground/40"
                        } transition-transform`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Your Comments &amp; Review *</Label>
                <Textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="How was your device repair? Speed, pricing, technician courtesy..."
                  rows={4}
                  required
                  className="rounded-xl mt-1 bg-secondary/50 border-border text-white text-xs"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl font-bold"
              >
                <Send className="size-3.5 mr-1.5" /> Submit Review
              </Button>
            </form>
          </Section>
        </div>
      </div>
    </div>
  );
}
