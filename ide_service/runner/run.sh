#!/usr/bin/env bash
set -euo pipefail

LANG="${LANG:-}"
SRC="${SRC:-}"
TIMEOUT_SEC="${TIMEOUT_SEC:-2}"

cd /work
echo "[debug] SRC=$SRC LANG=$LANG" >&2
ls -la /work >&2


if [[ -z "$LANG" || -z "$SRC" ]]; then
  echo "Error: LANG and SRC environment variables must be set." >&2
  exit 1
fi

COMPILER_ERR="/tmp/compiler.err"
PROG="/tmp/prog"
JAVA_OUT="/tmp/java_out"

compile_cpp() {
  g++ -O2 -std=c++17 -pipe "/work/$SRC" -o "$PROG" 1>/dev/null 2>"$COMPILER_ERR"
  chmod +x "$PROG"
}

compile_java() {
  rm -rf "$JAVA_OUT"
  mkdir -p "$JAVA_OUT"
  javac -d "$JAVA_OUT" "/work/$SRC" 1>/dev/null 2>"$COMPILER_ERR"
}

case "$LANG" in
  cpp)    compile_cpp  || { cat "$COMPILER_ERR" >&2; exit 10; } ;;
  java)   compile_java || { cat "$COMPILER_ERR" >&2; exit 10; } ;;
  python) ;; # no compile
  *)
    echo "Error: Unsupported language '$LANG'." >&2
    exit 50
    ;;
esac

set +e
/usr/bin/time -v -o /tmp/time.txt \
  timeout "${TIMEOUT_SEC}" \
  bash -lc "
    exec <&0
    case \"$LANG\" in
      cpp)    \"$PROG\" ;;
      java)   java -Xmx192m -cp \"$JAVA_OUT\" Main ;;
      python) python3 \"/work/$SRC\" ;;
    esac
  " 2>/tmp/runtime.err

CODE=$?
set -e

[[ -f /tmp/time.txt ]] && cat /tmp/time.txt >&2

if [[ $CODE -eq 124 ]]; then
  echo "Error: Time limit exceeded." >&2
  exit 20
elif [[ $CODE -ne 0 ]]; then
  cat /tmp/runtime.err >&2
  exit 30
fi

exit 0
