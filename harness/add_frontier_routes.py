import re

with open("services/mediator/app.py", "r", encoding="utf-8") as f:
    content = f.read()

# Add imports
import_addition = """from services.mediator.seal_leaderboard import get_seal_leaderboard, generate_model_attestation_certificate
from services.mediator.constitutional_redteam import get_constitutional_rules, generate_redteam_probes
from services.mediator.guard_analyzer import scan_prompt_threat
"""

if "services.mediator.seal_leaderboard" not in content:
    content = content.replace("from services.mediator.tinyfish_sentinel import TinyFishSentinel\n", "from services.mediator.tinyfish_sentinel import TinyFishSentinel\n" + import_addition)

# Add request models and endpoints before if __name__ == "__main__":
routes_code = """

class RedTeamGenerateRequest(BaseModel):
    vector_category: Optional[str] = None
    count: int = Field(default=3, ge=1, le=10)


class GuardScanRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=25000)


@app.get("/api/leaderboard")
async def get_leaderboard():
    return get_seal_leaderboard()


@app.get("/api/leaderboard/{model_id}/certificate")
async def get_model_certificate(model_id: str):
    return generate_model_attestation_certificate(model_id, runner.fingerprint)


@app.get("/api/constitutional/rules")
async def get_constitutional_axioms():
    return get_constitutional_rules()


@app.post("/api/redteam/generate")
async def generate_adversarial_probes(req: RedTeamGenerateRequest = RedTeamGenerateRequest()):
    return generate_redteam_probes(vector_category=req.vector_category, count=req.count)


@app.post("/api/guard/scan")
async def analyze_prompt_threat(req: GuardScanRequest):
    return scan_prompt_threat(req.prompt)
"""

if "/api/leaderboard" not in content:
    content = content.replace('if __name__ == "__main__":', routes_code + '\nif __name__ == "__main__":')

with open("services/mediator/app.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully injected frontier model routes.")
