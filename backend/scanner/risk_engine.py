def calculate_risk_score(findings: list) -> dict:
    if not findings:
        return {"score": 100, "level": "SAFE", "quantum_exposure": 0}
    
    severity_weights = {"CRITICAL": 30, "HIGH": 20, "MEDIUM": 10, "LOW": 5}
    total_deduction = sum(severity_weights.get(f["severity"], 0) for f in findings)
    score = max(0, 100 - total_deduction)
    
    critical_count = sum(1 for f in findings if f["severity"] == "CRITICAL")
    high_count = sum(1 for f in findings if f["severity"] == "HIGH")
    
    if score < 30 or critical_count >= 2:
        level = "CRITICAL"
    elif score < 50 or critical_count >= 1:
        level = "HIGH"
    elif score < 70 or high_count >= 2:
        level = "MEDIUM"
    else:
        level = "LOW"
    
    quantum_vulnerable = sum(1 for f in findings if f["algorithm"] in ["RSA", "ECC", "DH"])
    quantum_exposure = min(100, quantum_vulnerable * 25)
    
    return {
        "score": score,
        "level": level,
        "quantum_exposure": quantum_exposure,
        "total_findings": len(findings),
        "critical_count": critical_count,
        "high_count": high_count,
        "summary": f"{len(findings)} vulnerabilities found. Quantum exposure: {quantum_exposure}%"
    }
