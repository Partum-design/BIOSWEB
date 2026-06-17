from pathlib import Path


ASSETS = [
    "lab-hero.webp",
    "lab-services.webp",
    "lab-women.webp",
    "lab-operations.webp",
]


def main() -> None:
    asset_dir = Path("assets/img")
    missing = [name for name in ASSETS if not (asset_dir / name).exists()]

    if missing:
        print("Missing generated assets:")
        for name in missing:
            print(f"- {asset_dir / name}")
        raise SystemExit(1)

    print("Generated laboratory assets are ready.")


if __name__ == "__main__":
    main()
