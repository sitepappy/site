"use client"
import { useState } from "react"
import { api } from "../../lib/api"
import Link from "next/link"

export default function PostCard({ post }: { post: any }) {
  const [comments, setComments] = useState(post.comments || [])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const author = post.author || { username: "PAPPY", avatar: null, role: "admin" }

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
      <div className="flex items-center gap-3 mb-4">
        <Link href={author.id ? `/profile/${author.id}` : "#"} className="group flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center text-neon font-black text-lg group-hover:border-neon transition-colors shadow-lg">
            {author.avatar ? (
              <img src={author.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{author.username?.[0]?.toUpperCase() || "P"}</span>
            )}
          </div>
          <div>
            <div className={`text-sm font-black tracking-tight group-hover:text-neon transition-colors ${author.role === 'admin' ? 'text-acid' : author.role === 'moderator' ? 'text-blue-400' : 'text-white'}`}>
              {author.username}
              {author.role === 'admin' && <span className="ml-2 text-[8px] bg-acid/20 text-acid px-1 rounded uppercase">Admin</span>}
            </div>
            <div className="text-[10px] text-white/30 font-mono">{new Date(post.createdAt).toLocaleString()}</div>
          </div>
        </Link>
      </div>
      
      {post.title && <h3 className="text-xl font-black mb-3 text-white tracking-tight">{post.title}</h3>}
      <p className="text-white/70 leading-relaxed whitespace-pre-wrap text-sm">{post.content}</p>
      
      {post.imageUrl && (
        <div className="mt-4 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          <img src={post.imageUrl} alt="" className="w-full object-cover max-h-[500px]" />
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-neon transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {showComments ? "Скрыть" : `Комментарии (${comments.length})`}
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 border-t border-white/5 pt-4">
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.map((c: any) => (
              <div key={c.id} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-neon overflow-hidden">
                  {c.avatar ? <img src={c.avatar} alt="" className="w-full h-full object-cover" /> : c.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black text-white">{c.username}</span>
                    <span className="text-[9px] text-white/20 font-mono">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                    <p className="text-[12px] text-white/70 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {comments.length === 0 && <p className="text-[10px] text-white/20 italic text-center py-4">Пока нет комментариев...</p>}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2 mt-4">
            <input 
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Написать комментарий..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-xs outline-none focus:border-neon transition-colors"
            />
            <button 
              disabled={loading}
              className="btn btn-primary px-5 py-2.5 text-[10px] uppercase font-black italic tracking-wider"
            >
              {loading ? "..." : "Отправить"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
