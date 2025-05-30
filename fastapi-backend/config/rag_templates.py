# config/rag_templates.py
from typing import Dict

TEMPLATES: Dict[str, Dict[str, str]] = {
  "biophysics": {
     "title":    "A concise, 5-8 word, Title-Case scientific title",
     "decription":  "A comprehensive one paragraph summary of the scientific article. The summary should include the scientific assays used, factors studied, results.\n Do not provide a preamble.",
     "keywords": "List 4-6 terms capturing the study's topics",
  },
  "geology": {
     "title":    "A concise, 5-8 word, Title-Case geoscience title",
     "decription":  "A 2-sentence overview of the study's findings",
     "studies" : "Summarize the goals of the study",
     "keywords": "List 4-6 terms capturing the study's topics",
     "rocks":    "Name the main rock types analyzed",
     "methods":  "Brief description of the sampling or lab methods"
  },
  # …etc…
}
