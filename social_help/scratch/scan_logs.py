import os

log_path = "c:/Users/deves/OneDrive/Desktop/sicial_help/social_help/github_deploy_logs_5.log"
if not os.path.exists(log_path):
    print("Log file not found at", log_path)
else:
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    
    print(f"Total lines in log: {len(lines)}")
    print("=== Matches for 'polar' ===")
    matches = 0
    for i, line in enumerate(lines):
        if 'polar' in line.lower() or 'webhook' in line.lower():
            # Print the line and the surrounding context lines if possible
            start = max(0, i - 2)
            end = min(len(lines), i + 3)
            print(f"\n--- Match at line {i+1} ---")
            for j in range(start, end):
                prefix = "=> " if j == i else "   "
                print(f"{prefix}{j+1}: {lines[j].strip()}")
            matches += 1
            if matches >= 50:
                print("... Truncated after 50 matches ...")
                break
    print(f"\nFound {matches} matches.")
