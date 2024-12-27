document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("file-browser");
  renderTree(container, "", false).then(() => {
    // Restore expanded state after initial render
    for (const path in expandedState) {
      if (expandedState[path]) {
        const folderElement = document.querySelector(
          `.folder:contains(${path.split("/").pop()})`
        );
        if (folderElement) {
          folderElement.click();
        }
      }
    }
  });
});
