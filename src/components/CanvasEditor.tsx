import { Tldraw } from "@tldraw/tldraw"
import "@tldraw/tldraw/tldraw.css"
import { useEffect, useState } from "react"
import { saveCanvas, loadCanvas } from "@/lib/githubCanvas"

export default function CanvasEditor({ date }) {

  const [snapshot, setSnapshot] = useState(null)

  useEffect(() => {
    const load = async () => {
      const data = await loadCanvas(date)
      setSnapshot(data)
    }

    load()
  }, [date])

  const handleMount = (editor) => {

    const btn = document.createElement("button")

    btn.innerText = "保存画布"

    btn.style.position = "absolute"
    btn.style.top = "20px"
    btn.style.left = "20px"
    btn.style.zIndex = "1000"
    btn.style.padding = "10px"
    btn.style.background = "black"
    btn.style.color = "white"

    btn.onclick = async () => {

      const data = editor.store.getSnapshot()

      await saveCanvas(date, data)

      alert("画布已保存")
    }

    document.body.appendChild(btn)
  }

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        snapshot={snapshot}
        onMount={handleMount}
      />
    </div>
  )
}
