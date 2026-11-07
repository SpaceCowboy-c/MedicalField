from fastapi import FastAPI

app = FastAPI(title="MedicalField - Documentos")


@app.get("/health")
def health():
    return {"status": "ok", "servico": "docs"}