import { Tldraw, useEditor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

function SaveButton({ date }) {
  const editor = useEditor();

  const save = async () => {
    const snapshot = editor.store.getSnapshot();

    await fetch("/.netlify/functions/saveCanvas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        date,
        data: snapshot
      })
    });

    alert("画布已保存");
  };

  return (
    <button
      onClick={save}
      className="absolute top-4 left-4 z-50 bg-black text-white px-4 py-2 rounded"
    >
      保存画布
    </button>
  );
}

export default function CanvasEditor({ date }) {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw>
        <SaveButton date={date} />
      </Tldraw>
    </div>
  );
}
