function saveKnowledgeInput(filePath, segmentIndex, questionIndex, value) {
  if (!db[filePath]) {
    db[filePath] = {
      segments: Array(5)
        .fill()
        .map(() => ({ questions: Array(5).fill(null) })),
    };
  }
  db[filePath].segments[segmentIndex].questions[questionIndex] = value;
  console.log("Knowledge levels updated:", db);
  localStorage.setItem("knowledgeLevels", JSON.stringify(db));
}

function saveExpandedState(path, isExpanded) {
  if (isExpanded) {
    expandedState[path] = true;
  } else {
    delete expandedState[path];
  }
  localStorage.setItem("expandedState", JSON.stringify(expandedState));
}
