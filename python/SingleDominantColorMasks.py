from colorsys import rgb_to_hsv
import argparse
import sys
from collections import Counter
from datasets import load_dataset
from huggingface_hub import hf_hub_download
from huggingface_hub.errors import RemoteEntryNotFoundError
from PIL import Image
from pathlib import Path
parser = argparse.ArgumentParser(description="Single dominant color analysis with weapon masks")
parser.add_argument(
    "--preview",
    type=int,
    default=0,
    help="Process only the first N eligible skins for a quick preview. 0 means full run.",
)
args = parser.parse_args()
dataset = load_dataset("While402/CounterStrike2Skins", split="metadata")
outputFile = open("single_dominant_color_masks.txt", "w", encoding="utf-8")
masks_dir = Path(__file__).resolve().parent.parent / "skins" / "masks"


def weapon_to_mask_filename(weapon_name: str) -> str:
    return weapon_name.lower().replace(" ", "_").replace("-", "_") + ".jpg"


processed_count = 0
missing_mask_count = 0
missing_mask_list = []
for item in dataset:
    if item["exterior"] == "Factory New" and "StatTrak" not in item["name"]:
        if args.preview and processed_count >= args.preview:
            print(f"Preview limit reached: processed {processed_count} skins.")
            break
            imagePath = hf_hub_download(
                repo_id="While402/CounterStrike2Skins",
                filename=f"images/{item['imageid']}.png",
                repo_type="dataset",
            )
            image = Image.open(imagePath).convert("RGBA")
            x, y = image.size
            mask_filename = weapon_to_mask_filename(item["weapon"])
            mask_path = masks_dir / mask_filename
            if not mask_path.exists():
                print(f"Missing mask for {item['weapon']} ({mask_filename}) - skin: {item['name']}. Aborting analysis.")
                missing_mask_count += 1
                missing_mask_list.append((item['name'], mask_filename))
                outputFile.close()
                print(f"Skins skipped because mask was missing: {missing_mask_count}")
                if missing_mask_list:
                    print("List of skipped skins and expected masks:")
                    for name, mfile in missing_mask_list:
                        print(f" - {name} -> {mfile}")
                sys.exit(1)
            mask = Image.open(mask_path).convert("L")
            if mask.size != image.size:
                mask = mask.resize(image.size, Image.NEAREST)
            excluded = {
                (0, 0, 0), (1, 1, 1), (2, 2, 2),
                (253, 253, 253), (254, 254, 254), (255, 255, 255),
            }
            freq = Counter()
            for j in range(x):
                for k in range(y):
                    mask_value = mask.getpixel((j, k))
                    if mask_value < 250:
                        continue

                    r, g, b, a = image.getpixel((j, k))
                    color = (r, g, b)
                    if a > 0 and color not in excluded:
                        freq[color] += 1

            if freq:
            if freq:
                dominantColor, _ = freq.most_common(1)[0]
            else:
                dominantColor = (0, 0, 0)
            color_preview = (
                "\033[48;2;255;255;255m "
                f"\033[48;2;{dominantColor[0]};{dominantColor[1]};{dominantColor[2]}m        "
                "\033[48;2;255;255;255m "
                "\033[0m"
            )
            print(f"Dominant color for {item['name']} is: {dominantColor} {color_preview}\n")
            r, g, b = dominantColor
            h, s, v = rgb_to_hsv(r, g, b)
            outputFile.write(f"{item['name']}|{item['rarity']}|{item['imageid']}|{item['weapon']}|{h:.2f}|{s:.2f}|{v:.2f}\n")
            processed_count += 1

        except RemoteEntryNotFoundError:
            print(f"Skipped: Image not found for {item['name']}")
            continue

outputFile.close()
print(f"Processed skins: {processed_count}")
if missing_mask_count:
    print(f"Skins skipped because mask was missing: {missing_mask_count}")
    print("List of skipped skins and expected masks:")
    for name, mfile in missing_mask_list:
        print(f" - {name} -> {mfile}")
