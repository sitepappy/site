"use client"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export default function AboutPage() {
  const [data, setData] = useState<any>(null)
  useEffect(()=>{ api("/admin/about").then(setData).catch(()=>{}) },[])
  return (
    <div className="prose prose-invert max-w-none">
      {data ? (
        <div dangerouslySetInnerHTML={{ __html: data.contentHtml }} />
      ) : (
        <div className="text-white/60">Загрузка...</div>
      )}
      {data && (
        <div className="mt-4 flex gap-3">
          {data.links.telegram && <a className="text-acid" href={data.links.telegram} target="_blank">Telegram</a>}
          {data.links.discord && <a className="text-acid" href={data.links.discord} target="_blank">Discord</a>}
          {data.links.twitter && <a className="text-acid" href={data.links.twitter} target="_blank">Twitter</a>}
          {data.links.steam && <a className="text-acid" href={data.links.steam} target="_blank">Steam</a>}
          {data.links.youtube && <a className="text-acid" href={data.links.youtube} target="_blank">YouTube</a>}
        </div>
      )}
    </div>
  )
}
