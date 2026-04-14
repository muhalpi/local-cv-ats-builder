const fullNameInput = document.getElementById("fullName");
const headlineInput = document.getElementById("headline");
const summaryInput = document.getElementById("summary");
const loadSampleButton = document.getElementById("load-sample");

const previewName = document.getElementById("preview-name");
const previewHeadline = document.getElementById("preview-headline");
const previewSummary = document.getElementById("preview-summary");

function updatePreview() {
  previewName.textContent = fullNameInput.value || "Your Name";
  previewHeadline.textContent = headlineInput.value || "Your Headline";
  previewSummary.textContent = summaryInput.value || "Your summary will appear here.";
}

[fullNameInput, headlineInput, summaryInput].forEach((input) => {
  input.addEventListener("input", updatePreview);
});

loadSampleButton.addEventListener("click", async () => {
  const response = await fetch("./data/sample-resume.json");
  const sample = await response.json();

  fullNameInput.value = sample.fullName;
  headlineInput.value = sample.headline;
  summaryInput.value = sample.summary;
  updatePreview();
});
