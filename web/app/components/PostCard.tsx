"use client"
import { useState } from "react"
import { api } from "../../lib/api"

export default function PostCard({ post }: { post: any }) {
  const [comments, setComments] = useState(post.comments || [])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const handleAddComment = async (e: any) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setLoading(true)
    try {
      const res = await api(`/posts/${post.id}/comment`, {
        method: "POST",
        body: JSON.stringify({ content: newComment })
      })
      setComments([...comments, res])
      setNewComment("")
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass p-5 rounded-lg border border-white/5 hover:border-neon/30 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-neon/20 flex items-center justify-center text-neon font-bold">P</div>
        <div>
          <div className="text-sm font-bold">PAPPY</div>
          <div className="text-[10px] text-white/40">{new Date(post.createdAt).toLocaleString()}</div>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">{post.title}</h3>
      <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="" className="mt-4 rounded-lg w-full object-cover max-h-96 border border-white/10" />
      )}

      <div className="mt-4 pt-4 border-t border-white/5">
        <button 
          onClick={() => setShowComments(!showComments)}
          className="text-xs text-white/40 hover:text-neon transition-colors font-bold uppercase"
        >
          {showComments ? "Скрыть комментарии" : `Комментарии (${comments.length})`}
        </button>

        {showComments && (
          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-3">
              {comments.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-neon">{c.username}</span>
                      <span className="text-[8px] text-white/30">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-white/70">{c.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-xs text-white/30 italic">Пока нет комментариев...</p>}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 mt-4">
              <input 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Написать комментарий..."
                className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs outline-none focus:border-neon transition-colors"
              />
              <button 
                disabled={loading}
                className="btn btn-primary px-4 py-2 text-[10px] uppercase font-bold"
              >
                {loading ? "..." : "Отправить"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
