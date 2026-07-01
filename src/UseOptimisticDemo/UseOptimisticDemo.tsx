/**
 * useOptimistic (React 19) — instant UI feedback before server confirms
 *
 * Shows a temporary "optimistic" state immediately, then reconciles
 * with the real state once the async action completes — auto-reverts
 * on failure.
 *
 *   const [optimisticState, addOptimistic] = useOptimistic(
 *     actualState,
 *     (currentState, optimisticValue) => mergeLogic(currentState, optimisticValue)
 *   );
 *
 * Why not just setState manually?
 * - useOptimistic auto-reverts to actualState if the action fails or
 *   actualState updates from elsewhere — no manual rollback code needed
 * - Cleanly separates "what server confirmed" vs "what user just did"
 *
 * Pattern 1 — Like button     : instant heart fill, revert on failure
 * Pattern 2 — Comment post    : show comment instantly, pending → confirmed/failed
 */

import { useState, useOptimistic, useRef } from "react";
import type { FormEvent } from "react";
import "./UseOptimisticDemo.css";

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 1 — Like button with optimistic toggle
// ═══════════════════════════════════════════════════════════════════════════════

// Simulates a server call — randomly fails 30% of the time for demo purposes
async function fakeLikeRequest(liked: boolean): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 700));
  if (Math.random() < 0.3) throw new Error("Network error");
  return liked;
}

function LikeButtonDemo() {
  // actualLiked — the real, server-confirmed state
  const [actualLiked, setActualLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(248);
  const [error, setError] = useState<string | null>(null);

  // optimisticLiked — shows instantly, auto-reverts to actualLiked if action fails
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(
    actualLiked,
    (_current, newValue: boolean) => newValue, // merge fn — just take the new value
  );

  async function handleLike() {
    const next = !actualLiked;
    setError(null);

    // Instantly show optimistic state — UI updates before server responds
    setOptimisticLiked(next);

    try {
      const confirmed = await fakeLikeRequest(next);
      // Server confirmed — update real state, optimistic auto-syncs
      setActualLiked(confirmed);
      setLikeCount((c) => c + (confirmed ? 1 : -1));
    } catch {
      // Failure — actualLiked never changed, so optimisticLiked auto-reverts back
      setError("Failed to update. Reverted.");
    }
  }

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 1</p>
      <p className="demo__title">
        Like button — instant feedback, auto-revert on failure
      </p>

      <div className="like-row">
        <button
          className={`like-btn${optimisticLiked ? " like-btn--active" : ""}`}
          onClick={handleLike}
        >
          {optimisticLiked ? "❤️" : "🤍"} {optimisticLiked ? "Liked" : "Like"}
        </button>
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          {likeCount} likes
        </span>
      </div>

      {error && (
        <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{error}</p>
      )}

      <p className="demo__note">
        When the heart button is clicked, it is filled immediately without
        waiting for the server response, providing instant visual feedback
        through an optimistic update. If the request fails (there is a 30%
        chance in this demo—try clicking multiple times),{" "}
        <code>optimisticLiked</code> automatically reverts to{" "}
        <code>actualLiked</code>, restoring the last confirmed server state
        without requiring manual rollback logic.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pattern 2 — Comment post with pending/failed states
// ═══════════════════════════════════════════════════════════════════════════════

interface Comment {
  id: string;
  text: string;
  status: "sent" | "pending" | "failed";
}

const INITIAL_COMMENTS: Comment[] = [
  { id: "1", text: "Great explanation of hooks!", status: "sent" },
  { id: "2", text: "This helped me in my interview 🙌", status: "sent" },
];

// Simulates posting a comment to server — 25% chance of failure
async function fakePostComment(): Promise<void> {
  await new Promise((r) => setTimeout(r, 1200));
  if (Math.random() < 0.25) throw new Error("Failed to post");
}

function CommentDemo() {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [input, setInput] = useState("");
  const idRef = useRef(2);

  // optimisticComments — actual comments + any pending ones appended instantly
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (currentComments, newComment: Comment) => [...currentComments, newComment],
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    idRef.current += 1;
    const tempId = `temp-${idRef.current}`;
    setInput("");

    // Show comment INSTANTLY with "pending" status — before server confirms
    addOptimisticComment({ id: tempId, text, status: "pending" });

    try {
      await fakePostComment();
      // Success — add to real state, optimistic syncs automatically
      setComments((prev) => [...prev, { id: tempId, text, status: "sent" }]);
    } catch {
      // Failure — show as failed in real state (optimistic reverts to this)
      setComments((prev) => [...prev, { id: tempId, text, status: "failed" }]);
    }
  }

  function retryComment(comment: Comment) {
    setComments((prev) => prev.filter((c) => c.id !== comment.id));
    addOptimisticComment({ ...comment, status: "pending" });
    fakePostComment()
      .then(() =>
        setComments((prev) => [...prev, { ...comment, status: "sent" }]),
      )
      .catch(() =>
        setComments((prev) => [...prev, { ...comment, status: "failed" }]),
      );
  }

  return (
    <div className="demo__section">
      <p className="demo__label">Pattern 2</p>
      <p className="demo__title">
        Comment post — instant display, pending → sent/failed
      </p>

      <form className="input-row" onSubmit={handleSubmit}>
        <input
          className="field-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a comment..."
        />
        <button
          type="submit"
          className="btn btn--primary"
          disabled={!input.trim()}
        >
          Post
        </button>
      </form>

      <div className="comment-list">
        {optimisticComments.map((c) => (
          <div
            key={c.id}
            className={`comment${c.status !== "sent" ? ` comment--${c.status}` : ""}`}
          >
            <div className="comment__avatar">👤</div>
            <div className="comment__body">
              <p className="comment__text">{c.text}</p>
              <p className="comment__meta">
                {c.status === "pending" && (
                  <>
                    <span className="spinner-sm" /> Posting...
                  </>
                )}
                {c.status === "failed" && (
                  <>
                    ⚠️ Failed to send
                    <button
                      className="retry-btn"
                      onClick={() => retryComment(c)}
                    >
                      Retry
                    </button>
                  </>
                )}
                {c.status === "sent" && "Just now"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="demo__note">
        When a comment is submitted, it appears in the list immediately as a{" "}
        <code>pending</code> item with a dimmed appearance, providing instant
        user feedback. After the server responds, the comment is updated
        automatically: on success, its status changes to <code>sent</code>; on
        failure, it becomes <code>failed</code> and displays a{" "}
        <strong>Retry</strong> button. This optimistic update flow eliminates
        the need for manually splicing arrays or writing rollback logic.
      </p>

      <p className="demo__warning">
        ⚠️ <strong>Best used with Form Actions:</strong> In React 19,{" "}
        <code>useOptimistic</code> is commonly paired with{" "}
        <code>useActionState</code> and form actions to provide immediate UI
        feedback while waiting for the server's final response. This example
        demonstrates the same concept using a manual asynchronous operation.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function UseOptimisticDemo() {
  return (
    <div className="demo">
      <LikeButtonDemo />
      <CommentDemo />
    </div>
  );
}
