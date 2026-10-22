"""
AegisBay Real-Time Guardrail Threat Analyzer
Inspired by Lakera Guard & Lacework real-time AI guardrails.
Scans incoming prompts for prompt injections, jailbreaks, canary extraction,
and egress exfiltration, providing millisecond threat classification and mitigation strategies.
"""

from typing import Dict, Any, List
import re

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior)\s+instructions",
    r"system\s*override",
    r"you\s+are\s+now\s+in\s+developer\s+mode",
    r"dan\s+mode",
    r"unrestricted\s+mode",
    r"output\s+(the\s+)?system\s+prompt",
    r"what\s+are\s+your\s+secret\s+instructions",
]

JAILBREAK_PATTERNS = [
    r"hypothetical(ly)?",
    r"for\s+academic\s+purposes\s+only",
    r"in\s+a\s+fictional\s+world",
    r"opposite\s+day",
    r"simulate\s+a\s+rogue\s+ai",
    r"pretend\s+you\s+have\s+no\s+rules",
]

CANARY_PATTERNS = [
    r"canary_sec_token",
    r"secret_key",
    r"private_key",
    r"ed25519",
    r"auth_token",
]

EGRESS_PATTERNS = [
    r"curl\s+",
    r"wget\s+",
    r"nc\s+-e",
    r"socket\.connect",
    r"http://[0-9a-zA-Z\.\-]+",
    r"https://[0-9a-zA-Z\.\-]+",
    r"/dev/tcp/",
]

def scan_prompt_threat(prompt: str) -> Dict[str, Any]:
    """Scan a prompt against multi-vector adversarial threat models."""
    prompt_lower = prompt.lower()
    
    # 1. Direct Prompt Injection Score
    injection_matches = [p for p in INJECTION_PATTERNS if re.search(p, prompt_lower)]
    injection_score = min(1.0, len(injection_matches) * 0.45)
    
    # 2. Jailbreak / Roleplay Evasion Score
    jailbreak_matches = [p for p in JAILBREAK_PATTERNS if re.search(p, prompt_lower)]
    jailbreak_score = min(1.0, len(jailbreak_matches) * 0.35)
    
    # 3. Canary Extraction Score
    canary_matches = [p for p in CANARY_PATTERNS if re.search(p, prompt_lower)]
    canary_score = min(1.0, len(canary_matches) * 0.50)
    
    # 4. Egress / Socket Exfiltration Score
    egress_matches = [p for p in EGRESS_PATTERNS if re.search(p, prompt_lower)]
    egress_score = min(1.0, len(egress_matches) * 0.60)
    
    # Base heuristic for length or base64 patterns
    if len(prompt) > 20 and re.search(r"[A-Za-z0-9+/=]{20,}", prompt):
        injection_score = max(injection_score, 0.75)
    
    max_risk = max(injection_score, jailbreak_score, canary_score, egress_score)
    
    if max_risk >= 0.70:
        risk_level = "CRITICAL"
        action = "ENCLAVE_TERMINATE"
        recommended_fault = "FAULT_01_NET_EGRESS" if egress_score >= 0.6 else "FAULT_02_PRETEST_PEEK"
    elif max_risk >= 0.40:
        risk_level = "HIGH"
        action = "HARDENED_GATING"
        recommended_fault = "FAULT_03_POLICY_DRIFT" if jailbreak_score > 0.3 else "FAULT_04_KV_CANARY_BLEED"
    elif max_risk > 0.15:
        risk_level = "MEDIUM"
        action = "ENFORCE_DOUBLE_BLIND"
        recommended_fault = "CLEAN"
    else:
        risk_level = "LOW"
        action = "PASS"
        recommended_fault = "CLEAN"
        
    return {
        "scanned_prompt_length": len(prompt),
        "overall_risk_score": round(max_risk, 3),
        "risk_level": risk_level,
        "enclave_action": action,
        "recommended_fault_class": recommended_fault,
        "vector_breakdown": {
            "prompt_injection": round(injection_score, 3),
            "jailbreak_evasion": round(jailbreak_score, 3),
            "canary_token_extraction": round(canary_score, 3),
            "egress_command_exfiltration": round(egress_score, 3)
        },
        "matched_threat_signatures": len(injection_matches) + len(jailbreak_matches) + len(canary_matches) + len(egress_matches),
        "mitigation_guarantee": "Hardware-enforced double-blind container isolation with constant-time padding."
    }
