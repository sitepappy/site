"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function CoopPage() {
  const [data, setData] = useState<any>(null)
  useEffect(()=>{ api("/public/coop").then(setData).catch(()=>{}) },[])

  return (
    <div className="glass p-6 rounded prose prose-invert max-w-none">
      {data ? (
        <>
          <div dangerouslySetInnerHTML={{ __html: data.contentHtml }} />
          <div className="mt-4 flex gap-3">
            {data.links?.telegram && <a className="text-acid underline" href={data.links.telegram} target="_blank">Telegram</a>}
            {data.links?.email && <a className="text-acid underline" href={`mailto:${data.links.email}`}>Email</a>}
          </div>
        </>
      ) : (
        <div className="text-white/60">Загрузка...</div>
      )}
    </div>
  )
}
