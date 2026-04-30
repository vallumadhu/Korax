import subprocess
import tempfile
import os

def run_code(code: str, test_input: str):
    try:
        # Create temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as tmp:
            tmp.write(code.encode())
            tmp_path = tmp.name

        # Run subprocess
        result = subprocess.run(
            ["python", tmp_path],
            input=test_input,
            text=True,
            capture_output=True,
            timeout=3  # prevent infinite loops
        )

        os.remove(tmp_path)

        return {
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip(),
            "success": result.returncode == 0
        }

    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "Execution timed out",
            "success": False
        }