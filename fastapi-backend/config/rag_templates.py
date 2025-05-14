# app/config/rag_templates.py
from typing import Dict

TEMPLATES: Dict[str, Dict[str, str]] = {
  "biophysics": {
     "title":    "A concise, 5-8 word, Title-Case scientific title",
     "decription":  "A 2-sentence overview of the main findings",
     "studies" : "Summarize the goals of the study",
     "keywords": "List 4-6 terms capturing the study's topics",
     "species":  "Name any species used in the experiments",
     "methods":  "Brief description of the experimental methods"
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
