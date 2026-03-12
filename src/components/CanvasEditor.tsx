import { Tldraw } from "@tldraw/tldraw"
import "@tldraw/tldraw/tldraw.css"
import { useEffect, useState, useRef } from "react"
import { saveCanvas, loadCanvas } from "@/lib/githubCanvas"

export default function CanvasEditor({ date }) {

  const [snapshot, setSnapshot] = useState(null)
  const saveTimeout = useRef(null)

  useEffect(() => {
    const load = async () => {
      const data = await loadCanvas(date)
      setSnapshot(data)
    }

    load()
  }, [date])

  const handleMount = (editor) => {

    editor.store.listen(() => {

      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current)
      }

      saveTimeout.current = setTimeout(async () => {

        const data = editor.getSnapshot()

        await saveCanvas(date, data)

        console.log("自动保存成功")

      }, 2000)

    })

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
