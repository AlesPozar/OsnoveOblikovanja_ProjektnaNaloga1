from colorsys import rgb_to_hsv
import argparse
import sys
from datasets import load_dataset
from huggingface_hub import hf_hub_download
from huggingface_hub.errors import RemoteEntryNotFoundError
from PIL import Image
from pathlib import Path
parser = argparse.ArgumentParser(description="Weighted average color analysis with weapon masks")
parser.add_argument(
    "--preview",
    type=int,
    default=0,
    help="Process only the first N eligible skins for a quick preview. 0 means full run.",
)
args = parser.parse_args()
dataset = load_dataset("While402/CounterStrike2Skins", split="metadata")
outputFile = open("weighted_average_colors_masks.txt", "w", encoding="utf-8")
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
        try:
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
            print(f"Using mask: {mask_filename}")
            mask = Image.open(mask_path).convert("L")
            if mask.size != image.size:
                mask = mask.resize(image.size, Image.NEAREST)
            excluded = {
                (0, 0, 0), (1, 1, 1), (2, 2, 2),
                (253, 253, 253), (254, 254, 254), (255, 255, 255),
            }
            sum_r = 0
            sum_g = 0
            sum_b = 0
            num_of_pixels = 0
            for j in range(x):
                for k in range(y):
                    mask_value = mask.getpixel((j, k))
                    if mask_value < 250:
                        continue

                    r, g, b, a = image.getpixel((j, k))
                    if a > 0 and (r, g, b) not in excluded:
                        sum_r += r
                        sum_g += g
                        sum_b += b
                        num_of_pixels += 1

            if num_of_pixels > 0:
                avg_r = sum_r // num_of_pixels
                avg_g = sum_g // num_of_pixels
                avg_b = sum_b // num_of_pixels
            else:
                avg_r = avg_g = avg_b = 0
            color_preview = (
                "\033[48;2;255;255;255m "
                f"\033[48;2;{avg_r};{avg_g};{avg_b}m        "
                "\033[48;2;255;255;255m "
                "\033[0m"
            )
            print(f"Weighted average color for {item['name']} is: ({avg_r}, {avg_g}, {avg_b}) {color_preview}")
            h, s, v = rgb_to_hsv(avg_r, avg_g, avg_b)
            outputFile.write(
                f"{item['name']}|{item['rarity']}|{item['imageid']}|{item['weapon']}|{h:.2f}|{s:.2f}|{v:.2f}\n"
            )
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
