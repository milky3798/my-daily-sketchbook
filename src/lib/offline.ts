export function saveOffline(entry) {
  const data = JSON.parse(
    localStorage.getItem("offline-journals") || "[]"
  );

  data.push(entry);

  localStorage.setItem(
    "offline-journals",
    JSON.stringify(data)
  );
}
