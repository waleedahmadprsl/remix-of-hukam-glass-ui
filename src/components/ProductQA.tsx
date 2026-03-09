import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ChevronDown, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question: string;
  answer: string;
  asked_by: string;
  answered_at: string | null;
  created_at: string;
}

interface Props {
  productId: string;
}

const ProductQA: React.FC<Props> = ({ productId }) => {
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [name, setName] = React.useState("");
  const [questionText, setQuestionText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    fetchQuestions();
  }, [productId]);

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from("product_questions")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(20);
    setQuestions((data || []) as Question[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("product_questions").insert({
      product_id: productId,
      question: questionText.trim(),
      asked_by: name.trim() || "Anonymous",
    });
    if (error) {
      toast({ title: "Error", description: "Could not submit question." });
    } else {
      toast({ title: "Question Submitted!", description: "We'll answer it soon." });
      setQuestionText("");
      setName("");
      setShowForm(false);
      fetchQuestions();
    }
    setSubmitting(false);
  };

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Customer Q&A</h2>
          {questions.length > 0 && (
            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{questions.length}</span>
          )}
        </div>
        <motion.button
          onClick={() => setShowForm(!showForm)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {showForm ? "Cancel" : "Ask a Question"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="glass-card p-5 rounded-2xl mb-6 space-y-3 overflow-hidden"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name (optional)"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="What would you like to know about this product?"
              required
              rows={3}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
            />
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Submitting..." : "Submit Question"}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {questions.length === 0 ? (
        <div className="glass-card p-8 rounded-2xl text-center">
          <p className="text-muted-foreground text-sm">No questions yet. Be the first to ask!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                className="w-full flex items-start justify-between p-4 text-left gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Q: {q.question}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Asked by {q.asked_by} · {new Date(q.created_at).toLocaleDateString()}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${expandedId === q.id ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {expandedId === q.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-border pt-3">
                      {q.answer ? (
                        <div>
                          <p className="text-sm text-foreground"><strong className="text-primary">A:</strong> {q.answer}</p>
                          {q.answered_at && (
                            <p className="text-xs text-muted-foreground mt-1">Answered on {new Date(q.answered_at).toLocaleDateString()}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Answer pending — we'll respond soon!</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductQA;
