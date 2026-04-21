# Documentations

This repo stores all the information about everything that I will be reading (from documentations to articles).

You can reach the site at <https://shardullearnt.netlify.app/main.html>

## Dev Server

```bash
python3 -m http.server 8000
```

## To-do

1. Make the main-content div draggable and accordingly resize the table-of-content div.

## Rules for `quiz.json`

- **Case:** All lowercase
- **Multi‑word:** Hyphen‑separated (e.g., cloud-native, api-security)
- **Hierarchy:** Use separate tags instead of colon notation (e.g., ["cloud", "aws"] rather than "cloud:aws")
- **Controlled vocabulary:** Maintain a master list to avoid duplicates like secrets-management vs secret-mgmt
- **Number of tags per question:** No fixed limit; typically 1–10 depending on the question
- **Filtering:** Support AND/OR combinations in the web app

Example:

```json
{
  "meta": {
    "topic": "Cloud Native & DevOps",
    "version": 1
  },
  "questions": [
    {
      "id": "a1b2c3d4-...",
      "question": "Which technique is most effective for securely storing secrets?",
      "options": [
        "Hardcoding them in environment variables",
        "Storing them in a dedicated secrets management service",
        "Encrypting them and storing in a config file",
        "Embedding them in the container image"
      ],
      "answer": 1,
      "explanation": "A **secrets management service** (e.g., `HashCorp Vault`, `AWS Secrets Manager`) provides centralized, auditable access control with **encryption at rest** and **in transit**.\n\n_Always avoid hardcoded secrets._",
      "tags": ["secrets-management", "security", "cloud-native", "aws"]
    }
  ]
}
```
