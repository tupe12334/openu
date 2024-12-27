async function fetchFileStructure(path = "") {
  // Check if the path exists in cache
  if (fileStructureCache[path]) {
    console.log("Loaded from cache:", path);
    return fileStructureCache[path];
  }

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to load folder: ${path}`);
      throw new Error(`Failed to load folder: ${path}`);
    }

    const data = await response.json();
    fileStructureCache[path] = data; // Cache the result
    localStorage.setItem(
      "fileStructureCache",
      JSON.stringify(fileStructureCache)
    );
    localStorage.setItem("fileStructureCacheTimestamp", now); // Update cache timestamp
    return data;
  } catch (error) {
    console.error(`Error loading folder ${path}:`, error);
    throw error;
  }
}

async function renderTree(container, path = "", recursive = false) {
  let files;
  try {
    files = await fetchFileStructure(path);
  } catch (error) {
    const errorMessage = document.createElement("div");
    errorMessage.classList.add("error-message");
    errorMessage.textContent =
      "Error loading folder contents. Please try reloading.";
    container.appendChild(errorMessage);
    return;
  }

  const ul = document.createElement("ul");
  container.appendChild(ul);

  for (const file of files) {
    const li = document.createElement("li");

    if (file.type === "dir") {
      li.innerHTML = `<span class="folder">${file.name}</span>`;

      const reloadButton = document.createElement("span");
      reloadButton.classList.add("reload-button");
      reloadButton.textContent = "🔄";
      reloadButton.title = "לחץ לרענון תיקייה (קורה אוטומטית פעם ביום)";

      reloadButton.addEventListener("click", async (event) => {
        event.stopPropagation(); // Prevent triggering folder toggle
        clearCacheForPath(file.path);
        const existingUl = li.querySelector("ul");
        if (existingUl) {
          existingUl.remove();
        }
        await renderTree(li, file.path, recursive);
      });

      li.appendChild(reloadButton);

      li.querySelector(".folder").addEventListener("click", async (event) => {
        event.stopPropagation(); // Prevent event bubbling
        const existingUl = li.querySelector("ul");
        if (existingUl) {
          existingUl.remove(); // Collapse the folder
          saveExpandedState(file.path, false);
        } else {
          // Expand the folder and optionally load recursively
          await renderTree(li, file.path, recursive);
          saveExpandedState(file.path, true);
        }
      });

      if (expandedState[file.path]) {
        await renderTree(li, file.path, recursive); // Load recursively if previously expanded
      }
    } else {
      // Create a link to open the file's GitHub page in another tab
      li.innerHTML = `<a class="file" href="https://github.com/${repoOwner}/${repoName}/blob/main/${file.path}" target="_blank">${file.name}</a>`;

      // Add inputs for 5 segments and 5 questions each only for .pdf and picture file types
      if (
        /\.pdf$|\.(png|jpe?g|gif|bmp|webp)$/i.test(file.name) &&
        !path.includes("info")
      ) {
        // Exclude knowledge levels inside 'info' folder
        const segmentsContainer = document.createElement("div");
        segmentsContainer.classList.add("knowledge-input");

        const segmentNames = ["סעיף א", "סעיף ב", "סעיף ג", "סעיף ד", "סעיף ה"];

        for (let segmentIndex = 0; segmentIndex < 5; segmentIndex++) {
          const segmentDiv = document.createElement("div");
          segmentDiv.textContent = segmentNames[segmentIndex];

          const questionHeader = document.createElement("div");
          questionHeader.style.fontWeight = "bold";
          questionHeader.textContent = "שאלות:";
          segmentDiv.appendChild(questionHeader);

          for (let questionIndex = 0; questionIndex < 5; questionIndex++) {
            const input = document.createElement("input");
            input.type = "number";
            input.min = "1";
            input.max = "5";
            input.placeholder = `שאלה ${questionIndex + 1}`;
            input.value =
              db[file.path]?.segments?.[segmentIndex]?.questions?.[
                questionIndex
              ] || "";

            input.addEventListener("input", (event) => {
              saveKnowledgeInput(
                file.path,
                segmentIndex,
                questionIndex,
                event.target.value
              );
            });

            segmentDiv.appendChild(input);
          }

          segmentsContainer.appendChild(segmentDiv);
        }

        li.appendChild(segmentsContainer);
      }
    }

    ul.appendChild(li);
  }
}
