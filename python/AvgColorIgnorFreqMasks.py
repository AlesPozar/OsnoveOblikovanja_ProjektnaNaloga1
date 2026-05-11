from colorsys import rgb_to_hsv
import argparse
from datasets import load_dataset
from huggingface_hub import hf_hub_download
from huggingface_hub.errors import RemoteEntryNotFoundError
from PIL import Image
from pathlib import Path
import sys

# CLI argument parsing: allows a fast preview run without processing the whole dataset.
parser = argparse.ArgumentParser(description="Average color analysis with weapon masks")
parser.add_argument(
    "--preview",
    type=int,
    default=0,
    help="Process only the first N eligible skins for a quick preview. 0 means full run.",
)
args = parser.parse_args()

# Load the Counter-Strike skin metadata from Hugging Face.
dataset = load_dataset("While402/CounterStrike2Skins", split="metadata")

# Open the output file in the required pipe-separated format.
outputFile = open("average_colors_masks.txt", "w", encoding="utf-8")

# Folder that contains the weapon-specific black/white mask images.
masks_dir = Path(__file__).resolve().parent.parent / "skins" / "masks"


# Convert a weapon name like "AK-47" into a mask filename like "ak_47.jpg".
def weapon_to_mask_filename(weapon_name: str) -> str:
    return weapon_name.lower().replace(" ", "_").replace("-", "_") + ".jpg"


# Counts how many skins were processed so preview mode can stop early.
processed_count = 0

# Counts how many skins were skipped because no mask file was found.
missing_mask_count = 0
# List of skipped skins (name and expected mask filename) for detailed logging.
missing_mask_list = []


# Main analysis loop: process only Factory New skins and skip StatTrak variants.
for item in dataset:
    if item["exterior"] == "Factory New" and "StatTrak" not in item["name"]:
        # In preview mode, stop after N processed skins.
        if args.preview and processed_count >= args.preview:
            print(f"Preview limit reached: processed {processed_count} skins.")
            break

        print("Weapon found\n")

        try:
            # Download the sprite image for the current skin.
            imagePath = hf_hub_download(
                repo_id="While402/CounterStrike2Skins",
                filename=f"images/{item['imageid']}.png",
                repo_type="dataset",
            )
            # Load the image as RGBA so alpha can be checked.
            image = Image.open(imagePath).convert("RGBA")
            x, y = image.size

            # Pick the correct mask for the current weapon.
            mask_filename = weapon_to_mask_filename(item["weapon"])
            mask_path = masks_dir / mask_filename
            if not mask_path.exists():
                # Immediately abort the analysis when a required mask is missing.
                print(f"Missing mask for {item['weapon']} ({mask_filename}) - skin: {item['name']}. Aborting analysis.")
                missing_mask_count += 1
                missing_mask_list.append((item['name'], mask_filename))
                # Ensure output file is flushed/closed before exiting.
                outputFile.close()
                # Print summary of missing masks encountered so far.
                print(f"Skins skipped because mask was missing: {missing_mask_count}")
                if missing_mask_list:
                    print("List of skipped skins and expected masks:")
                    for name, mfile in missing_mask_list:
                        print(f" - {name} -> {mfile}")
                sys.exit(1)

            # Tell the user which mask is being used for this skin.
            print(f"Using mask: {mask_filename}")

            # Load the mask as grayscale; white pixels mean "analyze this area".
            mask = Image.open(mask_path).convert("L")
            if mask.size != image.size:
                # Resize the mask if needed so it matches the sprite dimensions.
                mask = mask.resize(image.size, Image.NEAREST)

            # Track unique colors only once, because this analysis ignores frequency.
            seen_colors = set()

            # Ignore almost-black and almost-white pixels from the sprite itself.
            excluded = {
                (0, 0, 0), (1, 1, 1), (2, 2, 2),
                (253, 253, 253), (254, 254, 254), (255, 255, 255),
            }

            # These accumulate the average RGB values.
            avg_r = 0
            avg_g = 0
            avg_b = 0
            num_of_dif_colors = 0

            # Walk through every pixel in the image.
            for j in range(x):
                for k in range(y):
                    # Ignore pixels where the mask is black.
                    mask_value = mask.getpixel((j, k))
                    if mask_value < 250:
                        continue

                    # Read the original sprite pixel.
                    r, g, b, a = image.getpixel((j, k))
                    color = (r, g, b)

                    # Use only visible, non-excluded, unique colors inside the white mask area.
                    if a > 0 and color not in excluded and color not in seen_colors:
                        seen_colors.add(color)
                        avg_r += r
                        avg_g += g
                        avg_b += b
                        num_of_dif_colors += 1

            # Convert summed RGB values into the final average color.
            if num_of_dif_colors > 0:
                avg_r //= num_of_dif_colors
                avg_g //= num_of_dif_colors
                avg_b //= num_of_dif_colors

            # Build a small ANSI color preview for the terminal.
            color_preview = (
                "\033[48;2;255;255;255m "
                f"\033[48;2;{avg_r};{avg_g};{avg_b}m        "
                "\033[48;2;255;255;255m "
                "\033[0m"
            )
            print(f"Average color for {item['name']} is: ({avg_r}, {avg_g}, {avg_b}) {color_preview}\n")

            # Convert RGB to HSV so the frontend can use hue, saturation, and value.
            h, s, v = rgb_to_hsv(avg_r, avg_g, avg_b)

            # Write one line per skin in the same pipe-separated format as the other datasets.
            outputFile.write(
                f"{item['name']}|{item['rarity']}|{item['imageid']}|{item['weapon']}|{h:.2f}|{s:.2f}|{v:.2f}\n"
            )
            processed_count += 1

        # Skip items whose sprite image is missing from the dataset.
        except RemoteEntryNotFoundError:
            print(f"Skipped: Image not found for {item['name']}")
            continue

# Close the output file after the full dataset scan ends.
outputFile.close()

# Print a final summary for missing masks.
print(f"Skins skipped because mask was missing: {missing_mask_count}")
if missing_mask_list:
    print("List of skipped skins and expected masks:")
    for name, mfile in missing_mask_list:
        print(f" - {name} -> {mfile}")
