import os
import json
import base64
import hashlib
from typing import Dict, Any, Tuple
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization


def canonical_json(data: Any) -> str:
    """
    Produce RFC 8785 compliant canonical JSON for deterministic Merkle hashing.
    Keys are strictly sorted with zero extraneous whitespace.
    """
    return json.dumps(data, sort_keys=True, separators=(',', ':'), ensure_ascii=True)


def sha256_hex(content: str) -> str:
    """Compute standard SHA-256 hexadecimal digest from string."""
    return hashlib.sha256(content.encode('utf-8')).hexdigest()


def generate_or_load_keys(key_dir: str = "data/keys") -> Tuple[ed25519.Ed25519PrivateKey, ed25519.Ed25519PublicKey, str]:
    """
    Load or deterministically initialize enclave Ed25519 keypair and public key fingerprint.
    """
    os.makedirs(key_dir, exist_ok=True)
    priv_path = os.path.join(key_dir, "private_key.pem")
    pub_path = os.path.join(key_dir, "public_key.pem")

    if os.path.exists(priv_path) and os.path.exists(pub_path):
        with open(priv_path, "rb") as f:
            private_key = serialization.load_pem_private_key(f.read(), password=None)
        with open(pub_path, "rb") as f:
            public_key = serialization.load_pem_public_key(f.read())
    else:
        private_key = ed25519.Ed25519PrivateKey.generate()
        public_key = private_key.public_key()

        priv_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        pub_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )

        with open(priv_path, "wb") as f:
            f.write(priv_pem)
        with open(pub_path, "wb") as f:
            f.write(pub_pem)

    pub_raw = public_key.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw
    )
    fingerprint = hashlib.sha256(pub_raw).hexdigest()[:16].upper()
    formatted_fingerprint = f"ED25519:{':'.join(fingerprint[i:i+2] for i in range(0, len(fingerprint), 2))}"

    return private_key, public_key, formatted_fingerprint


def encrypt_payload_aes_gcm(plaintext: str, run_id: str, custom_key: bytes = None) -> Dict[str, str]:
    """
    Encrypt active test prompt using AES-256-GCM.
    run_id is injected as Additional Authenticated Data (AAD) to prevent ciphertext transplant attacks.
    """
    key = custom_key if custom_key is not None else AESGCM.generate_key(bit_length=256)
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    aad = run_id.encode('utf-8')

    ciphertext_with_tag = aesgcm.encrypt(nonce, plaintext.encode('utf-8'), aad)

    return {
        "ciphertext": base64.b64encode(ciphertext_with_tag).decode('utf-8'),
        "nonce": base64.b64encode(nonce).decode('utf-8'),
        "key_b64": base64.b64encode(key).decode('utf-8'),
        "aad": run_id
    }


def decrypt_payload_aes_gcm(ciphertext_b64: str, nonce_b64: str, key_b64: str, run_id: str) -> str:
    """
    Decrypt test prompt payload inside the volatile RAM of the Trusted Mediator.
    Validates AAD matching the expected run_id.
    """
    key = base64.b64decode(key_b64)
    nonce = base64.b64decode(nonce_b64)
    ciphertext_with_tag = base64.b64decode(ciphertext_b64)
    aad = run_id.encode('utf-8')

    aesgcm = AESGCM(key)
    plaintext_bytes = aesgcm.decrypt(nonce, ciphertext_with_tag, aad)
    return plaintext_bytes.decode('utf-8')


def build_four_leaf_merkle_receipt(
    config_manifest: Dict[str, Any],
    checks_record: Dict[str, Any],
    result_record: Dict[str, Any],
    status_record: Dict[str, Any],
    private_key: ed25519.Ed25519PrivateKey
) -> Dict[str, Any]:
    """
    Compute deterministic 4-Leaf Merkle Tree and produce Ed25519 signed receipt.
    Leaf 1 (Config): SHA256('leaf:config:' + canonical_json(config_manifest))
    Leaf 2 (Checks): SHA256('leaf:checks:' + canonical_json(checks_record))
    Leaf 3 (Result): SHA256('leaf:result:' + canonical_json(result_record))
    Leaf 4 (Status): SHA256('leaf:status:' + canonical_json(status_record))
    Branch A: SHA256('branch:A:' + leaf_01 + ':' + leaf_02)
    Branch B: SHA256('branch:B:' + leaf_03 + ':' + leaf_04)
    Merkle Root: SHA256('root:' + branch_a + ':' + branch_b)
    Signature: Base64(Ed25519_Sign(private_key, merkle_root))
    """
    leaf_01_config = sha256_hex("leaf:config:" + canonical_json(config_manifest))
    leaf_02_checks = sha256_hex("leaf:checks:" + canonical_json(checks_record))
    leaf_03_result = sha256_hex("leaf:result:" + canonical_json(result_record))
    leaf_04_status = sha256_hex("leaf:status:" + canonical_json(status_record))

    branch_a = sha256_hex(f"branch:A:{leaf_01_config}:{leaf_02_checks}")
    branch_b = sha256_hex(f"branch:B:{leaf_03_result}:{leaf_04_status}")

    merkle_root = sha256_hex(f"root:{branch_a}:{branch_b}")

    sig_bytes = private_key.sign(merkle_root.encode('utf-8'))
    ed25519_signature = base64.b64encode(sig_bytes).decode('utf-8')

    return {
        "leaves": {
            "leaf_01_config": leaf_01_config,
            "leaf_02_checks": leaf_02_checks,
            "leaf_03_result": leaf_03_result,
            "leaf_04_status": leaf_04_status,
        },
        "branches": {
            "branch_a": branch_a,
            "branch_b": branch_b,
        },
        "merkle_root": merkle_root,
        "ed25519_signature": ed25519_signature,
        "raw_records": {
            "config": config_manifest,
            "checks": checks_record,
            "result": result_record,
            "status": status_record
        }
    }


def verify_merkle_receipt(
    receipt: Dict[str, Any],
    public_key: ed25519.Ed25519PublicKey
) -> Dict[str, Any]:
    """
    Independently recompute all leaves, branches, root, and cryptographic signature.
    Pinpoints exact leaf or branch corruption if tampering occurred.
    """
    records = receipt.get("raw_records", {})
    stored_leaves = receipt.get("leaves", {})
    stored_branches = receipt.get("branches", {})
    stored_root = receipt.get("merkle_root", "")
    stored_sig = receipt.get("ed25519_signature", "")

    calc_leaf_01 = sha256_hex("leaf:config:" + canonical_json(records.get("config", {})))
    calc_leaf_02 = sha256_hex("leaf:checks:" + canonical_json(records.get("checks", {})))
    calc_leaf_03 = sha256_hex("leaf:result:" + canonical_json(records.get("result", {})))
    calc_leaf_04 = sha256_hex("leaf:status:" + canonical_json(records.get("status", {})))

    leaf_01_valid = (calc_leaf_01 == stored_leaves.get("leaf_01_config"))
    leaf_02_valid = (calc_leaf_02 == stored_leaves.get("leaf_02_checks"))
    leaf_03_valid = (calc_leaf_03 == stored_leaves.get("leaf_03_result"))
    leaf_04_valid = (calc_leaf_04 == stored_leaves.get("leaf_04_status"))

    calc_branch_a = sha256_hex(f"branch:A:{calc_leaf_01}:{calc_leaf_02}")
    calc_branch_b = sha256_hex(f"branch:B:{calc_leaf_03}:{calc_leaf_04}")

    branch_a_valid = (calc_branch_a == stored_branches.get("branch_a"))
    branch_b_valid = (calc_branch_b == stored_branches.get("branch_b"))

    calc_root = sha256_hex(f"root:{calc_branch_a}:{calc_branch_b}")
    root_match = (calc_root == stored_root)

    sig_valid = False
    try:
        sig_bytes = base64.b64decode(stored_sig)
        public_key.verify(sig_bytes, stored_root.encode('utf-8'))
        sig_valid = True
    except Exception:
        sig_valid = False

    all_valid = (
        leaf_01_valid and leaf_02_valid and leaf_03_valid and leaf_04_valid and
        branch_a_valid and branch_b_valid and root_match and sig_valid
    )

    return {
        "valid": all_valid,
        "root_match": root_match,
        "sig_valid": sig_valid,
        "leaves": {
            "leaf_01_valid": leaf_01_valid,
            "leaf_02_valid": leaf_02_valid,
            "leaf_03_valid": leaf_03_valid,
            "leaf_04_valid": leaf_04_valid,
            "recomputed": {
                "leaf_01": calc_leaf_01,
                "leaf_02": calc_leaf_02,
                "leaf_03": calc_leaf_03,
                "leaf_04": calc_leaf_04
            }
        },
        "branches": {
            "branch_a_valid": branch_a_valid,
            "branch_b_valid": branch_b_valid,
            "recomputed": {
                "branch_a": calc_branch_a,
                "branch_b": calc_branch_b
            }
        },
        "recomputed_root": calc_root
    }
